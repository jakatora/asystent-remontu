import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {observeCastoramaBrowser,type BrowserProductSnapshot} from '../src/lib/castorama-browser-observation';
import {observeBricomarcheBrowser,BRICO_POZNAN} from '../src/lib/bricomarche-browser-observation';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRemontService} from '../src/shared-backend';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import {pickupLocationsFor,pickupAddressMapUrl,approximateDistanceKm} from '../../mobile/features/pricing/pickupLocations';
import fixtureData from './fixtures/budmat-browser.json' with {type:'json'};

const fixtures=fixtureData.fixtures as {sourceId:string;snapshot:BrowserProductSnapshot}[];
const source=(i:number)=>RETAIL_SOURCES.find(s=>s.id===fixtures[i].sourceId)!;
const fresh=(i:number)=>({...structuredClone(fixtures[i].snapshot),capturedAt:new Date().toISOString()});
const observation=(i:number)=>i===0?observeCastoramaBrowser(fresh(i),source(i)):observeBricomarcheBrowser(fresh(i),source(i));

test('native whole-piece prices share the exact Budmat barcode but retain online and named-branch purchase channels',()=>{
 assert.equal(observation(0).priceGrosze,598);assert.equal(observation(1).priceGrosze,999);
 for(const i of [0,1]){assert.equal(observation(i).ean,'5907738940163');assert.equal(source(i).packageSize,3);assert.equal(source(i).unit,'mb');assert.equal(observation(i).stockPackages,undefined);assert.equal(observation(i).verification!.method,'browser');}
 assert.equal(source(1).pickupOnly,true);assert.equal(source(1).store,BRICO_POZNAN);
});

test('a metre-labelled three-metre piece needs the actual length and single-piece table, never a 3mm, 4m or wholesale bundle substitution',()=>{
 for(const change of [(s:BrowserProductSnapshot)=>{s.tables![0].find(r=>r[0]==='Długość produktu')![1]='4000mm'},(s:BrowserProductSnapshot)=>{s.tables![0].find(r=>r[0]==='Liczba sztuk w opakowaniu')![1]='192'},(s:BrowserProductSnapshot)=>{delete s.tables}]){const snapshot=fresh(0);change(snapshot);assert.throws(()=>observeCastoramaBrowser(snapshot,source(0)),/browser_package_not_confirmed/);}
 assert.throws(()=>observeCastoramaBrowser(fresh(0),{...source(0),packageSize:4}),/browser_package_not_confirmed/);
 assert.throws(()=>observeCastoramaBrowser({...fresh(0),axState:fresh(0).axState.replace('5 , 98 zł','1 , 99 zł')},source(0)),/browser_gross_price_mismatch/);
});

test('a local observation requires the selected branch, its available stock label, exact barcode, length, thickness and active purchase action',()=>{
 for(const transform of [
  (s:string)=>s.replace('Mój sklep: '+BRICO_POZNAN,'Mój sklep: Bricomarché Warszawa'),
  (s:string)=>s.replace(/text Dostępny$/m,'text Niedostępny'),
  (s:string)=>s.replace('text Grubość 0,5 mm','text Grubość 0,6 mm'),
  (s:string)=>s.replace('text Długość 3000 mm','text Długość 4000 mm'),
  (s:string)=>s.replace('text EAN 5907738940163','text EAN 5907738940156'),
  (s:string)=>s.replace(/button ([^\n]*Dodaj do koszyka)/g,'button (disabled) $1'),
 ])assert.throws(()=>observeBricomarcheBrowser({...fresh(1),axState:transform(fresh(1).axState)},source(1)));
 assert.throws(()=>observeBricomarcheBrowser(fresh(1),{...source(1),store:'Bricomarché'}));assert.throws(()=>observeBricomarcheBrowser(fresh(1),{...source(1),pickupOnly:false}));
});

test('local manual provenance cannot expire, be removed or be extended through bootstrap cache',()=>{
 const original=observation(1),checkedAt=new Date(Date.now()-86400001).toISOString();
 for(const row of [{...original,verification:undefined},{...original,stockPackages:100},{...original,observedAt:checkedAt,verification:{method:'browser' as const,checkedAt,expiresAt:new Date(Date.parse(checkedAt)+86400000).toISOString()}},{...original,verification:{...original.verification!,expiresAt:new Date(Date.now()+7*86400000).toISOString()}}]){const service=createRemontService({initialObservations:[row],background:false});try{assert.equal(service.status().offers,0);}finally{service.close();}}
});

test('real HTTP excludes a branch price from home delivery while consolidating selected local collection into whole three-metre pieces',async()=>{
 const service=createRemontService({initialObservations:[observation(0),observation(1)],background:false}),api=express();api.use(express.json());api.use(service.router);const server=api.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const material=(quantity:number)=>({material:{id:'budmat',name:'Profil przyścienny Budmat UD27 0,5 mm 3 m',category:'profile',unit:'mb'},quantity});
 const request=async(mode:'shipping'|'pickup',store?:string,quantities=[11])=>{const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:quantities.map((q,i)=>({jobId:'room-'+i,materials:[material(q)]})),options:{...(store?{store}:{}),delivery:{mode,postalCode:'00-001'}}})});assert.equal(response.status,200);return response.json();};
 try{
  const shipping=await request('shipping');assert.equal(shipping.consolidated.consolidatedTotalGrosze,2392);assert.equal(shipping.consolidated.lines[0].packages[0].count,4);assert.ok(shipping.stages[0].lines[0].offers.every((o:any)=>o.store==='Castorama'));assert.ok(shipping.coverage.pickupOnlyStores.includes(BRICO_POZNAN));
  const local=await request('pickup',BRICO_POZNAN);assert.equal(local.deliveryComparison.best.totalGrosze,3996);assert.equal(local.consolidated.lines[0].packages[0].count,4);assert.equal(local.consolidated.lines[0].packages[0].store,BRICO_POZNAN);
  const localShipping=await request('shipping',BRICO_POZNAN);assert.equal(localShipping.stages[0].lines[0].resolved,false);assert.equal(localShipping.deliveryComparison.best,null);
  const consolidated=await request('pickup',BRICO_POZNAN,[1.4,1.4]);assert.equal(consolidated.consolidated.lines[0].packages[0].count,1);assert.equal(consolidated.deliveryComparison.best.totalGrosze,999);assert.equal(consolidated.consolidated.savingsGrosze,999);
 }finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});

test('the local collection address and map bind native branch evidence and do not import reversed JSON-LD geo fields',()=>{
 const branch=fixtureData.branch,location=pickupLocationsFor(BRICO_POZNAN)[0];assert.equal(location.street,branch.address.streetAddress);assert.equal(location.postalCode,branch.address.postalCode);assert.equal(location.phone,'+48'+branch.telephone);
 const longitude=Number(branch.hasMap.match(/!2d([\d.]+)/)![1]),latitude=Number(branch.hasMap.match(/!3d([\d.]+)/)![1]);assert.deepEqual(location.mapCentre,{latitude,longitude});assert.ok(latitude>49&&longitude<25);assert.notEqual(Number(branch.geo.latitude),latitude);
 const hex=branch.hasMap.match(/0x0%3A0x([a-f0-9]+)/)![1],map=new URL(pickupAddressMapUrl(location.id)!);assert.equal(map.searchParams.get('cid'),BigInt('0x'+hex).toString());assert.equal(approximateDistanceKm({postalCode:'61-696',name:'Poznań',latitude,longitude},location),0);
});

test('a generic HTTP response cannot refresh a price for an unconfirmed browser branch',async()=>{
 const snapshot=fresh(1);await assert.rejects(readRetailSource(source(1),async()=>new Response('<script type="application/ld+json">'+snapshot.schemas[0]+'</script>',{headers:{'content-type':'text/html'}})),/browser_location_review_required/);
 const original=observation(1),service=createRemontService({initialObservations:[original],background:false,fetchImpl:async()=>new Response('unavailable',{status:503})});try{await service.refresh();const row=service.status().sources.find(s=>s.id===source(1).id)!;assert.equal(row.checkedAt,original.observedAt);assert.deepEqual(row.verification,original.verification);assert.equal(row.active,true);}finally{service.close();}
});

test('the individual branch transport tariff cannot be replaced with national free delivery',async()=>{
 let calls=0;const quoter=createRetailerQuoter(async()=>{calls++;throw Error('Unexpected request')});assert.deepEqual(await quoter({store:BRICO_POZNAN,materialsGrosze:999,lines:[]} as any,'00-001'),{reason:'retailer_transport_quote_required'});assert.equal(calls,0);
});
