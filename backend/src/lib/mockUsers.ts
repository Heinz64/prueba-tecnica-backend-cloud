import type { MockUser } from '../types/auth';

/**
 * Credenciales mock (enunciado: "no requiere persistencia en base de datos").
 * En un ambiente real esto vendria de un proveedor de identidad, nunca hardcoded.
 */
export const MOCK_USERS: MockUser[] = [
  {
    id: 'u-admin-1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    // admin no tiene rut propio: puede consultar cualquier RUT (HU-3).
  },
  {
    id: 'u-user-1',
    username: 'jperez',
    password: 'user123',
    role: 'user',
    rut: '12.345.678-5',
  },
  {
    id: 'u-user-2',
    username: 'mgonzalez',
    password: 'user123',
    role: 'user',
    rut: '9.876.543-3',
  },
];

export function findUserByCredentials(username: string, password: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.username === username && u.password === password);
}
