import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const destination = process.argv[2];
if (!destination) throw new Error('Pass the existing shared backend checkout directory.');
const target = resolve(destination);
const appFile = resolve(target, 'src/app.js');
let app = readFileSync(appFile, 'utf8');
if (!app.includes("app.use(notFoundHandler)")) throw new Error('Unexpected shared backend app entry.');
mkdirSync(resolve(target, 'src/data'), { recursive: true });
mkdirSync(resolve(target, 'src/services'), { recursive: true });
copyFileSync(resolve(root, 'deploy/shared-backend/remont.js'), resolve(target, 'src/routes/remont.js'));
copyFileSync(resolve(root, 'deploy/shared-backend/verified-offers.json'), resolve(target, 'src/data/remont-verified-offers.json'));
if (!app.includes("import remontRouter from './routes/remont.js'")) {
  app = "import remontRouter from './routes/remont.js';\n" + app;
  app = app.replace('  app.use(notFoundHandler);', "  app.use('/api/remont', apiLimiter, remontRouter);\n  app.use(notFoundHandler);");
  writeFileSync(appFile, app);
}
const built = spawnSync(process.execPath, [resolve(root, 'artifacts/api-server/build-shared-backend.mjs'), resolve(target, 'src/services/remont-pricing.cjs')], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status ?? 1);
