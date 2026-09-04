import { handler } from '../../src/handlers/health';

describe('health handler', () => {
  it('responde 200 con status ok', async () => {
    // @ts-expect-error - evento minimo para el test
    const result = await handler({}, {} as any, {} as any);
    expect(result).toBeDefined();
    expect((result as any).statusCode).toBe(200);
    const body = JSON.parse((result as any).body);
    expect(body.status).toBe('ok');
  });
});
