# Constitución del proyecto — Consulta de Riesgo Financiero

Versión: 1.0.0 · Ratificada: 2026-09-06

Estos son los principios no negociables de este proyecto. Cualquier feature,
PR o decisión técnica nueva debe poder justificarse contra ellos. Si un
principio necesita romperse, se documenta explícitamente el porqué en el
`plan.md` del feature correspondiente en vez de romperlo en silencio.

## I. No se inventa alcance

Se implementa exactamente lo que pide la especificación (`spec.md` del
feature), ni más ni menos. Si algo no está pedido explícitamente, se deja
fuera y se documenta en la sección "Fuera de alcance" del spec — no se
agrega "porque podría servir" o "porque es buena práctica en general".
Ejemplo aplicado: no hay persistencia en base de datos, ni AWS/Serverless,
ni registro de usuarios, porque el enunciado de este feature no los pide.

## II. Los contratos de API y las reglas de negocio son explícitos y testeados

Todo endpoint tiene su contrato de request/response documentado en el
`plan.md`, y toda regla de negocio (autenticación, autorización,
determinismo del score, validación de RUT) tiene al menos un test que la
verifica — unitario o de integración. Un comportamiento sin test no se
considera "terminado".

## III. Los errores nunca exponen detalle interno

Toda respuesta de error usa un código HTTP correcto (400/401/403/404/500) y
un mensaje que no filtra información interna (stack traces, nombres de
archivo, detalles de implementación). Los errores esperables (validación,
autenticación, autorización) usan una jerarquía de errores propia
(`AppError`); cualquier error no esperado cae a un 500 genérico.

## IV. Seguridad por defecto, no como ocurrencia tardía

Los secretos (JWT_SECRET, etc.) viven en variables de entorno, nunca
hardcodeados ni commiteados. El transporte de credenciales asume HTTPS/TLS
en producción (ver `docs` de seguridad en el README del feature). CORS se
restringe a los orígenes conocidos vía configuración, no se deja abierto
por defecto en producción.

## V. Trazabilidad: commits pequeños, frecuentes y explicables

Cada commit representa un cambio coherente y explica el *por qué*, no solo
el *qué*, en su cuerpo (Conventional Commits). El historial de commits es
en sí mismo documentación del proceso de decisión — se prioriza sobre
reescribir historia (no se usa `rebase -i` ni `commit --amend` para
esconder el camino recorrido).

## VI. Transparencia sobre el uso de IA como acelerador

Cuando se usa una herramienta de IA para acelerar la implementación, se
documenta explícitamente qué generó la IA y qué decidió el humano
(`ai_interactions.md`). La IA acelera la escritura de código y tests; las
decisiones de alcance, arquitectura y validación final del comportamiento
son siempre humanas.

## VII. Internacionalización y accesibilidad del texto de UI

Todo texto visible en la interfaz vive en un diccionario de traducciones
(no hardcodeado en los componentes), soporta al menos español e inglés, y
usa ortografía correcta (tildes, eñes). Los selectores de test end-to-end
usan roles y etiquetas accesibles (`getByLabel`, `getByRole`) en vez de
selectores CSS frágiles, lo que fuerza a que la UI sea accesible por
construcción.

## Gobernanza

Esta constitución aplica a todo el proyecto, no solo al feature con el que
se creó. Modificarla requiere que el equipo esté de acuerdo explícitamente
y se registre en el historial de versiones de este archivo.

### Historial de versiones

| Versión | Fecha       | Cambio                                   |
|---------|-------------|-------------------------------------------|
| 1.0.0   | 2026-09-06  | Versión inicial, ratificada con el primer feature (001-consulta-riesgo-financiero). |
