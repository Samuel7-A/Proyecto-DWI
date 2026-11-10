package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Entrada;
import com.cineverse.backend.entity.Asiento;
import com.cineverse.backend.entity.Orden;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EntradaRepository extends JpaRepository<Entrada, Long> {

    boolean existsByFuncionId(Long funcionId);

    @Query("""
        SELECT e.asiento
        FROM Entrada e
        WHERE e.funcion.id = :funcionId
        ORDER BY e.asiento.fila ASC, e.asiento.numero ASC
    """)
    List<Asiento> buscarAsientosOcupados(@Param("funcionId") Long funcionId);

    /** Órdenes (únicas) que contienen al menos una entrada de la función. */
    @Query("""
        SELECT DISTINCT e.orden
        FROM Entrada e
        WHERE e.funcion.id = :funcionId
        """)
    List<Orden> buscarOrdenesPorFuncion(@Param("funcionId") Long funcionId);

    /** IDs de usuarios con entradas para la función (para notificaciones). */
    @Query("""
        SELECT DISTINCT e.orden.usuario.id
        FROM Entrada e
        WHERE e.funcion.id = :funcionId
        """)
    List<Long> buscarUsuarioIdsPorFuncion(@Param("funcionId") Long funcionId);
}