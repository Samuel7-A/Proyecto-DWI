import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import type { Pelicula, Funcion } from '../../core/models';
import { formatDuracion, formatFechaEstreno, gradientFor, esEstrenada, funcionVendible } from '../../core/utils';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink],
  templateUrl: './detalle.html'
})
export class Detalle implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthService);

  readonly pelicula = signal<Pelicula | null>(null);
  readonly funciones = signal<Funcion[]>([]);
  readonly cargando = signal(true);
  readonly noEncontrada = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.noEncontrada.set(true);
      this.cargando.set(false);
      return;
    }

    forkJoin([this.api.obtenerPelicula(id), this.api.listarFunciones(id)]).subscribe({
      next: ([pelicula, funciones]) => {
        this.funciones.set(funciones);
        this.pelicula.set(pelicula);
        this.cargando.set(false);
      },
      error: () => {
        this.noEncontrada.set(true);
        this.cargando.set(false);
      }
    });
  }

  get duracion(): string {
    return formatDuracion(this.pelicula()?.duracionMinutos);
  }

  get fechaEstreno(): string {
    return formatFechaEstreno(this.pelicula()?.fechaEstreno);
  }

  get gradiente(): string {
    return gradientFor(this.pelicula()?.id);
  }

  etiquetaEstado(): string {
    const p = this.pelicula();
    if (!p) return '';
    if (!p.estado) return 'RETIRADA';
    return !esEstrenada(p) ? 'PRÓXIMAMENTE' : this.puedeComprar() ? 'EN CARTELERA' : 'SIN FUNCIONES DISPONIBLES';
  }

  puedeComprar(): boolean {
    const p = this.pelicula();
    return !!p && this.funciones().some(f => funcionVendible(p, f));
  }
}
