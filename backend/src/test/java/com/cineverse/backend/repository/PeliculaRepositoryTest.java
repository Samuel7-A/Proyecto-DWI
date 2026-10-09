package com.cineverse.backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import com.cineverse.backend.entity.Pelicula;

@DataJpaTest
class PeliculaRepositoryTest {

    @Autowired
    private PeliculaRepository peliculaRepository;

    @Test
    void carteleraDevuelvePeliculasActivasOrdenadasPorFechaEstreno() {
        peliculaRepository.save(pelicula("Estreno tardío", "Drama", true, LocalDate.of(2026, 12, 1)));
        peliculaRepository.save(pelicula("Estreno temprano", "Drama", true, LocalDate.of(2026, 11, 1)));
        peliculaRepository.save(pelicula("Inactiva", "Drama", false, LocalDate.of(2026, 10, 1)));

        assertThat(peliculaRepository.findPeliculasEnCartelera().stream()
                .map(Pelicula::getTitulo).toList())
                .containsExactly("Estreno temprano", "Estreno tardío");
    }

    @Test
    void buscarPorTituloIgnoraMayusculasYBuscaCoincidenciasParciales() {
        peliculaRepository.save(pelicula("El Viaje", "Aventura", true, LocalDate.now()));

        assertThat(peliculaRepository.buscarPorTitulo("via").stream()
                .map(Pelicula::getTitulo).toList())
                .containsExactly("El Viaje");
    }

    @Test
    void buscarPorGeneroIgnoraMayusculas() {
        peliculaRepository.save(pelicula("La película", "Ciencia Ficción", true, LocalDate.now()));

        assertThat(peliculaRepository.buscarPorGenero("ciencia ficción").stream()
                .map(Pelicula::getTitulo).toList())
                .containsExactly("La película");
    }

    @Test
    void buscarPorTituloOGeneroEncuentraCualquieraDeLosDosCampos() {
        peliculaRepository.save(pelicula("Horizonte", "Drama", true, LocalDate.now()));
        peliculaRepository.save(pelicula("La otra", "Horizonte", true, LocalDate.now()));

        assertThat(peliculaRepository.buscarPorTituloOGenero("horizonte").stream()
                .map(Pelicula::getTitulo).toList())
                .containsExactlyInAnyOrder("Horizonte", "La otra");
    }

    private Pelicula pelicula(String titulo, String genero, boolean activa, LocalDate estreno) {
        Pelicula pelicula = new Pelicula();
        pelicula.setTitulo(titulo);
        pelicula.setGenero(genero);
        pelicula.setDuracionMinutos(100);
        pelicula.setClasificacion("APT");
        pelicula.setFechaEstreno(estreno);
        pelicula.setEstado(activa);
        return peliculaRepository.save(pelicula);
    }
}
