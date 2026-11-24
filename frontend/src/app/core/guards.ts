import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.validarSesion() || router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.validarSesion()) return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  return auth.isAdmin() || router.createUrlTree(['/']);
};

export const compraGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.validarSesion()) return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  return auth.rol() === 'CLIENTE' || router.createUrlTree(['/admin']);
};
