package com.bilalkanba.roommate.api;

import com.bilalkanba.roommate.core.CurrentUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * HealthController - endpoints de test pour vérifier que le serveur marche.
 *
 * - GET /api/v1/health   → public, retourne "ok"
 * - GET /api/v1/whoami   → nécessite JWT, retourne ton user_id
 */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "ok",
                "service", "roommate-finder-backend-java",
                "version", "1.0.0"
        );
    }

    @GetMapping("/whoami")
    public Map<String, Object> whoami(@CurrentUser.Id UUID userId) {
        return Map.of(
                "user_id", userId.toString(),
                "message", "Auth Supabase JWT fonctionne !"
        );
    }
}