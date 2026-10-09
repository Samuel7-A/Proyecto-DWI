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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cineverse.backend.dto.AsientoResponse;
import com.cineverse.backend.dto.FuncionRequest;
import com.cineverse.backend.dto.FuncionResponse;
import com.cineverse.backend.service.FuncionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/funciones")
public class FuncionController {

    private final FuncionService funcionService;

    public FuncionController(FuncionService funcionService) {
        this.funcionService = funcionService;
    }

    @GetMapping
    public ResponseEntity<List<FuncionResponse>> listar(
            @RequestParam(required = false) Long peliculaId) {
        return ResponseEntity.ok(funcionService.listar(peliculaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuncionResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(funcionService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<FuncionResponse> crear(
            @Valid @RequestBody FuncionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(funcionService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuncionResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody FuncionRequest request) {
        return ResponseEntity.ok(funcionService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        funcionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/asientos/disponibles")
    public ResponseEntity<List<AsientoResponse>> listarAsientosDisponibles(
            @PathVariable Long id) {
        return ResponseEntity.ok(funcionService.listarAsientosDisponibles(id));
    }

    @GetMapping("/{id}/asientos/ocupados")
    public ResponseEntity<List<AsientoResponse>> listarAsientosOcupados(
            @PathVariable Long id) {
        return ResponseEntity.ok(funcionService.listarAsientosOcupados(id));
    }
}
