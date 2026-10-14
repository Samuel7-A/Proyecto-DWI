package com.cineverse.backend.repository;

import com.cineverse.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    List<Producto> findByActivoTrueOrderByIdAsc();

    List<Producto> findAllByOrderByIdAsc();
}