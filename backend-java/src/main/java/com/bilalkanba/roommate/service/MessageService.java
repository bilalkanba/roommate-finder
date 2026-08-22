package com.bilalkanba.roommate.service;

import com.bilalkanba.roommate.dto.MessageDTOs.*;
import com.bilalkanba.roommate.exception.ProfileNotFoundException;
import com.bilalkanba.roommate.model.Message;
import com.bilalkanba.roommate.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * MessageService - business logic pour la messagerie.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;

    // ============================================================
    // SEND - envoyer un message
    // ============================================================

    @Transactional
    public MessageResponseDTO sendMessage(UUID fromUserId, MessageCreateDTO dto) {
        log.info("User {} sending message to {}", fromUserId, dto.toUserId());

        // Validation metier : pas d'auto-message
        if (fromUserId.equals(dto.toUserId())) {
            throw new IllegalArgumentException("Impossible de s'envoyer un message a soi-meme");
        }

        Message message = Message.builder()
                .fromUserId(fromUserId)
                .toUserId(dto.toUserId())
                .content(dto.content().trim())
                .build();

        Message saved = messageRepository.save(message);
        log.info("Message {} sent from {} to {}", saved.getId(), fromUserId, dto.toUserId());

        return toResponseDTO(saved);
    }

    // ============================================================
    // LIST CONVERSATIONS
    // ============================================================

    /**
     * Retourne la liste des conversations de l'utilisateur, avec le dernier
     * message de chacune et le nombre de non-lus.
     */
    public ConversationsListDTO listConversations(UUID userId) {
        log.debug("Listing conversations for user {}", userId);

        // 1. Recuperer le dernier message de chaque conversation
        List<Message> latestPerConv = messageRepository.findLatestMessagePerConversation(userId);

        // 2. Recuperer le count non-lus par expediteur (Map partnerId -> count)
        Map<UUID, Long> unreadPerSender = new HashMap<>();
        for (Object[] row : messageRepository.countUnreadPerSender(userId)) {
            unreadPerSender.put((UUID) row[0], (Long) row[1]);
        }

        // 3. Construire les DTOs de conversation
        List<ConversationSummaryDTO> conversations = latestPerConv.stream()
                .map(msg -> {
                    UUID partnerId = msg.getFromUserId().equals(userId)
                            ? msg.getToUserId()
                            : msg.getFromUserId();

                    long unread = unreadPerSender.getOrDefault(partnerId, 0L);

                    return new ConversationSummaryDTO(partnerId, toResponseDTO(msg), unread);
                })
                // Tri : plus recent en premier
                .sorted(Comparator.comparing(
                        (ConversationSummaryDTO c) -> c.lastMessage().createdAt()
                ).reversed())
                .toList();

        long totalUnread = messageRepository.countUnreadForUser(userId);

        return new ConversationsListDTO(conversations, totalUnread);
    }

    // ============================================================
    // GET CONVERSATION - historique d'une conversation
    // ============================================================

    public ConversationDTO getConversation(UUID userId, UUID partnerId) {
        log.debug("Fetching conversation between {} and {}", userId, partnerId);

        if (userId.equals(partnerId)) {
            throw new IllegalArgumentException("Conversation avec soi-meme impossible");
        }

        List<Message> messages = messageRepository.findConversation(userId, partnerId);

        List<MessageResponseDTO> dtos = messages.stream()
                .map(this::toResponseDTO)
                .toList();

        return new ConversationDTO(partnerId, dtos);
    }

    // ============================================================
    // MARK AS READ
    // ============================================================

    @Transactional
    public int markConversationAsRead(UUID userId, UUID partnerId) {
        log.info("User {} marking conversation with {} as read", userId, partnerId);
        int updated = messageRepository.markConversationAsRead(
                userId, partnerId, OffsetDateTime.now()
        );
        log.debug("Marked {} messages as read", updated);
        return updated;
    }

    // ============================================================
    // UNREAD COUNT
    // ============================================================

    public UnreadCountDTO getUnreadCount(UUID userId) {
        long count = messageRepository.countUnreadForUser(userId);
        return new UnreadCountDTO(count);
    }

    // ============================================================
    // Mapper inline (pas besoin d'une classe dediee pour 5 champs)
    // ============================================================

    private MessageResponseDTO toResponseDTO(Message m) {
        return new MessageResponseDTO(
                m.getId(),
                m.getFromUserId(),
                m.getToUserId(),
                m.getContent(),
                m.getCreatedAt(),
                m.getReadAt()
        );
    }
}