package com.bilalkanba.roommate.mapper;

import com.bilalkanba.roommate.dto.ProfileCreateDTO;
import com.bilalkanba.roommate.dto.ProfileResponseDTO;
import com.bilalkanba.roommate.dto.ProfileUpdateDTO;
import com.bilalkanba.roommate.model.Profile;
import com.bilalkanba.roommate.model.enums.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * ProfileMapper v2 - avec defaults sensés pour champs optionnels.
 * Aligne le comportement sur backend Python (permissif a la creation).
 */
@Component
public class ProfileMapper {

    // Helper : retourne value si non-null, sinon defaultValue
    private static <T> T defaultIfNull(T value, T defaultValue) {
        return value != null ? value : defaultValue;
    }

    // ============================================================
    // CREATE : DTO -> Entity
    // ============================================================

    public Profile toEntity(ProfileCreateDTO dto) {
        return Profile.builder()
                // Required
                .fullName(dto.fullName())
                .age(dto.age())
                .targetCity(dto.targetCity())
                .budgetMinEur(dto.budgetMinEur())
                .budgetMaxEur(dto.budgetMaxEur())
                .moveInDate(dto.moveInDate())

                // Optional avec defaults
                .gender(defaultIfNull(dto.gender(), Gender.prefer_not_to_say))
                .bio(dto.bio())
                .photoUrl(dto.photoUrl())
                .avatarUrl(dto.avatarUrl())
                .targetCountry(defaultIfNull(dto.targetCountry(), "France"))
                .district(dto.district())
                .searchRadiusKm(defaultIfNull(dto.searchRadiusKm(), 10))
                .leaseDurationMonths(defaultIfNull(dto.leaseDurationMonths(), 12))

                // Lifestyle avec defaults neutres
                .cleanliness(defaultIfNull(dto.cleanliness(), LifestyleLevel.medium))
                .sleepSchedule(defaultIfNull(dto.sleepSchedule(), SleepSchedule.normal))
                .socialLevel(defaultIfNull(dto.socialLevel(), SocialLevel.balanced))
                .noiseTolerance(defaultIfNull(dto.noiseTolerance(), LifestyleLevel.medium))
                .smoking(defaultIfNull(dto.smoking(), SmokingPreference.no_smoking))
                .pets(defaultIfNull(dto.pets(), PetsPreference.no_pets))
                .guestsFrequency(defaultIfNull(dto.guestsFrequency(), LifestyleLevel.medium))

                // Preferences
                .preferredGender(defaultIfNull(dto.preferredGender(), PreferredGender.any))
                .housingType(defaultIfNull(dto.housingType(), HousingType.any))
                .preferredAgeMin(dto.preferredAgeMin())
                .preferredAgeMax(dto.preferredAgeMax())
                .maxRoommates(dto.maxRoommates())

                // About
                .workType(dto.workType())
                .homePresence(dto.homePresence())
                .diet(dto.diet())

                // Personality
                .hobbies(defaultIfNull(dto.hobbies(), new ArrayList<>()))
                .lookingFor(dto.lookingFor())
                .dealbreakers(dto.dealbreakers())

                // Social
                .linkedinUrl(dto.linkedinUrl())
                .instagramHandle(dto.instagramHandle())

                // Extras
                .languagesSpoken(defaultIfNull(dto.languagesSpoken(), new ArrayList<>()))
                .occupation(dto.occupation())
                .whatsappNumber(dto.whatsappNumber())

                // State
                .isActive(true)
                .build();
    }

    // ============================================================
    // READ : Entity -> ResponseDTO
    // ============================================================

    public ProfileResponseDTO toResponseDTO(Profile entity) {
        return new ProfileResponseDTO(
                entity.getId(),
                entity.getUserId(),
                entity.getFullName(),
                entity.getAge(),
                entity.getGender(),
                entity.getBio(),
                entity.getPhotoUrl(),
                entity.getAvatarUrl(),
                entity.getTargetCity(),
                entity.getTargetCountry(),
                entity.getDistrict(),
                entity.getSearchRadiusKm(),
                entity.getBudgetMinEur(),
                entity.getBudgetMaxEur(),
                entity.getMoveInDate(),
                entity.getLeaseDurationMonths(),
                entity.getCleanliness(),
                entity.getSleepSchedule(),
                entity.getSocialLevel(),
                entity.getNoiseTolerance(),
                entity.getSmoking(),
                entity.getPets(),
                entity.getGuestsFrequency(),
                entity.getPreferredGender(),
                entity.getHousingType(),
                entity.getPreferredAgeMin(),
                entity.getPreferredAgeMax(),
                entity.getMaxRoommates(),
                entity.getWorkType(),
                entity.getHomePresence(),
                entity.getDiet(),
                entity.getHobbies(),
                entity.getLookingFor(),
                entity.getDealbreakers(),
                entity.getLinkedinUrl(),
                entity.getInstagramHandle(),
                entity.getLanguagesSpoken(),
                entity.getOccupation(),
                entity.getWhatsappNumber(),
                entity.getIsActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public List<ProfileResponseDTO> toResponseDTOList(List<Profile> entities) {
        return entities.stream().map(this::toResponseDTO).toList();
    }

    // ============================================================
    // UPDATE (PATCH) : merge partiel
    // ============================================================

    public void updateEntityFromDTO(Profile entity, ProfileUpdateDTO dto) {
        if (dto.fullName() != null) entity.setFullName(dto.fullName());
        if (dto.age() != null) entity.setAge(dto.age());
        if (dto.gender() != null) entity.setGender(dto.gender());
        if (dto.bio() != null) entity.setBio(dto.bio());
        if (dto.photoUrl() != null) entity.setPhotoUrl(dto.photoUrl());
        if (dto.avatarUrl() != null) entity.setAvatarUrl(dto.avatarUrl());
        if (dto.targetCity() != null) entity.setTargetCity(dto.targetCity());
        if (dto.targetCountry() != null) entity.setTargetCountry(dto.targetCountry());
        if (dto.district() != null) entity.setDistrict(dto.district());
        if (dto.searchRadiusKm() != null) entity.setSearchRadiusKm(dto.searchRadiusKm());
        if (dto.budgetMinEur() != null) entity.setBudgetMinEur(dto.budgetMinEur());
        if (dto.budgetMaxEur() != null) entity.setBudgetMaxEur(dto.budgetMaxEur());
        if (dto.moveInDate() != null) entity.setMoveInDate(dto.moveInDate());
        if (dto.leaseDurationMonths() != null) entity.setLeaseDurationMonths(dto.leaseDurationMonths());
        if (dto.cleanliness() != null) entity.setCleanliness(dto.cleanliness());
        if (dto.sleepSchedule() != null) entity.setSleepSchedule(dto.sleepSchedule());
        if (dto.socialLevel() != null) entity.setSocialLevel(dto.socialLevel());
        if (dto.noiseTolerance() != null) entity.setNoiseTolerance(dto.noiseTolerance());
        if (dto.smoking() != null) entity.setSmoking(dto.smoking());
        if (dto.pets() != null) entity.setPets(dto.pets());
        if (dto.guestsFrequency() != null) entity.setGuestsFrequency(dto.guestsFrequency());
        if (dto.preferredGender() != null) entity.setPreferredGender(dto.preferredGender());
        if (dto.housingType() != null) entity.setHousingType(dto.housingType());
        if (dto.preferredAgeMin() != null) entity.setPreferredAgeMin(dto.preferredAgeMin());
        if (dto.preferredAgeMax() != null) entity.setPreferredAgeMax(dto.preferredAgeMax());
        if (dto.maxRoommates() != null) entity.setMaxRoommates(dto.maxRoommates());
        if (dto.workType() != null) entity.setWorkType(dto.workType());
        if (dto.homePresence() != null) entity.setHomePresence(dto.homePresence());
        if (dto.diet() != null) entity.setDiet(dto.diet());
        if (dto.hobbies() != null) entity.setHobbies(dto.hobbies());
        if (dto.lookingFor() != null) entity.setLookingFor(dto.lookingFor());
        if (dto.dealbreakers() != null) entity.setDealbreakers(dto.dealbreakers());
        if (dto.linkedinUrl() != null) entity.setLinkedinUrl(dto.linkedinUrl());
        if (dto.instagramHandle() != null) entity.setInstagramHandle(dto.instagramHandle());
        if (dto.languagesSpoken() != null) entity.setLanguagesSpoken(dto.languagesSpoken());
        if (dto.occupation() != null) entity.setOccupation(dto.occupation());
        if (dto.whatsappNumber() != null) entity.setWhatsappNumber(dto.whatsappNumber());
    }
}