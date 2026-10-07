package com.cineverse.backend;

import com.cineverse.backend.entity.Rol;
import com.cineverse.backend.entity.Usuario;
import com.cineverse.backend.repository.UsuarioRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initUsuarios(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (!usuarioRepository.existsByEmail("admin@cineverse.com")) {

                Usuario admin = new Usuario(
                        "Administrador",
                        "admin@cineverse.com",
                        passwordEncoder.encode("Admin123!"),
                        Rol.ADMIN,
                        true
                );

                usuarioRepository.save(admin);
            }

            if (!usuarioRepository.existsByEmail("cliente@cineverse.com")) {

                Usuario cliente = new Usuario(
                        "Cliente CineVerse",
                        "cliente@cineverse.com",
                        passwordEncoder.encode("Cliente123!"),
                        Rol.CLIENTE,
                        true
                );

                usuarioRepository.save(cliente);
            }
        };
    }
}