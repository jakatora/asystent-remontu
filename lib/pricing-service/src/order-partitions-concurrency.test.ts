import assert from 'node:assert/strict';
import {test} from 'node:test';
import {withOrderPartitions} from './order-partitions';
import {preservesOrderPackages} from './quantity-order-partitions';
import type {BasketQuoter,DeliveredStoreBasket,DeliveryQuote,DeliveryQuoteResult} from './delivery';

const basket=(count=4):DeliveredStoreBasket=>({store:'Controlled shop',materialsGrosze:count*100,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:Array.from({length:count},(_,i)=>({product:{id:'p'+i,name:'Product '+i,imageUrl:null},unit:'szt',packages:[{offerId:'offer'+i,store:'Controlled shop',url:'https://example.test/'+i,packageSize:1,count:1,unitPriceGrosze:100,lineCostGrosze:100}]}))});
const quote=(fee:number):DeliveryQuote=>{const now=Date.now();return{costGrosze:fee,carrier:'Controlled courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:'https://example.test/cart',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:'a'.repeat(64)};};
const tick=()=>new Promise<void>(resolve=>setImmediate(resolve));

async function run(order:DeliveredStoreBasket,reverse:boolean,reject=false){
 const calls:DeliveredStoreBasket[]=[],pending:{resolve:(result:DeliveryQuoteResult)=>void;reject:(e:Error)=>void;order:DeliveredStoreBasket}[]=[];let active=0,maxActive=0,limited=false,done=false;
 const atomic:BasketQuoter=async requested=>{calls.push(requested);if(requested.lines.length===order.lines.length)return{quote:quote(4000)};active++;maxActive=Math.max(active,maxActive);try{return await new Promise<DeliveryQuoteResult>((resolve,reject)=>pending.push({resolve,reject,order:requested}));}finally{active--;}};
 const operation=withOrderPartitions(atomic,()=>{limited=true;})(order,'30-001').finally(()=>{done=true;});
 try{await tick();assert.equal(pending.length,3,'Three independent carts should start after the whole-stock quote, without waiting for the first cart');assert.equal(maxActive,3);}
 finally{for(let i=0;!done&&i<100;i++){const batch=pending.splice(0);if(reverse)batch.reverse();for(const p of batch){if(reject&&p.order.lines[0].product.id==='p0')p.reject(Error('controlled unavailable'));else p.resolve({quote:quote(reject?10000:p.order.lines.length===1?100:1000)});}await tick();}}
 const result=await operation;assert.equal(active,0);assert.equal(done,true);assert(maxActive<=3);return{result,calls,maxActive,limited};
}

test('independent line partitions have three bounded workers, cover all subsets and preserve the exact best delivered order despite completion order',async()=>{
 const order=basket(),before=JSON.stringify(order),forward=await run(order,false),reverse=await run(order,true);
 for(const proof of[forward,reverse]){assert.equal(proof.calls.length,15);assert.equal(new Set(proof.calls.map(c=>c.lines.map(l=>l.product.id).join(','))).size,15);assert('quote'in proof.result);assert.equal(proof.result.quote.costGrosze,400);assert.equal(proof.result.quote.orders?.length,4);assert(preservesOrderPackages(order,proof.result.quote.orders!.map(p=>({order:{...order,lines:p.lines,materialsGrosze:p.materialsGrosze},quote:p.quote}))));assert.equal(proof.result.quote.singleOrderCostGrosze,4000);}
 assert('quote'in forward.result&&'quote'in reverse.result);assert.deepEqual(forward.result.quote.orders?.map(p=>p.lines.map(l=>l.product.id)),reverse.result.quote.orders?.map(p=>p.lines.map(l=>l.product.id)));assert.equal(JSON.stringify(order),before);
});

test('a failed independent cart is settled and cannot replace the valid whole-order quote or stop the remaining carts',async()=>{
 const proof=await run(basket(),true,true);assert.equal(proof.calls.length,15);assert.equal(proof.limited,true);assert('quote'in proof.result);assert.equal(proof.result.quote.costGrosze,4000);assert.equal(proof.result.quote.orders,undefined);
});

test('large-order samples keep bounded concurrency, deterministic selected lines and every physical package',async()=>{
 const order=basket(7),forward=await run(order,false),reverse=await run(order,true);
 for(const proof of[forward,reverse]){assert.equal(proof.calls.length,15);assert.equal(proof.limited,true);assert('quote'in proof.result);assert.equal(proof.result.quote.costGrosze,1100);assert.equal(proof.result.quote.orders?.length,2);assert(preservesOrderPackages(order,proof.result.quote.orders!.map(p=>({order:{...order,lines:p.lines,materialsGrosze:p.materialsGrosze},quote:p.quote}))));}
 assert('quote'in forward.result&&'quote'in reverse.result);assert.deepEqual(forward.result.quote.orders?.map(p=>p.lines.map(l=>l.product.id)),reverse.result.quote.orders?.map(p=>p.lines.map(l=>l.product.id)));
});

test('partial carts never start while the mandatory whole-stock quote is unresolved or after its rejection',async()=>{
 const calls:DeliveredStoreBasket[]=[];let resolve!:(result:DeliveryQuoteResult)=>void;const pending=withOrderPartitions(async order=>{calls.push(order);return new Promise<DeliveryQuoteResult>(r=>{resolve=r;});},()=>{})(basket(),'30-001');await tick();assert.equal(calls.length,1);resolve({reason:'insufficient_stock'});assert.deepEqual(await pending,{reason:'insufficient_stock'});assert.equal(calls.length,1);
});
