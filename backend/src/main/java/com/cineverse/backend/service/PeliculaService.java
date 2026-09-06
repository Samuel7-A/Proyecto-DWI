package com.cineverse.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.exception.PeliculaNotFoundException;
import com.cineverse.backend.repository.PeliculaRepository;

@Service
public class PeliculaService {

    private final PeliculaRepository peliculaRepository;

    public PeliculaService(PeliculaRepository peliculaRepository) {
        this.peliculaRepository = peliculaRepository;
    }

    public List<Pelicula> listarTodas() {
        return peliculaRepository.findAll();
    }

    public Pelicula buscarPorId(Long id) {
        return peliculaRepository.findById(id)
                .orElseThrow(() -> new PeliculaNotFoundException(id));
    }

    public Pelicula crear(Pelicula pelicula) {
        return peliculaRepository.save(pelicula);
    }

    public Pelicula actualizar(Long id, Pelicula datosActualizados) {
        Pelicula pelicula = buscarPorId(id);
        pelicula.setTitulo(datosActualizados.getTitulo());
        pelicula.setSinopsis(datosActualizados.getSinopsis());
        pelicula.setGenero(datosActualizados.getGenero());
        pelicula.setDuracionMinutos(datosActualizados.getDuracionMinutos());
        pelicula.setClasificacion(datosActualizados.getClasificacion());
        pelicula.setFechaEstreno(datosActualizados.getFechaEstreno());
        pelicula.setImagenUrl(datosActualizados.getImagenUrl());
        pelicula.setEstado(datosActualizados.getEstado());
        return peliculaRepository.save(pelicula);
    }

    public void eliminar(Long id) {
        Pelicula pelicula = buscarPorId(id);
        peliculaRepository.delete(pelicula);
    }
}