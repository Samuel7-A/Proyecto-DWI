import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { PurchaseService } from '../../core/purchase.service';
import type { CompraState, Orden, Producto } from '../../core/models';
import { centimos, formatFechaHora, funcionVendible, gradientFor, mensajeError, soles } from '../../core/utils';
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

    const compra = this.compra;
    if (!compra?.funcion) { this.cargando = false; return; }
    forkJoin([
      this.api.listarProductosActuales(),
      this.api.obtenerFuncion(compra.funcion.id),
      this.api.listarAsientosDisponibles(compra.funcion.id),
      this.api.obtenerPelicula(compra.peliculaId!)
    ]).subscribe({
      next: ([productos, funcion, disponibles, pelicula]) => {
        this.cargando = false;
        if (!funcionVendible(pelicula, funcion) || funcion.peliculaId !== pelicula.id
            || funcion.salaId !== compra.funcion?.salaId) {
          this.error = 'La función cambió o ya no está disponible. Vuelve a elegir tus asientos.';
          return;
        }
        const ids = new Set(disponibles.map(a => a.id));
        if (!compra.asientos.length || new Set(compra.asientos.map(a => a.id)).size !== compra.asientos.length
            || compra.asientos.some(a => !ids.has(a.id))) {
          this.error = 'Uno o más asientos ya no están disponibles. Vuelve a seleccionarlos.';
          return;
        }
        this.compra = { ...compra, funcion, pelicula };
        this.catalogo = new Map((productos || []).map((p) => [p.id, p]));

        const guardados = this.compra?.productos || [];
        this.productosValidos = [];

        const productosIds = new Set<number>();
        for (const item of guardados) {
          const prod = this.catalogo.get(Number(item.productoId));
          const cantidad = Number(item.cantidad);
          if (!prod || prod.activo === false || !Number.isInteger(cantidad) || cantidad < 1
              || cantidad > CANTIDAD_MAX || productosIds.has(prod.id)) {
            this.error = 'Tu selección de bocaditos cambió. Regresa para revisarla.';
            return;
          }
          productosIds.add(prod.id);
          this.productosValidos.push({ productoId: prod.id, cantidad, producto: prod });
        }

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
    if (this.confirmando || this.cargando || this.error || this.orden || !this.compra || !this.compra.funcion) return;
    if (!this.compra.pelicula || !funcionVendible(this.compra.pelicula, this.compra.funcion)) {
      this.error = 'La función ya comenzó o fue cancelada.';
      return;
    }

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
