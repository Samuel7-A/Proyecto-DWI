package com.cineverse.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.cineverse.backend.dto.LoginRequest;
import com.cineverse.backend.dto.SalaResponse;
import com.cineverse.backend.service.AuthService;
import com.cineverse.backend.service.SalaService;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:sala-controller-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class SalaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @MockitoBean
    private SalaService salaService;

    private String tokenAdmin;
    private String tokenCliente;

    @BeforeEach
    void prepararTokens() {
        tokenAdmin = login("admin@cineverse.com", "Admin123!");
        tokenCliente = login("cliente@cineverse.com", "Cliente123!");
    }

    @Test
    void listarSalasRequiereAutenticacion() throws Exception {
        mockMvc.perform(get("/api/salas"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminPuedeListarSalas() throws Exception {
        when(salaService.listar()).thenReturn(List.of(respuesta()));

        mockMvc.perform(get("/api/salas")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk());
    }

    @Test
    void clienteNoPuedeListarSalas() throws Exception {
        mockMvc.perform(get("/api/salas")
                        .header("Authorization", "Bearer " + tokenCliente))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminPuedeCrearSala() throws Exception {
        when(salaService.crear(any())).thenReturn(respuesta());

        mockMvc.perform(post("/api/salas")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(APPLICATION_JSON)
                        .content(requestJson()))
                .andExpect(status().isCreated());
    }

    @Test
    void clienteNoPuedeCrearSala() throws Exception {
        mockMvc.perform(post("/api/salas")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(APPLICATION_JSON)
                        .content(requestJson()))
                .andExpect(status().isForbidden());
    }

    @Test
    void requestInvalidoDevuelve400() throws Exception {
        mockMvc.perform(post("/api/salas")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(APPLICATION_JSON)
                        .content("{\"nombre\":\"\",\"filas\":0,\"columnas\":0}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminPuedeActualizarYEliminarSala() throws Exception {
        when(salaService.actualizar(any(Long.class), any())).thenReturn(respuesta());

        mockMvc.perform(put("/api/salas/1")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(APPLICATION_JSON)
                        .content(requestJson()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/salas/1")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNoContent());
    }

    private SalaResponse respuesta() {
        return new SalaResponse(1L, "Sala 1", 5, 8, 40);
    }

    private String requestJson() {
        return """
                {
                  "nombre": "Sala 1",
                  "filas": 5,
                  "columnas": 8
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
