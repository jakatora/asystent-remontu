import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {CatalogAvailabilityCache,catalogueProductAvailability,filterCatalogueByAvailability,isCatalogAvailabilityFresh} from './catalogAvailability';
import {parseCatalogAvailabilitySnapshot,type CatalogAvailabilitySnapshot} from '../../../../lib/pricing-service/src/catalog-availability';
import {ApiError,estimateProject,fetchCatalogAvailability} from './pricingApi';

const ref=MATERIAL_PRICES.find(p=>p.id==='mat-gypsum-norgips-metal-paper-50x30')!;
const missing=MATERIAL_PRICES.find(p=>p.id==='mat-flush-box-elektroplast-pk60-10')!;
const snapshot=():CatalogAvailabilitySnapshot=>({version:1,complete:true,channel:'online',currency:'PLN',deliveryIncluded:false,generatedAt:'2026-10-31T16:00:00Z',maxAgeMs:30_000,products:[{ean:'5907651699940',category:ref.materialType,packageSize:30,unit:'m',stores:['HIPPER'],lastCheckedAt:'2026-10-31T15:59:00Z'}]});

test('incomplete snapshots and malformed identities, scopes, duplicates or lifetimes are rejected as unknown',()=>{
  assert.equal(parseCatalogAvailabilitySnapshot(snapshot()).products.length,1);
  for(const change of [{complete:false},{version:2},{channel:'pickup'},{currency:'EUR'},{deliveryIncluded:true},{maxAgeMs:30_001},{maxAgeMs:-1},{products:null}])assert.throws(()=>parseCatalogAvailabilitySnapshot({...snapshot(),...change}));
  for(const change of [{ean:'123'},{packageSize:0},{packageSize:Infinity},{stores:[]},{stores:['HIPPER','HIPPER']},{stores:[' bad']},{lastCheckedAt:'bad'},{lastCheckedAt:'2027-01-01'}])assert.throws(()=>parseCatalogAvailabilitySnapshot({...snapshot(),products:[{...snapshot().products[0],...change}]}));
  assert.throws(()=>parseCatalogAvailabilitySnapshot({...snapshot(),products:[snapshot().products[0],snapshot().products[0]]}));
});

test('exact EAN also requires category, physical unit and complete pack size; missing is not a substitute',()=>{
  const read={snapshot:snapshot(),expiresAt:30_000};
  assert.deepEqual(catalogueProductAvailability(ref,read,0),{confirmed:true,stores:['HIPPER']});
  for(const change of [{packageSize:1},{packageSize:90},{unit:'szt'},{category:'masking-tape'},{ean:'5907651699988'}])assert.equal(catalogueProductAvailability(ref,{...read,snapshot:{...snapshot(),products:[{...snapshot().products[0],...change}]}},0)?.confirmed,false);
  assert.equal(catalogueProductAvailability({...ref,packageUnit:'mb'},read,0)?.confirmed,true);
  assert.equal(catalogueProductAvailability(missing,read,0)?.confirmed,false);
  assert.equal(catalogueProductAvailability(ref,read,30_000),null);
});

test('unknown or expired information never hides catalogue items or mutates a selected reference',()=>{
  const found=[missing,ref],before=JSON.stringify(found),read={snapshot:snapshot(),expiresAt:30_000};
  assert.deepEqual(filterCatalogueByAvailability(found,read,true,0),[ref]);
  assert.equal(filterCatalogueByAvailability(found,read,false,0),found);
  assert.equal(filterCatalogueByAvailability(found,read,true,30_000),found);
  assert.equal(filterCatalogueByAvailability(found,null,true,0),found);
  assert.equal(JSON.stringify(found),before);
});

test('reviewed merchant identities preserve exact variant, page, category and unit without inventing a barcode',()=>{
  const narrow=MATERIAL_PRICES.find(r=>r.id==='mat-roll-orion514-ewinyl-2m')!,wide=MATERIAL_PRICES.find(r=>r.id==='mat-roll-orion514-ewinyl-4m')!;
  const read={expiresAt:30000,snapshot:{...snapshot(),products:[{ean:null,merchantIdentity:{productId:'remont-sku-ewinyl-5329-2m',name:narrow.productLabel,url:narrow.sourceUrl!},category:narrow.materialType,packageSize:1,unit:'m2',stores:['eWinyl'],lastCheckedAt:snapshot().generatedAt}]}};
  assert.equal(catalogueProductAvailability(narrow,read,0)?.confirmed,true);
  assert.equal(catalogueProductAvailability(wide,read,0)?.confirmed,false);
  for(const change of [{sourceUrl:narrow.sourceUrl+'?other=1'},{packageSize:2},{packageUnit:'mb'},{materialType:'underlay'}])assert.equal(catalogueProductAvailability({...narrow,...change},read,0)?.confirmed,false);
  const codeRef={...ref,sourceUrl:narrow.sourceUrl,productLabel:narrow.productLabel,packageSize:1,packageUnit:'m2',materialType:narrow.materialType};
  assert.equal(catalogueProductAvailability(codeRef,read,0)?.confirmed,false);
});

test('merchant snapshots require an exact reviewed identity and a credential-free HTTPS page',()=>{
  const base={...snapshot().products[0],ean:null};
  for(const merchantIdentity of [undefined,{productId:'fake',name:'Exact',url:'https://example.com/item'},{productId:'remont-sku-test',name:'Exact',url:'http://example.com/item'},{productId:'remont-sku-test',name:'Exact',url:'https://user:password@example.com/item'}])assert.throws(()=>parseCatalogAvailabilitySnapshot({...snapshot(),products:[{...base,merchantIdentity}]}));
});

test('cache deduplicates concurrent readers and counts response latency against the hint lifetime',async()=>{
  let now=0,calls=0,resolve!:(value:unknown)=>void;
  const cache=new CatalogAvailabilityCache(()=>{calls++;return new Promise(r=>{resolve=r;});},()=>now);
  const first=cache.read(),second=cache.read();assert.equal(first,second);assert.equal(calls,1);
  now=20_000;resolve(snapshot());const read=await first;assert.equal(read.expiresAt,30_000);assert.ok(isCatalogAvailabilityFresh(read,now));assert.equal(await cache.read(),read);assert.equal(calls,1);
  now=30_000;assert.equal(isCatalogAvailabilityFresh(read,now),false);const fresh=cache.read();assert.equal(calls,2);resolve(snapshot());assert.equal((await fresh).expiresAt,60_000);
});

test('a slow or failed refresh cannot preserve a confirmed badge; recovery is explicit',async()=>{
  let now=0,fail=false,slow=true,calls=0;
  const cache=new CatalogAvailabilityCache(async()=>{calls++;if(fail)throw Error('offline');if(slow)now+=31_000;return snapshot();},()=>now);
  const late=await cache.read();assert.equal(isCatalogAvailabilityFresh(late,now),false);
  fail=true;await assert.rejects(cache.read(true),/offline/);assert.equal(calls,2);
  fail=false;slow=false;const recovered=await cache.read(true);assert.equal(calls,3);assert.equal(isCatalogAvailabilityFresh(recovered,now),true);
});

test('catalogue GET shares Retry-After with basket POST and never retries automatically',async()=>{
  const previous=globalThis.fetch;let calls=0;
  globalThis.fetch=async(input,init)=>{calls++;assert.match(String(input),/\/pricing\/catalog-availability$/);assert.equal(init?.method,undefined);assert.ok(init?.signal);return new Response('{}',{status:429,headers:{'retry-after':'125'}});};
  try{await assert.rejects(fetchCatalogAvailability(),e=>e instanceof ApiError&&e.status===429);await assert.rejects(estimateProject([]),e=>e instanceof ApiError&&e.status===429);assert.equal(calls,1);}finally{globalThis.fetch=previous;}
});
