import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import jwt from 'jsonwebtoken';

import { create, getById, list } from '../../src/handlers/items';
import * as itemsRepository from '../../src/lib/items-repository';

jest.mock('../../src/lib/items-repository');
jest.mock('../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const SECRET = 'test-secret';
const fakeContext = { awsRequestId: 'req-1' } as Context;

function authHeader(userId = 'user-1') {
  return { authorization: `Bearer ${jwt.sign({ sub: userId }, SECRET)}` };
}

type HttpResult = { statusCode: number; body: string };

describe('handlers/items', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('responde 401 si falta autenticacion (no llega a tocar el repositorio)', async () => {
      const event = { headers: {}, body: '{}' } as unknown as APIGatewayProxyEventV2;
      const result = (await create(event, fakeContext)) as unknown as HttpResult;
      expect(result.statusCode).toBe(401);
      expect(itemsRepository.createItem).not.toHaveBeenCalled();
    });

    it('responde 400 si el body no cumple el schema de Zod', async () => {
      const event = {
        headers: authHeader(),
        body: JSON.stringify({ name: '' }), // falta idempotencyKey, name vacio
      } as unknown as APIGatewayProxyEventV2;

      const result = (await create(event, fakeContext)) as unknown as HttpResult;
      expect(result.statusCode).toBe(400);
      expect(itemsRepository.createItem).not.toHaveBeenCalled();
    });

    it('crea el item y responde 201 cuando el input es valido', async () => {
      const createdItem = {
        id: '11111111-1111-1111-1111-111111111111',
        ownerId: 'user-1',
        name: 'Laptop',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      (itemsRepository.createItem as jest.Mock).mockResolvedValueOnce(createdItem);

      const event = {
        headers: authHeader('user-1'),
        body: JSON.stringify({ name: 'Laptop', idempotencyKey: createdItem.id }),
      } as unknown as APIGatewayProxyEventV2;

      const result = (await create(event, fakeContext)) as unknown as HttpResult;
      expect(result.statusCode).toBe(201);
      expect(JSON.parse(result.body)).toEqual(createdItem);
      expect(itemsRepository.createItem).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ name: 'Laptop' }),
      );
    });
  });

  describe('getById', () => {
    it('responde 404 si el item no existe', async () => {
      (itemsRepository.getItemById as jest.Mock).mockResolvedValueOnce(null);
      const event = {
        headers: authHeader(),
        pathParameters: { id: 'no-existe' },
      } as unknown as APIGatewayProxyEventV2;

      const result = (await getById(event, fakeContext)) as unknown as HttpResult;
      expect(result.statusCode).toBe(404);
    });

    it('responde 200 con el item si existe', async () => {
      const item = {
        id: 'abc',
        ownerId: 'user-1',
        name: 'Mouse',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      (itemsRepository.getItemById as jest.Mock).mockResolvedValueOnce(item);
      const event = {
        headers: authHeader(),
        pathParameters: { id: 'abc' },
      } as unknown as APIGatewayProxyEventV2;

      const result = (await getById(event, fakeContext)) as unknown as HttpResult;
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(item);
    });
  });

  describe('list', () => {
    it('responde 400 si el query param limit es invalido', async () => {
      const event = {
        headers: authHeader(),
        queryStringParameters: { limit: '9999' }, // excede el maximo (100)
      } as unknown as APIGatewayProxyEventV2;

      const result = (await list(event, fakeContext)) as unknown as HttpResult;
      expect(result.statusCode).toBe(400);
    });

    it('responde 200 con la pagina de items', async () => {
      const page = { items: [], nextToken: undefined };
      (itemsRepository.listItemsByOwner as jest.Mock).mockResolvedValueOnce(page);
      const event = {
        headers: authHeader(),
        queryStringParameters: {},
      } as unknown as APIGatewayProxyEventV2;

      const result = (await list(event, fakeContext)) as unknown as HttpResult;
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(page);
    });
  });
});
