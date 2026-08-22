package com.bilalkanba.roommate.service;

import com.bilalkanba.roommate.dto.MatchResponseDTO;
import com.bilalkanba.roommate.dto.MatchesListResponseDTO;
import com.bilalkanba.roommate.exception.ProfileNotFoundException;
import com.bilalkanba.roommate.mapper.ProfileMapper;
import com.bilalkanba.roommate.matching.MatchingScore;
import com.bilalkanba.roommate.matching.ScoringEngine;
import com.bilalkanba.roommate.model.Profile;
import com.bilalkanba.roommate.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * MatchService - Business logic pour le matching.
 *
 * WORKFLOW principal (findMatchesForUser) :
 * 1. Charger le profil de l'utilisateur courant
 * 2. Pre-filtrer les candidats en DB (meme ville, actifs)
 * 3. Pour chaque candidat :
 *    a. Appliquer hard filters -> skip si incompatible
 *    b. Calculer le score de compatibilite
 * 4. Filtrer par min_score
 * 5. Trier par score decroissant
 * 6. Limiter au top N
 * 7. Convertir en DTOs
 *
 * DEPENDANCES INJECTEES :
 * - ProfileRepository : recup les profils
 * - ScoringEngine    : calcule les scores
 * - ProfileMapper    : convertit Profile -> ProfileResponseDTO
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)  // Ce service ne fait que du READ
public class MatchService {

    private final ProfileRepository profileRepository;
    private final ScoringEngine scoringEngine;
    private final ProfileMapper profileMapper;

    // ============================================================
    // LIST MATCHES - endpoint principal
    // ============================================================

    /**
     * Trouve les matches pour un utilisateur donne.
     *
     * @param userId    UUID Supabase Auth de l'utilisateur
     * @param limit     nombre max de matches a retourner (defaut 10)
     * @param minScore  score minimum requis (defaut 40)
     * @param language  langue pour les explanations (fr/en/es/ar)
     * @return La liste des matches, triee par score decroissant
     */
    public MatchesListResponseDTO findMatchesForUser(
            UUID userId,
            int limit,
            double minScore,
            String language
    ) {
        log.info("Finding matches for user {} (limit={}, minScore={}, lang={})",
                userId, limit, minScore, language);

        // 1. Recuperer mon profil
        Profile me = profileRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profil non trouve pour user : " + userId
                ));

        // 2. Pre-filtrer les candidats en DB (meme ville, actifs, pas moi)
        List<Profile> candidates = profileRepository.findMatchingCandidates(
                userId,
                me.getTargetCity()
        );
        log.debug("Found {} pre-filtered candidates in city {}",
                candidates.size(), me.getTargetCity());

        // 3. Scorer chaque candidat (hard filter + calculate)
        List<MatchResponseDTO> matches = candidates.stream()
                // Hard filter : elimination si incompatible
                .filter(candidate -> !scoringEngine.isHardIncompatible(me, candidate))
                // Calculer le score
                .map(candidate -> {
                    MatchingScore score = scoringEngine.calculateCompatibility(me, candidate);
                    return new MatchResponseDTO(
                            profileMapper.toResponseDTO(candidate),
                            score.totalScore(),
                            score.breakdown(),
                            null  // Pas d'explanation ici (lazy-loaded)
                    );
                })
                // Filtrer par min score
                .filter(match -> match.totalScore() >= minScore)
                // Trier par score decroissant (le meilleur match en 1er)
                .sorted(Comparator.comparingDouble(MatchResponseDTO::totalScore).reversed())
                // Limiter au top N
                .limit(limit)
                .toList();

        log.info("Returning {} matches (from {} candidates) for user {}",
                matches.size(), candidates.size(), userId);

        return new MatchesListResponseDTO(matches, matches.size(), language);
    }

    // ============================================================
    // GET MATCH WITH SPECIFIC USER (details)
    // ============================================================

    /**
     * Calcule le score de compatibilite avec un utilisateur specifique.
     * Utile pour afficher la page detail d'un profil.
     *
     * @param currentUserId L'user courant
     * @param otherUserId   L'autre user
     * @return Le match, ou throw si l'un des profils n'existe pas ou est incompatible
     */
    public MatchResponseDTO getMatchWith(UUID currentUserId, UUID otherUserId) {
        log.info("Computing match between {} and {}", currentUserId, otherUserId);

        Profile me = profileRepository.findByUserIdAndIsActiveTrue(currentUserId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profil non trouve pour user : " + currentUserId
                ));

        Profile other = profileRepository.findByUserIdAndIsActiveTrue(otherUserId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profil non trouve pour user : " + otherUserId
                ));

        MatchingScore score = scoringEngine.calculateCompatibility(me, other);

        return new MatchResponseDTO(
                profileMapper.toResponseDTO(other),
                score.totalScore(),
                score.breakdown(),
                null
        );
    }
}