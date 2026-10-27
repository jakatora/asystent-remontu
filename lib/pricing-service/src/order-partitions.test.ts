import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withOrderPartitions } from './order-partitions';
import type { BasketQuoter, DeliveredStoreBasket, DeliveryQuote } from './delivery';

const basket = (): DeliveredStoreBasket => ({ store: 'Example', materialsGrosze: 600, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: ['panels','underlay','tape'].map((id,i) => ({product:{id,name:id,imageUrl:null},unit:'szt',packages:[{offerId:id,store:'Example',url:'https://example.test/'+id,packageSize:1,count:i+1,unitPriceGrosze:100,lineCostGrosze:(i+1)*100}]})) });
const quote = (costGrosze: number, expires = 600_000): DeliveryQuote => { const now=Date.now();return {costGrosze,carrier:'Courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+expires).toISOString(),sourceUrl:'https://example.test/basket',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:'a'.repeat(64)}; };
function fixture(whole = 60000, bad = false) {
  const calls: DeliveredStoreBasket[] = [];
  const atomic: BasketQuoter = async order => { calls.push(order);const ids=order.lines.map(l=>l.product.id).sort().join(',');return ids==='panels,tape,underlay'?{quote:quote(whole)}:ids==='panels'?{quote:quote(11000,240_000)}:ids==='tape,underlay'?{quote:bad?{...quote(2200),destinationScope:'postal_code',postalCode:'99-999'}:quote(2200,300_000)}:{reason:'no_home_delivery'};};
  return {calls,atomic};
}
test('separate native orders can beat a costly combined order without changing a single product or package', async () => {
  const order=basket(),before=JSON.stringify(order),api=fixture(),result=await withOrderPartitions(api.atomic,()=>{}) (order,'00-001');assert.ok('quote'in result);
  assert.equal(result.quote.costGrosze,13200);assert.equal(result.quote.singleOrderCostGrosze,60000);assert.equal(result.quote.orders!.length,2);
  assert.deepEqual(result.quote.orders!.flatMap(p=>p.lines).sort((a,b)=>a.product.id.localeCompare(b.product.id)),[...order.lines].sort((a,b)=>a.product.id.localeCompare(b.product.id)));
  assert.equal(result.quote.orders!.reduce((n,p)=>n+p.materialsGrosze,0),600);
  assert.equal(Date.parse(result.quote.expiresAt),Math.min(...result.quote.orders!.map(p=>Date.parse(p.quote.expiresAt))));
  assert.equal(result.quote.evidenceSha256.length,64);assert.notEqual(result.quote.evidenceSha256,'a'.repeat(64));assert.equal(JSON.stringify(order),before);
});
test('a single shipment remains preferable to more expensive separate orders; invalid destination quotes cannot lower its fee', async () => {
  for(const [api,expected] of [[fixture(2500),2500],[fixture(60000,true),60000]] as const) {const result=await withOrderPartitions(api.atomic,()=>{})(basket(),'00-001');assert.ok('quote'in result);assert.equal(result.quote.orders,undefined);assert.equal(result.quote.costGrosze,expected);}
});
test('a stock or unavailable full-cart response is preserved and cannot be bypassed by splitting quantities', async () => {
  for(const reason of ['insufficient_stock','product_unavailable','price_changed','quote_unavailable']){let calls=0;const result=await withOrderPartitions(async()=>{calls++;return {reason};},()=>{})(basket(),'00-001');assert.deepEqual(result,{reason});assert.equal(calls,1);}
});
test('expired, future-dated, invalid-price or unproven partial quotes never reduce a valid complete delivery fee', async () => {
  const mutations: ((q: DeliveryQuote) => DeliveryQuote)[] = [q=>({...q,expiresAt:new Date(Date.now()-1).toISOString()}),q=>({...q,checkedAt:new Date(Date.now()+60000).toISOString()}),q=>({...q,costGrosze:NaN}),q=>({...q,evidenceSha256:'unconfirmed'})];
  for(const mutate of mutations){const api=fixture();let limited=false;const result=await withOrderPartitions(async(order,postcode)=>{const outcome=await api.atomic(order,postcode);return 'quote'in outcome&&order.lines.length===2?{quote:mutate(outcome.quote)}:outcome;},()=>{limited=true;})(basket(),'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,60000);assert.equal(result.quote.orders,undefined);assert.equal(limited,true);}
});
test('large-order partition sampling is explicitly limited while preserving a valid full order', async () => {
  const order=basket();order.lines=[...order.lines,...order.lines.map(l=>({...l,product:{...l.product,id:l.product.id+'-2'}}))];order.materialsGrosze*=2;let limited=false;
  const result=await withOrderPartitions(async()=>({quote:quote(100)}),()=>{limited=true;})(order,'00-001');assert.ok('quote'in result);assert.equal(limited,true);assert.equal(result.quote.costGrosze,100);assert.equal(result.quote.orders,undefined);
});
