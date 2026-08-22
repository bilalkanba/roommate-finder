package com.bilalkanba.roommate.repository;

import com.bilalkanba.roommate.model.Profile;
import com.bilalkanba.roommate.model.enums.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace.NONE;

/**
 * Tests d'integration ProfileRepository avec Testcontainers Postgres.
 *
 * FONCTIONNEMENT :
 * - @ActiveProfiles("test") active application-test.yml qui force ddl-auto=create-drop
 * - Un vrai Postgres 15 dans Docker
 * - Hibernate cree le schema au demarrage (les tables et enums)
 * - Chaque test est @Transactional (rollback auto -> pas besoin de @BeforeEach cleanUp)
 */
@DataJpaTest
@Testcontainers
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = NONE)
@DisplayName("ProfileRepository - Tests d'integration Postgres")
class ProfileRepositoryIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("test_db")
            .withUsername("test_user")
            .withPassword("test_pass");

    @Autowired
    private ProfileRepository profileRepository;

    // ============================================================
    // Helper
    // ============================================================

    private Profile createTestProfile(UUID userId, String fullName, String city) {
        return Profile.builder()
                .userId(userId)
                .fullName(fullName)
                .age(25)
                .gender(Gender.male)
                .targetCity(city)
                .targetCountry("France")
                .budgetMinEur(500)
                .budgetMaxEur(800)
                .moveInDate(LocalDate.of(2026, 9, 1))
                .cleanliness(LifestyleLevel.medium)
                .sleepSchedule(SleepSchedule.normal)
                .socialLevel(SocialLevel.balanced)
                .noiseTolerance(LifestyleLevel.medium)
                .smoking(SmokingPreference.no_smoking)
                .pets(PetsPreference.no_pets)
                .guestsFrequency(LifestyleLevel.medium)
                .preferredGender(PreferredGender.any)
                .housingType(HousingType.any)
                .hobbies(List.of())
                .languagesSpoken(List.of())
                .isActive(true)
                .build();
    }

    // ============================================================
    // TESTS
    // ============================================================

    @Test
    @DisplayName("save() persiste un profil et genere un UUID")
    void save_shouldPersistAndGenerateId() {
        Profile profile = createTestProfile(UUID.randomUUID(), "Bilal Kanba", "Paris");

        Profile saved = profileRepository.save(profile);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getFullName()).isEqualTo("Bilal Kanba");
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("findByUserId() retourne le profil s'il existe")
    void findByUserId_whenExists_returnsProfile() {
        UUID userId = UUID.randomUUID();
        profileRepository.save(createTestProfile(userId, "Ayoub", "Paris"));

        Optional<Profile> found = profileRepository.findByUserId(userId);

        assertThat(found).isPresent();
        assertThat(found.get().getFullName()).isEqualTo("Ayoub");
    }

    @Test
    @DisplayName("findByUserId() retourne Optional.empty() si absent")
    void findByUserId_whenAbsent_returnsEmpty() {
        Optional<Profile> found = profileRepository.findByUserId(UUID.randomUUID());

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("existsByUserId() retourne le bon boolean")
    void existsByUserId_shouldReturnCorrectBoolean() {
        UUID userId = UUID.randomUUID();
        profileRepository.save(createTestProfile(userId, "Test", "Paris"));

        assertThat(profileRepository.existsByUserId(userId)).isTrue();
        assertThat(profileRepository.existsByUserId(UUID.randomUUID())).isFalse();
    }

    @Test
    @DisplayName("findByUserIdAndIsActiveTrue() ignore les profils inactifs")
    void findByUserIdAndIsActiveTrue_shouldIgnoreInactive() {
        UUID userId = UUID.randomUUID();
        Profile profile = createTestProfile(userId, "Test", "Paris");
        profile.setIsActive(false);
        profileRepository.save(profile);

        Optional<Profile> found = profileRepository.findByUserIdAndIsActiveTrue(userId);

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("findMatchingCandidates() exclut l'user courant")
    void findMatchingCandidates_shouldExcludeCurrentUser() {
        UUID meId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();

        profileRepository.save(createTestProfile(meId, "Me", "Paris"));
        profileRepository.save(createTestProfile(otherId, "Other", "Paris"));

        List<Profile> candidates = profileRepository.findMatchingCandidates(meId, "Paris");

        assertThat(candidates).hasSize(1);
        assertThat(candidates.get(0).getUserId()).isEqualTo(otherId);
    }

    @Test
    @DisplayName("findMatchingCandidates() filtre par ville (case-insensitive)")
    void findMatchingCandidates_shouldFilterByCity() {
        profileRepository.save(createTestProfile(UUID.randomUUID(), "Paris user", "Paris"));
        profileRepository.save(createTestProfile(UUID.randomUUID(), "Lyon user", "Lyon"));
        profileRepository.save(createTestProfile(UUID.randomUUID(), "Paris user 2", "PARIS"));

        List<Profile> candidates = profileRepository.findMatchingCandidates(
                UUID.randomUUID(), "paris"
        );

        assertThat(candidates).hasSize(2);
        assertThat(candidates).allSatisfy(p ->
                assertThat(p.getTargetCity().toLowerCase()).isEqualTo("paris")
        );
    }

    @Test
    @DisplayName("findMatchingCandidates() ignore les profils inactifs")
    void findMatchingCandidates_shouldIgnoreInactive() {
        Profile activeProfile = createTestProfile(UUID.randomUUID(), "Active", "Paris");
        Profile inactiveProfile = createTestProfile(UUID.randomUUID(), "Inactive", "Paris");
        inactiveProfile.setIsActive(false);

        profileRepository.save(activeProfile);
        profileRepository.save(inactiveProfile);

        List<Profile> candidates = profileRepository.findMatchingCandidates(
                UUID.randomUUID(), "Paris"
        );

        assertThat(candidates).hasSize(1);
        assertThat(candidates.get(0).getFullName()).isEqualTo("Active");
    }

    @Test
    @DisplayName("Update via setter puis save() persiste les changements")
    void update_shouldPersistChanges() {
        Profile profile = profileRepository.save(
                createTestProfile(UUID.randomUUID(), "Original", "Paris")
        );

        profile.setFullName("Updated Name");
        profile.setAge(30);
        profileRepository.save(profile);

        Profile reloaded = profileRepository.findById(profile.getId()).orElseThrow();
        assertThat(reloaded.getFullName()).isEqualTo("Updated Name");
        assertThat(reloaded.getAge()).isEqualTo(30);
    }

    @Test
    @DisplayName("Les arrays Postgres (hobbies, languages) sont bien persistes")
    void arraysShouldPersistCorrectly() {
        Profile profile = createTestProfile(UUID.randomUUID(), "Test", "Paris");
        profile.setHobbies(List.of("sport", "cinema", "lecture"));
        profile.setLanguagesSpoken(List.of("FR", "EN", "AR"));

        Profile saved = profileRepository.save(profile);

        Profile reloaded = profileRepository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getHobbies()).containsExactly("sport", "cinema", "lecture");
        assertThat(reloaded.getLanguagesSpoken()).containsExactly("FR", "EN", "AR");
    }

    @Test
    @DisplayName("Les enums Postgres (gender, diet) sont bien persistes")
    void enumsShouldPersistCorrectly() {
        Profile profile = createTestProfile(UUID.randomUUID(), "Test", "Paris");
        profile.setGender(Gender.female);
        profile.setDiet(Diet.vegan);
        profile.setSmoking(SmokingPreference.indoor_ok);

        Profile saved = profileRepository.save(profile);

        Profile reloaded = profileRepository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getGender()).isEqualTo(Gender.female);
        assertThat(reloaded.getDiet()).isEqualTo(Diet.vegan);
        assertThat(reloaded.getSmoking()).isEqualTo(SmokingPreference.indoor_ok);
    }
}