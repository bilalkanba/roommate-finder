package com.bilalkanba.roommate.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPIConfig - Configuration Swagger UI pour ajouter le bouton "Authorize".
 *
 * PROBLEME sans cette config :
 * Swagger UI ne sait pas que nos endpoints ont besoin d'un JWT Bearer.
 * Le bouton "Authorize" n'apparait pas et toutes les requetes retournent 401.
 *
 * SOLUTION :
 * On declare un SecurityScheme "bearerAuth" et on l'applique globalement.
 * Cela genere le bouton Authorize dans Swagger UI.
 */
@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Roommate Finder AI - Java Backend")
                        .version("1.0.0")
                        .description("Backend Java Spring Boot pour l'app Roommate Finder"))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT Supabase - colle ton token sans le mot 'Bearer'")
                        )
                );
    }
}