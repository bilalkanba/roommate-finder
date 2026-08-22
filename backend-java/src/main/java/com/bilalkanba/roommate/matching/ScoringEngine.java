package com.bilalkanba.roommate.matching;

import com.bilalkanba.roommate.model.Profile;
import com.bilalkanba.roommate.model.enums.*;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * ScoringEngine - Le cerveau de l'algorithme de matching.
 *
 * WORKFLOW :
 * 1. Verifier isHardIncompatible() -> si true, on ignore ce candidat
 * 2. Sinon, calculer les 10 scoreXxx() pour chaque dimension
 * 3. Faire la moyenne ponderee -> MatchingScore final sur 100
 *
 * SPRING BEAN :
 * Marque @Component pour etre injectable dans MatchService.
 * Singleton (une seule instance dans toute l'app) -> zero state, methodes pures.
 */
@Component
public class ScoringEngine {

    // ============================================================
    // MAIN : Calculer la compatibility complete
    // ============================================================

    /**
     * Calcule le score de compatibilite entre 2 profils.
     *
     * @return MatchingScore avec le total (0-100) et le detail des 10 dimensions
     */
    public MatchingScore calculateCompatibility(Profile a, Profile b) {
        // Calcul des 10 dimensions
        List<DimensionResult> breakdown = List.of(
                scoreBudget(a, b),
                scoreSchedule(a, b),
                scoreCleanliness(a, b),
                scoreSocial(a, b),
                scoreSmokingPets(a, b),
                scoreNoise(a, b),
                scoreAge(a, b),
                scoreDiet(a, b),
                scorePresence(a, b),
                scoreHobbies(a, b)
        );

        // Somme ponderee
        double totalWeighted = breakdown.stream()
                .mapToDouble(d -> d.score() * d.weight())
                .sum();

        // Normalisation sur 100 (poids total = 0.95, on rescale)
        double total = (totalWeighted / ScoringWeights.TOTAL_WEIGHTS) * 100;

        // Cap a 100 pour eviter arrondi qui donnerait 100.01
        total = Math.min(100.0, total);

        // Arrondi a 1 decimale
        total = Math.round(total * 10) / 10.0;

        return new MatchingScore(total, breakdown);
    }

    // ============================================================
    // HARD FILTERS : elimination avant scoring
    // ============================================================

    /**
     * Verifie si 2 profils sont incompatibles au point d'etre elimines
     * avant meme de calculer le score.
     *
     * @return true si INCOMPATIBLE (a exclure), false si a scorer
     */
    public boolean isHardIncompatible(Profile a, Profile b) {
        // 1. Ville differente
        if (!a.getTargetCity().equalsIgnoreCase(b.getTargetCity())) {
            return true;
        }

        // 2. Pas d'overlap de budget
        if (a.getBudgetMaxEur() < b.getBudgetMinEur()) return true;
        if (b.getBudgetMaxEur() < a.getBudgetMinEur()) return true;

        // 3. Dates d'emmenagement trop eloignees
        long daysDiff = Math.abs(
                ChronoUnit.DAYS.between(a.getMoveInDate(), b.getMoveInDate())
        );
        if (daysDiff > ScoringWeights.MAX_MOVE_IN_DATE_DIFF_DAYS) return true;

        // 4. Genre prefere incompatible
        if (a.getPreferredGender() == PreferredGender.male && b.getGender() != Gender.male) {
            return true;
        }
        if (a.getPreferredGender() == PreferredGender.female && b.getGender() != Gender.female) {
            return true;
        }
        if (b.getPreferredGender() == PreferredGender.male && a.getGender() != Gender.male) {
            return true;
        }
        if (b.getPreferredGender() == PreferredGender.female && a.getGender() != Gender.female) {
            return true;
        }

        // 5. Tranche d'age preferee
        if (a.getPreferredAgeMin() != null && a.getPreferredAgeMax() != null) {
            if (b.getAge() < a.getPreferredAgeMin() || b.getAge() > a.getPreferredAgeMax()) {
                return true;
            }
        }
        if (b.getPreferredAgeMin() != null && b.getPreferredAgeMax() != null) {
            if (a.getAge() < b.getPreferredAgeMin() || a.getAge() > b.getPreferredAgeMax()) {
                return true;
            }
        }

        // 6. Type de logement incompatible
        if (a.getHousingType() != HousingType.any
                && b.getHousingType() != HousingType.any
                && a.getHousingType() != b.getHousingType()) {
            return true;
        }

        return false;
    }

    // ============================================================
    // DIMENSION 1 : BUDGET (20%)
    // ============================================================

    /**
     * Score du budget : plus l'overlap est grand par rapport aux plages, mieux c'est.
     * Ex: A=[500-800], B=[600-900] -> overlap=[600-800]=200 sur plages moyennes de 300
     *     ratio = 200/300 = 0.66 -> score 66
     */
    private DimensionResult scoreBudget(Profile a, Profile b) {
        int overlapMin = Math.max(a.getBudgetMinEur(), b.getBudgetMinEur());
        int overlapMax = Math.min(a.getBudgetMaxEur(), b.getBudgetMaxEur());

        double score;
        if (overlapMax < overlapMin) {
            // Pas d'overlap (deja gere par hard filter mais safety)
            score = 0.0;
        } else {
            int overlapSize = overlapMax - overlapMin;
            double avgRange = (
                    (a.getBudgetMaxEur() - a.getBudgetMinEur())
                            + (b.getBudgetMaxEur() - b.getBudgetMinEur())
            ) / 2.0;

            if (avgRange == 0) {
                // Les 2 users ont un budget fixe (min=max)
                score = 100.0;
            } else {
                double ratio = overlapSize / avgRange;
                score = Math.min(100.0, ratio * 100);
            }
        }

        return new DimensionResult("budget", score, ScoringWeights.WEIGHT_BUDGET, "Budget");
    }

    // ============================================================
    // DIMENSION 2 : SCHEDULE - horaires de sommeil (15%)
    // ============================================================

    private DimensionResult scoreSchedule(Profile a, Profile b) {
        int score = ScoringWeights.sleepCompatibility(a.getSleepSchedule(), b.getSleepSchedule());
        return new DimensionResult("schedule", score, ScoringWeights.WEIGHT_SCHEDULE, "Horaires");
    }

    // ============================================================
    // DIMENSION 3 : CLEANLINESS - proprete (12%)
    // ============================================================

    private DimensionResult scoreCleanliness(Profile a, Profile b) {
        int numA = ScoringWeights.LIFESTYLE_NUMERIC.get(a.getCleanliness());
        int numB = ScoringWeights.LIFESTYLE_NUMERIC.get(b.getCleanliness());
        int diff = Math.abs(numA - numB);

        int score = ScoringWeights.cleanlinessScore(diff);
        return new DimensionResult("cleanliness", score, ScoringWeights.WEIGHT_CLEANLINESS, "Proprete");
    }

    // ============================================================
    // DIMENSION 4 : SOCIAL - sociabilite (12%)
    // ============================================================

    private DimensionResult scoreSocial(Profile a, Profile b) {
        int score = ScoringWeights.socialCompatibility(a.getSocialLevel(), b.getSocialLevel());
        return new DimensionResult("social", score, ScoringWeights.WEIGHT_SOCIAL, "Sociabilite");
    }

    // ============================================================
    // DIMENSION 5 : SMOKING_PETS - fumeur & animaux (10%)
    // ============================================================

    private DimensionResult scoreSmokingPets(Profile a, Profile b) {
        // Score smoking
        double smokeScore = 100.0;

        // Si A ne fume pas, penaliser si B fume dedans
        if (a.getSmoking() == SmokingPreference.no_smoking) {
            if (b.getSmoking() == SmokingPreference.indoor_ok) smokeScore = 0;
            else if (b.getSmoking() == SmokingPreference.ok_outside) smokeScore = 60;
        }
        // Reciproque
        if (b.getSmoking() == SmokingPreference.no_smoking) {
            if (a.getSmoking() == SmokingPreference.indoor_ok) smokeScore = Math.min(smokeScore, 0);
            else if (a.getSmoking() == SmokingPreference.ok_outside) smokeScore = Math.min(smokeScore, 60);
        }

        // Score pets
        double petScore = 100.0;
        if (a.getPets() == PetsPreference.no_pets && b.getPets() == PetsPreference.has_pet) petScore = 0;
        if (b.getPets() == PetsPreference.no_pets && a.getPets() == PetsPreference.has_pet) petScore = 0;

        double avg = (smokeScore + petScore) / 2;
        return new DimensionResult("smoking_pets", avg, ScoringWeights.WEIGHT_SMOKING_PETS, "Fumeur & Animaux");
    }

    // ============================================================
    // DIMENSION 6 : NOISE - tolerance bruit vs frequence invites (8%)
    // ============================================================

    private DimensionResult scoreNoise(Profile a, Profile b) {
        int aNoise = ScoringWeights.LIFESTYLE_NUMERIC.get(a.getNoiseTolerance());
        int bNoise = ScoringWeights.LIFESTYLE_NUMERIC.get(b.getNoiseTolerance());
        int aGuests = ScoringWeights.LIFESTYLE_NUMERIC.get(a.getGuestsFrequency());
        int bGuests = ScoringWeights.LIFESTYLE_NUMERIC.get(b.getGuestsFrequency());

        // Mismatch : quand B invite beaucoup mais A ne tolere pas le bruit
        int mismatchAB = Math.max(0, bGuests - aNoise);
        int mismatchBA = Math.max(0, aGuests - bNoise);
        int maxMismatch = Math.max(mismatchAB, mismatchBA);

        int score = Math.max(0, 100 - (maxMismatch * 25));
        return new DimensionResult("noise", score, ScoringWeights.WEIGHT_NOISE, "Calme & Invites");
    }

    // ============================================================
    // DIMENSION 7 : AGE - difference d'age (3%)
    // ============================================================

    private DimensionResult scoreAge(Profile a, Profile b) {
        int diff = Math.abs(a.getAge() - b.getAge());
        int score = ScoringWeights.ageScore(diff);
        return new DimensionResult("age", score, ScoringWeights.WEIGHT_AGE, "Age");
    }

    // ============================================================
    // DIMENSION 8 : DIET - regime alimentaire (5%)
    // ============================================================

    private DimensionResult scoreDiet(Profile a, Profile b) {
        Diet dietA = a.getDiet();
        Diet dietB = b.getDiet();

        // Aucun renseignement -> score neutre
        if (dietA == null || dietB == null) {
            return new DimensionResult("diet", 70.0, ScoringWeights.WEIGHT_DIET, "Regime alimentaire");
        }

        // Meme regime -> parfait
        if (dietA == dietB) {
            return new DimensionResult("diet", 100.0, ScoringWeights.WEIGHT_DIET, "Regime alimentaire");
        }

        // Matrice de compatibilite (paires symetriques via EnumSet)
        Set<Diet> pair = EnumSet.of(dietA, dietB);
        double score = getDietPairScore(pair);

        return new DimensionResult("diet", score, ScoringWeights.WEIGHT_DIET, "Regime alimentaire");
    }

    private double getDietPairScore(Set<Diet> pair) {
        // Omnivore combinations
        if (pair.equals(EnumSet.of(Diet.omnivore, Diet.vegetarian))) return 70;
        if (pair.equals(EnumSet.of(Diet.omnivore, Diet.vegan)))      return 50;
        if (pair.equals(EnumSet.of(Diet.omnivore, Diet.halal)))      return 60;
        if (pair.equals(EnumSet.of(Diet.omnivore, Diet.kosher)))     return 60;
        if (pair.equals(EnumSet.of(Diet.omnivore, Diet.other)))      return 60;
        // Vegetarian combinations
        if (pair.equals(EnumSet.of(Diet.vegetarian, Diet.vegan)))    return 85;
        if (pair.equals(EnumSet.of(Diet.vegetarian, Diet.halal)))    return 75;
        if (pair.equals(EnumSet.of(Diet.vegetarian, Diet.kosher)))   return 75;
        if (pair.equals(EnumSet.of(Diet.vegetarian, Diet.other)))    return 70;
        // Vegan combinations
        if (pair.equals(EnumSet.of(Diet.vegan, Diet.halal)))         return 65;
        if (pair.equals(EnumSet.of(Diet.vegan, Diet.kosher)))        return 65;
        if (pair.equals(EnumSet.of(Diet.vegan, Diet.other)))         return 60;
        // Halal & Kosher
        if (pair.equals(EnumSet.of(Diet.halal, Diet.kosher)))        return 60;
        if (pair.equals(EnumSet.of(Diet.halal, Diet.other)))         return 70;
        if (pair.equals(EnumSet.of(Diet.kosher, Diet.other)))        return 70;

        return 60; // fallback
    }

    // ============================================================
    // DIMENSION 9 : PRESENCE - presence a la maison (5%)
    // ============================================================

    private DimensionResult scorePresence(Profile a, Profile b) {
        HomePresence presA = a.getHomePresence();
        HomePresence presB = b.getHomePresence();

        // Neutre si non renseigne
        if (presA == null || presB == null) {
            return new DimensionResult("presence", 70.0, ScoringWeights.WEIGHT_PRESENCE, "Presence");
        }

        double score;
        if (presA == presB) {
            score = 90.0; // Meme rythme
        } else if (
                (presA == HomePresence.mostly_home && presB == HomePresence.rarely_home)
                        || (presB == HomePresence.mostly_home && presA == HomePresence.rarely_home)
        ) {
            score = 80.0; // Un toujours la / un jamais la -> peut marcher
        } else {
            score = 75.0; // Complementaires
        }

        return new DimensionResult("presence", score, ScoringWeights.WEIGHT_PRESENCE, "Presence");
    }

    // ============================================================
    // DIMENSION 10 : HOBBIES - centres d'interet (5%)
    // ============================================================

    /**
     * Utilise la similarite de Jaccard : |A ∩ B| / |A ∪ B|
     * Ex: A=["sport","lecture"], B=["sport","cinema"]
     *     -> intersection={"sport"}, union={"sport","lecture","cinema"}
     *     -> jaccard = 1/3 = 0.33
     */
    private DimensionResult scoreHobbies(Profile a, Profile b) {
        List<String> hobbiesA = a.getHobbies();
        List<String> hobbiesB = b.getHobbies();

        // Un des deux n'a pas rempli -> score neutre
        if (hobbiesA == null || hobbiesA.isEmpty() || hobbiesB == null || hobbiesB.isEmpty()) {
            return new DimensionResult("hobbies", 60.0, ScoringWeights.WEIGHT_HOBBIES, "Centres d'interet");
        }

        Set<String> setA = new HashSet<>(hobbiesA);
        Set<String> setB = new HashSet<>(hobbiesB);

        // Intersection
        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        // Union
        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);

        double jaccard = union.isEmpty() ? 0 : (double) intersection.size() / union.size();

        // Mapping jaccard -> score : 0 -> 40, 1.0 -> 100
        double score = 40 + (jaccard * 60);
        score = Math.round(score * 10) / 10.0; // 1 decimale

        return new DimensionResult("hobbies", score, ScoringWeights.WEIGHT_HOBBIES, "Centres d'interet");
    }
}