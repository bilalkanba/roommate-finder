"""
Endpoints REST pour le matching.

Routes :
- GET /matches              → liste des meilleurs matches pour le user courant
- GET /matches/{user_id}    → score détaillé avec un user spécifique
"""

from uuid import UUID
from fastapi import HTTPException

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import TokenData, get_current_user
from app.models.profile import Profile
from app.schemas.match import DimensionScore, MatchListResponse, MatchResult
from app.schemas.profile import ProfileResponse
from app.services.matching_service import MatchingService
from app.services.scoring_engine import calculate_compatibility, is_hard_incompatible
from app.services.llm_explainer import generate_explanation, generate_fallback_explanation

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get(
    "",
    response_model=MatchListResponse,
    summary="Liste des meilleurs matches",
)
async def list_matches(
    limit: int = Query(default=10, ge=1, le=50),
    min_score: float = Query(default=40.0, ge=0, le=100),
    language: str = Query(default="fr", pattern="^(fr|en)$"),
    with_explanations: bool = Query(default=True),
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """
    Retourne les meilleurs colocataires compatibles pour l'utilisateur courant.

    Paramètres :
    - **limit** : nombre max de résultats (1-50, défaut 10)
    - **min_score** : score minimum pour inclure un match (0-100)
    - **language** : langue de l'explication IA ('fr' ou 'en')
    - **with_explanations** : générer les explications IA (coûte de l'API)
    """
    # Récupérer le profil de l'user courant
    user_profile = (
        db.query(Profile).filter(Profile.user_id == UUID(user.user_id)).first()
    )
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vous devez créer votre profil avant de chercher des matches",
        )

    # Lancer le matching
    service = MatchingService(db)
    matches = await service.find_matches(
        user_profile=user_profile,
        limit=limit,
        min_score=min_score,
        language=language,
        generate_explanations=with_explanations,
    )

    return MatchListResponse(
        matches=matches,
        total=len(matches),
        page=1,
        page_size=limit,
    )


@router.get(
    "/{target_user_id}",
    response_model=MatchResult,
    summary="Score de compatibilité avec un user spécifique",
)
async def get_match_details(
    target_user_id: UUID,
    language: str = Query(default="fr", pattern="^(fr|en)$"),
    with_explanation: bool = Query(default=True),
    db: Session = Depends(get_db),
    user: TokenData = Depends(get_current_user),
):
    """
    Calcule le score détaillé entre l'utilisateur courant et un autre user.
    Utile pour la page "profil détaillé" où on veut voir la compatibilité.
    """
    user_profile = (
        db.query(Profile).filter(Profile.user_id == UUID(user.user_id)).first()
    )
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vous devez créer votre profil d'abord",
        )

    service = MatchingService(db)
    result = service.get_single_match(user_profile, target_user_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil cible non trouvé",
        )

    target_profile, total_score, breakdown = result

    # Génération de l'explication si demandée
    explanation = None
    if with_explanation:
        from app.services.llm_explainer import (
            generate_explanation,
            generate_fallback_explanation,
        )
        from app.services.scoring_engine import MatchingScore

        matching_score = MatchingScore(total_score=total_score, breakdown=breakdown)
        try:
            explanation = await generate_explanation(
                user_profile, target_profile, matching_score, language
            )
        except Exception:
            explanation = generate_fallback_explanation(matching_score, language)

    return MatchResult(
        profile=ProfileResponse.model_validate(target_profile),
        total_score=total_score,
        breakdown=[
            DimensionScore(
                dimension=d.dimension,
                score=d.score,
                weight=d.weight,
                label=d.label,
            )
            for d in breakdown
        ],
        explanation=explanation,
    )
@router.get("/details/{other_user_id}")
async def get_match_details(
    other_user_id: UUID,
    language: str = "fr",
    with_explanation: bool = True,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    my_profile = db.query(Profile).filter(
        Profile.user_id == current_user["id"]
    ).first()
    if not my_profile:
        raise HTTPException(status_code=404, detail="Your profile not found")

    other_profile = db.query(Profile).filter(
        Profile.user_id == other_user_id
    ).first()
    if not other_profile:
        raise HTTPException(status_code=404, detail="Other profile not found")

    if is_hard_incompatible(my_profile, other_profile):
        return {
            "profile": ProfileResponse.model_validate(other_profile).model_dump(mode="json"),
            "total_score": 0,
            "breakdown": [],
            "explanation": None,
            "is_compatible": False,
        }

    matching_score = calculate_compatibility(my_profile, other_profile)

    explanation = None
    if with_explanation:
        try:
            explanation = await generate_explanation(
                my_profile, other_profile, matching_score, language=language
            )
        except Exception as e:
            print(f"[LLM Error] {e}")
            explanation = generate_fallback_explanation(matching_score, language=language)

    return {
        "profile": ProfileResponse.model_validate(other_profile).model_dump(mode="json"),
        "total_score": matching_score.total_score,
        "breakdown": [
            {
                "dimension": d.dimension,
                "label": d.label,
                "score": d.score,
                "weight": d.weight,
            }
            for d in matching_score.breakdown
        ],
        "explanation": explanation,
        "is_compatible": True,
    }
@router.get("/{other_user_id}/explain")
async def get_match_explanation(
    other_user_id: UUID,
    language: str = "fr",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    my_profile = db.query(Profile).filter(
        Profile.user_id == current_user["id"]
    ).first()
    if not my_profile:
        raise HTTPException(status_code=404, detail="Your profile not found")

    other_profile = db.query(Profile).filter(
        Profile.user_id == other_user_id
    ).first()
    if not other_profile:
        raise HTTPException(status_code=404, detail="Other profile not found")

    if is_hard_incompatible(my_profile, other_profile):
        return {"explanation": None, "is_compatible": False}

    matching_score = calculate_compatibility(my_profile, other_profile)

    try:
        explanation = await generate_explanation(
            my_profile, other_profile, matching_score, language=language
        )
    except Exception as e:
        print(f"[LLM Error] {e}")
        explanation = generate_fallback_explanation(matching_score, language=language)

    return {
        "explanation": explanation,
        "is_compatible": True,
    }