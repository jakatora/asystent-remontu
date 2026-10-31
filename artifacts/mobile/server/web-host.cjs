/** Expo web hosting and a private merchant quote route. Projects stay local. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {pipeline}=require('node:stream/promises');
const {createGzip}=require('node:zlib');
const {pages,renderPage}=require('./web-pages.cjs');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.wasm':'application/wasm','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.ttf':'font/ttf','.otf':'font/otf','.woff':'font/woff','.woff2':'font/woff2'};
// source: https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/#web-setup
// Do not disclose project locations to external shops. Some reviewed product
// photos (eWinyl) also reject an unrelated browser referrer with an HTML 403.
const HEADERS={'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'credentialless','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};

function createWebServer({root=path.resolve(__dirname,'..','web-build')}={}){
  root=path.resolve(root);
  let relayHandler;
  let release=null;
  try{release=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8'));}catch{}
  const server=http.createServer((req,res)=>{
    for(const [name,value]of Object.entries(HEADERS))res.setHeader(name,value);
    void handle(req,res).catch(error=>{
      console.error('Web request failed:',error.code??error.name);
      if(!res.headersSent)res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});
      res.end('Nie udało się wczytać strony.');
    });
  });
  function text(req,res,status,body,type='text/plain; charset=utf-8'){
    res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:body);
  }
  async function sendFile(req,res,file,stat){
    const ext=path.extname(file).toLowerCase(),type=MIME[ext]??'application/octet-stream';
    const immutable=/[.-][a-f0-9]{32,64}[.-]/i.test(path.basename(file)),etag=`W/"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
    res.setHeader('Content-Type',type);res.setHeader('ETag',etag);
    res.setHeader('Cache-Control',ext==='.html'||path.basename(file)==='release.json'?'no-cache':immutable?'public, max-age=31536000, immutable':'public, max-age=3600');
    res.setHeader('Vary','Accept-Encoding');
    if(req.headers['if-none-match']===etag){res.writeHead(304);res.end();return;}
    const gzip=stat.size>1024&&/^(text\/|application\/json)/.test(type)&&/(?:^|,)\s*gzip\s*(?:,|$)/i.test(req.headers['accept-encoding']??'');
    if(gzip)res.setHeader('Content-Encoding','gzip');else res.setHeader('Content-Length',stat.size);
    res.writeHead(200);
    if(req.method==='HEAD'){res.end();return;}
    if(gzip)await pipeline(fs.createReadStream(file),createGzip(),res);else await pipeline(fs.createReadStream(file),res);
  }
  async function handle(req,res){
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url??'/','http://localhost').pathname).replace(/\\/g,'/');}catch{text(req,res,400,'Nieprawidłowy adres.');return;}
    if(pathname.includes('\0')){text(req,res,400,'Nieprawidłowy adres.');return;}
    if(pathname==='/internal/retailer-delivery'){
      if(process.env.REMONT_QUOTE_RELAY_MODE!=='server'||!/^[a-f0-9]{64}$/.test(process.env.REMONT_QUOTE_RELAY_SECRET??'')){text(req,res,503,JSON.stringify({error:'quote_unavailable'}),'application/json; charset=utf-8');return;}
      if(!relayHandler)relayHandler=require('./delivery-relay.cjs').createQuoteRelayHandler();
      await relayHandler(req,res);return;
    }
    if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');text(req,res,405,'Metoda niedostępna.');return;}
    if(pathname==='/healthz'){
      const missingAssetCount=Array.isArray(release?.files)?release.files.filter(asset=>!fs.existsSync(path.join(root,asset.path))).length:0;
      const quoteRelayReady=process.env.REMONT_QUOTE_RELAY_MODE!=='server'||/^[a-f0-9]{64}$/.test(process.env.REMONT_QUOTE_RELAY_SECRET??'')&&fs.existsSync(path.join(__dirname,'delivery-relay.cjs'));
      const ready=fs.existsSync(path.join(root,'index.html'))&&missingAssetCount===0&&quoteRelayReady;
      text(req,res,ready?200:503,JSON.stringify({ok:ready,missingAssetCount,quoteRelayReady,app:'Asystent Remontu',version:release?.version??null,sourceCommit:release?.sourceCommit??null,builtAt:release?.builtAt??null,apiBaseUrl:release?.apiBaseUrl??null}),'application/json; charset=utf-8');return;
    }
    if(pages[pathname]){text(req,res,200,renderPage(pages[pathname]),'text/html; charset=utf-8');return;}
    const file=path.resolve(root,'.'+pathname),relative=path.relative(root,file);
    if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)){text(req,res,403,'Adres niedostępny.');return;}
    if(pathname.split('/').some(part=>part.startsWith('.'))){text(req,res,404,'Nie znaleziono pliku.');return;}
    let stat;try{stat=await fs.promises.stat(file);}catch(error){if(!['ENOENT','ENOTDIR'].includes(error.code))throw error;}
    if(stat?.isFile()){await sendFile(req,res,file,stat);return;}
    // Missing scripts/WASM must not receive the application's HTML shell.
    if(/^\/(?:assets|_expo)(?:\/|$)/.test(pathname)||MIME[path.extname(pathname).toLowerCase()]||pathname!=='/'&&!(req.headers.accept??'').includes('text/html')){text(req,res,404,'Nie znaleziono pliku.');return;}
    const index=path.join(root,'index.html');
    try{await sendFile(req,res,index,await fs.promises.stat(index));}catch(error){if(error.code!=='ENOENT')throw error;text(req,res,503,'Aplikacja jest przygotowywana. Spróbuj ponownie za chwilę.');}
  }
  return server;
}
module.exports={createWebServer};
