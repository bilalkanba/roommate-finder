package com.bilalkanba.roommate.repository;

import com.bilalkanba.roommate.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * ProfileRepository - Interface d'acces aux donnees pour les Profile.
 *
 * NOUVEAU pour Session 3 :
 * - findMatchingCandidates() : pre-filtrer via SQL les candidats potentiels
 *   (meme ville, actifs, exclure l'user courant) -> reduit dratiquement
 *   le nombre de profils a scorer.
 */
@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    Optional<Profile> findByUserIdAndIsActiveTrue(UUID userId);

    Optional<Profile> findByIdAndIsActiveTrue(UUID id);

    List<Profile> findByIsActiveTrue();

    List<Profile> findByTargetCityAndIsActiveTrue(String targetCity);

    long countByTargetCountry(String targetCountry);

    // ============================================================
    // NOUVEAU : Pre-filter les candidats pour le matching
    // ============================================================

    /**
     * Recupere les candidats potentiels pour le matching.
     *
     * PRE-FILTRES en SQL (optimisation) :
     * - is_active = true
     * - user_id != l'user courant (pas de match avec soi-meme)
     * - target_city = meme ville
     *
     * On garde les autres verifications (budget, dates, genre) pour le
     * scoring engine cote Java, car SQL serait complexe pour tout couvrir.
     *
     * JPQL : on utilise les noms Java (userId, isActive, targetCity)
     */
    @Query("""
        SELECT p FROM Profile p
        WHERE p.isActive = true
          AND p.userId <> :excludeUserId
          AND LOWER(p.targetCity) = LOWER(:city)
    """)
    List<Profile> findMatchingCandidates(
            @Param("excludeUserId") UUID excludeUserId,
            @Param("city") String city
    );
}