package com.cineverse.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/** Regla única del servidor; no cambia registros históricos. */
public final class ReglasCartelera {
    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private ReglasCartelera() {}
    public static LocalDateTime ahora() { return LocalDateTime.now(LIMA); }
    public static boolean horarioValido(LocalDate estreno, Integer duracion,
            LocalDateTime inicio, LocalDateTime fin) {
        if (estreno == null || duracion == null || duracion <= 0 || inicio == null || fin == null
                || inicio.toLocalDate().isBefore(estreno)) return false;
        LocalDateTime minimo = inicio.plusMinutes(duracion);
        // Compatibilidad con el inicializador antiguo: hasta 30 min de margen.
        return !fin.isBefore(minimo) && !fin.isAfter(minimo.plusMinutes(30));
    }
    public static boolean vendible(Boolean activa, LocalDate estreno, Integer duracion,
            Boolean cancelada, LocalDateTime inicio, LocalDateTime fin, LocalDateTime ahora) {
        return Boolean.TRUE.equals(activa) && Boolean.FALSE.equals(cancelada)
                && estreno != null && !estreno.isAfter(ahora.toLocalDate())
                && inicio != null && inicio.isAfter(ahora)
                && horarioValido(estreno, duracion, inicio, fin);
    }
}
