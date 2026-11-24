
package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Funcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

public interface FuncionRepository extends JpaRepository<Funcion, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM Funcion f WHERE f.id = :id")
    Optional<Funcion> buscarParaActualizar(@Param("id") Long id);

    List<Funcion> findAllByOrderByFechaHoraAsc();

    @Query("""
        SELECT f
        FROM Funcion f
        JOIN FETCH f.pelicula
        JOIN FETCH f.sala
        WHERE f.pelicula.id = :peliculaId
        ORDER BY f.fechaHora ASC
        """)
    List<Funcion> buscarPorPelicula(@Param("peliculaId") Long peliculaId);

    @Query("""
        SELECT f FROM Funcion f JOIN FETCH f.pelicula p
        WHERE p.estado = true AND p.fechaEstreno <= :hoy
          AND f.cancelada = false AND f.fechaHora > :ahora
        ORDER BY f.fechaHora ASC
        """)
    List<Funcion> candidatasCartelera(@Param("hoy") java.time.LocalDate hoy,
            @Param("ahora") LocalDateTime ahora);

    boolean existsBySalaId(Long salaId);

    boolean existsByPeliculaId(Long peliculaId);

    /** Cuenta funciones activas que se solapan en una misma sala. */
    @Query("""
        SELECT COUNT(f)
        FROM Funcion f
        WHERE f.sala.id = :salaId
          AND f.cancelada = false
          AND f.fechaHora < :fin
          AND f.fechaHoraFin > :inicio
        """)
    long contarConflictos(
            @Param("salaId") Long salaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);

    /** Igual que contarConflictos, excluyendo una función (para edición). */
    @Query("""
        SELECT COUNT(f)
        FROM Funcion f
        WHERE f.sala.id = :salaId
          AND f.id <> :excluirId
          AND f.cancelada = false
          AND f.fechaHora < :fin
          AND f.fechaHoraFin > :inicio
        """)
    long contarConflictosExcluyendo(
            @Param("salaId") Long salaId,
            @Param("excluirId") Long excluirId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);
}