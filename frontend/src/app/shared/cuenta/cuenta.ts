import { Component, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-cuenta',
  imports: [RouterLink],
  templateUrl: './cuenta.html'
})
export class Cuenta {
  protected readonly auth = inject(AuthService);
  protected abierto = false;

  protected alternar(): void {
    this.abierto = !this.abierto;
  }

  protected inicial(): string {
    const valor = this.auth.nombre() || this.auth.email() || '?';
    return valor.trim().charAt(0).toUpperCase();
  }

  protected nombreMostrado(): string {
    return this.auth.nombre() || this.auth.email();
  }

  protected cerrarSesion(): void {
    this.auth.logout();
    this.abierto = false;
  }

  @HostListener('document:click', ['$event'])
  protected cerrarAlHacerClicFuera(event: MouseEvent): void {
    if (!this.abierto) return;
    const objetivo = event.target as HTMLElement | null;
    if (objetivo && !objetivo.closest('.cv-cuenta')) {
      this.abierto = false;
    }
  }
}
