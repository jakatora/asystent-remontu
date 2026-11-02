import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRetailerQuoter} from './retailer-delivery';
import {createRetailerConnectionGuard} from './retailer-connection';
import fixture from './fixtures/ceresit-viva-shades.json' with {type:'json'};
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

const sample=fixture.cases.find(c=>c.order.store==='Buduj24')!,order=sample.order as DeliveredStoreBasket;
async function setup(t:any){t.mock.timers.enable({apis:['Date'],now:Date.parse(fixture.observedAt)});let at=0,offline=false,failedAttempts=0;const guard=createRetailerConnectionGuard(async(input,init)=>{if(offline){failedAttempts++;throw new TypeError('fetch failed',{cause:Object.assign(Error('connect'),{code:'UND_ERR_CONNECT_TIMEOUT'})});}const c=sample.calls[at++]as {url:string;method:string;status:number;cardRef?:string;body?:string};assert(c);assert.equal(String(input),c.url);assert.equal(init?.method??'GET',c.method);return new Response(c.cardRef?(fixture.cards as Record<string,string>)[c.cardRef]:c.body,{status:c.status,headers:{'content-type':'text/html'}});},order.lines.flatMap(l=>l.packages.map(p=>p.url!)));const quote=createRetailerQuoter(guard.fetch,guard),first=await quote(order,'30-001');assert('quote'in first);assert.equal(first.quote.destinationScope,'PL');offline=true;await assert.rejects(guard.fetch(order.lines[0].packages[0].url!),/retailer_connection_unavailable/);return{quote,first,guard,calls:()=>at,failed:()=>failedAttempts};}

test('the identical reviewed Buduj24 national basket keeps its actual unexpired courier when only the postcode changes and the origin is offline',async t=>{
 const {quote,first,calls,failed}=await setup(t),snapshot=JSON.stringify(first);assert.equal(calls(),sample.calls.length);const other=await quote(order,'00-001');assert.deepEqual(other,first);assert.deepEqual(quote.cached!(order,'00-001'),first);assert.equal(calls(),sample.calls.length);assert.equal(failed(),1);assert.equal(JSON.stringify(first),snapshot);assert('quote'in other);assert.equal(other.quote.postalCode,undefined);assert.equal(other.quote.costGrosze,1500);
 assert.deepEqual(quote.cached!({...order,lines:[...order.lines].reverse()},'12-345'),first);
});

test('national reuse never covers another price, quantity, SKU, URL, unit, cut or understocked package',async t=>{
 const {quote}=await setup(t);for(const mutate of [(x:any)=>x.materialsGrosze++,(x:any)=>x.lines[0].packages[0].count++,(x:any)=>x.lines[0].packages[0].unitPriceGrosze++,(x:any)=>x.lines[0].packages[0].offerId='other',(x:any)=>x.lines[0].packages[0].url='https://other.example/item',(x:any)=>x.lines[0].product.id='other',(x:any)=>x.lines[0].unit='l',(x:any)=>x.lines[0].packages[0].packageSize=10,(x:any)=>x.lines[0].packages[0].cutRoll={lengthM:5},(x:any)=>x.lines[0].packages[0].maxPackages=0]){const changed=structuredClone(order);mutate(changed);assert.equal(quote.cached!(changed,'00-001'),null);}
});

test('changing postcode never refreshes a native national timestamp or extends the original cache validity',async t=>{
 const {quote,first}=await setup(t);assert('quote'in first);const original=structuredClone(first);t.mock.timers.setTime(Date.now()+30_001);assert.deepEqual(quote.cached!(order,'00-001'),original);t.mock.timers.setTime(Date.parse(first.quote.checkedAt)+540_001);assert.equal(quote.cached!(order,'00-001'),null);assert.deepEqual(first,original);
});
