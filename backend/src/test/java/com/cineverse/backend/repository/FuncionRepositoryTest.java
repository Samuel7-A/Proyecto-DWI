package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Sala;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:funcion-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class FuncionRepositoryTest {

    @Autowired
    private FuncionRepository funcionRepository;

    @Autowired
    private PeliculaRepository peliculaRepository;

    @Autowired
    private SalaRepository salaRepository;

    @Test
    void deberiaBuscarFuncionesPorPeliculaOrdenadasPorFecha() {

        Pelicula pelicula = new Pelicula();
        pelicula.setTitulo("Avatar");
        pelicula.setSinopsis("Una película de ciencia ficción.");
        pelicula.setGenero("Ciencia ficción");
        pelicula.setDuracionMinutos(160);
        pelicula.setClasificacion("+12");
        pelicula.setFechaEstreno(LocalDate.of(2026, 1, 1));
        pelicula.setImagenUrl("avatar.jpg");
        pelicula.setEstado(true);

        pelicula = peliculaRepository.save(pelicula);

        Sala sala = new Sala("Sala JPQL Funcion Test", 10, 10);
        sala = salaRepository.save(sala);

        Funcion funcionTarde = new Funcion(
                pelicula,
                sala,
                LocalDateTime.of(2026, 10, 6, 20, 0),
                LocalDateTime.of(2026, 10, 6, 22, 40),
                new BigDecimal("25.00")
        );

        Funcion funcionTemprana = new Funcion(
                pelicula,
                sala,
                LocalDateTime.of(2026, 10, 6, 16, 0),
                LocalDateTime.of(2026, 10, 6, 18, 40),
                new BigDecimal("20.00")
        );

        funcionRepository.save(funcionTarde);
        funcionRepository.save(funcionTemprana);

        List<Funcion> resultado =
                funcionRepository.buscarPorPelicula(pelicula.getId());

        assertThat(resultado).hasSize(2);

        assertThat(resultado.get(0).getFechaHora())
                .isEqualTo(LocalDateTime.of(2026, 10, 6, 16, 0));

        assertThat(resultado.get(1).getFechaHora())
                .isEqualTo(LocalDateTime.of(2026, 10, 6, 20, 0));
    }
}