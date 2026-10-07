package com.cineverse.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.service.PeliculaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/peliculas")
@CrossOrigin(origins = "*")
public class PeliculaController {

    private final PeliculaService peliculaService;

    public PeliculaController(PeliculaService peliculaService) {
        this.peliculaService = peliculaService;
    }

    @GetMapping
    public ResponseEntity<List<Pelicula>> listarPeliculas() {
        return ResponseEntity.ok(peliculaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pelicula> obtenerPelicula(@PathVariable Long id) {
        return ResponseEntity.ok(peliculaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Pelicula> crearPelicula(@Valid @RequestBody Pelicula pelicula) {
        return ResponseEntity.status(HttpStatus.CREATED).body(peliculaService.crear(pelicula));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pelicula> actualizarPelicula(
            @PathVariable Long id,
            @Valid @RequestBody Pelicula pelicula) {
        return ResponseEntity.ok(peliculaService.actualizar(id, pelicula));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPelicula(@PathVariable Long id) {
        peliculaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cartelera")
    public ResponseEntity<List<Pelicula>> listarCartelera() {
        return ResponseEntity.ok(peliculaService.listarCartelera());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Pelicula>> buscar(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String texto) {

        if (titulo != null && !titulo.isBlank()) {
            return ResponseEntity.ok(
                    peliculaService.buscarPorTitulo(titulo)
            );
        }

        if (texto != null && !texto.isBlank()) {
            return ResponseEntity.ok(
                    peliculaService.buscarPorTituloOGenero(texto)
            );
        }

        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/genero/{genero}")
    public ResponseEntity<List<Pelicula>> buscarPorGenero(
            @PathVariable String genero) {

        return ResponseEntity.ok(
                peliculaService.buscarPorGenero(genero)
        );
    }

}