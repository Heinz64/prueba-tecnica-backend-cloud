import { isValidRutFormat, normalizeRut } from '../../src/lib/rut';

describe('normalizeRut', () => {
  it('quita puntos y guion, y pasa la k a mayuscula', () => {
    expect(normalizeRut('12.345.678-5')).toBe('123456785');
    expect(normalizeRut('5.555.555-k')).toBe('5555555K');
  });
});

describe('isValidRutFormat', () => {
  it('acepta un RUT bien formado', () => {
    expect(isValidRutFormat('12.345.678-5')).toBe(true);
    expect(isValidRutFormat('123456785')).toBe(true);
  });

  it('rechaza texto que no es un RUT', () => {
    expect(isValidRutFormat('no-es-un-rut')).toBe(false);
    expect(isValidRutFormat('')).toBe(false);
  });
});
