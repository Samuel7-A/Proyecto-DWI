import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from './api.service';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { PurchaseService } from './purchase.service';
import type { LoginResponse } from './models';

function fakeToken(exp: number): string {
  return `header.${btoa(JSON.stringify({ exp }))}.signature`;
}
const vigente = () => fakeToken(Math.floor(Date.now() / 1000) + 3600);
const vencido = () => fakeToken(Math.floor(Date.now() / 1000) - 10);
const keys = ['cv_token', 'cv_nombre', 'cv_email', 'cv_rol'];
function limpiarStorage() {
  keys.forEach((k) => localStorage.removeItem(k));
  sessionStorage.removeItem('cv_compra');
}
function restaurar(token: string) {
  localStorage.setItem('cv_token', token);
  localStorage.setItem('cv_nombre', 'Cliente');
  localStorage.setItem('cv_email', 'cliente@example.test');
  localStorage.setItem('cv_rol', 'CLIENTE');
}

describe('CineVerse: seguridad de sesión', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    limpiarStorage();
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()
    ] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); limpiarStorage(); vi.restoreAllMocks(); });

  it('restaura una sesión vigente', () => {
    restaurar(vigente());
    const auth = TestBed.inject(AuthService);
    expect(auth.validarSesion()).toBe(true);
    expect(auth.rol()).toBe('CLIENTE');
  });

  it('descarta JWT vencido y compra al inicializar', () => {
    restaurar(vencido());
    sessionStorage.setItem('cv_compra', '{}');
    const auth = TestBed.inject(AuthService);
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('cv_token')).toBeNull();
    expect(TestBed.inject(PurchaseService).estado()).toBeNull();
  });

  it('logout limpia señales, identidad y compra', () => {
    restaurar(vigente());
    sessionStorage.setItem('cv_compra', '{}');
    const auth = TestBed.inject(AuthService);
    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.email()).toBe('');
    expect(auth.rol()).toBeNull();
    expect(TestBed.inject(PurchaseService).estado()).toBeNull();
    expect(sessionStorage.getItem('cv_compra')).toBeNull();
  });

  it('HTTP 401 de la sesión actual limpia la sesión y redirige', () => {
    const token = vigente();
    restaurar(token);
    sessionStorage.setItem('cv_compra', '{}');
    const auth = TestBed.inject(AuthService);
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    TestBed.inject(HttpClient).get(`${API_BASE_URL}/ordenes`).subscribe({ error: () => {} });
    const req = http.expectOne(`${API_BASE_URL}/ordenes`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isLoggedIn()).toBe(false);
    expect(TestBed.inject(PurchaseService).estado()).toBeNull();
    expect(nav).toHaveBeenCalledWith(['/login'], expect.anything());
  });

  it('HTTP 403 conserva una sesión válida', () => {
    restaurar(vigente());
    const auth = TestBed.inject(AuthService);
    TestBed.inject(HttpClient).get(`${API_BASE_URL}/salas`).subscribe({ error: () => {} });
    http.expectOne(`${API_BASE_URL}/salas`).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(auth.isLoggedIn()).toBe(true);
  });

  it('no envía el JWT a terceros ni al login', () => {
    restaurar(vigente());
    const client = TestBed.inject(HttpClient);
    client.get('https://example.test/data').subscribe();
    const externa = http.expectOne('https://example.test/data');
    expect(externa.request.headers.has('Authorization')).toBe(false);
    externa.flush({});
    client.post(`${API_BASE_URL}/auth/login`, {}).subscribe();
    const login = http.expectOne(`${API_BASE_URL}/auth/login`);
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush({});
  });

  it('un 401 tardío no cierra una sesión nueva', () => {
    restaurar(vigente());
    const auth = TestBed.inject(AuthService);
    TestBed.inject(HttpClient).get(`${API_BASE_URL}/ordenes`).subscribe({ error: () => {} });
    const anterior = http.expectOne(`${API_BASE_URL}/ordenes`);
    const nuevo = fakeToken(Math.floor(Date.now() / 1000) + 7200);
    const respuesta: LoginResponse = { token: nuevo, tipo: 'Bearer', nombre: 'Nuevo', email: 'nuevo@example.test', rol: 'CLIENTE' };
    auth.login({ email: respuesta.email, password: 'demo' }).subscribe();
    http.expectOne(`${API_BASE_URL}/auth/login`).flush(respuesta);
    anterior.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.token()).toBe(nuevo);
    expect(auth.isLoggedIn()).toBe(true);
  });

  it('un cambio de cuenta en otra pestaña no adopta el JWT ajeno', () => {
    restaurar(vigente());
    sessionStorage.setItem('cv_compra', '{}');
    const auth = TestBed.inject(AuthService);
    const nuevo = fakeToken(Math.floor(Date.now() / 1000) + 7200);
    localStorage.setItem('cv_token', nuevo);
    localStorage.setItem('cv_email', 'nuevo@example.test');
    expect(auth.validarSesion()).toBe(false);
    expect(auth.email()).toBe('');
    expect(localStorage.getItem('cv_token')).toBe(nuevo);
    expect(TestBed.inject(PurchaseService).estado()).toBeNull();
  });
});
