import { isValidRutFormat, normalizeRut } from '../../src/lib/rut';

describe('normalizeRut', () => {
  it('quita puntos y guion, y pasa la k a mayuscula', () => {
    expect(normalizeRut('12.345.678-5')).toBe('123456785');
    expect(normalizeRut('5.555.555-k')).toBe('5555555K');
  });
});

describe('isValidRutFormat', () => {
  it('acepta un RUT bien formado con digito verificador correcto', () => {
    expect(isValidRutFormat('12.345.678-5')).toBe(true);
    expect(isValidRutFormat('123456785')).toBe(true);
  });

  it('acepta un RUT valido cuyo digito verificador es K, en mayuscula o minuscula', () => {
    expect(isValidRutFormat('1.000.005-K')).toBe(true);
    expect(isValidRutFormat('1.000.005-k')).toBe(true);
  });

  it('rechaza un RUT con la forma correcta pero digito verificador que no calza', () => {
    // El DV real de 12.345.678 es 5, no 9: la forma es valida pero el RUT no.
    expect(isValidRutFormat('12.345.678-9')).toBe(false);
    expect(isValidRutFormat('1.000.005-1')).toBe(false);
  });

  it('rechaza texto que no es un RUT', () => {
    expect(isValidRutFormat('no-es-un-rut')).toBe(false);
    expect(isValidRutFormat('')).toBe(false);
  });
});
