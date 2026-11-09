import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Añade el token JWT a todas las peticiones y, ante un 401 (que no provenga
 * del propio login/registro), limpia la sesión y redirige al formulario.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('cv_token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const esAuth = req.url.includes('/auth/');

      if (error.status === 401 && !esAuth) {
        ['cv_token', 'cv_nombre', 'cv_email', 'cv_rol'].forEach((k) =>
          localStorage.removeItem(k)
        );
        router.navigate(['/login'], { queryParams: { redirect: router.url } });
      }

      return throwError(() => error);
    })
  );
};
