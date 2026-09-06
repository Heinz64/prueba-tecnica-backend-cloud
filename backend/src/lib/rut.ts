/**
 * Normaliza un RUT chileno para comparar dos formatos distintos del mismo RUT
 * (con o sin puntos, con o sin guion, K en mayuscula o minuscula) como iguales.
 * Ej: "12.345.678-5" y "123456785" normalizan a lo mismo.
 */
export function normalizeRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

const RUT_SHAPE = /^\d{7,8}[0-9K]$/i;

/**
 * Calcula el digito verificador esperado (modulo 11) para el cuerpo numerico
 * de un RUT chileno (sin el DV).
 */
function computeCheckDigit(rutBody: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = rutBody.length - 1; i >= 0; i -= 1) {
    sum += Number(rutBody[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

/**
 * Valida forma (7-8 digitos + DV) Y que el digito verificador sea el correcto
 * segun el algoritmo modulo 11. Un RUT con formato correcto pero DV que no
 * calza (ej: "12.345.678-9") se considera invalido.
 */
export function isValidRutFormat(rut: string): boolean {
  const normalized = normalizeRut(rut);
  if (!RUT_SHAPE.test(normalized)) return false;

  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  return computeCheckDigit(body) === dv;
}
