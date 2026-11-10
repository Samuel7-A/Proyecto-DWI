import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api.service';
import type { Sala, SalaRequest } from '../../../core/models';
import { mensajeError } from '../../../core/utils';

@Component({
  selector: 'app-admin-salas',
  imports: [FormsModule],
  templateUrl: './salas.html',
  styleUrls: ['../../../layouts/admin-layout/admin.css']
})
export class AdminSalas implements OnInit {
  private readonly api = inject(ApiService);

  salas: Sala[] = [];
  cargando = true;
  guardando = false;
  mensaje = '';
  mensajeTipo = '';

  editandoId: number | null = null;
  nombre = '';
  filas: number | null = null;
  columnas: number | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;

    this.api.listarSalas().subscribe({
      next: (datos) => {
        this.salas = datos;
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarMensaje(mensajeError(err, 'No se pudieron obtener las salas.'), 'danger');
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (!this.nombre.trim() || this.filas === null || this.columnas === null) {
      this.mostrarMensaje('Completa todos los campos obligatorios.', 'danger');
      return;
    }

    const filas = Number(this.filas);
    const columnas = Number(this.columnas);

    if (filas < 1 || filas > 26 || columnas < 1 || columnas > 50) {
      this.mostrarMensaje('Las filas deben estar entre 1 y 26, y las columnas entre 1 y 50.', 'danger');
      return;
    }

    const datos: SalaRequest = { nombre: this.nombre.trim(), filas, columnas };
    const esEdicion = this.editandoId !== null;

    const peticion = esEdicion
      ? this.api.actualizarSala(this.editandoId!, datos)
      : this.api.crearSala(datos);

    this.guardando = true;

    peticion.subscribe({
      next: () => {
        this.mostrarMensaje(esEdicion ? 'Sala actualizada correctamente.' : 'Sala creada correctamente.', 'success');
        this.limpiar();
        this.cargar();
        this.guardando = false;
      },
      error: (err) => {
        this.mostrarMensaje(mensajeError(err, 'No se pudo guardar la sala.'), 'danger');
        this.guardando = false;
      }
    });
  }

  editar(sala: Sala): void {
    this.editandoId = sala.id;
    this.nombre = sala.nombre;
    this.filas = sala.filas;
    this.columnas = sala.columnas;
    this.mensaje = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(sala: Sala): void {
    if (!confirm(`¿Estás seguro de eliminar la sala "${sala.nombre}"?`)) return;

    this.api.eliminarSala(sala.id).subscribe({
      next: () => {
        this.mostrarMensaje('Sala eliminada correctamente.', 'success');
        if (this.editandoId === sala.id) this.limpiar();
        this.cargar();
      },
      error: (err) => this.mostrarMensaje(mensajeError(err, 'No se pudo eliminar la sala.'), 'danger')
    });
  }

  limpiar(): void {
    this.editandoId = null;
    this.nombre = '';
    this.filas = null;
    this.columnas = null;
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
