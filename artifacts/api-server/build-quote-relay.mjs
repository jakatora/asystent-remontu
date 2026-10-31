import {build} from 'esbuild';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
if(!process.argv[2])throw Error('Pass the private server output file');
await build({entryPoints:[resolve(root,'src/lib/quote-relay-server.ts')],outfile:resolve(process.argv[2]),bundle:true,platform:'node',format:'cjs',target:'node24',external:['pg-native'],logLevel:'info'});
