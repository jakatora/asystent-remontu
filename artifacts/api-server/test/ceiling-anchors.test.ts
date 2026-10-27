import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/ceiling-anchors.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
test('same Rawlplug carton is priced in gross at49.54 and113.10;100pieces, dimensions and merchant SKU are guarded',async()=>{
 for(const [i,row]of fixture.entries()){const source=RETAIL_SOURCES.find(s=>s.id===row.sourceId)!,read=(p:any,s=source)=>readRetailSource(s,async()=>Response.json(p)),o=await read(row.product);assert.equal(o.priceGrosze,i?11310:4954);
  for(const patch of [{packageSize:1},{packageSize:50},{unit:'m2'}])await assert.rejects(read(row.product,{...source,...patch}));
  for(const mutate of [(p:any)=>p.ean='5906675158105',(p:any)=>p.code='other',(p:any)=>p.unit.floating_point=true,(p:any)=>p.name=p.name.replace('6x40','6x65')]){const p=clone(row.product);mutate(p);await assert.rejects(read(p));}
  if(i===0){const p=clone(row.product);p.description=p.description.replace('opakowanie kartonowe','sprzedaż pojedynczych sztuk');await assert.rejects(read(p),/package_not_confirmed/);}
  const order:DeliveredStoreBasket={store:source.store,materialsGrosze:o.priceGrosze,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:source.ean,name:source.name,imageUrl:null},unit:'szt',packages:[{offerId:source.id,count:1,packageSize:100,lineCostGrosze:o.priceGrosze,unitPriceGrosze:o.priceGrosze,store:source.store,url:source.url}]}]};
  const q=await createRetailerQuoter(async(input,init)=>{const u=new URL(String(input));assert.equal(u.origin,new URL(source.url).origin);if(u.pathname.includes('/products/PLN/'))return Response.json(row.product);assert.equal(u.pathname,'/webapi/front/pl_PL/basket/PLN/');if(init?.method==='POST'){assert.deepEqual(JSON.parse(String(init.body)),{stock_id:row.product.stockId,quantity:1});return Response.json({});}return Response.json(row.cart);})(order,'00-001');assert.ok('quote'in q);assert.equal(q.quote.costGrosze,i?2700:2100);
 }
});
