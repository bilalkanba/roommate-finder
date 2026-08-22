package com.bilalkanba.roommate.core;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.UUID;

/**
 * Helpers pour récupérer facilement l'utilisateur courant.
 *
 * Usage dans un controller :
 *
 *   @GetMapping("/me")
 *   public ProfileResponse getMyProfile(@CurrentUserId UUID userId) {
 *       // userId contient le UUID Supabase Auth
 *   }
 */
public class CurrentUser {

    /**
     * Annotation custom pour injecter directement le user_id (UUID) dans un controller.
     * Équivalent Java du "current_user: TokenData = Depends(get_current_user)" de FastAPI.
     */
    @Target(ElementType.PARAMETER)
    @Retention(RetentionPolicy.RUNTIME)
    @AuthenticationPrincipal(expression = "T(com.bilalkanba.roommate.core.CurrentUser).extractUserId(#this)")
    public @interface Id {
    }

    /**
     * Utilitaire statique appelé par l'annotation ci-dessus.
     * Extrait le "sub" claim du JWT et le convertit en UUID.
     */
    public static UUID extractUserId(Jwt jwt) {
        if (jwt == null) {
            throw new IllegalStateException("No JWT in security context");
        }
        String sub = jwt.getSubject();  // = claim "sub" du JWT Supabase
        if (sub == null) {
            throw new IllegalStateException("JWT has no 'sub' claim");
        }
        return UUID.fromString(sub);
    }
}