package com.bilalkanba.roommate.matching;

/**
 * DimensionResult - Resultat d'une dimension du scoring.
 *
 * C'est un record Java 16+ : classe immutable avec auto-generated
 * constructor, getters, equals, hashCode, toString.
 *
 * CHAMPS :
 * - dimension : identifiant unique de la dimension ("budget", "schedule", ...)
 * - score     : le score sur 100 (0 = incompatible, 100 = parfait)
 * - weight    : le poids de cette dimension (0.20 = 20%)
 * - label     : label human-readable pour le frontend ("Budget", "Horaires", ...)
 *
 * Ex: DimensionResult("budget", 85.0, 0.20, "Budget")
 *     -> cette dimension contribue 85 * 0.20 = 17 points au score final
 */
public record DimensionResult(
        String dimension,
        double score,
        double weight,
        String label
) {}