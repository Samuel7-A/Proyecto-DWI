package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Asiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AsientoRepository extends JpaRepository<Asiento, Long> {

    @Query("""
        SELECT a
        FROM Asiento a
        WHERE a.sala.id = (
            SELECT f.sala.id
            FROM Funcion f
            WHERE f.id = :funcionId
        )
        AND NOT EXISTS (
            SELECT e.id
            FROM Entrada e
            WHERE e.funcion.id = :funcionId
              AND e.asiento.id = a.id
        )
        ORDER BY a.fila ASC, a.numero ASC
    """)
    List<Asiento> buscarAsientosDisponibles(@Param("funcionId") Long funcionId);
}