import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import type { LoginRequest, LoginResponse, RegisterRequest, Rol } from './models';

const KEYS = {
  token: 'cv_token',
  nombre: 'cv_nombre',
  email: 'cv_email',
  rol: 'cv_rol'
};

/** Sesión JWT compartida por toda la interfaz, persistida en localStorage. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly _token = signal<string>('');
  private readonly _nombre = signal<string>('');
  private readonly _email = signal<string>('');
  private readonly _rol = signal<Rol | null>(null);

  readonly isLoggedIn = computed(() => this._token() !== '');
  readonly isAdmin = computed(() => this._rol() === 'ADMIN');
  readonly nombre = this._nombre.asReadonly();
  readonly email = this._email.asReadonly();
  readonly rol = this._rol.asReadonly();

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const token = localStorage.getItem(KEYS.token);
    if (!token) return;

    this._token.set(token);
    this._nombre.set(localStorage.getItem(KEYS.nombre) || '');
    this._email.set(localStorage.getItem(KEYS.email) || '');
    this._rol.set((localStorage.getItem(KEYS.rol) as Rol) || null);
  }

  private persistir(res: LoginResponse): void {
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

  logout(): void {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    this._token.set('');
    this._nombre.set('');
    this._email.set('');
    this._rol.set(null);
  }
}
