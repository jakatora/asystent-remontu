import assert from 'node:assert/strict';
import {test} from 'node:test';
import {setImmediate as nextTurn} from 'node:timers/promises';
import {limitBasketQuotes,mapQuoteWork} from './quote-work';
import type {DeliveredStoreBasket} from './delivery';

const order=(id:number)=>({store:String(id),lines:[],materialsGrosze:1,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown'} as DeliveredStoreBasket);

test('one comparison admits at most three native quotes, keeps FIFO and releases a rejected permit',async()=>{
 let active=0,peak=0;const started:string[]=[],context={ignoreStockOfferIds:['native-stock-limit']};
 const limited=limitBasketQuotes(async(o,postcode,received)=>{
  assert.equal(postcode,'00-001');assert.equal(received,context);started.push(o.store);active++;peak=Math.max(peak,active);
  try{await nextTurn();if(o.store==='1')throw Error('native rejected');return{reason:'quote_unavailable'};}
  finally{active--;}
 });
 const settled=await Promise.allSettled(Array.from({length:12},(_,i)=>limited(order(i),'00-001',context)));
 assert.equal(peak,3);assert.equal(active,0);assert.deepEqual(started,Array.from({length:12},(_,i)=>String(i)));
 assert.equal(settled.filter(r=>r.status==='rejected').length,1);assert.equal(settled.filter(r=>r.status==='fulfilled').length,11);
 assert.deepEqual(await limited(order(12),'00-001',context),{reason:'quote_unavailable'});
});

test('independent quote work overlaps while keeping deterministic input order despite reversed completion',async()=>{
 let active=0,peak=0;const finished:number[]=[];
 const result=await mapQuoteWork([0,1,2,3,4,5],async n=>{
  active++;peak=Math.max(peak,active);for(let i=0;i<3-n%3;i++)await nextTurn();finished.push(n);active--;return n*n;
 });
 assert.equal(peak,3);assert.equal(active,0);assert.notDeepEqual(finished,[0,1,2,3,4,5]);assert.deepEqual(result,[0,1,4,9,16,25]);
});
