package com.cineverse.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de POST /api/salas y PUT /api/salas/{id}.
 * Al crear la sala se generan automáticamente filas × columnas asientos.
 */
public record SalaRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombre,

        @NotNull(message = "El número de filas es obligatorio")
        @Min(value = 1, message = "Debe haber al menos 1 fila")
        @Max(value = 26, message = "Máximo 26 filas (una letra por fila, de A a Z)")
        Integer filas,

        @NotNull(message = "El número de columnas es obligatorio")
        @Min(value = 1, message = "Debe haber al menos 1 columna")
        @Max(value = 50, message = "Máximo 50 columnas")
        Integer columnas) {
}
