package com.bilalkanba.roommate.service;

import com.bilalkanba.roommate.exception.ProfileNotFoundException;
import com.bilalkanba.roommate.matching.MatchingScore;
import com.bilalkanba.roommate.matching.ScoringEngine;
import com.bilalkanba.roommate.model.Profile;
import com.bilalkanba.roommate.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ExplanationService - Genere des explanations naturelles pour les matches.
 *
 * WORKFLOW :
 * 1. Recupere les 2 profils (moi + candidat)
 * 2. Calcule le score complet
 * 3. Construit un prompt structure avec les points forts/faibles
 * 4. Appelle OpenAI qui genere une explication naturelle
 * 5. Retourne le texte
 *
 * PROMPT ENGINEERING :
 * - System prompt : donne le contexte (tu es un expert coloc)
 * - User prompt : donne les DONNEES (scores, profils) et demande l'analyse
 * - Temperature 0.7 : legerement creatif pour du texte naturel
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ExplanationService {

    private final ProfileRepository profileRepository;
    private final ScoringEngine scoringEngine;
    private final OpenAIService openAIService;

    /**
     * Genere une explanation AI pour un match.
     *
     * @param currentUserId L'user courant (moi)
     * @param otherUserId   L'user cible (le candidat)
     * @param language      Langue de la reponse (fr/en/es/ar)
     * @return Le texte de l'explanation
     */
    public String generateExplanation(UUID currentUserId, UUID otherUserId, String language) {
        log.info("Generating explanation between {} and {} in {}",
                currentUserId, otherUserId, language);

        // 1. Recuperer les 2 profils
        Profile me = profileRepository.findByUserIdAndIsActiveTrue(currentUserId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profil non trouve pour user : " + currentUserId
                ));

        Profile other = profileRepository.findByUserIdAndIsActiveTrue(otherUserId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profil non trouve pour user : " + otherUserId
                ));

        // 2. Calculer le score
        MatchingScore score = scoringEngine.calculateCompatibility(me, other);

        // 3. Construire le prompt
        String systemPrompt = buildSystemPrompt(language);
        String userPrompt = buildUserPrompt(me, other, score, language);

        // 4. Appeler OpenAI
        return openAIService.generateCompletion(systemPrompt, userPrompt, 0.7);
    }

    // ============================================================
    // Prompt building
    // ============================================================

    private String buildSystemPrompt(String language) {
        return switch (language) {
            case "en" -> """
                You are an expert in roommate compatibility analysis.
                Your job is to explain WHY 2 people would (or wouldn't) get along as roommates.
                Be honest but positive: highlight the strengths, but mention potential frictions.
                Length: 3-4 sentences maximum. Use "you" (informal) to address the user.
                Do not repeat the exact scores, focus on WHY.
                """;

            case "es" -> """
                Eres un experto en analisis de compatibilidad para companeros de piso.
                Tu trabajo es explicar POR QUE 2 personas se llevarian bien (o no) como companeros.
                Se honesto pero positivo: destaca las fortalezas, pero menciona posibles fricciones.
                Longitud: 3-4 frases maximo. Usa "tu" (informal) para dirigirte al usuario.
                No repitas los puntajes exactos, enfocate en el POR QUE.
                """;

            case "ar" -> """
                أنت خبير في تحليل توافق شركاء السكن.
                مهمتك هي شرح لماذا سيتوافق (أو لا) شخصان كشركاء سكن.
                كن صادقا ولكن إيجابيا: أبرز نقاط القوة، ولكن اذكر الاحتكاكات المحتملة.
                الطول: 3-4 جمل كحد أقصى. استخدم لغة غير رسمية.
                لا تكرر النقاط بالضبط، ركز على السبب.
                """;

            default -> """
                Tu es un expert en analyse de compatibilite entre colocataires.
                Ton role : expliquer POURQUOI 2 personnes vont (ou pas) bien s'entendre en coloc.
                Sois honnete mais positif : mets en avant les forces, mais mentionne les frictions potentielles.
                Longueur : 3-4 phrases maximum. Utilise le tutoiement.
                Ne repete pas les scores exacts, focus sur le POURQUOI.
                """;
        };
    }

    private String buildUserPrompt(Profile me, Profile other, MatchingScore score, String language) {
        // Format des dimensions : "budget: 85/100"
        String dimensionsText = score.breakdown().stream()
                .map(d -> String.format("- %s: %.0f/100", d.label(), d.score()))
                .collect(Collectors.joining("\n"));

        // Hobbies communs et differents
        String meHobbies = String.join(", ", me.getHobbies() != null ? me.getHobbies() : java.util.List.of());
        String otherHobbies = String.join(", ", other.getHobbies() != null ? other.getHobbies() : java.util.List.of());

        return switch (language) {
            case "en" -> String.format("""
                Analyze the compatibility between these two roommates:
                
                ME (%s, %d yo, %s):
                - Cleanliness: %s | Sleep: %s | Social: %s
                - Smoking: %s | Pets: %s | Diet: %s
                - Hobbies: %s
                
                THEM (%s, %d yo, %s):
                - Cleanliness: %s | Sleep: %s | Social: %s
                - Smoking: %s | Pets: %s | Diet: %s
                - Hobbies: %s
                
                Total compatibility score: %.1f/100
                Dimension scores:
                %s
                
                Explain in 3-4 sentences why we would (or wouldn't) be good roommates.
                """,
                    me.getFullName(), me.getAge(), me.getGender().name(),
                    me.getCleanliness().name(), me.getSleepSchedule().name(), me.getSocialLevel().name(),
                    me.getSmoking().name(), me.getPets().name(), me.getDiet() != null ? me.getDiet().name() : "n/a",
                    meHobbies,
                    other.getFullName(), other.getAge(), other.getGender().name(),
                    other.getCleanliness().name(), other.getSleepSchedule().name(), other.getSocialLevel().name(),
                    other.getSmoking().name(), other.getPets().name(), other.getDiet() != null ? other.getDiet().name() : "n/a",
                    otherHobbies,
                    score.totalScore(),
                    dimensionsText
            );

            default -> String.format("""
                Analyse la compatibilite entre ces deux colocataires potentiels :
                
                MOI (%s, %d ans, %s) :
                - Proprete: %s | Sommeil: %s | Sociabilite: %s
                - Tabac: %s | Animaux: %s | Regime: %s
                - Hobbies: %s
                
                L'AUTRE (%s, %d ans, %s) :
                - Proprete: %s | Sommeil: %s | Sociabilite: %s
                - Tabac: %s | Animaux: %s | Regime: %s
                - Hobbies: %s
                
                Score total de compatibilite : %.1f/100
                Details par dimension :
                %s
                
                Explique en 3-4 phrases pourquoi nous serions (ou pas) de bons colocs.
                """,
                    me.getFullName(), me.getAge(), me.getGender().name(),
                    me.getCleanliness().name(), me.getSleepSchedule().name(), me.getSocialLevel().name(),
                    me.getSmoking().name(), me.getPets().name(), me.getDiet() != null ? me.getDiet().name() : "n/a",
                    meHobbies,
                    other.getFullName(), other.getAge(), other.getGender().name(),
                    other.getCleanliness().name(), other.getSleepSchedule().name(), other.getSocialLevel().name(),
                    other.getSmoking().name(), other.getPets().name(), other.getDiet() != null ? other.getDiet().name() : "n/a",
                    otherHobbies,
                    score.totalScore(),
                    dimensionsText
            );
        };
    }
}