import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../lib/errors';
import { verifyToken } from '../lib/jwt';
import type { JwtPayload } from '../types/auth';

// Se extiende Request en vez de usar una interfaz separada para que Express
// tipe correctamente req.auth en los handlers sin castear en cada uno.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

/**
 * Middleware de autenticacion (HU-4): valida firma y expiracion del JWT.
 * No hace autorizacion (eso es responsabilidad de authorize.ts) — separar ambas
 * responsabilidades es lo que pide el enunciado ("Middlewares requeridos" en plural).
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Falta el header Authorization: Bearer <token>');
  }

  const token = header.slice('Bearer '.length);

  try {
    req.auth = verifyToken(token);
  } catch {
    // jwt.verify lanza tanto por firma invalida como por expiracion (TokenExpiredError);
    // ambos casos son 401 desde la perspectiva del cliente.
    throw new UnauthorizedError('Token invalido o expirado');
  }

  next();
}
