# Requerimientos e Historias de Usuario — Consulta de Riesgo Financiero

Extraido literalmente de "Desafío TécnicoV3.pdf" (YOL1 / ProntoPaga). Este documento
es la fuente de verdad del alcance — no se agrega nada que no esté aquí.

## Contexto

MVP seguro para la Consulta de Riesgo Financiero: evaluar el score crediticio de
personas o empresas según su RUT, con control de acceso basado en roles (admin/user).

## Requisitos técnicos (textual del enunciado)

### Backend (Node.js + TypeScript)

1. **POST /login**
   - Simula autenticación con credenciales mock (sin persistencia en base de datos).
   - Retorna un JWT firmado con payload: `sub` (id de usuario), `role` (`admin`|`user`),
     `rut` (solo si el rol es `user`).
2. **GET /score/:rut**
   - Retorna el score financiero de un RUT (número entre 0 y 100).
   - Regla determinista: mismo RUT → mismo score siempre; RUTs distintos → scores
     distintos (en la práctica, distribuidos).
   - Respuesta esperada: `{ "rut": "12.345.678-9", "score": 73, "fecha": "2025-06-27T14:35:00Z" }`
   - Middlewares requeridos:
     - **Autenticación:** validar firma y expiración del JWT.
     - **Autorización:** rol `user` solo puede consultar su propio RUT (debe coincidir
       con el RUT de su token); rol `admin` puede consultar cualquier RUT.

### Frontend (React + TypeScript)

- Interfaz simple, funcional y responsive.
- Formulario de Login.
- Vista de Consulta de Score por RUT.
- Manejo de errores: notificaciones/mensajes claros ante RUT no permitido o fallo de
  autenticación.

### Entrega

- Commits frecuentes y estables dentro del plazo de 3 horas (solo cuenta lo commiteado
  dentro del plazo).
- README.md con instrucciones de ejecución local.
- Transparencia de uso de IA en README.md o `ai_interactions.md`.

## Historias de usuario

### HU-1 — Login
**Como** usuario del sistema (admin o user)
**Quiero** iniciar sesión con mis credenciales
**Para** obtener un token que me permita consultar el score financiero

**Criterios de aceptación:**
- Dado credenciales mock válidas, `POST /login` responde `200` con un JWT firmado.
- El JWT contiene `sub`, `role`, y `rut` únicamente si `role === 'user'`.
- Dado credenciales inválidas, responde `401` sin filtrar detalle interno.

### HU-2 — Consulta de score (usuario propio)
**Como** usuario con rol `user`
**Quiero** consultar el score financiero de mi propio RUT
**Para** conocer mi riesgo crediticio

**Criterios de aceptación:**
- Dado un JWT válido de rol `user` cuyo `rut` coincide con el RUT solicitado,
  `GET /score/:rut` responde `200` con `{ rut, score, fecha }`.
- El `score` es siempre el mismo para ese RUT en llamadas repetidas.
- Dado un JWT válido de rol `user` cuyo `rut` NO coincide con el solicitado,
  responde `403` (autorización, no autenticación).

### HU-3 — Consulta de score (admin, cualquier RUT)
**Como** usuario con rol `admin`
**Quiero** consultar el score financiero de cualquier RUT
**Para** evaluar el riesgo de cualquier cliente de la fintech

**Criterios de aceptación:**
- Dado un JWT válido de rol `admin`, `GET /score/:rut` responde `200` para
  cualquier RUT bien formado, sin importar el `rut` del propio token (no tiene).

### HU-4 — Protección de la API
**Como** responsable de seguridad de la fintech
**Quiero** que ningún endpoint de score sea accesible sin un JWT válido
**Para** evitar fugas de información crediticia

**Criterios de aceptación:**
- Sin header `Authorization`, `GET /score/:rut` responde `401`.
- Con un JWT expirado o con firma inválida, responde `401`.
- Un 401/403 nunca expone el secreto de firma ni detalles internos del servidor.

### HU-5 — Login en el frontend
**Como** postulante que evalúa el MVP
**Quiero** un formulario de login simple
**Para** autenticarme y navegar a la consulta de score

**Criterios de aceptación:**
- El formulario pide usuario/contraseña, llama a `POST /login`, guarda el token,
  y redirige a la vista de consulta.
- Ante credenciales inválidas, se muestra un mensaje de error claro (sin recargar
  la página ni exponer detalles técnicos).

### HU-6 — Consulta de score en el frontend
**Como** usuario autenticado
**Quiero** ingresar un RUT y ver su score
**Para** evaluar el riesgo financiero sin usar Postman/curl

**Criterios de aceptación:**
- Un rol `user` ve prellenado (o solo puede consultar) su propio RUT.
- Un rol `admin` puede escribir cualquier RUT y consultarlo.
- Errores de autorización (403) y autenticación (401) se muestran como notificaciones
  claras, no como pantallas rotas o JSON crudo.

## Fuera de alcance (explícitamente, para no perder tiempo)

- Persistencia en base de datos (el enunciado pide credenciales mock).
- AWS Lambda / DynamoDB / Serverless Framework — el scaffold previo se preparó para
  una oferta distinta (rol AWS senior); este desafío puntual no lo pide.
- Registro de usuarios, recuperación de contraseña, roles adicionales.
