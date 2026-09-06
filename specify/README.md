# `specify/` — Documentación en formato Spec-Driven Development (SDD)

Esta carpeta documenta el proyecto siguiendo la metodología **Spec-Driven
Development**: primero se define *qué* se construye y *por qué* (la
especificación), luego *cómo* se construye (el plan técnico), y por último
se descompone en tareas concretas — antes de (o junto con) escribir código.
Es la referencia que debería leer cualquier persona del equipo que se una al
proyecto o que necesite auditar una decisión.

## Estructura

```
specify/
  memory/
    constitution.md          <- principios no negociables del proyecto
  specs/
    001-consulta-riesgo-financiero/
      spec.md                <- QUE se construye y POR QUE (requisitos, historias de usuario, fuera de alcance)
      plan.md                <- COMO se construye (arquitectura, stack, contratos de API, decisiones tecnicas)
      tasks.md                <- Desglose en tareas, mapeado a los commits reales
```

## Cómo leer esto

1. **`memory/constitution.md`** — los principios que gobiernan cualquier
   feature de este proyecto (no solo el actual). Se lee una sola vez y se
   revisa cuando se propone romper alguno de sus puntos.
2. **`specs/001-consulta-riesgo-financiero/spec.md`** — la especificación
   funcional del feature entregado en este desafío técnico: login + consulta
   de score por RUT. Es la fuente de verdad de *qué* se pidió y qué quedó
   explícitamente fuera de alcance.
3. **`specs/001-consulta-riesgo-financiero/plan.md`** — el manual técnico:
   cómo está construido, las decisiones de arquitectura y sus alternativas
   consideradas, y los contratos de API.
4. **`specs/001-consulta-riesgo-financiero/tasks.md`** — el desglose de
   trabajo real, en el mismo orden en que se implementó, con referencia a
   los commits correspondientes (útil para onboarding o para revisar el
   historial de decisiones).

## Cómo agregar un feature nuevo

Cuando se agregue un nuevo feature a este proyecto, se crea una carpeta
`specs/00N-nombre-del-feature/` con su propio `spec.md`, `plan.md` y
`tasks.md`, siguiendo el mismo formato que `001-consulta-riesgo-financiero`.
La `constitution.md` no cambia por feature — solo se actualiza si el equipo
decide modificar un principio del proyecto completo.
