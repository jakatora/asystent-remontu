import assert from 'node:assert/strict';
import {test} from 'node:test';
import {estimateStageCost} from './estimate';
import {compareDeliveryWithAvailablePart} from './selected-store-delivery';
import type {BasketQuoter,DeliverySettings,DeliveredStoreBasket} from './delivery';
import type {Product,Database} from '@workspace/db/repositories';
import type {StageEstimate,PurchaseOffer} from './types';

const settings:DeliverySettings={mode:'shipping',postalCode:'00-001'};
const product=(id:string)=>({id,ean:id==='p1'?'5901793357799':'4006379051014',gtin:null,name:id,normalizedName:id,category:'primer',packageSize:'15',packageUnit:'kg',imageUrl:null})as Product;
async function stage(rows:[string,number][],stock=100):Promise<StageEstimate>{
 return estimateStageCost({}as Database,rows.map(([id,quantity])=>({query:{ean:id==='missing'?'0000000000000':product(id).ean},quantity,unit:'kg'})),{store:'A'},{findProductByCode:async(_db,q)=>q.ean==='0000000000000'?null:product(q.ean==='5901793357799'?'p1':'p2'),findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>['A','B'].map(store=>({id:`${id}-${store}`,productId:id,store,price:'10.00',packageSize:'15',promoPrice:null,regularPrice:null,unit:'kg',pricePerUnit:null,source:'observed-store-page',availability:'in_stock',fetchedAt:new Date(),productUrl:'https://example.org/product',maxPackages:stock}))as PurchaseOffer[]});
}
const known:BasketQuoter=async order=>({quote:{costGrosze:300,carrier:'Kurier',payment:'Przelew',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600_000).toISOString(),sourceUrl:'https://example.org/basket',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}});

test('chosen-store partial quote consolidates two rooms before one pack/one shipping fee; full winner stays absent',async()=>{
 const stages=[await stage([['p1',0.4],['missing',2]]),await stage([['p1',0.4]])],before=JSON.stringify(stages),orders:DeliveredStoreBasket[]=[];
 const result=await compareDeliveryWithAvailablePart(stages,settings,async(order,p)=>{orders.push(order);return known(order,p);},[],new Date(),{},'A');
 assert.equal(result.status,'partial');assert.equal(result.best,null);assert.equal(result.lowerBound,null);assert.deepEqual(result.alternatives,[]);assert.equal(result.missingProductCount,1);assert.equal(result.availablePart?.productCount,1);assert.equal(result.availablePart?.store,'A');assert.equal(result.availablePart?.basket?.materialsGrosze,1000);assert.equal(result.availablePart?.basket?.deliveryGrosze,300);assert.equal(result.availablePart?.basket?.totalGrosze,1300);assert.equal(orders.length,1);assert.equal(orders[0].lines[0].packages[0].count,1);assert.equal(JSON.stringify(stages),before);
});

test('no explicit store, postcode, compatible mode or priced product means no extra quote',async()=>{
 const stages=[await stage([['p1',1],['missing',1]])],noCall:BasketQuoter=async()=>{throw Error('unexpected quote')};
 for(const[opts,store]of [[settings,undefined],[{mode:'shipping'},'A'],[{mode:'shipping',postalCode:'wrong'},'A'],[{mode:'pickup'},'A'],[{...settings,method:'manual'},'A']]as const){const r=await compareDeliveryWithAvailablePart(stages,opts,noCall,[],new Date(),{},store);assert.equal(r.availablePart,undefined);}
 const none=await compareDeliveryWithAvailablePart([await stage([['missing',1]])],settings,noCall,[],new Date(),{},'A');assert.equal(none.availablePart,undefined);
});

test('finite stock must cover full combined demand; an individually resolved room does not hide an unresolved room of the same EAN',async()=>{
 for(const quantities of [[10,10],[10,20]]){
  const inputs=[await stage([['p1',quantities[0]],['p2',1],['missing',1]],1),await stage([['p1',quantities[1]]],1)],orders:DeliveredStoreBasket[]=[];
  const r=await compareDeliveryWithAvailablePart(inputs,settings,async(order,p)=>{orders.push(order);return known(order,p)},[],new Date(),{},'A');
  assert.equal(r.status,'partial');assert.equal(r.best,null);assert.equal(r.availablePart?.productCount,1);assert.equal(r.availablePart?.basket?.stores[0].lines[0].product.id,'p2');assert.equal(orders.length,1);assert.ok(orders[0].lines.every(l=>l.product.id==='p2'));
 }
});

test('exact unresolved name/category identity also prevents silently quoting only one room without a barcode',async()=>{
 const input=await stage([['p1',1],['p2',1]]);input.lines.push({resolved:false,query:{normalizedName:'p1',category:'primer'},quantity:20,unit:'kg',reason:'no-offer',lineCost:0});
 const r=await compareDeliveryWithAvailablePart([input],settings,known,[],new Date(),{},'A');assert.equal(r.availablePart?.productCount,1);assert.equal(r.availablePart?.basket?.stores[0].lines[0].product.id,'p2');assert.equal(r.best,null);
});

test('new native stock limit keeps the subset unquoted rather than silently clamping its purchase quantity',async()=>{
 const input=await stage([['p1',20],['missing',1]]);let calls=0;
 const r=await compareDeliveryWithAvailablePart([input],settings,async(order,postalCode)=>{
  calls++;const pack=order.lines[0].packages[0];assert.equal(pack.count,2);
  return{reason:'insufficient_stock',stockLimits:[{offerId:pack.offerId,store:'A',productId:'p1',productName:'p1',maxPackages:1,requestedPackages:2,unitPriceGrosze:1000,postalCode,dispatchFrom:'Warehouse',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/basket',evidenceSha256:'a'.repeat(64)}]};
 },[],new Date(),{},'A');
 assert.equal(calls,1);assert.equal(r.availablePart?.basket,null);assert.equal(r.availablePart?.unavailableReason,'insufficient_stock');assert.equal(r.stockLimits?.[0].maxPackages,1);assert.equal(r.best,null);
});

test('retailer failure, expired/different-postcode quotes and unreviewed delivery do not become free subset totals',async()=>{
 const input=[await stage([['p1',1],['missing',1]])];
 for(const reason of ['price_changed','insufficient_stock','customer_details_required']){const r=await compareDeliveryWithAvailablePart(input,settings,async()=>({reason}),[],new Date(),{},'A');assert.equal(r.availablePart?.basket,null);assert.equal(r.availablePart?.unavailableReason,reason);assert.equal(r.best,null);}
 for(const change of [{expiresAt:new Date(0).toISOString()},{destinationScope:'postal_code' as const,postalCode:'42-209'},{costGrosze:NaN}]){const r=await compareDeliveryWithAvailablePart(input,settings,async(order,p)=>{const q=await known(order,p);assert.ok('quote'in q);return{quote:{...q.quote,...change}}},[],new Date(),{},'A');assert.equal(r.availablePart?.basket,null);assert.equal(r.best,null);}
 let calls=0;const blocked=await compareDeliveryWithAvailablePart(input,settings,async()=>{calls++;return{reason:'unexpected'}},[],new Date(),{A:'customer_details_required'},'A');assert.equal(calls,0);assert.equal(blocked.availablePart?.unavailableReason,'customer_details_required');
});

test('complete selected-store basket still uses the full result; positive zero-fee quote is allowed only with real evidence',async()=>{
 const full=await compareDeliveryWithAvailablePart([await stage([['p1',1]])],settings,known,[],new Date(),{},'A');assert.equal(full.status,'compared');assert.equal(full.best?.totalGrosze,1300);assert.equal(full.availablePart,undefined);
 const partial=await compareDeliveryWithAvailablePart([await stage([['p1',1],['missing',1]])],settings,async(order,p)=>{const q=await known(order,p);assert.ok('quote'in q);q.quote.costGrosze=0;return q},[],new Date(),{},'A');assert.equal(partial.availablePart?.basket?.deliveryGrosze,0);assert.equal(partial.availablePart?.basket?.totalGrosze,1000);assert.equal(partial.best,null);
});
