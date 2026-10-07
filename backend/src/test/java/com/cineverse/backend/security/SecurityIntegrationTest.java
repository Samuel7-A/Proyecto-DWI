package com.cineverse.backend.security;

import com.cineverse.backend.dto.LoginRequest;
import com.cineverse.backend.dto.LoginResponse;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.service.AuthService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    private String tokenCliente;
    private String tokenAdmin;

    @BeforeEach
    void prepararTokens() {

        LoginRequest cliente = new LoginRequest();
        cliente.setEmail("cliente@cineverse.com");
        cliente.setPassword("Cliente123!");

        LoginResponse respuestaCliente =
                authService.login(cliente);

        tokenCliente = respuestaCliente.getToken();

        LoginRequest admin = new LoginRequest();
        admin.setEmail("admin@cineverse.com");
        admin.setPassword("Admin123!");

        LoginResponse respuestaAdmin =
                authService.login(admin);

        tokenAdmin = respuestaAdmin.getToken();
    }

    @Test
    void loginCorrectoDeberiaRetornar200() throws Exception {

        String json = """
                {
                    "email": "cliente@cineverse.com",
                    "password": "Cliente123!"
                }
                """;

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
        )
        .andExpect(status().isOk());
    }

    @Test
    void crearPeliculaSinTokenDeberiaRetornar401() throws Exception {

        String json = peliculaJson("Película Sin Token");

        mockMvc.perform(
                post("/api/peliculas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
        )
        .andExpect(status().isUnauthorized());
    }

    @Test
    void clienteNoDeberiaPoderCrearPelicula() throws Exception {

        String json = peliculaJson("Película Cliente");

        mockMvc.perform(
                post("/api/peliculas")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
        )
        .andExpect(status().isForbidden());
    }

    @Test
    void adminDeberiaPoderCrearPelicula() throws Exception {

        String json = peliculaJson("Película Admin");

        mockMvc.perform(
                post("/api/peliculas")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
        )
        .andExpect(status().isCreated());
    }

    private String peliculaJson(String titulo) {

        return """
                {
                    "titulo": "%s",
                    "sinopsis": "Película de prueba de seguridad",
                    "genero": "Acción",
                    "duracionMinutos": 120,
                    "clasificacion": "+12",
                    "fechaEstreno": "2026-10-06",
                    "imagenUrl": "https://example.com/imagen.jpg",
                    "estado": true
                }
                """.formatted(titulo);
    }
}