import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {observeCastoramaBrowser,isCastoramaBrowserSource,type BrowserProductSnapshot} from '../src/lib/castorama-browser-observation';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {parseRetailPage,readRetailSource} from '../src/lib/retail-pages';
import {createRemontService} from '../src/shared-backend';
import {createRetailerQuoter,retailerDeliveryCapabilities} from '../src/lib/retailer-delivery';
import {storeMapSearchUrl,storeLocatorUrl} from '../../mobile/features/pricing/storeChoice';
import fixtureData from './fixtures/castorama-marketplace.json' with {type:'json'};
import packageData from './fixtures/castorama-browser-packages.json' with {type:'json'};

const fixture=fixtureData as {sourceId:string;snapshot:BrowserProductSnapshot};
const source=RETAIL_SOURCES.find(s=>s.id===fixture.sourceId)!;
const fresh=()=>({...structuredClone(fixture.snapshot),capturedAt:new Date().toISOString()});
function product(snapshot:BrowserProductSnapshot,change:(p:any)=>void){const next=structuredClone(snapshot),p=JSON.parse(next.schemas[0]);change(p);next.schemas[0]=JSON.stringify(p);return next;}

test('the native Corksystem offer buys one 6m² package from seller2601, separate from the Castorama merchant and pickup network',()=>{
 const observation=observeCastoramaBrowser(fresh(),source);assert.equal(observation.priceGrosze,7399);assert.equal(observation.ean,'5061092900925');assert.equal(observation.stockPackages,undefined);assert.equal(source.store,'Corksystem (Castorama)');assert.equal(source.packageSize,6);assert.equal(source.pickupUnavailable,true);assert.equal(storeMapSearchUrl(source.store,'00-001'),null);assert.equal(storeLocatorUrl(source.store),null);
 assert.ok(retailerDeliveryCapabilities().accessRequiredStores.includes(source.store));assert.ok(!retailerDeliveryCapabilities().automaticStores.includes(source.store));
});

test('merchant identity requires its exact reviewed config, native seller and public seller link, not the marketplace logo',()=>{
 for(const s of [{...source,store:'Castorama'},{...source,marketplaceSeller:{name:'Castorama Polska',id:2601}},{...source,marketplaceSeller:{name:'Corksystem',id:2602}},{...source,pickupUnavailable:false},{...source,ean:'5061092901632'}]){assert.equal(isCastoramaBrowserSource(s),false);assert.throws(()=>observeCastoramaBrowser(fresh(),s));}
 for(const broken of [product(fresh(),p=>{delete p.offers[2].seller}),product(fresh(),p=>p.offers[2].seller.name='Other Merchant'),{...fresh(),axState:fresh().axState.replace('/seller/2601','/seller/2602')}])assert.throws(()=>observeCastoramaBrowser(broken,source),/browser_seller_not_confirmed/);
 const wrong=product(fresh(),p=>p.offers[2].seller.name='Other Merchant');assert.throws(()=>parseRetailPage('<script type="application/ld+json">'+wrong.schemas[0]+'</script>',source,new Date()),/retailer_seller_not_confirmed/);
});

test('the sealed six-square-metre pack cannot become an advertised m², a ten-pack bundle or an unsupported pickup offer',()=>{
 const snapshot=fresh();assert.throws(()=>observeCastoramaBrowser({...snapshot,axState:snapshot.axState.replace('73 , 99 zł','12 , 33 zł')},source),/browser_gross_price_mismatch/);
 const box=structuredClone(snapshot);box.tables![0].find(r=>r[0]==='Liczba sztuk w opakowaniu')![1]='10';assert.throws(()=>observeCastoramaBrowser(box,source),/browser_package_not_confirmed/);
 assert.throws(()=>observeCastoramaBrowser(product(snapshot,p=>p.offers[0].availability='https://schema.org/InStock'),source),/browser_seller_not_confirmed/);
 assert.throws(()=>observeCastoramaBrowser({...snapshot,axState:snapshot.axState.replace('text Produkt dostępny wyłącznie w sprzedaży internetowej.','')},source),/browser_seller_not_confirmed/);
 assert.throws(()=>observeCastoramaBrowser({...snapshot,axState:snapshot.axState.replace('button Dodaj 1 przedmiot','button (disabled) Dodaj 1 przedmiot')},source),/browser_purchase_not_confirmed/);
});

test('expired or stripped manual metadata cannot reintroduce a marketplace observation through bootstrap cache',()=>{
 const observation=observeCastoramaBrowser(fresh(),source),checkedAt=new Date(Date.now()-86400001).toISOString(),expired={...observation,observedAt:checkedAt,verification:{method:'browser' as const,checkedAt,expiresAt:new Date(Date.parse(checkedAt)+86400000).toISOString()}},stripped={...observation,verification:undefined};
 for(const row of [expired,stripped,{...observation,stockPackages:100}]){const service=createRemontService({initialObservations:[row],background:false});try{assert.equal(service.status().offers,0);}finally{service.close();}}
});

test('real HTTP keeps platform and merchant baskets separate, prices whole packs and refuses self collection or unquoted shipping',async()=>{
 const arillaSource=RETAIL_SOURCES.find(s=>s.id===packageData[0].sourceId)!,arilla=observeCastoramaBrowser({...structuredClone(packageData[0].snapshot),capturedAt:new Date().toISOString()} as BrowserProductSnapshot,arillaSource),cork=observeCastoramaBrowser(fresh(),source),service=createRemontService({initialObservations:[arilla,cork],background:false}),api=express();api.use(express.json());api.use(service.router);const server=api.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const material=(s:typeof source,quantity:number)=>({material:{id:s.id,name:s.name,ean:s.ean,category:s.category,unit:s.unit},quantity});
 const request=async(store:string|undefined,mode:'shipping'|'pickup',both=false)=>{const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'floor',materials:[material(source,6.1),...(both?[material(arillaSource,2.6)]:[])]}],options:{...(store?{store}:{}),delivery:{mode,postalCode:'00-001'}}})});assert.equal(response.status,200);return response.json();};
 try{
  const shipping=await request(source.store,'shipping');assert.equal(shipping.consolidated.consolidatedTotalGrosze,14798);assert.equal(shipping.consolidated.lines[0].packages[0].count,2);assert.equal(shipping.consolidated.lines[0].packages[0].store,source.store);assert.equal(shipping.deliveryComparison.best,null);assert.ok(shipping.deliveryComparison.unavailableStores.some((s:any)=>s.store===source.store&&s.reason==='retailer_access_required'));assert.ok(shipping.coverage.pickupUnavailableStores.includes(source.store));
  const pickup=await request(source.store,'pickup');assert.equal(pickup.deliveryComparison.best,null);assert.equal(pickup.stages[0].lines[0].resolved,false);
  const mixed=await request(undefined,'shipping',true);assert.equal(mixed.consolidated.consolidatedTotalGrosze,41288);assert.deepEqual(mixed.storeComparison.stores.map((s:any)=>s.store).sort(),['Castorama',source.store].sort());assert.ok(mixed.storeComparison.stores.every((s:any)=>s.coveredCount===1&&s.missingCount===1));assert.equal(mixed.deliveryComparison.best,null);
  const parent=await request('Castorama','shipping',true);assert.equal(parent.stages[0].lines[0].resolved,false);assert.equal(parent.consolidated.consolidatedTotalGrosze,26490);
 }finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});

test('the platform free-shipping banner cannot supply the external merchant quote or invoke its unrelated checkout',async()=>{
 let calls=0;const quoter=createRetailerQuoter(async()=>{calls++;throw Error('Unexpected request')});const result=await quoter({store:source.store,materialsGrosze:7399,lines:[]} as any,'00-001');assert.deepEqual(result,{reason:'retailer_access_required'});assert.equal(calls,0);
 const snapshot=fresh();await assert.rejects(readRetailSource(source,async()=>new Response('<script type="application/ld+json">'+snapshot.schemas[0]+'</script>',{headers:{'content-type':'text/html'}})),/browser_package_review_required/);
});

test('failed automatic refresh preserves the original marketplace seller price, date and 24-hour deadline',async()=>{
 const observation=observeCastoramaBrowser(fresh(),source),service=createRemontService({initialObservations:[observation],background:false,fetchImpl:async()=>new Response('unavailable',{status:503})});
 try{await service.refresh();const row=service.status().sources.find(s=>s.id===source.id)!;assert.equal(row.active,true);assert.equal(row.checkedAt,observation.observedAt);assert.deepEqual(row.verification,observation.verification);assert.match(row.error!,/retailer_http_503/);}finally{service.close();}
});
