import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reviewedJobProduct,jobProductKey} from './jobProduct';
import {JobProductPriceCache} from './jobProductPriceCache';
import {finishingMaterials} from '@/features/calculator/wallFinishing';
import {substratePrimerMaterial} from '@/features/calculator/substratePrimer';
import {SHARED_SHOP_PRICES} from '@/data/prices/shared-shop-prices';
import type {CatalogProductRefresh,CatalogRefreshIdentity} from '../../../../lib/pricing-service/src/catalog-refresh';

const identity:CatalogRefreshIdentity={ean:'5903973104414',category:'filler',packageSize:5,unit:'kg'};
const result=(id:CatalogRefreshIdentity=identity):CatalogProductRefresh=>({version:1,identity:id,refresh:{status:'updated',checkedAt:null,confirmedOfferIds:[],failedOfferIds:[],retryAfterSeconds:60},availability:{version:1,complete:true,channel:'online',currency:'PLN',deliveryIncluded:false,generatedAt:'2026-11-02T18:00:00Z',maxAgeMs:30000,products:[]},offers:[]});
const tick=()=>new Promise<void>(r=>setImmediate(r));

test('job cost requests bind all five actual wall-repair models to their physical pack, not a local label',()=>{
  const items=[...finishingMaterials('wall-repair'),substratePrimerMaterial('wall-repair')];
  assert.equal(items.length,5);
  for(const item of items){const product=reviewedJobProduct(item,'material');assert(product,item.name);assert.equal(product.identity.ean,item.ean);assert.equal(product.identity.packageSize,item.packaging!.size);assert.equal(product.identity.unit,item.unit);}
  assert.equal(reviewedJobProduct({name:items[0].name},'material'),null);
  assert.equal(reviewedJobProduct({...items[0],packaging:undefined},'material'),null);
  assert.equal(reviewedJobProduct({...items[0],ean:'unknown'},'material'),null);
  assert.notEqual(jobProductKey(identity),jobProductKey({...identity,packageSize:20}));
});

test('generic brush links select a clearly named example, not four supposedly identical merchant models',()=>{
  const example=reviewedJobProduct({name:'Pędzelek do gruntowania',shopPrices:SHARED_SHOP_PRICES.brush50mm},'tool');
  assert(example?.example);assert.equal(example.identity.ean,'5904178020035');assert.equal(example.identity.packageSize,1);assert(example.name.includes('Kraus A50'));
  assert.equal(reviewedJobProduct({name:'Pędzelek do gruntowania'},'tool'),null);
  assert.equal(reviewedJobProduct({name:'Pędzelek do gruntowania',shopPrices:SHARED_SHOP_PRICES.roller18cm},'tool'),null);
});

test('the painting roller example excludes the primer and long-pile facade rollers',()=>{
  const roller={id:'roller',name:'Wałek malarski 18–22 cm',shopPrices:SHARED_SHOP_PRICES.roller18cm};
  assert.equal(reviewedJobProduct(roller,'tool')?.identity.ean,'5905061052744');
  assert.equal(reviewedJobProduct({...roller,name:'Wałek malarski'},'tool'),null);
  assert.equal(reviewedJobProduct({...roller,id:'paint-roller-bso'},'tool'),null);
});

test('duplicate cards and forced clicks share one pending read; completed prices expire rather than persist',async()=>{
  let now=0,calls=0,release!:()=>void;const gate=new Promise<void>(r=>release=r);
  const cache=new JobProductPriceCache(async id=>{calls++;await gate;return result(id);},()=>now);
  const a=cache.read(identity),b=cache.read({...identity}),c=cache.read(identity,true);assert.equal(a,b);assert.equal(a,c);await tick();assert.equal(calls,1);release();await a;
  await cache.read(identity);assert.equal(calls,1);now=60000;await cache.read(identity);assert.equal(calls,2);
});

test('only two real reads run together and a failed merchant releases the queue without supplying old prices',async()=>{
  let active=0,max=0,calls=0;const releases:Array<()=>void>=[];
  const cache=new JobProductPriceCache(async id=>{active++;max=Math.max(max,active);const call=++calls;await new Promise<void>(r=>releases.push(r));active--;if(call===1)throw Error('offline');return result(id);});
  const pending=[0,1,2,3].map(n=>cache.read({...identity,packageSize:5+n}).then(()=>true,()=>false));
  await tick();assert.equal(calls,2);releases.splice(0).forEach(r=>r());await tick();assert.equal(calls,4);releases.splice(0).forEach(r=>r());assert.deepEqual(await Promise.all(pending),[false,true,true,true]);assert.equal(max,2);
});

test('a response for another pack is rejected and short failure backoff prevents remount storms',async()=>{
  let now=0,calls=0;const cache=new JobProductPriceCache(async()=>{calls++;return result({...identity,packageSize:20});},()=>now);
  await assert.rejects(cache.read(identity),/identity_mismatch/);await assert.rejects(cache.read(identity),/identity_mismatch/);assert.equal(calls,1);
  now=15000;await assert.rejects(cache.read(identity),/identity_mismatch/);assert.equal(calls,2);
});
