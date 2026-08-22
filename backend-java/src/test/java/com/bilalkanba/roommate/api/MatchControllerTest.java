package com.bilalkanba.roommate.api;

import com.bilalkanba.roommate.config.OpenAPIConfig;
import com.bilalkanba.roommate.config.SecurityConfig;
import com.bilalkanba.roommate.dto.MatchExplanationResponseDTO;
import com.bilalkanba.roommate.dto.MatchResponseDTO;
import com.bilalkanba.roommate.dto.MatchesListResponseDTO;
import com.bilalkanba.roommate.dto.ProfileResponseDTO;
import com.bilalkanba.roommate.exception.GlobalExceptionHandler;
import com.bilalkanba.roommate.exception.ProfileNotFoundException;
import com.bilalkanba.roommate.service.ExplanationService;
import com.bilalkanba.roommate.service.MatchService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests des endpoints REST du MatchController avec MockMvc.
 *
 * SETUP :
 * - @WebMvcTest : charge UNIQUEMENT le controller + Spring MVC (pas de DB, pas de service)
 * - @MockBean : les services sont mockes (on ne teste PAS la vraie logique metier)
 * - MockMvc : simule les requetes HTTP sans demarrer un vrai serveur
 *
 * SECURITE :
 * - Un JWT est simule via .with(jwt().jwt(...)) pour matcher notre @CurrentUser.Id
 * - Sans JWT -> 401 Unauthorized (teste separement)
 */
@WebMvcTest(MatchController.class)
@Import({SecurityConfig.class, OpenAPIConfig.class, GlobalExceptionHandler.class})
@DisplayName("MatchController - Tests des endpoints REST (MockMvc)")
class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MatchService matchService;

    @MockBean
    private ExplanationService explanationService;

    @MockBean
    private org.springframework.security.oauth2.jwt.JwtDecoder jwtDecoder;
    // Fixtures
    private final UUID currentUserId = UUID.fromString("c8ada769-6533-4ebf-8123-f9661e247ed4");
    private final UUID otherUserId = UUID.fromString("b1fcca5a-125a-46b0-a8ab-b6e571371010");

    // ============================================================
    // Helpers - creation d'objets de test
    // ============================================================

    private ProfileResponseDTO fakeProfileDTO(UUID userId, String name) {
        return new ProfileResponseDTO(
                UUID.randomUUID(), userId, name,
                25, null, null, null, null,
                "Paris", "France", null,
                10, 500, 800, LocalDate.now(), 12,
                null, null, null, null, null, null, null,
                null, null, null, null, null,
                null, null, null,
                List.of(), null, null, null, null,
                List.of(), null, null,
                true,
                OffsetDateTime.now(), OffsetDateTime.now()
        );
    }

    private MatchResponseDTO fakeMatch(UUID userId, String name, double score) {
        return new MatchResponseDTO(
                fakeProfileDTO(userId, name), score, List.of(), null
        );
    }

    /**
     * Post-processor MockMvc qui simule un JWT authentifie avec le "sub" claim.
     * Ca matche notre @CurrentUser.Id qui lit le sub du JWT.
     */
    private SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor withUser(UUID userId) {
        return jwt().jwt(jwt -> jwt.subject(userId.toString()));
    }

    // ============================================================
    // GET /api/v1/matches
    // ============================================================

    @Nested
    @DisplayName("GET /api/v1/matches")
    class ListMatches {

        @Test
        @DisplayName("Avec JWT valide -> 200 OK avec liste de matches")
        void withValidJwt_shouldReturnMatches() throws Exception {
            List<MatchResponseDTO> matches = List.of(
                    fakeMatch(otherUserId, "Ayoub", 87.5),
                    fakeMatch(UUID.randomUUID(), "Marie", 72.0)
            );
            when(matchService.findMatchesForUser(eq(currentUserId), anyInt(), anyDouble(), anyString()))
                    .thenReturn(new MatchesListResponseDTO(matches, 2, "fr"));

            mockMvc.perform(get("/api/v1/matches").with(withUser(currentUserId)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.matches").isArray())
                    .andExpect(jsonPath("$.matches.length()").value(2))
                    .andExpect(jsonPath("$.matches[0].total_score").value(87.5))
                    .andExpect(jsonPath("$.matches[0].profile.full_name").value("Ayoub"))
                    .andExpect(jsonPath("$.total_count").value(2))
                    .andExpect(jsonPath("$.language").value("fr"));
        }

        @Test
        @DisplayName("Query params limit et min_score sont bien parses")
        void queryParams_shouldBeParsed() throws Exception {
            when(matchService.findMatchesForUser(any(), eq(5), eq(60.0), eq("en")))
                    .thenReturn(new MatchesListResponseDTO(List.of(), 0, "en"));

            mockMvc.perform(get("/api/v1/matches")
                            .param("limit", "5")
                            .param("min_score", "60")
                            .param("language", "en")
                            .with(withUser(currentUserId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.language").value("en"));
        }

        @Test
        @DisplayName("Limit > 50 -> 400 Bad Request (violation @Max)")
        void limitTooHigh_shouldReturn400() throws Exception {
            mockMvc.perform(get("/api/v1/matches")
                            .param("limit", "999")
                            .with(withUser(currentUserId)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Limit < 1 -> 400 Bad Request (violation @Min)")
        void limitTooLow_shouldReturn400() throws Exception {
            mockMvc.perform(get("/api/v1/matches")
                            .param("limit", "0")
                            .with(withUser(currentUserId)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Aucun match -> 200 avec liste vide")
        void emptyMatches_shouldReturn200WithEmptyList() throws Exception {
            when(matchService.findMatchesForUser(any(), anyInt(), anyDouble(), anyString()))
                    .thenReturn(new MatchesListResponseDTO(List.of(), 0, "fr"));

            mockMvc.perform(get("/api/v1/matches").with(withUser(currentUserId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.matches").isEmpty())
                    .andExpect(jsonPath("$.total_count").value(0));
        }
    }

    // ============================================================
    // GET /api/v1/matches/{userId}
    // ============================================================

    @Nested
    @DisplayName("GET /api/v1/matches/{userId}")
    class GetMatchWith {

        @Test
        @DisplayName("Avec un userId valide -> 200 OK avec le match")
        void withValidUserId_shouldReturnMatch() throws Exception {
            when(matchService.getMatchWith(currentUserId, otherUserId))
                    .thenReturn(fakeMatch(otherUserId, "Ayoub", 92.0));

            mockMvc.perform(get("/api/v1/matches/{userId}", otherUserId)
                            .with(withUser(currentUserId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.total_score").value(92.0))
                    .andExpect(jsonPath("$.profile.full_name").value("Ayoub"));
        }

        @Test
        @DisplayName("User inexistant -> 404 Not Found")
        void userNotFound_shouldReturn404() throws Exception {
            when(matchService.getMatchWith(any(), any()))
                    .thenThrow(new ProfileNotFoundException("Profil non trouve"));

            mockMvc.perform(get("/api/v1/matches/{userId}", otherUserId)
                            .with(withUser(currentUserId)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("UUID malforme -> 400 Bad Request")
        void malformedUuid_shouldReturn400() throws Exception {
            mockMvc.perform(get("/api/v1/matches/not-a-uuid")
                            .with(withUser(currentUserId)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ============================================================
    // GET /api/v1/matches/{userId}/explain
    // ============================================================

    @Nested
    @DisplayName("GET /api/v1/matches/{userId}/explain")
    class GetExplanation {

        @Test
        @DisplayName("Retourne l'explication IA generee")
        void shouldReturnExplanation() throws Exception {
            when(explanationService.generateExplanation(currentUserId, otherUserId, "fr"))
                    .thenReturn("Vous partagez le meme rythme de sommeil et...");

            mockMvc.perform(get("/api/v1/matches/{userId}/explain", otherUserId)
                            .with(withUser(currentUserId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.explanation").value("Vous partagez le meme rythme de sommeil et..."))
                    .andExpect(jsonPath("$.language").value("fr"));
        }

        @Test
        @DisplayName("Language param est passe au service")
        void languageParamShouldBePassed() throws Exception {
            when(explanationService.generateExplanation(any(), any(), eq("en")))
                    .thenReturn("You share the same sleep rhythm...");

            mockMvc.perform(get("/api/v1/matches/{userId}/explain", otherUserId)
                            .param("language", "en")
                            .with(withUser(currentUserId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.language").value("en"));
        }

        @Test
        @DisplayName("Route /explain matche AVANT /{userId} (pas de conflit)")
        void explainRouteShouldMatchBeforeUserIdRoute() throws Exception {
            // Ce test valide qu'on appelle bien explanationService (pas matchService.getMatchWith)
            when(explanationService.generateExplanation(any(), any(), any()))
                    .thenReturn("explanation text");

            mockMvc.perform(get("/api/v1/matches/{userId}/explain", otherUserId)
                            .with(withUser(currentUserId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.explanation").exists());
        }
    }
}