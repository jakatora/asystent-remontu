import assert from 'node:assert/strict';
import {test} from 'node:test';
import {estimateStageCost} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import {quotedMaterialsGrosze,validatedCartPricing} from './cart-pricing';
import type {DeliveredStoreBasket,DeliveryQuote} from './delivery';
import type {Database,Product,ProductOffer} from '@workspace/db/repositories';

async function stage(index=0,count=1,stores=['A','ABUD']){
 const product={id:'p'+index,name:'Cable '+index,category:'wire',packageSize:'1',packageUnit:'mb',imageUrl:null} as Product;
 const offers=stores.map(store=>({id:store+'-'+index,productId:product.id,store,price:store==='ABUD'?'100.00':'10.00',promoPrice:null,packageSize:'1',source:'retailer-verified-observation',availability:'in_stock',fetchedAt:new Date(),productUrl:store==='ABUD'?'https://www.abud.pl/product-pol-100-test.html':'https://example.org/p'} as ProductOffer));
 return estimateStageCost({} as Database,[{query:{ean:'5903973139188'},quantity:count,unit:'mb'}],{}, {findProductByCode:async()=>product,findProductByNameAndCategory:async()=>product,listOffers:async()=>offers});
}
function quote(order:DeliveredStoreBasket,unit?:number,shipping=0):DeliveryQuote{
 const now=Date.now(),lines=order.lines.flatMap(l=>l.packages.map(p=>({offerId:p.offerId,count:p.count,baseUnitPriceGrosze:p.unitPriceGrosze,unitPriceGrosze:unit??p.unitPriceGrosze,lineCostGrosze:p.count*(unit??p.unitPriceGrosze)}))),total=lines.reduce((n,p)=>n+p.lineCostGrosze,0);
 return{costGrosze:shipping,carrier:'Courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:order.store==='ABUD'?'https://www.abud.pl/basketedit.php':'https://example.org/cart',destinationScope:'postal_code',postalCode:'30-001',basis:'retailer_basket_postcode',evidenceSha256:'a'.repeat(64),...(total<order.materialsGrosze?{cartPricing:{currency:'PLN',baseMaterialsGrosze:order.materialsGrosze,materialsGrosze:total,discountGrosze:order.materialsGrosze-total,lines}}:{})};
}
const settings={mode:'shipping' as const,postalCode:'30-001'};

test('native basket material prices rank the paid total and leave catalogue observations unchanged',async()=>{
 const input=await stage(),before=JSON.stringify(input);const result=await compareAutomaticDelivery([input],settings,async order=>({quote:quote(order,order.store==='ABUD'?500:undefined,100)}));
 assert.equal(result.best!.totalGrosze,600);assert.equal(result.best!.materialsGrosze,500);const store=result.best!.stores[0];assert.equal(store.store,'ABUD');assert.equal(store.lines[0].packages[0].lineCostGrosze,500);assert.equal(store.lines[0].packages[0].unitPriceGrosze,500);assert.equal(store.quote!.cartPricing!.discountGrosze,9500);assert.equal(JSON.stringify(input),before);
});

test('malformed or unrelated material discounts cannot replace catalogue amounts',async()=>{
 const input=await stage(0,1,['ABUD']);let observed!:DeliveredStoreBasket;
 await compareAutomaticDelivery([input],settings,async order=>{observed=structuredClone(order);return{quote:quote(order,500)};});
 const good=quote(observed,500);assert.equal(quotedMaterialsGrosze(observed,good),500);
 const mutations=[(q:any)=>q.cartPricing.currency='EUR',(q:any)=>q.cartPricing.materialsGrosze=501,(q:any)=>q.cartPricing.discountGrosze=1,(q:any)=>q.cartPricing.baseMaterialsGrosze=9999,(q:any)=>q.cartPricing.lines[0].count=2,(q:any)=>q.cartPricing.lines[0].offerId='other',(q:any)=>q.cartPricing.lines[0].baseUnitPriceGrosze=9000,(q:any)=>q.cartPricing.lines[0].unitPriceGrosze=10001,(q:any)=>q.cartPricing.lines[0].lineCostGrosze=0,(q:any)=>q.materialsRoundingGrosze=1,(q:any)=>q.sourceUrl='https://example.org/cart',(q:any)=>q.cartPricing.lines.push({...q.cartPricing.lines[0]})];
 for(const mutate of mutations){const q=structuredClone(good);mutate(q);assert.equal(validatedCartPricing(observed,q),null);const result=await compareAutomaticDelivery([input],settings,async()=>({quote:q}));assert.equal(result.best,null);assert.equal(result.purchasePlan!.materialsGrosze,10000);}
 const wrongStore={...observed,store:'A'};assert.equal(validatedCartPricing(wrongStore,good),null);
 const wrongPostcode=await compareAutomaticDelivery([input],{...settings,postalCode:'00-001'},async()=>({quote:good}));assert.equal(wrongPostcode.best,null);
});

test('catalogue-cost pruning must still quote a discounted ABUD middle allocation',async()=>{
 const stages=await Promise.all([0,1,2].map(i=>stage(i))),requested:string[]=[];
 const result=await compareAutomaticDelivery(stages,settings,async order=>{
  const ids=order.lines.flatMap(l=>l.packages.map(p=>p.offerId)).sort().join(',');requested.push(ids);
  return{quote:quote(order,ids==='ABUD-0,ABUD-1'?1:undefined)};
 });
 assert.ok(requested.includes('ABUD-0,ABUD-1'));assert.equal(result.best!.totalGrosze,1002);assert.equal(result.best!.stores.find(s=>s.store==='ABUD')!.materialsGrosze,2);
});

test('expired basket discount is removed while another retailer is responding',async t=>{
 t.mock.timers.enable({apis:['Date'],now:Date.now()});const input=await stage();
 const result=await compareAutomaticDelivery([input],settings,async order=>{const q=quote(order,order.store==='ABUD'?500:undefined);if(order.store==='ABUD')q.expiresAt=new Date(Date.now()+10).toISOString();else t.mock.timers.tick(20);return{quote:q};});
 assert.equal(result.best!.stores[0].store,'A');assert.ok(!result.alternatives.some(b=>b.stores.some(s=>s.quote?.cartPricing)));assert.ok(result.unavailableStores!.some(s=>s.store==='ABUD'&&s.reason==='quote_expired'));
});

test('separate orders compare actual material plus shipping totals, including a higher freight fee',async()=>{
 const input=await stage(0,2,['ABUD']);
 const result=await compareAutomaticDelivery([input],{...settings,allowSeparateOrders:true},async order=>{const count=order.lines[0].packages[0].count;return{quote:quote(order,count===2?8000:5000,count===2?1000:2000)};});
 const basket=result.best!,store=basket.stores[0];assert.deepEqual([basket.materialsGrosze,basket.deliveryGrosze,basket.totalGrosze],[10000,4000,14000]);assert.equal(store.quote!.orders!.length,2);assert.equal(store.quote!.singleOrderTotalGrosze,17000);assert.equal(store.quote!.singleOrderCostGrosze,undefined);assert.equal(store.quote!.cartPricing!.discountGrosze,10000);assert.equal(store.lines[0].packages.reduce((n,p)=>n+p.lineCostGrosze,0),10000);assert.ok(store.quote!.orders!.every(p=>p.materialsGrosze===5000&&p.lines[0].packages[0].unitPriceGrosze===5000));
});

test('free freight does not prove a basket is cheapest when separate native carts discount materials',async()=>{
 const input=await stage(0,2,['ABUD']);const result=await compareAutomaticDelivery([input],{...settings,allowSeparateOrders:true},async order=>{const count=order.lines[0].packages[0].count;return{quote:quote(order,count===1?5000:undefined,count===1?500:0)};});
 assert.deepEqual([result.best!.materialsGrosze,result.best!.deliveryGrosze,result.best!.totalGrosze],[10000,1000,11000]);assert.equal(result.best!.stores[0].quote!.orders!.length,2);
});

test('free separate freight cannot erase a better combined material discount',async()=>{
 const input=await stage(0,2,['ABUD']);const result=await compareAutomaticDelivery([input],{...settings,allowSeparateOrders:true},async order=>{const count=order.lines[0].packages[0].count;return{quote:quote(order,count===2?6000:undefined,count===2?2000:0)};});
 assert.equal(result.best!.totalGrosze,14000);assert.equal(result.best!.stores[0].quote!.orders,undefined);assert.equal(result.best!.stores[0].quote!.cartPricing!.discountGrosze,8000);
});
