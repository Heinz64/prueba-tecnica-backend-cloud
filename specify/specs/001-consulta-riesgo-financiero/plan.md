# Plan técnico: Consulta de Riesgo Financiero

**Feature:** `001-consulta-riesgo-financiero` · Ver `spec.md` para el qué/por qué.

Este documento es el manual técnico para quien se una al equipo: cómo está
armado el proyecto, por qué se tomó cada decisión relevante, y cuáles eran
las alternativas consideradas.

## Arquitectura general

Monorepo con tres carpetas independientes, cada una con su propio
`package.json` y ciclo de vida:

```
backend/    API REST (Express + TypeScript)
frontend/   SPA (React + TypeScript, Vite)
e2e/        Suite Playwright que ejercita backend + frontend reales
```

**Decisión:** monorepo con carpetas independientes, no un paquete único ni
un workspace de npm (`npm workspaces`). Con un desafío de alcance acotado y
un plazo corto, un workspace agrega configuración (resolución de
dependencias compartidas, hoisting) sin beneficio real — cada carpeta tiene
dependencias casi disjuntas (Express vs. React vs. Playwright).

## Backend

- **Stack:** Node.js + TypeScript (modo estricto), Express, `jsonwebtoken`,
  `zod` para validación de input, Jest + Supertest para tests.
- **Decisión — Express plano, no Serverless/AWS:** el desafío real pide una
  API REST convencional. El scaffold inicial (previo a leer el enunciado
  real) se armó sobre AWS Lambda + Serverless Framework, y se descartó por
  completo al recibir el PDF — no se fuerza una arquitectura que no fue
  pedida (ver Constitución, principio I).

### Autenticación y autorización

- `POST /login` busca la credencial en una lista mock en memoria
  (`src/lib/mockUsers.ts`) y firma un JWT (`src/lib/jwt.ts`) con
  `{ sub, role, rut? }`. `rut` se omite del payload si `role = admin`.
- `middleware/authenticate.ts` valida `Authorization: Bearer <token>`
  (firma + expiración) y puebla `req.auth`.
- `middleware/authorizeScoreAccess.ts` valida el formato del RUT de la URL
  y aplica la regla de negocio: `admin` pasa siempre; `user` solo si su
  `rut` (normalizado) coincide con el de la URL.
- **Decisión — JWT stateless, no sesiones en servidor:** no hay base de
  datos ni almacenamiento de sesión; el JWT contiene todo lo necesario para
  autorizar la siguiente request. Encaja con "no persistencia" del
  enunciado y es más simple de testear.

### Validación de RUT

`src/lib/rut.ts` normaliza el RUT (quita puntos/guion, uppercase de la K) y
valida en dos pasos:
1. **Forma:** 7-8 dígitos + dígito verificador (`[0-9K]`).
2. **Dígito verificador real:** algoritmo módulo 11 sobre el cuerpo
   numérico, comparado contra el DV recibido.

**Decisión — validar el DV real, no solo la forma:** se detectó durante QA
manual que un RUT con forma válida pero DV incorrecto (ej. `12.345.678-9`)
pasaba la validación y devolvía un score, como si fuera un RUT real. Se
corrigió agregando el cálculo del DV esperado (ver commit
`fix(backend): valida el digito verificador real del RUT`).

### Score determinista

`src/lib/score.ts` aplica un hash tipo djb2 sobre el RUT normalizado y lo
acota a `[0, 100]` con módulo. Es puro (sin estado, sin I/O), lo que lo hace
trivial de testear (determinismo, independencia del formato de entrada,
rango).

### Manejo de errores

`src/lib/errors.ts` define una jerarquía (`ValidationError` 400,
`UnauthorizedError` 401, `ForbiddenError` 403) capturada por un middleware
central en `app.ts`, que nunca expone detalle interno en errores no
esperados (los mapea a 500 genérico y loguea el detalle solo del lado
servidor).

## Frontend

- **Stack:** React 18 + TypeScript + Vite. Sin `react-router-dom` — con
  solo dos pantallas (login / consulta), el enrutamiento condicional por
  estado de sesión (`session ? <ScorePage /> : <LoginPage />`) es
  suficiente y evita configuración extra bajo presión de tiempo.
- **Estado de sesión:** `AuthContext` (React Context + `useState`),
  persistido en `localStorage` (envuelto en try/catch: si el storage no
  está disponible, la app sigue funcionando, solo no persiste entre
  recargas).
- **Internacionalización:** `LanguageContext` + diccionario
  `src/i18n/translations.ts` (es/en), persistido igual que la sesión.
  **Decisión:** diccionario propio en vez de una librería de i18n
  (`react-i18next`, etc.) — con dos idiomas y un puñado de pantallas, una
  librería agrega una dependencia y configuración que no se justifican
  todavía; si el proyecto crece a más idiomas o interpolación compleja,
  ese es el momento de migrar.
- **Formato de RUT en vivo:** `src/lib/rutFormat.ts` reformatea el input
  del campo RUT mientras se escribe (puntos cada 3 dígitos + guion antes
  del DV), para que quien lo escribe libremente (el admin) no tenga que
  adivinar el formato esperado.
- **UX de carga:** spinner inline en los botones + inputs deshabilitados
  durante el request, y un *skeleton* con el alto aproximado del resultado
  final en la consulta de score, para evitar saltos de layout entre el
  estado "cargando" y el estado "con resultado".
- **Tema visual:** hoja de estilos propia (sin framework CSS), tema oscuro
  con variables CSS, pensado para verse como un producto fintech.

## Contratos de API

### `POST /login`

```
Request:  { "username": string, "password": string }
Response 200: { "token": string, "role": "admin" | "user", "rut"?: string }
Response 400: { "error": "VALIDATION_ERROR", "message": string }   // body invalido
Response 401: { "error": "UNAUTHORIZED", "message": string }       // credenciales invalidas
```

### `GET /score/:rut`

```
Header:   Authorization: Bearer <token>
Response 200: { "rut": string, "score": number (0-100), "fecha": string (ISO 8601) }
Response 400: { "error": "VALIDATION_ERROR", "message": string }   // RUT con forma o DV invalidos
Response 401: { "error": "UNAUTHORIZED", "message": string }       // sin token / token invalido o expirado
Response 403: { "error": "FORBIDDEN", "message": string }          // user consultando un RUT que no es el suyo
```

## Seguridad

Ver la sección "Consideraciones de seguridad para producción" en el
`README.md` raíz: HTTPS/TLS obligatorio en producción (el login viaja hoy
sobre HTTP plano solo porque corre en `localhost`), HSTS, rate limiting en
`/login`, hash de passwords en reposo si se agrega persistencia real, y
`CORS_ORIGIN` restringido por entorno.

## Estrategia de testing

- **Unitario/integración (backend, Jest + Supertest):** cubre las reglas de
  negocio puras (score, validación de RUT) y el comportamiento HTTP
  completo de ambos endpoints, incluyendo los casos límite de autorización.
  ~95% de cobertura.
- **E2E (Playwright, `e2e/`):** ejercita la UI real contra el backend real
  (sin mocks) para los flujos completos: login inválido, login `user` con
  RUT bloqueado, consulta propia, consulta de `admin` a un RUT ajeno,
  logout, y el auto-formato del RUT.
- **CI (`.github/workflows/ci.yml`):** tres jobs independientes
  (`backend`, `frontend`, `e2e`), cada uno con su propio lockfile —
  reemplaza al workflow original de un solo paquete, que asumía (de forma
  incorrecta, tras el pivote a monorepo) un único `package-lock.json` en la
  raíz.

## Alternativas consideradas y descartadas

- **Cifrar el password en el cliente antes de enviarlo:** descartado — no
  reemplaza a TLS (ver README, sección de seguridad); da una falsa
  sensación de seguridad sin resolver el problema real.
- **Librería de i18n completa:** descartada por ahora (ver arriba), a favor
  de un diccionario simple.
- **`react-router-dom`:** descartado por no ser necesario con dos pantallas
  y renderizado condicional simple.
