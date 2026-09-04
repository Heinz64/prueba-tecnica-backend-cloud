# Prueba Tecnica - Backend/Cloud Senior Node.js

Repositorio base para la prueba tecnica del proceso de postulacion a
**Ingeniero Backend/Cloud Senior Node.js** (arquitecturas serverless en AWS, entorno fintech).

> Este scaffold se preparo ANTES de descargar el enunciado real (pendiente de acceso via
> OTP en el link de DocSend). La estructura y stack se definieron en base a lo solicitado
> en la oferta de trabajo. Ver `docs/BUENAS_PRACTICAS.md` para el checklist a seguir.

## Stack

- **Runtime:** Node.js 20 + TypeScript
- **IaC / Serverless:** Serverless Framework v3 (Lambda, API Gateway HTTP API, DynamoDB)
- **Testing:** Jest + ts-jest
- **Lint/Format:** ESLint + Prettier
- **CI/CD:** GitHub Actions (lint -> build -> test)
- **Seguridad:** validacion con Zod, JWT (jsonwebtoken / aws-jwt-verify), roles IAM de minimo privilegio

## Estructura

```
src/
  handlers/     # Entry points de Lambda (delgados)
  lib/          # Logica de negocio, casos de uso
  middleware/   # Auth, validacion, error handling reutilizable
  types/        # Tipos e interfaces compartidas
tests/
  unit/         # Tests unitarios
  integration/  # Tests de integracion
docs/
  BUENAS_PRACTICAS.md
serverless.yml  # Definicion de infraestructura/funciones
```

## Como correr

```bash
npm install
npm run lint
npm run build
npm test
npm run sls:offline   # levanta API Gateway + Lambda local
```

## Estrategia de branching

- `main`: version estable/entregable final.
- `develop`: integracion de features durante el desarrollo de la prueba.
- `feature/<nombre>`: una rama por funcionalidad/endpoint, PR hacia `develop`.

Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

## Nota sobre uso de IA

Este repositorio se desarrolla con apoyo de Claude Code, tal como sugiere la oferta.
Todo el codigo generado con asistencia de IA es revisado y comprendido antes de
commitear, en linea con lo solicitado ("comprension integra, sin vibe coding").

## Pendiente

- [ ] Descargar y leer el enunciado real (link DocSend, requiere OTP por correo).
- [ ] Ajustar `serverless.yml` y handlers al enunciado especifico.
- [ ] Actualizar esta seccion con el detalle del desafio una vez conocido.
