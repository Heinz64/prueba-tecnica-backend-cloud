import request from 'supertest';

import { createApp } from '../../src/app';

process.env.JWT_SECRET = 'test-secret';
const app = createApp();

async function loginAs(username: string, password: string): Promise<string> {
  const res = await request(app).post('/login').send({ username, password });
  return res.body.token as string;
}

describe('GET /score/:rut', () => {
  it('401 sin header Authorization', async () => {
    const res = await request(app).get('/score/12.345.678-5');
    expect(res.status).toBe(401);
  });

  it('401 con un token con firma invalida', async () => {
    const res = await request(app)
      .get('/score/12.345.678-5')
      .set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });

  it('user puede consultar su propio RUT -> 200 con score determinista', async () => {
    const token = await loginAs('jperez', 'user123');
    const res1 = await request(app).get('/score/12.345.678-5').set('Authorization', `Bearer ${token}`);
    const res2 = await request(app).get('/score/12.345.678-5').set('Authorization', `Bearer ${token}`);

    expect(res1.status).toBe(200);
    expect(res1.body.rut).toBe('12.345.678-5');
    expect(res1.body.score).toBe(res2.body.score);
    expect(typeof res1.body.fecha).toBe('string');
  });

  it('user NO puede consultar el RUT de otra persona -> 403', async () => {
    const token = await loginAs('jperez', 'user123');
    const res = await request(app).get('/score/9.876.543-1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN');
  });

  it('admin puede consultar cualquier RUT -> 200', async () => {
    const token = await loginAs('admin', 'admin123');
    const res1 = await request(app).get('/score/12.345.678-5').set('Authorization', `Bearer ${token}`);
    const res2 = await request(app).get('/score/9.876.543-1').set('Authorization', `Bearer ${token}`);
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });

  it('400 si el RUT no tiene formato valido', async () => {
    const token = await loginAs('admin', 'admin123');
    const res = await request(app).get('/score/no-es-un-rut').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
