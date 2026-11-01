import assert from 'node:assert/strict';
import { test } from 'node:test';
import { confirmedBasketOptions, confirmedDeliveredBasket, basketOrderCount, basketForChoice, deliveredBasketKey } from './basketOptions';
import { deliveryRefreshDelay } from './pendingDeliveryPlan';
import { purchaseSnapshot, purchaseSummary } from './purchaseSummary';
import { purchaseListText } from './purchaseListText';
import type { DeliveredBasket, DeliveryComparison, DeliveryQuote } from '../../../../lib/pricing-service/src/delivery';
import type { SerializedProject } from './pricingApi';
const now=Date.parse('2026-11-01T13:00:00Z'),settings={mode:'shipping' as const,postalCode:'30-001',allowSeparateOrders:true};
function quote(costGrosze:number):DeliveryQuote{return{costGrosze,carrier:'Courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'postal_code',postalCode:'30-001',basis:'retailer_basket_postcode',evidenceSha256:'a'.repeat(64)};}
function basket(stores:Array<[string,number,number]>):DeliveredBasket{
 const orders=stores.map(([store,materials,shipping])=>({store,materialsGrosze:materials,deliveryGrosze:shipping,totalGrosze:materials+shipping,deliveryMinimumGrosze:shipping,source:'retailer' as const,quote:quote(shipping),lines:[{product:{id:store+'-product',name:store+' product',imageUrl:null},unit:'kg',packages:[{offerId:store+'-offer',store,count:1,packageSize:5,unitPriceGrosze:materials,lineCostGrosze:materials,url:'https://example.org/'+store}]}]}));
 const materials=orders.reduce((n,o)=>n+o.materialsGrosze,0),shipping=orders.reduce((n,o)=>n+o.deliveryGrosze,0);return{stores:orders,materialsGrosze:materials,deliveryGrosze:shipping,totalGrosze:materials+shipping,lowerBoundGrosze:materials+shipping};
}
function comparison():DeliveryComparison{return{mode:'shipping',method:'automatic',postalCode:'30-001',allowSeparateOrders:true,status:'compared',productCount:2,missingProductCount:0,best:basket([['A',900,100],['B',600,100]]),cheapestSingleStore:basket([['C',1600,300]]),lowerBound:null,alternatives:[],missingDeliveryStores:[],policies:[]};}

test('one-store convenience uses exact gross totals without altering the lowest basket or filtering the API response',()=>{
 const c=comparison(),before=JSON.stringify(c),o=confirmedBasketOptions(c,settings,null,now)!;assert.equal(o.lowest.totalGrosze,1700);assert.equal(o.singleStore!.totalGrosze,1900);assert.equal(o.extraGrosze,200);assert.equal(o.alreadySingleStore,false);assert.equal(basketForChoice(c,'single_store',now),c.cheapestSingleStore);assert.equal(JSON.stringify(c),before);assert.notEqual(deliveredBasketKey(o.lowest),deliveredBasketKey(o.singleStore!));
});
test('an already cheapest one-store basket is one option and equal-price convenience has zero premium',()=>{
 const c=comparison();c.cheapestSingleStore!.materialsGrosze-=200;c.cheapestSingleStore!.totalGrosze!-=200;c.cheapestSingleStore!.stores[0].materialsGrosze-=200;c.cheapestSingleStore!.stores[0].totalGrosze!-=200;c.cheapestSingleStore!.stores[0].lines[0].packages[0].lineCostGrosze-=200;c.cheapestSingleStore!.stores[0].lines[0].packages[0].unitPriceGrosze-=200;
 assert.equal(confirmedBasketOptions(c,settings,null,now)!.extraGrosze,0);c.best=c.cheapestSingleStore!;assert.equal(confirmedBasketOptions(c,settings,null,now)!.alreadySingleStore,true);assert.equal(confirmedBasketOptions(c,settings,null,now)!.singleStore,c.best);
});
test('missing one-store confirmation remains unknown; a compatible older API can provide a real alternative',()=>{
 const c=comparison(),single=c.cheapestSingleStore!;c.cheapestSingleStore=null;c.alternatives=[single];assert.equal(confirmedBasketOptions(c,settings,null,now)!.singleStore,null);delete c.cheapestSingleStore;assert.equal(confirmedBasketOptions(c,settings,null,now)!.singleStore,single);
});
test('stale destination, selected retailer, incomplete renovation and different shipping options cannot select a full one-store basket',()=>{
 const c=comparison();for(const patch of [{postalCode:'00-001'},{mode:'pickup' as const},{allowSeparateOrders:false}])assert.equal(confirmedBasketOptions(c,{...settings,...patch},null,now),null);
 assert.equal(confirmedBasketOptions(c,settings,'C',now),null);for(const patch of [{missingProductCount:1},{status:'partial' as const},{method:'manual' as const}])assert.equal(confirmedBasketOptions({...c,...patch},settings,null,now),null);
});
test('expired, mismatched, forged or arithmetically inconsistent single-store amounts never become payable choices',()=>{
 for(const mutate of [(b:DeliveredBasket)=>{b.totalGrosze!++;},(b:DeliveredBasket)=>{b.stores[0].quote!.postalCode='00-001';},(b:DeliveredBasket)=>{b.stores[0].quote!.expiresAt=new Date(now).toISOString();},(b:DeliveredBasket)=>{b.stores[0].quote!.evidenceSha256='invalid';},(b:DeliveredBasket)=>{b.stores[0].lines[0].packages[0].lineCostGrosze--;},(b:DeliveredBasket)=>{b.stores[0].deliveryGrosze=null;}]){const c=comparison();mutate(c.cheapestSingleStore!);assert.equal(confirmedBasketOptions(c,settings,null,now)!.singleStore,null);assert.equal(basketForChoice(c,'single_store',now),null);}
});
test('native rounding and already applied merchant discounts remain in materials and in the chosen shopping plan',()=>{
 const b=basket([['C',1600,300]]);b.stores[0].quote!.materialsRoundingGrosze=1;b.stores[0].materialsGrosze++;b.stores[0].totalGrosze!++;b.materialsGrosze++;b.totalGrosze!++;assert.equal(confirmedDeliveredBasket(b,'30-001',now),true);
 const text=purchaseListText({basket:b,mode:'shipping',postalCode:'30-001'},'pl',now)!;assert.match(text,/19,01/);assert.match(text,/Zaokrąglenie cen w koszyku/);b.stores[0].quote!.materialsRoundingGrosze=2;assert.equal(confirmedDeliveredBasket(b,'30-001',now),false);
 const discounted=basket([['C',1400,300]]);discounted.stores[0].quote!.cartPricing={currency:'PLN',baseMaterialsGrosze:1600,materialsGrosze:1400,discountGrosze:200,lines:[{offerId:'C-offer',count:1,baseUnitPriceGrosze:1600,unitPriceGrosze:1400,lineCostGrosze:1400}]};assert.equal(confirmedDeliveredBasket(discounted,'30-001',now),true);
});
test('one store with several quoted orders retains both shipping charges and is not represented as one delivery',()=>{
 const b=basket([['C',1600,300]]),s=b.stores[0],pack=s.lines[0].packages[0];s.quote!.orders=[100,200].map((fee,i)=>({materialsGrosze:800,quote:quote(fee),lines:[{...s.lines[0],packages:[{...pack,offerId:'C-'+i,unitPriceGrosze:800,lineCostGrosze:800}]}]}));assert.equal(confirmedDeliveredBasket(b,'30-001',now),true);assert.equal(basketOrderCount(b),2);
 const text=purchaseListText({basket:b,mode:'shipping',postalCode:'30-001'},'pl',now)!;assert.match(text,/Zamówienie 1 z 2/);assert.match(text,/Zamówienie 2 z 2/);s.quote!.orders[0].quote.expiresAt=new Date(now).toISOString();assert.equal(confirmedDeliveredBasket(b,'30-001',now),false);
});
test('the project summary and copied list follow the one-store choice while the API lowest basket stays unchanged',()=>{
 const c=comparison(),data={deliveryComparison:c,stages:[{lines:[],unresolvedCount:0}],consolidated:{lines:[],consolidatedTotalGrosze:0}} as unknown as SerializedProject,before=JSON.stringify(data);
 const summary=purchaseSummary(purchaseSnapshot(data,null,now,'single_store'),now);assert.equal(summary.status,'complete');if(summary.status!=='complete')throw Error('not complete');assert.equal(summary.totalGrosze,1900);assert.equal(summary.basketChoice,'single_store');assert.deepEqual(summary.products,['C product']);assert.deepEqual(summary.storeSteps.map(s=>s.store),['C']);assert.equal(c.best!.totalGrosze,1700);assert.equal(JSON.stringify(data),before);
 const text=purchaseListText({basket:basketForChoice(c,'single_store',now)!,mode:'shipping',postalCode:'30-001'},'pl',now)!;assert.match(text,/19,00/);assert.match(text,/C product/);assert.ok(!text.includes('A product'));
});
test('an earlier-expiring one-store quote refreshes the comparison and expires its selected project summary',()=>{
 const c=comparison();c.cheapestSingleStore!.stores[0].quote!.expiresAt=new Date(now+1000).toISOString();assert.equal(deliveryRefreshDelay(c,true,now),1100);
 const data={deliveryComparison:c,stages:[],consolidated:{lines:[],consolidatedTotalGrosze:0}} as unknown as SerializedProject,snapshot=purchaseSnapshot(data,null,now,'single_store');assert.equal(purchaseSummary(snapshot,now+1000).status,'expired');assert.equal(confirmedBasketOptions(c,settings,null,now+1000)!.singleStore,null);
});

function surplusComparison(){
 const c=comparison(),base=basket([['A',18312,5000]]),order=base.stores[0],pack=order.lines[0].packages[0];order.lines[0].unit='m';Object.assign(pack,{count:8,packageSize:30,unitPriceGrosze:2289,lineCostGrosze:18312});
 const proposed=structuredClone(base),next=proposed.stores[0];Object.assign(next.lines[0].packages[0],{count:9,lineCostGrosze:20601});Object.assign(next,{materialsGrosze:20601,deliveryGrosze:0,totalGrosze:20601,deliveryMinimumGrosze:0});next.quote!.costGrosze=0;Object.assign(proposed,{materialsGrosze:20601,deliveryGrosze:0,totalGrosze:20601,lowerBoundGrosze:20601});
 Object.assign(c,{best:base,cheapestSingleStore:base,productCount:1,allowExtraPackages:true,extraPackageOption:{basket:proposed,savingGrosze:2711}});return c;
}

test('surplus is an explicit third choice even when the standard basket already uses one store',()=>{
 const c=surplusComparison(),before=JSON.stringify(c),options=confirmedBasketOptions(c,settings,null,now)!;
 assert.equal(options.alreadySingleStore,true);assert.equal(options.extraPackages!.savingGrosze,2711);assert.equal(options.extraPackages!.additions[0].extraPackages,1);
 assert.equal(basketForChoice(c,'lowest',now)!.totalGrosze,23312);assert.equal(basketForChoice(c,'extra_packages',now)!.totalGrosze,20601);assert.equal(JSON.stringify(c),before);
 assert.equal(confirmedBasketOptions(c,{...settings,allowExtraPackages:false},null,now)!.extraPackages,null);
 assert.ok(confirmedBasketOptions(c,settings,'A',now)!.extraPackages);assert.equal(confirmedBasketOptions(c,settings,'B',now),null);
});

test('surplus choice drives the project summary and copied nine-pack plan without rewriting standard demand',()=>{
 const c=surplusComparison(),data={deliveryComparison:c,stages:[{lines:[],unresolvedCount:0}],consolidated:{lines:[],consolidatedTotalGrosze:0}}as unknown as SerializedProject,before=JSON.stringify(data);
 const summary=purchaseSummary(purchaseSnapshot(data,null,now,'extra_packages'),now);assert.equal(summary.status,'complete');if(summary.status!=='complete')throw Error('not complete');
 assert.equal(summary.totalGrosze,20601);assert.equal(summary.basketChoice,'extra_packages');assert.deepEqual(summary.products,['A product']);assert.equal(c.best!.totalGrosze,23312);
 const text=purchaseListText({basket:c.extraPackageOption!.basket,extraPackageBaseline:c.best!,mode:'shipping',postalCode:'30-001'},'pl',now)!;
 assert.match(text,/Wybrany wariant: dodatkowe opakowania/);assert.match(text,/27,11/);assert.match(text,/233,12/);assert.match(text,/206,01/);assert.match(text,/8 → 9/);assert.match(text,/1 × 30 m/);assert.equal(JSON.stringify(data),before);
});

test('a forged saving, changed SKU, insufficient quote or expired extra option cannot be selected',()=>{
 for(const mutate of [(c:DeliveryComparison)=>{c.extraPackageOption!.savingGrosze++;},(c:DeliveryComparison)=>{c.extraPackageOption!.basket.stores[0].lines[0].packages[0].offerId='other';},
  (c:DeliveryComparison)=>{c.extraPackageOption!.basket.stores[0].deliveryGrosze=null;},(c:DeliveryComparison)=>{c.extraPackageOption!.basket.stores[0].quote!.expiresAt=new Date(now).toISOString();},
  (c:DeliveryComparison)=>{c.allowExtraPackages=false;}]){const c=surplusComparison();mutate(c);assert.equal(confirmedBasketOptions(c,settings,null,now)!.extraPackages,null);assert.equal(basketForChoice(c,'extra_packages',now),null);assert.equal(basketForChoice(c,'lowest',now),c.best);}
});

test('an earlier extra-pack expiry schedules a refresh and expires its selected project summary',()=>{
 const c=surplusComparison();c.extraPackageOption!.basket.stores[0].quote!.expiresAt=new Date(now+1000).toISOString();assert.equal(deliveryRefreshDelay(c,true,now),1100);
 const data={deliveryComparison:c,stages:[],consolidated:{lines:[],consolidatedTotalGrosze:0}}as unknown as SerializedProject,snapshot=purchaseSnapshot(data,null,now,'extra_packages');assert.equal(purchaseSummary(snapshot,now+1000).status,'expired');assert.equal(basketForChoice(c,'extra_packages',now+1000),null);
});

test('copy cannot silently drop a stale or unrelated surplus explanation while retaining a payable extra basket',()=>{
 const c=surplusComparison(),input={basket:c.extraPackageOption!.basket,extraPackageBaseline:c.best!,mode:'shipping' as const,postalCode:'30-001'};
 c.best!.stores[0].quote!.expiresAt=new Date(now).toISOString();assert.equal(purchaseListText(input,'pl',now),null);
 const fresh=surplusComparison();fresh.extraPackageOption!.basket.stores[0].lines[0].packages[0].offerId='other';assert.equal(purchaseListText({...input,basket:fresh.extraPackageOption!.basket,extraPackageBaseline:fresh.best!},'pl',now),null);
});
