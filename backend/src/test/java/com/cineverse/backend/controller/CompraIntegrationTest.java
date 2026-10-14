package com.cineverse.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import com.cineverse.backend.dto.LoginRequest;
import com.cineverse.backend.dto.SalaRequest;
import com.cineverse.backend.dto.SalaResponse;
import com.cineverse.backend.entity.Asiento;
import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Orden;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Producto;
import com.cineverse.backend.entity.Producto.Categoria;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.DetalleProductoRepository;
import com.cineverse.backend.repository.EntradaRepository;
import com.cineverse.backend.repository.FuncionRepository;
import com.cineverse.backend.repository.OrdenRepository;
import com.cineverse.backend.repository.PeliculaRepository;
import com.cineverse.backend.repository.ProductoRepository;
import com.cineverse.backend.repository.SalaRepository;
import com.cineverse.backend.service.AuthService;
import com.cineverse.backend.service.SalaService;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:compra-e2e-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class CompraIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private SalaService salaService;

    @Autowired
    private PeliculaRepository peliculaRepository;

    @Autowired
    private SalaRepository salaRepository;

    @Autowired
    private FuncionRepository funcionRepository;

    @Autowired
    private AsientoRepository asientoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private OrdenRepository ordenRepository;

    @Autowired
    private EntradaRepository entradaRepository;

    @Autowired
    private DetalleProductoRepository detalleProductoRepository;

    private String tokenCliente;
    private Pelicula pelicula;
    private Funcion funcion;
    private Producto producto;

    @BeforeEach
    void setUp() {
        entradaRepository.deleteAll();
        detalleProductoRepository.deleteAll();
        ordenRepository.deleteAll();
        funcionRepository.deleteAll();
        asientoRepository.deleteAll();
        salaRepository.deleteAll();
        peliculaRepository.deleteAll();
        productoRepository.deleteAll();

        tokenCliente = login("cliente@cineverse.com", "Cliente123!");

        pelicula = new Pelicula();
        pelicula.setTitulo("Matrix E2E");
        pelicula.setSinopsis("Película de prueba end-to-end.");
        pelicula.setGenero("Acción");
        pelicula.setDuracionMinutos(120);
        pelicula.setClasificacion("+14");
        pelicula.setFechaEstreno(LocalDate.now());
        pelicula.setEstado(true);
        pelicula = peliculaRepository.save(pelicula);

        SalaResponse salaResponse = salaService.crear(new SalaRequest("Sala E2E", 3, 4));
        Sala sala = salaRepository.findById(salaResponse.id()).orElseThrow();

        LocalDateTime inicio = LocalDateTime.now().plusDays(2);
        funcion = funcionRepository.save(new Funcion(
                pelicula, sala, inicio, inicio.plusMinutes(120), new BigDecimal("18.00")));

        producto = productoRepository.save(new Producto(
                "Canchita E2E", Categoria.CANCHITA, new BigDecimal("10.00"), true));
    }

    private String login(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return authService.login(request).getToken();
    }

    @Test
    void flujoCompletoDeCompraDesdeElServidor() throws Exception {
        // 1. Consultar película por id (público)
        mockMvc.perform(get("/api/peliculas/" + pelicula.getId()))
                .andExpect(status().isOk());

        // 2. Consultar funciones disponibles (público)
        String funcionesJson = mockMvc.perform(get("/api/funciones")
                        .param("peliculaId", pelicula.getId().toString()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertTrue(funcionesJson.contains("Sala E2E"));
        assertTrue(funcionesJson.contains("Matrix E2E"));

        // 3. Asientos disponibles (endpoint público)
        mockMvc.perform(get("/api/funciones/" + funcion.getId() + "/asientos/disponibles"))
                .andExpect(status().isOk());

        List<Asiento> disponibles = asientoRepository.buscarAsientosDisponibles(funcion.getId());
        assertTrue(disponibles.size() >= 1, "Debe haber al menos un asiento disponible");
        long asientoId = disponibles.get(0).getId();

        // 4. Crear orden con token (1 entrada + 2 productos)
        String payload = """
                {"funcionId": %d, "asientoIds": [%d], "productos": [{"productoId": %d, "cantidad": 2}]}
                """.formatted(funcion.getId(), asientoId, producto.getId());

        mockMvc.perform(post("/api/ordenes")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("PAGADA"))
                .andExpect(jsonPath("$.usuarioEmail").value("cliente@cineverse.com"));

        // 5. Total calculado por el servidor: 1 * 18.00 + 2 * 10.00 = 38.00
        Orden ordenGuardada = ordenRepository.findAll().get(0);
        assertEquals(0, new BigDecimal("38.00").compareTo(ordenGuardada.getTotal()));

        // 6. El asiento comprado deja de estar disponible
        List<Asiento> trasCompra = asientoRepository.buscarAsientosDisponibles(funcion.getId());
        assertTrue(trasCompra.stream().noneMatch(a -> a.getId().equals(asientoId)),
                "El asiento comprado no debe seguir disponible");
    }

    @Test
    void crearOrdenSinTokenDevuelve401() throws Exception {
        String payload = """
                {"funcionId": %d, "asientoIds": [1], "productos": null}
                """.formatted(funcion.getId());

        mockMvc.perform(post("/api/ordenes")
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void crearOrdenConAsientoInexistenteDevuelve404() throws Exception {
        String payload = """
                {"funcionId": %d, "asientoIds": [999999], "productos": null}
                """.formatted(funcion.getId());

        mockMvc.perform(post("/api/ordenes")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNotFound());
    }
}

