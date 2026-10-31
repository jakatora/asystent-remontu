const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const {createWebServer}=require('./web-host.cjs');
async function setup(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'remont-web-test-'));
 fs.mkdirSync(path.join(root,'_expo'),{recursive:true});
 fs.writeFileSync(path.join(root,'index.html'),'<!doctype html><html lang="pl">APP</html>');
 fs.writeFileSync(path.join(root,'_expo','entry-'+ 'a'.repeat(32)+'.js'),'/* app */'.repeat(500));
 fs.writeFileSync(path.join(root,'_expo','worker.js'),'self.onmessage=()=>{};');
 fs.writeFileSync(path.join(root,'_expo','db.wasm'),Buffer.from([0,97,115,109]));
 fs.writeFileSync(path.join(root,'release.json'),JSON.stringify({version:'1.0.3',sourceCommit:'test-source',apiBaseUrl:'https://example.test/api/remont',files:[{path:'_expo/worker.js'},{path:'_expo/db.wasm'}]}));
 const server=createWebServer({root});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{await new Promise(resolve=>server.close(resolve));const absolute=path.resolve(root);assert.equal(path.dirname(absolute),path.resolve(os.tmpdir()));assert.ok(path.basename(absolute).startsWith('remont-web-test-'));fs.rmSync(absolute,{recursive:true,force:true});});
 return{root,server,base:'http://127.0.0.1:'+server.address().port};
}
test('web host exposes the exact release, serves SPA deep links, and keeps missing assets distinct from HTML',async t=>{
 const {base,root}=await setup(t);const h=await fetch(base+'/healthz');assert.equal(h.status,200);assert.equal((await h.json()).sourceCommit,'test-source');
 const page=await fetch(base+'/project/qa?tab=estimate',{headers:{accept:'text/html'}});assert.equal(page.status,200);assert.match(await page.text(),/APP/);assert.equal(page.headers.get('cache-control'),'no-cache');
 assert.equal(page.headers.get('referrer-policy'),'no-referrer');
 assert.equal((await fetch(base+'/_expo/missing.js',{headers:{accept:'text/html'}})).status,404);assert.equal((await fetch(base+'/assets/missing.wasm',{headers:{accept:'text/html'}})).status,404);assert.equal((await fetch(base+'/unknown-json')).status,404);
 assert.equal((await fetch(base+'/healthz',{method:'POST'})).status,405);
 fs.unlinkSync(path.join(root,'_expo/db.wasm'));const missing=await fetch(base+'/healthz');assert.equal(missing.status,503);assert.equal((await missing.json()).missingAssetCount,1);
});
test('SQLite worker and WASM retain required isolation and MIME headers; head, gzip and revalidation work',async t=>{
 const {base}=await setup(t);
 for(const [file,mime]of [['worker.js','text/javascript; charset=utf-8'],['db.wasm','application/wasm']]){const r=await fetch(base+'/_expo/'+file);assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),mime);assert.equal(r.headers.get('cross-origin-opener-policy'),'same-origin');assert.equal(r.headers.get('cross-origin-embedder-policy'),'credentialless');await r.arrayBuffer();}
 const url=base+'/_expo/entry-'+ 'a'.repeat(32)+'.js',r=await fetch(url,{headers:{'accept-encoding':'gzip'}});assert.equal(r.headers.get('content-encoding'),'gzip');assert.match(r.headers.get('cache-control'),/immutable/);assert.equal((await r.text()).length,4500);
 const cached=await fetch(url,{headers:{'if-none-match':r.headers.get('etag')}});assert.equal(cached.status,304);assert.equal(await cached.text(),'');
 const head=await fetch(url,{method:'HEAD',headers:{'accept-encoding':'identity'}});assert.equal(head.status,200);assert.equal(head.headers.get('content-length'),'4500');assert.equal(await head.text(),'');
});
test('malformed encoded paths and escapes cannot read sibling files or crash the server',async t=>{
 const {base,server}=await setup(t);
 const raw=target=>new Promise((resolve,reject)=>{const r=http.get({hostname:'127.0.0.1',port:server.address().port,path:target,headers:{accept:'text/html'}},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,body}));});r.on('error',reject);});
 assert.equal((await raw('/%E0%A4%A')).status,400);assert.equal((await raw('/%00')).status,400);assert.equal((await raw('/%2e%2e%5coutside.txt')).status,403);assert.equal((await raw('/.env')).status,404);assert.equal((await fetch(base+'/healthz')).status,200);
});
test('help and data-use pages are available independently of database startup and have real local navigation',async t=>{
 const {base,root}=await setup(t);fs.unlinkSync(path.join(root,'index.html'));
 assert.equal((await fetch(base+'/healthz')).status,503);
 for(const url of ['/pomoc','/polityka-prywatnosci','/regulamin']){const r=await fetch(base+url);assert.equal(r.status,200);const text=await r.text();assert.match(text,/<html lang="pl">/);assert.match(text,/href="\/"/);assert.doesNotMatch(text,/OWNER_NAME|twojadomena|żadne zewnętrzne serwery/);}
 assert.equal((await fetch(base+'/',{headers:{accept:'text/html'}})).status,503);
});
