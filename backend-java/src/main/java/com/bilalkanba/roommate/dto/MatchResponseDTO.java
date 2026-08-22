package com.bilalkanba.roommate.dto;

import com.bilalkanba.roommate.matching.DimensionResult;

import java.util.List;

/**
 * MatchResponseDTO - Un match complet retourne au frontend.
 *
 * CHAMPS :
 * - profile      : le profil du candidat (l'autre user)
 * - totalScore   : score global 0-100
 * - breakdown    : liste des 10 dimensions detaillees
 * - explanation  : texte AI-genere (optionnel, lazy-loaded via /explain)
 *
 * EXEMPLE JSON :
 * {
 *   "profile": { id, fullName, age, ... },
 *   "totalScore": 87.5,
 *   "breakdown": [
 *     { "dimension": "budget", "score": 90, "weight": 0.20, "label": "Budget" },
 *     ...
 *   ],
 *   "explanation": "Vous partagez le meme rythme de sommeil et..."
 * }
 */
public record MatchResponseDTO(
        ProfileResponseDTO profile,
        double totalScore,
        List<DimensionResult> breakdown,
        String explanation
) {}