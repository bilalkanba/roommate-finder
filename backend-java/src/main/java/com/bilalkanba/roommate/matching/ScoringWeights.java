package com.bilalkanba.roommate.matching;

import com.bilalkanba.roommate.model.enums.LifestyleLevel;
import com.bilalkanba.roommate.model.enums.SleepSchedule;
import com.bilalkanba.roommate.model.enums.SocialLevel;

import java.util.Map;

/**
 * ScoringWeights - Constantes pour l'algorithme de matching.
 *
 * PATTERN : classe utilitaire finale non-instanciable.
 * Toutes les constantes sont public static final.
 *
 * POIDS DES DIMENSIONS :
 * Chaque dimension a un poids reflete son importance dans le score final.
 * Total = 0.95 (buffer de 5% pour les futurs ajustements).
 *
 * MATRICES DE COMPATIBILITE :
 * Certaines dimensions utilisent des matrices pre-calculees pour scorer
 * les combinaisons (ex: EARLY_BIRD vs NIGHT_OWL = 40).
 */
public final class ScoringWeights {

    // Constructeur prive : classe utilitaire non-instanciable
    private ScoringWeights() {
        throw new UnsupportedOperationException("Utility class");
    }

    // ============================================================
    // POIDS DES 10 DIMENSIONS (total = 0.95)
    // ============================================================

    public static final double WEIGHT_BUDGET       = 0.20;
    public static final double WEIGHT_SCHEDULE     = 0.15;
    public static final double WEIGHT_CLEANLINESS  = 0.12;
    public static final double WEIGHT_SOCIAL       = 0.12;
    public static final double WEIGHT_SMOKING_PETS = 0.10;
    public static final double WEIGHT_NOISE        = 0.08;
    public static final double WEIGHT_DIET         = 0.05;
    public static final double WEIGHT_PRESENCE     = 0.05;
    public static final double WEIGHT_HOBBIES      = 0.05;
    public static final double WEIGHT_AGE          = 0.03;

    public static final double TOTAL_WEIGHTS =
            WEIGHT_BUDGET + WEIGHT_SCHEDULE + WEIGHT_CLEANLINESS
                    + WEIGHT_SOCIAL + WEIGHT_SMOKING_PETS + WEIGHT_NOISE
                    + WEIGHT_DIET + WEIGHT_PRESENCE + WEIGHT_HOBBIES + WEIGHT_AGE;

    // ============================================================
    // LIFESTYLE LEVEL -> valeur numerique (pour calculs de diff)
    // ============================================================

    public static final Map<LifestyleLevel, Integer> LIFESTYLE_NUMERIC = Map.of(
            LifestyleLevel.very_low,  1,
            LifestyleLevel.low,       2,
            LifestyleLevel.medium,    3,
            LifestyleLevel.high,      4,
            LifestyleLevel.very_high, 5
    );

    // ============================================================
    // MATRICE COMPAT SOMMEIL
    // Ex: EARLY_BIRD + NIGHT_OWL = 40 (incompatible)
    // ============================================================

    /**
     * Retourne le score de compatibilite entre 2 rythmes de sommeil.
     * Symetrie automatique : (A, B) == (B, A).
     * Si combo inconnu -> 50 (neutre).
     */
    public static int sleepCompatibility(SleepSchedule a, SleepSchedule b) {
        // Normaliser l'ordre pour eviter les doublons dans la matrice
        SleepSchedule first  = (a.ordinal() <= b.ordinal()) ? a : b;
        SleepSchedule second = (a.ordinal() <= b.ordinal()) ? b : a;

        // Matrice symetrique : on stocke une seule direction
        if (first == SleepSchedule.early_bird && second == SleepSchedule.early_bird) return 100;
        if (first == SleepSchedule.early_bird && second == SleepSchedule.normal)     return 80;
        if (first == SleepSchedule.early_bird && second == SleepSchedule.night_owl)  return 40;
        if (first == SleepSchedule.early_bird && second == SleepSchedule.irregular)  return 60;

        if (first == SleepSchedule.normal && second == SleepSchedule.normal)         return 100;
        if (first == SleepSchedule.normal && second == SleepSchedule.night_owl)      return 70;
        if (first == SleepSchedule.normal && second == SleepSchedule.irregular)      return 70;

        if (first == SleepSchedule.night_owl && second == SleepSchedule.night_owl)   return 100;
        if (first == SleepSchedule.night_owl && second == SleepSchedule.irregular)   return 75;

        if (first == SleepSchedule.irregular && second == SleepSchedule.irregular)   return 80;

        return 50; // fallback
    }

    // ============================================================
    // MATRICE COMPAT SOCIABILITE
    // ============================================================

    public static int socialCompatibility(SocialLevel a, SocialLevel b) {
        SocialLevel first  = (a.ordinal() <= b.ordinal()) ? a : b;
        SocialLevel second = (a.ordinal() <= b.ordinal()) ? b : a;

        if (first == SocialLevel.very_private && second == SocialLevel.very_private) return 100;
        if (first == SocialLevel.very_private && second == SocialLevel.balanced)     return 70;
        if (first == SocialLevel.very_private && second == SocialLevel.very_social)  return 30;

        if (first == SocialLevel.balanced && second == SocialLevel.balanced)         return 100;
        if (first == SocialLevel.balanced && second == SocialLevel.very_social)      return 75;

        if (first == SocialLevel.very_social && second == SocialLevel.very_social)   return 100;

        return 50;
    }

    // ============================================================
    // COMPAT CLEANLINESS SELON DIFFERENCE
    // Ex: diff = 0 -> 100, diff = 4 -> 0
    // ============================================================

    public static int cleanlinessScore(int diff) {
        return switch (diff) {
            case 0 -> 100;
            case 1 -> 85;
            case 2 -> 60;
            case 3 -> 30;
            default -> 0;
        };
    }

    // ============================================================
    // COMPAT AGE SELON DIFFERENCE EN ANNEES
    // ============================================================

    public static int ageScore(int diff) {
        if (diff <= 3)  return 100;
        if (diff <= 7)  return 85;
        if (diff <= 12) return 65;
        if (diff <= 20) return 40;
        return 20;
    }

    // ============================================================
    // MAX ECART DATES EMMENAGEMENT (en jours)
    // ============================================================

    public static final int MAX_MOVE_IN_DATE_DIFF_DAYS = 60;
}