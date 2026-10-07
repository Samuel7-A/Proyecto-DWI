package com.cineverse.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cineverse.backend.entity.Pelicula;
import com.cineverse.backend.exception.PeliculaNotFoundException;
import com.cineverse.backend.repository.PeliculaRepository;

@Service
public class PeliculaService {

    private final PeliculaRepository peliculaRepository;

    public PeliculaService(PeliculaRepository peliculaRepository) {
        this.peliculaRepository = peliculaRepository;
    }

    @Transactional(readOnly = true)
    public List<Pelicula> listarTodas() {
        return peliculaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Pelicula buscarPorId(Long id) {
        return peliculaRepository.findById(id)
                .orElseThrow(() -> new PeliculaNotFoundException(id));
    }

    @Transactional
    public Pelicula crear(Pelicula pelicula) {
        return peliculaRepository.save(pelicula);
    }

    @Transactional
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

    @Transactional
    public void eliminar(Long id) {

        Pelicula pelicula = buscarPorId(id);

        peliculaRepository.delete(pelicula);
    }

    // =========================
    // CONSULTAS JPQL
    // =========================

    @Transactional(readOnly = true)
    public List<Pelicula> listarCartelera() {
        return peliculaRepository.findPeliculasEnCartelera();
    }

    @Transactional(readOnly = true)
    public List<Pelicula> buscarPorTitulo(String titulo) {
        return peliculaRepository.buscarPorTitulo(titulo);
    }

    @Transactional(readOnly = true)
    public List<Pelicula> buscarPorGenero(String genero) {
        return peliculaRepository.buscarPorGenero(genero);
    }

    @Transactional(readOnly = true)
    public List<Pelicula> buscarPorTituloOGenero(String texto) {
        return peliculaRepository.buscarPorTituloOGenero(texto);
    }
}