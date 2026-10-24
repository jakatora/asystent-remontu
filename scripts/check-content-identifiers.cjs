// Portable regression check: do not remove or rename persisted content IDs.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
const files = git(['ls-tree', '-r', '--name-only', 'HEAD', '--', 'artifacts/mobile/data/jobs']).trim().split('\n').filter(file => file.endsWith('.ts'));
const ids = source => new Set([...source.matchAll(/\bid\s*:\s*['"`]([^'"`]+)['"`]/g)].map(match => match[1]));
let checked = 0;
for (const file of files) {
  const before = ids(git(['show', `HEAD:${file}`]));
  const after = ids(fs.readFileSync(path.join(root, file), 'utf8'));
  const missing = [...before].filter(id => !after.has(id));
  if (missing.length) throw new Error(`${file}: removed identifiers: ${missing.join(', ')}`);
  checked += before.size;
}
process.stdout.write(`PASS: ${checked} content identifiers preserved across ${files.length} files.\n`);
