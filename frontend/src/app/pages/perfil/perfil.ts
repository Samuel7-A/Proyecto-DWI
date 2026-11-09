import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html'
})
export class Perfil {
  protected readonly auth = inject(AuthService);

  get inicial(): string {
    const valor = this.auth.nombre() || this.auth.email() || '?';
    return valor.trim().charAt(0).toUpperCase();
  }

  get rolLabel(): string {
    return this.auth.rol() === 'ADMIN' ? 'Administrador' : 'Cliente';
  }
}
