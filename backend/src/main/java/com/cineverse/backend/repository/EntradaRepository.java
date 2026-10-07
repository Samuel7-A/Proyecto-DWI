package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Entrada;
import com.cineverse.backend.entity.Asiento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EntradaRepository extends JpaRepository<Entrada, Long> {

    @Query("""
        SELECT e.asiento
        FROM Entrada e
        WHERE e.funcion.id = :funcionId
        ORDER BY e.asiento.fila ASC, e.asiento.numero ASC
    """)
    List<Asiento> buscarAsientosOcupados(@Param("funcionId") Long funcionId);
}