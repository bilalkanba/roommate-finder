package com.bilalkanba.roommate.service;

import com.bilalkanba.roommate.dto.MatchResponseDTO;
import com.bilalkanba.roommate.dto.MatchesListResponseDTO;
import com.bilalkanba.roommate.dto.ProfileResponseDTO;
import com.bilalkanba.roommate.exception.ProfileNotFoundException;
import com.bilalkanba.roommate.mapper.ProfileMapper;
import com.bilalkanba.roommate.matching.MatchingScore;
import com.bilalkanba.roommate.matching.ScoringEngine;
import com.bilalkanba.roommate.model.Profile;
import com.bilalkanba.roommate.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires du MatchService avec Mockito.
 *
 * PATTERN :
 * - @Mock : cree des faux objets (Repository, ScoringEngine, Mapper)
 * - @InjectMocks : injecte ces mocks dans MatchService
 * - when(...).thenReturn(...) : configure le comportement des mocks
 * - verify(...) : verifie que les mocks ont ete appeles comme attendu
 *
 * OBJECTIF : tester la LOGIQUE d'orchestration du service
 * (filtrage minScore, tri par score decroissant, limit)
 * sans dependre de la vraie DB ni du vrai algorithme.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MatchService - Tests unitaires (Mockito)")
class MatchServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private ScoringEngine scoringEngine;

    @Mock
    private ProfileMapper profileMapper;

    @InjectMocks
    private MatchService matchService;

    // Fixtures reutilisees
    private UUID currentUserId;
    private Profile currentUserProfile;

    @BeforeEach
    void setUp() {
        currentUserId = UUID.randomUUID();
        currentUserProfile = createProfile(currentUserId, "Bilal", "Paris");
    }

    // ============================================================
    // HELPERS - creation d'objets de test
    // ============================================================

    private Profile createProfile(UUID userId, String name, String city) {
        Profile p = new Profile();
        p.setId(UUID.randomUUID());
        p.setUserId(userId);
        p.setFullName(name);
        p.setTargetCity(city);
        p.setIsActive(true);
        return p;
    }

    private ProfileResponseDTO createProfileDTO(Profile p) {
        return new ProfileResponseDTO(
                p.getId(), p.getUserId(), p.getFullName(),
                25, null, null, null, null,
                p.getTargetCity(), "France", null,
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

    private MatchingScore createScore(double totalScore) {
        return new MatchingScore(totalScore, List.of());
    }

    // ============================================================
    // findMatchesForUser()
    // ============================================================

    @Nested
    @DisplayName("findMatchesForUser()")
    class FindMatchesForUser {

        @Test
        @DisplayName("Utilisateur sans profil -> ProfileNotFoundException")
        void whenUserHasNoProfile_shouldThrow() {
            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    matchService.findMatchesForUser(currentUserId, 10, 40.0, "fr")
            ).isInstanceOf(ProfileNotFoundException.class);
        }

        @Test
        @DisplayName("Aucun candidat -> liste vide")
        void whenNoCandidates_shouldReturnEmpty() {
            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(currentUserProfile));
            when(profileRepository.findMatchingCandidates(any(), any()))
                    .thenReturn(List.of());

            MatchesListResponseDTO result = matchService.findMatchesForUser(
                    currentUserId, 10, 40.0, "fr"
            );

            assertThat(result.matches()).isEmpty();
            assertThat(result.totalCount()).isZero();
            assertThat(result.language()).isEqualTo("fr");
        }

        @Test
        @DisplayName("Filtre les candidats hard-incompatibles")
        void shouldFilterHardIncompatibleCandidates() {
            Profile compat = createProfile(UUID.randomUUID(), "Compatible", "Paris");
            Profile incompat = createProfile(UUID.randomUUID(), "Incompatible", "Paris");

            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(currentUserProfile));
            when(profileRepository.findMatchingCandidates(any(), any()))
                    .thenReturn(List.of(compat, incompat));

            // Un candidat compatible, un incompatible
            when(scoringEngine.isHardIncompatible(currentUserProfile, compat)).thenReturn(false);
            when(scoringEngine.isHardIncompatible(currentUserProfile, incompat)).thenReturn(true);

            when(scoringEngine.calculateCompatibility(currentUserProfile, compat))
                    .thenReturn(createScore(85.0));

            when(profileMapper.toResponseDTO(compat)).thenReturn(createProfileDTO(compat));

            MatchesListResponseDTO result = matchService.findMatchesForUser(
                    currentUserId, 10, 40.0, "fr"
            );

            assertThat(result.matches()).hasSize(1);
            assertThat(result.matches().get(0).totalScore()).isEqualTo(85.0);
            // On verifie qu'on n'a PAS calcule le score pour l'incompatible
            verify(scoringEngine, never()).calculateCompatibility(currentUserProfile, incompat);
        }

        @Test
        @DisplayName("Filtre par minScore")
        void shouldFilterByMinScore() {
            Profile c1 = createProfile(UUID.randomUUID(), "C1", "Paris");
            Profile c2 = createProfile(UUID.randomUUID(), "C2", "Paris");
            Profile c3 = createProfile(UUID.randomUUID(), "C3", "Paris");

            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(currentUserProfile));
            when(profileRepository.findMatchingCandidates(any(), any()))
                    .thenReturn(List.of(c1, c2, c3));
            when(scoringEngine.isHardIncompatible(any(), any())).thenReturn(false);

            // 3 candidats : 85, 45, 30
            when(scoringEngine.calculateCompatibility(currentUserProfile, c1))
                    .thenReturn(createScore(85.0));
            when(scoringEngine.calculateCompatibility(currentUserProfile, c2))
                    .thenReturn(createScore(45.0));
            when(scoringEngine.calculateCompatibility(currentUserProfile, c3))
                    .thenReturn(createScore(30.0));

            when(profileMapper.toResponseDTO(any())).thenAnswer(inv ->
                    createProfileDTO(inv.getArgument(0))
            );

            // minScore = 40 -> on garde c1 (85) et c2 (45), pas c3 (30)
            MatchesListResponseDTO result = matchService.findMatchesForUser(
                    currentUserId, 10, 40.0, "fr"
            );

            assertThat(result.matches()).hasSize(2);
            assertThat(result.matches())
                    .extracting(MatchResponseDTO::totalScore)
                    .allSatisfy(score -> assertThat(score).isGreaterThanOrEqualTo(40.0));
        }

        @Test
        @DisplayName("Tri par score decroissant (meilleur match en 1er)")
        void shouldSortByScoreDescending() {
            Profile c1 = createProfile(UUID.randomUUID(), "C1", "Paris");
            Profile c2 = createProfile(UUID.randomUUID(), "C2", "Paris");
            Profile c3 = createProfile(UUID.randomUUID(), "C3", "Paris");

            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(currentUserProfile));
            when(profileRepository.findMatchingCandidates(any(), any()))
                    .thenReturn(List.of(c1, c2, c3));
            when(scoringEngine.isHardIncompatible(any(), any())).thenReturn(false);

            when(scoringEngine.calculateCompatibility(currentUserProfile, c1))
                    .thenReturn(createScore(60.0));
            when(scoringEngine.calculateCompatibility(currentUserProfile, c2))
                    .thenReturn(createScore(90.0));
            when(scoringEngine.calculateCompatibility(currentUserProfile, c3))
                    .thenReturn(createScore(75.0));

            when(profileMapper.toResponseDTO(any())).thenAnswer(inv ->
                    createProfileDTO(inv.getArgument(0))
            );

            MatchesListResponseDTO result = matchService.findMatchesForUser(
                    currentUserId, 10, 0.0, "fr"
            );

            // Attendu : 90, 75, 60
            assertThat(result.matches())
                    .extracting(MatchResponseDTO::totalScore)
                    .containsExactly(90.0, 75.0, 60.0);
        }

        @Test
        @DisplayName("Respecte le limit demande")
        void shouldRespectLimit() {
            List<Profile> candidates = List.of(
                    createProfile(UUID.randomUUID(), "C1", "Paris"),
                    createProfile(UUID.randomUUID(), "C2", "Paris"),
                    createProfile(UUID.randomUUID(), "C3", "Paris"),
                    createProfile(UUID.randomUUID(), "C4", "Paris"),
                    createProfile(UUID.randomUUID(), "C5", "Paris")
            );

            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(currentUserProfile));
            when(profileRepository.findMatchingCandidates(any(), any()))
                    .thenReturn(candidates);
            when(scoringEngine.isHardIncompatible(any(), any())).thenReturn(false);
            when(scoringEngine.calculateCompatibility(any(), any()))
                    .thenReturn(createScore(80.0));
            when(profileMapper.toResponseDTO(any())).thenAnswer(inv ->
                    createProfileDTO(inv.getArgument(0))
            );

            // limit = 3 sur 5 candidats
            MatchesListResponseDTO result = matchService.findMatchesForUser(
                    currentUserId, 3, 0.0, "fr"
            );

            assertThat(result.matches()).hasSize(3);
        }

        @Test
        @DisplayName("Passe la bonne ville au findMatchingCandidates")
        void shouldPassCorrectCityToRepository() {
            Profile me = createProfile(currentUserId, "Bilal", "Marseille");

            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(me));
            when(profileRepository.findMatchingCandidates(any(), any()))
                    .thenReturn(List.of());

            matchService.findMatchesForUser(currentUserId, 10, 40.0, "fr");

            verify(profileRepository).findMatchingCandidates(currentUserId, "Marseille");
        }

        @Test
        @DisplayName("Language est bien retourne dans la reponse")
        void shouldPreserveLanguage() {
            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(currentUserProfile));
            when(profileRepository.findMatchingCandidates(any(), any()))
                    .thenReturn(List.of());

            MatchesListResponseDTO result = matchService.findMatchesForUser(
                    currentUserId, 10, 40.0, "en"
            );

            assertThat(result.language()).isEqualTo("en");
        }

        @Test
        @DisplayName("Explanation est null par defaut (lazy-loaded)")
        void shouldNotSetExplanationByDefault() {
            Profile candidate = createProfile(UUID.randomUUID(), "Match", "Paris");

            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(currentUserProfile));
            when(profileRepository.findMatchingCandidates(any(), any()))
                    .thenReturn(List.of(candidate));
            when(scoringEngine.isHardIncompatible(any(), any())).thenReturn(false);
            when(scoringEngine.calculateCompatibility(any(), any()))
                    .thenReturn(createScore(80.0));
            when(profileMapper.toResponseDTO(candidate))
                    .thenReturn(createProfileDTO(candidate));

            MatchesListResponseDTO result = matchService.findMatchesForUser(
                    currentUserId, 10, 0.0, "fr"
            );

            assertThat(result.matches().get(0).explanation()).isNull();
        }
    }

    // ============================================================
    // getMatchWith()
    // ============================================================

    @Nested
    @DisplayName("getMatchWith()")
    class GetMatchWith {

        @Test
        @DisplayName("Renvoie le match calcule avec un user donne")
        void shouldReturnCalculatedMatch() {
            UUID otherId = UUID.randomUUID();
            Profile other = createProfile(otherId, "Ayoub", "Paris");

            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(currentUserProfile));
            when(profileRepository.findByUserIdAndIsActiveTrue(otherId))
                    .thenReturn(Optional.of(other));
            when(scoringEngine.calculateCompatibility(currentUserProfile, other))
                    .thenReturn(createScore(87.5));
            when(profileMapper.toResponseDTO(other))
                    .thenReturn(createProfileDTO(other));

            MatchResponseDTO result = matchService.getMatchWith(currentUserId, otherId);

            assertThat(result.totalScore()).isEqualTo(87.5);
            assertThat(result.profile().fullName()).isEqualTo("Ayoub");
        }

        @Test
        @DisplayName("Throw si l'user courant n'a pas de profil")
        void shouldThrowIfCurrentUserHasNoProfile() {
            UUID otherId = UUID.randomUUID();

            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    matchService.getMatchWith(currentUserId, otherId)
            ).isInstanceOf(ProfileNotFoundException.class);
        }

        @Test
        @DisplayName("Throw si l'autre user n'a pas de profil")
        void shouldThrowIfOtherUserHasNoProfile() {
            UUID otherId = UUID.randomUUID();

            when(profileRepository.findByUserIdAndIsActiveTrue(currentUserId))
                    .thenReturn(Optional.of(currentUserProfile));
            when(profileRepository.findByUserIdAndIsActiveTrue(otherId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    matchService.getMatchWith(currentUserId, otherId)
            ).isInstanceOf(ProfileNotFoundException.class);
        }
    }
}