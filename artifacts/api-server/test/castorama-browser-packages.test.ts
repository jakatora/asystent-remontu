import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {observeCastoramaBrowser,type BrowserProductSnapshot} from '../src/lib/castorama-browser-observation';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRemontService} from '../src/shared-backend';
import fixtureData from './fixtures/castorama-browser-packages.json' with {type:'json'};

// Primary DOM/AX evidence captured on 2026-10-26; fixtures retain the actual
// whole-pack price and primary technical rows, without marketing descriptions.
const fixtures=fixtureData as {sourceId:string;snapshot:BrowserProductSnapshot}[];
const source=(i:number)=>RETAIL_SOURCES.find(s=>s.id===fixtures[i].sourceId)!;
const fresh=(i=0)=>({...structuredClone(fixtures[i].snapshot),capturedAt:new Date().toISOString()});
function product(snapshot:BrowserProductSnapshot,change:(p:any)=>void){const next=structuredClone(snapshot),p=JSON.parse(next.schemas[0]);change(p);next.schemas[0]=JSON.stringify(p);return next;}

test('four native cards bind physical packs, fifty linear metres and a whole 216cm sill to their actual gross purchase prices',()=>{
 for(const[i,price]of [13245,6497,3548,17800].entries()){
  const observation=observeCastoramaBrowser(fresh(i),source(i));assert.equal(observation.priceGrosze,price);assert.equal(observation.stockPackages,undefined);assert.equal(observation.verification!.method,'browser');
 }
});

test('a per-m² advert cannot replace the separately published whole-box price, including fractional grosz rounding',()=>{
 for(const[i,unitPrice]of [[0,'52.98'],[1,'49.98']])assert.throws(()=>observeCastoramaBrowser(product(fresh(i),p=>p.offers[2].price=unitPrice),source(i)),/browser_gross_price_mismatch/);
 assert.throws(()=>observeCastoramaBrowser({...fresh(0),axState:fresh(0).axState.replace('132,45','52,98')},source(0)),/browser_gross_price_mismatch/);
 assert.throws(()=>observeCastoramaBrowser({...fresh(1),axState:fresh(1).axState.replace(/64,97\s*zł\s*\/ opak\./,'')},source(1)),/browser_purchase_unit_not_confirmed/);
});

test('box coverage, piece count, barcode and brand need one unambiguous primary table corroborated by the visible AX table',()=>{
 for(const alter of [
  (s:BrowserProductSnapshot)=>{delete s.tables},
  (s:BrowserProductSnapshot)=>{s.tables![0].find(r=>r[0]==='Pokrycie')![1]='2.6m²'},
  (s:BrowserProductSnapshot)=>{s.tables![0].find(r=>r[0]==='Liczba sztuk w opakowaniu')![1]='0'},
  (s:BrowserProductSnapshot)=>{s.tables![0].find(r=>r[0]==='Marka')![1]='Other'},
  (s:BrowserProductSnapshot)=>{s.tables![0].find(r=>r[0]==='Kod produktu')![1]='5059340802435'},
  (s:BrowserProductSnapshot)=>{s.tables!.push(structuredClone(s.tables![0]))},
  (s:BrowserProductSnapshot)=>{s.axState=s.axState.replace('text 2.5m²','text 3m²')},
 ]){const s=fresh();alter(s);assert.throws(()=>observeCastoramaBrowser(s,source(0)),/browser_package_not_confirmed/);}
 assert.throws(()=>observeCastoramaBrowser(fresh(),{...source(0),packageSize:2.6}),/browser_package_not_confirmed/);
});

test('the 82.41 PLN per metre sill advert and the five-square-metre tape advert are never prices for a full physical purchase',()=>{
 assert.throws(()=>observeCastoramaBrowser(fresh(3),{...source(3),packageSize:1.8}),/browser_package_not_confirmed/);
 assert.throws(()=>observeCastoramaBrowser(fresh(3),{...source(3),category:'wire'}),/browser_package_not_confirmed/);
 assert.throws(()=>observeCastoramaBrowser(product(fresh(3),p=>p.offers[2].price='82.41'),source(3)),/browser_gross_price_mismatch/);
 assert.throws(()=>observeCastoramaBrowser(fresh(2),{...source(2),unit:'m2',packageSize:5}));
});

test('a marketplace merchant cannot be silently merged into the Castorama merchant basket',()=>{
 assert.throws(()=>observeCastoramaBrowser(product(fresh(),p=>p.offers[2].seller={name:'Another seller'}),source(0)),/browser_seller_not_confirmed/);
});

test('real HTTP consolidates fractional areas and lengths before rounding up complete physical purchases',async()=>{
 const observations=fixtures.map((_,i)=>observeCastoramaBrowser(fresh(i),source(i))),service=createRemontService({initialObservations:observations,background:false}),api=express();api.use(express.json());api.use(service.router);const server=api.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const material=(i:number,quantity:number)=>({material:{id:source(i).id,name:source(i).name,ean:source(i).ean,category:source(i).category,unit:source(i).unit},quantity});
 const request=async(mode:'shipping'|'pickup')=>{const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'room-a',materials:[material(0,1.3),material(1,1.31),material(2,51),material(3,2.17)]},{jobId:'room-b',materials:[material(0,1.3)]}],options:{store:'Castorama',delivery:{mode,postalCode:'00-001'}}})});assert.equal(response.status,200);return response.json();};
 try{
  const shipping=await request('shipping');assert.equal(shipping.consolidated.consolidatedTotalGrosze,82180);
  for(const line of shipping.consolidated.lines){assert.equal(line.packages.length,1);assert.equal(line.packages[0].count,2);assert.equal(line.packages[0].verification.method,'browser');assert.equal(line.packages[0].maxPackages,undefined);}
  assert.equal(shipping.deliveryComparison.best,null);assert.ok(shipping.deliveryComparison.unavailableStores.some((s:any)=>s.store==='Castorama'&&s.reason==='retailer_access_required'));
  const pickup=await request('pickup');assert.equal(pickup.deliveryComparison.best,null);assert.ok(pickup.stages.flatMap((s:any)=>s.lines).every((l:any)=>!l.resolved));
 }finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});

test('a bare HTTP JSON-LD price cannot turn a complex browser purchase unit into automatically verified pack pricing',async()=>{
 for(const i of [0,1,3]){
  const snapshot=fresh(i),html='<script type="application/ld+json">'+snapshot.schemas[0]+'</script>';
  await assert.rejects(readRetailSource(source(i),async()=>new Response(html,{headers:{'content-type':'text/html'}})),/browser_package_review_required/);
 }
});
