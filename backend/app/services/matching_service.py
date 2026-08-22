"""
Service de matching : orchestre la recherche de colocataires compatibles.

Rôle : c'est le "chef d'orchestre" qui coordonne :
1. Requête en DB pour trouver les candidats
2. Filtrage hard (incompatibilités éliminatoires)
3. Scoring de chaque candidat
4. Tri par score décroissant
5. Génération des explications (seulement pour les top N)

Pattern pro : on génère les explications seulement pour les meilleurs matches
(top 10 par ex.) pour éviter d'appeler OpenAI 100x pour rien.
"""

import asyncio
from uuid import UUID

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.schemas.match import DimensionScore, MatchResult
from app.schemas.profile import ProfileResponse
from app.services.llm_explainer import (
    generate_explanation,
    generate_fallback_explanation,
)
from app.services.scoring_engine import (
    calculate_compatibility,
    is_hard_incompatible,
)


class MatchingService:
    """Service pour trouver des colocataires compatibles."""

    def __init__(self, db: Session):
        self.db = db

    def _find_candidates(self, user_profile: Profile) -> list[Profile]:
        """
        Requête DB pour trouver les candidats potentiels.

        On pré-filtre au niveau DB (plus rapide que charger tout en mémoire) :
        - Même ville
        - Overlap de budget
        - Profil actif
        - Pas l'utilisateur lui-même
        """
        candidates = (
            self.db.query(Profile)
            .filter(
                and_(
                    Profile.id != user_profile.id,
                    Profile.is_active.is_(True),
                    Profile.target_city.ilike(user_profile.target_city),
                    Profile.budget_max_eur >= user_profile.budget_min_eur,
                    Profile.budget_min_eur <= user_profile.budget_max_eur,
                )
            )
            .all()
        )
        return candidates

    def _score_candidates(
        self, user_profile: Profile, candidates: list[Profile]
    ) -> list[tuple[Profile, float, list]]:
        """
        Score tous les candidats et les trie par score décroissant.

        Returns:
            Liste de (Profile, total_score, breakdown) triée par score desc.
        """
        scored = []
        for candidate in candidates:
            # Double-check hard incompatibilities (sécurité)
            if is_hard_incompatible(user_profile, candidate):
                continue

            result = calculate_compatibility(user_profile, candidate)
            scored.append((candidate, result.total_score, result.breakdown))

        # Tri par score décroissant
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored

    async def find_matches(
        self,
        user_profile: Profile,
        limit: int = 10,
        min_score: float = 40.0,
        language: str = "fr",
        generate_explanations: bool = True,
    ) -> list[MatchResult]:
        """
        Point d'entrée principal : retourne les meilleurs matches avec explications.

        Args:
            user_profile: Profil de l'utilisateur qui cherche
            limit: Nombre max de matches à retourner
            min_score: Score minimum pour inclure un match
            language: "fr" ou "en" pour l'explication
            generate_explanations: Si True, appelle OpenAI (coûte des $)

        Returns:
            Liste de MatchResult triée par score décroissant.
        """
        # 1. Trouver les candidats en DB
        candidates = self._find_candidates(user_profile)

        # 2. Scorer tous les candidats
        scored = self._score_candidates(user_profile, candidates)

        # 3. Filtrer par min_score et limiter
        top_matches = [s for s in scored if s[1] >= min_score][:limit]

        if not top_matches:
            return []

        # 4. Générer les explications en parallèle (gain de temps massif)
        results: list[MatchResult] = []

        if generate_explanations:
            # Préparer les objets matching_score pour l'explainer
            from app.services.scoring_engine import MatchingScore

            explanation_tasks = []
            for candidate, total_score, breakdown in top_matches:
                match_score_obj = MatchingScore(
                    total_score=total_score, breakdown=breakdown
                )
                explanation_tasks.append(
                    self._safe_generate_explanation(
                        user_profile, candidate, match_score_obj, language
                    )
                )
            explanations = await asyncio.gather(*explanation_tasks)
        else:
            explanations = [None] * len(top_matches)

        # 5. Construire les MatchResult
        for (candidate, total_score, breakdown), explanation in zip(
            top_matches, explanations
        ):
            results.append(
                MatchResult(
                    profile=ProfileResponse.model_validate(candidate),
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
            )

        return results

    async def _safe_generate_explanation(
        self, user_a, user_b, matching_score, language
    ) -> str:
        """
        Wrapper qui génère une explication avec fallback en cas d'erreur.

        Si OpenAI est down, lent, ou qu'on a dépassé le quota,
        on renvoie une explication template plutôt que de crash.
        """
        try:
            return await generate_explanation(user_a, user_b, matching_score, language)
        except Exception as e:
            # TODO: log l'erreur avec Sentry en V2
            print(f"[MatchingService] OpenAI error: {e}, using fallback")
            return generate_fallback_explanation(matching_score, language)

    def get_single_match(
        self, user_profile: Profile, target_user_id: UUID
    ) -> tuple[Profile, float, list] | None:
        """
        Score un match spécifique (utile pour la page détail d'un profil).

        Returns:
            (profile, score, breakdown) ou None si profil non trouvé.
        """
        target = (
            self.db.query(Profile)
            .filter(Profile.user_id == target_user_id, Profile.is_active.is_(True))
            .first()
        )
        if not target:
            return None

        result = calculate_compatibility(user_profile, target)
        return target, result.total_score, result.breakdown
