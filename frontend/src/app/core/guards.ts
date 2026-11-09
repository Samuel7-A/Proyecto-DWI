import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

function irALogin(router: Router): boolean {
  router.navigate(['/login'], { queryParams: { redirect: router.url } });
  return false;
}

/** Requiere sesión iniciada (perfil, mis entradas, compra). */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return irALogin(router);
};

/** Requiere rol ADMIN (panel de administración). */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return irALogin(router);
  if (!auth.isAdmin()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};

/** Requiere sesión y bloquea el flujo de compra a los administradores. */
export const compraGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return irALogin(router);
  if (auth.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }
  return true;
};
