import assert from 'node:assert/strict';
import {test} from 'node:test';
import {withOrderPartitions} from './order-partitions';
import type {BasketQuoter,DeliveredStoreBasket,DeliveryQuote} from './delivery';

const order=():DeliveredStoreBasket=>({store:'Sewera',materialsGrosze:400,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:['paper','paint','tape','film'].map(id=>({product:{id,name:id,imageUrl:null},unit:'szt',packages:[{offerId:id,store:'Sewera',url:'https://sklep.sewera.pl/'+id,packageSize:1,count:1,unitPriceGrosze:100,lineCostGrosze:100}]}))});
const groups=[{dispatchFrom:'Sosnowiec',offerIds:['paper']},{dispatchFrom:'Tarnowskie Góry',offerIds:['paint']},{dispatchFrom:'Katowice',offerIds:[]}];
const quote=(branch:string,cost:number):DeliveryQuote=>({costGrosze:cost,carrier:'Courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://sklep.sewera.pl/zamowienie',basis:'retailer_basket_postcode',destinationScope:'postal_code',postalCode:'00-001',dispatchFrom:branch,evidenceSha256:'a'.repeat(64)});

test('flexible products can require different branches; only complete native allocations compete on delivery cost',async()=>{
 const calls:string[]=[];
 const atomic:BasketQuoter=async basket=>{
  const ids=basket.lines.map(line=>line.product.id).sort();calls.push(ids.join(','));
  if(ids.length===4)return{reason:'requires_separate_dispatch',dispatchGroups:groups,flexibleDispatchOfferIds:['tape','film']};
  const branch=ids.includes('paper')?'Sosnowiec':ids.includes('paint')?'Tarnowskie Góry':'Katowice';
  if(ids.includes('tape')&&branch!=='Sosnowiec'||ids.includes('film')&&branch!=='Tarnowskie Góry')return{reason:'product_unavailable'};
  return{quote:quote(branch,branch==='Sosnowiec'?1990:3090)};
 };
 let limited=false;const before=JSON.stringify(order()),result=await withOrderPartitions(atomic,()=>{limited=true;})(order(),'00-001');
 assert.ok('quote'in result);assert.equal(result.quote.costGrosze,5080);assert.equal(result.quote.orders!.length,2);
 assert.deepEqual(result.quote.orders!.map(part=>part.lines.map(line=>line.product.id).sort()),[['paper','tape'],['film','paint']]);
 assert.equal(JSON.stringify(order()),before);assert.equal(limited,true);assert.ok(calls.length<=12);
});

test('duplicated, absent or fixed flexible IDs never reach a partial checkout',async()=>{
 for(const flexible of [['tape','tape'],['another','film'],['paper','tape'],['tape']]){
  let calls=0;const result=await withOrderPartitions(async()=>{calls++;return{reason:'requires_separate_dispatch',dispatchGroups:groups,flexibleDispatchOfferIds:flexible};},()=>{})(order(),'00-001');
  assert.deepEqual(result,{reason:'requires_separate_dispatch'});assert.equal(calls,1);
 }
});
test('large flexible dispatch searches keep a complete confirmed plan within a bounded number of native carts',async()=>{
 const basket=order();basket.lines=basket.lines.slice(0,2);
 const flexible=Array.from({length:10},(_,index)=>'flex-'+index);
 for(const id of flexible)basket.lines.push({...order().lines[2],product:{id,name:id,imageUrl:null},packages:[{...order().lines[2].packages[0],offerId:id,url:'https://sklep.sewera.pl/'+id}]});
 basket.materialsGrosze=basket.lines.length*100;let calls=0,limited=false;
 const result=await withOrderPartitions(async part=>{
  calls++;if(part.lines.length===basket.lines.length)return{reason:'requires_separate_dispatch',dispatchGroups:groups,flexibleDispatchOfferIds:flexible};
  const branch=part.lines.some(line=>line.product.id==='paper')?'Sosnowiec':part.lines.some(line=>line.product.id==='paint')?'Tarnowskie Góry':'Katowice';
  return{quote:quote(branch,100)};
 },()=>{limited=true;})(basket,'00-001');
 assert.ok('quote'in result);assert.equal(result.quote.costGrosze,200);assert.equal(result.quote.orders!.flatMap(part=>part.lines).length,12);assert.equal(limited,true);assert.ok(calls<=97);
});
