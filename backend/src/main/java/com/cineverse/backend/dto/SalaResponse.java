
package com.cineverse.backend.dto;

public class SalaResponse {

    private Long id;
    private String nombre;
    private Integer filas;
    private Integer columnas;
    private Integer totalAsientos;

    public SalaResponse() {
    }

    public SalaResponse(
            Long id,
            String nombre,
            Integer filas,
            Integer columnas,
            Integer totalAsientos) {
        this.id = id;
        this.nombre = nombre;
        this.filas = filas;
        this.columnas = columnas;
        this.totalAsientos = totalAsientos;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public Integer getFilas() {
        return filas;
    }

    public Integer getColumnas() {
        return columnas;
    }

    public Integer getTotalAsientos() {
        return totalAsientos;
    }
}
