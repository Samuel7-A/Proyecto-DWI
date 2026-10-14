package com.cineverse.backend.dto;

import com.cineverse.backend.entity.Orden;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrdenResponse {

    private Long id;
    private String estado;
    private BigDecimal total;
    private LocalDateTime fechaCreacion;
    private String usuarioEmail;

    public OrdenResponse() {
    }

    public OrdenResponse(Orden orden) {
        this.id = orden.getId();
        this.estado = orden.getEstado().name();
        this.total = orden.getTotal();
        this.fechaCreacion = orden.getFechaCreacion();
        this.usuarioEmail = orden.getUsuario().getEmail();
    }

    public Long getId() {
        return id;
    }

    public String getEstado() {
        return estado;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }
}
