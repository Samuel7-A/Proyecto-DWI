package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Pelicula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PeliculaRepository extends JpaRepository<Pelicula, Long> {

    @Query("""
        SELECT p
        FROM Pelicula p
        WHERE p.estado = true
        ORDER BY p.fechaEstreno ASC
    """)
    List<Pelicula> findPeliculasEnCartelera();

    @Query("""
        SELECT p
        FROM Pelicula p
        WHERE LOWER(p.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))
    """)
    List<Pelicula> buscarPorTitulo(@Param("titulo") String titulo);

    @Query("""
        SELECT p
        FROM Pelicula p
        WHERE LOWER(p.genero) = LOWER(:genero)
    """)
    List<Pelicula> buscarPorGenero(@Param("genero") String genero);

    @Query("""
        SELECT p
        FROM Pelicula p
        WHERE LOWER(p.titulo) LIKE LOWER(CONCAT('%', :texto, '%'))
           OR LOWER(p.genero) LIKE LOWER(CONCAT('%', :texto, '%'))
    """)
    List<Pelicula> buscarPorTituloOGenero(@Param("texto") String texto);
}