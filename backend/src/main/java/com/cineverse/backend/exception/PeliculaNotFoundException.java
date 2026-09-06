package com.cineverse.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PeliculaNotFoundException extends RuntimeException {

    public PeliculaNotFoundException(Long id) {
        super("No se encontró la película con id " + id);
    }
}