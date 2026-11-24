import { describe, expect, it } from 'vitest';
import { funcionVigente } from './utils';

describe('Disponibilidad de funciones', () => {
  const ahora = new Date(2030, 0, 1, 12, 0, 0).getTime();
  it('permite una función futura', () => {
    expect(funcionVigente({ cancelada: false, fechaHora: [2030, 1, 1, 12, 1] }, ahora)).toBe(true);
  });
  it('rechaza una función iniciada o pasada', () => {
    expect(funcionVigente({ cancelada: false, fechaHora: [2030, 1, 1, 12, 0] }, ahora)).toBe(false);
    expect(funcionVigente({ cancelada: false, fechaHora: [2030, 1, 1, 11, 59] }, ahora)).toBe(false);
  });
  it('rechaza una función cancelada aunque sea futura', () => {
    expect(funcionVigente({ cancelada: true, fechaHora: [2030, 1, 1, 13, 0] }, ahora)).toBe(false);
  });
  it('rechaza una fecha inválida', () => {
    expect(funcionVigente({ cancelada: false, fechaHora: 'incorrecta' }, ahora)).toBe(false);
  });
});
