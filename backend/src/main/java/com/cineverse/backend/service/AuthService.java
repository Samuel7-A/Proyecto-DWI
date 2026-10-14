package com.cineverse.backend.service;

import com.cineverse.backend.dto.LoginRequest;
import com.cineverse.backend.dto.LoginResponse;
import com.cineverse.backend.dto.RegisterRequest;
import com.cineverse.backend.entity.Rol;
import com.cineverse.backend.entity.Usuario;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.CredencialesInvalidasException;
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
                .orElseThrow(CredencialesInvalidasException::new);

        if (!usuario.getActivo()) {
            throw new CredencialesInvalidasException();
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                usuario.getPassword())) {
            throw new CredencialesInvalidasException();
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

    public LoginResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ConflictoException("El correo electrónico ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(Rol.CLIENTE);
        usuario.setActivo(true);

        Usuario savedUser = usuarioRepository.save(usuario);
        String token = jwtService.generateToken(savedUser);

        return new LoginResponse(
                token,
                "Bearer",
                savedUser.getNombre(),
                savedUser.getEmail(),
                savedUser.getRol().name()
        );
    }

}
