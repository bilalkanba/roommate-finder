"""
Endpoints REST pour la gestion des profils.

Routes :
- POST   /profiles              → créer son profil (1x par user)
- GET    /profiles/me           → récupérer son propre profil
- PATCH  /profiles/me           → mettre à jour son profil
- GET    /profiles/by-user/{user_id} → voir le profil d'un user par son UUID Supabase Auth
- GET    /profiles/{id}         → voir le profil public d'un autre user par UUID du profil
- DELETE /profiles/me           → désactiver son profil (soft delete)

Sécurité : tous les endpoints nécessitent un JWT Supabase valide.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import TokenData, get_current_user
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer son profil",
)
def create_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """
    Crée le profil de l'utilisateur courant.

    Un user ne peut avoir qu'un seul profil. Si un profil existe déjà → 409.
    """
    existing = db.query(Profile).filter(Profile.user_id == UUID(user.user_id)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un profil existe déjà pour cet utilisateur",
        )

    profile = Profile(
        user_id=UUID(user.user_id),
        **payload.model_dump(),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get(
    "/me",
    response_model=ProfileResponse,
    summary="Récupérer mon profil",
)
def get_my_profile(
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """Retourne le profil de l'utilisateur courant."""
    profile = db.query(Profile).filter(Profile.user_id == UUID(user.user_id)).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé. Créez-le avec POST /profiles",
        )
    return profile


@router.patch(
    "/me",
    response_model=ProfileResponse,
    summary="Mettre à jour mon profil",
)
def update_my_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """Met à jour partiellement le profil de l'utilisateur courant."""
    profile = db.query(Profile).filter(Profile.user_id == UUID(user.user_id)).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Désactiver mon profil",
)
def deactivate_my_profile(
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """Désactive le profil (soft delete)."""
    profile = db.query(Profile).filter(Profile.user_id == UUID(user.user_id)).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé",
        )

    profile.is_active = False
    db.commit()


# ============================================================
# NOUVEAU : GET /profiles/by-user/{user_id}
# ============================================================
# Cherche un profil par user_id (UUID Supabase Auth) au lieu de par profile.id
# Utilisé par la messagerie (ConversationPage) : le param URL /messages/:userId
# est le user_id, pas le profile.id.
#
# IMPORTANT : cette route DOIT être déclarée AVANT /{profile_id} sinon
# FastAPI matche "by-user" comme un UUID et plante.
# ============================================================

@router.get(
    "/by-user/{user_id}",
    response_model=ProfileResponse,
    summary="Récupérer un profil par user_id (UUID Supabase Auth)",
)
def get_profile_by_user_id(
    user_id: UUID,
    db: Session = Depends(get_db),
    _current_user: TokenData = Depends(get_current_user),
):
    """
    Récupère un profil actif par son user_id (UUID Supabase Auth).
    Utilisé par la messagerie pour afficher l'avatar/nom de l'interlocuteur.
    """
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user_id, Profile.is_active.is_(True))
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé ou inactif",
        )
    return profile


# ============================================================
# GET /profiles/{profile_id} — doit rester APRÈS by-user/
# ============================================================

@router.get(
    "/{profile_id}",
    response_model=ProfileResponse,
    summary="Voir le profil public d'un autre utilisateur par UUID du profil",
)
def get_profile_by_id(
    profile_id: UUID,
    db: Session = Depends(get_db),
    _current_user: TokenData = Depends(get_current_user),
):
    """Retourne le profil d'un autre utilisateur (doit être actif)."""
    profile = (
        db.query(Profile)
        .filter(Profile.id == profile_id, Profile.is_active.is_(True))
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé ou inactif",
        )
    return profile