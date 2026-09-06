import jwt, { type SignOptions } from 'jsonwebtoken';

import type { JwtPayload } from '../types/auth';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no configurado');
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getSecret(), options);
}

/** Lanza si la firma o la expiracion no son validas (lo captura el middleware de auth). */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
