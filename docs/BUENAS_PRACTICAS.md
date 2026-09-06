# Checklist de buenas practicas (guia rapida durante la prueba)

Basado en lo que pide `postulacion.md`. Usar como checklist antes de cada commit/PR.

El recurso de ejemplo `items` (`src/handlers/items.ts`, `src/lib/items-repository.ts`,
`src/middleware/`) recorre cada punto marcado con [x] — sirve como referencia de patron a
replicar cuando se conozca el enunciado real, no como parte de la solucion en si.

## Arquitectura / Backend
- [x] Logica de negocio desacoplada de los handlers (handlers delgados, logica en `src/lib`). Ver `src/handlers/items.ts` vs `src/lib/items-repository.ts`.
- [x] Servicios idempotentes donde aplica. Ver `createItem`: la idempotencyKey del cliente es el id del item; un reintento devuelve el item existente en vez de duplicarlo o fallar.
- [x] Manejo explicito de errores (tipos de error propios, no silenciar excepciones). Ver `src/lib/errors.ts` + `src/middleware/http.ts`.
- [x] Validacion de entradas (zod) en cada handler expuesto. Ver `src/types/item.ts`.
- [x] Observabilidad: logs estructurados (JSON), sin datos sensibles en logs. Ver `src/lib/logger.ts` (redacta `token`, `authorization`, etc).

## APIs REST
- [x] Codigos de estado HTTP correctos y consistentes (400/401/404/409/500 segun el error). Ver `src/lib/errors.ts`.
- [ ] Contratos de entrada/salida documentados (OpenAPI) — pendiente, evaluar si el tiempo alcanza segun el enunciado real.
- [x] Paginacion en listados. Ver `listItemsByOwner` (`limit` + `nextToken` codificado en base64 desde `LastEvaluatedKey`).

## DynamoDB
- [x] Modelo de acceso definido ANTES de escribir codigo. Documentado como comentario en `src/lib/items-repository.ts`.
- [x] Uso de PK/SK acorde a los patrones de consulta reales (`pk`/`sk` para lookup por id, GSI1 para listar por owner).
- [x] Evitar Scan; se usa `QueryCommand` sobre el GSI, nunca `ScanCommand`.

## Seguridad
- [x] JWT para autenticacion; se valida firma y expiracion. Ver `src/middleware/auth.ts` (cambiar a `aws-jwt-verify` si el proveedor real es Cognito/OAuth2).
- [x] Secretos nunca en el repo (`.env` en `.gitignore`; `JWT_SECRET` de ejemplo solo para dev local, en real va a SSM/Secrets Manager).
- [x] Principio de minimo privilegio en IAM: `serverless.yml` acota `Resource` al ARN de la tabla y su GSI, nunca `"*"`.
- [x] Validar y sanitizar inputs (Zod) antes de tocar logica de negocio.

## Testing
- [x] Tests unitarios de la logica de negocio, no solo de los handlers. Ver `tests/unit/items-repository.test.ts`, `auth.test.ts`, `item-schema.test.ts`.
- [x] Tests de casos de error (idempotencia, token invalido/expirado, 400/404/500), no solo el happy path.
- [x] Cobertura sobre el umbral de `jest.config.js` (70%) — el ejemplo `items` queda en ~96%.

## Git / CI-CD
- [ ] Commits pequenos y descriptivos (Conventional Commits: feat/fix/chore/test/docs).
- [ ] Trabajar en rama `feature/*` desde `develop`, PR hacia `develop`, merge a `main` al finalizar.
- [ ] CI en verde (lint + build + test) antes de dar por terminada la entrega.
- [ ] README actualizado con instrucciones de ejecucion.

## Uso de IA (explicito en la oferta)
- [ ] Poder explicar CUALQUIER linea de codigo generada con asistencia de IA.
- [ ] No aceptar codigo sin entenderlo ("vibe coding" esta explicitamente mal visto).
- [ ] Dejar en el PR/README una nota breve de que partes se apoyaron en IA y por que.
