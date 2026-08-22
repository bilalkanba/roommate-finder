package com.bilalkanba.roommate.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

/**
 * SecurityConfig - Configuration Spring Security avec JWT ES256 (Supabase).
 *
 * IMPORTANT :
 * Supabase utilise ES256 (Elliptic Curve, P-256) pour signer les JWTs.
 * Par defaut, Spring Security s'attend a du RS256 → doit etre configure
 * explicitement pour ES256 via un JwtDecoder custom.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // URL JWKS de Supabase (contient les cles publiques ES256)
    private static final String JWKS_URI =
            "https://yfnjxbdpnetcqbhgsqjb.supabase.co/auth/v1/.well-known/jwks.json";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/v1/health").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    /**
     * CRITICAL : JwtDecoder custom configure pour ES256.
     *
     * Par defaut, NimbusJwtDecoder.withJwkSetUri() utilise RS256.
     * On doit passer par un JWTProcessor manuel pour specifier ES256.
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        try {
            // 1. Source des cles publiques : le JWKS endpoint de Supabase
            JWKSource<SecurityContext> jwkSource = new RemoteJWKSet<>(new URL(JWKS_URI));

            // 2. Selector qui dit "utilise ES256 pour verifier"
            JWSKeySelector<SecurityContext> keySelector =
                    new JWSVerificationKeySelector<>(JWSAlgorithm.ES256, jwkSource);

            // 3. JWT Processor configure avec ce selector
            ConfigurableJWTProcessor<SecurityContext> jwtProcessor = new DefaultJWTProcessor<>();
            jwtProcessor.setJWSKeySelector(keySelector);

            // 4. NimbusJwtDecoder qui utilise notre processor
            return new NimbusJwtDecoder(jwtProcessor);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid JWKS URI: " + JWKS_URI, e);
        }
    }

    /**
     * Convertit un JWT en Authentication token.
     * On utilise le claim "sub" comme principal (= le user_id Supabase).
     */
    private Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setPrincipalClaimName("sub");
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of(
                "GET", "POST", "PATCH", "DELETE", "OPTIONS"
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}