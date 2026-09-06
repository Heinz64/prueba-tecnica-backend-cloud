import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';

import { isAppError } from './lib/errors';
import authRoute from './routes/auth.route';
import scoreRoute from './routes/score.route';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(authRoute);
  app.use(scoreRoute);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'NOT_FOUND', message: `Ruta ${req.method} ${req.path} no existe` });
  });

  // Manejador de errores centralizado: mapea AppError a su statusCode real;
  // cualquier otro error se oculta detras de un 500 generico (no filtra detalle interno).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (isAppError(err)) {
      res.status(err.statusCode).json({ error: err.code, message: err.message });
      return;
    }
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: 'error', message: 'unhandled_error', error: String(err) }));
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error interno inesperado' });
  });

  return app;
}
