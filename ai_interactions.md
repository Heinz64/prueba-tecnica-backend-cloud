# Transparencia de uso de IA

Este documento describe, de forma honesta, en qué partes del desarrollo se usó
una herramienta de IA (Claude Code) y cuál fue el rol de cada parte (humano vs IA).

## Herramienta utilizada

- **Claude Code** (Anthropic), usado como asistente de programación dentro de un
  entorno de terminal/agente, con acceso a lectura/escritura de archivos del
  proyecto y ejecución de comandos (npm, git, curl) en un entorno controlado.

## Rol del humano (Heinz Barrientos)

- Definió el alcance real a partir del enunciado (`Desafío TécnicoV3.pdf`) y
  decidió explícitamente **no inventar** funcionalidad fuera de lo pedido.
- Tomó las decisiones de arquitectura y organización del repo: estructura
  monorepo (`/backend` y `/frontend`), reutilizar en una rama nueva
  (`feature/desafio-real`) las prácticas ya establecidas (TypeScript estricto,
  ESLint/Prettier, Jest, Conventional Commits) en vez de reescribir desde cero.
- Definió los requisitos de UI ("interfaz moderna en React, acorde a una
  fintech") y validó manualmente el flujo completo (login admin/user, consulta
  de score propia, intento de consulta de RUT ajeno con `user`, sin token).
- Revisó y aprobó cada commit antes de subirlo al repositorio.

## Rol de Claude Code (acelerador de implementación)

- Redactó el primer borrador de `docs/REQUERIMIENTOS_HISTORIAS_USUARIO.md` a
  partir del PDF, para fijar el alcance antes de programar.
- Generó el código base del backend (Express + TypeScript): rutas `/login` y
  `/score/:rut`, middlewares de autenticación (verificación de JWT) y
  autorización (regla `user` solo su propio RUT / `admin` cualquiera), manejo
  centralizado de errores, normalización/validación de RUT, y la función de
  score determinista (hash del RUT normalizado).
- Generó las pruebas unitarias e de integración (Jest + Supertest) para los
  casos de éxito y error de ambos endpoints, y verificó la cobertura (~95%).
- Generó el scaffolding y los componentes de la SPA en React + TypeScript
  (contexto de autenticación con persistencia en `localStorage`, cliente HTTP,
  páginas de login y consulta de score, hoja de estilos con tema "fintech"
  oscuro), siguiendo los lineamientos de diseño acordados con el humano.
- Ejecutó verificaciones automatizadas (lint, build, tests, pruebas manuales
  con `curl` contra el servidor real) antes de cada commit, para confirmar que
  el comportamiento coincide con lo pedido en el enunciado.

## Qué NO generó la IA de forma autónoma

- No decidió el alcance del proyecto ni agregó funcionalidad no solicitada
  (por ejemplo, no se agregó persistencia en base de datos, ni AWS/Serverless,
  ni registro de usuarios: todo eso fue explícitamente descartado por el
  humano como fuera de alcance).
- No eligió ni gestionó las credenciales de GitHub; los tokens de acceso los
  proporcionó el humano en cada sesión de forma efímera (nunca se guardaron en
  el repositorio ni en configuración persistente).
