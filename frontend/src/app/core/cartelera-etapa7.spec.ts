import { describe, expect, it } from 'vitest';
import type { Funcion, Pelicula } from './models';
import { calcularFinFuncion, esEstrenada, funcionVendible, horarioValido, hoyLima } from './utils';
const ahora = Date.parse('2030-05-10T17:00:00Z');
const p: Pelicula = { id: 1, titulo: 'Prueba', genero: 'Drama', duracionMinutos: 120, clasificacion: 'APT', fechaEstreno: '2030-05-10', estado: true };
const f: Funcion = { id: 1, peliculaId: 1, peliculaTitulo: 'Prueba', salaId: 1, salaNombre: 'Sala', fechaHora: '2030-05-10T13:00:00', fechaHoraFin: '2030-05-10T15:00:00', precio: 18, cancelada: false };
describe('Reglas de cartelera', () => {
  it('usa fecha civil Lima al cruzar medianoche UTC', () => expect(hoyLima(Date.parse('2030-05-11T02:00:00Z'))).toBe('2030-05-10'));
  it('reconoce estreno en el día', () => expect(esEstrenada(p, ahora)).toBe(true));
  it('permite una función válida', () => expect(funcionVendible(p, f, ahora)).toBe(true));
  it('excluye retirada, cancelada e iniciada', () => {
    expect(funcionVendible({...p, estado: false}, f, ahora)).toBe(false);
    expect(funcionVendible(p, {...f, cancelada: true}, ahora)).toBe(false);
    expect(funcionVendible(p, f, Date.parse('2030-05-10T18:00:00Z'))).toBe(false);
  });
  it('excluye preventa y función anterior al estreno', () => {
    expect(funcionVendible({...p, fechaEstreno:'2030-05-11'}, f, ahora)).toBe(false);
    expect(horarioValido({...p, fechaEstreno:'2030-05-11'}, f)).toBe(false);
  });
  it('excluye horarios de días y admite margen anterior', () => {
    expect(funcionVendible(p, {...f, fechaHoraFin:'2030-05-12T15:00:00'}, ahora)).toBe(false);
    expect(horarioValido(p, {...f, fechaHoraFin:'2030-05-10T15:30:00'})).toBe(true);
  });
  it('calcula fin al cruzar medianoche', () => expect(calcularFinFuncion('2030-05-10T23:30', 120)).toBe('2030-05-11T01:30'));
});
