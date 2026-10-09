package com.cineverse.backend.dto;

import com.cineverse.backend.entity.Asiento;

public record AsientoResponse(
        Long id,
        String fila,
        Integer numero) {

    public static AsientoResponse desde(Asiento asiento) {
        return new AsientoResponse(
                asiento.getId(),
                asiento.getFila(),
                asiento.getNumero());
    }
}
