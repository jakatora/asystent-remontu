import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {catalogueRefreshIdentity,CatalogAvailabilityCache} from './catalogAvailability';
import {refreshCatalogProduct,fetchCatalogAvailability,ApiError} from './pricingApi';
const ref=(id:string)=>MATERIAL_PRICES.find(r=>r.id===id)!;
const snap=(store:string)=>({version:1,complete:true,channel:'online',currency:'PLN',deliveryIncluded:false,generatedAt:'2026-11-01T21:00:00Z',maxAgeMs:30000,products:[{ean:'5901095517976',category:'pipe',packageSize:1,unit:'mb',stores:[store],lastCheckedAt:'2026-11-01T21:00:00Z'}]});
test('catalogue refresh preserves the exact EAN, pack and legacy wall-tile category',()=>{
  assert.deepEqual(catalogueRefreshIdentity(ref('mat-pex-pipe-tycner-16x2')),{ean:'5901095517976',category:'pipe',packageSize:1,unit:'mb'});assert.equal(catalogueRefreshIdentity(ref('mat-tile-wall-paradyz-nati-bianco-25x40'))?.category,'wall-tile');
});
test('all four merchant-only catalogue variants refresh by their own reviewed ID without inventing a GTIN',()=>{
  for(const[id,productId]of [['mat-roll-orion514-ewinyl-2m','remont-sku-ewinyl-5329-2m'],['mat-roll-orion514-ewinyl-4m','remont-sku-ewinyl-5329-4m'],['mat-profile-cd60-irbud-3m','remont-sku-irbud-10911'],['mat-edge-tape-packcenter-tb-fb00202-50m','remont-sku-sewera-465325']]){const r=ref(id),identity=catalogueRefreshIdentity(r);assert.equal(identity?.productId,productId);assert.equal(identity?.ean,undefined);assert.equal(catalogueRefreshIdentity({...r,sourceUrl:r.sourceUrl+'?other=1'}),null);assert.equal(catalogueRefreshIdentity({...r,productLabel:r.productLabel+' other'}),null);}
});
test('a pre-refresh GET cannot overwrite or return an older catalogue after explicit invalidation',async()=>{
  let calls=0,finish!:(x:unknown)=>void;const old=new Promise(r=>finish=r),cache=new CatalogAvailabilityCache(async()=>++calls===1?old:snap('Current'),()=>0),pending=cache.read();cache.invalidate();const fresh=await cache.read();finish(snap('Old'));assert.equal(fresh.snapshot.products[0].stores[0],'Current');assert.equal((await pending).snapshot.products[0].stores[0],'Current');assert.equal((await cache.read()).snapshot.products[0].stores[0],'Current');assert.equal(calls,2);
});
test('explicit catalogue POST sends only the chosen physical identity and rejects a mismatched response',async()=>{
  const previous=globalThis.fetch,identity=catalogueRefreshIdentity(ref('mat-pex-pipe-tycner-16x2'))!;let calls=0,mismatch=false;
  globalThis.fetch=async(input,init)=>{calls++;assert.match(String(input),/\/pricing\/catalog-availability\/refresh$/);assert.equal(init?.method,'POST');assert.deepEqual(JSON.parse(String(init?.body)),identity);assert.ok(init?.signal);return Response.json({version:1,identity:mismatch?{...identity,packageSize:200}:{unit:identity.unit,packageSize:identity.packageSize,category:identity.category,ean:identity.ean},refresh:{status:'updated',checkedAt:'2026-11-01T21:00:00Z',confirmedOfferIds:['plusmarket-pex-pipe-16x2'],failedOfferIds:[],retryAfterSeconds:60},availability:snap('Plus-Market')});};
  try{assert.equal((await refreshCatalogProduct(identity)).refresh.confirmedOfferIds.length,1);mismatch=true;await assert.rejects(refreshCatalogProduct(identity),/catalog_refresh_identity_mismatch/);assert.equal(calls,2);await assert.rejects(refreshCatalogProduct({...identity,url:'https://other.example'}as any));assert.equal(calls,2);}finally{globalThis.fetch=previous;}
});
test('catalogue product POST observes the shared Retry-After and never automatically retries',async()=>{
  const previous=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return new Response('{}',{status:429,headers:{'retry-after':'90'}});};
  try{await assert.rejects(refreshCatalogProduct(catalogueRefreshIdentity(ref('mat-pex-pipe-tycner-16x2'))!),e=>e instanceof ApiError&&e.status===429);await assert.rejects(fetchCatalogAvailability(),e=>e instanceof ApiError&&e.status===429);assert.equal(calls,1);}finally{globalThis.fetch=previous;}
});
