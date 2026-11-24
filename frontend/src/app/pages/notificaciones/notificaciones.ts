import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { NotificationCountService } from '../../core/notification-count.service';
import type { Notificacion } from '../../core/models';
import { formatFechaHora } from '../../core/utils';

@Component({
  selector: 'app-notificaciones',
  imports: [RouterLink],
  templateUrl: './notificaciones.html'
})
export class Notificaciones implements OnInit {
  private readonly api = inject(ApiService);
  private readonly contador = inject(NotificationCountService);
  readonly aviso = signal('');

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);

    this.api.listarNotificaciones().subscribe({
      next: (datos) => {
        this.notificaciones.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }

  marcarLeida(notificacion: Notificacion): void {
    if (notificacion.leida) return;
    this.api.marcarNotificacionLeida(notificacion.id).subscribe({
      next: () => { this.aviso.set(''); this.contador.refrescar(); this.cargar(); },
      error: () => this.aviso.set('No se pudo actualizar la notificación. Intenta nuevamente.')
    });
  }

  marcarTodas(): void {
    this.api.marcarTodasLeidas().subscribe({
      next: () => { this.aviso.set(''); this.contador.refrescar(); this.cargar(); },
      error: () => this.aviso.set('No se pudo actualizar la notificación. Intenta nuevamente.')
    });
  }

  fecha(n: Notificacion): string {
    return formatFechaHora(n.fechaCreacion);
  }
}
