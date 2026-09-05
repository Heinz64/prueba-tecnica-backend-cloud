import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';

import { NotFoundError, ValidationError } from '../../src/lib/errors';
import { withHttpHandler } from '../../src/middleware/http';

jest.mock('../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const fakeContext = { awsRequestId: 'req-1' } as Context;
const fakeEvent = {
  requestContext: { http: { method: 'GET', path: '/x' } },
} as unknown as APIGatewayProxyEventV2;

type HttpResult = { statusCode: number; body: string };

describe('withHttpHandler', () => {
  it('devuelve la respuesta del handler cuando no hay error', async () => {
    const handler = withHttpHandler('test', async () => ({ statusCode: 200, body: 'ok' }));
    const result = await handler(fakeEvent, fakeContext);
    expect(result).toEqual({ statusCode: 200, body: 'ok' });
  });

  it('mapea un AppError (ej. NotFoundError) a su statusCode real', async () => {
    const handler = withHttpHandler('test', async () => {
      throw new NotFoundError('no existe');
    });
    const result = (await handler(fakeEvent, fakeContext)) as unknown as HttpResult;
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({ error: 'NOT_FOUND', message: 'no existe' });
  });

  it('mapea ValidationError a 400', async () => {
    const handler = withHttpHandler('test', async () => {
      throw new ValidationError('input invalido');
    });
    const result = (await handler(fakeEvent, fakeContext)) as unknown as HttpResult;
    expect(result.statusCode).toBe(400);
  });

  it('nunca expone el detalle de un error inesperado al cliente (responde 500 generico)', async () => {
    const handler = withHttpHandler('test', async () => {
      throw new Error('detalle interno sensible: conexion a base de datos X caida');
    });
    const result = (await handler(fakeEvent, fakeContext)) as unknown as HttpResult;
    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).not.toContain('conexion a base de datos');
    expect(body).toEqual({ error: 'INTERNAL_ERROR', message: 'Error interno inesperado' });
  });
});
