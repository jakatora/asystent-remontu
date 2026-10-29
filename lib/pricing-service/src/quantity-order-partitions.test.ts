import assert from 'node:assert/strict';
import {test} from 'node:test';
import {withOrderPartitions} from './order-partitions';
import {combineOrderQuotes,preservesOrderPackages,type QuotedOrder} from './quantity-order-partitions';
import type {BasketQuoter,DeliveredStoreBasket,DeliveryQuote} from './delivery';

const quote=(cost:number,ttl=600000):DeliveryQuote=>{const now=Date.now();return{costGrosze:cost,carrier:'Courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+ttl).toISOString(),sourceUrl:'https://example.test/cart',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:'a'.repeat(64)};};
const basket=(count=4):DeliveredStoreBasket=>({store:'Example',materialsGrosze:count*6198,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'underlay',name:'Underlay6m²',imageUrl:null},unit:'m2',packages:[{offerId:'underlay',store:'Example',url:'https://example.test/product',packageSize:6,count,unitPriceGrosze:6198,lineCostGrosze:count*6198}]}]});

test('four packs can use two independently priced2-pack orders, conserving quantity, money and full-stock expiry',async()=>{
 const input=basket(),before=JSON.stringify(input),calls:number[]=[];let limited=false;
 const atomic:BasketQuoter=async order=>{const n=order.lines[0].packages[0].count;calls.push(n);return{quote:quote(n===4?24900:6900,n===4?180000:600000)};};
 const result=await withOrderPartitions(atomic,()=>{limited=true;})(input,'00-001');assert.ok('quote'in result);
 assert.equal(result.quote.costGrosze,13800);assert.equal(result.quote.singleOrderCostGrosze,24900);assert.equal(result.quote.orders!.length,2);assert.equal(limited,false);
 assert.deepEqual(result.quote.orders!.map(o=>o.lines[0].packages[0].count),[2,2]);assert.deepEqual(calls,[4,2,1,3]);
 assert.equal(result.quote.orders!.reduce((n,o)=>n+o.materialsGrosze,0),24792);assert.equal(result.quote.orders!.reduce((n,o)=>n+o.lines[0].packages[0].count,0),4);assert.equal(input.materialsGrosze+result.quote.costGrosze,38592);
 assert.ok(Date.parse(result.quote.expiresAt)<=Date.now()+180000);assert.equal(JSON.stringify(input),before);
});
test('per-order minimum quantities and purchase lots are preserved, including remainders that cannot form a legal order',async()=>{
 for(const[min,expected]of [[3,13800],[5,24900]]){const input=basket(8);Object.assign(input.lines[0].packages[0],{minimumPackages:min,purchaseMultiple:2});const calls:number[]=[];
  const result=await withOrderPartitions(async order=>{const n=order.lines[0].packages[0].count;calls.push(n);assert.ok(n>=min&&n%2===0);return{quote:quote(n===8?24900:6900)};},()=>{})(input,'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,expected);assert.ok(calls.every(n=>n>=min));
 }
});
test('full-cart stock, price or delivery failures never initiate smaller cart requests',async()=>{
 for(const reason of ['insufficient_stock','price_changed','product_unavailable','quote_unavailable']){let calls=0;const result=await withOrderPartitions(async()=>{calls++;return{reason};},()=>{})(basket(),'00-001');assert.deepEqual(result,{reason});assert.equal(calls,1);}
});
test('invalid or expired suborder evidence and changed package identity cannot reduce the full payable amount',async()=>{
 for(const mutate of [(q:DeliveryQuote)=>({...q,costGrosze:NaN}),(q:DeliveryQuote)=>({...q,expiresAt:new Date(Date.now()-1).toISOString()}),(q:DeliveryQuote)=>({...q,destinationScope:'postal_code' as const,postalCode:'99-999'}),(q:DeliveryQuote)=>({...q,evidenceSha256:'bad'})]){
  const result=await withOrderPartitions(async order=>({quote:order.lines[0].packages[0].count===4?quote(24900):mutate(quote(1))}),()=>{})(basket(),'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,24900);assert.equal(result.quote.orders,undefined);
 }
 const full=basket(),base={order:full,quote:quote(24900)};for(const change of [(o:DeliveredStoreBasket)=>{o.lines[0].packages[0].count=1;},(o:DeliveredStoreBasket)=>{o.lines[0].unit='szt';},(o:DeliveredStoreBasket)=>{o.lines[0].packages[0].packageSize=5;},(o:DeliveredStoreBasket)=>{o.lines[0].packages[0].unitPriceGrosze=5000;},(o:DeliveredStoreBasket)=>{o.lines[0].packages[0].offerId='other';}]){
  const a=basket(2),b=basket(2);change(b);const parts=[{order:a,quote:quote(6900)},{order:b,quote:quote(6900)}];assert.equal(preservesOrderPackages(full,parts),false);assert.equal((await combineOrderQuotes(base,parts,'00-001')).costGrosze,24900);
 }
});
test('free whole delivery and ties retain one order; quantity search is bounded and honestly marked for large baskets',async()=>{
 for(const cost of [0,6900]){let calls=0;const result=await withOrderPartitions(async()=>{calls++;return{quote:quote(cost)};},()=>{})(basket(),'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,cost);assert.equal(result.quote.orders,undefined);if(cost===0)assert.equal(calls,1);}
 let calls=0,limited=false;const result=await withOrderPartitions(async order=>{calls++;return{quote:quote(order.lines[0].packages[0].count===10000?24900:6900)};},()=>{limited=true;})(basket(10000),'00-001');assert.ok('quote'in result);assert.equal(limited,true);assert.ok(calls<=13);assert.ok((result.quote.orders?.length??1)<=8);assert.equal(result.quote.orders!.reduce((n,o)=>n+o.lines[0].packages[0].count,0),10000);
});
test('quantity splits within a separated product line flatten into one reviewable list of orders for a mixed renovation',async()=>{
 const input=basket();input.lines.push({product:{id:'tape',name:'Tape',imageUrl:null},unit:'szt',packages:[{offerId:'tape',store:'Example',url:'https://example.test/tape',packageSize:1,count:1,unitPriceGrosze:100,lineCostGrosze:100}]});input.materialsGrosze+=100;let limited=false;
 const atomic:BasketQuoter=async order=>{if(order.lines.length===2)return{quote:quote(40000)};const n=order.lines[0].packages[0].count;return{quote:quote(order.lines[0].product.id==='tape'?1000:n===4?24900:6900)};};
 const result=await withOrderPartitions(atomic,()=>{limited=true;})(input,'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,14800);assert.equal(result.quote.orders!.length,3);assert.ok(result.quote.orders!.every(o=>!('orders'in o.quote)));assert.equal(limited,true);const parts:QuotedOrder[]=result.quote.orders!.map(o=>({order:{...input,lines:o.lines,materialsGrosze:o.materialsGrosze},quote:o.quote}));assert.equal(preservesOrderPackages(input,parts),true);
});
