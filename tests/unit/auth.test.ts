import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';

import { UnauthorizedError } from '../../src/lib/errors';
import { requireAuth } from '../../src/middleware/auth';

const SECRET = 'test-secret';

function eventWithAuthHeader(header?: string): APIGatewayProxyEventV2 {
  return { headers: header ? { authorization: header } : {} } as APIGatewayProxyEventV2;
}

describe('requireAuth', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it('rechaza si no hay header Authorization', () => {
    expect(() => requireAuth(eventWithAuthHeader())).toThrow(UnauthorizedError);
  });

  it('rechaza si el header no tiene el prefijo Bearer', () => {
    expect(() => requireAuth(eventWithAuthHeader('Basic abc123'))).toThrow(UnauthorizedError);
  });

  it('rechaza un token con firma invalida', () => {
    const badToken = jwt.sign({ sub: 'user-1' }, 'otro-secreto');
    expect(() => requireAuth(eventWithAuthHeader(`Bearer ${badToken}`))).toThrow(UnauthorizedError);
  });

  it('rechaza un token expirado', () => {
    const expiredToken = jwt.sign({ sub: 'user-1' }, SECRET, { expiresIn: -10 });
    expect(() => requireAuth(eventWithAuthHeader(`Bearer ${expiredToken}`))).toThrow(
      UnauthorizedError,
    );
  });

  it('rechaza un token valido pero sin subject (sub)', () => {
    const tokenSinSub = jwt.sign({ role: 'admin' }, SECRET);
    expect(() => requireAuth(eventWithAuthHeader(`Bearer ${tokenSinSub}`))).toThrow(
      UnauthorizedError,
    );
  });

  it('acepta un token valido y retorna el userId', () => {
    const validToken = jwt.sign({ sub: 'user-42' }, SECRET);
    const result = requireAuth(eventWithAuthHeader(`Bearer ${validToken}`));
    expect(result.userId).toBe('user-42');
  });
});
