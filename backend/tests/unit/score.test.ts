import { computeScore } from '../../src/lib/score';

describe('computeScore', () => {
  it('es determinista: el mismo RUT siempre da el mismo score', () => {
    const a = computeScore('12.345.678-5');
    const b = computeScore('12.345.678-5');
    expect(a).toBe(b);
  });

  it('es el mismo score sin importar el formato del RUT (puntos/guion)', () => {
    expect(computeScore('12.345.678-5')).toBe(computeScore('123456785'));
  });

  it('da scores distintos para RUTs distintos', () => {
    const scores = new Set([
      computeScore('12.345.678-5'),
      computeScore('9.876.543-3'),
      computeScore('1.111.111-1'),
      computeScore('22.222.222-2'),
    ]);
    expect(scores.size).toBeGreaterThan(1);
  });

  it('siempre retorna un numero entre 0 y 100', () => {
    for (const rut of ['1-9', '99.999.999-9', '5.555.555-5']) {
      const score = computeScore(rut);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});
