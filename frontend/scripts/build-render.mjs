import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const raw = process.env.CINEVERSE_API_ORIGIN?.trim();
if (!raw) throw new Error('Falta CINEVERSE_API_ORIGIN (URL HTTPS del backend, sin /api).');
const url = new URL(raw);
if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('CINEVERSE_API_ORIGIN debe ser un origen HTTPS sin ruta, usuario ni credenciales.');
}
const root = fileURLToPath(new URL('../', import.meta.url));
const file = new URL('../src/app/core/api-base.ts', import.meta.url);
const original = readFileSync(file);
try {
  writeFileSync(file, `// Generado para esta compilación. No contiene secretos.\nexport const API_ORIGIN = ${JSON.stringify(url.origin)};\n`, 'utf8');
  const cli = fileURLToPath(new URL('../node_modules/@angular/cli/bin/ng.js', import.meta.url));
  const result = spawnSync(process.execPath, [cli, 'build', '--configuration', 'production'], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Angular build exit: ${result.status}`);
  if (!existsSync(new URL('../dist/frontend/browser/index.html', import.meta.url))) throw new Error('No se encontró dist/frontend/browser/index.html');
  console.log('BUILD RENDER OK:', url.origin);
} finally {
  writeFileSync(file, original);
}
