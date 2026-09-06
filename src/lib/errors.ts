/**
 * Jerarquia de errores propia, mapeada a codigos HTTP correctos.
 * BUENAS_PRACTICAS.md > Arquitectura > "Manejo explicito de errores"
 * BUENAS_PRACTICAS.md > APIs REST > "Codigos de estado HTTP correctos y consistentes"
 */
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

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
