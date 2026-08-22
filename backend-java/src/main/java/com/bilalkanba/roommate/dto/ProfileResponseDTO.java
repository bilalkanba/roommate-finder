package com.bilalkanba.roommate.dto;

import com.bilalkanba.roommate.model.enums.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO pour RETOURNER un profil au frontend (GET /profiles/*).
 *
 * ROLE :
 * C'est ce que le frontend recoit en JSON. Il DOIT match exactement
 * ce que le frontend React attend (les noms de champs sont serialises
 * tels quels par Jackson).
 *
 * DIFFERENCE avec l'Entity :
 * - Pas de logique metier
 * - Pas de champs sensibles (password, tokens...)
 * - Peut aggreger des donnees calculees (age_group, compatibility_score...)
 * - Ne contient QUE ce dont le frontend a besoin
 *
 * IMPORTANT :
 * Les noms des champs sont serialises en JSON tels quels.
 * Ex: fullName -> "fullName" dans le JSON.
 * Si le frontend attend "full_name" (snake_case), on peut soit :
 *   1. Renommer ici les champs en snake_case
 *   2. Configurer Jackson avec @JsonProperty("full_name")
 *   3. Configurer Jackson global : PropertyNamingStrategies.SNAKE_CASE
 *
 * Ici on garde camelCase Java standard.
 */
public record ProfileResponseDTO(

        UUID id,
        UUID userId,

        // Basic info
        String fullName,
        Integer age,
        Gender gender,
        String bio,
        String photoUrl,
        String avatarUrl,

        // Location & budget
        String targetCity,
        String targetCountry,
        String district,
        Integer searchRadiusKm,
        Integer budgetMinEur,
        Integer budgetMaxEur,
        LocalDate moveInDate,
        Integer leaseDurationMonths,

        // 7 lifestyle dimensions
        LifestyleLevel cleanliness,
        SleepSchedule sleepSchedule,
        SocialLevel socialLevel,
        LifestyleLevel noiseTolerance,
        SmokingPreference smoking,
        PetsPreference pets,
        LifestyleLevel guestsFrequency,

        // Roommate preferences
        PreferredGender preferredGender,
        HousingType housingType,
        Integer preferredAgeMin,
        Integer preferredAgeMax,
        MaxRoommates maxRoommates,

        // About
        WorkType workType,
        HomePresence homePresence,
        Diet diet,

        // Personality
        List<String> hobbies,
        String lookingFor,
        String dealbreakers,

        // Social
        String linkedinUrl,
        String instagramHandle,

        // Extras
        List<String> languagesSpoken,
        String occupation,
        String whatsappNumber,

        // State
        Boolean isActive,

        // Timestamps
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt

) {}