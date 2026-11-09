import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import type { Orden } from '../../core/models';
import { formatFechaHora, formatTotal } from '../../core/utils';

@Component({
  selector: 'app-mis-entradas',
  imports: [RouterLink],
  templateUrl: './mis-entradas.html'
})
export class MisEntradas implements OnInit {
  private readonly api = inject(ApiService);

  readonly ordenes = signal<Orden[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.api.listarOrdenes().subscribe({
      next: (ordenes) => {
        this.ordenes.set(ordenes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus órdenes.');
        this.cargando.set(false);
      }
    });
  }

  fecha(orden: Orden): string {
    return formatFechaHora(orden.fechaCreacion);
  }

  total(orden: Orden): string {
    return formatTotal(orden.total);
  }
}
