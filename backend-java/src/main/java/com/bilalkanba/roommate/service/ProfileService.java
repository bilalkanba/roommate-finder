package com.bilalkanba.roommate.service;

import com.bilalkanba.roommate.dto.ProfileCreateDTO;
import com.bilalkanba.roommate.dto.ProfileResponseDTO;
import com.bilalkanba.roommate.dto.ProfileUpdateDTO;
import com.bilalkanba.roommate.exception.ProfileAlreadyExistsException;
import com.bilalkanba.roommate.exception.ProfileNotFoundException;
import com.bilalkanba.roommate.mapper.ProfileMapper;
import com.bilalkanba.roommate.model.Profile;
import com.bilalkanba.roommate.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * ProfileService - Business logic pour les profils.
 *
 * ARCHITECTURE :
 * - Situe entre le Controller (couche web) et le Repository (couche DB)
 * - Contient les regles metier : validations complexes, orchestrations
 * - Utilise le Mapper pour convertir Entity <-> DTO
 * - Utilise @Transactional pour gerer l'atomicite
 *
 * INJECTIONS :
 * @RequiredArgsConstructor (Lombok) genere le constructor avec tous
 * les champs 'final'. Spring injecte les beans automatiquement.
 *
 * LOGGING :
 * @Slf4j (Lombok) genere un logger "log" automatique.
 * Usage : log.info(...), log.error(...), log.debug(...)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)  // Default : read-only, override pour les writes
public class ProfileService {

    // Constructor injection via Lombok @RequiredArgsConstructor
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    // ============================================================
    // CREATE
    // ============================================================

    /**
     * Cree un nouveau profil pour l'utilisateur authentifie.
     *
     * REGLES METIER :
     * - Un user ne peut avoir qu'UN SEUL profil (contrainte unique sur user_id)
     * - Si un profil existe deja pour ce user, on leve une exception 409
     *
     * @param userId L'UUID Supabase Auth de l'utilisateur courant
     * @param dto    Les donnees du profil a creer
     * @return Le profil cree
     * @throws ProfileAlreadyExistsException si un profil existe deja
     */
    @Transactional  // Override readOnly=false car on ecrit
    public ProfileResponseDTO createProfile(UUID userId, ProfileCreateDTO dto) {
        log.info("Creating profile for user {}", userId);

        // 1. Verifier l'unicite (regle metier)
        if (profileRepository.existsByUserId(userId)) {
            log.warn("Profile already exists for user {}", userId);
            throw new ProfileAlreadyExistsException(
                    "Un profil existe deja pour cet utilisateur"
            );
        }

        // 2. Mapper DTO -> Entity
        Profile profile = profileMapper.toEntity(dto);

        // 3. Assigner le user_id (vient du JWT, pas du DTO !)
        profile.setUserId(userId);

        // 4. Sauver en DB (Hibernate genere l'INSERT)
        Profile saved = profileRepository.save(profile);
        log.info("Profile created with id {} for user {}", saved.getId(), userId);

        // 5. Mapper Entity -> ResponseDTO
        return profileMapper.toResponseDTO(saved);
    }

    // ============================================================
    // READ
    // ============================================================

    /**
     * Recupere le profil de l'utilisateur courant.
     *
     * @param userId L'UUID Supabase Auth
     * @return Le profil
     * @throws ProfileNotFoundException si l'utilisateur n'a pas de profil
     */
    public ProfileResponseDTO getMyProfile(UUID userId) {
        log.debug("Fetching profile for user {}", userId);

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Aucun profil trouve pour l'utilisateur : " + userId
                ));

        return profileMapper.toResponseDTO(profile);
    }

    /**
     * Recupere un profil public par son ID (UUID du profil).
     * Ne retourne que les profils actifs.
     */
    public ProfileResponseDTO getProfileById(UUID profileId) {
        log.debug("Fetching profile by id {}", profileId);

        Profile profile = profileRepository.findByIdAndIsActiveTrue(profileId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profil non trouve ou inactif : " + profileId
                ));

        return profileMapper.toResponseDTO(profile);
    }

    /**
     * Recupere un profil par le user_id Supabase Auth.
     * Utilise par la messagerie pour afficher l'avatar/nom.
     * Ne retourne que les profils actifs.
     */
    public ProfileResponseDTO getProfileByUserId(UUID userId) {
        log.debug("Fetching profile by user_id {}", userId);

        Profile profile = profileRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profil non trouve ou inactif pour user : " + userId
                ));

        return profileMapper.toResponseDTO(profile);
    }

    // ============================================================
    // UPDATE (PATCH)
    // ============================================================

    /**
     * Met a jour partiellement le profil de l'utilisateur courant.
     * Seuls les champs non-null dans le DTO sont modifies.
     *
     * DIRTY CHECKING :
     * On modifie l'entity managed via les setters.
     * Hibernate detecte les changements et genere l'UPDATE
     * automatiquement au commit de la transaction.
     * Pas besoin d'appeler save() explicitement.
     */
    @Transactional
    public ProfileResponseDTO updateMyProfile(UUID userId, ProfileUpdateDTO dto) {
        log.info("Updating profile for user {}", userId);

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Aucun profil trouve pour l'utilisateur : " + userId
                ));

        // Le Mapper mute l'entity avec les champs non-null du DTO
        profileMapper.updateEntityFromDTO(profile, dto);

        // Pas besoin de save() explicite : dirty checking d'Hibernate
        // Mais on peut le mettre pour la lisibilite / si on veut le retour
        Profile updated = profileRepository.save(profile);

        log.info("Profile updated for user {}", userId);
        return profileMapper.toResponseDTO(updated);
    }

    // ============================================================
    // DELETE (soft delete)
    // ============================================================

    /**
     * Desactive le profil de l'utilisateur (soft delete).
     * On ne supprime PAS la ligne en DB (historique, RGPD, etc.),
     * on met is_active = false.
     */
    @Transactional
    public void deactivateMyProfile(UUID userId) {
        log.info("Deactivating profile for user {}", userId);

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Aucun profil trouve pour l'utilisateur : " + userId
                ));

        profile.setIsActive(false);
        profileRepository.save(profile);

        log.info("Profile deactivated for user {}", userId);
    }
}