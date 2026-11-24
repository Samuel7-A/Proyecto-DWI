package com.cineverse.backend.repository;

import com.cineverse.backend.entity.DetalleProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DetalleProductoRepository extends JpaRepository<DetalleProducto, Long> {

    boolean existsByProductoId(Long productoId);

    @Query("SELECT d FROM DetalleProducto d JOIN FETCH d.producto WHERE d.orden.id = :ordenId ORDER BY d.id")
    List<DetalleProducto> buscarDetallePorOrden(@Param("ordenId") Long ordenId);
}