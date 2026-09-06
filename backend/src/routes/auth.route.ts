import { Router } from 'express';
import { z } from 'zod';

import { UnauthorizedError, ValidationError } from '../lib/errors';
import { signToken } from '../lib/jwt';
import { findUserByCredentials } from '../lib/mockUsers';
import type { JwtPayload } from '../types/auth';

const router = Router();

const LoginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * POST /login (HU-1): credenciales mock, retorna JWT firmado.
 * payload: sub, role, y rut SOLO si role === 'user' (tal como pide el enunciado).
 */
router.post('/login', (req, res) => {
  const parsed = LoginInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const user = findUserByCredentials(parsed.data.username, parsed.data.password);
  if (!user) {
    throw new UnauthorizedError('Usuario o contraseña incorrectos');
  }

  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
    ...(user.role === 'user' ? { rut: user.rut } : {}),
  };

  const token = signToken(payload);
  res.status(200).json({ token, role: user.role, rut: user.rut });
});

export default router;
