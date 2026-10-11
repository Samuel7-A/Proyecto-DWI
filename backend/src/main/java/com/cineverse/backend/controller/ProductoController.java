package com.cineverse.backend.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.cineverse.backend.dto.ProductoRequest;
import com.cineverse.backend.dto.ProductoResponse;
import com.cineverse.backend.service.ProductoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoService service;
    public ProductoController(ProductoService service) { this.service = service; }

    // Por defecto se muestran solo productos activos. ADMIN puede consultar todos con ?soloActivos=false.
    @GetMapping
    public List<ProductoResponse> listar(@RequestParam(defaultValue = "true") boolean soloActivos) {
        return service.listar(soloActivos);
    }

    @GetMapping("/{id}")
    public ProductoResponse obtener(@PathVariable Long id) { return service.obtener(id); }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @PutMapping("/{id}")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
