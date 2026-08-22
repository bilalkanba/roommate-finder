package com.bilalkanba.roommate.matching;

import java.util.List;

/**
 * MatchingScore - Resultat complet du scoring entre 2 profils.
 *
 * CHAMPS :
 * - totalScore : score final sur 100 (moyenne ponderee des dimensions, normalisee)
 * - breakdown  : liste des 10 DimensionResult pour la transparence
 *
 * Ex: MatchingScore(87.5, [
 *   DimensionResult("budget", 90, 0.20, "Budget"),
 *   DimensionResult("schedule", 80, 0.15, "Horaires"),
 *   ...
 * ])
 *
 * Le breakdown est important pour :
 * - Debugger / expliquer pourquoi X est un bon match
 * - Afficher les details cote frontend
 * - Alimenter l'IA (OpenAI) pour generer une explication naturelle
 */
public record MatchingScore(
        double totalScore,
        List<DimensionResult> breakdown
) {}