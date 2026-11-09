import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api.service';
import type { Pelicula } from '../../../core/models';
import { mensajeError } from '../../../core/utils';

@Component({
  selector: 'app-admin-peliculas',
  imports: [FormsModule],
  templateUrl: './peliculas.html',
  styleUrls: ['../../../layouts/admin-layout/admin.css']
})
export class AdminPeliculas implements OnInit {
  private readonly api = inject(ApiService);

  peliculas: Pelicula[] = [];
  cargando = true;
  guardando = false;

  mensaje = '';
  mensajeTipo = '';

  editandoId: number | null = null;

  titulo = '';
  sinopsis = '';
  genero = '';
  duracionMinutos: number | null = null;
  clasificacion = '';
  fechaEstreno = '';
  imagenUrl = '';
  estado = true;

  readonly generos = ['Acción', 'Comedia', 'Terror', 'Fantasía', 'Suspenso', 'Romántica', 'Drama'];
  readonly clasificaciones = ['APT', '+12', '+14', '+18'];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;

    this.api.listarPeliculas().subscribe({
      next: (datos) => {
        this.peliculas = datos;
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarMensaje(mensajeError(err, 'No se pudieron obtener las películas.'), 'danger');
        this.cargando = false;
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const partes = fecha.split('-');
    if (partes.length !== 3) return fecha;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  guardar(): void {
    if (!this.titulo.trim() || !this.genero || !this.duracionMinutos || Number(this.duracionMinutos) <= 0 || !this.clasificacion || !this.fechaEstreno) {
      this.mostrarMensaje('Completa todos los campos obligatorios.', 'danger');
      return;
    }

    const datos: Omit<Pelicula, 'id'> = {
      titulo: this.titulo.trim(),
      sinopsis: this.sinopsis.trim(),
      genero: this.genero,
      duracionMinutos: Number(this.duracionMinutos),
      clasificacion: this.clasificacion,
      fechaEstreno: this.fechaEstreno,
      imagenUrl: this.imagenUrl.trim(),
      estado: this.estado
    };

    const esEdicion = this.editandoId !== null;

    const peticion = esEdicion
      ? this.api.actualizarPelicula(this.editandoId!, datos)
      : this.api.crearPelicula(datos);

    this.guardando = true;

    peticion.subscribe({
      next: () => {
        this.mostrarMensaje(esEdicion ? 'Película actualizada correctamente.' : 'Película registrada correctamente.', 'success');
        this.limpiar();
        this.cargar();
        this.guardando = false;
      },
      error: (err) => {
        this.mostrarMensaje(mensajeError(err, 'No se pudo guardar la película.'), 'danger');
        this.guardando = false;
      }
    });
  }

  editar(pelicula: Pelicula): void {
    this.editandoId = pelicula.id;
    this.titulo = pelicula.titulo;
    this.sinopsis = pelicula.sinopsis || '';
    this.genero = pelicula.genero;
    this.duracionMinutos = pelicula.duracionMinutos;
    this.clasificacion = pelicula.clasificacion;
    this.fechaEstreno = pelicula.fechaEstreno;
    this.imagenUrl = pelicula.imagenUrl || '';
    this.estado = pelicula.estado;
    this.mensaje = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(pelicula: Pelicula): void {
    if (!confirm(`¿Estás seguro de eliminar la película "${pelicula.titulo}"?`)) return;

    this.api.eliminarPelicula(pelicula.id).subscribe({
      next: () => {
        this.mostrarMensaje('Película eliminada correctamente.', 'success');
        if (this.editandoId === pelicula.id) this.limpiar();
        this.cargar();
      },
      error: (err) => this.mostrarMensaje(mensajeError(err, 'No se pudo eliminar la película.'), 'danger')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.titulo = '';
    this.sinopsis = '';
    this.genero = '';
    this.duracionMinutos = null;
    this.clasificacion = '';
    this.fechaEstreno = '';
    this.imagenUrl = '';
    this.estado = true;
    this.mensaje = '';
  }

  private mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.mensajeTipo = tipo;

    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
}
