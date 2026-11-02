import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from '../../test/fixtures/decowant-hydroband.json' with {type:'json'};
import {DECOWANT_SOURCES,confirmDecowantSource,confirmDecowantPurchase} from './decowant-supplies';
import {readRetailSource} from './retail-pages';
import {createRetailerQuoter,retailerDeliveryCapabilities} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

const source=(id:string)=>DECOWANT_SOURCES.find(s=>s.id===id)!;
function replay(basket:typeof fixture.baskets[number],change?:(v:any)=>void){
 let index=0;
 const fetcher:typeof fetch=async(input,init)=>{const u=new URL(String(input)),r=basket.records[index++];assert.ok(r);assert.equal(u.origin,r.origin);assert.equal(u.pathname+u.search,r.path);assert.equal(init?.method??'GET',r.method);assert.deepEqual(init?.body?JSON.parse(String(init.body)):null,r.body);const response=structuredClone(r.response);change?.(response);return Response.json(response,{status:r.status});};
 return{fetcher,done:()=>assert.equal(index,basket.records.length)};
}

test('Decowant actual retail units price one roll, individual corners and sealed Woder buckets',async()=>{
 for(const [index,row]of fixture.products.entries()){
  const s=source(row.sourceId);confirmDecowantPurchase(row.product,s);
  const observed=await readRetailSource(s,async input=>{assert.equal(String(input),'https://www.sklepdecowant.pl/webapi/front/pl_PL/products/PLN/'+s.productId);return Response.json(row.product);});
  assert.equal(observed.priceGrosze,[11999,1287,1218,11999,32987][index]);assert.equal(observed.ean,s.ean);assert.equal(observed.availability,'in_stock');assert.equal((observed as any).previousPriceGrosze,undefined);
 }
 assert(retailerDeliveryCapabilities().automaticStores.includes('Decowant'));
});

test('changed pack size, GTIN, URL or purchase lot fails before contacting Decowant',async()=>{
 for(const s of DECOWANT_SOURCES)for(const patch of [{ean:'5905400601459'},{packageSize:50},{unit:'l'},{store:'Other'},{brand:'Mapei'},{purchaseMultiple:10},{minimumPackages:10},{url:s.url+'?other=1'}]){
  assert.throws(()=>confirmDecowantSource({...s,...patch}),/package_not_confirmed/);
  await assert.rejects(readRetailSource({...s,...patch},async()=>{assert.fail('Changed reviewed source must not fetch');}),/package_not_confirmed/);
 }
});

test('changed native Decowant identity or unit cannot become a purchasable offer',()=>{
 for(const row of fixture.products)for(const change of [(v:any)=>v.ean='5905400601442',(v:any)=>v.name+=' inne',(v:any)=>v.producer.id++,(v:any)=>v.unit.name='opak.',(v:any)=>v.unit.floating_point=true,(v:any)=>v.package='10',(v:any)=>v.code='other',(v:any)=>v.id++,(v:any)=>v.url+='?other=1']){
  const item=structuredClone(row.product);change(item);assert.throws(()=>confirmDecowantPurchase(item,source(row.sourceId)),/package_not_confirmed/);
 }
});

test('production quoter replays three actual Decowant baskets as a national Polish courier quote',async()=>{
 for(const basket of fixture.baskets){const r=replay(basket),result=await createRetailerQuoter(r.fetcher)(basket.order as unknown as DeliveredStoreBasket,basket.postcode);r.done();assert.ok('quote' in result);assert.equal(result.quote.costGrosze,basket.expectedCostGrosze);assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.postalCode,undefined);assert(Date.parse(result.quote.expiresAt)>Date.now());}
});

test('unconfirmed count, price, country or courier leaves Decowant delivery unknown',async()=>{
 const basket=fixture.baskets[1];
 for(const change of [(v:any)=>{if(v.products?.length)v.products[0].quantity++;},(v:any)=>{if(v.products?.length)v.products[0].price_float++;},(v:any)=>{if(v.countries)v.countries=[];},(v:any)=>{if(v.shippings)v.shippings=[];}]){
  const result=await createRetailerQuoter(replay(basket,change).fetcher)(basket.order as unknown as DeliveredStoreBasket,'30-001');assert.ok('reason' in result);assert.equal('quote' in result,false);
 }
});
