# Checklist de buenas practicas (guia rapida durante la prueba)

Basado en lo que pide `postulacion.md`. Usar como checklist antes de cada commit/PR.

## Arquitectura / Backend
- [ ] Logica de negocio desacoplada de los handlers (handlers delgados, logica en `src/lib`).
- [ ] Servicios idempotentes donde aplique (especial cuidado con SQS/eventos).
- [ ] Manejo explicito de errores (try/catch, tipos de error propios, no silenciar excepciones).
- [ ] Validacion de entradas (zod o similar) en cada handler expuesto.
- [ ] Observabilidad: logs estructurados (JSON), sin datos sensibles en logs.

## APIs REST
- [ ] Codigos de estado HTTP correctos y consistentes.
- [ ] Contratos de entrada/salida documentados (OpenAPI si el tiempo lo permite).
- [ ] Paginacion/filtros si aplica a listados.

## DynamoDB
- [ ] Modelo de acceso definido ANTES de crear la tabla (single-table si aplica).
- [ ] Uso de PK/SK acorde a los patrones de consulta reales.
- [ ] Evitar Scan; preferir Query con indices (GSI) cuando se necesite.

## Seguridad
- [ ] JWT/OAuth2 para autenticacion; validar firma y expiracion.
- [ ] Nunca commitear secretos (.env en .gitignore, usar SSM/Secrets Manager en real).
- [ ] Principio de minimo privilegio en roles IAM (statements acotados a recursos, no `*`).
- [ ] Validar y sanitizar inputs (OWASP Top 10: injection, broken auth, etc.).

## Testing
- [ ] Tests unitarios de la logica de negocio (no solo de los handlers).
- [ ] Tests de casos de error, no solo el "happy path".
- [ ] Cobertura razonable (ver umbral en `jest.config.js`).

## Git / CI-CD
- [ ] Commits pequenos y descriptivos (Conventional Commits: feat/fix/chore/test/docs).
- [ ] Trabajar en rama `feature/*` desde `develop`, PR hacia `develop`, merge a `main` al finalizar.
- [ ] CI en verde (lint + build + test) antes de dar por terminada la entrega.
- [ ] README actualizado con instrucciones de ejecucion.

## Uso de IA (explicito en la oferta)
- [ ] Poder explicar CUALQUIER linea de codigo generada con asistencia de IA.
- [ ] No aceptar codigo sin entenderlo ("vibe coding" esta explicitamente mal visto).
- [ ] Dejar en el PR/README una nota breve de que partes se apoyaron en IA y por que.
