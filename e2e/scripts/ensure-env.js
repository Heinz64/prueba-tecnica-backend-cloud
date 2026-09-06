// Copia los .env de ejemplo si no existen, para que "npm test" funcione
// sin pasos manuales previos (backend y frontend requieren su .env local).
import { existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

const targets = [
  { example: join(root, 'backend', '.env.example'), real: join(root, 'backend', '.env') },
  { example: join(root, 'frontend', '.env.example'), real: join(root, 'frontend', '.env') },
];

for (const { example, real } of targets) {
  if (existsSync(example) && !existsSync(real)) {
    copyFileSync(example, real);
    console.log(`[e2e] creado ${real} a partir de ${example}`);
  }
}
