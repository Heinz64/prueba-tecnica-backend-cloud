import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

import type { CreateItemInput, Item, ListItemsResult } from '../types/item';
import { dynamoDocClient, TABLE_NAME } from './dynamo-client';

/**
 * Modelo de acceso (definido ANTES de escribir el codigo, no al reves):
 * BUENAS_PRACTICAS.md > DynamoDB > "Modelo de acceso definido ANTES de crear la tabla"
 *
 *   pk = ITEM#<id>            sk = ITEM#<id>            -> obtener un item por id (GetItem)
 *   GSI1PK = OWNER#<ownerId>  GSI1SK = ITEM#<createdAt> -> listar items de un owner, ordenados
 *                                                          por fecha (Query sobre GSI1, nunca Scan)
 *
 * El id del item es igual a la idempotencyKey que manda el cliente: dos solicitudes de
 * creacion con la misma key resuelven al MISMO item en vez de duplicarlo.
 * BUENAS_PRACTICAS.md > Arquitectura > "Servicios idempotentes donde aplique"
 */

function toItemKey(id: string) {
  return { pk: `ITEM#${id}`, sk: `ITEM#${id}` };
}

export async function createItem(ownerId: string, input: CreateItemInput): Promise<Item> {
  const id = input.idempotencyKey;
  const createdAt = new Date().toISOString();

  const item: Item = {
    id,
    ownerId,
    name: input.name,
    description: input.description,
    createdAt,
  };

  try {
    await dynamoDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...toItemKey(id),
          GSI1PK: `OWNER#${ownerId}`,
          GSI1SK: `ITEM#${createdAt}`,
          ...item,
        },
        // Evita sobrescribir un item ya creado con la misma idempotencyKey (id).
        ConditionExpression: 'attribute_not_exists(pk)',
      }),
    );
    return item;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      // Reintento idempotente: devolvemos el item que ya existe, no un error ni un duplicado.
      const existing = await getItemById(id);
      if (existing) return existing;
    }
    throw error;
  }
}

export async function getItemById(id: string): Promise<Item | null> {
  const result = await dynamoDocClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: toItemKey(id),
    }),
  );

  if (!result.Item) return null;

  const { id: itemId, ownerId, name, description, createdAt } = result.Item as Item;
  return { id: itemId, ownerId, name, description, createdAt };
}

export async function listItemsByOwner(
  ownerId: string,
  limit: number,
  nextToken?: string,
): Promise<ListItemsResult> {
  // Query sobre el GSI por owner — NUNCA Scan.
  // BUENAS_PRACTICAS.md > DynamoDB > "Evitar Scan; preferir Query con indices (GSI)"
  const result = await dynamoDocClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :ownerKey',
      ExpressionAttributeValues: { ':ownerKey': `OWNER#${ownerId}` },
      Limit: limit,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, 'base64').toString())
        : undefined,
      ScanIndexForward: false, // mas recientes primero
    }),
  );

  const items = (result.Items ?? []).map((raw) => {
    const { id, ownerId: owner, name, description, createdAt } = raw as Item;
    return { id, ownerId: owner, name, description, createdAt };
  });

  return {
    items,
    nextToken: result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : undefined,
  };
}
