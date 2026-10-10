
package com.cineverse.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SalaRequest {

    @NotBlank(message = "El nombre de la sala es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
    private String nombre;

    @NotNull(message = "La cantidad de filas es obligatoria")
    @Min(value = 1, message = "Debe existir al menos una fila")
    @Max(value = 26, message = "El máximo permitido es 26 filas")
    private Integer filas;

    @NotNull(message = "La cantidad de columnas es obligatoria")
    @Min(value = 1, message = "Debe existir al menos una columna")
    @Max(value = 50, message = "El máximo permitido es 50 columnas")
    private Integer columnas;

    public SalaRequest() {
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getFilas() {
        return filas;
    }

    public void setFilas(Integer filas) {
        this.filas = filas;
    }

    public Integer getColumnas() {
        return columnas;
    }

    public void setColumnas(Integer columnas) {
        this.columnas = columnas;
    }
}
