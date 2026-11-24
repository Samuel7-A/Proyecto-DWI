package com.cineverse.backend.service;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class ReglasCarteleraTest {
    private final LocalDateTime ahora = LocalDateTime.of(2030, 5, 10, 12, 0);
    private final LocalDateTime inicio = ahora.plusHours(1);
    @Test void futuroValido() { assertTrue(ReglasCartelera.vendible(true, ahora.toLocalDate(), 120, false, inicio, inicio.plusHours(2), ahora)); }
    @Test void cancelada() { assertFalse(ReglasCartelera.vendible(true, ahora.toLocalDate(), 120, true, inicio, inicio.plusHours(2), ahora)); }
    @Test void iniciada() { assertFalse(ReglasCartelera.vendible(true, ahora.toLocalDate(), 120, false, ahora, ahora.plusHours(2), ahora)); }
    @Test void retirada() { assertFalse(ReglasCartelera.vendible(false, ahora.toLocalDate(), 120, false, inicio, inicio.plusHours(2), ahora)); }
    @Test void preestreno() { assertFalse(ReglasCartelera.vendible(true, ahora.toLocalDate().plusDays(1), 120, false, inicio.plusDays(2), inicio.plusDays(2).plusHours(2), ahora)); }
    @Test void horarioAnteriorAlEstreno() { assertFalse(ReglasCartelera.horarioValido(ahora.toLocalDate().plusDays(1),120,inicio,inicio.plusHours(2))); }
    @Test void horarioDeDiasNoVendible() { assertFalse(ReglasCartelera.vendible(true, ahora.toLocalDate(), 120, false, inicio, inicio.plusDays(4), ahora)); }
    @Test void margenHistorico() { assertTrue(ReglasCartelera.horarioValido(ahora.toLocalDate(),120,inicio,inicio.plusMinutes(150))); assertFalse(ReglasCartelera.horarioValido(ahora.toLocalDate(),120,inicio,inicio.plusMinutes(151))); }
}
