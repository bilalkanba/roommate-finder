"""
Schemas Pydantic pour les messages.
À placer dans : backend/app/schemas/message.py
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


# ============================================================
# Input (requêtes client)
# ============================================================

class MessageCreate(BaseModel):
    """Payload pour envoyer un message."""
    to_user_id: UUID
    content: str = Field(..., min_length=1, max_length=2000)


# ============================================================
# Output (réponses API)
# ============================================================

class MessageOut(BaseModel):
    """Un message complet."""
    id: UUID
    from_user_id: UUID
    to_user_id: UUID
    content: str
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    """Résumé d'une conversation dans la liste des convos."""
    other_user_id: UUID
    other_user_name: Optional[str] = None
    other_user_avatar: Optional[str] = None
    last_message: str
    last_message_at: datetime
    last_message_from_me: bool
    unread_count: int


class ConversationList(BaseModel):
    """Liste de conversations."""
    conversations: list[ConversationSummary]
    total: int


class MessageList(BaseModel):
    """Liste de messages dans une conversation."""
    messages: list[MessageOut]
    total: int