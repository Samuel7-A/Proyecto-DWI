package com.cineverse.backend.controller;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.cineverse.backend.dto.LoginRequest;
import com.cineverse.backend.entity.Producto;
import com.cineverse.backend.entity.Producto.Categoria;
import com.cineverse.backend.repository.ProductoRepository;
import com.cineverse.backend.service.AuthService;

/**
 * Prueba el módulo Productos de punta a punta (seguridad real + validación + BD).
 * Todos los productos de prueba llevan el prefijo PREFIJO y se borran al terminar.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ProductoIntegrationTest {

    private static final String PREFIJO = "ZZ-TEST-";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private ProductoRepository productoRepository;

    private String tokenAdmin;
    private String tokenCliente;

    @BeforeEach
    void prepararTokens() {
        tokenAdmin = login("admin@cineverse.com", "Admin123!");
        tokenCliente = login("cliente@cineverse.com", "Cliente123!");
    }

    @AfterEach
    void limpiar() {
        productoRepository.findAll().stream()
                .filter(p -> p.getNombre().startsWith(PREFIJO))
                .forEach(productoRepository::delete);
    }

    // ---------- Público ----------

    @Test
    void listarProductosSinTokenDevuelve200YOcultaLosInactivos() throws Exception {
        String activo = nombreUnico();
        String inactivo = nombreUnico();
        guardar(activo, true);
        guardar(inactivo, false);

        String cuerpo = mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertTrue(cuerpo.contains(activo));
        assertFalse(cuerpo.contains(inactivo));
    }

    @Test
    void obtenerProductoActivoSinTokenDevuelve200() throws Exception {
        Producto producto = guardar(nombreUnico(), true);

        mockMvc.perform(get("/api/productos/" + producto.getId()))
                .andExpect(status().isOk());
    }

    @Test
    void obtenerProductoInactivoDevuelve404() throws Exception {
        Producto producto = guardar(nombreUnico(), false);

        mockMvc.perform(get("/api/productos/" + producto.getId()))
                .andExpect(status().isNotFound());
    }

    // ---------- ADMIN ----------

    @Test
    void adminCreaProductoYDevuelve201() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombreUnico(), "BEBIDA", "7.50")))
                .andExpect(status().isCreated());
    }

    @Test
    void adminActualizaProductoYDevuelve200() throws Exception {
        Producto producto = guardar(nombreUnico(), true);

        mockMvc.perform(put("/api/productos/" + producto.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombreUnico(), "DULCE", "9.90")))
                .andExpect(status().isOk());
    }

    @Test
    void adminEliminaProductoYDevuelve204() throws Exception {
        Producto producto = guardar(nombreUnico(), true);

        mockMvc.perform(delete("/api/productos/" + producto.getId())
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNoContent());
    }

    @Test
    void adminEliminaProductoInexistenteDevuelve404() throws Exception {
        mockMvc.perform(delete("/api/productos/999999")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminVeTambienLosProductosInactivos() throws Exception {
        String inactivo = nombreUnico();
        guardar(inactivo, false);

        String cuerpo = mockMvc.perform(get("/api/productos/admin")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertTrue(cuerpo.contains(inactivo));
    }

    // ---------- 403: CLIENTE no puede administrar ----------

    @Test
    void clienteNoPuedeCrearProducto() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombreUnico(), "BEBIDA", "7.00")))
                .andExpect(status().isForbidden());
    }

    @Test
    void clienteNoPuedeActualizarProducto() throws Exception {
        Producto producto = guardar(nombreUnico(), true);

        mockMvc.perform(put("/api/productos/" + producto.getId())
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombreUnico(), "BEBIDA", "7.00")))
                .andExpect(status().isForbidden());
    }

    @Test
    void clienteNoPuedeEliminarProducto() throws Exception {
        Producto producto = guardar(nombreUnico(), true);

        mockMvc.perform(delete("/api/productos/" + producto.getId())
                        .header("Authorization", "Bearer " + tokenCliente))
                .andExpect(status().isForbidden());
    }

    @Test
    void clienteNoPuedeVerElListadoDeAdministracion() throws Exception {
        mockMvc.perform(get("/api/productos/admin")
                        .header("Authorization", "Bearer " + tokenCliente))
                .andExpect(status().isForbidden());
    }

    // ---------- 401: sin token ----------

    @Test
    void crearProductoSinTokenDevuelve401() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombreUnico(), "BEBIDA", "7.00")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void eliminarProductoSinTokenDevuelve401() throws Exception {
        Producto producto = guardar(nombreUnico(), true);

        mockMvc.perform(delete("/api/productos/" + producto.getId()))
                .andExpect(status().isUnauthorized());
    }

    // ---------- 400: validaciones ----------

    @Test
    void crearConNombreVacioDevuelve400() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("   ", "BEBIDA", "7.00")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearConPrecioNegativoDevuelve400() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombreUnico(), "BEBIDA", "-3")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearConMasDeDosDecimalesDevuelve400() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombreUnico(), "BEBIDA", "7.999")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearConCategoriaInexistenteDevuelve400() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombreUnico(), "PIZZA", "7.00")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearSinCuerpoUtilDevuelve400() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    // ---------- 409: conflicto ----------

    @Test
    void crearConNombreDuplicadoDevuelve409SinImportarMayusculas() throws Exception {
        String nombre = nombreUnico();
        guardar(nombre, true);

        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombre.toLowerCase(), "BEBIDA", "7.00")))
                .andExpect(status().isConflict());
    }

    @Test
    void actualizarConNombreDeOtroProductoDevuelve409() throws Exception {
        String nombreOcupado = nombreUnico();
        guardar(nombreOcupado, true);
        Producto otro = guardar(nombreUnico(), true);

        mockMvc.perform(put("/api/productos/" + otro.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombreOcupado, "BEBIDA", "7.00")))
                .andExpect(status().isConflict());
    }

    @Test
    void actualizarConSuPropioNombreNoEsConflicto() throws Exception {
        String nombre = nombreUnico();
        Producto producto = guardar(nombre, true);

        mockMvc.perform(put("/api/productos/" + producto.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(nombre, "BEBIDA", "8.00")))
                .andExpect(status().isOk());
    }

    // ---------- utilidades ----------

    private String login(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return authService.login(request).getToken();
    }

    private String nombreUnico() {
        return PREFIJO + UUID.randomUUID();
    }

    private Producto guardar(String nombre, boolean activo) {
        return productoRepository.save(
                new Producto(nombre, Categoria.BEBIDA, new BigDecimal("7.00"), activo));
    }

    private String json(String nombre, String categoria, String precio) {
        return """
                {
                  "nombre": "%s",
                  "categoria": "%s",
                  "precio": %s
                }
                """.formatted(nombre, categoria, precio);
    }
}
