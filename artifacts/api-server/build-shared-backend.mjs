import { build } from 'esbuild';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
if (!process.argv[2]) throw new Error('Pass an output file in the existing shared backend checkout.');
await build({
  entryPoints: [resolve(root, 'src/shared-backend.ts')],
  outfile: resolve(process.argv[2]), bundle: true, platform: 'node', format: 'cjs',
  target: 'node22', external: ['express', 'pg-native'], logLevel: 'info',
  banner: { js: '// Generated from Asystent Remontu pricing source. Rebuild with build-shared-backend.mjs; do not hand-edit.' },
});
