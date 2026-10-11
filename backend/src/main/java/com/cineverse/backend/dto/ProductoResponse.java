package com.cineverse.backend.dto;

import java.math.BigDecimal;
import com.cineverse.backend.entity.Producto;
import com.cineverse.backend.entity.Producto.Categoria;

public record ProductoResponse(Long id, String nombre, Categoria categoria, BigDecimal precio, Boolean activo) {
    public static ProductoResponse desde(Producto p) {
        return new ProductoResponse(p.getId(), p.getNombre(), p.getCategoria(), p.getPrecio(), p.getActivo());
    }
}
