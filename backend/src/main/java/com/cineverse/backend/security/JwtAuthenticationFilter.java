package com.cineverse.backend.security;

import com.cineverse.backend.entity.Usuario;
import com.cineverse.backend.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extractUsername(token);

            Usuario usuario = usuarioRepository
                    .findByEmail(email)
                    .orElse(null);

            System.out.println("========== JWT DEBUG ==========");
            System.out.println("Email del token: " + email);
            System.out.println("Usuario encontrado: " + (usuario != null));

            if (usuario != null) {

                boolean tokenValido =
                        jwtService.isTokenValid(token, usuario);

                System.out.println("Usuario DB: " + usuario.getEmail());
                System.out.println("Rol DB: " + usuario.getRol());
                System.out.println("Activo DB: " + usuario.getActivo());
                System.out.println("Token válido: " + tokenValido);

                if (usuario.getActivo() && tokenValido) {

                    String rol = usuario.getRol().name();

                    var authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + rol)
                    );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    usuario.getEmail(),
                                    null,
                                    authorities
                            );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);

                    System.out.println("AUTHENTICATION CREADA");
                    System.out.println("Authority: ROLE_" + rol);
                }
            }

            System.out.println("================================");

        } catch (Exception e) {
            System.out.println("========== ERROR JWT ==========");
            System.out.println("Mensaje: " + e.getMessage());
            e.printStackTrace();
            System.out.println("================================");
        }

        filterChain.doFilter(request, response);
    }
}