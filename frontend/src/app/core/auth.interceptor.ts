import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from './api.service';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // No enviar credenciales de CineVerse a servicios externos.
  if (req.url !== API_BASE_URL && !req.url.startsWith(`${API_BASE_URL}/`)) return next(req);
  if (req.url === `${API_BASE_URL}/auth/login` || req.url === `${API_BASE_URL}/auth/register`) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);
  const anterior = auth.token();
  const token = auth.validarSesion() ? auth.token() : '';
  const redirigir = () => {
    if (!router.url.startsWith('/login')) {
      void router.navigate(['/login'], { queryParams: { redirect: router.url } });
    }
  };
  if (anterior && !token) redirigir();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Una respuesta tardía de una sesión vieja no debe cerrar la nueva.
      if (error.status === 401 && token && auth.token() === token
          && localStorage.getItem('cv_token') === token) {
        auth.logout();
        redirigir();
      }
      return throwError(() => error);
    })
  );
};
