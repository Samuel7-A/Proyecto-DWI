
package com.cineverse.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.cineverse.backend.dto.SalaRequest;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.SalaRepository;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:sala-transaction-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
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

        SalaRequest request = new SalaRequest("Sala rollback test", 2, 3);

        doThrow(new RuntimeException("Error simulado al guardar asientos"))
                .when(asientoRepository)
                .saveAll(anyList());

        assertThrows(
                RuntimeException.class,
                () -> salaService.crear(request));

        assertEquals(salasAntes, salaRepository.count());
    }
}
