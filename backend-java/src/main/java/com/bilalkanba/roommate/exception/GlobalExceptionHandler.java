package com.bilalkanba.roommate.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler - Intercepte toutes les exceptions et retourne
 * des reponses HTTP propres au client.
 *
 * ANNOTATION @RestControllerAdvice :
 * Etend @ControllerAdvice pour les APIs REST.
 * Applique automatiquement @ResponseBody aux methodes.
 *
 * BENEFICES :
 * - Pas besoin de try/catch dans chaque controller
 * - Format d'erreur standardise dans toute l'API
 * - Empeche les stacktraces de fuiter au client
 * - Log centralise des erreurs
 *
 * MAPPING TYPE EXCEPTION -> STATUS HTTP :
 * - ProfileNotFoundException      → 404 Not Found
 * - ProfileAlreadyExistsException → 409 Conflict
 * - MethodArgumentNotValidException → 400 Bad Request (validation @Valid)
 * - IllegalArgumentException      → 400 Bad Request
 * - Exception (catch-all)         → 500 Internal Server Error
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ============================================================
    // 404 Not Found - Profile n'existe pas
    // ============================================================

    @ExceptionHandler(ProfileNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleProfileNotFound(
            ProfileNotFoundException ex
    ) {
        log.warn("Profile not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    // ============================================================
    // 409 Conflict - Profile existe deja
    // ============================================================

    @ExceptionHandler(ProfileAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleProfileAlreadyExists(
            ProfileAlreadyExistsException ex
    ) {
        log.warn("Profile already exists: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    // ============================================================
    // 400 Bad Request - Validation @Valid a echoue
    // ============================================================

    /**
     * Levee quand @Valid detecte une violation Bean Validation.
     * On extrait les erreurs par champ pour un message clair.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex
    ) {
        // Collecter toutes les erreurs par champ
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                fieldErrors.put(err.getField(), err.getDefaultMessage())
        );

        log.warn("Validation failed: {}", fieldErrors);
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Validation echouee",
                fieldErrors
        );
    }

    // ============================================================
    // 400 Bad Request - Argument invalide
    // ============================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex
    ) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    // ============================================================
    // 500 Internal Server Error - Catch-all
    // ============================================================

    /**
     * Intercepte TOUTES les autres exceptions non catchees.
     * On log en ERROR (avec la stacktrace) pour debug,
     * mais on ne l'expose PAS au client (securite).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Une erreur inattendue est survenue",
                null
        );
    }
    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex
    ) {
        log.warn("Type mismatch on parameter '{}': value '{}'", ex.getName(), ex.getValue());
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Parametre invalide : " + ex.getName(),
                null
        );
    }
    // ============================================================
    // Helper : construit une reponse d'erreur standardisee
    // ============================================================

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status,
            String message,
            Map<String, String> fieldErrors
    ) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("detail", message);
        if (fieldErrors != null && !fieldErrors.isEmpty()) {
            body.put("fieldErrors", fieldErrors);
        }
        return ResponseEntity.status(status).body(body);
    }
}