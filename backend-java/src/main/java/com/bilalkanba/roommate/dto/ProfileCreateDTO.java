package com.bilalkanba.roommate.dto;

import com.bilalkanba.roommate.model.enums.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

/**
 * ProfileCreateDTO v2 - Validation permissive alignee sur backend Python.
 *
 * PHILOSOPHIE :
 * Seuls les champs VRAIMENT indispensables sont obligatoires.
 * Les autres ont des defaults ou sont optionnels (peuvent etre completes plus tard).
 *
 * CHAMPS OBLIGATOIRES (5 seulement) :
 * - fullName
 * - age
 * - targetCity
 * - budgetMinEur
 * - budgetMaxEur
 * - moveInDate
 *
 * TOUT le reste : optionnel avec valeurs sensees par defaut cote Mapper.
 */
public record ProfileCreateDTO(

        // ============= REQUIRED =============

        @NotBlank(message = "Le nom complet est obligatoire")
        @Size(min = 2, max = 100)
        String fullName,

        @NotNull(message = "L'age est obligatoire")
        @Min(value = 18, message = "L'age minimum est 18 ans")
        @Max(value = 99, message = "L'age maximum est 99 ans")
        Integer age,

        @NotBlank(message = "La ville cible est obligatoire")
        @Size(max = 100)
        String targetCity,

        @NotNull @Min(0) Integer budgetMinEur,
        @NotNull @Min(0) Integer budgetMaxEur,

        @NotNull(message = "La date d'emmenagement est obligatoire")
        LocalDate moveInDate,

        // ============= OPTIONAL - basic info =============

        Gender gender,

        @Size(max = 2000)
        String bio,

        String photoUrl,
        String avatarUrl,

        // ============= OPTIONAL - location & budget =============

        @Size(max = 100) String targetCountry,
        @Size(max = 100) String district,

        @Min(0) @Max(500)
        Integer searchRadiusKm,

        @Min(1) @Max(60)
        Integer leaseDurationMonths,

        // ============= OPTIONAL - 7 lifestyle dimensions =============

        LifestyleLevel cleanliness,
        SleepSchedule sleepSchedule,
        SocialLevel socialLevel,
        LifestyleLevel noiseTolerance,
        SmokingPreference smoking,
        PetsPreference pets,
        LifestyleLevel guestsFrequency,

        // ============= OPTIONAL - roommate preferences =============

        PreferredGender preferredGender,
        HousingType housingType,

        @Min(18) @Max(99)
        Integer preferredAgeMin,

        @Min(18) @Max(99)
        Integer preferredAgeMax,

        MaxRoommates maxRoommates,

        // ============= OPTIONAL - about you =============

        WorkType workType,
        HomePresence homePresence,
        Diet diet,

        // ============= OPTIONAL - personality =============

        List<String> hobbies,

        @Size(max = 2000) String lookingFor,
        @Size(max = 2000) String dealbreakers,

        // ============= OPTIONAL - social =============

        @Size(max = 200) String linkedinUrl,
        @Size(max = 50) String instagramHandle,

        // ============= OPTIONAL - extras =============

        List<String> languagesSpoken,
        @Size(max = 100) String occupation,
        @Size(max = 30) String whatsappNumber

) {}