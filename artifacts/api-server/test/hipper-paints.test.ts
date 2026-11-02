import assert from 'node:assert/strict';
import test from 'node:test';
import recorded from './fixtures/hipper-paint.json' with {type:'json'};
import {HIPPER_PAINT_SOURCES} from '../src/lib/hipper-paints';
import {parseRetailPage} from '../src/lib/retail-pages';
import {quoteCertusoft} from '../src/lib/certusoft-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

// Recorded 2026-11-02 from the exact primary card and two anonymous baskets.
// source: https://hipper.pl/sniezka-barwy-natury-bialy-173-5l-farba-lateksowa-956234361
const fixture:any=recorded;
const source=HIPPER_PAINT_SOURCES[0],clone=<T,>(value:T):T=>structuredClone(value);
const page=(f:any)=>`<script>window.__INITIAL_STATE__=${JSON.stringify(f.state)};(function(){var s;}());</script>${f.dom??f.summary}`;
const card=(f:any)=>f.state.csAppWindowsUtils.csAppWindows.csB2BItemCard;
const basket=(count=1):DeliveredStoreBasket=>({store:'HIPPER',materialsGrosze:9999*count,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:source.ean,name:source.name,imageUrl:null},unit:'l',packages:[{offerId:source.id,count,packageSize:5,lineCostGrosze:9999*count,unitPriceGrosze:9999,store:'HIPPER',url:source.url}]}]});
function replay(count=1,change?:(f:any,step:number)=>void){
 let step=0;const calls:any[]=[];
 const fetcher:typeof fetch=async(input,init)=>{
  const url=new URL(String(input)),method=init?.method??'GET';assert.equal(url.origin,'https://hipper.pl');calls.push({path:url.pathname,method});
  if(method==='GET'&&url.pathname===new URL(source.url).pathname)return new Response(page(fixture.product));
  if(method==='GET'&&url.pathname==='/koszyk'){
   const current=++step,raw=fixture.carts[`count${count}step${current}`];assert(raw,'only the two observed cart reads are allowed');const f=clone(raw);change?.(f,current);return new Response(page(f));
  }
  assert.equal(method,'POST');assert.equal(url.pathname,'/csAPIServer_Hipper/invokeAction');
  const body=JSON.parse(String(init?.body));
  assert.ok(!/order|nextStep|anonymousUsrCartSave|isRegulationsAccepted|RName|SName|EMail|PostalCode/.test(String(init?.body)));
  if(body.actionIdent==='cartAdd'){
   assert.equal(body.row.csItemsId,956234361);assert.equal(body.row.csItemsUnitsId,956413761);assert.equal(body.row.quantityUnits,count);assert.equal(body.row.cUnitPrice,99.99);
  }else{assert.equal(body.actionIdent,'csNGOnCFB2BCartHeader');assert.equal(body.onCFDataFieldIdent,'csB2BPortalsDeliveryMethodsId');assert.equal(body.row.csB2BPortalsDeliveryMethodsId,2667017562);}
  return Response.json({commands:[]});
 };
 return {fetcher,calls};
}

test('HIPPER confirms the exact colour 173 and five-litre can with its native image and gross price',()=>{
 const observed=parseRetailPage(page(fixture.product),source,new Date());assert.equal(observed.ean,'5903973139188');assert.equal(observed.priceGrosze,9999);assert.equal(source.packageSize,5);assert.equal(source.unit,'l');assert.match(observed.imageUrl!,/^https:\/\/hipper\.pl\/api\/attachment\/get\//);assert(!observed.imageUrl!.includes(' '));
});

test('a reviewed paint can cannot be relabelled as one litre, another colour or another purchase unit',()=>{
 for(const changed of [{unit:'szt' as const,packageSize:1},{packageSize:1},{ean:'5903973139189'},{name:'Inna farba'},{retailerUnitId:956370273},{minimumPackages:2},{purchaseMultiple:2}])assert.throws(()=>parseRetailPage(page(fixture.product),{...source,...changed},new Date()),/retailer_unit_not_confirmed/);
 assert.throws(()=>parseRetailPage(page(fixture.product),{...source,skuIdentity:'other'},new Date()),/retailer_sku_source_not_reviewed/);
});

test('a changed native paint capacity, colour, finish or duplicate feature is rejected',()=>{
 for(const name of ['Pojemność','Symbol koloru','Marka','Kolekcja','Wykończenie','Rodzaj']){
  const f=clone(fixture.product),feature=card(f).dataSets.features.rows.find((r:any)=>r.featureDesc.trim()===name);assert(feature);feature.featureValue='other';assert.throws(()=>parseRetailPage(page(f),source,new Date()),/retailer_unit_not_confirmed/);
 }
 const f=clone(fixture.product);card(f).dataSets.features.rows.push(clone(card(f).dataSets.features.rows.find((r:any)=>r.featureDesc.trim()==='Pojemność')));assert.throws(()=>parseRetailPage(page(f),source,new Date()),/retailer_unit_not_confirmed/);
});

test('native identity, stock and gross consumer price remain independently checked for the paint',()=>{
 for(const mutate of [(r:any)=>r.EAN='0000000000000',(r:any)=>r.csItemsUnitsId++,(r:any)=>r.quantityUnits=5,(r:any)=>r.qStockAv=0,(r:any)=>r.cUnitPrice=1,(r:any)=>r.discount=10,(r:any)=>r.structuredData=r.structuredData.replace('PLN','EUR')]){
  const f=clone(fixture.product);mutate(card(f).dataSets.itemCard.rows[0]);assert.throws(()=>parseRetailPage(page(f),source,new Date()));
 }
});

test('one and two real paint cans retain the confirmed courier cost and final payable total',async()=>{
 for(const count of [1,2]){
  const r=replay(count),result=await quoteCertusoft(basket(count),r.fetcher);assert(result.quote);assert.equal(result.quote.costGrosze,1890);assert.equal(result.quote.carrier,'Kurier InPost');assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.postalCode,undefined);assert.equal(9999*count+result.quote.costGrosze,count===1?11889:21888);assert.equal(r.calls.length,5);
 }
});

test('the paint quote rejects changed final native units, quantities, line prices and payable total',async()=>{
 for(const mutate of [(ds:any)=>ds.csB2BCartPositions.rows[0].csItemsUnitsId++,(ds:any)=>ds.csB2BCartPositions.rows[0].quantityUnits=5,(ds:any)=>ds.csB2BCartPositions.rows[0].cUnitPriceADis=1,(ds:any)=>ds.csB2BCartHeader.rows[0].cGAmount=1]){
  const r=replay(1,(f,step)=>{if(step===2)mutate(f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets);});await assert.rejects(quoteCertusoft(basket(),r.fetcher),/basket_not_confirmed/);
 }
 const r=replay(1,(f,step)=>{if(step===2){const changed=f.summary.replace('118,89','118,88');assert.notEqual(changed,f.summary);f.summary=changed;}});await assert.rejects(quoteCertusoft(basket(),r.fetcher),/basket_not_confirmed/);
});
