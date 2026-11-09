import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.html'
})
export class Steps {
  @Input({ required: true }) actual!: 'asientos' | 'bocaditos' | 'checkout';

  protected readonly pasos = [
    { id: 'asientos', etiqueta: 'Asientos', icono: 'bi-grid-3x3-gap' },
    { id: 'bocaditos', etiqueta: 'Bocaditos', icono: 'bi-cup-straw' },
    { id: 'checkout', etiqueta: 'Checkout', icono: 'bi-credit-card' }
  ] as const;

  get idxActual(): number {
    return this.pasos.findIndex((p) => p.id === this.actual);
  }
}
