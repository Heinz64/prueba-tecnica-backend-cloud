/**
 * Logger estructurado (JSON) sin datos sensibles.
 * BUENAS_PRACTICAS.md > Arquitectura > "Logs estructurados (JSON), sin datos sensibles en logs"
 *
 * Nunca loguear: tokens, contraseñas, headers de autorizacion, PII sin necesidad.
 */
const SENSITIVE_KEYS = new Set(['authorization', 'token', 'password', 'secret', 'jwt']);

function redact(meta: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    clean[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }
  return clean;
}

function write(
  level: 'info' | 'warn' | 'error',
  message: string,
  meta: Record<string, unknown> = {},
) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...redact(meta),
  };
  // eslint-disable-next-line no-console
  console[level === 'info' ? 'log' : level](JSON.stringify(entry));
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
};
