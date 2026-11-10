package com.cineverse.backend.controller;

import com.cineverse.backend.dto.NotificacionResponse;
import com.cineverse.backend.service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping
    public ResponseEntity<List<NotificacionResponse>> listar(Principal principal) {
        return ResponseEntity.ok(notificacionService.listar(principal.getName()));
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<Long> noLeidas(Principal principal) {
        return ResponseEntity.ok(notificacionService.noLeidas(principal.getName()));
    }

    @PutMapping("/{id}/leida")
    public ResponseEntity<Void> marcarLeida(@PathVariable Long id, Principal principal) {
        notificacionService.marcarLeida(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasLeidas(Principal principal) {
        notificacionService.marcarTodasLeidas(principal.getName());
        return ResponseEntity.noContent().build();
    }
}
