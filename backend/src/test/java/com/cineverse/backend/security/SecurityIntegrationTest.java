package com.cineverse.backend.security;

import com.cineverse.backend.dto.LoginRequest;
import com.cineverse.backend.dto.LoginResponse;
import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.repository.FuncionRepository;
import com.cineverse.backend.repository.PeliculaRepository;
import com.cineverse.backend.repository.SalaRepository;
import com.cineverse.backend.service.AuthService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private PeliculaRepository peliculaRepository;

    @Autowired
    private SalaRepository salaRepository;

    @Autowired
    private FuncionRepository funcionRepository;

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
    void loginConCredencialesIncorrectasDeberiaRetornar401() throws Exception {

        String json = """
                {
                    "email": "cliente@cineverse.com",
                    "password": "ClaveIncorrecta123!"
                }
                """;

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
        )
        .andExpect(status().isUnauthorized());
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

    @Test
    void adminEliminaPeliculaSinFunciones() throws Exception {

        Pelicula pelicula = peliculaRepository.save(pelicula("Eliminable sin funciones"));

        mockMvc.perform(
                delete("/api/peliculas/" + pelicula.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
        )
        .andExpect(status().isNoContent());
    }

    @Test
    void adminNoEliminaPeliculaConFunciones() throws Exception {

        Pelicula pelicula = peliculaRepository.save(pelicula("Eliminable con funciones"));
        Sala sala = salaRepository.findAll().get(0);

        funcionRepository.save(new Funcion(
                pelicula,
                sala,
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(1).plusHours(2),
                new BigDecimal("18.00")));

        mockMvc.perform(
                delete("/api/peliculas/" + pelicula.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
        )
        .andExpect(status().isConflict());
    }

    @Test
    void eliminarPeliculaSinTokenRetorna401() throws Exception {

        mockMvc.perform(delete("/api/peliculas/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clienteNoPuedeEliminarPelicula() throws Exception {

        mockMvc.perform(
                delete("/api/peliculas/1")
                        .header("Authorization", "Bearer " + tokenCliente)
        )
        .andExpect(status().isForbidden());
    }

    private Pelicula pelicula(String titulo) {

        Pelicula pelicula = new Pelicula();
        pelicula.setTitulo(titulo);
        pelicula.setSinopsis("Película de prueba de eliminación");
        pelicula.setGenero("Acción");
        pelicula.setDuracionMinutos(120);
        pelicula.setClasificacion("+12");
        pelicula.setFechaEstreno(LocalDate.of(2026, 10, 6));
        pelicula.setImagenUrl("https://example.com/imagen.jpg");
        pelicula.setEstado(true);
        return pelicula;
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