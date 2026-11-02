import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from '../../test/fixtures/atlas-woder-packs.json' with {type:'json'};
import {ATLAS_WODER_E_SOURCES,confirmAtlasWoderSource,confirmAtlasWoderPurchase} from './atlas-woder-packs';
import {readRetailSource} from './retail-pages';
import {createRetailerQuoter} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

const source=(id:string)=>ATLAS_WODER_E_SOURCES.find(s=>s.id===id)!;
function replay(basket:typeof fixture.baskets[number],change?:(v:any)=>void){
 let index=0;
 const fetcher:typeof fetch=async(input,init)=>{const u=new URL(String(input)),r=basket.records[index++];assert.ok(r);assert.equal(u.origin,r.origin);assert.equal(u.pathname+u.search,r.path);assert.equal(init?.method??'GET',r.method);assert.deepEqual(init?.body?JSON.parse(String(init.body)):null,r.body);const response=structuredClone(r.response);change?.(response);return Response.json(response,{status:r.status});};
 return{fetcher,done:()=>assert.equal(index,basket.records.length)};
}

test('actual Lobo responses price each whole Woder E bucket and keep logistical weight separate from contents',async()=>{
 for(const [index,row]of fixture.products.entries()){
  const s=source(row.sourceId);confirmAtlasWoderPurchase(row.product,s);
  const observed=await readRetailSource(s,async input=>{assert.equal(String(input),'https://lobo.pl/webapi/front/pl_PL/products/PLN/'+s.productId);return Response.json(row.product);});
  assert.equal(observed.priceGrosze,[4890,9900,24900][index]);assert.equal(observed.ean,s.ean);assert.equal(observed.imageUrl,s.imageUrl);
  assert.notEqual(row.product.weight.weight_float,s.packageSize);assert.equal((observed as any).previousPriceGrosze,undefined);
 }
});

test('every new source rejects a changed package or identity before a merchant request',async()=>{
 for(const s of ATLAS_WODER_E_SOURCES)for(const patch of [{ean:'5905400195088'},{packageSize:10},{unit:'l'},{store:'Other'},{brand:'Mapei'},{purchaseMultiple:2},{minimumPackages:2},{url:s.url+'?other=1'}]){
  assert.throws(()=>confirmAtlasWoderSource({...s,...patch}),/package_not_confirmed/);
  await assert.rejects(readRetailSource({...s,...patch},async()=>{assert.fail('An altered reviewed source cannot initiate a request');}),/package_not_confirmed/);
 }
});

test('changed Lobo formulation, GTIN, producer or native purchase unit cannot supply a confirmed price',()=>{
 for(const row of fixture.products)for(const change of [(v:any)=>v.ean='5905400195088',(v:any)=>v.name=v.name.replace('WODER E','WODER W'),(v:any)=>v.producer.id++,(v:any)=>v.producer.name='OTHER',(v:any)=>v.unit.name='kg',(v:any)=>v.unit.floating_point=true,(v:any)=>v.package='10',(v:any)=>v.code='other',(v:any)=>v.id++,(v:any)=>v.url+='?other=1']){
  const item=structuredClone(row.product);change(item);assert.throws(()=>confirmAtlasWoderPurchase(item,source(row.sourceId)),/package_not_confirmed/);
 }
});

test('production quoter replays actual whole native Lobo baskets with their distinct freight amounts',async()=>{
 for(const basket of fixture.baskets){const r=replay(basket),result=await createRetailerQuoter(r.fetcher)(basket.order as unknown as DeliveredStoreBasket,basket.postcode);r.done();assert.ok('quote' in result);assert.equal(result.quote.costGrosze,basket.expectedCostGrosze);assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.postalCode,undefined);assert.ok(Date.parse(result.quote.expiresAt)>Date.now());}
});

test('a changed native count, amount, country or absent home courier leaves freight unknown',async()=>{
 const basket=fixture.baskets.find(b=>b.name==='lobo-mixed')!;
 for(const change of [(v:any)=>{if(v.products?.length)v.products[0].quantity++;},(v:any)=>{if(v.products?.length)v.products[0].price_float++;},(v:any)=>{if(v.countries)v.countries=[];},(v:any)=>{if(v.shippings)v.shippings=[];}]){
  const result=await createRetailerQuoter(replay(basket,change).fetcher)(basket.order as unknown as DeliveredStoreBasket,'30-001');assert.ok('reason' in result);assert.ok(result.reason);assert.equal('quote' in result,false);
 }
});
