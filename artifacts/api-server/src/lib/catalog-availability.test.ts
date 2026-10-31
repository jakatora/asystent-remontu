import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../shared-backend';
import {RETAIL_SOURCES} from './retail-catalog';
import {catalogAvailability} from './catalog-availability';
import type {RetailObservation,RetailSource} from './retail-pages';
import type {PurchaseOffer} from '../../../../lib/pricing-service/src/types';
import {parseCatalogAvailabilitySnapshot} from '../../../../lib/pricing-service/src/catalog-availability';

const source=RETAIL_SOURCES.find(s=>s.id==='hipper-norgips-metal-paper-50x30')!;
const observation=(s=source,now=Date.now()):RetailObservation=>({sourceId:s.id,ean:s.ean,name:s.name,imageUrl:null,priceGrosze:9699,currency:'PLN',availability:'in_stock',observedAt:new Date(now).toISOString(),sourceUrl:s.url,evidenceSha256:'a'.repeat(64)});
const offer=(s=source,now=Date.now()):PurchaseOffer=>({id:s.id,productId:'remont-'+s.ean,store:s.store,price:'96.99',promoPrice:null,regularPrice:null,unit:s.unit,packageSize:String(s.packageSize),pricePerUnit:null,productUrl:s.url,availability:'in_stock',fetchedAt:new Date(now),source:'retailer-page-microdata'});

test('complete snapshot groups exact packs and unique shops, excluding pickup-only and rejected offers',()=>{
  const now=Date.now(),other={...source,id:'other-shop',store:'Other'},pickup={...source,id:'pickup-only',pickupOnly:true},zero={...source,id:'zero-stock'},sources=[source,other,pickup,zero],rows=new Map(sources.map(s=>[s.id,observation(s,now)])),offers=sources.map(s=>offer(s,now));
  offers[3].maxPackages=0;
  const result=parseCatalogAvailabilitySnapshot(catalogAvailability(sources,offers,rows,now));
  assert.equal(result.complete,true);assert.equal(result.maxAgeMs,30_000);assert.equal(result.products.length,1);assert.deepEqual(result.products[0].stores,['HIPPER','Other']);assert.equal(result.products[0].packageSize,30);
  assert.ok(!('price' in result.products[0]));assert.equal(result.deliveryIncluded,false);
});

test('snapshot lifetime never outlives a browser or seven-day price proof',()=>{
  const now=Date.now(),s=source,row=observation(s,now),o=offer(s,now),proof={method:'browser' as const,checkedAt:new Date(now-86_398_000).toISOString(),expiresAt:new Date(now+2000).toISOString()};
  o.verification=proof;o.fetchedAt=new Date(proof.checkedAt);row.observedAt=proof.checkedAt;row.verification=proof;
  assert.equal(catalogAvailability([s],[o],new Map([[s.id,row]]),now).maxAgeMs,2000);
  assert.equal(catalogAvailability([s],[o],new Map([[s.id,row]]),now+2000).products.length,0);
  delete o.verification;o.fetchedAt=new Date(now-7*86400000+1000);assert.equal(catalogAvailability([s],[o],new Map([[s.id,row]]),now).maxAgeMs,1000);
});

test('separate lengths stay separate, and an empty eligible set is a complete empty snapshot',()=>{
  const now=Date.now(),long={...source,id:'different-length',packageSize:90},rows=new Map([[source.id,observation(source,now)],[long.id,observation(long,now)]]);
  assert.deepEqual(catalogAvailability([source,long],[offer(source,now),offer(long,now)],rows,now).products.map(p=>p.packageSize),[30,90]);
  const empty=catalogAvailability([source],[],rows,now);assert.equal(empty.complete,true);assert.deepEqual(empty.products,[]);
});

test('reviewed merchant-only SKUs remain distinct even when roll widths share a page and pricing unit',()=>{
  const now=Date.now(),sources=['ewinyl-orion514-2m','ewinyl-orion514-4m','irbud-norgips-cd60-06-3m','sewera-packcenter-edge-tape-50m'].map(id=>RETAIL_SOURCES.find(s=>s.id===id)!);
  const rows=new Map(sources.map(s=>[s.id,observation(s,now)]));
  const result=parseCatalogAvailabilitySnapshot(catalogAvailability(sources,sources.map(s=>offer(s,now)),rows,now));
  assert.equal(result.products.length,4);assert.ok(result.products.every(p=>p.ean===null));
  assert.deepEqual(result.products.slice(0,2).map(p=>p.merchantIdentity?.productId),['remont-sku-ewinyl-5329-2m','remont-sku-ewinyl-5329-4m']);
  assert.notEqual(result.products[0].merchantIdentity!.name,result.products[1].merchantIdentity!.name);
  assert.equal(result.products[0].merchantIdentity!.url,result.products[1].merchantIdentity!.url);
  assert.equal(catalogAvailability(sources,sources.slice(0,1).map(s=>offer(s,now)),rows,now).products.length,1);
});

test('real HTTP catalogue read uses admitted current offers, no merchant requests, no prices or delivery promises',async()=>{
  let requests=0;const current=observation(),expiredSource=RETAIL_SOURCES.find(s=>s.id==='hipper-norgips-mesh-45x153')!,expired={...observation(expiredSource),validUntil:new Date(Date.now()-1000).toISOString()};
  const service=createRemontService({initialObservations:[current,expired],background:false,fetchImpl:async()=>{requests++;throw Error('Catalogue hints must not fetch merchants');}}),app=express();app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  try{const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/catalog-availability');assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');const result=parseCatalogAvailabilitySnapshot(await response.json());assert.equal(result.products.length,1);assert.equal(result.products[0].ean,source.ean);assert.equal(result.products[0].packageSize,30);assert.equal(requests,0);}finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
});
