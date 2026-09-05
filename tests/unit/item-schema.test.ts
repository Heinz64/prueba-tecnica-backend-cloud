import { CreateItemInputSchema, ListItemsQuerySchema } from '../../src/types/item';

describe('CreateItemInputSchema', () => {
  it('acepta un input valido', () => {
    const result = CreateItemInputSchema.safeParse({
      name: 'Laptop',
      idempotencyKey: '11111111-1111-1111-1111-111111111111',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza si falta idempotencyKey', () => {
    const result = CreateItemInputSchema.safeParse({ name: 'Laptop' });
    expect(result.success).toBe(false);
  });

  it('rechaza si idempotencyKey no es un uuid valido', () => {
    const result = CreateItemInputSchema.safeParse({
      name: 'Laptop',
      idempotencyKey: 'no-es-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza name vacio', () => {
    const result = CreateItemInputSchema.safeParse({
      name: '',
      idempotencyKey: '11111111-1111-1111-1111-111111111111',
    });
    expect(result.success).toBe(false);
  });
});

describe('ListItemsQuerySchema', () => {
  it('aplica el default de limit cuando no viene', () => {
    const result = ListItemsQuerySchema.parse({});
    expect(result.limit).toBe(20);
  });

  it('rechaza limit sobre el maximo permitido', () => {
    const result = ListItemsQuerySchema.safeParse({ limit: '9999' });
    expect(result.success).toBe(false);
  });
});
