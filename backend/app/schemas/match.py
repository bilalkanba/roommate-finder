"""
Schémas pour le système de matching.

Un match est un résultat de l'algorithme qui compare deux profils.
Format de réponse pensé pour le frontend :
- score global (pour afficher un cercle/jauge)
- breakdown par dimension (pour la visualisation détaillée)
- explication IA (pour le "wow effect" UX)
- profil du match (pour afficher sa carte)
"""

from pydantic import BaseModel, Field

from app.schemas.profile import ProfileResponse


class DimensionScore(BaseModel):
    """Score détaillé pour une dimension du matching."""

    dimension: str = Field(..., description="Nom de la dimension (ex: 'budget', 'cleanliness')")
    score: float = Field(..., ge=0, le=100, description="Score sur 100 pour cette dimension")
    weight: float = Field(..., ge=0, le=1, description="Poids de la dimension dans le score total")
    label: str = Field(..., description="Label user-friendly (ex: 'Budget', 'Propreté')")


class MatchResult(BaseModel):
    """Résultat d'un match entre l'utilisateur courant et un autre profil."""

    profile: ProfileResponse = Field(..., description="Profil du candidat")
    total_score: float = Field(
        ..., ge=0, le=100, description="Score global de compatibilité (0-100)"
    )
    breakdown: list[DimensionScore] = Field(
        ..., description="Détail du score par dimension"
    )
    explanation: str | None = Field(
        None, description="Explication en langage naturel générée par GPT"
    )


class MatchListResponse(BaseModel):
    """Réponse pour GET /api/v1/matches - liste paginée de matches."""

    matches: list[MatchResult]
    total: int = Field(..., description="Nombre total de matches disponibles")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=50)
