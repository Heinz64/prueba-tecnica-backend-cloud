import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';

import { UnauthorizedError } from '../lib/errors';

/**
 * Verificacion de JWT (autenticacion) centralizada, para no repetirla en cada handler.
 * BUENAS_PRACTICAS.md > Seguridad > "Manejar correctamente autenticacion y autorizacion (JWT, OAuth2)"
 *
 * En un caso real este secreto vendria de AWS Secrets Manager / SSM, nunca hardcoded ni
 * en una variable de entorno en texto plano en el repo (ver .env.example).
 * Si el proveedor de identidad es Cognito/OAuth2 estandar, esto se reemplaza por
 * aws-jwt-verify contra las JWKS del user pool en vez de una firma HS256 propia.
 */
export interface AuthContext {
  userId: string;
}

export function requireAuth(event: APIGatewayProxyEventV2): AuthContext {
  const authHeader = event.headers?.authorization ?? event.headers?.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Falta el header Authorization: Bearer <token>');
  }

  const token = authHeader.slice('Bearer '.length);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // Fallo de configuracion del servidor, no del cliente: no es un 401 conceptualmente,
    // pero tampoco se debe filtrar detalle interno en la respuesta (lo captura el handler).
    throw new Error('JWT_SECRET no configurado');
  }

  let payload: { sub?: string };
  try {
    payload = jwt.verify(token, secret) as { sub?: string };
  } catch {
    throw new UnauthorizedError('Token invalido o expirado');
  }

  if (!payload.sub) {
    throw new UnauthorizedError('Token valido pero sin subject (sub)');
  }

  return { userId: payload.sub };
}
