import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { PurchaseService } from '../../core/purchase.service';
import type { Asiento, AsientoSeleccionado, Funcion, Pelicula } from '../../core/models';
import {
  centimos,
  formatDuracion,
  formatFechaCompleta,
  formatFechaHora,
  formatHora,
  gradientFor,
  mensajeError,
  soles
} from '../../core/utils';
import { Steps } from '../../shared/steps/steps';

interface FilaAsientos {
  fila: string;
  asientos: Array<{ id: number; numero: number; ocupado: boolean; seleccionado: boolean }>;
}

@Component({
  selector: 'app-asientos',
  imports: [Steps, RouterLink],
  templateUrl: './asientos.html'
})
export class Asientos implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly purchase = inject(PurchaseService);

  pelicula: Pelicula | null = null;
  funciones: Funcion[] = [];
  funcionId: number | null = null;
  disponibles: Asiento[] = [];
  ocupados: Asiento[] = [];
  seleccion = new Set<number>();

  cargando = true;
  cargandoAsientos = false;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.cargando = false;
      this.error = 'No se indicó una película.';
      return;
    }

    this.cargar(id);
  }

  private cargar(peliculaId: number): void {
    this.cargando = true;
    this.error = '';

    const guardado = this.purchase.estado();
    if (guardado && String(guardado.peliculaId) === String(peliculaId) && guardado.funcionId) {
      this.funcionId = Number(guardado.funcionId);
    }
    if (guardado && Array.isArray(guardado.asientos)) {
      this.seleccion = new Set(guardado.asientos.map((a) => a.id));
    }

    forkJoin([this.api.obtenerPelicula(peliculaId), this.api.listarFunciones(peliculaId)]).subscribe({
      next: ([pelicula, funciones]) => {
        this.pelicula = pelicula;
        this.funciones = (funciones || []).filter((f) => !f.cancelada);

        if (!pelicula.estado) {
          this.cargando = false;
          this.error = 'Esta película fue retirada de cartelera y no acepta compras.';
          return;
        }

        if (this.funcionId && !this.funciones.some((f) => f.id === this.funcionId)) {
          this.funcionId = null;
        }
        if (!this.funcionId && this.funciones.length) {
          this.funcionId = this.funciones[0].id;
        }

        this.cargando = false;
        if (this.funcionId) this.cargarAsientos();
      },
      error: (err) => {
        this.cargando = false;
        this.error = mensajeError(err, 'No se pudo cargar la película.');
      }
    });
  }

  get funcion(): Funcion | null {
    return this.funciones.find((f) => f.id === this.funcionId) || null;
  }

  get gradiente(): string {
    return gradientFor(this.pelicula?.id);
  }

  get duracion(): string {
    return formatDuracion(this.pelicula?.duracionMinutos);
  }

  hora(f: Funcion): string {
    return formatHora(f.fechaHora);
  }

  fecha(f: Funcion): string {
    return formatFechaCompleta(f.fechaHora);
  }

  get filas(): FilaAsientos[] {
    const ocupadosIds = new Set(this.ocupados.map((o) => o.id));
    const todos = [...this.disponibles, ...this.ocupados].sort((a, b) =>
      a.fila === b.fila ? a.numero - b.numero : a.fila.localeCompare(b.fila)
    );

    const mapa = new Map<string, Asiento[]>();
    todos.forEach((s) => {
      const arr = mapa.get(s.fila) || [];
      arr.push(s);
      mapa.set(s.fila, arr);
    });

    return [...mapa.keys()].sort().map((fila) => ({
      fila,
      asientos: (mapa.get(fila) || [])
        .sort((a, b) => a.numero - b.numero)
        .map((a) => ({
          id: a.id,
          numero: a.numero,
          ocupado: ocupadosIds.has(a.id),
          seleccionado: this.seleccion.has(a.id)
        }))
    }));
  }

  seleccionarFuncion(id: number): void {
    this.funcionId = id;
    this.seleccion = new Set<number>();
    this.cargarAsientos();
  }

  cargarAsientos(): void {
    if (!this.funcionId) return;
    this.cargandoAsientos = true;

    forkJoin([
      this.api.listarAsientosDisponibles(this.funcionId),
      this.api.listarAsientosOcupados(this.funcionId)
    ]).subscribe({
      next: ([disponibles, ocupados]) => {
        this.disponibles = disponibles || [];
        this.ocupados = ocupados || [];

        const disponiblesIds = new Set(this.disponibles.map((s) => s.id));
        this.seleccion = new Set([...this.seleccion].filter((id) => disponiblesIds.has(id)));
        this.cargandoAsientos = false;
      },
      error: (err) => {
        this.cargandoAsientos = false;
        this.error = mensajeError(err, 'No se pudieron cargar los asientos.');
      }
    });
  }

  alternarAsiento(id: number): void {
    const ocupado = this.ocupados.some((o) => o.id === id);
    if (ocupado) return;

    if (this.seleccion.has(id)) {
      this.seleccion.delete(id);
    } else {
      this.seleccion.add(id);
    }
  }

  get asientosSeleccionados(): AsientoSeleccionado[] {
    return [...this.seleccion]
      .map((id) => this.disponibles.find((s) => s.id === id))
      .filter((s): s is Asiento => !!s)
      .map((s) => ({ id: s.id, fila: s.fila, numero: s.numero }));
  }

  get cantidadSeleccion(): number {
    return this.seleccion.size;
  }

  get subtotalLabel(): string {
    const precio = this.funcion ? centimos(this.funcion.precio) : 0;
    return soles(this.cantidadSeleccion * precio);
  }

  resumenFechaHora(): string {
    return this.funcion ? formatFechaHora(this.funcion.fechaHora) : '—';
  }

  continuar(): void {
    const funcion = this.funcion;
    if (!funcion || this.seleccion.size === 0 || !this.pelicula) return;

    const estado = this.purchase.estado();

    this.purchase.guardar({
      peliculaId: this.pelicula.id,
      pelicula: this.pelicula,
      funcionId: funcion.id,
      funcion,
      asientos: this.asientosSeleccionados,
      productos: estado?.productos || []
    });

    this.router.navigate(['/bocaditos']);
  }
}

