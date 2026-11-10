export type Rol = 'ADMIN' | 'CLIENTE';
export type Categoria = 'CANCHITA' | 'BEBIDA' | 'DULCE' | 'COMBO';

/** Película tal como la devuelve GET /api/peliculas. */
export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis?: string | null;
  genero: string;
  duracionMinutos: number;
  clasificacion: string;
  fechaEstreno: string;
  imagenUrl?: string | null;
  estado: boolean;
}

/** LocalDateTime de Spring Boot: puede venir como array [año, mes, día, hora, min, ...] o como ISO string. */
export type FechaInput = string | number[];

export interface Funcion {
  id: number;
  peliculaId: number;
  peliculaTitulo: string;
  salaId: number;
  salaNombre: string;
  fechaHora: FechaInput;
  fechaHoraFin: FechaInput;
  precio: number;
  cancelada: boolean;
}

export interface FuncionRequest {
  peliculaId: number;
  salaId: number;
  fechaHora: string;
  fechaHoraFin: string;
  precio: number;
}

export interface Asiento {
  id: number;
  fila: string;
  numero: number;
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: Categoria;
  precio: number;
  activo: boolean;
}

export interface Sala {
  id: number;
  nombre: string;
  filas: number;
  columnas: number;
  totalAsientos: number;
}

export interface SalaRequest {
  nombre: string;
  filas: number;
  columnas: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface Orden {
  id: number;
  estado: string;
  total: number;
  fechaCreacion: FechaInput;
  usuarioEmail: string;
}

export interface Notificacion {
  id: number;
  mensaje: string;
  leida: boolean;
  fechaCreacion: FechaInput;
}

export interface ItemProducto {
  productoId: number;
  cantidad: number;
}

export interface OrdenRequest {
  funcionId: number;
  asientoIds: number[];
  productos: ItemProducto[] | null;
}

export interface AsientoSeleccionado {
  id: number;
  fila: string;
  numero: number;
}

/** Estado de la compra en curso, conservado en sessionStorage entre pasos. */
export interface CompraState {
  peliculaId: number | null;
  pelicula: Pelicula | null;
  funcionId: number | null;
  funcion: Funcion | null;
  asientos: AsientoSeleccionado[];
  productos: ItemProducto[];
}
