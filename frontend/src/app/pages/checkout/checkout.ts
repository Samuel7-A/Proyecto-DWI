import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { PurchaseService } from '../../core/purchase.service';
import type { CompraState, Orden, Producto } from '../../core/models';
import { centimos, formatFechaHora, gradientFor, mensajeError, soles } from '../../core/utils';
import { Steps } from '../../shared/steps/steps';

const CANTIDAD_MAX = 10;

@Component({
  selector: 'app-checkout',
  imports: [Steps, RouterLink],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  private readonly api = inject(ApiService);
  private readonly purchase = inject(PurchaseService);

  compra: CompraState | null = null;
  catalogo = new Map<number, Producto>();
  productosValidos: Array<{ productoId: number; cantidad: number; producto: Producto }> = [];

  cargando = true;
  sinCompra = false;
  error = '';
  confirmando = false;
  aviso = '';
  orden: Orden | null = null;

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

    this.preparar();
  }

  preparar(): void {
    this.cargando = true;
    this.error = '';

    this.api.listarProductos().subscribe({
      next: (productos) => {
        this.catalogo = new Map((productos || []).map((p) => [p.id, p]));

        const guardados = this.compra?.productos || [];
        this.productosValidos = [];

        guardados.forEach((item) => {
          const prod = this.catalogo.get(Number(item.productoId));
          if (prod && prod.activo !== false) {
            this.productosValidos.push({
              productoId: prod.id,
              cantidad: Math.min(Number(item.cantidad) || 1, CANTIDAD_MAX),
              producto: prod
            });
          }
        });

        this.cargando = false;
      },
      error: (err) => {
        this.error = mensajeError(err, 'No se pudo preparar el resumen de tu compra.');
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

  precioEntradaCentimos(): number {
    return this.compra?.funcion ? centimos(this.compra.funcion.precio) : 0;
  }

  get totalEntradasCentimos(): number {
    return this.asientos.length * this.precioEntradaCentimos();
  }

  get totalBocaditosCentimos(): number {
    return this.productosValidos.reduce((acc, i) => acc + i.cantidad * centimos(i.producto.precio), 0);
  }

  get totalLabel(): string {
    return soles(this.totalEntradasCentimos + this.totalBocaditosCentimos);
  }

  itemTotal(item: { cantidad: number; producto: Producto }): string {
    return soles(item.cantidad * centimos(item.producto.precio));
  }

  confirmar(): void {
    if (this.confirmando || !this.compra || !this.compra.funcion) return;

    this.confirmando = true;
    this.aviso = 'Procesando tu compra… no cierres la página.';

    const payload = {
      funcionId: this.compra.funcion.id,
      asientoIds: this.compra.asientos.map((a) => a.id),
      productos: this.productosValidos.length
        ? this.productosValidos.map((p) => ({ productoId: p.productoId, cantidad: p.cantidad }))
        : null
    };

    this.api.crearOrden(payload).subscribe({
      next: (orden) => {
        this.purchase.limpiar();
        this.orden = orden;
        this.confirmando = false;
      },
      error: (err) => {
        this.confirmando = false;
        this.aviso = mensajeError(err, 'No se pudo confirmar la compra.');
      }
    });
  }
}
