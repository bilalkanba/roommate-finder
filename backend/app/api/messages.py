"""
Routes FastAPI pour la messagerie interne.
À placer dans : backend/app/api/messages.py

Endpoints livrés :
- POST   /messages                      → envoyer un message
- GET    /messages/conversations        → liste des convos
- GET    /messages/unread/count         → nombre de messages non lus (badge)
- GET    /messages/{other_user_id}      → messages d'une conversation
- PATCH  /messages/{other_user_id}/read → marquer les messages comme lus

IMPORTANT : ordre des routes = les statiques (/conversations, /unread/count)
DOIVENT être déclarées AVANT les dynamiques (/{other_user_id}) sinon
FastAPI matche "conversations" comme un UUID et plante.
"""

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, or_, func, desc
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import TokenData, get_current_user
from app.models.message import Message
from app.models.profile import Profile
from app.schemas.message import (
    MessageCreate,
    MessageOut,
    ConversationSummary,
    ConversationList,
    MessageList,
)

router = APIRouter(prefix="/messages", tags=["messages"])


# ============================================================
# POST /messages — envoyer un message
# ============================================================

@router.post(
    "",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
    summary="Envoyer un message",
)
def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """
    Envoyer un message à un autre utilisateur.

    Validations :
    - On ne peut pas s'envoyer un message à soi-même
    - Le destinataire doit exister (avoir un profil)
    - Content : 1-2000 caractères
    """
    my_id = UUID(user.user_id)

    if payload.to_user_id == my_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send message to yourself",
        )

    # Vérifie que le destinataire a un profil
    recipient = db.query(Profile).filter(Profile.user_id == payload.to_user_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found",
        )

    message = Message(
        from_user_id=my_id,
        to_user_id=payload.to_user_id,
        content=payload.content.strip(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return message


# ============================================================
# GET /messages/conversations — liste des convos
# IMPORTANT : DOIT être déclaré AVANT /{other_user_id}
# ============================================================

@router.get(
    "/conversations",
    response_model=ConversationList,
    summary="Liste des conversations",
)
def list_conversations(
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """
    Liste toutes les conversations de l'utilisateur.
    Regroupé par "autre user", trié par date du dernier message.
    """
    my_id = UUID(user.user_id)

    all_messages = db.query(Message).filter(
        or_(
            Message.from_user_id == my_id,
            Message.to_user_id == my_id,
        )
    ).order_by(desc(Message.created_at)).all()

    # Regrouper par "autre user"
    conversations_map = {}
    for msg in all_messages:
        other_id = msg.to_user_id if msg.from_user_id == my_id else msg.from_user_id
        if other_id not in conversations_map:
            conversations_map[other_id] = []
        conversations_map[other_id].append(msg)

    # Fetch profils des autres users en 1 requête
    other_user_ids = list(conversations_map.keys())
    profiles = {}
    if other_user_ids:
        profile_list = db.query(Profile).filter(Profile.user_id.in_(other_user_ids)).all()
        profiles = {p.user_id: p for p in profile_list}

    summaries = []
    for other_id, msgs in conversations_map.items():
        last_msg = msgs[0]  # déjà trié DESC
        unread_count = sum(
            1 for m in msgs
            if m.to_user_id == my_id and m.read_at is None
        )
        profile = profiles.get(other_id)

        summaries.append(ConversationSummary(
            other_user_id=other_id,
            other_user_name=profile.full_name if profile else None,
            other_user_avatar=profile.avatar_url if profile else None,
            last_message=last_msg.content,
            last_message_at=last_msg.created_at,
            last_message_from_me=(last_msg.from_user_id == my_id),
            unread_count=unread_count,
        ))

    summaries.sort(key=lambda s: s.last_message_at, reverse=True)

    return ConversationList(
        conversations=summaries,
        total=len(summaries),
    )


# ============================================================
# GET /messages/unread/count — badge notifications
# IMPORTANT : DOIT être déclaré AVANT /{other_user_id}
# ============================================================

@router.get(
    "/unread/count",
    summary="Nombre de messages non lus",
)
def get_unread_count(
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """Nombre total de messages non lus (pour le badge de la navbar)."""
    my_id = UUID(user.user_id)

    count = db.query(func.count(Message.id)).filter(
        and_(
            Message.to_user_id == my_id,
            Message.read_at.is_(None),
        )
    ).scalar() or 0

    return {"unread_count": count}


# ============================================================
# GET /messages/{other_user_id} — messages d'une conversation
# ============================================================

@router.get(
    "/{other_user_id}",
    response_model=MessageList,
    summary="Messages d'une conversation",
)
def get_conversation(
    other_user_id: UUID,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """
    Récupère les messages entre l'utilisateur courant et un autre.
    Triés du plus ancien au plus récent.
    """
    my_id = UUID(user.user_id)

    if other_user_id == my_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot get self-conversation",
        )

    messages = db.query(Message).filter(
        or_(
            and_(Message.from_user_id == my_id, Message.to_user_id == other_user_id),
            and_(Message.from_user_id == other_user_id, Message.to_user_id == my_id),
        )
    ).order_by(Message.created_at.asc()).limit(limit).all()

    return MessageList(
        messages=messages,
        total=len(messages),
    )


# ============================================================
# PATCH /messages/{other_user_id}/read — marquer comme lu
# ============================================================

@router.patch(
    "/{other_user_id}/read",
    summary="Marquer une conversation comme lue",
)
def mark_conversation_as_read(
    other_user_id: UUID,
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """Marque tous les messages reçus de other_user_id comme lus."""
    my_id = UUID(user.user_id)

    now = datetime.utcnow()

    updated = db.query(Message).filter(
        and_(
            Message.from_user_id == other_user_id,
            Message.to_user_id == my_id,
            Message.read_at.is_(None),
        )
    ).update({"read_at": now}, synchronize_session=False)

    db.commit()

    return {"marked_as_read": updated}