package com.bilalkanba.roommate.service;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;

/**
 * OpenAIService - Client HTTP pour appeler l'API OpenAI.
 *
 * FONCTIONNEMENT :
 * On utilise WebClient (reactive, non-blocking) mais on appelle .block()
 * pour rendre l'API synchrone (plus simple pour ce cas d'usage).
 *
 * SECURITE :
 * La cle API est injectee depuis application.yml (qui la lit du .env).
 * Jamais hardcodee dans le code.
 *
 * MODEL :
 * gpt-4o-mini - le meilleur rapport qualite/prix pour du texte simple.
 * ~10x moins cher que gpt-4o, largement suffisant pour des explanations.
 */
@Service
@Slf4j
public class OpenAIService {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(15);

    private final WebClient webClient;
    private final String apiKey;
    private final String model;

    public OpenAIService(
            @Value("${app.openai.api-key}") String apiKey,
            @Value("${app.openai.model:gpt-4o-mini}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.webClient = WebClient.builder()
                .baseUrl(OPENAI_API_URL)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    /**
     * Envoie un prompt a OpenAI et retourne la reponse texte.
     *
     * @param systemPrompt Le "role" du modele (ex: "You are a matching expert")
     * @param userPrompt   La question/instruction
     * @param temperature  0.0 = deterministe, 1.0 = creatif (0.7 recommande)
     * @return Le texte genere par OpenAI
     * @throws RuntimeException si l'API echoue ou timeout
     */
    public String generateCompletion(String systemPrompt, String userPrompt, double temperature) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("OpenAI API key not configured, returning fallback");
            return "OpenAI non configure. Cle API manquante.";
        }

        log.debug("Calling OpenAI with model {} (temperature={})", model, temperature);

        try {
            ChatRequest request = new ChatRequest(
                    model,
                    List.of(
                            new ChatMessage("system", systemPrompt),
                            new ChatMessage("user", userPrompt)
                    ),
                    temperature,
                    500  // max tokens
            );

            ChatResponse response = webClient.post()
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ChatResponse.class)
                    .timeout(REQUEST_TIMEOUT)
                    .block();

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                log.error("OpenAI returned empty response");
                return "Impossible de generer l'explication pour le moment.";
            }

            String content = response.choices().get(0).message().content();
            log.debug("OpenAI response received ({} chars)", content.length());
            return content.trim();

        } catch (Exception e) {
            log.error("OpenAI call failed", e);
            return "L'explication IA est temporairement indisponible.";
        }
    }

    // ============================================================
    // DTOs internes pour serialiser/deserialiser JSON OpenAI
    // ============================================================

    /**
     * Request body pour POST /chat/completions
     * JsonInclude.NON_NULL : ignore les champs null dans le JSON
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private record ChatRequest(
            String model,
            List<ChatMessage> messages,
            double temperature,
            @JsonProperty("max_tokens") Integer maxTokens
    ) {}

    private record ChatMessage(
            String role,
            String content
    ) {}

    /**
     * Response body de OpenAI (on ne mappe que ce qui nous interesse)
     */
    private record ChatResponse(
            List<Choice> choices
    ) {}

    private record Choice(
            ChatMessage message
    ) {}
}