import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';

import { isAppError } from '../lib/errors';
import { logger } from '../lib/logger';

type LambdaHandler = (
  event: APIGatewayProxyEventV2,
  context: Context,
) => Promise<APIGatewayProxyResultV2>;

function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/**
 * Envoltura comun para todos los handlers HTTP: mantiene el handler "delgado"
 * (solo orquesta), centraliza logging estructurado y el mapeo de errores a
 * codigos HTTP correctos.
 * BUENAS_PRACTICAS.md > Arquitectura > "Logica de negocio desacoplada de los handlers"
 * BUENAS_PRACTICAS.md > Arquitectura > "Manejo explicito de errores"
 */
export function withHttpHandler(handlerName: string, handler: LambdaHandler): LambdaHandler {
  return async (event, context) => {
    const requestId = context.awsRequestId;

    logger.info('request.start', {
      handler: handlerName,
      requestId,
      method: event.requestContext?.http?.method,
      path: event.requestContext?.http?.path,
    });

    try {
      const result = await handler(event, context);
      logger.info('request.success', { handler: handlerName, requestId });
      return result;
    } catch (error) {
      if (isAppError(error)) {
        logger.warn('request.client_error', {
          handler: handlerName,
          requestId,
          code: error.code,
          statusCode: error.statusCode,
        });
        return jsonResponse(error.statusCode, { error: error.code, message: error.message });
      }

      // Error no esperado: se loguea completo para depurar, pero NUNCA se expone el
      // detalle interno en la respuesta al cliente (evita fuga de informacion - OWASP).
      logger.error('request.unhandled_error', {
        handler: handlerName,
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return jsonResponse(500, { error: 'INTERNAL_ERROR', message: 'Error interno inesperado' });
    }
  };
}
