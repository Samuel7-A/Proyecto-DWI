package com.cineverse.backend;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cineverse.backend.entity.Producto;
import com.cineverse.backend.entity.Producto.Categoria;
import com.cineverse.backend.repository.ProductoRepository;

/** Carga los productos de la demo solo si la tabla está vacía. */
@Configuration
public class ProductoDataInitializer {

    @Bean
    CommandLineRunner initProductos(ProductoRepository productoRepository) {
        return args -> {
            if (productoRepository.count() > 0) {
                return;
            }

            productoRepository.save(new Producto("Canchita clásica", Categoria.CANCHITA, new BigDecimal("10.00"), true));
            productoRepository.save(new Producto("Gaseosa", Categoria.BEBIDA, new BigDecimal("7.00"), true));
            productoRepository.save(new Producto("Chocolate", Categoria.DULCE, new BigDecimal("6.00"), true));
            productoRepository.save(new Producto("Combo clásico", Categoria.COMBO, new BigDecimal("20.00"), true));
        };
    }
}
