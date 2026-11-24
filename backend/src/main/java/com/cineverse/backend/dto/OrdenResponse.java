package com.cineverse.backend.dto;

import com.cineverse.backend.entity.Orden;
import com.cineverse.backend.entity.Entrada;
import com.cineverse.backend.entity.DetalleProducto;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrdenResponse {

    private Long id;
    private String estado;
    private BigDecimal total;
    private LocalDateTime fechaCreacion;
    private String usuarioEmail;
    private List<EntradaDetalle> entradas = List.of();
    private List<ProductoDetalle> productos = List.of();

    public record EntradaDetalle(Long id, Long funcionId, String peliculaTitulo,
            String salaNombre, LocalDateTime fechaHora, String fila, Integer numero,
            BigDecimal precioUnitario) {
        public static EntradaDetalle desde(Entrada e) {
            return new EntradaDetalle(e.getId(), e.getFuncion().getId(),
                    e.getFuncion().getPelicula().getTitulo(), e.getFuncion().getSala().getNombre(),
                    e.getFuncion().getFechaHora(), e.getAsiento().getFila(),
                    e.getAsiento().getNumero(), e.getPrecioUnitario());
        }
    }

    public record ProductoDetalle(Long id, String nombre, Integer cantidad,
            BigDecimal precioUnitario, BigDecimal subtotal) {
        public static ProductoDetalle desde(DetalleProducto d) {
            return new ProductoDetalle(d.getId(), d.getProducto().getNombre(), d.getCantidad(),
                    d.getPrecioUnitario(), d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())));
        }
    }

    public OrdenResponse(Orden orden, List<Entrada> entradas, List<DetalleProducto> productos) {
        this(orden);
        this.entradas = entradas.stream().map(EntradaDetalle::desde).toList();
        this.productos = productos.stream().map(ProductoDetalle::desde).toList();
    }

    public List<EntradaDetalle> getEntradas() { return entradas; }
    public List<ProductoDetalle> getProductos() { return productos; }

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
