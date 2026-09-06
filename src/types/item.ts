import { z } from 'zod';

/**
 * Contrato de entrada para crear un item.
 * BUENAS_PRACTICAS.md > APIs REST > "Contratos de entrada/salida documentados"
 * BUENAS_PRACTICAS.md > Seguridad > "Validar y sanitizar inputs (OWASP Top 10)"
 */
export const CreateItemInputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  // Clave de idempotencia provista por el cliente (ej. UUID generado por el front).
  // BUENAS_PRACTICAS.md > Arquitectura > "Servicios idempotentes donde aplique"
  idempotencyKey: z.string().uuid(),
});

export type CreateItemInput = z.infer<typeof CreateItemInputSchema>;

export const ListItemsQuerySchema = z.object({
  // BUENAS_PRACTICAS.md > APIs REST > "Paginacion/filtros si aplica a listados"
  limit: z.coerce.number().int().min(1).max(100).default(20),
  nextToken: z.string().optional(),
});

export type ListItemsQuery = z.infer<typeof ListItemsQuerySchema>;

export interface Item {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface ListItemsResult {
  items: Item[];
  nextToken?: string;
}
