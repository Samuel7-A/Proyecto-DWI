package com.cineverse.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;

import static org.junit.jupiter.api.Assertions.*;

class CorsEtapa6Test {
    private CorsConfiguration cors(String origins) {
        SecurityConfig config = new SecurityConfig(null);
        ReflectionTestUtils.setField(config, "allowedOrigins", origins);
        return config.corsConfigurationSource().getCorsConfiguration(new MockHttpServletRequest("GET", "/api/peliculas"));
    }

    @Test void soloOrigenAutorizado() {
        var c = cors("https://cineverse.example.test");
        assertNotNull(c);
        assertEquals("https://cineverse.example.test", c.checkOrigin("https://cineverse.example.test"));
        assertNull(c.checkOrigin("https://otro.example.test"));
        assertNull(c.checkOrigin("http://localhost:4200"));
        assertTrue(c.getAllowedHeaders().contains("Authorization"));
    }

    @Test void sinOrigenConfiguradoNoPermiteCors() {
        var c = cors("");
        assertNotNull(c);
        assertNull(c.checkOrigin("https://cineverse.example.test"));
    }

    @Test void rechazaComodinesYRutas() {
        assertThrows(IllegalArgumentException.class, () -> cors("*"));
        assertThrows(IllegalArgumentException.class, () -> cors("https://cineverse.example.test/api"));
        assertThrows(IllegalArgumentException.class, () -> cors("http://otro.example.test"));
    }
}
