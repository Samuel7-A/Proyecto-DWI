
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
import com.cineverse.backend.repository.AsientoRepository;
import com.cineverse.backend.repository.SalaRepository;

@Service
public class SalaService {

    private final SalaRepository salaRepository;
    private final AsientoRepository asientoRepository;

    public SalaService(
            SalaRepository salaRepository,
            AsientoRepository asientoRepository) {
        this.salaRepository = salaRepository;
        this.asientoRepository = asientoRepository;
    }

    @Transactional
    public SalaResponse crear(SalaRequest request) {

        // Validar que no exista otra sala con el mismo nombre.
        if (salaRepository.existsByNombreIgnoreCase(
                request.getNombre().trim())) {
            throw new ConflictoException(
                    "Ya existe una sala con ese nombre.");
        }

        // Crear y guardar la sala.
        Sala sala = new Sala(
                request.getNombre().trim(),
                request.getFilas(),
                request.getColumnas());

        Sala salaGuardada = salaRepository.saveAndFlush(sala);

        // Generar todos los asientos de la sala.
        List<Asiento> asientos = new ArrayList<>();

        for (int i = 0; i < salaGuardada.getFilas(); i++) {

            String letraFila = String.valueOf((char) ('A' + i));

            for (int numero = 1;
                    numero <= salaGuardada.getColumnas();
                    numero++) {

                Asiento asiento = new Asiento(
                        letraFila,
                        numero,
                        salaGuardada);

                asientos.add(asiento);
            }
        }

        // Guardar los asientos dentro de la misma transacción.
        asientoRepository.saveAllAndFlush(asientos);

        // Devolver los datos de la sala creada.
        int totalAsientos = asientos.size();

        return new SalaResponse(
                salaGuardada.getId(),
                salaGuardada.getNombre(),
                salaGuardada.getFilas(),
                salaGuardada.getColumnas(),
                totalAsientos);
    }
}
