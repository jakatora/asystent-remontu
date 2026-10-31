import assert from 'node:assert/strict';
import {test} from 'node:test';
import {unconfirmedDeliveryCoverage,deliveryRateLimitMessage} from './deliveryCoverage';
import type {DeliveryComparison} from '../../../../lib/pricing-service/src/delivery';

// Same shape as the real wave145 result: compared + a confirmed complete basket
// and a failed alternative at one of its stores. That state hid the top warning.
function result():DeliveryComparison{return{mode:'shipping',postalCode:'30-001',status:'compared',productCount:2,missingProductCount:0,best:{materialsGrosze:95324,deliveryGrosze:12799,totalGrosze:108123,lowerBoundGrosze:108123,stores:[]},lowerBound:null,alternatives:[],missingDeliveryStores:[],policies:[],unavailableStores:[{store:'Dekork',reason:'retailer_rate_limited',partial:true}],partiallyQuotedStores:['Dekork']};}

test('a quoted complete winner still warns about an unquoted alternative, without changing any money or ranking',()=>{
 const value=result(),before=JSON.stringify(value);assert.deepEqual(unconfirmedDeliveryCoverage(value,true),{stores:['Dekork'],rateLimitedStores:['Dekork']});assert.equal(JSON.stringify(value),before);assert.equal(value.best?.totalGrosze,108123);
 value.unavailableStores=[];assert.deepEqual(unconfirmedDeliveryCoverage(value,true),{stores:['Dekork'],rateLimitedStores:[]});value.partiallyQuotedStores=[];value.missingDeliveryStores=['Other'];assert.deepEqual(unconfirmedDeliveryCoverage(value,true),{stores:['Other'],rateLimitedStores:[]});
});

test('fully quoted, pickup, stale-destination, missing-product and unpriced results never get a misleading winner warning',()=>{
 const complete=result();complete.unavailableStores=[];complete.partiallyQuotedStores=[];assert.equal(unconfirmedDeliveryCoverage(complete,true),null);
 assert.equal(unconfirmedDeliveryCoverage(result(),false),null);for(const change of[{mode:'pickup' as const},{postalCode:'30-'},{best:null},{missingProductCount:1},{status:'partial' as const}])assert.equal(unconfirmedDeliveryCoverage({...result(),...change},true),null);
 const legacy=result();legacy.status='needs_delivery_costs';legacy.unavailableStores=[];legacy.partiallyQuotedStores=[];assert.deepEqual(unconfirmedDeliveryCoverage(legacy,true),{stores:[],rateLimitedStores:[]});
});

test('selected store warnings include its unquoted pack plans and omit unrelated retailers',()=>{
 const value=result();value.unavailableStores!.push({store:'Other',reason:'quote_timeout'});value.missingDeliveryStores=['Other'];assert.deepEqual(unconfirmedDeliveryCoverage(value,true,'Dekork'),{stores:['Dekork'],rateLimitedStores:['Dekork']});assert.deepEqual(unconfirmedDeliveryCoverage(value,true,'Other'),{stores:['Other'],rateLimitedStores:[]});assert.equal(unconfirmedDeliveryCoverage(value,true,'LiderzyCen'),null);
});

test('rate-limit guidance gives a recovery action without inventing a fee or a retry time',()=>{
 assert.match(deliveryRateLimitMessage('pl'),/Spróbuj później/);assert.match(deliveryRateLimitMessage('en'),/Try later/);assert.doesNotMatch(deliveryRateLimitMessage('pl'),/429|\d|zł/);
});
