package com.cineverse.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.cineverse.backend.entity.Funcion;

public record FuncionResponse(
        Long id,
        Long peliculaId,
        String peliculaTitulo,
        Long salaId,
        String salaNombre,
        LocalDateTime fechaHora,
        LocalDateTime fechaHoraFin,
        BigDecimal precio) {

    public static FuncionResponse desde(Funcion funcion) {
        return new FuncionResponse(
                funcion.getId(),
                funcion.getPelicula().getId(),
                funcion.getPelicula().getTitulo(),
                funcion.getSala().getId(),
                funcion.getSala().getNombre(),
                funcion.getFechaHora(),
                funcion.getFechaHoraFin(),
                funcion.getPrecio());
    }
}
