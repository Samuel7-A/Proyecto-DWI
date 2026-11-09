import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import type { Pelicula } from '../../core/models';
import { MovieCard } from '../../shared/movie-card/movie-card';

@Component({
  selector: 'app-proximamente',
  imports: [MovieCard],
  templateUrl: './proximamente.html'
})
export class Proximamente implements OnInit {
  private readonly api = inject(ApiService);

  proximas: Pelicula[] = [];
  cargando = true;
  error = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = false;

    this.api.listarPeliculas().subscribe({
      next: (datos) => {
        this.proximas = datos
          .filter((p) => !p.estado)
          .sort((a, b) => new Date(a.fechaEstreno).getTime() - new Date(b.fechaEstreno).getTime());
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }
}
