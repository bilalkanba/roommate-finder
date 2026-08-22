package com.bilalkanba.roommate.dto;

import com.bilalkanba.roommate.model.enums.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO pour METTRE A JOUR partiellement un profil (PATCH /profiles/me).
 *
 * DIFFERENCE avec CreateDTO :
 * - TOUS les champs sont OPTIONNELS (pas de @NotNull / @NotBlank)
 * - Seuls les champs fournis seront modifies (partial update)
 * - Les validations de format restent (@Size, @Min, @Max)
 *   pour eviter d'inserer des valeurs invalides
 *
 * COMPORTEMENT ATTENDU dans le Service :
 * Si un champ est null dans le DTO, on ne touche pas a la valeur en DB.
 * Si un champ est fourni (meme "" pour effacer), on met a jour la DB.
 */
public record ProfileUpdateDTO(

        @Size(min = 2, max = 100)
        String fullName,

        @Min(18) @Max(99)
        Integer age,

        Gender gender,

        @Size(max = 2000)
        String bio,

        String photoUrl,
        String avatarUrl,

        // Location & budget
        @Size(max = 100) String targetCity,
        @Size(max = 100) String targetCountry,
        @Size(max = 100) String district,

        @Min(0) @Max(500)
        Integer searchRadiusKm,

        @Min(0) Integer budgetMinEur,
        @Min(0) Integer budgetMaxEur,

        LocalDate moveInDate,

        @Min(1) @Max(60)
        Integer leaseDurationMonths,

        // Lifestyle
        LifestyleLevel cleanliness,
        SleepSchedule sleepSchedule,
        SocialLevel socialLevel,
        LifestyleLevel noiseTolerance,
        SmokingPreference smoking,
        PetsPreference pets,
        LifestyleLevel guestsFrequency,

        // Preferences
        PreferredGender preferredGender,
        HousingType housingType,

        @Min(18) @Max(99)
        Integer preferredAgeMin,

        @Min(18) @Max(99)
        Integer preferredAgeMax,

        MaxRoommates maxRoommates,

        // About
        WorkType workType,
        HomePresence homePresence,
        Diet diet,

        // Personality
        List<String> hobbies,

        @Size(max = 2000) String lookingFor,
        @Size(max = 2000) String dealbreakers,

        // Social
        @Size(max = 200) String linkedinUrl,
        @Size(max = 50) String instagramHandle,

        // Extras
        List<String> languagesSpoken,
        @Size(max = 100) String occupation,
        @Size(max = 30) String whatsappNumber

) {}