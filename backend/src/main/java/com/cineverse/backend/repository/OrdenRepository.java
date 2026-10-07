package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrdenRepository extends JpaRepository<Orden, Long> {

    @Query("""
        SELECT o
        FROM Orden o
        WHERE o.usuario.id = :usuarioId
        ORDER BY o.fechaCreacion DESC
    """)
    List<Orden> buscarPorUsuario(@Param("usuarioId") Long usuarioId);
}