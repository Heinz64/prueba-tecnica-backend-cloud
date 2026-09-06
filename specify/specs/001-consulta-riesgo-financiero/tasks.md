# Tasks: Consulta de Riesgo Financiero

**Feature:** `001-consulta-riesgo-financiero` · Ver `spec.md` (qué/por qué) y
`plan.md` (cómo). Este documento es el desglose de trabajo real, en el
mismo orden en que se ejecutó, con el commit correspondiente — sirve como
manual de onboarding y como registro histórico de decisiones.

> Nota: los commits anteriores a `122bf81` (scaffold AWS/Serverless) se
> descartaron por completo al leer el enunciado real, que no pedía
> infraestructura serverless. No se listan aquí porque no forman parte de
> este feature; quedan en el historial de git como evidencia del pivote.

## Fase 0 — Alcance

- [x] **T001** — Leer el enunciado real (`Desafío TécnicoV3.pdf`) y
  escribir `docs/REQUERIMIENTOS_HISTORIAS_USUARIO.md` antes de tocar
  código, para fijar el alcance y evitar inventar funcionalidad.
  `122bf81 docs: requerimientos e historias de usuario del desafio real + limpieza de scaffold AWS`
- [x] **T002** — Eliminar el scaffold AWS/Serverless previo (fuera de
  alcance para el enunciado real) y preparar la carpeta para el monorepo
  `backend/` + `frontend/`. (mismo commit `122bf81`)

## Fase 1 — Backend

- [x] **T010** — Scaffold del backend (Express + TypeScript estricto,
  ESLint/Prettier, Jest, `.env.example`).
- [x] **T011** — `POST /login` con credenciales mock y firma de JWT
  (`rut` solo si `role = user`).
- [x] **T012** — `GET /score/:rut` + middlewares de autenticación
  (`authenticate.ts`) y autorización (`authorizeScoreAccess.ts`).
- [x] **T013** — Score determinista (`lib/score.ts`, hash djb2) y
  normalización/validación de RUT (`lib/rut.ts`).
- [x] **T014** — Manejo centralizado de errores (`lib/errors.ts` +
  middleware en `app.ts`), sin fuga de detalle interno.
- [x] **T015** — Tests unitarios + integración (17 tests, ~95% cobertura).
  `8f3eb40 feat(backend): API REST completa - login JWT + score por RUT con roles`

## Fase 2 — Frontend

- [x] **T020** — Scaffold del frontend (Vite + React + TypeScript,
  ESLint, tema visual fintech en `styles/global.css`).
- [x] **T021** — `AuthContext` (sesión persistida en `localStorage`) y
  cliente HTTP tipado (`api/client.ts`).
- [x] **T022** — `LoginPage` y `ScorePage`: formulario de login, consulta
  de score con RUT bloqueado/editable según rol, notificaciones de error.
  `6edf95c feat(frontend): implementa SPA React con login y consulta de score`

## Fase 3 — Calidad y CI

- [x] **T030** — Suite E2E con Playwright sobre backend + frontend reales
  (login inválido, RUT bloqueado, consulta propia, consulta de admin,
  logout).
  `9972202 test(e2e): agrega suite Playwright end-to-end sobre backend + frontend reales`
- [x] **T031** — Instrucciones de arranque local claras y ordenadas en el
  README (requisitos, pasos numerados, tabla de usuarios mock).
  `e50232b docs: instrucciones claras y ordenadas para levantar el proyecto en local`
- [x] **T032** — Adaptar el workflow de CI al monorepo (jobs
  independientes `backend`/`frontend`/`e2e`, cada uno con su propio
  lockfile); el workflow original asumía un único paquete en la raíz.
  `b54fbfc fix(ci): adapta el workflow al monorepo (backend/frontend/e2e)`

## Fase 4 — Corrección post-QA manual

- [x] **T040** — Bug encontrado en QA manual: un RUT con forma válida pero
  dígito verificador incorrecto pasaba la validación. Se agrega el cálculo
  real del DV (módulo 11) y se corrige el RUT mock de `mgonzalez`, que
  también tenía un DV inválido.
  `472ef38 fix(backend): valida el digito verificador real del RUT, no solo la forma`
- [x] **T041** — Documentar consideraciones de seguridad para producción
  (TLS, HSTS, rate limiting, hash de passwords en reposo) tras una
  pregunta directa sobre el transporte del password en el login.
  `278d308 docs: agrega consideraciones de seguridad para produccion al README`

## Fase 5 — Pulido de UX

- [x] **T050** — Loading sin saltos de layout (spinner + skeleton),
  responsive para pantallas chicas, ortografía corregida (tildes/eñes) y
  selector de idioma español/inglés (`LanguageContext` +
  `i18n/translations.ts`).
  `9983858 feat(frontend): loading sin saltos de layout, ortografia y selector ES/EN`
- [x] **T051** — Auto-formato del RUT mientras se escribe (con o sin
  puntos/guion), para que el campo libre del admin no dependa de que la
  persona adivine el formato.
  `15982e7 feat(frontend): auto-formatea el RUT mientras se escribe`

## Fase 6 — Documentación SDD (este cambio)

- [x] **T060** — Agregar `specify/` con la constitución del proyecto y el
  spec/plan/tasks de este feature, para que el equipo tenga una referencia
  formal del qué, el por qué y el cómo.

## Pendiente / no incluido en este ciclo

- [ ] Ejecutar la suite E2E de Playwright en un entorno con acceso a
  `cdn.playwright.dev` (bloqueado en el sandbox de desarrollo; corre en
  GitHub Actions, ver `.github/workflows/ci.yml`).
- [ ] Definir si se agrega una librería de i18n si el proyecto crece a más
  de dos idiomas (ver `plan.md`, alternativas consideradas).
