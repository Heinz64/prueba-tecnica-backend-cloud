# Spec: Consulta de Riesgo Financiero (login + score por RUT)

**Feature:** `001-consulta-riesgo-financiero`
**Estado:** Implementado
**Origen:** Desafío técnico `Desafío TécnicoV3.pdf` para YOL1 / ProntoPaga (fintech).

## Por qué (contexto de negocio)

YOL1 / ProntoPaga necesita un MVP que permita a un operador consultar el
score de riesgo crediticio asociado a un RUT, con control de acceso por
rol: un usuario común solo debe poder ver su propio score, y un
administrador debe poder ver el de cualquier persona. No existe todavía
una base de datos real de usuarios ni de riesgo — se simula ambas cosas
de forma determinista para poder evaluar el diseño de autenticación,
autorización y API sin depender de infraestructura adicional.

## Qué (requisitos funcionales)

### RF-1 — Login
El sistema expone `POST /login` con credenciales mock (usuario/clave, sin
persistencia en base de datos). Devuelve un JWT firmado cuyo payload
incluye `sub` (id de usuario) y `role` (`admin` | `user`); el campo `rut`
solo se incluye si `role = user` (un admin no tiene un RUT propio).

### RF-2 — Consulta de score
El sistema expone `GET /score/:rut`, protegido por el JWT del login.
Devuelve `{ rut, score, fecha }`, donde `score` es un número entre 0 y 100
determinista: el mismo RUT siempre produce el mismo score, y RUTs distintos
producen (en la práctica) scores distintos.

### RF-3 — Autenticación
Toda request a `/score/:rut` requiere un header `Authorization: Bearer
<token>` con una firma y expiración válidas. Sin token, con token mal
firmado, o con token expirado → `401 Unauthorized`.

### RF-4 — Autorización por rol
- `role = user`: solo puede consultar el RUT que viene en su propio token.
  Si intenta consultar otro RUT → `403 Forbidden`.
- `role = admin`: puede consultar cualquier RUT válido.

### RF-5 — Validación de RUT
Un RUT con formato inválido (largo incorrecto, caracteres inválidos, o
**dígito verificador que no corresponde al número** — módulo 11) →
`400 Bad Request`. La validación de forma sola no es suficiente: un RUT con
la forma correcta pero el dígito verificador equivocado se rechaza igual.

### RF-6 — Interfaz de usuario
Una SPA con dos pantallas: login, y consulta de score por RUT. El campo RUT
queda bloqueado al RUT propio cuando el rol es `user`, y es editable
(con auto-formato mientras se escribe) cuando el rol es `admin`. Se
notifican claramente los casos de error (credenciales inválidas, sesión
inválida/expirada, RUT no autorizado, RUT mal formado).

## Historias de usuario

- **HU-1** — Como usuario del sistema, quiero iniciar sesión con mis
  credenciales para obtener un token que me identifique.
- **HU-2** — Como usuario con rol `user`, quiero consultar el score de mi
  propio RUT, y que se me impida consultar el de otra persona.
- **HU-3** — Como usuario con rol `admin`, quiero poder consultar el score
  de cualquier RUT, sin quedar limitado a uno propio.
- **HU-4** — Como cualquier usuario, quiero recibir un mensaje de error
  claro cuando mi sesión no es válida, cuando no tengo permiso sobre un
  RUT, o cuando el RUT que escribí no es válido.
- **HU-5** — Como administrador que escribe RUTs libremente, quiero que la
  interfaz me ayude con el formato (puntos, guion) en vez de dejarme
  adivinar cómo escribirlo.
- **HU-6** — Como parte del equipo, quiero poder usar la aplicación en
  español o en inglés.

## Fuera de alcance (explícito)

- Persistencia en base de datos (usuarios y credenciales son mock, en
  memoria).
- Infraestructura AWS/Serverless — se descartó tras leer el enunciado real;
  el desafío pide una API REST convencional, no serverless.
- Registro de usuarios, recuperación de contraseña, roles adicionales a
  `admin`/`user`.
- Un registro real de "riesgo" por persona: el score es una simulación
  determinista (hash del RUT), no un modelo de riesgo real. Por diseño,
  cualquier RUT con formato **y dígito verificador válidos** obtiene un
  score simulado — no existe el concepto de "persona sin score" porque no
  hay una base de datos de personas detrás.

## Criterios de aceptación (resumen; detalle en los tests)

- [x] Login admin: JWT sin `rut` en el payload.
- [x] Login user: JWT con `rut` en el payload.
- [x] Credenciales inválidas → 401 en login.
- [x] Sin token / token inválido / token expirado → 401 en `/score/:rut`.
- [x] `user` consulta su propio RUT → 200 con score determinista.
- [x] `user` consulta un RUT ajeno → 403.
- [x] `admin` consulta cualquier RUT válido → 200.
- [x] RUT con forma inválida → 400.
- [x] RUT con forma válida pero dígito verificador incorrecto → 400.
- [x] UI: campo RUT bloqueado para `user`, editable y auto-formateado para `admin`.
- [x] UI: loading visible sin saltos de layout, mensajes de error legibles.
- [x] UI: selector de idioma español/inglés.
