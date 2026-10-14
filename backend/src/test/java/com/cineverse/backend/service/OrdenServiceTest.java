package com.cineverse.backend.service;

import com.cineverse.backend.dto.ItemProductoRequest;
import com.cineverse.backend.dto.OrdenRequest;
import com.cineverse.backend.dto.OrdenResponse;
import com.cineverse.backend.entity.*;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:orden-service-test;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class OrdenServiceTest {

    @Autowired
    private OrdenService ordenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

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
    private EntradaRepository entradaRepository;

    @Autowired
    private OrdenRepository ordenRepository;

    @Autowired
    private DetalleProductoRepository detalleProductoRepository;

    private Usuario cliente;
    private Funcion funcion;
    private Asiento asiento1;
    private Asiento asiento2;
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
        usuarioRepository.deleteAll();

        cliente = usuarioRepository.save(new Usuario("Cliente Test", "clientetest@cineverse.com", "encodedPass", Rol.CLIENTE, true));
        usuarioRepository.save(new Usuario("Cliente 2", "cliente2@cineverse.com", "encodedPass", Rol.CLIENTE, true));

        Pelicula pelicula = new Pelicula();
        pelicula.setTitulo("Matrix");
        pelicula.setGenero("Acción");
        pelicula.setDuracionMinutos(120);
        pelicula.setClasificacion("+14");
        pelicula.setFechaEstreno(LocalDate.now());
        pelicula.setEstado(true);
        pelicula = peliculaRepository.save(pelicula);

        Sala sala = salaRepository.save(new Sala("Sala 1", 10, 10));

        asiento1 = asientoRepository.save(new Asiento("A", 1, sala));
        asiento2 = asientoRepository.save(new Asiento("A", 2, sala));

        LocalDateTime inicio = LocalDateTime.now().plusDays(2);
        LocalDateTime fin = inicio.plusMinutes(120);
        funcion = funcionRepository.save(new Funcion(pelicula, sala, inicio, fin, new BigDecimal("18.00")));

        producto = productoRepository.save(new Producto("Canchita", Producto.Categoria.CANCHITA, new BigDecimal("10.00"), true));
    }

    @Test
    void deberiaCrearOrdenCorrectamenteYCalcularTotal() {
        OrdenRequest request = new OrdenRequest(
                funcion.getId(),
                List.of(asiento1.getId(), asiento2.getId()),
                List.of(new ItemProductoRequest(producto.getId(), 2))
        );

        OrdenResponse response = ordenService.crearOrden("clientetest@cineverse.com", request);

        assertNotNull(response.getId());
        assertEquals("PAGADA", response.getEstado());
        // 2 entradas * 18.00 = 36.00 + 2 productos * 10.00 = 20.00 -> Total = 56.00
        assertEquals(0, new BigDecimal("56.00").compareTo(response.getTotal()));
    }

    @Test
    void deberiaRechazarAsientoYaOcupado() {
        OrdenRequest request1 = new OrdenRequest(
                funcion.getId(),
                List.of(asiento1.getId()),
                null
        );
        ordenService.crearOrden("clientetest@cineverse.com", request1);

        OrdenRequest request2 = new OrdenRequest(
                funcion.getId(),
                List.of(asiento1.getId()),
                null
        );

        assertThrows(ConflictoException.class, () -> {
            ordenService.crearOrden("cliente2@cineverse.com", request2);
        });
    }

    @Test
    void deberiaDenegarAccesoAOrdenAjena() {
        OrdenRequest request = new OrdenRequest(
                funcion.getId(),
                List.of(asiento1.getId()),
                null
        );
        OrdenResponse response = ordenService.crearOrden("clientetest@cineverse.com", request);

        assertThrows(RecursoNoEncontradoException.class, () -> {
            ordenService.obtenerPorId(response.getId(), "cliente2@cineverse.com", false);
        });
    }
}
