/**
 * Formatea un RUT chileno en vivo mientras el usuario escribe: agrega puntos
 * cada 3 digitos y el guion antes del digito verificador (ej: "123456785" ->
 * "12.345.678-5"). Acepta escribir o pegar el RUT con o sin puntos/guion —
 * siempre normaliza a la misma presentacion, para que quien lo escribe
 * libremente (el admin, que puede consultar cualquier RUT) no tenga que
 * pensar en que formato usar.
 */
export function formatRutInput(raw: string): string {
  const cleaned = raw
    .replace(/[^0-9kK]/g, '')
    .toUpperCase()
    .slice(0, 9); // maximo 8 digitos + digito verificador

  if (cleaned.length <= 1) return cleaned;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const bodyWithDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${bodyWithDots}-${dv}`;
}
