package com.cineverse.backend.service;

import com.cineverse.backend.dto.LoginRequest;
import com.cineverse.backend.dto.LoginResponse;
import com.cineverse.backend.entity.Usuario;
import com.cineverse.backend.repository.UsuarioRepository;
import com.cineverse.backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        Usuario usuario = usuarioRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Credenciales inválidas"));

        if (!usuario.getActivo()) {
            throw new RuntimeException("El usuario está inactivo");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                usuario.getPassword())) {

            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(usuario);

        return new LoginResponse(
                token,
                "Bearer",
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name()
        );
    }
}