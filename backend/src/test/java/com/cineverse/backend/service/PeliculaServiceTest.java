package com.cineverse.backend.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.exception.PeliculaNotFoundException;
import com.cineverse.backend.repository.PeliculaRepository;

@ExtendWith(MockitoExtension.class)
class PeliculaServiceTest {

    @Mock
    private PeliculaRepository peliculaRepository;

    @InjectMocks
    private PeliculaService peliculaService;

    @Test
    void buscarPorIdDevuelveLaPeliculaExistente() {
        Pelicula pelicula = new Pelicula();
        when(peliculaRepository.findById(1L)).thenReturn(Optional.of(pelicula));

        assertSame(pelicula, peliculaService.buscarPorId(1L));
    }

    @Test
    void buscarPorIdLanzaErrorCuandoNoExiste() {
        when(peliculaRepository.findById(99L)).thenReturn(Optional.empty());

        PeliculaNotFoundException exception = assertThrows(
                PeliculaNotFoundException.class,
                () -> peliculaService.buscarPorId(99L));

        assertEquals("No se encontró la película con id 99", exception.getMessage());
    }

    @Test
    void eliminarBuscaYEliminaLaPelicula() {
        Pelicula pelicula = new Pelicula();
        when(peliculaRepository.findById(1L)).thenReturn(Optional.of(pelicula));

        peliculaService.eliminar(1L);

        verify(peliculaRepository).delete(pelicula);
    }
}