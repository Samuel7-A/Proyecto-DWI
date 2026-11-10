import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import type {
  Asiento,
  Funcion,
  FuncionRequest,
  LoginRequest,
  LoginResponse,
  Notificacion,
  Orden,
  OrdenRequest,
  Pelicula,
  Producto,
  RegisterRequest,
  Sala,
  SalaRequest
} from './models';

const API_BASE_URL = 'http://localhost:8080/api';

/** Servicio tipado que integra todos los endpoints del backend de CineVerse. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  /** Caché en memoria para datos públicos de solo lectura (listas). */
  private peliculasCache$: Observable<Pelicula[]> | null = null;
  private productosCache$: Observable<Producto[]> | null = null;

  /* ------------------------------ auth ------------------------------ */

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, request);
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/register`, request);
  }

  /* ----------------------------- películas -------------------------- */

  listarPeliculas(): Observable<Pelicula[]> {
    if (!this.peliculasCache$) {
      this.peliculasCache$ = this.http.get<Pelicula[]>(`${API_BASE_URL}/peliculas`).pipe(
        catchError((err) => {
          this.peliculasCache$ = null;
          return throwError(() => err);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.peliculasCache$;
  }

  obtenerPelicula(id: number): Observable<Pelicula> {
    return this.http.get<Pelicula>(`${API_BASE_URL}/peliculas/${id}`);
  }

  crearPelicula(pelicula: Omit<Pelicula, 'id'>): Observable<Pelicula> {
    this.peliculasCache$ = null;
    return this.http.post<Pelicula>(`${API_BASE_URL}/peliculas`, pelicula);
  }

  actualizarPelicula(id: number, pelicula: Omit<Pelicula, 'id'>): Observable<Pelicula> {
    this.peliculasCache$ = null;
    return this.http.put<Pelicula>(`${API_BASE_URL}/peliculas/${id}`, pelicula);
  }

  eliminarPelicula(id: number): Observable<void> {
    this.peliculasCache$ = null;
    return this.http.delete<void>(`${API_BASE_URL}/peliculas/${id}`);
  }

  /* ----------------------------- funciones -------------------------- */

  listarFunciones(peliculaId: number): Observable<Funcion[]> {
    return this.http.get<Funcion[]>(`${API_BASE_URL}/funciones`, {
      params: { peliculaId: String(peliculaId) }
    });
  }

  listarTodasLasFunciones(): Observable<Funcion[]> {
    return this.http.get<Funcion[]>(`${API_BASE_URL}/funciones`);
  }

  crearFuncion(request: FuncionRequest): Observable<Funcion> {
    return this.http.post<Funcion>(`${API_BASE_URL}/funciones`, request);
  }

  actualizarFuncion(id: number, request: FuncionRequest): Observable<Funcion> {
    return this.http.put<Funcion>(`${API_BASE_URL}/funciones/${id}`, request);
  }

  eliminarFuncion(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/funciones/${id}`);
  }

  cancelarFuncion(id: number): Observable<Funcion> {
    return this.http.post<Funcion>(`${API_BASE_URL}/funciones/${id}/cancelar`, null);
  }

  obtenerFuncion(id: number): Observable<Funcion> {
    return this.http.get<Funcion>(`${API_BASE_URL}/funciones/${id}`);
  }

  listarAsientosDisponibles(funcionId: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${API_BASE_URL}/funciones/${funcionId}/asientos/disponibles`);
  }

  listarAsientosOcupados(funcionId: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${API_BASE_URL}/funciones/${funcionId}/asientos/ocupados`);
  }

  /* ------------------------------ salas ----------------------------- */

  listarSalas(): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${API_BASE_URL}/salas`);
  }

  crearSala(request: SalaRequest): Observable<Sala> {
    return this.http.post<Sala>(`${API_BASE_URL}/salas`, request);
  }

  actualizarSala(id: number, request: SalaRequest): Observable<Sala> {
    return this.http.put<Sala>(`${API_BASE_URL}/salas/${id}`, request);
  }

  eliminarSala(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/salas/${id}`);
  }

  /* ----------------------------- productos -------------------------- */

  listarProductos(): Observable<Producto[]> {
    if (!this.productosCache$) {
      this.productosCache$ = this.http.get<Producto[]>(`${API_BASE_URL}/productos`).pipe(
        catchError((err) => {
          this.productosCache$ = null;
          return throwError(() => err);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.productosCache$;
  }

  listarProductosAdmin(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API_BASE_URL}/productos/admin`);
  }

  crearProducto(producto: Omit<Producto, 'id'>): Observable<Producto> {
    this.productosCache$ = null;
    return this.http.post<Producto>(`${API_BASE_URL}/productos`, producto);
  }

  actualizarProducto(id: number, producto: Omit<Producto, 'id'>): Observable<Producto> {
    this.productosCache$ = null;
    return this.http.put<Producto>(`${API_BASE_URL}/productos/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<void> {
    this.productosCache$ = null;
    return this.http.delete<void>(`${API_BASE_URL}/productos/${id}`);
  }

  /* ------------------------------ órdenes --------------------------- */

  crearOrden(request: OrdenRequest): Observable<Orden> {
    return this.http.post<Orden>(`${API_BASE_URL}/ordenes`, request);
  }

  listarOrdenes(): Observable<Orden[]> {
    return this.http.get<Orden[]>(`${API_BASE_URL}/ordenes`);
  }

  obtenerOrden(id: number): Observable<Orden> {
    return this.http.get<Orden>(`${API_BASE_URL}/ordenes/${id}`);
  }

  /* ---------------------------- notificaciones ----------------------- */

  listarNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${API_BASE_URL}/notificaciones`);
  }

  noLeidas(): Observable<number> {
    return this.http.get<number>(`${API_BASE_URL}/notificaciones/no-leidas`);
  }

  marcarNotificacionLeida(id: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/notificaciones/${id}/leida`, null);
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/notificaciones/leer-todas`, null);
  }
}

