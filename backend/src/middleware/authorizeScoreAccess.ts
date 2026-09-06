import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError, ValidationError } from '../lib/errors';
import { isValidRutFormat, normalizeRut } from '../lib/rut';

/**
 * Middleware de autorizacion para GET /score/:rut (HU-2, HU-3):
 * - role 'admin' -> puede consultar cualquier RUT.
 * - role 'user'  -> solo puede consultar el RUT que viene en su propio token.
 *
 * Corre DESPUES de authenticate, por eso asume req.auth ya presente.
 */
export function authorizeScoreAccess(req: Request, _res: Response, next: NextFunction): void {
  const { rut } = req.params;

  if (!isValidRutFormat(rut)) {
    throw new ValidationError(`"${rut}" no tiene formato de RUT valido`);
  }

  const auth = req.auth;
  if (!auth) {
    // No deberia pasar si authenticate corrio antes, pero se cubre por completitud.
    throw new ForbiddenError('No autorizado');
  }

  if (auth.role === 'admin') {
    next();
    return;
  }

  // role === 'user': el RUT solicitado debe coincidir con el RUT de su propio token.
  if (!auth.rut || normalizeRut(auth.rut) !== normalizeRut(rut)) {
    throw new ForbiddenError('Un usuario solo puede consultar su propio RUT');
  }

  next();
}
