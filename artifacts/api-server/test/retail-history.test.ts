import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {RetailPriceHistory} from '../src/lib/retail-history';
import {RETAIL_SOURCES,createRemontService} from '../src/shared-backend';
import type {RetailObservation,RetailSource} from '../src/lib/retail-pages';

const source=RETAIL_SOURCES.find(s=>s.id==='bestbudowa-soudal-inside-90mm')!;
const observation=(s=source,priceGrosze=12000,time=Date.now()-86400000):RetailObservation=>({sourceId:s.id,ean:s.ean,name:s.name,imageUrl:null,sourceUrl:s.url,currency:'PLN',availability:'in_stock',priceGrosze,observedAt:new Date(time).toISOString(),evidenceSha256:'a'.repeat(64)});
const validator=(sources:readonly RetailSource[])=>(o:RetailObservation)=>sources.find(s=>s.id===o?.sourceId&&!s.disabledReason&&s.ean===o.ean&&s.url===o.sourceUrl&&o.availability==='in_stock'&&o.currency==='PLN'&&Number.isSafeInteger(o.priceGrosze)&&o.priceGrosze>0&&/^[a-f0-9]{64}$/.test(o.evidenceSha256)&&Number.isFinite(Date.parse(o.observedAt)));

test('history compares only the same merchant and physical purchase unit, including bundle sizes',()=>{
 const sources=RETAIL_SOURCES.filter(s=>['dekork-professional-1pack','dekork-professional-2pack'].includes(s.id)),h=new RetailPriceHistory(sources,validator(sources)),now=Date.now(),current=new Map();
 for(const [i,s] of sources.entries()){h.remember(observation(s,[6899,13099][i],now-1000));const o=observation(s,[6999,12999][i],now);h.remember(o);current.set(s.id,o);}
 const result=h.response(sources,current)!;assert.equal(result.series.length,2);
 assert.deepEqual(result.series.map(s=>[s.packageSize,s.stats.deltaGrosze]),[[6,100],[12,-100]]);
 assert.ok(result.series.every(s=>s.history.every(p=>p.offerId===s.offerId&&p.store===s.store)&&!s.stats.isRealPromo));
 const stale=h.response(sources,new Map())!;assert.ok(stale.series.every(s=>s.stats.current===null&&s.stats.deltaGrosze===null&&s.stats.changePct===null));
});

test('history preserves evidenced timestamps and cannot restore another pack, branch or variant',()=>{
 const h=new RetailPriceHistory([source],validator([source]));h.remember(observation());const saved=h.snapshot();
 for(const change of[{packageSize:60},{unit:'szt'},{variantId:999},{dispatchDepartment:{id:'other',name:'Other'}},{store:'Other'}]){const changed={...source,...change},restored=new RetailPriceHistory([changed],validator([changed]));restored.restore(saved);assert.equal(restored.response([changed],new Map()),null);}
 const restored=new RetailPriceHistory([source],validator([source]));restored.restore(saved);restored.restore(saved);assert.equal(restored.snapshot().length,1);assert.equal(restored.snapshot()[0].observation.observedAt,saved[0].observation.observedAt);
});

test('invalid evidence, excessive/future timestamps and conflicting simultaneous prices do not become history',()=>{
 const h=new RetailPriceHistory([source],validator([source])),now=Date.now();
 for(const o of[{...observation(),priceGrosze:0},{...observation(),evidenceSha256:'no-proof'},observation(source,100,now+120000),observation(source,100,now-91*86400000)])h.remember(o);
 assert.equal(h.snapshot().length,0);h.remember(observation(source,100,now));h.remember(observation(source,101,now));h.remember(observation(source,100,now));assert.equal(h.snapshot().length,0);
});

test('bounded history retains the last 60 actual reads and averages safe integer prices without overflow',()=>{
 const h=new RetailPriceHistory([source],validator([source])),now=Date.now();
 for(let i=0;i<65;i++)h.remember(observation(source,Number.MAX_SAFE_INTEGER-i,now-65000+i*1000));
 const result=h.response([source],new Map())!;assert.equal(result.stats.count,60);assert.ok(Number.isSafeInteger(result.stats.average));assert.equal(result.history[0].priceGrosze,Number.MAX_SAFE_INTEGER-5);assert.equal(result.history.at(-1)!.priceGrosze,Number.MAX_SAFE_INTEGER-64);
});

test('real HTTP: a validated refresh persists one-offer rise across restart; failures cannot fabricate new points',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'remont-history-')),cachePath=join(dir,'prices.json'),initial=observation();let blocked=false,calls=0;
 writeFileSync(cachePath,JSON.stringify({version:2,observations:[initial],withdrawnAt:{}}));
 const fetchImpl:typeof fetch=async(input)=>{calls++;if(blocked||String(input)!==source.url)return new Response('blocked',{status:403});return new Response(`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:source.name,brand:source.brand,gtin13:source.ean,offers:{'@type':'Offer',price:'125.00',priceCurrency:'PLN',url:source.url,availability:'https://schema.org/InStock'}})}</script>`,{headers:{'content-type':'text/html'}});};
 let service=createRemontService({initialObservations:[initial],cachePath,background:false,fetchImpl});
 let server:ReturnType<ReturnType<typeof express>['listen']>|undefined;
 async function start(){const app=express();app.use(express.json());app.use(service.router);server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server!.once('listening',r));return `http://127.0.0.1:${(server.address() as {port:number}).port}`;}
 async function stop(){await new Promise<void>(r=>server!.close(()=>r()));service.close();}
 const refreshBody={job:{jobId:'history-proof',materials:[{material:{id:'tape',name:source.name,ean:source.ean,category:source.category,unit:source.unit},quantity:30}]},options:{refreshPrices:true}};
 try{
  let root=await start();const history=async()=>{const r=await fetch(root+'/pricing/history?ean='+source.ean);assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');return r.json();};
  const first=await history();assert.equal(first.stats.count,1);assert.equal(first.stats.deltaGrosze,null);
  const refresh=await fetch(root+'/pricing/stage',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(refreshBody)});assert.equal(refresh.status,200);
  const changed=await history(),series=changed.series.find((s:any)=>s.offerId===source.id);assert.deepEqual([series.stats.count,series.stats.previousGrosze,series.stats.current,series.stats.deltaGrosze],[2,12000,12500,500]);assert.equal(series.stats.changePct,4.17);assert.equal(series.stats.isRealPromo,false);assert.ok(calls>0);
  assert.equal(JSON.parse(readFileSync(cachePath,'utf8')).version,3);await stop();
  blocked=true;service=createRemontService({initialObservations:[initial],cachePath,background:false,fetchImpl});root=await start();assert.deepEqual(await history(),changed);
  assert.equal((await fetch(root+'/pricing/stage',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(refreshBody)})).status,200);assert.deepEqual(await history(),changed);
  for(const query of['','?ean[]=123','?ean='+source.ean+'&productId=wrong','?ean=unknown'])assert.equal((await fetch(root+'/pricing/history'+query)).status,query===''||query.includes('[]')?400:404);
  await stop();server=undefined;
 }finally{if(server?.listening)await stop();rmSync(dir,{recursive:true,force:true});}
});
