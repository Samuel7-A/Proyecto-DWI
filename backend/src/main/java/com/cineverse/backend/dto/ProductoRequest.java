package com.cineverse.backend.dto;

import java.math.BigDecimal;

import com.cineverse.backend.entity.Producto.Categoria;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de POST /api/productos y PUT /api/productos/{id}.
 *
 * "activo" es opcional: al crear, si no viene, el producto queda activo;
 * al actualizar, si no viene, se conserva el valor actual.
 */
public record ProductoRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombre,

        @NotNull(message = "La categoría es obligatoria")
        Categoria categoria,

        @NotNull(message = "El precio es obligatorio")
        @Positive(message = "El precio debe ser mayor que 0")
        @DecimalMax(value = "99999999.99", message = "El precio es demasiado alto")
        @Digits(integer = 8, fraction = 2, message = "El precio admite como máximo 2 decimales")
        BigDecimal precio,

        Boolean activo) {
}
