import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,unlinkSync,rmdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import express from 'express';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {observeCastoramaBrowser,type BrowserProductSnapshot} from '../src/lib/castorama-browser-observation';
import {createRemontService} from '../src/shared-backend';
import {isComparableOffer} from '../../../lib/pricing-service/src/estimate';
import fixtureData from './fixtures/castorama-browser.json' with {type:'json'};

// Actual DOM JSON-LD and visible AX fields from the twelve public cards,
// captured 2026-10-26. Full source captures remain in the task's research files.
const fixtures=fixtureData as {sourceId:string;snapshot:BrowserProductSnapshot}[];
const source=(id:string)=>RETAIL_SOURCES.find(s=>s.id===id)!;
const fresh=(index=0)=>({...structuredClone(fixtures[index].snapshot),capturedAt:new Date().toISOString()});
function changeProduct(snapshot:BrowserProductSnapshot,change:(p:any)=>void){const next=structuredClone(snapshot),product=JSON.parse(next.schemas[0]);change(product);next.schemas[0]=JSON.stringify(product);return next;}

test('current online Castorama prices cannot win a collection basket without a branch price and stock confirmation',async()=>{
 const rows=fixtures.map((fixture,index)=>observeCastoramaBrowser(fresh(index),source(fixture.sourceId)));
 const service=createRemontService({initialObservations:rows,background:false,basketQuoter:async()=>({reason:'retailer_access_required'})});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const materials=fixtures.map(fixture=>{const s=source(fixture.sourceId);return{material:{id:s.id,name:s.name,ean:s.ean,unit:s.unit,category:s.category},quantity:s.packageSize};});
  const post=async(mode:'shipping'|'pickup')=>{const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'renovation',materials}],options:{store:'Castorama',delivery:{mode,postalCode:'00-001'}}})});assert.equal(response.status,200);return response.json();};
  const online=await post('shipping');assert.ok(online.stages[0].lines.every((line:any)=>line.resolved));assert.equal(online.deliveryComparison.best,null);
  const pickup=await post('pickup');assert.ok(pickup.stages[0].lines.every((line:any)=>!line.resolved));assert.equal(pickup.deliveryComparison.best,null);assert.equal(pickup.deliveryComparison.missingProductCount,fixtures.length);assert.ok(pickup.coverage.pickupConfirmationStores.includes('Castorama'));
  assert.equal(service.status().offers,fixtures.length,'online offers remain available for material and home-delivery comparisons');
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});

test('native online offers bind exact codes, whole purchase units and visible gross prices without importing local branch stock',()=>{
 const prices=[5498,7998,3848,2098,6398,48800,38800,59800,1524,2548,20800,41800];
 for(let i=0;i<fixtures.length;i++){
  const snapshot=fresh(i),s=source(fixtures[i].sourceId),observation=observeCastoramaBrowser(snapshot,s);
  assert.equal(observation.priceGrosze,prices[i]);assert.equal(observation.ean,s.ean);assert.equal(observation.stockPackages,undefined);assert.equal(observation.verification?.method,'browser');assert.equal(Date.parse(observation.verification!.expiresAt)-Date.parse(observation.observedAt),86400000);
  const later=observeCastoramaBrowser(snapshot,s,new Date(Date.parse(snapshot.capturedAt)+60000));assert.deepEqual(later,observation,'reviewing the same capture must not extend its date or expiry');
 }
 assert.ok(fixtures[0].snapshot.axState.includes('stacjonarnym: 70'));
});

test('pickup-only availability, a cheap regional price, ambiguous products and unrelated banners cannot become a home-delivery offer',()=>{
 const snapshot=fresh(),s=source(fixtures[0].sourceId);
 const localCheap=changeProduct(snapshot,p=>{p.offers[0].price='1.00';p.offers[1].price='1.00';});assert.equal(observeCastoramaBrowser(localCheap,s).priceGrosze,5498);
 for(const broken of [changeProduct(snapshot,p=>p.offers=p.offers.filter((o:any)=>o.description!=='Home Delivery')),changeProduct(snapshot,p=>p.offers[2].availability='https://schema.org/OutOfStock'),changeProduct(snapshot,p=>p.offers[2].priceCurrency='EUR'),changeProduct(snapshot,p=>p.offers[2].availableAtOrFrom={name:'Only a branch'}),{...snapshot,schemas:[...snapshot.schemas,snapshot.schemas[0]]}])assert.throws(()=>observeCastoramaBrowser(broken,s));
 assert.throws(()=>observeCastoramaBrowser({...snapshot,axState:snapshot.axState.replace('54 , 98 zł','1 , 00 zł')},s),/browser_gross_price_mismatch/);
 assert.throws(()=>observeCastoramaBrowser({...snapshot,axState:snapshot.axState.replace('button Dodaj 1 przedmiot','button (disabled) Dodaj 1 przedmiot')},s),/browser_purchase_not_confirmed/);
});

test('unbranded is a reviewed unknown, while changed barcode, variant, unit, origin or explicit conflicting brand fails closed',()=>{
 const snapshot=fresh(),s=source(fixtures[0].sourceId);
 for(const broken of [changeProduct(snapshot,p=>p.gtin13='5059340271620'),changeProduct(snapshot,p=>p.name='Farba biała mat 20 l'),changeProduct(snapshot,p=>p.brand={name:'Unexpected Brand'}),{...snapshot,url:'https://other.example/'+s.ean+'_CAPL.prd'}])assert.throws(()=>observeCastoramaBrowser(broken,s));
 for(const changed of [{...s,browserReviewAllowed:false},{...s,brand:'',unbranded:false},{...s,packageSize:20},{...s,unit:'m2'}])assert.throws(()=>observeCastoramaBrowser(snapshot,changed));
 for(const capturedAt of [new Date(Date.now()-86400001).toISOString(),new Date(Date.now()+3600000).toISOString(),'invalid'])assert.throws(()=>observeCastoramaBrowser({...snapshot,capturedAt},s),/browser_observation_not_current/);
 for(const i of [5,10,11])assert.throws(()=>observeCastoramaBrowser(fresh(i),{...source(fixtures[i].sourceId),packageSize:2}),/browser_purchase_unit_not_confirmed/);
 const boxes=fresh(8);assert.throws(()=>observeCastoramaBrowser(changeProduct(boxes,p=>p.offers[2].price='1.52'),source(fixtures[8].sourceId)),/browser_gross_price_mismatch/);
});

test('real HTTP counts full cable rolls, ten-piece boxes and single WC/frame units instead of their shelf unit rates',async()=>{
 const observations=[5,6,7,8,9,10,11].map(i=>observeCastoramaBrowser(fresh(i),source(fixtures[i].sourceId))),service=createRemontService({initialObservations:observations,background:false}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const cases=[[5,2,97600],[6,110,77600],[7,110,119600],[8,11,3048],[9,26,5096],[10,2,41600],[11,2,83600]];
  for(const[i,quantity,total]of cases){const s=source(fixtures[i].sourceId),response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'quantity',materials:[{material:{id:s.id,name:s.name,ean:s.ean,unit:s.unit,category:s.category},quantity}]}],options:{store:'Castorama',delivery:{mode:'shipping',postalCode:'00-001'}}})});assert.equal(response.status,200);const data=await response.json();assert.equal(data.consolidated.lines[0].lineCostGrosze,total,s.id);assert.equal(data.consolidated.lines[0].packages[0].count,2);assert.equal(data.deliveryComparison.best,null);assert.equal(data.consolidated.lines[0].packages[0].verification.method,'browser');}
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});

test('real HTTP exposes manual verification on the purchase plan and never adds unquoted banner shipping',async()=>{
 const s=source(fixtures[1].sourceId),observation=observeCastoramaBrowser(fresh(1),s),service=createRemontService({initialObservations:[observation],background:false}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const root='http://127.0.0.1:'+(server.address() as {port:number}).port;
  const response=await fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'paint',materials:[{material:{id:'paint',name:s.name,unit:'l',category:'paint'},quantity:15}]}],options:{delivery:{mode:'shipping',postalCode:'00-001'}}})});assert.equal(response.status,200);const data=await response.json();
  assert.equal(data.consolidated.lines[0].lineCostGrosze,15996);assert.equal(data.consolidated.lines[0].packages[0].verification.method,'browser');assert.equal(data.stages[0].lines[0].offers[0].verification.expiresAt,observation.verification!.expiresAt);assert.equal(data.coverage.browserVerifiedOffers,1);assert.equal(data.deliveryComparison.best,null);assert.ok(data.deliveryComparison.unavailableStores.some((s:any)=>s.store==='Castorama'&&s.reason==='retailer_access_required'));
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});

test('failed automatic HTTP refresh and restart preserve the original browser date and deadline rather than relabelling it as automatic',async()=>{
 const s=source(fixtures[0].sourceId),observation=observeCastoramaBrowser(fresh(),s),directory=mkdtempSync(join(tmpdir(),'remont-browser-')),cachePath=join(directory,'cache.json');
 const service=createRemontService({initialObservations:[observation],cachePath,background:false,fetchImpl:async()=>new Response('access unavailable',{status:503})});
 try{
  await service.refresh();const row=service.status().sources.find(r=>r.id===s.id)!;assert.equal(row.checkedAt,observation.observedAt);assert.deepEqual(row.verification,observation.verification);assert.equal(row.active,true);assert.ok(row.error);
  const restored=createRemontService({initialObservations:[],cachePath,background:false});try{const state=restored.status().sources.find(r=>r.id===s.id)!;assert.equal(state.checkedAt,observation.observedAt);assert.deepEqual(state.verification,observation.verification);assert.equal(restored.status().browserVerifiedOffers,1);}finally{restored.close();}
 }finally{service.close();unlinkSync(cachePath);rmdirSync(directory);}
});

test('expired or tampered verifications cannot rank as current offers or reappear from bootstrap cache',()=>{
 const s=source(fixtures[0].sourceId),observation=observeCastoramaBrowser(fresh(),s),checkedAt=new Date(Date.now()-86400001).toISOString(),expiresAt=new Date(Date.parse(checkedAt)+86400000).toISOString();
 const expired={...observation,observedAt:checkedAt,verification:{method:'browser' as const,checkedAt,expiresAt}};
 for(const row of [expired,{...observation,verification:{...observation.verification!,expiresAt:new Date(Date.now()+7*86400000).toISOString()}},{...observation,stockPackages:70}]){const service=createRemontService({initialObservations:[row],background:false});try{assert.equal(service.status().offers,0);}finally{service.close();}}
 assert.equal(isComparableOffer({source:'retailer-page-browser-snapshot',availability:'in_stock',price:'54.98',fetchedAt:new Date(checkedAt),verification:expired.verification} as any),false);
});

test('a successful later HTTP read replaces the browser snapshot and removes its manual provenance',async()=>{
 const snapshot={...fresh(),capturedAt:new Date(Date.now()-60000).toISOString()},s=source(fixtures[0].sourceId),observation=observeCastoramaBrowser(snapshot,s);
 const service=createRemontService({initialObservations:[observation],background:false,fetchImpl:async input=>new Response(String(input)===s.url?'<script type="application/ld+json">'+snapshot.schemas[0]+'</script>':'unavailable',{status:String(input)===s.url?200:503,headers:{'content-type':'text/html'}})});
 try{await service.refresh();const state=service.status(),row=state.sources.find(r=>r.id===s.id)!;assert.equal(state.browserVerifiedOffers,0);assert.equal(row.verification,undefined);assert.equal(row.error,null);assert.ok(Date.parse(row.checkedAt!)>Date.parse(observation.observedAt));assert.equal(row.active,true);}finally{service.close();}
});
