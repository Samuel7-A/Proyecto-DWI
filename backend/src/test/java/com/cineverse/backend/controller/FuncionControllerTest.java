package com.cineverse.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.cineverse.backend.dto.AsientoResponse;
import com.cineverse.backend.dto.FuncionResponse;
import com.cineverse.backend.dto.LoginRequest;
import com.cineverse.backend.service.AuthService;
import com.cineverse.backend.service.FuncionService;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:funcion-controller-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class FuncionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @MockitoBean
    private FuncionService funcionService;

    private String tokenAdmin;
    private String tokenCliente;

    @BeforeEach
    void prepararTokens() {
        tokenAdmin = login("admin@cineverse.com", "Admin123!");
        tokenCliente = login("cliente@cineverse.com", "Cliente123!");
    }

    @Test
    void consultaDeFuncionesEsPublica() throws Exception {
        when(funcionService.listar(4L)).thenReturn(List.of(respuesta()));

        mockMvc.perform(get("/api/funciones").param("peliculaId", "4"))
                .andExpect(status().isOk());
    }

    @Test
    void adminPuedeCrearFuncion() throws Exception {
        when(funcionService.crear(any())).thenReturn(respuesta());

        mockMvc.perform(post("/api/funciones")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(APPLICATION_JSON)
                        .content(requestJson()))
                .andExpect(status().isCreated());
    }

    @Test
    void crearFuncionSinAutenticacionDevuelve401() throws Exception {
        mockMvc.perform(post("/api/funciones")
                        .contentType(APPLICATION_JSON)
                        .content(requestJson()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clienteNoPuedeCrearFuncion() throws Exception {
        mockMvc.perform(post("/api/funciones")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(APPLICATION_JSON)
                        .content(requestJson()))
                .andExpect(status().isForbidden());
    }

    @Test
    void requestInvalidoDevuelve400() throws Exception {
        mockMvc.perform(post("/api/funciones")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminPuedeActualizarYEliminarFuncion() throws Exception {
        when(funcionService.actualizar(any(Long.class), any())).thenReturn(respuesta());

        mockMvc.perform(put("/api/funciones/1")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(APPLICATION_JSON)
                        .content(requestJson()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/funciones/1")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNoContent());
    }

    @Test
    void consultasDeAsientosSonPublicas() throws Exception {
        when(funcionService.listarAsientosDisponibles(1L))
                .thenReturn(List.of(new AsientoResponse(1L, "A", 1)));
        when(funcionService.listarAsientosOcupados(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/funciones/1/asientos/disponibles"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/funciones/1/asientos/ocupados"))
                .andExpect(status().isOk());
    }

    private FuncionResponse respuesta() {
        return new FuncionResponse(
                1L,
                4L,
                "Película de prueba",
                9L,
                "Sala 1",
                LocalDateTime.of(2026, 10, 10, 12, 0),
                LocalDateTime.of(2026, 10, 10, 14, 0),
                new BigDecimal("20.00"));
    }

    private String requestJson() {
        return """
                {
                  "peliculaId": 4,
                  "salaId": 9,
                  "fechaHora": "2026-10-10T12:00:00",
                  "fechaHoraFin": "2026-10-10T14:00:00",
                  "precio": 20.00
                }
                """;
    }

    private String login(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return authService.login(request).getToken();
    }
}
