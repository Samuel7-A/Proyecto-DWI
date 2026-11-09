import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import type { Categoria, Producto } from '../../core/models';
import { categoriaInfo, centimos, soles } from '../../core/utils';

const SELECCION_KEY = 'cv_seleccion_productos';
const CANTIDAD_MAX = 10;

@Component({
  selector: 'app-productos',
  templateUrl: './productos.html'
})
export class Productos implements OnInit {
  private readonly api = inject(ApiService);

  productos: Producto[] = [];
  seleccion: Record<number, number> = {};
  filtroCategoria = '';
  cargando = true;
  error = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = false;

    this.api.listarProductos().subscribe({
      next: (datos) => {
        this.productos = datos;
        this.seleccion = this.cargarSeleccion();
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  get categorias(): Categoria[] {
    return [...new Set(this.productos.map((p) => p.categoria))];
  }

  get visibles(): Producto[] {
    return this.filtroCategoria
      ? this.productos.filter((p) => p.categoria === this.filtroCategoria)
      : this.productos;
  }

  cantidad(id: number): number {
    return this.seleccion[id] || 0;
  }

  info(categoria: Categoria) {
    return categoriaInfo(categoria);
  }

  cambiarCantidad(id: number, delta: number): void {
    const actual = this.cantidad(id);
    const nueva = Math.max(0, Math.min(CANTIDAD_MAX, actual + delta));

    if (nueva === 0) {
      delete this.seleccion[id];
    } else {
      this.seleccion[id] = nueva;
    }

    this.guardarSeleccion();
  }

  vaciar(): void {
    this.seleccion = {};
    this.guardarSeleccion();
  }

  get unidades(): number {
    return this.productos.reduce((acc, p) => acc + this.cantidad(p.id), 0);
  }

  get totalCentimos(): number {
    return this.productos.reduce(
      (acc, p) => acc + this.cantidad(p.id) * centimos(p.precio),
      0
    );
  }

  get totalLabel(): string {
    return soles(this.totalCentimos);
  }

  totalProducto(p: Producto): string {
    return soles(centimos(p.precio));
  }

  private cargarSeleccion(): Record<number, number> {
    try {
      const guardado = JSON.parse(sessionStorage.getItem(SELECCION_KEY) || '[]') as Array<{
        productoId: number;
        cantidad: number;
      }>;

      const seleccion: Record<number, number> = {};
      guardado.forEach((item) => {
        const cantidad = Number(item.cantidad);
        if (item.productoId && cantidad > 0) {
          seleccion[item.productoId] = Math.min(cantidad, CANTIDAD_MAX);
        }
      });
      return seleccion;
    } catch {
      return {};
    }
  }

  private guardarSeleccion(): void {
    try {
      const items = Object.entries(this.seleccion)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([id, cantidad]) => ({ productoId: Number(id), cantidad }));
      sessionStorage.setItem(SELECCION_KEY, JSON.stringify(items));
    } catch {
      /* sin almacenamiento disponible */
    }
  }
}
