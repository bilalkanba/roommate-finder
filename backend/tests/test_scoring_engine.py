"""
Tests unitaires pour l'algorithme de matching.

Ces tests sont CRITIQUES pour ton CV :
- Un recruteur qui lit ton code verra que tu sais tester ton code
- Ils permettent de refactorer le scoring sans tout casser
- Ils documentent le comportement attendu

Lancement : cd backend && pytest tests/ -v
Coverage  : pytest --cov=app tests/
"""

from datetime import date, timedelta
from uuid import uuid4

import pytest

from app.models.profile import (
    Gender,
    LifestyleLevel,
    PetsPreference,
    Profile,
    SleepSchedule,
    SmokingPreference,
    SocialLevel,
)
from app.services.scoring_engine import (
    calculate_compatibility,
    is_hard_incompatible,
    score_age,
    score_budget,
    score_cleanliness,
    score_schedule,
    score_smoking_pets,
)


# ===== Helper : construction rapide d'un profil de test =====

def make_profile(**overrides) -> Profile:
    """
    Factory pour créer un profil de test avec des valeurs par défaut raisonnables.
    Permet de surcharger n'importe quel champ pour tester des cas spécifiques.
    """
    defaults = {
        "id": uuid4(),
        "user_id": uuid4(),
        "full_name": "Test User",
        "age": 25,
        "gender": Gender.MALE,
        "bio": None,
        "photo_url": None,
        "target_city": "Madrid",
        "target_country": "Spain",
        "budget_min_eur": 400,
        "budget_max_eur": 600,
        "move_in_date": date.today() + timedelta(days=30),
        "lease_duration_months": 12,
        "cleanliness": LifestyleLevel.MEDIUM,
        "sleep_schedule": SleepSchedule.NORMAL,
        "social_level": SocialLevel.BALANCED,
        "noise_tolerance": LifestyleLevel.MEDIUM,
        "smoking": SmokingPreference.NO_SMOKING,
        "pets": PetsPreference.NO_PETS,
        "guests_frequency": LifestyleLevel.MEDIUM,
        "languages_spoken": ["FR", "EN"],
        "occupation": "Student",
        "is_active": True,
    }
    defaults.update(overrides)
    return Profile(**defaults)


# ===== Tests : score_budget =====

class TestBudget:
    """Tests pour le scoring du budget."""

    def test_identical_budgets_gives_perfect_score(self):
        a = make_profile(budget_min_eur=500, budget_max_eur=500)
        b = make_profile(budget_min_eur=500, budget_max_eur=500)
        result = score_budget(a, b)
        assert result.score == 100.0

    def test_full_overlap_gives_perfect_score(self):
        a = make_profile(budget_min_eur=400, budget_max_eur=600)
        b = make_profile(budget_min_eur=400, budget_max_eur=600)
        result = score_budget(a, b)
        assert result.score == 100.0

    def test_no_overlap_gives_zero(self):
        a = make_profile(budget_min_eur=400, budget_max_eur=500)
        b = make_profile(budget_min_eur=700, budget_max_eur=900)
        result = score_budget(a, b)
        assert result.score == 0.0

    def test_partial_overlap_gives_medium_score(self):
        a = make_profile(budget_min_eur=400, budget_max_eur=600)
        b = make_profile(budget_min_eur=500, budget_max_eur=700)
        result = score_budget(a, b)
        # Overlap de 500-600 = 100€, avg range 200€ → 50%
        assert 40 < result.score < 60


# ===== Tests : score_schedule =====

class TestSchedule:
    """Tests pour le scoring des horaires de sommeil."""

    def test_two_early_birds_are_perfect(self):
        a = make_profile(sleep_schedule=SleepSchedule.EARLY_BIRD)
        b = make_profile(sleep_schedule=SleepSchedule.EARLY_BIRD)
        assert score_schedule(a, b).score == 100

    def test_early_bird_vs_night_owl_is_low(self):
        a = make_profile(sleep_schedule=SleepSchedule.EARLY_BIRD)
        b = make_profile(sleep_schedule=SleepSchedule.NIGHT_OWL)
        assert score_schedule(a, b).score == 40

    def test_schedule_is_symmetric(self):
        """Le score doit être le même dans les deux sens."""
        a = make_profile(sleep_schedule=SleepSchedule.EARLY_BIRD)
        b = make_profile(sleep_schedule=SleepSchedule.NIGHT_OWL)
        assert score_schedule(a, b).score == score_schedule(b, a).score


# ===== Tests : score_cleanliness =====

class TestCleanliness:
    """Tests pour le scoring de propreté."""

    def test_same_level_perfect(self):
        a = make_profile(cleanliness=LifestyleLevel.HIGH)
        b = make_profile(cleanliness=LifestyleLevel.HIGH)
        assert score_cleanliness(a, b).score == 100

    def test_adjacent_levels_good(self):
        a = make_profile(cleanliness=LifestyleLevel.HIGH)
        b = make_profile(cleanliness=LifestyleLevel.VERY_HIGH)
        assert score_cleanliness(a, b).score == 85

    def test_extreme_mismatch_zero(self):
        a = make_profile(cleanliness=LifestyleLevel.VERY_LOW)
        b = make_profile(cleanliness=LifestyleLevel.VERY_HIGH)
        assert score_cleanliness(a, b).score == 0


# ===== Tests : score_smoking_pets (DEALBREAKERS) =====

class TestSmokingPets:
    """Tests pour les dealbreakers fumeur/animaux."""

    def test_non_smoker_with_indoor_smoker_is_zero(self):
        """Dealbreaker : un non-fumeur ne peut pas vivre avec un fumeur indoor."""
        a = make_profile(smoking=SmokingPreference.NO_SMOKING)
        b = make_profile(smoking=SmokingPreference.INDOOR_OK)
        # Score fumeur = 0, score animaux = 100 → moyenne 50
        assert score_smoking_pets(a, b).score == 50

    def test_both_non_smoker_no_pets_perfect(self):
        a = make_profile(
            smoking=SmokingPreference.NO_SMOKING, pets=PetsPreference.NO_PETS
        )
        b = make_profile(
            smoking=SmokingPreference.NO_SMOKING, pets=PetsPreference.NO_PETS
        )
        assert score_smoking_pets(a, b).score == 100

    def test_no_pets_person_with_pet_owner(self):
        """Dealbreaker : allergique qui rencontre un propriétaire d'animal."""
        a = make_profile(pets=PetsPreference.NO_PETS)
        b = make_profile(pets=PetsPreference.HAS_PET)
        # Score animaux = 0 → moyenne (100 + 0) / 2 = 50
        assert score_smoking_pets(a, b).score == 50


# ===== Tests : score_age =====

class TestAge:
    """Tests pour le scoring de l'âge."""

    def test_same_age_perfect(self):
        a = make_profile(age=25)
        b = make_profile(age=25)
        assert score_age(a, b).score == 100

    def test_close_age_perfect(self):
        a = make_profile(age=23)
        b = make_profile(age=26)
        assert score_age(a, b).score == 100  # diff 3

    def test_big_gap_low_score(self):
        a = make_profile(age=20)
        b = make_profile(age=50)
        assert score_age(a, b).score == 20


# ===== Tests : calculate_compatibility (intégration) =====

class TestOverallCompatibility:
    """Tests d'intégration sur le score final."""

    def test_perfect_match(self):
        """Deux profils identiques → score proche de 100."""
        a = make_profile()
        b = make_profile()
        result = calculate_compatibility(a, b)
        assert result.total_score >= 95

    def test_total_score_is_0_to_100(self):
        """Le score total doit toujours être dans [0, 100]."""
        a = make_profile(
            budget_min_eur=400, budget_max_eur=500,
            cleanliness=LifestyleLevel.VERY_LOW,
            sleep_schedule=SleepSchedule.EARLY_BIRD,
            smoking=SmokingPreference.NO_SMOKING,
            age=20,
        )
        b = make_profile(
            budget_min_eur=1500, budget_max_eur=2000,
            cleanliness=LifestyleLevel.VERY_HIGH,
            sleep_schedule=SleepSchedule.NIGHT_OWL,
            smoking=SmokingPreference.INDOOR_OK,
            age=55,
        )
        result = calculate_compatibility(a, b)
        assert 0 <= result.total_score <= 100

    def test_breakdown_has_7_dimensions(self):
        a = make_profile()
        b = make_profile()
        result = calculate_compatibility(a, b)
        assert len(result.breakdown) == 7

    def test_breakdown_weights_sum_to_one(self):
        a = make_profile()
        b = make_profile()
        result = calculate_compatibility(a, b)
        total_weight = sum(d.weight for d in result.breakdown)
        assert abs(total_weight - 1.0) < 0.001


# ===== Tests : is_hard_incompatible =====

class TestHardIncompatibilities:
    """Tests des filtres éliminatoires."""

    def test_different_cities_incompatible(self):
        a = make_profile(target_city="Madrid")
        b = make_profile(target_city="Barcelona")
        assert is_hard_incompatible(a, b) is True

    def test_same_city_case_insensitive(self):
        """Les villes 'Madrid' et 'madrid' doivent matcher."""
        a = make_profile(target_city="Madrid")
        b = make_profile(target_city="madrid")
        # is_hard_incompatible compare en lowercase
        assert is_hard_incompatible(a, b) is False

    def test_no_budget_overlap_incompatible(self):
        a = make_profile(budget_min_eur=300, budget_max_eur=400)
        b = make_profile(budget_min_eur=800, budget_max_eur=1000)
        assert is_hard_incompatible(a, b) is True

    def test_far_move_in_dates_incompatible(self):
        a = make_profile(move_in_date=date.today() + timedelta(days=10))
        b = make_profile(move_in_date=date.today() + timedelta(days=100))
        # 90 jours d'écart > 60 → incompatible
        assert is_hard_incompatible(a, b) is True

    def test_compatible_profiles_pass(self):
        a = make_profile()
        b = make_profile()
        assert is_hard_incompatible(a, b) is False
