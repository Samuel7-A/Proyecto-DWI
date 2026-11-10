package com.cineverse.backend.dto;

import com.cineverse.backend.entity.Notificacion;

import java.time.LocalDateTime;

public class NotificacionResponse {

    private Long id;
    private String mensaje;
    private Boolean leida;
    private LocalDateTime fechaCreacion;

    public NotificacionResponse() {
    }

    public NotificacionResponse(Notificacion notificacion) {
        this.id = notificacion.getId();
        this.mensaje = notificacion.getMensaje();
        this.leida = notificacion.getLeida();
        this.fechaCreacion = notificacion.getFechaCreacion();
    }

    public Long getId() {
        return id;
    }

    public String getMensaje() {
        return mensaje;
    }

    public Boolean getLeida() {
        return leida;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}
