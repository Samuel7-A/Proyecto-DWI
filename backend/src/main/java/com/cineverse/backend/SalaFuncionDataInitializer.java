package com.cineverse.backend;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cineverse.backend.dto.SalaRequest;
import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.FuncionRepository;
import com.cineverse.backend.repository.PeliculaRepository;
import com.cineverse.backend.repository.SalaRepository;
import com.cineverse.backend.service.SalaService;

/**
 * Datos de demostración reproducibles e idempotentes:
 * salas (con asientos) y funciones para la cartelera.
 *
 * No borra datos existentes: solo crea lo que falta.
 */
@Configuration
public class SalaFuncionDataInitializer {

    private static final BigDecimal PRECIO_DEMO = new BigDecimal("18.00");

    @Bean
    CommandLineRunner initSalasYFunciones(
            SalaRepository salaRepository,
            AsientoRepository asientoRepository,
            FuncionRepository funcionRepository,
            PeliculaRepository peliculaRepository,
            SalaService salaService) {

        return args -> {
            // 1. Salas de demostración si no existe ninguna.
            if (salaRepository.count() == 0) {
                salaService.crear(new SalaRequest("Sala 1 · Estreno", 5, 8));
                salaService.crear(new SalaRequest("Sala 2 · Premium", 6, 10));
                salaService.crear(new SalaRequest("Sala 3 · Clásica", 4, 6));
            }

            // 2. Backfill: toda sala existente sin asientos los genera.
            for (Sala sala : salaRepository.findAllByOrderByIdAsc()) {
                if (!asientoRepository.existsBySalaId(sala.getId())) {
                    salaService.generarAsientos(sala.getId());
                }
            }

            // 3. Funciones de demostración para la cartelera que no tenga función.
            List<Sala> salas = salaRepository.findAllByOrderByIdAsc();
            if (!salas.isEmpty()) {
                Sala sala = salas.get(0);
                List<Pelicula> cartelera = peliculaRepository.findPeliculasEnCartelera();
                LocalDate base = LocalDate.now().plusDays(1);
                int creadas = 0;
                for (Pelicula pelicula : cartelera) {
                    if (funcionRepository.existsByPeliculaId(pelicula.getId())) {
                        continue;
                    }
                    LocalDateTime inicio = LocalDateTime.of(
                            base.plusDays(creadas),
                            LocalTime.of(16 + (creadas % 4) * 2, 0));
                    LocalDateTime fin = inicio.plusMinutes(pelicula.getDuracionMinutos() + 30L);
                    funcionRepository.save(new Funcion(pelicula, sala, inicio, fin, PRECIO_DEMO));
                    creadas++;
                }
            }
        };
    }
}
