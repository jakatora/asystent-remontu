import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/asfora-white-shoper.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const sources=[1,2,3].map(n=>RETAIL_SOURCES.find(s=>s.id==='zpradem-asfora-white-frame-'+n)!);
function replay(context:string,mutate?:(body:string,index:number)=>string){const rows=fixture.records.filter(r=>r.context===context);let i=0;const fetcher:typeof fetch=async(input,init)=>{const r=rows[i];assert.ok(r,'unexpected request');assert.equal(String(input),r.url);assert.equal(init?.method??'GET',r.method);assert.equal(String(init?.body??''),r.requestBody);if(init?.method==='POST'){const b=JSON.parse(String(init.body));assert.deepEqual(Object.keys(b).sort(),['quantity','stock_id']);}const body=mutate?.(r.body,i)??r.body;i++;return new Response(body,{status:r.status,headers:{'content-type':'application/json'}});};return{fetcher,done:()=>assert.equal(i,rows.length)};}
const order=(counts:number[]):DeliveredStoreBasket=>({store:'Z prądem',source:'unknown',materialsGrosze:counts.reduce((sum,n,i)=>sum+n*[350,640,960][i],0),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,lines:counts.flatMap((n,i)=>n?[{product:{id:'remont-'+sources[i].ean,name:sources[i].name,imageUrl:sources[i].imageUrl!},unit:'szt',packages:[{offerId:sources[i].id,count:n,packageSize:1,unitPriceGrosze:[350,640,960][i],lineCostGrosze:n*[350,640,960][i],url:sources[i].url,store:'Z prądem'}]}]:[])});
test('three Asfora frame types bind exact manufacturer codes, EANs, whole-piece native units and photographs',async()=>{
 for(const[i,s]of sources.entries()){const r=replay('read:'+s.productId),o=await readRetailSource(s,r.fetcher);r.done();assert.equal(o.priceGrosze,[350,640,960][i]);assert.equal(o.ean,['3606480527166','3606480527180','3606480527203'][i]);assert.equal(o.imageUrl,s.imageUrl);}
});
test('native shared retailer quotes all mixed frames with one27PLN home courier, at both postcodes',async()=>{
 for(const[counts,code]of [[[1,0,0],'00-001'],[[5,0,0],'00-001'],[[7,2,1],'00-001'],[[0,3,2],'00-001'],[[10,0,0],'42-209'],[[14,4,2],'00-001']] as [number[],string][]){const r=replay('quote:'+counts.join('-')+':'+code),q=await createRetailerQuoter(r.fetcher)(order(counts),code);r.done();assert.ok('quote'in q);assert.equal(q.quote.costGrosze,2700);assert.equal(q.quote.basis,'retailer_basket_national');assert.equal(q.quote.destinationScope,'PL');assert.equal(q.quote.postalCode,undefined);assert.match(q.quote.carrier,/kurier/);}
});
test('native source rejects unavailable, different-EAN and conflicting gross-price responses',async()=>{
 for(const mutate of [(s:string)=>s.replace('3606480527166','3606480527180'),(s:string)=>s.replace('"can_buy":true','"can_buy":false'),(s:string)=>s.replace('"final_float":3.5','"final_float":1')]){const r=replay('read:788683',mutate);await assert.rejects(readRetailSource(sources[0],r.fetcher));}
});
test('basket verification rejects changed whole-frame quantities or another product in a mixed order',async()=>{
 const r=replay('quote:7-2-1:00-001',(body,index)=>{if(index!==6)return body;const cart=JSON.parse(body);cart.products[0].quantity=1;return JSON.stringify(cart);});const result=await createRetailerQuoter(r.fetcher)(order([7,2,1]),'00-001');r.done();assert.ok('reason'in result);assert.equal(result.reason,'basket_not_confirmed');
});
