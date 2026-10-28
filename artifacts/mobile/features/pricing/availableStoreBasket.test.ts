import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {DeliveryComparison} from '../../../../lib/pricing-service/src/delivery';
import {availableStoreBasket} from './availableStoreBasket';
import {deliveryRefreshDelay} from './pendingDeliveryPlan';
import {purchaseSnapshot,purchaseSummary} from './purchaseSummary';
import type {SerializedProject} from './pricingApi';
import {estimateHonoursStore} from './storeChoice';
const now=Date.parse('2026-10-28T22:00:00Z');
function comparison():DeliveryComparison{
 const order={store:'A',materialsGrosze:19899,deliveryGrosze:30800,deliveryMinimumGrosze:30800,totalGrosze:50699,source:'retailer' as const,quote:{costGrosze:30800,carrier:'Paleta',payment:'Przelew',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600_000).toISOString(),sourceUrl:'https://example.org/basket',destinationScope:'PL' as const,basis:'retailer_basket_national' as const,evidenceSha256:'a'.repeat(64)},lines:[{product:{id:'p',name:'Grunt',imageUrl:null},unit:'kg',packages:[{store:'A',offerId:'a',url:'https://example.org/product',count:1,packageSize:15,unitPriceGrosze:19899,lineCostGrosze:19899}]}]};
 return{mode:'shipping',method:'automatic',postalCode:'00-001',status:'partial',productCount:1,missingProductCount:3,best:null,lowerBound:null,alternatives:[],missingDeliveryStores:['A'],policies:[],availablePart:{store:'A',productCount:1,basket:{materialsGrosze:19899,deliveryGrosze:30800,totalGrosze:50699,lowerBoundGrosze:50699,stores:[order]}}};
}
test('available subset retains exact server amounts and expiry while remaining a partial purchase',()=>{
 const c=comparison(),before=JSON.stringify(c),basket=availableStoreBasket(c,true,'A',now);assert.ok(basket);assert.equal(basket.totalGrosze,50699);assert.equal(basket.deliveryGrosze,30800);assert.equal(c.best,null);assert.equal(JSON.stringify(c),before);assert.equal(deliveryRefreshDelay(c,true,now),600100);assert.equal(deliveryRefreshDelay(c,true,now+600200),5000);
});
test('available subset requires current chosen store, destination, consistent packs/gross and a fresh retailer quote',()=>{
 assert.equal(availableStoreBasket(comparison(),false,'A',now),null);assert.equal(availableStoreBasket(comparison(),true,'B',now),null);assert.equal(availableStoreBasket(comparison(),true,null,now),null);
 const mutations:((c:DeliveryComparison)=>void)[]=[c=>c.mode='pickup',c=>c.status='compared',c=>c.missingProductCount=0,c=>c.availablePart!.store='B',c=>c.availablePart!.productCount=2,c=>c.availablePart!.basket!.totalGrosze=19899,c=>c.availablePart!.basket!.stores[0].deliveryGrosze=0,c=>c.availablePart!.basket!.stores[0].source='unknown',c=>c.availablePart!.basket!.stores[0].quote!.expiresAt=new Date(now).toISOString(),c=>c.availablePart!.basket!.stores[0].quote!.checkedAt=new Date(now+5001).toISOString(),c=>c.availablePart!.basket!.stores[0].quote!.expiresAt=new Date(now+600001).toISOString(),c=>c.availablePart!.basket!.stores[0].quote!.costGrosze=0,c=>{const q=c.availablePart!.basket!.stores[0].quote!;q.destinationScope='postal_code';q.postalCode='42-209'},c=>c.availablePart!.basket!.stores[0].lines[0].packages[0].store='B',c=>c.availablePart!.basket!.stores[0].lines[0].packages[0].count=2,c=>c.availablePart!.basket!.stores[0].lines[0].packages[0].lineCostGrosze=1];
 for(const [i,mutate]of mutations.entries()){const c=comparison();mutate(c);assert.equal(availableStoreBasket(c,true,'A',now),null,'mutation '+i);}
 assert.equal(availableStoreBasket(comparison(),true,'A',now+600000),null);
});
test('small clock skew from the production response cannot hide a fresh quote or extend its actual expiry',()=>{
 const c=comparison(),q=c.availablePart!.basket!.stores[0].quote!;q.checkedAt=new Date(now+250).toISOString();q.expiresAt=new Date(now+600250).toISOString();assert.equal(availableStoreBasket(c,true,'A',now)?.totalGrosze,50699);assert.equal(availableStoreBasket(c,true,'A',now+600250),null);
});
test('overview may expose the known subset but never promote it to full total or another chosen retailer',()=>{
 const c=comparison(),data={stages:[{lines:[],unresolvedCount:3}],consolidated:{consolidatedTotalGrosze:19899,lines:[]},storeComparison:{stores:[],optimalByStore:[]},deliveryComparison:c}as unknown as SerializedProject;
 const snapshot=purchaseSnapshot(data,'A',now),summary=purchaseSummary(snapshot,now);assert.equal(summary.status,'partial');assert.ok('availablePart'in summary&&summary.availablePart);assert.equal('totalGrosze'in summary&&summary.totalGrosze,null);assert.equal('deliveryGrosze'in summary&&summary.deliveryGrosze,null);assert.equal('availablePart'in summary&&summary.availablePart?.totalGrosze,50699);assert.equal(purchaseSummary(snapshot,now+600001).status,'expired');
 assert.equal(estimateHonoursStore(data,'A'),true);c.availablePart!.basket!.stores[0].store='B';assert.equal(estimateHonoursStore(data,'A'),false);const mismatched=purchaseSummary(purchaseSnapshot(data,'A',now),now);assert.equal(mismatched.status,'partial');assert.equal('availablePart'in mismatched&&mismatched.availablePart,null);
});
