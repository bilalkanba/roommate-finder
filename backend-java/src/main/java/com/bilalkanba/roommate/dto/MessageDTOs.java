package com.bilalkanba.roommate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTOs Message - tous dans un seul fichier pour simplicite.
 * Java autorise plusieurs records dans un fichier tant qu'un seul est public.
 */
public class MessageDTOs {

    private MessageDTOs() {} // utility class

    // ============================================================
    // POST /messages - Envoyer un message
    // ============================================================

    public record MessageCreateDTO(
            @NotNull(message = "to_user_id obligatoire")
            UUID toUserId,

            @NotBlank(message = "Le contenu ne peut etre vide")
            @Size(min = 1, max = 2000, message = "Contenu entre 1 et 2000 caracteres")
            String content
    ) {}

    // ============================================================
    // Reponse pour un message individuel
    // ============================================================

    public record MessageResponseDTO(
            UUID id,
            UUID fromUserId,
            UUID toUserId,
            String content,
            OffsetDateTime createdAt,
            OffsetDateTime readAt
    ) {}

    // ============================================================
    // GET /messages/conversations - Liste des conversations
    // ============================================================

    /**
     * Une conversation dans la liste : dernier message + interlocuteur + nb non-lus.
     */
    public record ConversationSummaryDTO(
            UUID partnerId,             // l'autre user
            MessageResponseDTO lastMessage,
            long unreadCount
    ) {}

    public record ConversationsListDTO(
            List<ConversationSummaryDTO> conversations,
            long totalUnreadCount
    ) {}

    // ============================================================
    // GET /messages/conversation/{userId} - Une conversation
    // ============================================================

    public record ConversationDTO(
            UUID partnerId,
            List<MessageResponseDTO> messages
    ) {}

    // ============================================================
    // GET /messages/unread-count - Compteur global non lus
    // ============================================================

    public record UnreadCountDTO(
            long count
    ) {}
}