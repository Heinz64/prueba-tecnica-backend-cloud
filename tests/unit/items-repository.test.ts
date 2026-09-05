import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

import { dynamoDocClient } from '../../src/lib/dynamo-client';
import { createItem, getItemById, listItemsByOwner } from '../../src/lib/items-repository';

jest.mock('../../src/lib/dynamo-client', () => ({
  dynamoDocClient: { send: jest.fn() },
  TABLE_NAME: 'test-table',
}));

const mockedSend = dynamoDocClient.send as jest.Mock;

describe('items-repository', () => {
  beforeEach(() => {
    mockedSend.mockReset();
  });

  describe('createItem', () => {
    it('crea un item nuevo cuando la idempotencyKey no existe', async () => {
      mockedSend.mockResolvedValueOnce({});

      const result = await createItem('owner-1', {
        name: 'Laptop',
        idempotencyKey: '11111111-1111-1111-1111-111111111111',
      });

      expect(result.id).toBe('11111111-1111-1111-1111-111111111111');
      expect(result.ownerId).toBe('owner-1');
      expect(mockedSend).toHaveBeenCalledTimes(1);
    });

    it('es idempotente: si la key ya existe, devuelve el item existente en vez de duplicar o fallar', async () => {
      const existing = {
        id: '22222222-2222-2222-2222-222222222222',
        ownerId: 'owner-1',
        name: 'Laptop original',
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      mockedSend
        .mockRejectedValueOnce(
          new ConditionalCheckFailedException({ message: 'condition failed', $metadata: {} }),
        )
        .mockResolvedValueOnce({ Item: existing });

      const result = await createItem('owner-1', {
        name: 'Laptop duplicada',
        idempotencyKey: '22222222-2222-2222-2222-222222222222',
      });

      expect(result).toEqual(existing);
      expect(mockedSend).toHaveBeenCalledTimes(2);
    });

    it('propaga errores inesperados de DynamoDB (no los esconde)', async () => {
      mockedSend.mockRejectedValueOnce(new Error('ProvisionedThroughputExceededException'));

      await expect(
        createItem('owner-1', {
          name: 'Laptop',
          idempotencyKey: '33333333-3333-3333-3333-333333333333',
        }),
      ).rejects.toThrow('ProvisionedThroughputExceededException');
    });
  });

  describe('getItemById', () => {
    it('retorna null cuando el item no existe (no lanza excepcion)', async () => {
      mockedSend.mockResolvedValueOnce({});
      const result = await getItemById('no-existe');
      expect(result).toBeNull();
    });

    it('retorna el item cuando existe', async () => {
      mockedSend.mockResolvedValueOnce({
        Item: {
          id: 'abc',
          ownerId: 'owner-1',
          name: 'Mouse',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      });
      const result = await getItemById('abc');
      expect(result?.name).toBe('Mouse');
    });
  });

  describe('listItemsByOwner', () => {
    it('usa Query (no Scan) y devuelve nextToken cuando hay mas paginas', async () => {
      mockedSend.mockResolvedValueOnce({
        Items: [{ id: '1', ownerId: 'owner-1', name: 'A', createdAt: '2026-01-01T00:00:00.000Z' }],
        LastEvaluatedKey: { pk: 'ITEM#1', sk: 'ITEM#1' },
      });

      const result = await listItemsByOwner('owner-1', 20);

      expect(result.items).toHaveLength(1);
      expect(result.nextToken).toBeDefined();

      // Verifica que se use QueryCommand sobre el GSI, no un Scan.
      const sentCommand = mockedSend.mock.calls[0][0];
      expect(sentCommand.constructor.name).toBe('QueryCommand');
      expect(sentCommand.input.IndexName).toBe('GSI1');
    });

    it('no devuelve nextToken cuando no hay mas paginas', async () => {
      mockedSend.mockResolvedValueOnce({ Items: [] });
      const result = await listItemsByOwner('owner-1', 20);
      expect(result.nextToken).toBeUndefined();
    });
  });
});
