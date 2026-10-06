package com.cineverse.backend.security;

import org.springframework.boot.security.autoconfigure.web.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .headers(headers ->
                headers.frameOptions(frameOptions ->
                    frameOptions.sameOrigin()
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Consola H2
                .requestMatchers(PathRequest.toH2Console()).permitAll()

                // Consultar películas: público
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/peliculas",
                    "/api/peliculas/**"
                ).permitAll()

                // Crear películas: solo ADMIN
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/peliculas"
                ).hasRole("ADMIN")

                // Editar películas: solo ADMIN
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/peliculas/**"
                ).hasRole("ADMIN")

                // Eliminar películas: solo ADMIN
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/peliculas/**"
                ).hasRole("ADMIN")

                // Cualquier otra ruta requiere autenticación
                .anyRequest().authenticated()
            )

            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            PasswordEncoder passwordEncoder) {

        UserDetails admin = User.builder()
            .username("admin")
            .password(passwordEncoder.encode("admin123"))
            .roles("ADMIN")
            .build();

        UserDetails cliente = User.builder()
            .username("cliente")
            .password(passwordEncoder.encode("cliente123"))
            .roles("CLIENTE")
            .build();

        return new InMemoryUserDetailsManager(admin, cliente);
    }
}