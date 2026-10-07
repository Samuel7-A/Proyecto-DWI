package com.cineverse.backend.repository;

import com.cineverse.backend.entity.DetalleProducto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleProductoRepository extends JpaRepository<DetalleProducto, Long> {
}