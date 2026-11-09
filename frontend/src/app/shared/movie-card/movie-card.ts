import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Pelicula } from '../../core/models';
import { formatDuracion, gradientFor } from '../../core/utils';

@Component({
  selector: 'app-movie-card',
  imports: [RouterLink],
  templateUrl: './movie-card.html'
})
export class MovieCard {
  @Input({ required: true }) pelicula!: Pelicula;

  get duracion(): string {
    return formatDuracion(this.pelicula.duracionMinutos);
  }

  get gradiente(): string {
    return gradientFor(this.pelicula.id);
  }
}
