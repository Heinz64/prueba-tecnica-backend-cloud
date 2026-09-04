import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

/**
 * Handler de ejemplo (health check) para validar el pipeline
 * build -> lint -> test -> deploy antes de conocer el enunciado real.
 * Reemplazar/renombrar segun lo que pida la prueba.
 */
export const handler: APIGatewayProxyHandlerV2 = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
  };
};
