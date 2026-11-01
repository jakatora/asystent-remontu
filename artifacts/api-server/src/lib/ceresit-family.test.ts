import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../shared-backend';
import fixtures from './fixtures/ceresit-primers-wave174.json';
import {CERESIT_PRIMER_SOURCES} from './ceresit-primers';
import {CT17_PROFI_FAMILY,CT17_TRANSPARENT_FAMILY,REVIEWED_PACKAGE_FAMILIES} from '../../../../lib/pricing-service/src/reviewed-package-families';

const families=REVIEWED_PACKAGE_FAMILIES.filter(f=>f.key===CT17_PROFI_FAMILY||f.key===CT17_TRANSPARENT_FAMILY);
function request(key:string,quantity=6,patch:Record<string,unknown>={}){
  const family=families.find(f=>f.key===key)!;
  return{jobs:[{jobId:'additional-materials',materials:[{material:{id:'primer',name:family.name,unit:'l',category:'primer',packageFamily:family.key,...patch},quantity}]}],options:{refreshPrices:false,delivery:{mode:'shipping'}}};
}
async function withServer(run:(url:string,calls:string[],unexpected:string[])=>Promise<void>,unavailable=false){
  const calls:string[]=[],unexpected:string[]=[];
  const service=createRemontService({background:false,initialObservations:[],fetchImpl:async input=>{
    const url=String(input),source=CERESIT_PRIMER_SOURCES.find(s=>s.url===url);calls.push(url);
    if(source){const fixture=fixtures.find(f=>f.sourceId===source.id)!;return new Response(unavailable?fixture.html.replaceAll('https://schema.org/InStock','https://schema.org/OutOfStock'):fixture.html,{headers:{'content-type':'text/html'}});}
    // The two other reviewed PROFI 10 l retailers are deliberately unavailable.
    // Their failed requests cannot supply a price or a free delivery.
    if(!['realbud.com','www.rabdom.pl'].includes(new URL(url).hostname))unexpected.push(url);
    return new Response('unavailable',{status:503});
  },basketQuoter:async()=>{throw Error('postcode required before native cart');}});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  try{await run('http://127.0.0.1:'+(server.address() as {port:number}).port,calls,unexpected);}finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
}
const post=(url:string,body:ReturnType<typeof request>)=>fetch(url+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});

test('each selected CT17 family refreshes both exact can sizes without a manual refresh or another family',async()=>{
  for(const f of families)await withServer(async(url,calls,unexpected)=>{
    const r=await post(url,request(f.key)),data:any=await r.json();assert.equal(r.status,200);assert.equal(data.materialsTotalGrosze,f.key===CT17_PROFI_FAMILY?9199:8448);
    const expected=CERESIT_PRIMER_SOURCES.filter(s=>f.packs.some(p=>p.ean===s.ean));assert.deepEqual(calls.filter(u=>u.startsWith('https://buduj24.pl/')).sort(),expected.map(s=>s.url).sort());
    assert.deepEqual(data.priceRefresh.confirmedOfferIds.sort(),expected.map(s=>s.id).sort());assert.equal(data.priceRefresh.failedOfferIds.length,f.key===CT17_PROFI_FAMILY?2:0);assert.deepEqual(unexpected,[]);assert.equal(data.deliveryComparison.best,null);
  });
});
test('changing required litres reuses recent exact-product checks and preserves mixed-can planning',async()=>{
  for(const f of families)await withServer(async(url,calls)=>{
    await post(url,request(f.key));const count=calls.length,r=await post(url,request(f.key,12)),data:any=await r.json();assert.equal(r.status,200);assert.equal(calls.length,count);assert.equal(data.priceRefresh.status,'recent');assert.equal(data.materialsTotalGrosze,f.key===CT17_PROFI_FAMILY?14263:12763);
    assert.deepEqual(data.consolidated.lines[0].packages.map((p:any)=>[p.packageSize,p.count]).sort((a:any,b:any)=>a[0]-b[0]),[[5,1],[10,1]]);
  });
});
test('unknown or contradictory CT17 family metadata cannot refresh arbitrary products',async()=>{
  await withServer(async(url,calls)=>{
    assert.equal((await post(url,request(CT17_PROFI_FAMILY,6,{packageFamily:'unreviewed-family'}))).status,400);
    for(const patch of [{name:families[1].name},{unit:'kg'},{category:'paint'},{ean:'5900089617050'},{gtin:'5900089617050'}]){const r=await post(url,request(CT17_PROFI_FAMILY,6,patch)),data:any=await r.json();assert.equal(r.status,200);assert.equal(data.stages[0].lines[0].resolved,false);}
    const fixed=request(CT17_PROFI_FAMILY);delete (fixed.jobs[0].materials[0].material as Record<string,unknown>).packageFamily;assert.equal((await post(url,fixed)).status,200);assert.deepEqual(calls,[]);
  });
});
test('unavailable CT17 cards remain unresolved without a payable total',async()=>{
  for(const f of families)await withServer(async(url)=>{const r=await post(url,request(f.key)),data:any=await r.json();assert.equal(r.status,200);assert.equal(data.stages[0].lines[0].resolved,false);assert.equal(data.deliveryComparison.best,null);assert.deepEqual(data.priceRefresh.confirmedOfferIds,[]);},true);
});
test('two Ceresit families stay separate across the HTTP request and tiny positive demand still buys a can',async()=>{
  await withServer(async(url)=>{
    const body=request(CT17_PROFI_FAMILY);body.jobs.push(...request(CT17_TRANSPARENT_FAMILY).jobs);const data:any=await(await post(url,body)).json();assert.equal(data.materialsTotalGrosze,9199+8448);assert.equal(data.consolidated.lines.length,2);assert.deepEqual(data.consolidated.lines.map((l:any)=>l.packages[0].product.ean).sort(),['5900089218677','5900089617081']);
    const tiny:any=await(await post(url,request(CT17_PROFI_FAMILY,1e-8))).json();assert.equal(tiny.materialsTotalGrosze,5064);assert.equal(tiny.stages[0].lines[0].resolved,true);
  });
});
