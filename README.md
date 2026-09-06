# Consulta de Riesgo Financiero — Desafío Técnico

MVP para YOL1 / ProntoPaga: API REST (Node.js + TypeScript) con login JWT y
autorización por roles, más una SPA (React + TypeScript) para consultar el score
crediticio de un RUT.

Ver `docs/REQUERIMIENTOS_HISTORIAS_USUARIO.md` para el alcance exacto (extraído
del enunciado) y `ai_interactions.md` para la transparencia de uso de IA pedida.

## Estructura

```
backend/    API REST (Express + TypeScript)
frontend/   SPA (React + TypeScript)
e2e/        Pruebas end-to-end (Playwright) sobre backend + frontend reales
docs/       Requerimientos, historias de usuario, buenas practicas
```

## Requisitos

- Node.js 18 o superior (probado con Node 22) y npm.
- Dos terminales libres: una para el backend y otra para el frontend (deben
  correr al mismo tiempo).

## Cómo levantar el proyecto en local

### 1. Backend (API REST) — Terminal 1

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Queda escuchando en **http://localhost:4000**. Verificar que levantó bien:

```bash
curl http://localhost:4000/health
# {"status":"ok","timestamp":"..."}
```

### 2. Frontend (SPA React) — Terminal 2

```bash
cd frontend
npm install
npm run dev
```

Queda escuchando en **http://localhost:5173**. Abrir esa URL en el navegador.

### 3. Probar la app

En el login, usar cualquiera de estos usuarios mock (no hay base de datos, las
credenciales están hardcodeadas a propósito, ver `docs/REQUERIMIENTOS_HISTORIAS_USUARIO.md`):

| username    | password  | role  | rut            |
|-------------|-----------|-------|----------------|
| admin       | admin123  | admin | —              |
| jperez      | user123   | user  | 12.345.678-5   |
| mgonzalez   | user123   | user  | 9.876.543-1    |

- Con `jperez` o `mgonzalez` (role `user`): el campo RUT queda fijo con el RUT
  propio y solo se puede consultar ese.
- Con `admin`: el campo RUT es editable y se puede consultar cualquier RUT
  (por ejemplo, probar con el RUT de otro usuario).
- Con credenciales incorrectas: se muestra un mensaje de error claro.

### 4. Correr los tests (opcional pero recomendado)

Backend (unitarios + integración, Jest):

```bash
cd backend
npm test        # 17 tests, ~95% cobertura
```

E2E (Playwright, contra la app real corriendo):

```bash
cd e2e
npm install
npm run install:browsers   # descarga el navegador de Playwright (una vez)
npm test                   # levanta backend + frontend y corre la suite
```

## Endpoints

- `POST /login` — body `{ "username": "...", "password": "..." }` → `{ token, role, rut? }`
- `GET /score/:rut` — header `Authorization: Bearer <token>` → `{ rut, score, fecha }`

Un `user` solo puede consultar su propio RUT (403 si intenta otro); `admin` puede
consultar cualquiera.

## Reglas de negocio clave

- El score es determinista: mismo RUT siempre devuelve el mismo score (0-100),
  RUTs distintos dan scores distintos (hash del RUT normalizado, ver
  `backend/src/lib/score.ts`).
- `POST /login` nunca incluye `rut` en el JWT si el rol es `admin` (tal como pide
  el enunciado).
- Los errores nunca exponen detalle interno: 401 (no autenticado), 403 (autenticado
  pero sin permiso sobre ese RUT), 400 (RUT mal formado), 500 genérico para
  cualquier otro caso.

## Pruebas E2E (Playwright) — detalle

Cubren los flujos completos a traves de la UI real, contra el backend real
(no mocks): login invalido, login de `user` con RUT bloqueado, consulta de
score propia, consulta de `admin` a un RUT ajeno, y logout.

`npm test` (dentro de `e2e/`) copia automaticamente los `.env.example` de
`backend` y `frontend` si no existen (`scripts/ensure-env.js`), y Playwright
levanta ambos servidores (`webServer` en `playwright.config.ts`) antes de
correr los tests — no hace falta tener el backend/frontend corriendo a mano.

> Nota: estas pruebas se escribieron y quedaron listas para correr, pero no se
> pudieron ejecutar en el entorno donde se desarrollo este MVP porque bloqueaba
> la descarga del navegador de Playwright (sin acceso a `cdn.playwright.dev`).
> Los selectores usan las mismas etiquetas y textos reales de los componentes
> (`Usuario`, `Contrasena`, `RUT`, `Ingresar`, `Consultar`, `Cerrar sesion`),
> y el flujo fue validado manualmente end-to-end (login admin/user, RUT propio,
> RUT ajeno con 403, sin token con 401) antes de escribir los tests.
