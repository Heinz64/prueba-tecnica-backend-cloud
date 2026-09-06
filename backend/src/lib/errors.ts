/** Jerarquia de errores propia, mapeada a codigos HTTP correctos (mismo patron usado
 * en el scaffold anterior: nunca se expone detalle interno al cliente). */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
