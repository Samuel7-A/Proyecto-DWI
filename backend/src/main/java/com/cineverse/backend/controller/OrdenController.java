package com.cineverse.backend.controller;

import com.cineverse.backend.dto.OrdenRequest;
import com.cineverse.backend.dto.OrdenResponse;
import com.cineverse.backend.service.OrdenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {

    private final OrdenService ordenService;

    public OrdenController(OrdenService ordenService) {
        this.ordenService = ordenService;
    }

    @PostMapping
    public ResponseEntity<OrdenResponse> crearOrden(
            @Valid @RequestBody OrdenRequest request,
            Principal principal) {
        String email = principal.getName();
        OrdenResponse response = ordenService.crearOrden(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<OrdenResponse>> listarOrdenes(
            Authentication authentication,
            Principal principal) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<OrdenResponse> ordenes;
        if (isAdmin) {
            ordenes = ordenService.listarTodas();
        } else {
            ordenes = ordenService.listarPorUsuario(principal.getName());
        }
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenResponse> obtenerOrden(
            @PathVariable Long id,
            Authentication authentication,
            Principal principal) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        OrdenResponse response = ordenService.obtenerPorId(id, principal.getName(), isAdmin);
        return ResponseEntity.ok(response);
    }
}
