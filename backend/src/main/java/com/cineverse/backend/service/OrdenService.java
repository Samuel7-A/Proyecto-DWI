package com.cineverse.backend.service;

import com.cineverse.backend.dto.ItemProductoRequest;
import com.cineverse.backend.dto.OrdenRequest;
import com.cineverse.backend.dto.OrdenResponse;
import com.cineverse.backend.entity.*;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrdenService {

    private final OrdenRepository ordenRepository;
    private final UsuarioRepository usuarioRepository;
    private final FuncionRepository funcionRepository;
    private final AsientoRepository asientoRepository;
    private final EntradaRepository entradaRepository;
    private final ProductoRepository productoRepository;
    private final DetalleProductoRepository detalleProductoRepository;

    public OrdenService(
            OrdenRepository ordenRepository,
            UsuarioRepository usuarioRepository,
            FuncionRepository funcionRepository,
            AsientoRepository asientoRepository,
            EntradaRepository entradaRepository,
            ProductoRepository productoRepository,
            DetalleProductoRepository detalleProductoRepository) {
        this.ordenRepository = ordenRepository;
        this.usuarioRepository = usuarioRepository;
        this.funcionRepository = funcionRepository;
        this.asientoRepository = asientoRepository;
        this.entradaRepository = entradaRepository;
        this.productoRepository = productoRepository;
        this.detalleProductoRepository = detalleProductoRepository;
    }

    @Transactional
    public OrdenResponse crearOrden(String userEmail, OrdenRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        validarSeleccion(request);
        Funcion funcion = funcionRepository.buscarParaActualizar(request.getFuncionId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Función no encontrada"));

        // Reglas de negocio: no se puede comprar una función cancelada,
        // ya iniciada o de una película retirada de cartelera.
        if (Boolean.TRUE.equals(funcion.getCancelada())) {
            throw new ConflictoException("La función fue cancelada y no acepta compras.");
        }
        if (funcion.getFechaHora() == null || !funcion.getFechaHora().isAfter(ReglasCartelera.ahora())) {
            throw new ConflictoException("La función ya comenzó y no acepta compras.");
        }
        if (funcion.getPelicula().getEstado() != null && !funcion.getPelicula().getEstado()) {
            throw new ConflictoException("La película fue retirada de cartelera y no acepta compras.");
        }

        if (!ReglasCartelera.vendible(funcion.getPelicula().getEstado(),
                funcion.getPelicula().getFechaEstreno(), funcion.getPelicula().getDuracionMinutos(),
                funcion.getCancelada(), funcion.getFechaHora(), funcion.getFechaHoraFin(), ReglasCartelera.ahora())) {
            throw new ConflictoException("La película aún no se estrena o la función tiene un horario inválido.");
        }

        // Validar asientos
        List<Asiento> asientos = asientoRepository.findAllById(request.getAsientoIds());
        if (asientos.size() != request.getAsientoIds().size()) {
            throw new RecursoNoEncontradoException("Uno o más asientos no existen");
        }

        // Verificar que los asientos pertenecen a la sala de la función
        for (Asiento asiento : asientos) {
            if (!asiento.getSala().getId().equals(funcion.getSala().getId())) {
                throw new ConflictoException("El asiento " + asiento.getFila() + asiento.getNumero() + " no pertenece a la sala de la función");
            }
        }

        // Verificar asientos ya ocupados
        List<Asiento> asientosOcupados = entradaRepository.buscarAsientosOcupados(funcion.getId());
        List<Long> ocupadosIds = asientosOcupados.stream().map(Asiento::getId).collect(Collectors.toList());

        for (Asiento asiento : asientos) {
            if (ocupadosIds.contains(asiento.getId())) {
                throw new ConflictoException("El asiento " + asiento.getFila() + asiento.getNumero() + " ya está ocupado");
            }
        }

        BigDecimal totalEntradas = BigDecimal.ZERO;
        List<Entrada> entradas = new ArrayList<>();
        // Supongamos precio unitario de entrada basado en la función o precio base (ej. S/ 18.00)
        BigDecimal precioFuncion = funcion.getPrecio() != null ? funcion.getPrecio() : new BigDecimal("18.00");

        Orden orden = new Orden(usuario, Orden.Estado.PAGADA, BigDecimal.ZERO);
        orden = ordenRepository.save(orden);

        for (Asiento asiento : asientos) {
            Entrada entrada = new Entrada(orden, funcion, asiento, precioFuncion);
            entradas.add(entrada);
            totalEntradas = totalEntradas.add(precioFuncion);
        }

        BigDecimal totalProductos = BigDecimal.ZERO;
        List<DetalleProducto> detalles = new ArrayList<>();

        if (request.getProductos() != null && !request.getProductos().isEmpty()) {
            for (ItemProductoRequest item : request.getProductos()) {
                Producto producto = productoRepository.findById(item.getProductoId())
                        .orElseThrow(() -> new RecursoNoEncontradoException("Producto con ID " + item.getProductoId() + " no encontrado"));

                if (!producto.getActivo()) {
                    throw new ConflictoException("El producto " + producto.getNombre() + " no está activo");
                }

                BigDecimal subtotalProducto = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
                totalProductos = totalProductos.add(subtotalProducto);

                DetalleProducto detalle = new DetalleProducto(orden, producto, item.getCantidad(), producto.getPrecio());
                detalles.add(detalle);
            }
        }

        BigDecimal totalGeneral = totalEntradas.add(totalProductos);
        orden.setTotal(totalGeneral);

        try {
            entradaRepository.saveAllAndFlush(entradas);
            if (!detalles.isEmpty()) {
                detalleProductoRepository.saveAll(detalles);
            }
            orden = ordenRepository.save(orden);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictoException("Conflicto de concurrencia: uno o más asientos ya fueron reservados");
        }

        return detalle(orden);
    }

    private OrdenResponse detalle(Orden orden) {
        return new OrdenResponse(orden,
                entradaRepository.buscarDetallePorOrden(orden.getId()),
                detalleProductoRepository.buscarDetallePorOrden(orden.getId()));
    }

    private void validarSeleccion(OrdenRequest request) {
        if (request.getAsientoIds() == null || request.getAsientoIds().isEmpty()
                || request.getAsientoIds().stream().anyMatch(id -> id == null || id <= 0)
                || new HashSet<>(request.getAsientoIds()).size() != request.getAsientoIds().size()) {
            throw new ConflictoException("Selecciona asientos válidos sin repetir.");
        }
        if (request.getProductos() != null) {
            var ids = new HashSet<Long>();
            for (ItemProductoRequest item : request.getProductos()) {
                if (item == null || item.getProductoId() == null || item.getProductoId() <= 0
                        || item.getCantidad() == null || item.getCantidad() < 1 || item.getCantidad() > 10
                        || !ids.add(item.getProductoId())) {
                    throw new ConflictoException("Selecciona productos sin repetir y entre 1 y 10 unidades.");
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<OrdenResponse> listarPorUsuario(String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        return ordenRepository.buscarPorUsuario(usuario.getId())
                .stream()
                .map(this::detalle)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrdenResponse> listarTodas() {
        return ordenRepository.findAll()
                .stream()
                .map(this::detalle)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrdenResponse obtenerPorId(Long id, String userEmail, boolean isAdmin) {
        Orden orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Orden no encontrada"));

        if (!isAdmin && !orden.getUsuario().getEmail().equals(userEmail)) {
            throw new RecursoNoEncontradoException("Orden no encontrada");
        }

        return detalle(orden);
    }
}
