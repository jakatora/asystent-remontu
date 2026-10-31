import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/rigips-hangers.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {parseRetailPage} from '../src/lib/retail-pages';
import {isReviewedSeweraDispatchSource} from '../src/lib/retail-sku';
import {quoteSewera} from '../src/lib/retailer-checkouts';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

const sources=['sewera-rigips-hanger-es6075','sewera-rigips-hanger-es60125'].map(id=>RETAIL_SOURCES.find(s=>s.id===id)!);
test('exact Rigips simple ES hangers retain their barcode, size, gross piece price and primary photograph',()=>{
 sources.forEach((source,i)=>{
  const row=parseRetailPage(fixture[i].html,source,new Date());assert.equal(row.ean,source.ean);assert.equal(row.priceGrosze,i===0?138:175);assert.equal(row.name,source.name);assert.match(row.imageUrl!,i===0?/6075/:/60125/);assert.equal(source.packageSize,1);assert.equal(source.retailUnit,'SZT');
  for(const [html,changed]of [[fixture[i].html.replaceAll(source.ean,'5907651699650'),source],[fixture[i].html.replaceAll(source.name,source.name.replace(i===0?'75':'125','250')),source],[fixture[i].html,{...source,retailUnit:'OPA' as const}]]as const)assert.throws(()=>parseRetailPage(html,changed,new Date()));
 });
});
test('Rigips hanger dispatch remains bound to exact size, EAN, branch and one retail piece',()=>{
 sources.forEach((source,i)=>{
  assert.equal(isReviewedSeweraDispatchSource(source),true);assert.equal(source.dispatchDepartment!.name,i===0?'Katowice':'Sosnowiec');
  for(const change of [{ean:'5907651699650'},{packageSize:100},{unit:'m'},{name:source.name.replace('prosty','kątowy')},{retailUnit:'OPA' as const},{dispatchDepartment:{id:'3',name:'Gliwice'}},{url:sources[1-i].url},{brand:'Norgips'}])assert.equal(isReviewedSeweraDispatchSource({...source,...change}),false);
 });
});
test('the two hanger sizes and three tapes require two verified native branch baskets, without mixing them into a fictitious shipment',async()=>{
 const ids=[sources[0].id,sources[1].id,'sewera-rigips-paper-50x75','sewera-rigips-acoustic-50x30','sewera-rigips-acoustic-30x30'],prices=[138,175,2194,2925,1834],counts=[29,29,1,1,1];
 const order:DeliveredStoreBasket={store:'Sewera',materialsGrosze:16030,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:ids.map((id,i)=>{const s=RETAIL_SOURCES.find(s=>s.id===id)!;return{product:{id:'remont-'+s.ean,name:s.name,imageUrl:null},unit:s.unit,packages:[{offerId:s.id,store:s.store,url:s.url,packageSize:s.packageSize,count:counts[i],unitPriceGrosze:prices[i],lineCostGrosze:prices[i]*counts[i]}]};})};
 let calls=0;const result=await quoteSewera(order,'00-001',async()=>{calls++;throw Error('unexpected network');});assert.equal(calls,0);
 assert.deepEqual(result,{reason:'requires_separate_dispatch',dispatchGroups:[{dispatchFrom:'Katowice',offerIds:[ids[0]]},{dispatchFrom:'Sosnowiec',offerIds:ids.slice(1)}]});
});
