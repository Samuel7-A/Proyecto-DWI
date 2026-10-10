
package com.cineverse.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.cineverse.backend.dto.SalaRequest;
import com.cineverse.backend.dto.SalaResponse;
import com.cineverse.backend.service.SalaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/salas")
@Validated
public class SalaController {

    private final SalaService salaService;

    public SalaController(SalaService salaService) {
        this.salaService = salaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalaResponse> crear(
            @Valid @RequestBody SalaRequest request) {

        SalaResponse respuesta = salaService.crear(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(respuesta);
    }
}
