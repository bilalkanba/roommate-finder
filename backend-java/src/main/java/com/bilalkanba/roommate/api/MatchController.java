package com.bilalkanba.roommate.api;

import com.bilalkanba.roommate.core.CurrentUser;
import com.bilalkanba.roommate.dto.MatchExplanationResponseDTO;
import com.bilalkanba.roommate.dto.MatchResponseDTO;
import com.bilalkanba.roommate.dto.MatchesListResponseDTO;
import com.bilalkanba.roommate.service.ExplanationService;
import com.bilalkanba.roommate.service.MatchService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * MatchController v2 - avec ExplanationService pour les explanations AI.
 */
@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
@Slf4j
@Validated
public class MatchController {

    private final MatchService matchService;
    private final ExplanationService explanationService;  // NOUVEAU

    // ============================================================
    // GET /api/v1/matches - Liste mes matches
    // ============================================================

    @GetMapping
    public MatchesListResponseDTO listMatches(
            @CurrentUser.Id UUID userId,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int limit,
            @RequestParam(name = "min_score", defaultValue = "40") @Min(0) @Max(100) double minScore,
            @RequestParam(defaultValue = "fr") String language,
            @RequestParam(name = "with_explanations", defaultValue = "false") boolean withExplanations
    ) {
        log.info("GET /matches - user: {}, limit: {}, minScore: {}, lang: {}",
                userId, limit, minScore, language);

        if (withExplanations) {
            log.warn("with_explanations=true is expensive (calls OpenAI for each match). Use /explain instead for lazy loading.");
        }

        return matchService.findMatchesForUser(userId, limit, minScore, language);
    }

    // ============================================================
    // GET /api/v1/matches/{userId}/explain - Explanation AI REELLE
    // ============================================================
    //
    // IMPORTANT : cette route DOIT etre declaree AVANT /{userId}
    // ============================================================

    /**
     * Retourne une explanation AI generee par OpenAI GPT-4o-mini.
     * Peut prendre 2-5 secondes (appel LLM).
     */
    @GetMapping("/{userId}/explain")
    public MatchExplanationResponseDTO getExplanation(
            @PathVariable UUID userId,
            @CurrentUser.Id UUID currentUserId,
            @RequestParam(defaultValue = "fr") String language
    ) {
        log.info("GET /matches/{}/explain - lang: {} - by user: {}", userId, language, currentUserId);

        // Appel REEL a OpenAI via ExplanationService
        String explanation = explanationService.generateExplanation(currentUserId, userId, language);

        return new MatchExplanationResponseDTO(explanation, language);
    }

    // ============================================================
    // GET /api/v1/matches/{userId} - Match avec un user specifique
    // ============================================================

    @GetMapping("/{userId}")
    public MatchResponseDTO getMatchWithUser(
            @PathVariable UUID userId,
            @CurrentUser.Id UUID currentUserId
    ) {
        log.info("GET /matches/{} - by user: {}", userId, currentUserId);
        return matchService.getMatchWith(currentUserId, userId);
    }
}