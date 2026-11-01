import assert from 'node:assert/strict';
import {test} from 'node:test';
import {estimateStageCost} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import {extraPackageAdditions} from './extra-package-difference';
import type {BasketQuoter,DeliveryQuote,DeliveredBasket} from './delivery';
import type {Database,Product} from '@workspace/db/repositories';
import type {PurchaseOffer} from './types';

const settings={mode:'shipping' as const,postalCode:'30-001',allowSeparateOrders:false,allowExtraPackages:true};
async function stage(rolls=8,maxPackages=197,multiple=1){
  const product={id:'tape',name:'Taśma 50 mm × 30 m',category:'drywall-accessory',packageSize:'30',packageUnit:'m',imageUrl:null}as Product;
  const offer={id:'roll',productId:'tape',store:'Elmas',price:'22.89',promoPrice:null,packageSize:'30',source:'observed-store-page',availability:'in_stock',fetchedAt:new Date(),productUrl:'https://example.org/tape',maxPackages,purchaseMultiple:multiple}as PurchaseOffer;
  return estimateStageCost({}as Database,[{query:{ean:'5907651698004'},quantity:rolls*30,unit:'m'}],{},{findProductByCode:async()=>product,findProductByNameAndCategory:async()=>product,listOffers:async()=>[offer]});
}
function quote(count:number):DeliveryQuote{const now=Date.now();return{costGrosze:count>=9?0:5000,carrier:'Courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)};}
const count=(order:Parameters<BasketQuoter>[0])=>order.lines.flatMap(line=>line.packages).reduce((n,pack)=>n+pack.count,0);
const native:BasketQuoter=async order=>({quote:quote(count(order))});

test('a capable client gets a separately confirmed cheaper surplus option without changing need or the base basket',async()=>{
  const input=await stage(),before=JSON.stringify(input),calls:number[]=[];
  const result=await compareAutomaticDelivery([input],settings,async order=>{calls.push(count(order));return native(order,'30-001');});
  assert.equal(result.best!.totalGrosze,23312);assert.equal(result.best!.deliveryGrosze,5000);
  const extra=result.extraPackageOption!;assert.equal(extra.basket.totalGrosze,20601);assert.equal(extra.basket.deliveryGrosze,0);assert.equal(extra.savingGrosze,2711);
  assert.deepEqual(extraPackageAdditions(result.best!,extra.basket)?.map(a=>[a.baselinePackages,a.proposedPackages,a.extraPackages,a.packageSize,a.unit]),[[8,9,1,30,'m']]);
  assert.ok(calls.includes(9));assert.ok(!calls.includes(10),'a proven dearer material sum does not need another carrier quote');assert.ok(calls.length<=9);assert.equal(result.allowExtraPackages,true);assert.equal(result.searchLimited,true);assert.equal(JSON.stringify(input),before);
});

test('two additional packs can cost less overall; an unhelpful intermediate count does not stop the native search',async()=>{
  const result=await compareAutomaticDelivery([await stage(7)],settings,native);
  assert.equal(result.best!.totalGrosze,21023);assert.equal(result.extraPackageOption!.basket.totalGrosze,20601);assert.equal(result.extraPackageOption!.savingGrosze,422);
  assert.equal(extraPackageAdditions(result.best!,result.extraPackageOption!.basket)![0].extraPackages,2);
});

test('legacy clients, explicit opt-out, pickup and manual delivery do not probe extra packs',async()=>{
  for(const options of [{...settings,allowExtraPackages:undefined},{...settings,allowExtraPackages:false},{...settings,mode:'pickup' as const},{...settings,method:'manual' as const,costsGrosze:{Elmas:5000}}]){
    const calls:number[]=[];const result=await compareAutomaticDelivery([await stage()],options,async order=>{calls.push(count(order));return native(order,'30-001');});
    assert.equal(result.extraPackageOption??null,null);assert.ok(calls.every(n=>n===8));
  }
});

test('paying for more packs is never recommended when the confirmed delivered total is not lower',async()=>{
  for(const rolls of [1,6,9]){const result=await compareAutomaticDelivery([await stage(rolls)],settings,native);assert.equal(result.extraPackageOption,null);assert.equal(result.best!.stores[0].lines[0].packages[0].count,rolls);}
});

test('published finite stock and merchant purchase multiples constrain additional full packs',async()=>{
  let calls:number[]=[];let result=await compareAutomaticDelivery([await stage(8,8)],settings,async order=>{calls.push(count(order));return native(order,'30-001');});
  assert.equal(result.extraPackageOption,null);assert.deepEqual(calls,[8]);calls=[];
  result=await compareAutomaticDelivery([await stage(8,198,2)],settings,async order=>{calls.push(count(order));return native(order,'30-001');});
  assert.equal(result.extraPackageOption!.basket.totalGrosze,22890);assert.equal(result.extraPackageOption!.savingGrosze,422);assert.ok(calls.every(n=>n%2===0));
});

test('missing, expired, foreign, fractional or unauthenticated extra freight never replaces the confirmed base',async()=>{
  for(const mutate of [(q:DeliveryQuote)=>{q.costGrosze=-1;},(q:DeliveryQuote)=>{q.costGrosze=0.5;},(q:DeliveryQuote)=>{q.expiresAt=new Date(Date.now()-1).toISOString();},
    (q:DeliveryQuote)=>{q.destinationScope='postal_code';q.postalCode='00-001';q.basis='retailer_basket_postcode';},(q:DeliveryQuote)=>{q.evidenceSha256='';},(q:DeliveryQuote)=>{q.sourceUrl='http://example.org/cart';}]){
    const result=await compareAutomaticDelivery([await stage()],settings,async order=>{const q=quote(count(order));if(count(order)>8)mutate(q);return{quote:q};});
    assert.equal(result.extraPackageOption,null);assert.equal(result.best!.totalGrosze,23312);
  }
  const result=await compareAutomaticDelivery([await stage()],settings,async order=>{if(count(order)>8)throw Error('network');return native(order,'30-001');});assert.equal(result.extraPackageOption,null);assert.equal(result.best!.totalGrosze,23312);
});

test('new checkout stock evidence discovered during surplus search also invalidates an impossible original basket',async()=>{
  const result=await compareAutomaticDelivery([await stage()],settings,async order=>count(order)>8?{reason:'insufficient_stock',stockLimits:[{
    offerId:'roll',store:'Elmas',productId:'tape',productName:'Taśma',maxPackages:7,requestedPackages:count(order),unitPriceGrosze:2289,postalCode:'30-001',dispatchFrom:'PL',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/cart',evidenceSha256:'b'.repeat(64),
  }]}:native(order,'30-001'));
  assert.equal(result.best,null);assert.equal(result.extraPackageOption,null);assert.equal(result.missingProductCount,1);assert.equal(result.stockLimits![0].maxPackages,7);
});

test('surplus identity cannot change SKU, store, units or reduce another needed product',async()=>{
  const result=await compareAutomaticDelivery([await stage()],settings,native),base=result.best!,valid=result.extraPackageOption!.basket;
  for(const mutate of [(b:DeliveredBasket)=>{b.stores[0].lines[0].packages[0].offerId='other';},(b:DeliveredBasket)=>{b.stores[0].lines[0].product.id='other';},
    (b:DeliveredBasket)=>{b.stores[0].store='other';},(b:DeliveredBasket)=>{b.stores[0].lines[0].unit='kg';},(b:DeliveredBasket)=>{b.stores[0].lines[0].packages[0].count=7;},(b:DeliveredBasket)=>{b.stores[0].lines[0].packages[0].packageSize=50;}]){
    const candidate=structuredClone(valid);mutate(candidate);assert.equal(extraPackageAdditions(base,candidate),null);
  }
  assert.equal(extraPackageAdditions(base,base),null);
});

test('extra search confirms at most eight whole-store trials after the complete base comparison',async()=>{
  const inputs=await Promise.all(Array.from({length:18},async(_,i)=>{const input=await stage(1),line=input.lines[0];assert.ok(line.resolved);line.product={...line.product,id:'item-'+i};line.offers=line.offers.map(offer=>({...offer,id:'offer-'+i,productId:'item-'+i,store:'Shop'+i,price:'1.00'}));return input;}));
  const calls:{store:string;count:number}[]=[];
  const result=await compareAutomaticDelivery(inputs,settings,async order=>{const n=count(order);calls.push({store:order.store,count:n});return{quote:{...quote(n),costGrosze:n===1?5000:0}};});
  assert.equal(result.best!.stores.length,18);assert.ok(result.extraPackageOption);assert.equal(calls.filter(c=>c.count===1).length,18);assert.equal(calls.filter(c=>c.count>1).length,8);assert.ok(calls.length<=80);
});

test('a base quote that expires during surplus I/O is re-ranked from cache and cannot remain a payable winner',async t=>{
  t.mock.timers.enable({apis:['Date'],now:Date.now()});let calls=0;
  const result=await compareAutomaticDelivery([await stage()],settings,async order=>{calls++;const n=count(order);if(n>8)t.mock.timers.tick(20);const q=quote(n);if(n===8)q.expiresAt=new Date(Date.now()+10).toISOString();return{quote:q};});
  assert.equal(result.best,null);assert.equal(result.extraPackageOption,null);assert.equal(result.purchasePlan!.totalGrosze,null);assert.equal(calls,2);
});

test('a large multi-store renovation leaves room for a genuinely cheaper extra pack within the same eighty-quote budget',async()=>{
  const inputs=await Promise.all(Array.from({length:20},async(_,i)=>{const input=await stage(1),line=input.lines[0];assert.ok(line.resolved);line.product={...line.product,id:'item-'+i};const original=line.offers[0];line.offers=Array.from({length:12},(_,j)=>({...original,id:`offer-${i}-${j}`,productId:'item-'+i,store:'Shop'+j,price:((100+j)/100).toFixed(2)}));return input;}));
  inputs.push(await stage(8));let calls=0;
  const result=await compareAutomaticDelivery(inputs,{...settings,allowSeparateOrders:true},async order=>{calls++;return{quote:{...quote(count(order)),costGrosze:order.store==='Elmas'?(count(order)>=9?0:5000):1000}};});
  assert.equal(result.best!.totalGrosze,26312);assert.equal(result.extraPackageOption!.basket.totalGrosze,23601);assert.equal(result.extraPackageOption!.savingGrosze,2711);assert.ok(calls<=80);
});

test('unused surplus slots return to ordinary search when every extra pack costs more than the entire freight',async()=>{
  const inputs=await Promise.all(Array.from({length:20},async(_,i)=>{const input=await stage(1),line=input.lines[0];assert.ok(line.resolved);line.product={...line.product,id:'item-'+i};const original=line.offers[0];line.offers=Array.from({length:12},(_,j)=>({...original,id:`offer-${i}-${j}`,productId:'item-'+i,store:'Shop'+j,price:((100+j)/100).toFixed(2)}));return input;}));
  inputs.push(await stage(8));const counts:number[]=[];
  for(const allowExtraPackages of [false,true]){let calls=0;const result=await compareAutomaticDelivery(inputs,{...settings,allowExtraPackages,allowSeparateOrders:true},async order=>{calls++;return{quote:{...quote(count(order)),costGrosze:50}};});assert.equal(result.best!.totalGrosze,20412);assert.equal(result.extraPackageOption??null,null);counts.push(calls);}
  assert.deepEqual(counts,[80,80]);
});
