package com.cineverse.backend.dto;

import java.math.BigDecimal;
import com.cineverse.backend.entity.Producto.Categoria;
import jakarta.validation.constraints.*;

public record ProductoRequest(
    @NotBlank @Size(max = 150) String nombre,
    @NotNull Categoria categoria,
    @NotNull @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 8, fraction = 2) BigDecimal precio,
    @NotNull Boolean activo
) {}
