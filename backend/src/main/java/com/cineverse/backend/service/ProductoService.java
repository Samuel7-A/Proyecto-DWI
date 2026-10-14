package com.cineverse.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cineverse.backend.dto.ProductoRequest;
import com.cineverse.backend.dto.ProductoResponse;
import com.cineverse.backend.entity.Producto;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.DetalleProductoRepository;
import com.cineverse.backend.repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final DetalleProductoRepository detalleProductoRepository;

    public ProductoService(
            ProductoRepository productoRepository,
            DetalleProductoRepository detalleProductoRepository) {
        this.productoRepository = productoRepository;
        this.detalleProductoRepository = detalleProductoRepository;
    }

    /** Catálogo público: solo productos activos. */
    @Transactional(readOnly = true)
    public List<ProductoResponse> listarActivos() {
        return productoRepository.findByActivoTrueOrderByIdAsc().stream()
                .map(ProductoResponse::desde)
                .toList();
    }

    /** Vista de administración: incluye los inactivos. */
    @Transactional(readOnly = true)
    public List<ProductoResponse> listarTodos() {
        return productoRepository.findAllByOrderByIdAsc().stream()
                .map(ProductoResponse::desde)
                .toList();
    }

    /** Consulta pública: un producto inactivo se comporta como inexistente. */
    @Transactional(readOnly = true)
    public ProductoResponse obtenerActivo(Long id) {
        Producto producto = buscarPorId(id);
        if (!Boolean.TRUE.equals(producto.getActivo())) {
            throw noEncontrado(id);
        }
        return ProductoResponse.desde(producto);
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        String nombre = request.nombre().trim();

        if (productoRepository.existsByNombreIgnoreCase(nombre)) {
            throw nombreDuplicado(nombre);
        }

        Producto producto = new Producto(
                nombre,
                request.categoria(),
                request.precio(),
                request.activo() == null ? Boolean.TRUE : request.activo());

        return ProductoResponse.desde(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = buscarPorId(id);
        String nombre = request.nombre().trim();

        if (productoRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw nombreDuplicado(nombre);
        }

        producto.setNombre(nombre);
        producto.setCategoria(request.categoria());
        producto.setPrecio(request.precio());
        if (request.activo() != null) {
            producto.setActivo(request.activo());
        }

        return ProductoResponse.desde(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = buscarPorId(id);

        // Un producto ya vendido no se puede borrar sin romper el historial
        // de órdenes; en ese caso se desactiva con PUT (activo = false).
        if (detalleProductoRepository.existsByProductoId(id)) {
            throw new ConflictoException(
                    "No se puede eliminar el producto porque ya figura en órdenes. "
                            + "Desactívalo con activo = false.");
        }

        productoRepository.delete(producto);
    }

    private Producto buscarPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> noEncontrado(id));
    }

    private RecursoNoEncontradoException noEncontrado(Long id) {
        return new RecursoNoEncontradoException("No se encontró el producto con id " + id);
    }

    private ConflictoException nombreDuplicado(String nombre) {
        return new ConflictoException("Ya existe un producto con el nombre \"" + nombre + "\"");
    }
}
