package com.bilalkanba.roommate.repository;

import com.bilalkanba.roommate.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * MessageRepository - queries custom pour la messagerie.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    /**
     * Recupere tous les messages d'une conversation entre 2 users,
     * dans l'ordre chronologique (plus ancien en premier).
     */
    @Query("""
        SELECT m FROM Message m
        WHERE (m.fromUserId = :userA AND m.toUserId = :userB)
           OR (m.fromUserId = :userB AND m.toUserId = :userA)
        ORDER BY m.createdAt ASC
    """)
    List<Message> findConversation(
            @Param("userA") UUID userA,
            @Param("userB") UUID userB
    );

    /**
     * Recupere le dernier message avec chaque interlocuteur (pour la liste conversations).
     * On utilise une query native car JPQL ne supporte pas bien DISTINCT ON.
     */
    @Query(value = """
        SELECT DISTINCT ON (partner_id) *
        FROM (
            SELECT
                CASE
                    WHEN from_user_id = :userId THEN to_user_id
                    ELSE from_user_id
                END AS partner_id,
                id, from_user_id, to_user_id, content, created_at, read_at
            FROM messages
            WHERE from_user_id = :userId OR to_user_id = :userId
        ) sub
        ORDER BY partner_id, created_at DESC
    """, nativeQuery = true)
    List<Message> findLatestMessagePerConversation(@Param("userId") UUID userId);

    /**
     * Compte le nombre de messages non lus adresses a un user.
     */
    @Query("""
        SELECT COUNT(m) FROM Message m
        WHERE m.toUserId = :userId AND m.readAt IS NULL
    """)
    long countUnreadForUser(@Param("userId") UUID userId);

    /**
     * Compte les messages non lus par conversation (par expediteur).
     */
    @Query("""
        SELECT m.fromUserId, COUNT(m) FROM Message m
        WHERE m.toUserId = :userId AND m.readAt IS NULL
        GROUP BY m.fromUserId
    """)
    List<Object[]> countUnreadPerSender(@Param("userId") UUID userId);

    /**
     * Marque comme lus tous les messages non lus d'une conversation.
     *
     * @Modifying est OBLIGATOIRE pour les UPDATE/DELETE en JPQL.
     * Retourne le nombre de lignes affectees.
     */
    @Modifying
    @Query("""
        UPDATE Message m SET m.readAt = :now
        WHERE m.toUserId = :userId AND m.fromUserId = :partnerId AND m.readAt IS NULL
    """)
    int markConversationAsRead(
            @Param("userId") UUID userId,
            @Param("partnerId") UUID partnerId,
            @Param("now") OffsetDateTime now
    );
}