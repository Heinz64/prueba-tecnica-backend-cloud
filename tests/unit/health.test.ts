import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';

import { handler } from '../../src/handlers/health';

describe('health handler', () => {
  it('responde 200 con status ok', async () => {
    const event = {} as APIGatewayProxyEventV2;
    const context = {} as Context;

    const result = (await handler(event, context, () => undefined)) as APIGatewayProxyResultV2;
    const typedResult = result as { statusCode: number; body: string };

    expect(typedResult.statusCode).toBe(200);
    const body = JSON.parse(typedResult.body) as { status: string; timestamp: string };
    expect(body.status).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
  });
});
