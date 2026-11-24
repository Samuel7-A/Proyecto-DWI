import { describe, expect, it } from 'vitest';
import { funcionVigente, toDatetimeLocal } from './utils';

describe('Disponibilidad de funciones', () => {
  const ahora = Date.parse('2030-01-01T12:00:00-05:00');
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
  it('interpreta ISO sin offset como horario de Lima', () => {
    expect(funcionVigente({ cancelada: false, fechaHora: '2030-01-01T12:01:00' }, ahora)).toBe(true);
    expect(funcionVigente({ cancelada: false, fechaHora: '2030-01-01T17:00:00Z' }, ahora)).toBe(false);
  });
  it('mantiene hora de Lima al editar funciones', () => {
    expect(toDatetimeLocal('2030-01-01T17:30:00Z')).toBe('2030-01-01T12:30');
    expect(toDatetimeLocal([2030, 1, 1, 12, 30])).toBe('2030-01-01T12:30');
  });
  it('rechaza una fecha inválida', () => {
    expect(funcionVigente({ cancelada: false, fechaHora: 'incorrecta' }, ahora)).toBe(false);
  });
});
