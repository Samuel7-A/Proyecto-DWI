package com.cineverse.backend.dto;

import com.cineverse.backend.entity.Sala;

public record SalaResponse(
        Long id,
        String nombre,
        Integer filas,
        Integer columnas,
        Integer totalAsientos) {

    public static SalaResponse desde(Sala sala) {
        return new SalaResponse(
                sala.getId(),
                sala.getNombre(),
                sala.getFilas(),
                sala.getColumnas(),
                sala.getFilas() * sala.getColumnas());
    }
}
