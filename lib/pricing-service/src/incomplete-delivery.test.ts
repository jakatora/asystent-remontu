import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import {estimateStageCost,type EstimateDeps} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import type {PurchaseOffer} from './types';
import type {DeliveryQuote} from './delivery';

const quote=():DeliveryQuote=>{const now=Date.now();return{costGrosze:5000,carrier:'Test courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:'https://example.test/cart',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:'a'.repeat(64)};};
async function stage(quantities=[1,2],alternative=true){
  const products=quantities.map((_,i)=>({id:'product-'+i,ean:'test-'+i,name:'Product '+i,normalizedName:'product '+i,category:'test',packageSize:'1',packageUnit:'szt',imageUrl:null}as Product));
  const offers=products.flatMap((p,i)=>(i===1&&alternative?['A','B']:['A']).map(store=>({id:p.id+'-'+store,productId:p.id,store,price:'1.00',packageSize:'1',unit:'szt',availability:'in_stock',source:'test',fetchedAt:new Date()}as PurchaseOffer)));
  const deps:EstimateDeps={findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)};
  return estimateStageCost({}as Database,products.map((p,i)=>({query:{ean:p.ean},quantity:quantities[i],unit:'szt'})),{},deps);
}

for(const selectedReason of ['retailer_transport_quote_required','quote_timeout'])test('the incomplete selected cart keeps its own '+selectedReason+' when another cart finishes later',async()=>{
  const input=await stage(),otherReason=selectedReason==='quote_timeout'?'retailer_transport_quote_required':'quote_timeout',completed:string[]=[];
  const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'30-001'},async order=>{
    if(order.store==='B')return{quote:quote()};
    const full=order.lines.length===2&&order.lines.find(l=>l.product.id==='product-1')?.packages[0].count===2;
    if(!full)await new Promise(resolve=>setTimeout(resolve,20));
    const reason=full?selectedReason:otherReason;completed.push(reason);return{reason};
  });
  assert.equal(result.best,null);assert.equal(result.status,'needs_delivery_costs');assert.equal(result.missingProductCount,0);
  assert.equal(result.purchasePlan?.totalGrosze,null);assert.equal(result.purchasePlan?.stores.length,1);
  assert.equal(result.purchasePlan.stores[0].lines.length,2);
  assert(completed.includes(selectedReason)&&completed.at(-1)===otherReason);
  assert.equal(result.unavailableStores?.find(s=>s.store==='A')?.reason,selectedReason);
});

test('optional splits wait for a complete delivered cart instead of spending requests on an incomplete renovation',async()=>{
  const input=await stage([20,1],false),calls:{count:number;product:string}[]=[];
  // Two mandatory stores, with no alternative seller for the unquoted product.
  input.lines.forEach(line=>{if(line.resolved&&line.product.id==='product-1')line.offers=line.offers.map(o=>({...o,store:'B'}));});
  const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'30-001',allowSeparateOrders:true},async order=>{
    const p=order.lines[0].packages[0];calls.push({count:p.count,product:order.lines[0].product.id});
    return order.store==='A'?{quote:quote()}:{reason:'retailer_transport_quote_required'};
  });
  assert.equal(result.best,null);assert.equal(result.purchasePlan?.totalGrosze,null);assert.equal(result.productCount,2);
  assert.equal(result.purchasePlan?.stores.flatMap(s=>s.lines).length,2);
  assert.deepEqual(calls.map(c=>c.count).sort((a,b)=>a-b),[1,20]);
  assert.equal(result.searchLimited,true);
});
