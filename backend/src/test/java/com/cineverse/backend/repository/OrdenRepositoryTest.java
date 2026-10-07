package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Orden;
import com.cineverse.backend.entity.Usuario;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:orden-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class OrdenRepositoryTest {

    @Autowired
    private OrdenRepository ordenRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void deberiaBuscarOrdenesPorUsuarioOrdenadasPorFecha() {

        Usuario usuario = usuarioRepository.findByEmail("cliente@cineverse.com")
                .orElseThrow();

        Orden orden1 = new Orden(
                usuario,
                Orden.Estado.PENDIENTE,
                new BigDecimal("20.00")
        );

        Orden orden2 = new Orden(
                usuario,
                Orden.Estado.PAGADA,
                new BigDecimal("40.00")
        );

        Orden orden3 = new Orden(
                usuario,
                Orden.Estado.CANCELADA,
                new BigDecimal("30.00")
        );

        orden1.setFechaCreacion(
                java.time.LocalDateTime.of(2026, 10, 6, 18, 0)
        );

        orden2.setFechaCreacion(
                java.time.LocalDateTime.of(2026, 10, 6, 19, 0)
        );

        orden3.setFechaCreacion(
                java.time.LocalDateTime.of(2026, 10, 6, 20, 0)
        );

        orden1 = ordenRepository.save(orden1);
        orden2 = ordenRepository.save(orden2);
        orden3 = ordenRepository.save(orden3);

        List<Orden> ordenes =
                ordenRepository.buscarPorUsuario(usuario.getId());

        assertEquals(3, ordenes.size());

        assertEquals(orden3.getId(), ordenes.get(0).getId());
        assertEquals(orden2.getId(), ordenes.get(1).getId());
        assertEquals(orden1.getId(), ordenes.get(2).getId());
    }
}