package com.cineverse.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.cineverse.backend.dto.SalaRequest;
import com.cineverse.backend.dto.SalaResponse;
import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.FuncionRepository;
import com.cineverse.backend.repository.PeliculaRepository;
import com.cineverse.backend.repository.SalaRepository;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:sala-service-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class SalaServiceTest {

    @Autowired
    private SalaService salaService;

    @Autowired
    private SalaRepository salaRepository;

    @Autowired
    private AsientoRepository asientoRepository;

    @Autowired
    private FuncionRepository funcionRepository;

    @Autowired
    private PeliculaRepository peliculaRepository;

    @BeforeEach
    void limpiar() {
        funcionRepository.deleteAll();
        asientoRepository.deleteAll();
        salaRepository.deleteAll();
        peliculaRepository.deleteAll();
    }

    @Test
    void crearSalaGeneraFilasPorColumnasAsientos() {
        SalaResponse response = salaService.crear(new SalaRequest("Sala A", 3, 4));

        assertNotNull(response.id());
        assertEquals(12, response.totalAsientos());
        assertEquals(12, asientoRepository.count());
    }

    @Test
    void crearSalaConNombreDuplicadoLanzaConflicto() {
        salaService.crear(new SalaRequest("Sala A", 3, 4));

        assertThrows(
                ConflictoException.class,
                () -> salaService.crear(new SalaRequest("sala a", 2, 2)));
    }

    @Test
    void actualizarDimensionesRegeneraLosAsientos() {
        SalaResponse creada = salaService.crear(new SalaRequest("Sala A", 2, 2));
        assertEquals(4, asientoRepository.count());

        SalaResponse actualizada = salaService.actualizar(
                creada.id(), new SalaRequest("Sala A", 3, 3));

        assertEquals(9, actualizada.totalAsientos());
        assertEquals(9, asientoRepository.count());
    }

    @Test
    void actualizarDimensionesConFuncionesLanzaConflicto() {
        SalaResponse creada = salaService.crear(new SalaRequest("Sala A", 2, 2));
        crearFuncion(creada);

        assertThrows(
                ConflictoException.class,
                () -> salaService.actualizar(creada.id(), new SalaRequest("Sala A", 4, 4)));
    }

    @Test
    void actualizarNombreSinCambiarDimensionesConservaAsientos() {
        SalaResponse creada = salaService.crear(new SalaRequest("Sala A", 2, 2));

        SalaResponse actualizada = salaService.actualizar(
                creada.id(), new SalaRequest("Sala Renombrada", 2, 2));

        assertEquals("Sala Renombrada", actualizada.nombre());
        assertEquals(4, asientoRepository.count());
    }

    @Test
    void eliminarSalaSinFuncionesBorraLaSalaYSusAsientos() {
        SalaResponse creada = salaService.crear(new SalaRequest("Sala A", 2, 2));

        salaService.eliminar(creada.id());

        assertFalse(salaRepository.existsById(creada.id()));
        assertEquals(0, asientoRepository.count());
    }

    @Test
    void eliminarSalaConFuncionesLanzaConflicto() {
        SalaResponse creada = salaService.crear(new SalaRequest("Sala A", 2, 2));
        crearFuncion(creada);

        assertThrows(ConflictoException.class, () -> salaService.eliminar(creada.id()));
        assertTrue(salaRepository.existsById(creada.id()));
    }

    @Test
    void crearSalaConMasDe26FilasLanzaConflicto() {
        assertThrows(
                ConflictoException.class,
                () -> salaService.crear(new SalaRequest("Sala Grande", 27, 4)));
    }

    private void crearFuncion(SalaResponse salaResponse) {
        Pelicula pelicula = new Pelicula();
        pelicula.setTitulo("Película Sala Test");
        pelicula.setGenero("Drama");
        pelicula.setDuracionMinutos(100);
        pelicula.setClasificacion("APT");
        pelicula.setFechaEstreno(LocalDate.now());
        pelicula.setEstado(true);
        pelicula = peliculaRepository.save(pelicula);

        Sala sala = salaRepository.findById(salaResponse.id()).orElseThrow();
        LocalDateTime inicio = LocalDateTime.now().plusDays(1);
        funcionRepository.save(new Funcion(
                pelicula, sala, inicio, inicio.plusMinutes(120), new BigDecimal("18.00")));
    }
}
