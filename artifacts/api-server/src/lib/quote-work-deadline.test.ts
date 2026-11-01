import assert from 'node:assert/strict';
import {test} from 'node:test';
import {setImmediate as nextTurn} from 'node:timers/promises';
import {limitBasketQuotes} from '../../../../lib/pricing-service/src/quote-work';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {quoteBeforeDeadline,type CachedBasketQuoter} from './retailer-delivery';

test('waiting for a native permit cannot start uncached transport after the actual comparison deadline',async t=>{
 t.mock.timers.enable({apis:['Date'],now:100000});const deadline=100010,releases:(()=>void)[]=[];let native=0;
 const quoter:CachedBasketQuoter=Object.assign(async():Promise<DeliveryQuoteResult>=>{native++;await new Promise<void>(resolve=>releases.push(resolve));return{reason:'quote_unavailable'};},{cached:()=>null});
 const limited=limitBasketQuotes((order,postcode)=>quoteBeforeDeadline(quoter,order,postcode,deadline));
 const order={store:'Example',lines:[],materialsGrosze:100,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown'} as DeliveredStoreBasket;
 const outcomes=Promise.all(Array.from({length:6},()=>limited(order,'00-001')));await nextTurn();assert.equal(native,3);t.mock.timers.tick(20);releases.forEach(release=>release());
 const results=await outcomes;assert.equal(native,3);assert.deepEqual(results.slice(3),Array.from({length:3},()=>({reason:'quote_timeout'})));
});
