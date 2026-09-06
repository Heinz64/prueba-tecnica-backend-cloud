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
docs/       Requerimientos, historias de usuario, buenas practicas
```

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev      # http://localhost:4000
npm test         # 17 tests, ~95% cobertura
```

### Endpoints

- `POST /login` — body `{ "username": "...", "password": "..." }` → `{ token, role, rut? }`
- `GET /score/:rut` — header `Authorization: Bearer <token>` → `{ rut, score, fecha }`

### Usuarios mock

| username    | password  | role  | rut            |
|-------------|-----------|-------|----------------|
| admin       | admin123  | admin | —              |
| jperez      | user123   | user  | 12.345.678-5   |
| mgonzalez   | user123   | user  | 9.876.543-1    |

Un `user` solo puede consultar su propio RUT (403 si intenta otro); `admin` puede
consultar cualquiera.

## Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

## Reglas de negocio clave

- El score es determinista: mismo RUT siempre devuelve el mismo score (0-100),
  RUTs distintos dan scores distintos (hash del RUT normalizado, ver
  `backend/src/lib/score.ts`).
- `POST /login` nunca incluye `rut` en el JWT si el rol es `admin` (tal como pide
  el enunciado).
- Los errores nunca exponen detalle interno: 401 (no autenticado), 403 (autenticado
  pero sin permiso sobre ese RUT), 400 (RUT mal formado), 500 genérico para
  cualquier otro caso.
