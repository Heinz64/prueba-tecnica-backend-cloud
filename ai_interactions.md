# Transparencia de uso de IA

Este documento describe, de forma honesta, en qué partes del desarrollo se usó
una herramienta de IA (Claude Code) y cuál fue el rol de cada parte (humano vs
IA). Se actualiza a medida que avanza el proyecto, no es un registro de un
solo momento.

## Herramienta utilizada

- **Claude Code** (Anthropic), usado como asistente de programación dentro de
  un entorno de terminal/agente, con acceso a lectura/escritura de archivos
  del proyecto y ejecución de comandos (npm, git, curl) en un entorno
  controlado, incluyendo el equipo local del desarrollador (vía un puente
  remoto) para instalar dependencias, levantar servidores y verificar el
  comportamiento real antes de cada commit.

## Rol del humano (Heinz Barrientos)

- Definió el alcance real a partir del enunciado (`Desafío TécnicoV3.pdf`) y
  decidió explícitamente **no inventar** funcionalidad fuera de lo pedido.
- Tomó las decisiones de arquitectura y organización del repo: estructura
  monorepo (`/backend`, `/frontend`, `/e2e`), reutilizar en una rama nueva
  (`feature/desafio-real`) las prácticas ya establecidas (TypeScript estricto,
  ESLint/Prettier, Jest, Conventional Commits) en vez de reescribir desde
  cero, y el flujo de branch + Pull Request hacia `main` para la entrega.
- Definió los requisitos de UI ("interfaz moderna en React, acorde a una
  fintech") y de pulido posterior (loading sin saltos de layout, ortografía,
  selector de idioma, auto-formato de RUT, toggle de mostrar/ocultar
  contraseña).
- Encontró en pruebas manuales el bug de validación de RUT (un RUT con forma
  correcta pero dígito verificador incorrecto pasaba y devolvía un score) y
  pidió explícitamente evaluar si mostrar el score para RUTs sin validación
  real era correcto — esa pregunta fue la que llevó a corregir la validación.
- Preguntó explícitamente por la seguridad del transporte del password en el
  login, lo que llevó a documentar las consideraciones de seguridad para
  producción en el README.
- Pidió agregar la documentación del proyecto en formato Spec-Driven
  Development (`specify/`) para que el equipo tenga una referencia formal.
- Revisó y aprobó cada commit antes de subirlo al repositorio, y gestionó el
  token de acceso a GitHub de forma efímera en cada push.

## Rol de Claude Code (acelerador de implementación)

- Redactó el primer borrador de `docs/REQUERIMIENTOS_HISTORIAS_USUARIO.md` a
  partir del PDF, para fijar el alcance antes de programar.
- Generó el código base del backend (Express + TypeScript): rutas `/login` y
  `/score/:rut`, middlewares de autenticación (verificación de JWT) y
  autorización (regla `user` solo su propio RUT / `admin` cualquiera), manejo
  centralizado de errores, normalización/validación de RUT (incluyendo el
  cálculo del dígito verificador real, módulo 11, agregado tras el hallazgo
  de QA manual del humano), y la función de score determinista (hash del RUT
  normalizado).
- Generó las pruebas unitarias e integración (Jest + Supertest) para los
  casos de éxito y error de ambos endpoints (~95% de cobertura), y la suite
  end-to-end con Playwright que ejercita la UI real contra el backend real.
- Generó el scaffolding y los componentes de la SPA en React + TypeScript
  (contexto de autenticación con persistencia en `localStorage`, cliente
  HTTP, páginas de login y consulta de score, hoja de estilos con tema
  "fintech" oscuro), siguiendo los lineamientos de diseño acordados con el
  humano, y las mejoras posteriores de UX: loading con spinner/skeleton sin
  saltos de layout, diseño responsive, corrección de ortografía, selector de
  idioma español/inglés (contexto + diccionario de traducciones), auto-
  formato del RUT mientras se escribe, y el toggle de mostrar/ocultar
  contraseña.
- Adaptó el workflow de CI (`.github/workflows/ci.yml`) al monorepo cuando
  falló en el Pull Request por asumir un único `package-lock.json` en la
  raíz (leftover del scaffold inicial).
- Redactó las consideraciones de seguridad para producción en el README y la
  documentación Spec-Driven Development (`specify/`: constitución del
  proyecto, spec, plan técnico y desglose de tareas del feature).
- Ejecutó verificaciones automatizadas (lint, build, tests, pruebas manuales
  con `curl` y arranque real de ambos servidores) antes de cada commit, para
  confirmar que el comportamiento coincide con lo pedido en el enunciado.

## Qué NO generó la IA de forma autónoma

- No decidió el alcance del proyecto ni agregó funcionalidad no solicitada
  (por ejemplo, no se agregó persistencia en base de datos, ni AWS/Serverless,
  ni registro de usuarios: todo eso fue explícitamente descartado por el
  humano como fuera de alcance).
- No decidió qué bugs corregir por iniciativa propia: la corrección de la
  validación del dígito verificador del RUT partió de una observación del
  humano en pruebas manuales, no de un hallazgo autónomo de la IA.
- No eligió ni gestionó las credenciales de GitHub; los tokens de acceso los
  proporcionó el humano en cada sesión de forma efímera (nunca se guardaron en
  el repositorio ni en configuración persistente).
