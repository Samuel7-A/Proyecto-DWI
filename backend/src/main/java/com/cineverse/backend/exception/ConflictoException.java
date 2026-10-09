package com.cineverse.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * TEMPORAL: versión mínima para que el módulo Productos compile.
 * La versión definitiva es de Samuel (GlobalExceptionHandler): al hacer
 * merge, quedarse con la de Samuel y borrar esta.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictoException extends RuntimeException {

    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}
