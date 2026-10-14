package com.cineverse.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cineverse.backend.dto.SalaRequest;
import com.cineverse.backend.dto.SalaResponse;
import com.cineverse.backend.service.SalaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/salas")
public class SalaController {

    private final SalaService salaService;

    public SalaController(SalaService salaService) {
        this.salaService = salaService;
    }

    @GetMapping
    public ResponseEntity<List<SalaResponse>> listar() {
        return ResponseEntity.ok(salaService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalaResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(salaService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<SalaResponse> crear(@Valid @RequestBody SalaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salaService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalaResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody SalaRequest request) {
        return ResponseEntity.ok(salaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        salaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
