import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import type { Funcion, FuncionRequest, Pelicula, Sala } from '../../../core/models';
import {
  formatFechaHora,
  formatTotal,
  fromDatetimeLocal,
  mensajeError,
  toDatetimeLocal
} from '../../../core/utils';

@Component({
  selector: 'app-admin-funciones',
  imports: [FormsModule],
  templateUrl: './funciones.html',
  styleUrls: ['../../../layouts/admin-layout/admin.css']
})
export class AdminFunciones implements OnInit {
  private readonly api = inject(ApiService);

  funciones: Funcion[] = [];
  peliculas: Pelicula[] = [];
  salas: Sala[] = [];
  cargando = true;
  guardando = false;
  mensaje = '';
  mensajeTipo = '';

  editandoId: number | null = null;
  peliculaId: number | null = null;
  salaId: number | null = null;
  fechaHora = '';
  fechaHoraFin = '';
  precio: number | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;

    forkJoin([
      this.api.listarTodasLasFunciones(),
      this.api.listarPeliculas(),
      this.api.listarSalas()
    ]).subscribe({
      next: ([funciones, peliculas, salas]) => {
        this.funciones = funciones;
        this.peliculas = peliculas;
        this.salas = salas;
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarMensaje(mensajeError(err, 'No se pudieron obtener las funciones.'), 'danger');
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (
      this.peliculaId === null ||
      this.salaId === null ||
      !this.fechaHora ||
      !this.fechaHoraFin ||
      this.precio === null ||
      Number(this.precio) <= 0
    ) {
      this.mostrarMensaje('Completa todos los campos obligatorios.', 'danger');
      return;
    }

    if (this.fechaHoraFin <= this.fechaHora) {
      this.mostrarMensaje('La fecha y hora de fin debe ser posterior a la de inicio.', 'danger');
      return;
    }

    const datos: FuncionRequest = {
      peliculaId: Number(this.peliculaId),
      salaId: Number(this.salaId),
      fechaHora: fromDatetimeLocal(this.fechaHora),
      fechaHoraFin: fromDatetimeLocal(this.fechaHoraFin),
      precio: Number(this.precio)
    };

    const esEdicion = this.editandoId !== null;

    const peticion = esEdicion
      ? this.api.actualizarFuncion(this.editandoId!, datos)
      : this.api.crearFuncion(datos);

    this.guardando = true;

    peticion.subscribe({
      next: () => {
        this.mostrarMensaje(esEdicion ? 'Función actualizada correctamente.' : 'Función creada correctamente.', 'success');
        this.limpiar();
        this.cargar();
        this.guardando = false;
      },
      error: (err) => {
        this.mostrarMensaje(mensajeError(err, 'No se pudo guardar la función.'), 'danger');
        this.guardando = false;
      }
    });
  }

  editar(funcion: Funcion): void {
    this.editandoId = funcion.id;
    this.peliculaId = funcion.peliculaId;
    this.salaId = funcion.salaId;
    this.fechaHora = toDatetimeLocal(funcion.fechaHora);
    this.fechaHoraFin = toDatetimeLocal(funcion.fechaHoraFin);
    this.precio = Number(funcion.precio);
    this.mensaje = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(funcion: Funcion): void {
    if (!confirm(`¿Estás seguro de eliminar la función de "${funcion.peliculaTitulo}"?`)) return;

    this.api.eliminarFuncion(funcion.id).subscribe({
      next: () => {
        this.mostrarMensaje('Función eliminada correctamente.', 'success');
        if (this.editandoId === funcion.id) this.limpiar();
        this.cargar();
      },
      error: (err) => this.mostrarMensaje(mensajeError(err, 'No se pudo eliminar la función.'), 'danger')
    });
  }

  cancelar(funcion: Funcion): void {
    if (!confirm(`¿Cancelar la función de "${funcion.peliculaTitulo}"? Se notificará a los clientes y se registrará un reembolso simulado.`)) return;

    this.api.cancelarFuncion(funcion.id).subscribe({
      next: () => {
        this.mostrarMensaje('Función cancelada correctamente.', 'success');
        this.cargar();
      },
      error: (err) => this.mostrarMensaje(mensajeError(err, 'No se pudo cancelar la función.'), 'danger')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.peliculaId = null;
    this.salaId = null;
    this.fechaHora = '';
    this.fechaHoraFin = '';
    this.precio = null;
    this.mensaje = '';
  }

  horario(funcion: Funcion): string {
    return formatFechaHora(funcion.fechaHora);
  }

  horarioFin(funcion: Funcion): string {
    return formatFechaHora(funcion.fechaHoraFin);
  }

  precioLabel(funcion: Funcion): string {
    return formatTotal(funcion.precio);
  }

  private mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.mensajeTipo = tipo;

    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
}
