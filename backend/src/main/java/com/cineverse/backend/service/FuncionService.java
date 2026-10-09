package com.cineverse.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cineverse.backend.dto.AsientoResponse;
import com.cineverse.backend.dto.FuncionRequest;
import com.cineverse.backend.dto.FuncionResponse;
import com.cineverse.backend.entity.Funcion;
import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.entity.Sala;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.EntradaRepository;
import com.cineverse.backend.repository.FuncionRepository;
import com.cineverse.backend.repository.PeliculaRepository;
import com.cineverse.backend.repository.SalaRepository;

@Service
public class FuncionService {

    private final FuncionRepository funcionRepository;
    private final PeliculaRepository peliculaRepository;
    private final SalaRepository salaRepository;
    private final AsientoRepository asientoRepository;
    private final EntradaRepository entradaRepository;

    public FuncionService(
            FuncionRepository funcionRepository,
            PeliculaRepository peliculaRepository,
            SalaRepository salaRepository,
            AsientoRepository asientoRepository,
            EntradaRepository entradaRepository) {
        this.funcionRepository = funcionRepository;
        this.peliculaRepository = peliculaRepository;
        this.salaRepository = salaRepository;
        this.asientoRepository = asientoRepository;
        this.entradaRepository = entradaRepository;
    }

    @Transactional(readOnly = true)
    public List<FuncionResponse> listar(Long peliculaId) {
        List<Funcion> funciones = peliculaId == null
                ? funcionRepository.findAllByOrderByFechaHoraAsc()
                : funcionRepository.buscarPorPelicula(peliculaId);
        return funciones.stream().map(FuncionResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public FuncionResponse obtener(Long id) {
        return FuncionResponse.desde(buscarFuncion(id));
    }

    @Transactional
    public FuncionResponse crear(FuncionRequest request) {
        validarHorario(request);
        Pelicula pelicula = peliculaRepository.findById(request.peliculaId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No se encontró la película con id " + request.peliculaId()));
        Sala sala = salaRepository.findById(request.salaId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No se encontró la sala con id " + request.salaId()));

        Funcion funcion = new Funcion(
                pelicula,
                sala,
                request.fechaHora(),
                request.fechaHoraFin(),
                request.precio());
        return FuncionResponse.desde(funcionRepository.save(funcion));
    }

    @Transactional
    public FuncionResponse actualizar(Long id, FuncionRequest request) {
        validarHorario(request);
        Funcion funcion = buscarFuncion(id);
        Pelicula pelicula = peliculaRepository.findById(request.peliculaId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No se encontró la película con id " + request.peliculaId()));
        Sala sala = salaRepository.findById(request.salaId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No se encontró la sala con id " + request.salaId()));

        funcion.setPelicula(pelicula);
        funcion.setSala(sala);
        funcion.setFechaHora(request.fechaHora());
        funcion.setFechaHoraFin(request.fechaHoraFin());
        funcion.setPrecio(request.precio());
        return FuncionResponse.desde(funcionRepository.save(funcion));
    }

    @Transactional
    public void eliminar(Long id) {
        Funcion funcion = buscarFuncion(id);
        if (entradaRepository.existsByFuncionId(id)) {
            throw new ConflictoException(
                    "No se puede eliminar la función porque ya tiene entradas asociadas.");
        }
        funcionRepository.delete(funcion);
    }

    @Transactional(readOnly = true)
    public List<AsientoResponse> listarAsientosDisponibles(Long funcionId) {
        buscarFuncion(funcionId);
        return asientoRepository.buscarAsientosDisponibles(funcionId).stream()
                .map(AsientoResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AsientoResponse> listarAsientosOcupados(Long funcionId) {
        buscarFuncion(funcionId);
        return entradaRepository.buscarAsientosOcupados(funcionId).stream()
                .map(AsientoResponse::desde)
                .toList();
    }

    private Funcion buscarFuncion(Long id) {
        return funcionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No se encontró la función con id " + id));
    }

    private void validarHorario(FuncionRequest request) {
        if (request.fechaHora() != null
                && request.fechaHoraFin() != null
                && !request.fechaHoraFin().isAfter(request.fechaHora())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha y hora de fin debe ser posterior a la de inicio.");
        }
    }
}
