package com.bilalkanba.roommate.api;

import com.bilalkanba.roommate.core.CurrentUser;
import com.bilalkanba.roommate.dto.ProfileCreateDTO;
import com.bilalkanba.roommate.dto.ProfileResponseDTO;
import com.bilalkanba.roommate.dto.ProfileUpdateDTO;
import com.bilalkanba.roommate.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * ProfileController - Endpoints REST pour la gestion des profils.
 *
 * URL BASE : /api/v1/profiles
 *
 * ENDPOINTS :
 * - POST   /profiles              → creer son profil
 * - GET    /profiles/me           → recuperer son profil
 * - PATCH  /profiles/me           → mettre a jour son profil
 * - DELETE /profiles/me           → desactiver son profil
 * - GET    /profiles/by-user/{userId} → recuperer un profil par user_id
 * - GET    /profiles/{profileId}  → recuperer un profil par profile_id
 *
 * IMPORTANT : les routes STATIQUES (/by-user/{id}) sont declarees AVANT
 * les routes DYNAMIQUES (/{id}) pour eviter les conflits de matching.
 *
 * SECURITE :
 * Tous les endpoints necessitent un JWT valide (via Spring Security).
 * Le userId est extrait du JWT via @CurrentUser.Id, JAMAIS du body.
 */
@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final ProfileService profileService;

    // ============================================================
    // POST /api/v1/profiles - Creer son profil
    // ============================================================

    /**
     * Cree un profil pour l'utilisateur authentifie.
     *
     * @param userId Extrait automatiquement du JWT
     * @param dto    Payload valide via @Valid
     * @return 201 Created + le profil cree
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)  // Status 201 par defaut
    public ProfileResponseDTO createProfile(
            @CurrentUser.Id UUID userId,
            @Valid @RequestBody ProfileCreateDTO dto
    ) {
        log.info("POST /profiles - user: {}", userId);
        return profileService.createProfile(userId, dto);
    }

    // ============================================================
    // GET /api/v1/profiles/me - Mon profil
    // ============================================================

    @GetMapping("/me")
    public ProfileResponseDTO getMyProfile(@CurrentUser.Id UUID userId) {
        log.debug("GET /profiles/me - user: {}", userId);
        return profileService.getMyProfile(userId);
    }

    // ============================================================
    // PATCH /api/v1/profiles/me - Update mon profil
    // ============================================================

    @PatchMapping("/me")
    public ProfileResponseDTO updateMyProfile(
            @CurrentUser.Id UUID userId,
            @Valid @RequestBody ProfileUpdateDTO dto
    ) {
        log.info("PATCH /profiles/me - user: {}", userId);
        return profileService.updateMyProfile(userId, dto);
    }

    // ============================================================
    // DELETE /api/v1/profiles/me - Desactiver mon profil
    // ============================================================

    /**
     * Desactive le profil (soft delete).
     * Retourne 204 No Content (pas de body).
     */
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateMyProfile(@CurrentUser.Id UUID userId) {
        log.info("DELETE /profiles/me - user: {}", userId);
        profileService.deactivateMyProfile(userId);
    }

    // ============================================================
    // GET /api/v1/profiles/by-user/{userId} - Par user_id Supabase
    // ============================================================
    //
    // ATTENTION : cette route DOIT etre declaree AVANT /{profileId}
    // pour eviter que /by-user soit matche comme un UUID.
    // ============================================================

    @GetMapping("/by-user/{userId}")
    public ProfileResponseDTO getProfileByUserId(
            @PathVariable UUID userId,
            @CurrentUser.Id UUID currentUserId  // Auth requise (mais on ne l'utilise pas ici)
    ) {
        log.debug("GET /profiles/by-user/{} - by user: {}", userId, currentUserId);
        return profileService.getProfileByUserId(userId);
    }

    // ============================================================
    // GET /api/v1/profiles/{profileId} - Par profile_id
    // ============================================================

    @GetMapping("/{profileId}")
    public ProfileResponseDTO getProfileById(
            @PathVariable UUID profileId,
            @CurrentUser.Id UUID currentUserId  // Auth requise
    ) {
        log.debug("GET /profiles/{} - by user: {}", profileId, currentUserId);
        return profileService.getProfileById(profileId);
    }
}