import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { PurchaseService } from '../../core/purchase.service';
import type { Categoria, CompraState, Producto } from '../../core/models';
import { categoriaInfo, centimos, formatFechaHora, gradientFor, mensajeError, soles } from '../../core/utils';
import { Steps } from '../../shared/steps/steps';

const CANTIDAD_MAX = 10;

@Component({
  selector: 'app-bocaditos',
  imports: [Steps, RouterLink],
  templateUrl: './bocaditos.html',
  styleUrl: './bocaditos.scss'
})
export class Bocaditos implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly purchase = inject(PurchaseService);

  compra: CompraState | null = null;
  productos: Producto[] = [];
  seleccion: Record<number, number> = {};

  cargando = true;
  error = '';
  sinCompra = false;

  ngOnInit(): void {
    this.iniciar();
  }

  iniciar(): void {
    this.compra = this.purchase.estado();

    if (!this.compra || !this.compra.funcion || !this.compra.asientos || this.compra.asientos.length === 0) {
      this.sinCompra = true;
      this.cargando = false;
      return;
    }

    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';

    this.api.listarProductos().subscribe({
      next: (datos) => {
        this.productos = datos;

        const guardados = (this.compra?.productos || []).reduce<Record<number, number>>((acc, item) => {
          acc[item.productoId] = item.cantidad;
          return acc;
        }, {});

        this.seleccion = {};
        this.productos.forEach((p) => {
          if (guardados[p.id]) this.seleccion[p.id] = Math.min(guardados[p.id], CANTIDAD_MAX);
        });

        this.cargando = false;
      },
      error: (err) => {
        this.error = mensajeError(err, 'No se pudieron cargar los bocaditos.');
        this.cargando = false;
      }
    });
  }

  get pelicula() {
    return this.compra?.pelicula || null;
  }

  get gradiente(): string {
    return gradientFor(this.pelicula?.id);
  }

  get asientos() {
    return this.compra?.asientos || [];
  }

  fechaHora(): string {
    return this.compra?.funcion ? formatFechaHora(this.compra.funcion.fechaHora) : '';
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

    this.guardar();
  }

  quitar(id: number): void {
    delete this.seleccion[id];
    this.guardar();
  }

  get unidades(): number {
    return this.productos.reduce((acc, p) => acc + this.cantidad(p.id), 0);
  }

  get totalCentimos(): number {
    return this.productos.reduce((acc, p) => acc + this.cantidad(p.id) * centimos(p.precio), 0);
  }

  get subtotal(): string {
    return soles(this.totalCentimos);
  }

  private guardar(): void {
    const productos = Object.entries(this.seleccion)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([id, cantidad]) => ({ productoId: Number(id), cantidad }));

    this.purchase.actualizar({ productos });
  }
}
