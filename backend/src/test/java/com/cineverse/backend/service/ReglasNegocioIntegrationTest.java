package com.cineverse.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.cineverse.backend.dto.FuncionRequest;
import com.cineverse.backend.dto.OrdenRequest;
import com.cineverse.backend.entity.Asiento;
import com.cineverse.backend.entity.Entrada;
import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Notificacion;
import com.cineverse.backend.entity.Orden;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Rol;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.entity.Usuario;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.DetalleProductoRepository;
import com.cineverse.backend.repository.EntradaRepository;
import com.cineverse.backend.repository.FuncionRepository;
import com.cineverse.backend.repository.NotificacionRepository;
import com.cineverse.backend.repository.OrdenRepository;
import com.cineverse.backend.repository.PeliculaRepository;
import com.cineverse.backend.repository.SalaRepository;
import com.cineverse.backend.repository.UsuarioRepository;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:reglas-negocio-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class ReglasNegocioIntegrationTest {

    @Autowired FuncionService funcionService;
    @Autowired OrdenService ordenService;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired PeliculaRepository peliculaRepository;
    @Autowired SalaRepository salaRepository;
    @Autowired FuncionRepository funcionRepository;
    @Autowired AsientoRepository asientoRepository;
    @Autowired OrdenRepository ordenRepository;
    @Autowired EntradaRepository entradaRepository;
    @Autowired DetalleProductoRepository detalleProductoRepository;
    @Autowired NotificacionRepository notificacionRepository;

    private Usuario cliente;
    private Pelicula pelicula;
    private Funcion funcion;
    private Asiento asiento;

    @BeforeEach
    void setUp() {
        entradaRepository.deleteAll();
        detalleProductoRepository.deleteAll();
        notificacionRepository.deleteAll();
        ordenRepository.deleteAll();
        funcionRepository.deleteAll();
        asientoRepository.deleteAll();
        salaRepository.deleteAll();
        peliculaRepository.deleteAll();
        usuarioRepository.deleteAll();

        cliente = usuarioRepository.save(new Usuario("Cliente", "cliente@cineverse.com", "pass", Rol.CLIENTE, true));

        pelicula = new Pelicula();
        pelicula.setTitulo("Matrix");
        pelicula.setGenero("Acción");
        pelicula.setDuracionMinutos(120);
        pelicula.setClasificacion("+14");
        pelicula.setFechaEstreno(LocalDate.now());
        pelicula.setEstado(true);
        pelicula = peliculaRepository.save(pelicula);

        Sala sala = salaRepository.save(new Sala("Sala 1", 5, 8));
        asiento = asientoRepository.save(new Asiento("A", 1, sala));

        funcion = funcionRepository.save(new Funcion(
                pelicula, sala,
                LocalDateTime.now().plusDays(2),
                LocalDateTime.now().plusDays(2).plusMinutes(120),
                new BigDecimal("18.00")));
    }

    @Test
    void cancelarFuncionMarcaOrdenesComoCanceladasYNotifica() {
        Orden orden = ordenRepository.save(new Orden(cliente, Orden.Estado.PAGADA, new BigDecimal("18.00")));
        entradaRepository.save(new Entrada(orden, funcion, asiento, new BigDecimal("18.00")));

        funcionService.cancelar(funcion.getId());

        assertTrue(funcionRepository.findById(funcion.getId()).orElseThrow().getCancelada());
        assertEquals(Orden.Estado.CANCELADA, ordenRepository.findById(orden.getId()).orElseThrow().getEstado());

        List<Notificacion> notificaciones =
                notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(cliente.getId());
        assertEquals(1, notificaciones.size());
        assertTrue(notificaciones.get(0).getMensaje().contains("cancelada"));
    }

    @Test
    void cancelarFuncionYaCanceladaLanzaConflicto() {
        funcionService.cancelar(funcion.getId());
        assertThrows(ConflictoException.class, () -> funcionService.cancelar(funcion.getId()));
    }

    @Test
    void noSePuedeComprarFuncionCancelada() {
        funcionService.cancelar(funcion.getId());

        OrdenRequest request = new OrdenRequest(funcion.getId(), List.of(asiento.getId()), null);
        assertThrows(ConflictoException.class,
                () -> ordenService.crearOrden("cliente@cineverse.com", request));
    }

    @Test
    void noSePuedeComprarPeliculaRetirada() {
        pelicula.setEstado(false);
        peliculaRepository.save(pelicula);

        OrdenRequest request = new OrdenRequest(funcion.getId(), List.of(asiento.getId()), null);
        assertThrows(ConflictoException.class,
                () -> ordenService.crearOrden("cliente@cineverse.com", request));
    }

    @Test
    void noSePuedeComprarFuncionYaIniciada() {
        Funcion pasada = funcionRepository.save(new Funcion(
                pelicula, funcion.getSala(),
                LocalDateTime.now().minusMinutes(30),
                LocalDateTime.now().plusMinutes(90),
                new BigDecimal("18.00")));

        OrdenRequest request = new OrdenRequest(pasada.getId(), List.of(asiento.getId()), null);
        assertThrows(ConflictoException.class,
                () -> ordenService.crearOrden("cliente@cineverse.com", request));
    }

    @Test
    void noSePuedeCrearFuncionQueSeSolapaEnLaMismaSala() {
        FuncionRequest request = new FuncionRequest(
                pelicula.getId(),
                funcion.getSala().getId(),
                funcion.getFechaHora().plusMinutes(30),
                funcion.getFechaHoraFin().plusMinutes(30),
                new BigDecimal("18.00"));

        assertThrows(ConflictoException.class, () -> funcionService.crear(request));
    }
}
