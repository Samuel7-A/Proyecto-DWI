
package com.cineverse.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.cineverse.backend.dto.SalaRequest;
import com.cineverse.backend.dto.SalaResponse;
import com.cineverse.backend.entity.Asiento;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.SalaRepository;

@ExtendWith(MockitoExtension.class)
class SalaServiceTest {

    @Mock
    private SalaRepository salaRepository;

    @Mock
    private AsientoRepository asientoRepository;

    @InjectMocks
    private SalaService salaService;

    @Test
    void crearSalaGeneraTodosLosAsientos() {
        SalaRequest request = new SalaRequest();
        request.setNombre("Sala de prueba");
        request.setFilas(3);
        request.setColumnas(4);

        when(salaRepository.existsByNombreIgnoreCase("Sala de prueba"))
                .thenReturn(false);

        when(salaRepository.saveAndFlush(any(Sala.class)))
                .thenAnswer(invocation -> {
                    Sala sala = invocation.getArgument(0);
                    try {
                        var campoId = Sala.class.getDeclaredField("id");
                        campoId.setAccessible(true);
                        campoId.set(sala, 1L);
                    } catch (ReflectiveOperationException e) {
                        throw new RuntimeException(e);
                    }
                    return sala;
                });

        when(asientoRepository.saveAllAndFlush(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SalaResponse respuesta = salaService.crear(request);

        assertEquals("Sala de prueba", respuesta.getNombre());
        assertEquals(3, respuesta.getFilas());
        assertEquals(4, respuesta.getColumnas());
        assertEquals(12, respuesta.getTotalAsientos());

        verify(asientoRepository).saveAllAndFlush(anyList());
    }

    @Test
    void crearSalaConNombreDuplicadoLanzaConflicto() {
        SalaRequest request = new SalaRequest();
        request.setNombre("Sala de prueba");
        request.setFilas(3);
        request.setColumnas(4);

        when(salaRepository.existsByNombreIgnoreCase("Sala de prueba"))
                .thenReturn(true);

        assertThrows(
                ConflictoException.class,
                () -> salaService.crear(request));

        verify(salaRepository, never()).saveAndFlush(any(Sala.class));
        verify(asientoRepository, never()).saveAllAndFlush(anyList());
    }
}
