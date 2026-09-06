import request from 'supertest';

import { createApp } from '../../src/app';

process.env.JWT_SECRET = 'test-secret';
const app = createApp();

describe('POST /login', () => {
  it('retorna 200 y un JWT valido con credenciales de admin', async () => {
    const res = await request(app).post('/login').send({ username: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.role).toBe('admin');
    expect(res.body.rut).toBeUndefined();
  });

  it('retorna 200 y el rut en el body con credenciales de user', async () => {
    const res = await request(app).post('/login').send({ username: 'jperez', password: 'user123' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('user');
    expect(res.body.rut).toBe('12.345.678-5');
  });

  it('retorna 401 con credenciales invalidas (sin filtrar detalle interno)', async () => {
    const res = await request(app).post('/login').send({ username: 'admin', password: 'incorrecta' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'UNAUTHORIZED', message: expect.any(String) });
  });

  it('retorna 400 si falta username o password', async () => {
    const res = await request(app).post('/login').send({ username: 'admin' });
    expect(res.status).toBe(400);
  });
});
