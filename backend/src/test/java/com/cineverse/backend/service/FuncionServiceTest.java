package com.cineverse.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.cineverse.backend.dto.FuncionRequest;
import com.cineverse.backend.dto.FuncionResponse;
import com.cineverse.backend.entity.Asiento;
import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.EntradaRepository;
import com.cineverse.backend.repository.FuncionRepository;
import com.cineverse.backend.repository.PeliculaRepository;
import com.cineverse.backend.repository.SalaRepository;

@ExtendWith(MockitoExtension.class)
class FuncionServiceTest {

    @Mock
    private FuncionRepository funcionRepository;

    @Mock
    private PeliculaRepository peliculaRepository;

    @Mock
    private SalaRepository salaRepository;

    @Mock
    private AsientoRepository asientoRepository;

    @Mock
    private EntradaRepository entradaRepository;

    @InjectMocks
    private FuncionService funcionService;

    @Test
    void listarFiltraPorPeliculaCuandoSeIndicaElId() {
        Funcion funcion = funcion();
        when(funcionRepository.buscarPorPelicula(4L)).thenReturn(List.of(funcion));

        List<FuncionResponse> resultado = funcionService.listar(4L);

        assertEquals(1, resultado.size());
        assertEquals("Película de prueba", resultado.get(0).peliculaTitulo());
        verify(funcionRepository, never()).findAllByOrderByFechaHoraAsc();
    }

    @Test
    void crearGuardaLaFuncionConPelículaYSalaExistentes() {
        Pelicula pelicula = pelicula();
        Sala sala = new Sala("Sala 1", 5, 8);
        FuncionRequest request = request(
                LocalDateTime.of(2026, 10, 10, 12, 0),
                LocalDateTime.of(2026, 10, 10, 14, 0));
        when(peliculaRepository.findById(4L)).thenReturn(Optional.of(pelicula));
        when(salaRepository.findById(9L)).thenReturn(Optional.of(sala));
        when(funcionRepository.save(any(Funcion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FuncionResponse respuesta = funcionService.crear(request);

        assertEquals("Película de prueba", respuesta.peliculaTitulo());
        assertEquals("Sala 1", respuesta.salaNombre());
        assertEquals(new BigDecimal("20.00"), respuesta.precio());
    }

    @Test
    void crearRechazaFinIgualOAnteriorAlInicio() {
        FuncionRequest request = request(
                LocalDateTime.of(2026, 10, 10, 14, 0),
                LocalDateTime.of(2026, 10, 10, 14, 0));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> funcionService.crear(request));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(funcionRepository, never()).save(any());
    }

    @Test
    void crearConPeliculaInexistenteLanzaNoEncontrado() {
        when(peliculaRepository.findById(4L)).thenReturn(Optional.empty());

        assertThrows(
                RecursoNoEncontradoException.class,
                () -> funcionService.crear(request(
                        LocalDateTime.of(2026, 10, 10, 12, 0),
                        LocalDateTime.of(2026, 10, 10, 14, 0))));
        verify(salaRepository, never()).findById(any());
    }

    @Test
    void crearConSalaInexistenteLanzaNoEncontrado() {
        when(peliculaRepository.findById(4L)).thenReturn(Optional.of(pelicula()));
        when(salaRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(
                RecursoNoEncontradoException.class,
                () -> funcionService.crear(request(
                        LocalDateTime.of(2026, 10, 10, 12, 0),
                        LocalDateTime.of(2026, 10, 10, 14, 0))));
        verify(funcionRepository, never()).save(any());
    }

    @Test
    void actualizarModificaTodosLosCamposDeLaFuncion() {
        Funcion existente = funcion();
        Pelicula nuevaPelicula = pelicula();
        nuevaPelicula.setTitulo("Otra película");
        Sala nuevaSala = new Sala("Sala 2", 6, 9);
        when(funcionRepository.findById(3L)).thenReturn(Optional.of(existente));
        when(peliculaRepository.findById(4L)).thenReturn(Optional.of(nuevaPelicula));
        when(salaRepository.findById(9L)).thenReturn(Optional.of(nuevaSala));
        when(funcionRepository.save(any(Funcion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FuncionResponse respuesta = funcionService.actualizar(
                3L,
                request(
                        LocalDateTime.of(2026, 10, 11, 16, 0),
                        LocalDateTime.of(2026, 10, 11, 18, 0)));

        assertEquals("Otra película", respuesta.peliculaTitulo());
        assertEquals("Sala 2", respuesta.salaNombre());
        assertEquals(LocalDateTime.of(2026, 10, 11, 16, 0), respuesta.fechaHora());
    }

    @Test
    void actualizarFuncionConEntradasLanzaConflictoSinGuardarCambios() {
        Funcion existente = funcion();

        when(funcionRepository.findById(3L)).thenReturn(Optional.of(existente));
        when(entradaRepository.existsByFuncionId(3L)).thenReturn(true);

        assertThrows(
                ConflictoException.class,
                () -> funcionService.actualizar(
                        3L,
                        request(
                                LocalDateTime.of(2026, 10, 11, 16, 0),
                                LocalDateTime.of(2026, 10, 11, 18, 0))));

        verify(funcionRepository, never()).save(any(Funcion.class));
        verify(peliculaRepository, never()).findById(any());
        verify(salaRepository, never()).findById(any());
    }

    @Test
    void eliminarFuncionConEntradasLanzaConflicto() {
        Funcion existente = funcion();
        when(funcionRepository.findById(3L)).thenReturn(Optional.of(existente));
        when(entradaRepository.existsByFuncionId(3L)).thenReturn(true);

        assertThrows(ConflictoException.class, () -> funcionService.eliminar(3L));

        verify(funcionRepository, never()).delete(any(Funcion.class));
    }

    @Test
    void eliminarFuncionSinEntradasLaBorra() {
        Funcion existente = funcion();
        when(funcionRepository.findById(3L)).thenReturn(Optional.of(existente));
        when(entradaRepository.existsByFuncionId(3L)).thenReturn(false);

        funcionService.eliminar(3L);

        verify(funcionRepository).delete(existente);
    }

    @Test
    void listarAsientosDisponiblesDevuelveLosAsientosDelRepositorio() {
        when(funcionRepository.findById(3L)).thenReturn(Optional.of(funcion()));
        Asiento asiento = new Asiento("A", 1, new Sala("Sala 1", 5, 8));
        when(asientoRepository.buscarAsientosDisponibles(3L)).thenReturn(List.of(asiento));

        var resultado = funcionService.listarAsientosDisponibles(3L);

        assertEquals(1, resultado.size());
        assertEquals("A", resultado.get(0).fila());
        assertEquals(1, resultado.get(0).numero());
    }

    @Test
    void listarAsientosOcupadosDevuelveLosAsientosDelRepositorio() {
        when(funcionRepository.findById(3L)).thenReturn(Optional.of(funcion()));
        Asiento asiento = new Asiento("B", 2, new Sala("Sala 1", 5, 8));
        when(entradaRepository.buscarAsientosOcupados(3L)).thenReturn(List.of(asiento));

        var resultado = funcionService.listarAsientosOcupados(3L);

        assertEquals(1, resultado.size());
        assertEquals("B", resultado.get(0).fila());
        assertEquals(2, resultado.get(0).numero());
    }

    private FuncionRequest request(LocalDateTime inicio, LocalDateTime fin) {
        return new FuncionRequest(4L, 9L, inicio, fin, new BigDecimal("20.00"));
    }

    private Funcion funcion() {
        return new Funcion(
                pelicula(),
                new Sala("Sala 1", 5, 8),
                LocalDateTime.of(2026, 10, 10, 12, 0),
                LocalDateTime.of(2026, 10, 10, 14, 0),
                new BigDecimal("20.00"));
    }

    private Pelicula pelicula() {
        Pelicula pelicula = new Pelicula();
        pelicula.setId(4L);
        pelicula.setTitulo("Película de prueba");
        pelicula.setGenero("Drama");
        pelicula.setDuracionMinutos(100);
        pelicula.setClasificacion("APT");
        pelicula.setFechaEstreno(LocalDate.of(2026, 1, 1));
        pelicula.setEstado(true);
        return pelicula;
    }
}
