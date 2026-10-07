package com.cineverse.backend.dto;

public class LoginResponse {

    private String token;
    private String tipo;
    private String nombre;
    private String email;
    private String rol;

    public LoginResponse() {
    }

    public LoginResponse(
            String token,
            String tipo,
            String nombre,
            String email,
            String rol) {

        this.token = token;
        this.tipo = tipo;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}