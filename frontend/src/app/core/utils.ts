import type { FechaInput, Funcion, Pelicula } from './models';

/** Paleta de gradientes usada como "poster" temporal (misma que el frontend original). */
export const CV_POSTER_GRADIENTS: string[] = [
  'linear-gradient(160deg, #3a1420 0%, #17171f 75%)',
  'linear-gradient(160deg, #1f2a3a 0%, #17171f 75%)',
  'linear-gradient(160deg, #24331f 0%, #17171f 75%)',
  'linear-gradient(160deg, #3a2a14 0%, #17171f 75%)',
  'linear-gradient(160deg, #2a1f3a 0%, #17171f 75%)',
  'linear-gradient(160deg, #1f3a36 0%, #17171f 75%)'
];

export function gradientFor(id: number | null | undefined): string {
  const idx = Math.abs(Number(id || 0)) % CV_POSTER_GRADIENTS.length;
  return CV_POSTER_GRADIENTS[idx];
}

function aFecha(value: FechaInput | null | undefined): Date | null {
  if (value == null) return null;

  if (Array.isArray(value)) {
    const [anio, mes, dia, hora = 0, min = 0, seg = 0] = value;
    // El horario del cine se expresa en Lima (UTC-05:00).
    const fecha = new Date(Date.UTC(anio, mes - 1, dia, hora + 5, min, seg));
    return isNaN(fecha.getTime()) ? null : fecha;
  }

  // Los LocalDateTime del backend no incluyen offset. Los interpretamos en Lima.
  const texto = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
    && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? `${value}-05:00` : value;
  const fecha = new Date(texto);
  return isNaN(fecha.getTime()) ? null : fecha;
}

/** Compara horarios del cine en zona Lima, independientemente del navegador. */
export function funcionVigente(f: { cancelada: boolean; fechaHora: FechaInput }, ahora = Date.now()): boolean {
  const fecha = aFecha(f.fechaHora);
  return !f.cancelada && fecha !== null && fecha.getTime() > ahora;
}

/** Fecha civil del cine, no del dispositivo. */
export function hoyLima(ahora = Date.now()): string {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(ahora));
  const get = (tipo: string) => partes.find(p => p.type === tipo)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function esEstrenada(p: Pelicula, ahora = Date.now()): boolean {
  return !!p.fechaEstreno && p.fechaEstreno <= hoyLima(ahora);
}

export function horarioValido(p: Pelicula, f: Funcion): boolean {
  const inicio = aFecha(f.fechaHora), fin = aFecha(f.fechaHoraFin);
  if (!inicio || !fin || !p.fechaEstreno || !Number.isFinite(p.duracionMinutos) || p.duracionMinutos <= 0) return false;
  const minutos = (fin.getTime() - inicio.getTime()) / 60000;
  return hoyLima(inicio.getTime()) >= p.fechaEstreno && minutos >= p.duracionMinutos && minutos <= p.duracionMinutos + 30;
}

export function funcionVendible(p: Pelicula, f: Funcion, ahora = Date.now()): boolean {
  return p.estado && p.id === f.peliculaId && esEstrenada(p, ahora) && funcionVigente(f, ahora) && horarioValido(p, f);
}

export function calcularFinFuncion(inicio: string, duracion: number): string {
  const fecha = aFecha(inicio);
  if (!fecha || !Number.isFinite(duracion) || duracion <= 0) return '';
  return toDatetimeLocal(new Date(fecha.getTime() + duracion * 60000).toISOString());
}

/** "dd/mm/aaaa · hh:mm" */
export function formatFechaHora(value: FechaInput | null | undefined): string {
  const fecha = aFecha(value);
  if (!fecha) return 'Sin fecha';

  return (
    fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Lima' }) +
    ' · ' +
    fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' })
  );
}

export function formatHora(value: FechaInput | null | undefined): string {
  const fecha = aFecha(value);
  if (!fecha) return '';
  return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' });
}

/** "lunes, 01 de noviembre" */
export function formatFechaCompleta(value: FechaInput | null | undefined): string {
  const fecha = aFecha(value);
  if (!fecha) return '';
  return fecha.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'America/Lima' });
}

/** Convierte LocalDateTime (array o ISO) a "YYYY-MM-DDTHH:mm" para <input type="datetime-local">. */
export function toDatetimeLocal(value: FechaInput | null | undefined): string {
  const fecha = aFecha(value);
  if (!fecha) return '';
  const lima = new Date(fecha.getTime() - 5 * 60 * 60 * 1000);
  return lima.toISOString().slice(0, 16);
}

/** Normaliza "YYYY-MM-DDTHH:mm" a "YYYY-MM-DDTHH:mm:ss" (LocalDateTime sin zona horaria). */
export function fromDatetimeLocal(value: string): string {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

/** LocalDate ("2026-11-01") -> "01 de noviembre de 2026" */
export function formatFechaEstreno(fechaISO: string | null | undefined): string {
  if (!fechaISO) return 'Fecha por confirmar';
  const fecha = new Date(`${fechaISO}T00:00:00`);
  if (isNaN(fecha.getTime())) return fechaISO;
  return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDuracion(minutos: number | null | undefined): string {
  if (!minutos && minutos !== 0) return '';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function centimos(precio: unknown): number {
  return Math.round(Number(precio) * 100);
}

export function soles(centimos: number): string {
  return `S/ ${(centimos / 100).toFixed(2)}`;
}

export function formatTotal(precio: unknown): string {
  return soles(centimos(precio));
}

export interface CategoriaInfo {
  label: string;
  icon: string;
}

const CATEGORIAS: Record<string, CategoriaInfo> = {
  CANCHITA: { label: 'Canchita', icon: 'bi-basket2' },
  BEBIDA: { label: 'Bebidas', icon: 'bi-cup-straw' },
  DULCE: { label: 'Dulces', icon: 'bi-cake2' },
  COMBO: { label: 'Combos', icon: 'bi-gift' }
};

export function categoriaInfo(categoria: string | null | undefined): CategoriaInfo {
  return CATEGORIAS[categoria || ''] ?? { label: categoria || 'Producto', icon: 'bi-bag' };
}

export function asientoLabel(asiento: { fila: string; numero: number }): string {
  return `${asiento.fila}${asiento.numero}`;
}

/** Extrae un mensaje legible de un error HTTP (o de conexión). */
export function mensajeError(err: unknown, porDefecto: string): string {
  const e = err as { status?: number; error?: unknown } | null;

  if (e && e.status === 0) {
    return 'No se pudo conectar con el servidor. Si está iniciando, vuelve a intentarlo en unos instantes.';
  }

  const data = (e && e.error) as { mensaje?: string; error?: string; message?: string } | null;
  if (data && (data.mensaje || data.error || data.message)) {
    return data.mensaje || data.error || data.message || porDefecto;
  }

  return porDefecto;
}

