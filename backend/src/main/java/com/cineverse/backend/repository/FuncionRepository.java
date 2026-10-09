package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Funcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FuncionRepository extends JpaRepository<Funcion, Long> {

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
}