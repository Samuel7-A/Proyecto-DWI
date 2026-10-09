package com.cineverse.backend.security;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.security.autoconfigure.web.servlet.PathRequest;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers ->
                headers.frameOptions(frameOptions ->
                    frameOptions.sameOrigin()
                )
            )
            .exceptionHandling(exceptions ->
                exceptions.authenticationEntryPoint(
                    (request, response, authException) ->
                        response.sendError(
                            HttpServletResponse.SC_UNAUTHORIZED,
                            "No autenticado"
                        )
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(PathRequest.toH2Console()).permitAll()
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/peliculas",
                    "/api/peliculas/**"
                ).permitAll()
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/peliculas"
                ).hasRole("ADMIN")
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/peliculas/**"
                ).hasRole("ADMIN")
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/peliculas/**"
                ).hasRole("ADMIN")
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/funciones",
                    "/api/funciones/**"
                ).permitAll()
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/funciones"
                ).hasRole("ADMIN")
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/funciones/{id}"
                ).hasRole("ADMIN")
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/funciones/{id}"
                ).hasRole("ADMIN")
                .anyRequest().authenticated()
            );

        http.addFilterBefore(
            jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:8080",
            "http://127.0.0.1:8080"
        ));

        configuration.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type"
        ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
