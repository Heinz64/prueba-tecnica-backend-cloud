#!/usr/bin/env node
/**
 * Genera un JWT de desarrollo para probar la API local (serverless-offline)
 * sin exponer el secreto en el navegador ni en el cliente HTML.
 *
 * Uso:
 *   node scripts/generate-dev-token.js [userId]
 *
 * El secreto debe coincidir con el que usa serverless-offline: por defecto
 * "dev-only-secret-do-not-use-in-prod" (definido en serverless.yml), o el
 * valor de la variable de entorno JWT_SECRET si la sobreescribiste.
 */
const jwt = require('jsonwebtoken');

const userId = process.argv[2] || 'dev-user-1';
const secret = process.env.JWT_SECRET || 'dev-only-secret-do-not-use-in-prod';

const token = jwt.sign({ sub: userId }, secret, { expiresIn: '8h' });

console.log(token);
