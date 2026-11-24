import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { PurchaseService } from './purchase.service';
import type { LoginRequest, LoginResponse, RegisterRequest, Rol } from './models';

const KEYS = {
  token: 'cv_token', nombre: 'cv_nombre', email: 'cv_email', rol: 'cv_rol'
};

// Solo para controlar la UX. La firma y los permisos se verifican en Spring Security.
function tokenVigente(token: string): boolean {
  try {
    const partes = token.split('.');
    if (partes.length !== 3 || partes.some((p) => !p)) return false;
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    return typeof payload.exp === 'number' && Number.isFinite(payload.exp)
      && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly purchase = inject(PurchaseService);
  private readonly _token = signal('');
  private readonly _nombre = signal('');
  private readonly _email = signal('');
  private readonly _rol = signal<Rol | null>(null);

  readonly isLoggedIn = computed(() => this._token() !== '');
  readonly isAdmin = computed(() => this.isLoggedIn() && this._rol() === 'ADMIN');
  readonly nombre = this._nombre.asReadonly();
  readonly email = this._email.asReadonly();
  readonly rol = this._rol.asReadonly();

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const token = localStorage.getItem(KEYS.token) || '';
    const rol = localStorage.getItem(KEYS.rol);
    const email = localStorage.getItem(KEYS.email) || '';
    if (!tokenVigente(token) || !email || (rol !== 'ADMIN' && rol !== 'CLIENTE')) {
      this.logout();
      return;
    }
    this._token.set(token);
    this._nombre.set(localStorage.getItem(KEYS.nombre) || '');
    this._email.set(email);
    this._rol.set(rol);
  }

  private persistir(res: LoginResponse): void {
    // Una nueva autenticación nunca hereda la compra de una sesión anterior.
    this.purchase.limpiar();
    localStorage.setItem(KEYS.token, res.token);
    localStorage.setItem(KEYS.nombre, res.nombre);
    localStorage.setItem(KEYS.email, res.email);
    localStorage.setItem(KEYS.rol, res.rol);
    this._token.set(res.token);
    this._nombre.set(res.nombre);
    this._email.set(res.email);
    this._rol.set(res.rol);
  }

  login(request: LoginRequest) {
    return this.api.login(request).pipe(tap((res) => this.persistir(res)));
  }

  register(request: RegisterRequest) {
    return this.api.register(request).pipe(tap((res) => this.persistir(res)));
  }

  token(): string {
    return this._token();
  }

  validarSesion(): boolean {
    // Si otra pestaña cerró o cambió la sesión, descartar esta compra y estado.
    const almacenado = localStorage.getItem(KEYS.token) || '';
    if (almacenado !== this._token()) {
      this.purchase.limpiar();
      this._token.set('');
      this._nombre.set('');
      this._email.set('');
      this._rol.set(null);
      // No adoptar otra cuenta durante una petición iniciada en esta pestaña.
      // El usuario puede recargar o iniciar sesión de nuevo.
      return false;
    }
    if (!this._token()) return false;
    if (!tokenVigente(this._token())) {
      this.logout();
      return false;
    }
    return true;
  }

  logout(): void {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    this.purchase.limpiar();
    this._token.set('');
    this._nombre.set('');
    this._email.set('');
    this._rol.set(null);
  }
}
