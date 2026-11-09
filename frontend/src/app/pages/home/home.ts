import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import type { Pelicula } from '../../core/models';
import { MovieCard } from '../../shared/movie-card/movie-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MovieCard],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private readonly api = inject(ApiService);

  readonly peliculas = signal<Pelicula[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);

    this.api.listarPeliculas().subscribe({
      next: (datos) => {
        this.peliculas.set(datos.filter((p) => p.estado).slice(0, 6));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }
}
