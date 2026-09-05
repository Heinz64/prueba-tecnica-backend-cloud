# Prueba Tecnica - Backend/Cloud Senior Node.js

Repositorio base para la prueba tecnica del proceso de postulacion a
**Ingeniero Backend/Cloud Senior Node.js** (arquitecturas serverless en AWS, entorno fintech).

> Este scaffold se preparo ANTES de descargar el enunciado real (pendiente de acceso via
> OTP en el link de DocSend). Defini el stack, la arquitectura y los lineamientos de
> seguridad/testing en base a lo solicitado en la oferta de trabajo, y use Claude Code
> como acelerador para la implementacion del andamiaje (config de lint/test/CI, estructura
> de carpetas, ejemplo de handler). Cada decision fue revisada y es explicable por mi.
> Ver `docs/BUENAS_PRACTICAS.md` para el checklist a seguir.

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

## Panel visual de prueba (client/index.html)

Con el server local corriendo (`npm run sls:offline`), abre `client/index.html`
directamente en el navegador (doble clic, o "Abrir con" tu navegador) para crear,
listar y ver items de forma visual, sin usar curl/Postman.

1. Genera un token de prueba (el secreto nunca se expone en el navegador):
   `npm run dev:token -- dev-user-1`
2. Pega el token en el campo "Bearer token" del panel.
3. Crea y explora items desde ahi.

Es una herramienta de desarrollo local, no forma parte de la entrega.

**Nota:** `serverless-offline` emula Lambda + API Gateway, pero no una tabla DynamoDB
real. `/health` funciona sin problema; crear/listar items falla con
`Could not load credentials from any providers` hasta que haya una tabla real
(desplegada en AWS) o DynamoDB Local (plugin `serverless-dynamodb`, requiere Java).
El panel sirve igual para validar auth, CORS y el formato de las respuestas de error.

## Coleccion de Postman (postman/collection.json)

Alternativa a `client/index.html` para probar la API con Postman/Insomnia (compatibles
con el formato Postman v2.1). Incluye health check y todos los metodos de items
(crear, obtener por id, listar con paginacion) mas casos de error (401, 404, 400) y
un caso que demuestra la idempotencia.

1. Importa `postman/collection.json` en Postman.
2. En las variables de la coleccion, define `token` (genera uno con
   `npm run dev:token -- dev-user-1`). `baseUrl` ya viene con `http://localhost:3000`.
3. Corre "Crear item" primero — guarda el id creado en la variable `itemId` para que
   "Obtener item por id" y "Crear item (reintento idempotente)" lo usen automaticamente.

Aplica la misma limitacion que el panel HTML: crear/listar requieren una tabla
DynamoDB real detras (ver nota arriba).

## Estrategia de branching

- `main`: version estable/entregable final.
- `develop`: integracion de features durante el desarrollo de la prueba.
- `feature/<nombre>`: una rama por funcionalidad/endpoint, PR hacia `develop`.

Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

## Nota sobre uso de IA

Defini los lineamientos tecnicos (stack, arquitectura, seguridad, testing) en base a los
requisitos de la oferta, y use Claude Code como acelerador para construir el andamiaje
inicial. Reviso y comprendo cada linea antes de commitear, en linea con lo solicitado en
el proceso ("comprension integra del codigo, sin vibe coding"): puedo explicar el porque
de cada decision (eleccion de Serverless Framework, modelado de DynamoDB, permisos IAM,
configuracion de lint/test/CI, etc.).

## Pendiente

- [ ] Descargar y leer el enunciado real (link DocSend, requiere OTP por correo).
- [ ] Ajustar `serverless.yml` y handlers al enunciado especifico.
- [ ] Actualizar esta seccion con el detalle del desafio una vez conocido.
