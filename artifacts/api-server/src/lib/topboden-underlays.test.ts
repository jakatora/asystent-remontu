import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from '../../test/fixtures/topboden-optima.json' with {type:'json'};
import {TOPBODEN_UNDERLAY_SOURCES,confirmTopbodenUnderlaySource} from './topboden-underlays';
import {confirmTopbodenProduct} from './topboden-product';
import {readRetailSource} from './retail-pages';
import {createRetailerQuoter} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

function replay(change?:(value:any,url:URL)=>void){
 const calls:string[]=[];
 const fetcher:typeof fetch=async(input)=>{const url=new URL(String(input));calls.push(url.href);
  if(url.href==='https://api.topboden.pl/api/delivery'){const value=structuredClone(fixture.delivery);change?.(value,url);return Response.json(value);}
  const index=TOPBODEN_UNDERLAY_SOURCES.findIndex(s=>url.href===s.url||url.href==='https://api.topboden.pl/api/product/by-uuid/'+s.productUuid);assert(index>=0,'Unexpected external request');
  const row=fixture.products[index];if(url.origin==='https://api.topboden.pl'){const value=structuredClone(row.product);change?.(value,url);return Response.json(value);}
  return new Response(row.html,{headers:{'content-type':'text/html'}});
 };return{fetcher,calls};
}
test('two reviewed Optima variants import 10 m² pack prices, not the m² display price or an optional coupon',async()=>{
 for(const[index,source]of TOPBODEN_UNDERLAY_SOURCES.entries()){
  const r=replay(),observed=await readRetailSource(source,r.fetcher);assert.equal(observed.ean,source.ean);assert.equal(observed.priceGrosze,[15500,17500][index]);assert.equal(observed.availability,'in_stock');assert.equal(r.calls.length,2);assert.equal((observed as any).previousPriceGrosze,undefined);
  assert.equal(confirmTopbodenProduct(fixture.products[index].product,source,3).priceGrosze,[15500,17500][index]);
 }
});
test('changed reviewed identity, roll size or lot is rejected before any retailer request',async()=>{
 for(const source of TOPBODEN_UNDERLAY_SOURCES)for(const patch of [{packageSize:1},{ean:'5905167881798'},{productUuid:TOPBODEN_UNDERLAY_SOURCES.find(s=>s.id!==source.id)!.productUuid},{unit:'szt'},{apiPurchaseUnit:'szt.'},{purchaseMultiple:2},{minimumPackages:2},{url:source.url+'?other=1'},{brand:'Other'}]){
  const changed={...source,...patch};assert.throws(()=>confirmTopbodenUnderlaySource(changed),/package_not_confirmed/);await assert.rejects(readRetailSource(changed,async()=>{assert.fail('A changed roll must not contact the shop');}),/package_not_confirmed/);
 }
});
test('a changed native roll, stock, thickness, membrane, price or coupon cannot produce a trusted offer',()=>{
 const source=TOPBODEN_UNDERLAY_SOURCES[0];for(const change of [(p:any)=>p.units.orderUnit='szt.',(p:any)=>p.units.numerator=1,(p:any)=>p.units.priceListUnit='szt.',(p:any)=>p.price.grossPrice++,(p:any)=>p.price.packageGrossPrice++,(p:any)=>p.promotionCode.discount='30',(p:any)=>p.promotionCode.freeProductsMessage='gift',(p:any)=>p.ean='5905167881804',(p:any)=>p.data.logisticData.ean='5905167881804',(p:any)=>p.name+=' other',(p:any)=>p.technicalParameters.thickness='2',(p:any)=>p.technicalParameters.moisture_insulation='0',(p:any)=>p.baseUnitStock=20]){
  const product=structuredClone(fixture.products[0].product);change(product);assert.throws(()=>confirmTopbodenProduct(product,source,3));
 }
});
test('actual published TopBoden matrix prices one and three full rolls as a national tariff, without a postcode claim',async()=>{
 for(const basket of fixture.baskets){const r=replay(),result=await createRetailerQuoter(r.fetcher)(basket.order as unknown as DeliveredStoreBasket,basket.postcode);assert.ok('quote'in result);assert.equal(result.quote.costGrosze,basket.expectedCostGrosze);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.basis,'retailer_tariff_national');assert.equal(result.quote.postalCode,undefined);assert.equal(r.calls.length,3);}
});
test('unconfirmed current stock, price or courier remains unknown instead of becoming a free delivery',async()=>{
 const basket=fixture.baskets[2];for(const change of [(p:any)=>{if(p.uuid)p.baseUnitStock=20;},(p:any)=>{if(p.price)p.price.packageGrossPrice++;},(p:any)=>{if(Array.isArray(p))p.forEach(rate=>rate.type='PICKUP');}]){
  const result=await createRetailerQuoter(replay(change).fetcher)(basket.order as unknown as DeliveredStoreBasket,'30-001');assert.ok('reason'in result);assert.equal('quote'in result,false);
 }
});
