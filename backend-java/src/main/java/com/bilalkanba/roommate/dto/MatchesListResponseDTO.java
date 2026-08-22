package com.bilalkanba.roommate.dto;

import java.util.List;

/**
 * MatchesListResponseDTO - La liste des matches avec metadata.
 *
 * CHAMPS :
 * - matches    : la liste des matches, tries par score decroissant
 * - totalCount : nombre total de matches trouves (utile pour pagination future)
 * - language   : langue des explanations (fr / en / es / ar)
 *
 * EXEMPLE JSON :
 * {
 *   "matches": [ MatchResponseDTO, MatchResponseDTO, ... ],
 *   "totalCount": 7,
 *   "language": "fr"
 * }
 */
public record MatchesListResponseDTO(
        List<MatchResponseDTO> matches,
        int totalCount,
        String language
) {}