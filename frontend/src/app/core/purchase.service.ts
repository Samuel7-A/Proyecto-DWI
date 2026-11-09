import { Injectable, signal } from '@angular/core';
import type { CompraState } from './models';

const KEY = 'cv_compra';

/**
 * Estado de la compra en curso, conservado en sessionStorage (igual que el
 * frontend original) para sobrevivir entre Asientos -> Bocaditos -> Checkout.
 */
@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly _estado = signal<CompraState | null>(this.cargar());
  readonly estado = this._estado.asReadonly();

  private cargar(): CompraState | null {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || 'null') as CompraState | null;
    } catch {
      return null;
    }
  }

  guardar(estado: CompraState): void {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(estado));
    } catch {
      /* sin almacenamiento disponible: la compra vive solo en memoria */
    }
    this._estado.set(estado);
  }

  actualizar(parcial: Partial<CompraState>): void {
    const actual = this._estado() ?? ({} as CompraState);
    this.guardar({ ...actual, ...parcial } as CompraState);
  }

  limpiar(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
    this._estado.set(null);
  }
}
