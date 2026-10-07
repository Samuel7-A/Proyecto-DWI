package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Asiento;
import com.cineverse.backend.entity.Entrada;
import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Orden;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.entity.Usuario;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:asiento-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AsientoRepositoryTest {

    @Autowired
    private AsientoRepository asientoRepository;

    @Autowired
    private SalaRepository salaRepository;

    @Autowired
    private PeliculaRepository peliculaRepository;

    @Autowired
    private FuncionRepository funcionRepository;

    @Autowired
    private EntradaRepository entradaRepository;

    @Autowired
    private OrdenRepository ordenRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void deberiaBuscarAsientosDisponiblesPorFuncion() {

        Usuario usuario = usuarioRepository.findByEmail("cliente@cineverse.com")
                .orElseThrow();

        Pelicula pelicula = new Pelicula();
        pelicula.setTitulo("JPQL Disponibles Test");
        pelicula.setSinopsis("Prueba");
        pelicula.setGenero("Acción");
        pelicula.setDuracionMinutos(120);
        pelicula.setClasificacion("+12");
        pelicula.setFechaEstreno(LocalDate.now());
        pelicula.setEstado(true);

        pelicula = peliculaRepository.save(pelicula);

        Sala sala = new Sala();
        sala.setNombre("Sala Disponibles Test");
        sala.setFilas(1);
        sala.setColumnas(4);

        sala = salaRepository.save(sala);

        Asiento a1 = new Asiento("A", 1, sala);
        Asiento a2 = new Asiento("A", 2, sala);
        Asiento a3 = new Asiento("A", 3, sala);

        a1 = asientoRepository.save(a1);
        a2 = asientoRepository.save(a2);
        a3 = asientoRepository.save(a3);

        Funcion funcion = new Funcion();
        funcion.setPelicula(pelicula);
        funcion.setSala(sala);
        funcion.setFechaHora(
                LocalDateTime.of(2026, 10, 6, 20, 0)
        );
        funcion.setFechaHoraFin(
                LocalDateTime.of(2026, 10, 6, 22, 0)
        );
        funcion.setPrecio(new BigDecimal("20.00"));

        funcion = funcionRepository.save(funcion);

        Orden orden = new Orden(
                usuario,
                Orden.Estado.PAGADA,
                new BigDecimal("20.00")
        );

        orden = ordenRepository.save(orden);

        Entrada entrada = new Entrada();
        entrada.setOrden(orden);
        entrada.setFuncion(funcion);
        entrada.setAsiento(a2);
        entrada.setPrecioUnitario(new BigDecimal("20.00"));

        entradaRepository.save(entrada);

        List<Asiento> disponibles =
                asientoRepository.buscarAsientosDisponibles(funcion.getId());

        assertEquals(2, disponibles.size());

        assertEquals(a1.getId(), disponibles.get(0).getId());
        assertEquals(a3.getId(), disponibles.get(1).getId());
    }
}