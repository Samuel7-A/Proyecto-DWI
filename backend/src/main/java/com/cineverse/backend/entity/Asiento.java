package com.cineverse.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

@Entity
@Table(
    name = "asientos",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_asiento_sala_fila_numero",
            columnNames = {"sala_id", "fila", "numero"}
        )
    }
)
public class Asiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Pattern(regexp = "^[A-Z]$")
    @Column(nullable = false, length = 1)
    private String fila;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer numero;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sala_id", nullable = false)
    private Sala sala;

    public Asiento() {
    }

    public Asiento(String fila, Integer numero, Sala sala) {
        this.fila = fila;
        this.numero = numero;
        this.sala = sala;
    }

    public Long getId() {
        return id;
    }

    public String getFila() {
        return fila;
    }

    public void setFila(String fila) {
        this.fila = fila;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public Sala getSala() {
        return sala;
    }

    public void setSala(Sala sala) {
        this.sala = sala;
    }
}