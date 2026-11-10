import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import type { Pelicula } from '../../core/models';
import { formatDuracion, formatFechaEstreno, gradientFor } from '../../core/utils';

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
  readonly cargando = signal(true);
  readonly noEncontrada = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.noEncontrada.set(true);
      this.cargando.set(false);
      return;
    }

    this.api.obtenerPelicula(id).subscribe({
      next: (pelicula) => {
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
    return this.esEstrenada(p) ? 'EN CARTELERA' : 'PRÓXIMAMENTE';
  }

  private esEstrenada(p: Pelicula): boolean {
    if (!p.fechaEstreno) return true;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const estreno = new Date(`${p.fechaEstreno}T00:00:00`);
    return estreno.getTime() <= hoy.getTime();
  }
}
