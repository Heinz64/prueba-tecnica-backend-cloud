import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import { NotFoundError, ValidationError } from '../lib/errors';
import { createItem, getItemById, listItemsByOwner } from '../lib/items-repository';
import { requireAuth } from '../middleware/auth';
import { withHttpHandler } from '../middleware/http';
import { CreateItemInputSchema, ListItemsQuerySchema } from '../types/item';

/**
 * Handlers "delgados": solo (1) autentican, (2) validan el input con Zod,
 * (3) delegan a src/lib, (4) devuelven la respuesta. Nada de logica de negocio aqui.
 * BUENAS_PRACTICAS.md > Arquitectura > "handlers delgados, logica en src/lib"
 */

export const create = withHttpHandler('items.create', async (event: APIGatewayProxyEventV2) => {
  const auth = requireAuth(event);

  const rawBody = event.body ? JSON.parse(event.body) : {};
  const parsed = CreateItemInputSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const item = await createItem(auth.userId, parsed.data);

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  };
});

export const getById = withHttpHandler('items.getById', async (event: APIGatewayProxyEventV2) => {
  requireAuth(event);

  const id = event.pathParameters?.id;
  if (!id) {
    throw new ValidationError('Falta el parametro de ruta "id"');
  }

  const item = await getItemById(id);
  if (!item) {
    throw new NotFoundError(`No existe un item con id "${id}"`);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  };
});

export const list = withHttpHandler('items.list', async (event: APIGatewayProxyEventV2) => {
  const auth = requireAuth(event);

  const parsed = ListItemsQuerySchema.safeParse(event.queryStringParameters ?? {});
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const result = await listItemsByOwner(auth.userId, parsed.data.limit, parsed.data.nextToken);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
});
