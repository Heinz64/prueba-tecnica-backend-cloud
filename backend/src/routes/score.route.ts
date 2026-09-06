import { Router } from 'express';

import { computeScore } from '../lib/score';
import { authenticate } from '../middleware/authenticate';
import { authorizeScoreAccess } from '../middleware/authorizeScoreAccess';

const router = Router();

/**
 * GET /score/:rut (HU-2, HU-3, HU-4): requiere JWT valido (authenticate) y que el
 * solicitante tenga permiso sobre ese RUT (authorizeScoreAccess). El orden de los
 * middlewares importa: primero se sabe QUIEN es (auth), despues SI PUEDE (autorizacion).
 */
router.get('/score/:rut', authenticate, authorizeScoreAccess, (req, res) => {
  const { rut } = req.params;
  res.status(200).json({
    rut,
    score: computeScore(rut),
    fecha: new Date().toISOString(),
  });
});

export default router;
