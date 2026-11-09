import type { FechaInput } from './models';

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
    const [anio, mes, dia, hora = 0, min = 0] = value;
    const fecha = new Date(anio, mes - 1, dia, hora, min);
    return isNaN(fecha.getTime()) ? null : fecha;
  }

  const fecha = new Date(value);
  return isNaN(fecha.getTime()) ? null : fecha;
}

/** "dd/mm/aaaa · hh:mm" */
export function formatFechaHora(value: FechaInput | null | undefined): string {
  const fecha = aFecha(value);
  if (!fecha) return 'Sin fecha';

  return (
    fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' · ' +
    fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  );
}

export function formatHora(value: FechaInput | null | undefined): string {
  const fecha = aFecha(value);
  if (!fecha) return '';
  return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

/** "lunes, 01 de noviembre" */
export function formatFechaCompleta(value: FechaInput | null | undefined): string {
  const fecha = aFecha(value);
  if (!fecha) return '';
  return fecha.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long' });
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
    return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido en localhost:8080.';
  }

  const data = (e && e.error) as { mensaje?: string; error?: string; message?: string } | null;
  if (data && (data.mensaje || data.error || data.message)) {
    return data.mensaje || data.error || data.message || porDefecto;
  }

  return porDefecto;
}

