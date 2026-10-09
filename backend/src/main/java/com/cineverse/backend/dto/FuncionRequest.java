package com.cineverse.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record FuncionRequest(

        @NotNull(message = "La película es obligatoria")
        Long peliculaId,

        @NotNull(message = "La sala es obligatoria")
        Long salaId,

        @NotNull(message = "La fecha y hora de inicio son obligatorias")
        LocalDateTime fechaHora,

        @NotNull(message = "La fecha y hora de fin son obligatorias")
        LocalDateTime fechaHoraFin,

        @NotNull(message = "El precio es obligatorio")
        @Positive(message = "El precio debe ser mayor que 0")
        @Digits(integer = 8, fraction = 2, message = "El precio admite como máximo 2 decimales")
        BigDecimal precio) {
}
