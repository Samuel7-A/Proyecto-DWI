
package com.cineverse.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.cineverse.backend.dto.SalaRequest;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.SalaRepository;

@SpringBootTest(properties = {
    "jwt.secret=clave-de-prueba-para-iniciar-el-contexto",
    "jwt.expiration=86400000"
})
class SalaServiceTransactionTest {

    @Autowired
    private SalaService salaService;

    @Autowired
    private SalaRepository salaRepository;

    @MockitoBean
    private AsientoRepository asientoRepository;

    @Test
    void crearSalaRevierteLaTransaccionSiFallaElGuardadoDeAsientos() {
        long salasAntes = salaRepository.count();

        SalaRequest request = new SalaRequest();
        request.setNombre("Sala rollback test");
        request.setFilas(2);
        request.setColumnas(3);

        when(salaRepository.existsByNombreIgnoreCase("Sala rollback test"))
                .thenReturn(false);

        doThrow(new RuntimeException("Error simulado al guardar asientos"))
                .when(asientoRepository)
                .saveAllAndFlush(anyList());

        assertThrows(
                RuntimeException.class,
                () -> salaService.crear(request));

        assertEquals(salasAntes, salaRepository.count());
    }
}
