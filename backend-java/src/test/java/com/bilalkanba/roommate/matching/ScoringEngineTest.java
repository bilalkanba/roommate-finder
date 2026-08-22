package com.bilalkanba.roommate.matching;

import com.bilalkanba.roommate.model.Profile;
import com.bilalkanba.roommate.model.enums.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

/**
 * Tests unitaires du ScoringEngine.
 *
 * ORGANISATION :
 * - @Nested classes pour grouper les tests par dimension
 * - Chaque test suit le pattern AAA : Arrange, Act, Assert
 * - Utilise AssertJ pour des assertions fluides et lisibles
 *
 * OBJECTIF : valider que chaque dimension retourne les bons scores
 * pour toutes les combinaisons possibles.
 */
@DisplayName("ScoringEngine - Tests unitaires du matching")
class ScoringEngineTest {

    private ScoringEngine scoringEngine;

    @BeforeEach
    void setUp() {
        scoringEngine = new ScoringEngine();
    }

    // ============================================================
    // BUILDER HELPER : profil de reference pour ne pas dupliquer
    // ============================================================

    /**
     * Cree un profil "de base" avec des valeurs neutres.
     * Les tests overrident uniquement les champs qu'ils testent.
     */
    private Profile.ProfileBuilder baseProfile() {
        return Profile.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .fullName("Test User")
                .age(25)
                .gender(Gender.male)
                .targetCity("Paris")
                .targetCountry("France")
                .budgetMinEur(500)
                .budgetMaxEur(800)
                .moveInDate(LocalDate.of(2026, 9, 1))
                .cleanliness(LifestyleLevel.medium)
                .sleepSchedule(SleepSchedule.normal)
                .socialLevel(SocialLevel.balanced)
                .noiseTolerance(LifestyleLevel.medium)
                .smoking(SmokingPreference.no_smoking)
                .pets(PetsPreference.no_pets)
                .guestsFrequency(LifestyleLevel.medium)
                .preferredGender(PreferredGender.any)
                .housingType(HousingType.any)
                .hobbies(List.of())
                .isActive(true);
    }

    // ============================================================
    // HARD FILTERS
    // ============================================================

    @Nested
    @DisplayName("Hard Filters (elimination)")
    class HardFilters {

        @Test
        @DisplayName("Villes differentes -> incompatible")
        void differentCities_shouldBeIncompatible() {
            Profile a = baseProfile().targetCity("Paris").build();
            Profile b = baseProfile().targetCity("Lyon").build();

            assertThat(scoringEngine.isHardIncompatible(a, b)).isTrue();
        }

        @Test
        @DisplayName("Meme ville insensible a la casse -> compatible")
        void sameCityDifferentCase_shouldBeCompatible() {
            Profile a = baseProfile().targetCity("Paris").build();
            Profile b = baseProfile().targetCity("PARIS").build();

            assertThat(scoringEngine.isHardIncompatible(a, b)).isFalse();
        }

        @Test
        @DisplayName("Budgets qui ne se chevauchent pas -> incompatible")
        void nonOverlappingBudgets_shouldBeIncompatible() {
            Profile a = baseProfile().budgetMinEur(300).budgetMaxEur(500).build();
            Profile b = baseProfile().budgetMinEur(800).budgetMaxEur(1200).build();

            assertThat(scoringEngine.isHardIncompatible(a, b)).isTrue();
        }

        @Test
        @DisplayName("Dates d'emmenagement > 60 jours d'ecart -> incompatible")
        void moveInDatesTooFarApart_shouldBeIncompatible() {
            Profile a = baseProfile().moveInDate(LocalDate.of(2026, 1, 1)).build();
            Profile b = baseProfile().moveInDate(LocalDate.of(2026, 6, 1)).build();

            assertThat(scoringEngine.isHardIncompatible(a, b)).isTrue();
        }

        @Test
        @DisplayName("Genre prefere incompatible (A veut female, B est male) -> incompatible")
        void wrongPreferredGender_shouldBeIncompatible() {
            Profile a = baseProfile().preferredGender(PreferredGender.female).gender(Gender.male).build();
            Profile b = baseProfile().preferredGender(PreferredGender.any).gender(Gender.male).build();

            assertThat(scoringEngine.isHardIncompatible(a, b)).isTrue();
        }

        @Test
        @DisplayName("Age hors tranche preferee -> incompatible")
        void ageOutOfPreferredRange_shouldBeIncompatible() {
            Profile a = baseProfile().preferredAgeMin(20).preferredAgeMax(25).build();
            Profile b = baseProfile().age(35).build();

            assertThat(scoringEngine.isHardIncompatible(a, b)).isTrue();
        }

        @Test
        @DisplayName("Housing types differents et specifiques -> incompatible")
        void differentSpecificHousingTypes_shouldBeIncompatible() {
            Profile a = baseProfile().housingType(HousingType.studio).build();
            Profile b = baseProfile().housingType(HousingType.entire_apartment).build();

            assertThat(scoringEngine.isHardIncompatible(a, b)).isTrue();
        }

        @Test
        @DisplayName("Profils identiques compatibles -> pas de hard filter")
        void identicalCompatibleProfiles_shouldPassHardFilters() {
            Profile a = baseProfile().build();
            Profile b = baseProfile().build();

            assertThat(scoringEngine.isHardIncompatible(a, b)).isFalse();
        }
    }

    // ============================================================
    // DIMENSION BUDGET
    // ============================================================

    @Nested
    @DisplayName("Score Budget (20%)")
    class Budget {

        @Test
        @DisplayName("Budgets identiques -> score 100")
        void identicalBudgets_shouldScore100() {
            Profile a = baseProfile().budgetMinEur(500).budgetMaxEur(800).build();
            Profile b = baseProfile().budgetMinEur(500).budgetMaxEur(800).build();

            double score = scoringEngine.calculateCompatibility(a, b).breakdown().stream()
                    .filter(d -> d.dimension().equals("budget"))
                    .findFirst().orElseThrow().score();

            assertThat(score).isEqualTo(100.0);
        }

        @Test
        @DisplayName("Budgets qui se chevauchent partiellement")
        void partialOverlap_shouldScoreProportionally() {
            Profile a = baseProfile().budgetMinEur(500).budgetMaxEur(800).build();
            Profile b = baseProfile().budgetMinEur(700).budgetMaxEur(1000).build();
            // overlap = 700-800 = 100, avg range = (300 + 300) / 2 = 300
            // score = 100/300 * 100 = 33.3

            double score = scoringEngine.calculateCompatibility(a, b).breakdown().stream()
                    .filter(d -> d.dimension().equals("budget"))
                    .findFirst().orElseThrow().score();

            assertThat(score).isCloseTo(33.3, within(1.0));
        }
    }

    // ============================================================
    // DIMENSION SCHEDULE (sommeil)
    // ============================================================

    @Nested
    @DisplayName("Score Schedule (15%)")
    class Schedule {

        @Test
        @DisplayName("Meme rythme (early bird + early bird) -> 100")
        void sameEarlyBird_shouldScore100() {
            Profile a = baseProfile().sleepSchedule(SleepSchedule.early_bird).build();
            Profile b = baseProfile().sleepSchedule(SleepSchedule.early_bird).build();

            double score = getDimensionScore(a, b, "schedule");
            assertThat(score).isEqualTo(100.0);
        }

        @Test
        @DisplayName("Early bird + Night owl -> 40 (mauvais match)")
        void earlyBirdVsNightOwl_shouldScoreLow() {
            Profile a = baseProfile().sleepSchedule(SleepSchedule.early_bird).build();
            Profile b = baseProfile().sleepSchedule(SleepSchedule.night_owl).build();

            double score = getDimensionScore(a, b, "schedule");
            assertThat(score).isEqualTo(40.0);
        }

        @Test
        @DisplayName("Symetrie : night_owl vs early_bird == early_bird vs night_owl")
        void scheduleShouldBeSymmetric() {
            Profile a = baseProfile().sleepSchedule(SleepSchedule.early_bird).build();
            Profile b = baseProfile().sleepSchedule(SleepSchedule.night_owl).build();
            Profile c = baseProfile().sleepSchedule(SleepSchedule.night_owl).build();
            Profile d = baseProfile().sleepSchedule(SleepSchedule.early_bird).build();

            double scoreAB = getDimensionScore(a, b, "schedule");
            double scoreCD = getDimensionScore(c, d, "schedule");

            assertThat(scoreAB).isEqualTo(scoreCD);
        }
    }

    // ============================================================
    // DIMENSION CLEANLINESS
    // ============================================================

    @Nested
    @DisplayName("Score Cleanliness (12%)")
    class Cleanliness {

        @Test
        @DisplayName("Meme niveau -> 100")
        void sameLevel_shouldScore100() {
            Profile a = baseProfile().cleanliness(LifestyleLevel.high).build();
            Profile b = baseProfile().cleanliness(LifestyleLevel.high).build();

            assertThat(getDimensionScore(a, b, "cleanliness")).isEqualTo(100.0);
        }

        @Test
        @DisplayName("Diff de 1 -> 85")
        void diff1_shouldScore85() {
            Profile a = baseProfile().cleanliness(LifestyleLevel.medium).build();
            Profile b = baseProfile().cleanliness(LifestyleLevel.high).build();

            assertThat(getDimensionScore(a, b, "cleanliness")).isEqualTo(85.0);
        }

        @Test
        @DisplayName("Diff extreme (very_low vs very_high) -> 0")
        void extremeDiff_shouldScore0() {
            Profile a = baseProfile().cleanliness(LifestyleLevel.very_low).build();
            Profile b = baseProfile().cleanliness(LifestyleLevel.very_high).build();

            assertThat(getDimensionScore(a, b, "cleanliness")).isEqualTo(0.0);
        }
    }

    // ============================================================
    // DIMENSION SOCIAL
    // ============================================================

    @Nested
    @DisplayName("Score Social (12%)")
    class Social {

        @Test
        @DisplayName("Meme niveau balanced -> 100")
        void sameBalanced_shouldScore100() {
            Profile a = baseProfile().socialLevel(SocialLevel.balanced).build();
            Profile b = baseProfile().socialLevel(SocialLevel.balanced).build();

            assertThat(getDimensionScore(a, b, "social")).isEqualTo(100.0);
        }

        @Test
        @DisplayName("Very private + Very social -> 30 (incompatible)")
        void veryPrivateVsVerySocial_shouldScore30() {
            Profile a = baseProfile().socialLevel(SocialLevel.very_private).build();
            Profile b = baseProfile().socialLevel(SocialLevel.very_social).build();

            assertThat(getDimensionScore(a, b, "social")).isEqualTo(30.0);
        }
    }

    // ============================================================
    // DIMENSION SMOKING & PETS
    // ============================================================

    @Nested
    @DisplayName("Score Smoking & Pets (10%)")
    class SmokingPets {

        @Test
        @DisplayName("Non-fumeur + fumeur indoor -> 0 (fatal)")
        void nonSmokerVsIndoorSmoker_shouldScoreLow() {
            Profile a = baseProfile()
                    .smoking(SmokingPreference.no_smoking)
                    .pets(PetsPreference.no_pets)
                    .build();
            Profile b = baseProfile()
                    .smoking(SmokingPreference.indoor_ok)
                    .pets(PetsPreference.no_pets)
                    .build();
            // smoke = 0, pets = 100 -> avg = 50

            double score = getDimensionScore(a, b, "smoking_pets");
            assertThat(score).isEqualTo(50.0);
        }

        @Test
        @DisplayName("No pets + Has pet -> 0 (fatal)")
        void noPetsVsHasPet_shouldScoreLow() {
            Profile a = baseProfile().pets(PetsPreference.no_pets).build();
            Profile b = baseProfile().pets(PetsPreference.has_pet).build();
            // smoke = 100, pets = 0 -> avg = 50

            double score = getDimensionScore(a, b, "smoking_pets");
            assertThat(score).isEqualTo(50.0);
        }

        @Test
        @DisplayName("Non-fumeur + non-fumeur + no_pets + no_pets -> 100")
        void fullyCompatible_shouldScore100() {
            Profile a = baseProfile()
                    .smoking(SmokingPreference.no_smoking)
                    .pets(PetsPreference.no_pets)
                    .build();
            Profile b = baseProfile()
                    .smoking(SmokingPreference.no_smoking)
                    .pets(PetsPreference.no_pets)
                    .build();

            assertThat(getDimensionScore(a, b, "smoking_pets")).isEqualTo(100.0);
        }
    }

    // ============================================================
    // DIMENSION AGE
    // ============================================================

    @Nested
    @DisplayName("Score Age (3%)")
    class Age {

        @Test
        @DisplayName("Meme age -> 100")
        void sameAge_shouldScore100() {
            Profile a = baseProfile().age(25).build();
            Profile b = baseProfile().age(25).build();

            assertThat(getDimensionScore(a, b, "age")).isEqualTo(100.0);
        }

        @Test
        @DisplayName("Diff 5 ans -> 85")
        void diff5years_shouldScore85() {
            Profile a = baseProfile().age(22).build();
            Profile b = baseProfile().age(27).build();

            assertThat(getDimensionScore(a, b, "age")).isEqualTo(85.0);
        }

        @Test
        @DisplayName("Diff enorme (25 ans) -> 20 (score min)")
        void hugeDiff_shouldScoreMin() {
            Profile a = baseProfile().age(20).build();
            Profile b = baseProfile().age(50).build();

            assertThat(getDimensionScore(a, b, "age")).isEqualTo(20.0);
        }
    }

    // ============================================================
    // DIMENSION DIET
    // ============================================================

    @Nested
    @DisplayName("Score Diet (5%)")
    class Diet {

        @Test
        @DisplayName("Meme regime -> 100")
        void sameDiet_shouldScore100() {
            Profile a = baseProfile().diet(com.bilalkanba.roommate.model.enums.Diet.vegan).build();
            Profile b = baseProfile().diet(com.bilalkanba.roommate.model.enums.Diet.vegan).build();

            assertThat(getDimensionScore(a, b, "diet")).isEqualTo(100.0);
        }

        @Test
        @DisplayName("Diet null -> score neutre 70")
        void nullDiet_shouldScore70() {
            Profile a = baseProfile().diet(null).build();
            Profile b = baseProfile().diet(com.bilalkanba.roommate.model.enums.Diet.vegan).build();

            assertThat(getDimensionScore(a, b, "diet")).isEqualTo(70.0);
        }

        @Test
        @DisplayName("Vegetarian + Vegan -> 85 (proche)")
        void vegetarianVsVegan_shouldScore85() {
            Profile a = baseProfile().diet(com.bilalkanba.roommate.model.enums.Diet.vegetarian).build();
            Profile b = baseProfile().diet(com.bilalkanba.roommate.model.enums.Diet.vegan).build();

            assertThat(getDimensionScore(a, b, "diet")).isEqualTo(85.0);
        }
    }

    // ============================================================
    // DIMENSION HOBBIES (Jaccard)
    // ============================================================

    @Nested
    @DisplayName("Score Hobbies (5% - Jaccard)")
    class Hobbies {

        @Test
        @DisplayName("Hobbies identiques -> 100")
        void identicalHobbies_shouldScore100() {
            Profile a = baseProfile().hobbies(List.of("sport", "cinema", "lecture")).build();
            Profile b = baseProfile().hobbies(List.of("sport", "cinema", "lecture")).build();
            // Jaccard = 3/3 = 1.0 -> 40 + 60 = 100

            assertThat(getDimensionScore(a, b, "hobbies")).isEqualTo(100.0);
        }

        @Test
        @DisplayName("Aucun hobby en commun -> 40 (min)")
        void noCommonHobbies_shouldScore40() {
            Profile a = baseProfile().hobbies(List.of("sport", "cinema")).build();
            Profile b = baseProfile().hobbies(List.of("cuisine", "voyage")).build();
            // Jaccard = 0/4 = 0.0 -> 40 + 0 = 40

            assertThat(getDimensionScore(a, b, "hobbies")).isEqualTo(40.0);
        }

        @Test
        @DisplayName("Hobbies vides -> 60 (neutre)")
        void emptyHobbies_shouldScore60() {
            Profile a = baseProfile().hobbies(List.of()).build();
            Profile b = baseProfile().hobbies(List.of("sport")).build();

            assertThat(getDimensionScore(a, b, "hobbies")).isEqualTo(60.0);
        }

        @Test
        @DisplayName("50% commun (Jaccard 0.33) -> ~60")
        void partialOverlapHobbies_shouldScoreMedium() {
            Profile a = baseProfile().hobbies(List.of("sport", "lecture")).build();
            Profile b = baseProfile().hobbies(List.of("sport", "cinema")).build();
            // Jaccard = 1/3 = 0.333 -> 40 + 20 = 60

            assertThat(getDimensionScore(a, b, "hobbies")).isCloseTo(60.0, within(0.5));
        }
    }

    // ============================================================
    // SCORE GLOBAL
    // ============================================================

    @Nested
    @DisplayName("Score global calculateCompatibility()")
    class GlobalScore {

        @Test
        @DisplayName("Profils identiques -> score eleve (>= 80)")
        void identicalProfiles_shouldScoreHigh() {
            Profile a = baseProfile().build();
            Profile b = baseProfile().build();

            double totalScore = scoringEngine.calculateCompatibility(a, b).totalScore();

            assertThat(totalScore).isGreaterThanOrEqualTo(80.0);
        }

        @Test
        @DisplayName("Score toujours entre 0 et 100")
        void scoreShouldBeInRange() {
            Profile a = baseProfile()
                    .cleanliness(LifestyleLevel.very_low)
                    .socialLevel(SocialLevel.very_private)
                    .build();
            Profile b = baseProfile()
                    .cleanliness(LifestyleLevel.very_high)
                    .socialLevel(SocialLevel.very_social)
                    .build();

            double totalScore = scoringEngine.calculateCompatibility(a, b).totalScore();

            assertThat(totalScore).isBetween(0.0, 100.0);
        }

        @Test
        @DisplayName("Breakdown contient exactement 10 dimensions")
        void breakdownShouldHave10Dimensions() {
            Profile a = baseProfile().build();
            Profile b = baseProfile().build();

            MatchingScore result = scoringEngine.calculateCompatibility(a, b);

            assertThat(result.breakdown()).hasSize(10);
        }

        @Test
        @DisplayName("Toutes les dimensions ont un score entre 0 et 100")
        void allDimensionsInRange() {
            Profile a = baseProfile().build();
            Profile b = baseProfile().build();

            MatchingScore result = scoringEngine.calculateCompatibility(a, b);

            assertThat(result.breakdown())
                    .allSatisfy(d -> assertThat(d.score()).isBetween(0.0, 100.0));
        }
    }

    // ============================================================
    // HELPER
    // ============================================================

    /**
     * Extrait le score d'une dimension specifique du breakdown.
     * Evite de dupliquer le stream().filter().findFirst() dans chaque test.
     */
    private double getDimensionScore(Profile a, Profile b, String dimensionName) {
        return scoringEngine.calculateCompatibility(a, b).breakdown().stream()
                .filter(d -> d.dimension().equals(dimensionName))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Dimension " + dimensionName + " not found"))
                .score();
    }
}