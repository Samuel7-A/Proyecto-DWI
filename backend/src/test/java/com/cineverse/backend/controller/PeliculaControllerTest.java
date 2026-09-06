package com.cineverse.backend.controller;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.service.PeliculaService;

@WebMvcTest(PeliculaController.class)
class PeliculaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PeliculaService peliculaService;

    @Test
    void postCreaPeliculaYDevuelve201() throws Exception {
        when(peliculaService.crear(any(Pelicula.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/peliculas")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "CineVerse",
                                  "sinopsis": "Una historia de cine",
                                  "genero": "Drama",
                                  "duracionMinutos": 120,
                                  "clasificacion": "+12",
                                  "fechaEstreno": "2026-09-06",
                                  "imagenUrl": "https://example.com/pelicula.jpg",
                                  "estado": true
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void postRechazaPeliculaInvalida() throws Exception {
        mockMvc.perform(post("/api/peliculas")
                        .contentType(APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}