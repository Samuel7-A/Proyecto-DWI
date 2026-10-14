package com.cineverse.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.cineverse.backend.dto.ProductoRequest;
import com.cineverse.backend.dto.ProductoResponse;
import com.cineverse.backend.entity.Producto;
import com.cineverse.backend.entity.Producto.Categoria;
import com.cineverse.backend.exception.ConflictoException;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.DetalleProductoRepository;
import com.cineverse.backend.repository.ProductoRepository;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private DetalleProductoRepository detalleProductoRepository;

    @InjectMocks
    private ProductoService productoService;

    private ProductoRequest request(String nombre, Boolean activo) {
        return new ProductoRequest(nombre, Categoria.BEBIDA, new BigDecimal("7.00"), activo);
    }

    private Producto producto(String nombre, boolean activo) {
        return new Producto(nombre, Categoria.BEBIDA, new BigDecimal("7.00"), activo);
    }

    @Test
    void crearGuardaElProductoActivoPorDefectoYSinEspaciosSobrantes() {
        when(productoRepository.existsByNombreIgnoreCase("Gaseosa")).thenReturn(false);
        when(productoRepository.save(any(Producto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductoResponse respuesta = productoService.crear(request("  Gaseosa  ", null));

        assertEquals("Gaseosa", respuesta.nombre());
        assertEquals(Categoria.BEBIDA, respuesta.categoria());
        assertTrue(respuesta.activo());
    }

    @Test
    void crearConNombreDuplicadoLanzaConflicto() {
        when(productoRepository.existsByNombreIgnoreCase("Gaseosa")).thenReturn(true);

        assertThrows(ConflictoException.class,
                () -> productoService.crear(request("Gaseosa", true)));

        verify(productoRepository, never()).save(any());
    }

    @Test
    void actualizarConNombreDeOtroProductoLanzaConflicto() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto("Chocolate", true)));
        when(productoRepository.existsByNombreIgnoreCaseAndIdNot("Gaseosa", 1L)).thenReturn(true);

        assertThrows(ConflictoException.class,
                () -> productoService.actualizar(1L, request("Gaseosa", true)));

        verify(productoRepository, never()).save(any());
    }

    @Test
    void actualizarSinIndicarActivoConservaElValorActual() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto("Chocolate", false)));
        when(productoRepository.existsByNombreIgnoreCaseAndIdNot("Chocolate negro", 1L)).thenReturn(false);
        when(productoRepository.save(any(Producto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductoResponse respuesta = productoService.actualizar(1L, request("Chocolate negro", null));

        assertEquals("Chocolate negro", respuesta.nombre());
        assertFalse(respuesta.activo());
    }

    @Test
    void actualizarProductoInexistenteLanzaNoEncontrado() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class,
                () -> productoService.actualizar(99L, request("Gaseosa", true)));
    }

    @Test
    void obtenerActivoDeUnProductoInactivoLanzaNoEncontrado() {
        when(productoRepository.findById(5L)).thenReturn(Optional.of(producto("Agotado", false)));

        assertThrows(RecursoNoEncontradoException.class,
                () -> productoService.obtenerActivo(5L));
    }

    @Test
    void listarActivosDevuelveSoloLoQueEntregaElRepositorio() {
        when(productoRepository.findByActivoTrueOrderByIdAsc())
                .thenReturn(List.of(producto("Gaseosa", true), producto("Chocolate", true)));

        List<ProductoResponse> productos = productoService.listarActivos();

        assertEquals(2, productos.size());
        assertEquals("Gaseosa", productos.get(0).nombre());
    }

    @Test
    void eliminarProductoYaVendidoLanzaConflictoYNoLoBorra() {
        Producto producto = producto("Gaseosa", true);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(detalleProductoRepository.existsByProductoId(1L)).thenReturn(true);

        assertThrows(ConflictoException.class, () -> productoService.eliminar(1L));

        verify(productoRepository, never()).delete(any());
    }

    @Test
    void eliminarProductoSinOrdenesLoBorra() {
        Producto producto = producto("Gaseosa", true);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(detalleProductoRepository.existsByProductoId(1L)).thenReturn(false);

        productoService.eliminar(1L);

        verify(productoRepository).delete(producto);
    }
}
