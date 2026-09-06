import { normalizeRut } from './rut';

/**
 * Score determinista 0-100: mismo RUT -> mismo score siempre; RUTs distintos ->
 * scores (en la practica) distintos. Se deriva con un hash simple (djb2) del RUT
 * normalizado, sin estado ni base de datos (enunciado: "regla determinista").
 */
export function computeScore(rut: string): number {
  const normalized = normalizeRut(rut);
  let hash = 5381;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 33) ^ normalized.charCodeAt(i);
  }
  // Fuerza un entero positivo y lo acota a [0, 100].
  return Math.abs(hash) % 101;
}
