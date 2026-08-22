package com.bilalkanba.roommate.dto;

/**
 * MatchExplanationResponseDTO - Explication AI d'un match, chargee a la demande.
 *
 * ENDPOINT dedie : GET /matches/{userId}/explain?language=fr
 *
 * Pourquoi separer ? L'appel OpenAI prend 2-5s. On ne veut pas
 * bloquer le chargement de la liste des matches. Le frontend
 * appelle cet endpoint uniquement quand l'user clique "Voir plus".
 *
 * EXEMPLE JSON :
 * {
 *   "explanation": "Vous avez un excellent match car vos horaires...",
 *   "language": "fr"
 * }
 */
public record MatchExplanationResponseDTO(
        String explanation,
        String language
) {}