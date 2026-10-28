import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/bmb.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource,parseRetailPage} from '../src/lib/retail-pages';
import {readBmbProduct,confirmBmbBasket,confirmBmbDelivery,quoteBmb,readBmbCart} from '../src/lib/bmb';
import {createRetailerQuoter,retailerDeliveryCapabilities} from '../src/lib/retailer-delivery';
import {htmlElements,cleanHtml} from '../src/lib/retail-microdata';
import {classElements} from '../src/lib/prestashop-product';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
import {createRemontService} from '../src/shared-backend';
import {calculatorEngine} from '../../mobile/features/calculator/engine';
import {getJobById} from '../../mobile/features/content/registry';
import {toPricingStageInput} from '../../mobile/features/pricing/pricingApi';

const source=RETAIL_SOURCES.find(s=>s.id==='bmb-knauf-grundiermittel60-15kg')!;
const product=fixture.records.find(r=>r.context==='read'&&r.path.includes('grundiermittel'))!.body;
const cart=fixture.records.filter(r=>r.context==='quote:1'&&r.method==='GET'&&r.status===200).at(-1)!.body;
const order=(count=1):DeliveredStoreBasket=>({store:source.store,materialsGrosze:19899*count,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'retail-'+source.ean,name:source.name,imageUrl:source.imageUrl!},unit:'kg',packages:[{offerId:source.id,count,packageSize:15,unitPriceGrosze:19899}]}]});
function replay(context:string,mutate?:(body:string,index:number)=>string){
 const rows=fixture.records.filter(r=>r.context===context);let index=0;
 const fetcher:typeof fetch=async(input,init)=>{
  const r=rows[index],url=new URL(String(input));assert.ok(r,'unexpected request');assert.equal(url.origin,'https://bmbtechnologie.pl');assert.equal(url.pathname,r.path);assert.equal(init?.method??'GET',r.method);assert.equal(String(init?.body??''),r.requestBody);
  if(init?.method==='POST')assert.equal(String(init.body),context==='quote:2'?'add_product%5B5454%5D=2':'add_product%5B5454%5D=1');
  const body=mutate?.(r.body,index)??r.body;index++;
  return new Response(body,{status:r.status,headers:{'content-type':'text/html',...(r.location?{location:r.location}:{})}});
 };return{fetcher,done:()=>assert.equal(index,rows.length)};
}

test('BMB whole15kg bucket is bound to primary EAN, manufacturer, available23 pieces and actual cart gross198.99',async()=>{
 const r=replay('read'),observation=await readRetailSource(source,r.fetcher);r.done();assert.equal(observation.priceGrosze,19899);assert.equal(observation.stockPackages,23);assert.equal(observation.ean,'5901793357799');assert.equal(observation.imageUrl,source.imageUrl);
 assert.throws(()=>parseRetailPage(product,source,new Date()),/basket_required/);
 assert.throws(()=>readBmbProduct(product,{...source,ean:'5901793357065'}),/source_not_reviewed/);
 assert.throws(()=>readBmbProduct(product,{...source,packageSize:1}),/source_not_reviewed/);
});

test('BMB rejects recommendation identity, unknown or zero stock, changed lot and primary price/image mismatches',()=>{
 const info=classElements(product,'productCardMain__infoBlock')[0];
 const changes=[info.replace('5901793357799','0000000000000'),info.replace('23 szt.','Na zamówienie'),info.replace('23 szt.','0 szt.'),info.replace('data-min="1"','data-min="2"'),info.replace('data-qip="1"','data-qip="0.5"'),info.replace('data-max="23"','data-max="24"'),info.replace('198,99','0,00')];
 for(const changed of changes)assert.throws(()=>readBmbProduct(product.replace(info,changed),source));
 assert.throws(()=>readBmbProduct(product.replaceAll('product-5454.png','other.png'),source));
 assert.throws(()=>readBmbProduct('<script>'+product+'</script>',source));
});

test('BMB national basket quote includes mandatory98PLN pallet in addition to210PLN carrier for one/two buckets',async()=>{
 for(const count of [1,2]){const r=replay('quote:'+count),result=await quoteBmb(order(count),r.fetcher);r.done();assert.ok('quote'in result);assert.equal(result.quote.costGrosze,30800);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.postalCode,undefined);assert.match(result.quote.carrier,/paleta KN-WO/);assert.equal(result.quote.payment,'Przelewy24.pl');}
 const detail=confirmBmbDelivery(cart,source,1,19899);assert.equal(detail.totalGrosze,50699);assert.equal(detail.palletGrosze,9800);assert.equal(detail.carrierGrosze,21000);
});

test('BMB primary cart ignores duplicate header preview and refuses missing gross labels, changed quantity, contamination and totals',()=>{
 const row=classElements(cart,'order_product_row')[0];
 assert.equal(confirmBmbBasket('<div class="header-preview">'+row+'</div>'+cart,source,1,19899).materialsGrosze,19899);
 for(const changed of [row.replace('value="1"','value="2"'),row.replace('Cena brutto','Cena netto'),row.replace('5901793357799','0000000000000'),row.replaceAll('198,99','199,99')])assert.throws(()=>confirmBmbBasket(cart.replace(row,changed),source,1,19899));
 assert.throws(()=>confirmBmbBasket(cart.replace(row,row+row),source,1,19899));
 const total=classElements(cart,'order-sum-with-discount-value')[0];assert.throws(()=>confirmBmbBasket(cart.replace(total,total.replace('198,99','1,00')),source,1,19899));
});

test('BMB does not omit pallet charges or accept provisional/changed totals, pickup, financing or another country',()=>{
 const pallet=classElements(cart,'delivery_tile_pallet_info')[0],sum=classElements(cart,'order_price_summ')[0];
 const delivery=htmlElements(cleanHtml(cart),(a,t)=>t==='form'&&a.id==='delivery')[0],payment=htmlElements(cleanHtml(cart),(a,t)=>t==='form'&&a.id==='payment')[0];
 for(const [index,bad] of [cart.replace(pallet,''),cart.replace(pallet,pallet.replace('98zł','0zł')),cart.replace(sum,sum.replace('506,99','408,99')),cart.replace(sum,sum.replace('506,99','296,99')),cart.replace(delivery,delivery.replaceAll('Wysyłka paletowa','Odbiór osobisty')),cart.replace(payment,payment.replaceAll('Przelewy24.pl','Siemens Finance')),cart.replace('Polska -','Niemcy -'),cart.replace(payment,payment.replace('+0,00','+1,00'))].entries())assert.throws(()=>confirmBmbDelivery(bad,source,1,19899),undefined,'mutation '+index);
});

test('BMB fresh basket cannot submit customer fields or quote a changed price, fractional count or insufficient stock',async()=>{
 for(const count of [0,1.5,NaN,Infinity])await assert.rejects(readBmbCart(source,count,async()=>{throw Error('must not fetch')}),/invalid_basket/);
 const fetcher:typeof fetch=async()=>new Response(product,{headers:{'content-type':'text/html'}});
 await assert.rejects(readBmbCart(source,24,fetcher),/insufficient_stock/);
 await assert.rejects(readBmbCart(source,1,fetcher,19800),/price_changed/);
 assert.ok(retailerDeliveryCapabilities().automaticStores.includes(source.store));
 const r=replay('quote:1'),quoter=createRetailerQuoter(r.fetcher),result=await quoter(order(),'42-209');r.done();assert.ok('quote'in result);assert.equal(result.quote.costGrosze,30800);
 const wrong={...order(),store:'Another retailer'};await assert.rejects(quoteBmb(wrong,r.fetcher),/invalid_basket/);
});

test('calculator to Express HTTP sums two rooms of concentrate before buying one15kg bucket and charging one mandatory pallet',async()=>{
 const read=replay('read'),observation=await readRetailSource(source,read.fetcher);read.done();
 const quote=replay('quote:1'),service=createRemontService({initialObservations:[observation],background:false,basketQuoter:createRetailerQuoter(quote.fetcher)}),app=express();app.use(express.json());app.use(service.router);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const stage=(choice=3)=>{const calc=calculatorEngine.calculate(getJobById('wall-plastering')!,{wallArea:10,plasterThickness:15,plasterSystem:2,plasterPrimerChoice:choice,plasterMeshArea:0,plasterCornerCount:0}),s=toPricingStageInput(calc);return{...s,materials:s.materials.filter(l=>l.material.id==='plaster-primer')};};
 const post=async(jobs:any[])=>{const r=await fetch(`http://127.0.0.1:${(server.address()as any).port}/pricing/project`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs,options:{store:source.store,delivery:{mode:'shipping',postalCode:'00-001'}}})});assert.equal(r.status,200);return r.json();};
 try{
  const result=await post([stage(),stage()]);assert.equal(result.consolidated.lines.length,1);assert.equal(result.consolidated.lines[0].totalQuantity,0.825);assert.equal(result.consolidated.lines[0].packagesNeeded,1);assert.equal(result.deliveryComparison.best.materialsGrosze,19899);assert.equal(result.deliveryComparison.best.deliveryGrosze,30800);assert.equal(result.deliveryComparison.best.totalGrosze,50699);quote.done();
  const mixed=await post([stage(),stage(1)]);assert.equal(mixed.deliveryComparison.best,null);assert.equal(mixed.deliveryComparison.missingProductCount,1);assert.equal(mixed.stages[1].lines[0].resolved,false);
 }finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
