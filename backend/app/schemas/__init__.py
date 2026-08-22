"""Schémas Pydantic pour l'API (validation requêtes/réponses)."""

from app.schemas.match import DimensionScore, MatchListResponse, MatchResult
from app.schemas.profile import (
    ProfileBase,
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)
from app.schemas.message import (
    MessageCreate,
    MessageOut,
    ConversationSummary,
    ConversationList,
    MessageList,
)
__all__ = [
    "ProfileBase",
    "ProfileCreate",
    "ProfileUpdate",
    "ProfileResponse",
    "MatchResult",
    "MatchListResponse",
    "DimensionScore",
]
