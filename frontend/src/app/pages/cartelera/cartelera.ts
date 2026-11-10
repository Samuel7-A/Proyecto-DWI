import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import type { Pelicula } from '../../core/models';
import { MovieCard } from '../../shared/movie-card/movie-card';

@Component({
  selector: 'app-cartelera',
  imports: [FormsModule, MovieCard],
  templateUrl: './cartelera.html'
})
export class Cartelera implements OnInit {
  private readonly api = inject(ApiService);

  todas: Pelicula[] = [];
  generos: string[] = [];
  genero = '';
  texto = '';
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
        this.todas = datos.filter((p) => p.estado && this.esEstrenada(p));

        const set = new Set<string>();
        this.todas.forEach((p) =>
          p.genero.split(',').forEach((g) => set.add(g.trim()))
        );
        this.generos = [...set].sort();
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  get filtradas(): Pelicula[] {
    const genero = this.genero;
    const texto = this.texto.trim().toLowerCase();

    return this.todas.filter((p) => {
      const coincideGenero = !genero || p.genero.includes(genero);
      const coincideTexto = !texto || p.titulo.toLowerCase().includes(texto);
      return coincideGenero && coincideTexto;
    });
  }

  get countLabel(): string {
    const n = this.filtradas.length;
    return `${n} película${n === 1 ? '' : 's'}`;
  }

  private esEstrenada(p: Pelicula): boolean {
    if (!p.fechaEstreno) return true;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const estreno = new Date(`${p.fechaEstreno}T00:00:00`);
    return estreno.getTime() <= hoy.getTime();
  }
}
