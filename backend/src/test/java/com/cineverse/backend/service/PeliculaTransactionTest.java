package com.cineverse.backend.service;

import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.repository.PeliculaRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:transaction-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Import(PeliculaTransactionTest.TestConfig.class)
class PeliculaTransactionTest {

    @Autowired
    private PeliculaRepository peliculaRepository;

    @Autowired
    private RollbackTestService rollbackTestService;

    @Test
    void deberiaHacerRollbackCuandoOcurreUnaExcepcion() {

        assertThrows(
                RuntimeException.class,
                () -> rollbackTestService.guardarYFallar()
        );

        assertEquals(
                0,
                peliculaRepository.count(),
                "La película debe desaparecer debido al rollback"
        );
    }

    @TestConfiguration
    static class TestConfig {

        @Bean
        RollbackTestService rollbackTestService(
                PeliculaRepository peliculaRepository
        ) {
            return new RollbackTestService(peliculaRepository);
        }
    }

    static class RollbackTestService {

        private final PeliculaRepository peliculaRepository;

        RollbackTestService(PeliculaRepository peliculaRepository) {
            this.peliculaRepository = peliculaRepository;
        }

        @Transactional
        public void guardarYFallar() {

            Pelicula pelicula = new Pelicula();

            pelicula.setTitulo("Pelicula Rollback Test");
            pelicula.setSinopsis("Prueba de rollback");
            pelicula.setGenero("Acción");
            pelicula.setDuracionMinutos(120);
            pelicula.setClasificacion("+12");
            pelicula.setFechaEstreno(LocalDate.of(2026, 10, 6));
            pelicula.setEstado(true);

            peliculaRepository.save(pelicula);

            throw new RuntimeException("Error simulado");
        }
    }
}