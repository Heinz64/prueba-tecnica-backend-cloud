/**
 * Normaliza un RUT chileno para comparar dos formatos distintos del mismo RUT
 * (con o sin puntos, con o sin guion, K en mayuscula o minuscula) como iguales.
 * Ej: "12.345.678-5" y "123456785" normalizan a lo mismo.
 */
export function normalizeRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

const RUT_FORMAT = /^\d{7,8}[0-9K]$/i;

export function isValidRutFormat(rut: string): boolean {
  return RUT_FORMAT.test(normalizeRut(rut));
}
