package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Asiento;
import com.cineverse.backend.entity.Entrada;
import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.entity.Orden;
import com.cineverse.backend.entity.Usuario;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:entrada-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class EntradaRepositoryTest {

    @Autowired
    private EntradaRepository entradaRepository;

    @Autowired
    private PeliculaRepository peliculaRepository;

    @Autowired
    private SalaRepository salaRepository;

    @Autowired
    private AsientoRepository asientoRepository;

    @Autowired
    private FuncionRepository funcionRepository;

    @Autowired
    private OrdenRepository ordenRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void deberiaBuscarAsientosOcupadosPorFuncion() {

        Pelicula pelicula = new Pelicula();
        pelicula.setTitulo("JPQL Test");
        pelicula.setSinopsis("Película para probar JPQL.");
        pelicula.setGenero("Acción");
        pelicula.setDuracionMinutos(120);
        pelicula.setClasificacion("+12");
        pelicula.setFechaEstreno(LocalDate.of(2026, 1, 1));
        pelicula.setImagenUrl("test.jpg");
        pelicula.setEstado(true);

        pelicula = peliculaRepository.save(pelicula);

        Sala sala = new Sala("Sala Ocupados Test 20261006", 10, 10);
        sala = salaRepository.save(sala);

        Asiento asientoA1 = new Asiento("A", 1, sala);
        Asiento asientoA2 = new Asiento("A", 2, sala);

        asientoA1 = asientoRepository.save(asientoA1);
        asientoA2 = asientoRepository.save(asientoA2);

        Funcion funcion = new Funcion(
                pelicula,
                sala,
                LocalDateTime.of(2026, 10, 6, 20, 0),
                LocalDateTime.of(2026, 10, 6, 22, 0),
                new BigDecimal("25.00")
        );

        funcion = funcionRepository.save(funcion);

        Usuario usuario = usuarioRepository.findByEmail("cliente@cineverse.com")
                .orElseThrow();

        Orden orden = new Orden();
        orden.setUsuario(usuario);
        orden.setEstado(Orden.Estado.PAGADA);
        orden.setTotal(new BigDecimal("50.00"));

        orden = ordenRepository.save(orden);

        Entrada entrada1 = new Entrada(
                orden,
                funcion,
                asientoA1,
                new BigDecimal("25.00")
        );

        Entrada entrada2 = new Entrada(
                orden,
                funcion,
                asientoA2,
                new BigDecimal("25.00")
        );

        entradaRepository.save(entrada1);
        entradaRepository.save(entrada2);

        List<Asiento> resultado =
                entradaRepository.buscarAsientosOcupados(funcion.getId());

        assertThat(resultado).hasSize(2);

        assertThat(resultado.get(0).getFila())
                .isEqualTo("A");

        assertThat(resultado.get(0).getNumero())
                .isEqualTo(1);

        assertThat(resultado.get(1).getFila())
                .isEqualTo("A");

        assertThat(resultado.get(1).getNumero())
                .isEqualTo(2);
    }
}