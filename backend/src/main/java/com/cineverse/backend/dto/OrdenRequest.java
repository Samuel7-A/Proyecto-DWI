package com.cineverse.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class OrdenRequest {

    @NotNull(message = "El ID de la función es obligatorio")
    private Long funcionId;

    @NotEmpty(message = "Debe seleccionar al menos un asiento")
    private List<Long> asientoIds;

    @Valid
    private List<ItemProductoRequest> productos;

    public OrdenRequest() {
    }

    public OrdenRequest(Long funcionId, List<Long> asientoIds, List<ItemProductoRequest> productos) {
        this.funcionId = funcionId;
        this.asientoIds = asientoIds;
        this.productos = productos;
    }

    public Long getFuncionId() {
        return funcionId;
    }

    public void setFuncionId(Long funcionId) {
        this.funcionId = funcionId;
    }

    public List<Long> getAsientoIds() {
        return asientoIds;
    }

    public void setAsientoIds(List<Long> asientoIds) {
        this.asientoIds = asientoIds;
    }

    public List<ItemProductoRequest> getProductos() {
        return productos;
    }

    public void setProductos(List<ItemProductoRequest> productos) {
        this.productos = productos;
    }
}
