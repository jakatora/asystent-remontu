import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const mobile=path.dirname(fileURLToPath(import.meta.url));
const [exportPath,targetPath]=process.argv.slice(2);
if(!exportPath||!targetPath)throw Error('Usage: node prepare-web-release.mjs <new-export-directory> <new-release-directory>');
const exported=path.resolve(exportPath),target=path.resolve(targetPath);
if(exported===target||target.startsWith(exported+path.sep)||fs.existsSync(target)||fs.existsSync(exported))throw Error('Release target must be a new directory outside the export');
const before=execFileSync('git',['rev-parse','HEAD'],{cwd:mobile,encoding:'utf8'}).trim();
if(execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:mobile,encoding:'utf8'}).trim())throw Error('Build the committed source from an isolated clean checkout');
execFileSync(process.execPath,[path.join(mobile,'node_modules/expo/bin/cli'),'export','--platform','web','--max-workers','2','--output-dir',exported],{cwd:mobile,stdio:'inherit',timeout:600000});
if(execFileSync('git',['rev-parse','HEAD'],{cwd:mobile,encoding:'utf8'}).trim()!==before||execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:mobile,encoding:'utf8'}).trim())throw Error('Source changed during export');
const walk=(root,relative='')=>fs.readdirSync(path.join(root,relative),{withFileTypes:true}).flatMap(entry=>{
  if(entry.isSymbolicLink())throw Error('Export contains a symbolic link');
  const rel=path.join(relative,entry.name);
  return entry.isDirectory()?walk(root,rel):[rel];
});
const files=walk(exported),extensions=new Set(['.html','.js','.css','.json','.png','.jpg','.jpeg','.webp','.svg','.ico','.ttf','.otf','.woff','.woff2','.wasm']);
if(!files.includes('index.html')||!files.some(f=>f.endsWith('.wasm'))||!files.some(f=>/worker-.*\.js$/.test(f)))throw Error('Incomplete Expo/SQLite export');
for(const file of files){
  if(file.split(path.sep).some(part=>part.startsWith('.'))||!extensions.has(path.extname(file).toLowerCase()))throw Error('Unexpected exported file: '+file);
  if(!['_expo','assets'].includes(file.split(path.sep)[0])&&!['index.html','favicon.ico','metadata.json'].includes(file))throw Error('Unexpected export root file: '+file);
}
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:mobile,encoding:'utf8'}).trim();
const app=JSON.parse(fs.readFileSync(path.join(mobile,'app.json'),'utf8')).expo;
const metadata={app:'Asystent Remontu',version:app.version,sourceCommit,builtAt:new Date().toISOString(),apiBaseUrl:'https://backend-production-a43e3.up.railway.app/api/remont',files:files.map(file=>({path:file.replaceAll('\\','/'),sha256:createHash('sha256').update(fs.readFileSync(path.join(exported,file))).digest('hex')}))};
fs.mkdirSync(path.join(target,'server'),{recursive:true});
fs.cpSync(exported,path.join(target,'web-build'),{recursive:true});
for(const file of ['web.js','web-host.cjs','web-pages.cjs'])fs.copyFileSync(path.join(mobile,'server',file),path.join(target,'server',file));
fs.writeFileSync(path.join(target,'web-build/release.json'),JSON.stringify(metadata,null,2)+'\n');
fs.writeFileSync(path.join(target,'package.json'),JSON.stringify({name:'asystent-remontu-web',version:app.version,private:true,engines:{node:'24.x'},scripts:{start:'node server/web.js'}},null,2)+'\n');
fs.writeFileSync(path.join(target,'railway.json'),JSON.stringify({$schema:'https://railway.com/railway.schema.json',build:{builder:'RAILPACK'},deploy:{startCommand:'npm start',healthcheckPath:'/healthz',healthcheckTimeout:120,restartPolicyType:'ON_FAILURE',restartPolicyMaxRetries:3}},null,2)+'\n');
fs.writeFileSync(path.join(target,'.gitignore'),'node_modules\n.env*\n');
console.log(JSON.stringify({target,sourceCommit,version:app.version,assetCount:files.length,apiBaseUrl:metadata.apiBaseUrl}));
