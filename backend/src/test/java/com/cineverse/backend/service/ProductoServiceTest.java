package com.cineverse.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.cineverse.backend.dto.ProductoRequest;
import com.cineverse.backend.entity.Producto;
import com.cineverse.backend.entity.Producto.Categoria;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.ProductoRepository;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {
    @Mock ProductoRepository repositorio;
    @InjectMocks ProductoService servicio;
    ProductoRequest request(String nombre) {
        return new ProductoRequest(nombre, Categoria.CANCHITA, new BigDecimal("10.00"), true);
    }
    @Test void crearProducto() {
        when(repositorio.save(any(Producto.class))).thenAnswer(i -> i.getArgument(0));
        assertEquals("Canchita", servicio.crear(request(" Canchita ")).nombre());
        verify(repositorio).save(any(Producto.class));
    }
    @Test void rechazarDuplicado() {
        when(repositorio.existsByNombreIgnoreCase("Canchita")).thenReturn(true);
        assertThrows(ConflictoException.class, () -> servicio.crear(request("Canchita")));
        verify(repositorio, never()).save(any());
    }
    @Test void listarSoloActivos() {
        when(repositorio.findAll()).thenReturn(List.of(
            new Producto("Canchita", Categoria.CANCHITA, BigDecimal.TEN, true),
            new Producto("Oculto", Categoria.DULCE, BigDecimal.ONE, false)));
        assertEquals(1, servicio.listar(true).size());
        assertEquals(2, servicio.listar(false).size());
    }
    @Test void productoInexistente() {
        when(repositorio.findById(77L)).thenReturn(Optional.empty());
        assertThrows(RecursoNoEncontradoException.class, () -> servicio.obtener(77L));
    }
    @Test void actualizarProducto() {
        Producto p = new Producto("Anterior", Categoria.DULCE, BigDecimal.ONE, true);
        when(repositorio.findById(1L)).thenReturn(Optional.of(p));
        when(repositorio.save(p)).thenReturn(p);
        assertEquals("Nuevo", servicio.actualizar(1L, request("Nuevo")).nombre());
        assertEquals(Categoria.CANCHITA, p.getCategoria());
    }
    @Test void eliminarDesactivaSinBorrar() {
        Producto p = new Producto("Canchita", Categoria.CANCHITA, BigDecimal.TEN, true);
        when(repositorio.findById(1L)).thenReturn(Optional.of(p));
        servicio.eliminar(1L);
        assertFalse(p.getActivo());
        verify(repositorio).save(p);
        verify(repositorio, never()).delete(any());
    }
}
