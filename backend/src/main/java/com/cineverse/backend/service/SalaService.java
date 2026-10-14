package com.cineverse.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cineverse.backend.dto.SalaRequest;
import com.cineverse.backend.dto.SalaResponse;
import com.cineverse.backend.entity.Asiento;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.FuncionRepository;
import com.cineverse.backend.repository.SalaRepository;

@Service
public class SalaService {

    /** Máximo de filas: una letra por fila (A-Z). */
    private static final int MAX_FILAS = 26;

    private final SalaRepository salaRepository;
    private final AsientoRepository asientoRepository;
    private final FuncionRepository funcionRepository;

    public SalaService(
            SalaRepository salaRepository,
            AsientoRepository asientoRepository,
            FuncionRepository funcionRepository) {
        this.salaRepository = salaRepository;
        this.asientoRepository = asientoRepository;
        this.funcionRepository = funcionRepository;
    }

    @Transactional(readOnly = true)
    public List<SalaResponse> listar() {
        return salaRepository.findAllByOrderByIdAsc().stream()
                .map(SalaResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public SalaResponse obtener(Long id) {
        return SalaResponse.desde(buscarSala(id));
    }

    @Transactional
    public SalaResponse crear(SalaRequest request) {
        validar(request);
        String nombre = request.nombre().trim();
        if (salaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new ConflictoException("Ya existe una sala con el nombre \"" + nombre + "\"");
        }

        Sala sala = salaRepository.save(new Sala(nombre, request.filas(), request.columnas()));
        asientoRepository.saveAll(construirAsientos(sala));

        return SalaResponse.desde(sala);
    }

    @Transactional
    public SalaResponse actualizar(Long id, SalaRequest request) {
        validar(request);
        Sala sala = buscarSala(id);
        String nombre = request.nombre().trim();

        if (salaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new ConflictoException("Ya existe una sala con el nombre \"" + nombre + "\"");
        }

        boolean cambiaDimensiones = !sala.getFilas().equals(request.filas())
                || !sala.getColumnas().equals(request.columnas());

        if (cambiaDimensiones && funcionRepository.existsBySalaId(id)) {
            throw new ConflictoException(
                    "No se pueden cambiar las dimensiones de una sala que ya tiene funciones asociadas.");
        }

        sala.setNombre(nombre);
        sala.setFilas(request.filas());
        sala.setColumnas(request.columnas());
        sala = salaRepository.save(sala);

        if (cambiaDimensiones) {
            asientoRepository.deleteBySalaId(id);
            asientoRepository.saveAll(construirAsientos(sala));
        }

        return SalaResponse.desde(sala);
    }

    @Transactional
    public void eliminar(Long id) {
        Sala sala = buscarSala(id);

        if (funcionRepository.existsBySalaId(id)) {
            throw new ConflictoException(
                    "No se puede eliminar la sala porque tiene funciones asociadas.");
        }

        asientoRepository.deleteBySalaId(id);
        salaRepository.delete(sala);
    }

    /**
     * (Re)genera los asientos de una sala a partir de sus dimensiones.
     * Útil para el inicializador de datos y para pruebas.
     */
    @Transactional
    public void generarAsientos(Long salaId) {
        Sala sala = buscarSala(salaId);
        asientoRepository.deleteBySalaId(salaId);
        asientoRepository.saveAll(construirAsientos(sala));
    }

    private List<Asiento> construirAsientos(Sala sala) {
        List<Asiento> asientos = new ArrayList<>();
        for (int f = 0; f < sala.getFilas(); f++) {
            String fila = String.valueOf((char) ('A' + f));
            for (int n = 1; n <= sala.getColumnas(); n++) {
                asientos.add(new Asiento(fila, n, sala));
            }
        }
        return asientos;
    }

    private void validar(SalaRequest request) {
        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new ConflictoException("El nombre de la sala es obligatorio");
        }
        if (request.filas() == null || request.filas() < 1 || request.filas() > MAX_FILAS) {
            throw new ConflictoException("La sala debe tener entre 1 y " + MAX_FILAS + " filas");
        }
        if (request.columnas() == null || request.columnas() < 1 || request.columnas() > 50) {
            throw new ConflictoException("La sala debe tener entre 1 y 50 columnas");
        }
    }

    private Sala buscarSala(Long id) {
        return salaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró la sala con id " + id));
    }
}
