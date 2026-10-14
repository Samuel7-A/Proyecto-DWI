package com.cineverse.backend.dto;

import java.math.BigDecimal;

import com.cineverse.backend.entity.Producto;
import com.cineverse.backend.entity.Producto.Categoria;

/** Producto tal como lo ve el frontend. */
public record ProductoResponse(
        Long id,
        String nombre,
        Categoria categoria,
        BigDecimal precio,
        Boolean activo) {

    public static ProductoResponse desde(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getCategoria(),
                producto.getPrecio(),
                producto.getActivo());
    }
}
