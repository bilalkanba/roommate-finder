package com.bilalkanba.roommate.api;

import com.bilalkanba.roommate.core.CurrentUser;
import com.bilalkanba.roommate.dto.MessageDTOs.*;
import com.bilalkanba.roommate.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * MessageController v2 - URLs alignees sur le frontend React existant.
 *
 * ENDPOINTS (identiques au backend Python) :
 * - POST   /messages                          -> envoyer un message
 * - GET    /messages/conversations            -> liste des conversations
 * - GET    /messages/unread/count             -> compteur non-lus
 * - GET    /messages/unread-count             -> alias legacy (frontend l'utilise peut-etre)
 * - PATCH  /messages/{userId}/read            -> marquer une conversation comme lue
 * - GET    /messages/{userId}                 -> historique conversation avec userId
 *
 * IMPORTANT : l'ordre des routes est CRITIQUE.
 * Les routes STATIQUES doivent etre declarees AVANT /{userId}.
 */
@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;

    // ============================================================
    // POST /messages - Envoyer un message
    // ============================================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponseDTO sendMessage(
            @CurrentUser.Id UUID userId,
            @Valid @RequestBody MessageCreateDTO dto
    ) {
        log.info("POST /messages - from user: {}", userId);
        return messageService.sendMessage(userId, dto);
    }

    // ============================================================
    // GET /messages/conversations - Liste des conversations
    // ROUTE STATIQUE - avant /{userId}
    // ============================================================

    @GetMapping("/conversations")
    public ConversationsListDTO listConversations(@CurrentUser.Id UUID userId) {
        log.debug("GET /messages/conversations - user: {}", userId);
        return messageService.listConversations(userId);
    }

    // ============================================================
    // GET /messages/unread/count - Compteur global
    // ROUTE STATIQUE - avant /{userId}
    // ============================================================

    @GetMapping("/unread/count")
    public UnreadCountDTO getUnreadCount(@CurrentUser.Id UUID userId) {
        log.debug("GET /messages/unread/count - user: {}", userId);
        return messageService.getUnreadCount(userId);
    }

    // Alias legacy si le frontend utilise "unread-count" au lieu de "unread/count"
    @GetMapping("/unread-count")
    public UnreadCountDTO getUnreadCountLegacy(@CurrentUser.Id UUID userId) {
        return messageService.getUnreadCount(userId);
    }

    // ============================================================
    // PATCH /messages/{userId}/read - Marquer comme lu
    // ROUTE SPECIFIQUE (a /read) - avant /{userId} generique
    // ============================================================

    @PatchMapping("/{partnerId}/read")
    public UnreadCountDTO markAsRead(
            @CurrentUser.Id UUID userId,
            @PathVariable UUID partnerId
    ) {
        log.info("PATCH /messages/{}/read - user: {}", partnerId, userId);
        messageService.markConversationAsRead(userId, partnerId);
        return messageService.getUnreadCount(userId);
    }

    // ============================================================
    // GET /messages/{userId} - Historique d'une conversation
    // ROUTE DYNAMIQUE - en dernier
    // ============================================================
    //
    // Query param 'limit' accepte pour compat frontend, mais ignore
    // (le service retourne toujours toute l'historique - pagination a faire plus tard)
    // ============================================================

    @GetMapping("/{partnerId}")
    public ConversationDTO getConversation(
            @CurrentUser.Id UUID userId,
            @PathVariable UUID partnerId,
            @RequestParam(required = false, defaultValue = "100") Integer limit
    ) {
        log.debug("GET /messages/{} - user: {} (limit={})", partnerId, userId, limit);
        return messageService.getConversation(userId, partnerId);
    }
}