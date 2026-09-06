export type Role = 'admin' | 'user';

/** Payload real que se firma en el JWT (HU-1: rut solo si role === 'user'). */
export interface JwtPayload {
  sub: string;
  role: Role;
  rut?: string;
}

export interface MockUser {
  id: string;
  username: string;
  password: string;
  role: Role;
  rut?: string;
}

/** Request de Express extendido con el payload ya verificado por el middleware de auth. */
export interface AuthenticatedRequest extends Express.Request {
  auth?: JwtPayload;
}
