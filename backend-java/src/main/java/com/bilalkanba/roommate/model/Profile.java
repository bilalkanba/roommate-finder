package com.bilalkanba.roommate.model;

import com.bilalkanba.roommate.model.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity Profile - Represente la table 'profiles' dans Postgres.
 *
 * ARCHITECTURE :
 * - @Entity : cette classe est mappee a une table
 * - @Table : precise le nom de la table
 * - @Id : cle primaire (UUID auto-genere)
 *
 * ENUMS POSTGRES :
 * - @Enumerated(EnumType.STRING) : stocker le nom (pas l'ordinal 0,1,2)
 * - @JdbcTypeCode(SqlTypes.NAMED_ENUM) : utiliser le type natif Postgres
 * - columnDefinition : le nom exact du type Postgres
 *
 * TIMESTAMPS :
 * - @CreationTimestamp : rempli auto a l'INSERT
 * - @UpdateTimestamp : rempli auto a chaque UPDATE
 *
 * LOMBOK :
 * - @Getter/@Setter : genere tous les getters/setters
 * - @NoArgsConstructor : constructeur vide (obligatoire pour JPA)
 * - @AllArgsConstructor : constructeur avec tous les champs
 * - @Builder : pattern Builder pour creer des objets fluidement
 */
@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"hobbies", "languagesSpoken"}) // exclure les listes du toString
public class Profile {

    // ============================================================
    // IDENTITY
    // ============================================================

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    // ============================================================
    // BASIC INFO
    // ============================================================

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "gender", nullable = false, columnDefinition = "gender")
    private Gender gender;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    // ============================================================
    // LOCATION & BUDGET
    // ============================================================

    @Column(name = "target_city", nullable = false, length = 100)
    private String targetCity;

    @Column(name = "target_country", nullable = false, length = 100)
    private String targetCountry;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "search_radius_km", nullable = false)
    @Builder.Default
    private Integer searchRadiusKm = 0;

    @Column(name = "budget_min_eur", nullable = false)
    private Integer budgetMinEur;

    @Column(name = "budget_max_eur", nullable = false)
    private Integer budgetMaxEur;

    @Column(name = "move_in_date", nullable = false)
    private LocalDate moveInDate;

    @Column(name = "lease_duration_months", nullable = false)
    private Integer leaseDurationMonths;

    // ============================================================
    // 7 LIFESTYLE DIMENSIONS
    // ============================================================

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "cleanliness", nullable = false, columnDefinition = "lifestylelevel")
    private LifestyleLevel cleanliness;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "sleep_schedule", nullable = false, columnDefinition = "sleepschedule")
    private SleepSchedule sleepSchedule;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "social_level", nullable = false, columnDefinition = "sociallevel")
    private SocialLevel socialLevel;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "noise_tolerance", nullable = false, columnDefinition = "lifestylelevel")
    private LifestyleLevel noiseTolerance;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "smoking", nullable = false, columnDefinition = "smokingpreference")
    private SmokingPreference smoking;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "pets", nullable = false, columnDefinition = "petspreference")
    private PetsPreference pets;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "guests_frequency", nullable = false, columnDefinition = "lifestylelevel")
    private LifestyleLevel guestsFrequency;

    // ============================================================
    // ROOMMATE PREFERENCES (enums avec suffixe _enum)
    // ============================================================

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "preferred_gender", nullable = false, columnDefinition = "preferred_gender_enum")
    @Builder.Default
    private PreferredGender preferredGender = PreferredGender.any;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "housing_type", nullable = false, columnDefinition = "housing_type_enum")
    @Builder.Default
    private HousingType housingType = HousingType.any;

    @Column(name = "preferred_age_min")
    private Integer preferredAgeMin;

    @Column(name = "preferred_age_max")
    private Integer preferredAgeMax;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "max_roommates", columnDefinition = "max_roommates_enum")
    private MaxRoommates maxRoommates;

    // ============================================================
    // ABOUT YOU (enums avec suffixe _enum)
    // ============================================================

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "work_type", columnDefinition = "work_type_enum")
    private WorkType workType;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "home_presence", columnDefinition = "home_presence_enum")
    private HomePresence homePresence;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "diet", columnDefinition = "diet_enum")
    private Diet diet;

    // ============================================================
    // PERSONALITY (arrays Postgres)
    // ============================================================

    // ARRAY(String) : Postgres text[] mappe vers List<String> Java
    @Column(name = "hobbies", nullable = false, columnDefinition = "varchar[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Builder.Default
    private List<String> hobbies = new ArrayList<>();

    @Column(name = "looking_for", columnDefinition = "TEXT")
    private String lookingFor;

    @Column(name = "dealbreakers", columnDefinition = "TEXT")
    private String dealbreakers;

    // ============================================================
    // SOCIAL
    // ============================================================

    @Column(name = "linkedin_url", length = 200)
    private String linkedinUrl;

    @Column(name = "instagram_handle", length = 50)
    private String instagramHandle;

    // ============================================================
    // EXTRAS
    // ============================================================

    @Column(name = "languages_spoken", nullable = false, columnDefinition = "varchar[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Builder.Default
    private List<String> languagesSpoken = new ArrayList<>();

    @Column(name = "occupation", length = 100)
    private String occupation;

    @Column(name = "whatsapp_number", length = 30)
    private String whatsappNumber;

    // ============================================================
    // STATE
    // ============================================================

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // ============================================================
    // TIMESTAMPS (rempli automatiquement par Hibernate)
    // ============================================================

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // ============================================================
    // LIFECYCLE CALLBACKS
    // ============================================================

    /**
     * Genere un UUID avant l'insertion si aucun n'est fourni.
     * @PrePersist est appele par JPA juste avant l'INSERT SQL.
     */
    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}