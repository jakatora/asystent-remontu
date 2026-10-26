// Node 24 + the workspace's existing TypeScript. No test-time install or disk DB.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const mobile = path.resolve(__dirname, '../artifacts/mobile');
const ts = createRequire(path.join(mobile, 'package.json'))('typescript');
require.extensions['.ts'] = (module, file) => {
  const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: file,
  });
  module._compile(result.outputText, file);
};
require(path.join(mobile, 'features/storage/sharedDatabase.test.ts'));
