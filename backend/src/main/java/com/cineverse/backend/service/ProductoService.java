package com.cineverse.backend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cineverse.backend.dto.ProductoRequest;
import com.cineverse.backend.dto.ProductoResponse;
import com.cineverse.backend.entity.Producto;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.ProductoRepository;

@Service
public class ProductoService {
    private final ProductoRepository repositorio;

    public ProductoService(ProductoRepository repositorio) { this.repositorio = repositorio; }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listar(boolean soloActivos) {
        return repositorio.findAll().stream()
            .filter(p -> !soloActivos || Boolean.TRUE.equals(p.getActivo()))
            .map(ProductoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) { return ProductoResponse.desde(buscar(id)); }

    private Producto buscar(Long id) {
        return repositorio.findById(id).orElseThrow(
            () -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
    }

    private String validarNombre(String nombre) {
        String limpio = nombre == null ? "" : nombre.trim();
        if (limpio.isEmpty() || limpio.length() > 150) {
            throw new IllegalArgumentException("Nombre de producto inválido");
        }
        return limpio;
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest datos) {
        String nombre = validarNombre(datos.nombre());
        if (repositorio.existsByNombreIgnoreCase(nombre))
            throw new ConflictoException("Ya existe un producto con ese nombre");
        Producto producto = new Producto(nombre, datos.categoria(), datos.precio(), datos.activo());
        return ProductoResponse.desde(repositorio.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest datos) {
        Producto producto = buscar(id);
        String nombre = validarNombre(datos.nombre());
        if (!producto.getNombre().equalsIgnoreCase(nombre) && repositorio.existsByNombreIgnoreCase(nombre))
            throw new ConflictoException("Ya existe un producto con ese nombre");
        producto.setNombre(nombre);
        producto.setCategoria(datos.categoria());
        producto.setPrecio(datos.precio());
        producto.setActivo(datos.activo());
        return ProductoResponse.desde(repositorio.save(producto));
    }

    // Baja lógica: conserva referencias históricas de órdenes a este producto.
    @Transactional
    public void eliminar(Long id) {
        Producto producto = buscar(id);
        producto.setActivo(false);
        repositorio.save(producto);
    }
}
