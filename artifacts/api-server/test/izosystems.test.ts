import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/izosystems.json' with {type:'json'};
import seed from '../../../deploy/shared-backend/verified-offers.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource,type RetailObservation} from '../src/lib/retail-pages';
import {readIzosystemsProduct,readIzosystemsState} from '../src/lib/izosystems-product';
import {quoteIzosystems} from '../src/lib/izosystems-delivery';
import {AnonymousShop} from '../src/lib/retailer-http';
import {htmlElements,htmlAttributes} from '../src/lib/retail-microdata';
import {createRemontService} from '../src/shared-backend';
const source=RETAIL_SOURCES.find(s=>s.id==='izosystems-sws-inside90-30m')!;
const productHtml=fixture.records.find(r=>r.context==='read')!.response as string;
function replay(context:string,mutate?:(value:any,index:number)=>any){const rows=fixture.records.filter(r=>r.context===context);let index=0;const fetcher:typeof fetch=async(input,init)=>{const u=new URL(String(input)),r=rows[index];assert.ok(r,'unexpected request');assert.equal(u.origin,'https://izosystems.pl');assert.equal(u.pathname+u.search,r.path);assert.equal(init?.method??'GET',r.method);assert.equal(new Headers(init?.headers).get('User-Agent'),'AsystentRemontu/1.0');assert.equal(new Headers(init?.headers).get('Accept'),'text/html');assert.equal(String(init?.body??''),r.requestBody??'');let response=structuredClone(r.response);response=mutate?.(response,index)??response;index++;const headers={'Content-Type':r.contentType??'text/html',...('redirectTarget'in r&&r.redirectTarget?{Location:r.redirectTarget}:{})};return typeof response==='string'?new Response(response,{status:r.status,headers}):Response.json(response,{status:r.status,headers});};return{fetcher,done:()=>assert.equal(index,rows.length)};}
const order=(count=1)=>({store:'Izosystems',materialsGrosze:count*14500,lines:[{productId:'retail-'+source.ean,productName:source.name,quantity:count*30,unit:'m',packages:[{offerId:source.id,count,packageSize:30,unitPriceGrosze:14500}]}]});
function patchProduct(html:string,patch:object){const node=htmlElements(html,a=>a.id==='product-details')[0],tag=node.match(/^<[^>]+>/)![0],data=JSON.parse(htmlAttributes(tag)['data-product']);Object.assign(data,patch);return html.replace(tag,'<div id="product-details" data-product="'+JSON.stringify(data).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">');}
test('primary barcode, full gross30m roll and current94-roll stock are bound together; misleading unit price is unused',async()=>{
 const r=replay('read'),observation=await readRetailSource(source,r.fetcher);r.done();assert.equal(observation.priceGrosze,14500);assert.equal(observation.stockPackages,94);assert.ok(observation.imageUrl?.includes('/10544-large_default/'));assert.ok(!JSON.stringify(observation).includes('token'));
 for(const patch of [{ean:'5411183151185'},{packageSize:1},{unit:'szt'},{apiPurchaseUnit:'m'},{productId:1789},{retailerSku:'OTHER'},{brand:'Other'}])assert.throws(()=>readIzosystemsProduct(productHtml,{...source,...patch}));
 const changed=patchProduct(productHtml,{quantity:1,quantity_all_versions:1,quantity_label:'Przedmiot'}),detail=htmlElements(changed,a=>a.id==='product-details')[0];
 const lastRoll=changed.replace(detail,detail.match(/^<[^>]+>/)![0]+'W magazynie 1 Przedmiot</div>');assert.equal(readIzosystemsProduct(lastRoll,source).maxPackages,1);
});
test('unavailable stock, conditional prices, a primaryEAN conflict and old70mm gallery images cannot become a current cheap roll',()=>{
 for(const patch of [{quantity:0},{allow_oosp:1},{minimal_quantity:2},{price:117.89},{specific_prices:[{reduction:0.2}]},{customer_group_discount:10},{id_product_attribute:1}])assert.throws(()=>readIzosystemsProduct(patchProduct(productHtml,patch),source));
 for(const html of [productHtml.replace('>5411183151178<','>5411183151185<'),productHtml.replace('Brutto','Netto'),productHtml.replaceAll('/10544-large_default/','/6171-large_default/')])assert.throws(()=>readIzosystemsProduct(html,source));
 const related='<script type="application/ld+json">'+JSON.stringify({'@type':'Product',gtin13:source.ean,offers:{price:1,priceCurrency:'PLN',availability:'https://schema.org/InStock'}})+'</script>';
 assert.throws(()=>readIzosystemsProduct(productHtml.replace('>5411183151178<','>0000000000000<')+related,source));
});
test('native postcode quotes confirm15PLN for one/two rolls and free home delivery for three, after the provisional zero',async()=>{
 for(const[count,code,shipping]of [[1,'00-001',1500],[2,'42-209',1500],[3,'00-001',0]]as const){const r=replay('quote:'+count),result=await quoteIzosystems(order(count),code,r.fetcher);r.done();assert.ok('quote'in result);assert.equal(result.quote.costGrosze,shipping);assert.equal(result.quote.postalCode,code);assert.equal(result.quote.destinationScope,'postal_code');assert.equal(result.quote.carrier,'DHL, GLS');assert.equal(result.quote.payment,'Przelew bankowy');}
});
test('cart contamination, fake free shipping, locker relabelling, changed totals and transfer surcharges are rejected',async()=>{
 const changes=[(v:any,i:number)=>{if(i===1)v.cart.products[0].ean13='0000000000000';return v},(v:any,i:number)=>{if(i===4)v.html=v.html.replace('DHL, GLS','Paczkomat InPost');return v},(v:any,i:number)=>{if(i===4)v.html=v.html.replaceAll('15,00','0,00');return v},(v:any,i:number)=>{if(i===6)v.html=v.html.replaceAll('160,00','159,00');return v},(v:any,i:number)=>{if(i===7)v.html=v.html.replace('value="zł0"','value="zł1"');return v},(v:any,i:number)=>{if(i===8){const p=readIzosystemsState(v);p.cart.products.push(p.cart.products[0]);return'<script>var prestashop = '+JSON.stringify(p)+';</script>';}return v}];
 for(const change of changes)await assert.rejects(quoteIzosystems(order(),'00-001',replay('quote:1',change).fetcher));
 await assert.rejects(quoteIzosystems(order(95),'00-001',replay('quote:1').fetcher),/insufficient_stock/);
 await assert.rejects(quoteIzosystems({...order(),materialsGrosze:14400,lines:[{...order().lines[0],packages:[{...order().lines[0].packages[0],unitPriceGrosze:14400}]}]},'00-001',replay('quote:1').fetcher),/price_changed/);
});
test('ambiguous checkout endpoint cannot accept address/customer/order/payment methods or extra fields',async()=>{
 const fetcher:typeof fetch=async()=>{throw Error('forbidden request reached network')},client=new AnonymousShop('https://izosystems.pl',fetcher,AbortSignal.timeout(1000));
 for(const[action,args]of [['saveAddress',{token:'a'.repeat(32)}],['add',{token:'a'.repeat(32),productId:1783,count:1,email:'private@example.test'}],['add',{token:'a'.repeat(32),productId:1789,count:1}],['carriers',{token:'a'.repeat(32),postalCode:'00-001',city:'X'}],['carrier',{token:'a'.repeat(32),addressId:'1];order'}],['payments',{token:'a'.repeat(32),submit:true}]]as const)await assert.rejects((client as any).izosystems(action,args),/invalid_cart_action/);
 await assert.rejects(new AnonymousShop('https://other.example',fetcher,AbortSignal.timeout(1000)).izosystems('payments',{token:'a'.repeat(32)}),/invalid_cart_action/);
});
test('actual Express HTTP combines explicit chosen tape purchases and exposes unconfirmed local collection',async(t)=>{
 t.mock.timers.enable({apis:['Date'],now:Date.parse(fixture.checkedAt)});
 const r=replay('quote:1'),service=createRemontService({initialObservations:seed.filter(o=>o.sourceId===source.id)as RetailObservation[],background:false,basketQuoter:(b,p)=>quoteIzosystems(b,p,r.fetcher)}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const jobs=[12,14].map(quantity=>({jobId:'explicit-sws-selected-purchase',materials:[{material:{id:'chosen-sws',ean:source.ean,name:source.name,unit:'m',category:'window-tape'},quantity}]}));
 try{const request=async(mode:string,store='Izosystems')=>{const response=await fetch(`http://127.0.0.1:${(server.address()as any).port}/pricing/project`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs,options:{store,delivery:{mode,postalCode:'00-001',allowSeparateOrders:false}}})});assert.equal(response.status,200);return response.json();};const result=await request('shipping');assert.equal(result.consolidated.lines[0].totalQuantity,26);assert.equal(result.consolidated.lines[0].packagesNeeded,1);assert.equal(result.deliveryComparison.best.materialsGrosze,14500);assert.equal(result.deliveryComparison.best.deliveryGrosze,1500);assert.equal(result.deliveryComparison.best.totalGrosze,16000);r.done();const pickup=await request('pickup');assert.equal(pickup.deliveryComparison.best,null);const absent=await request('shipping','WinBud');assert.equal(absent.deliveryComparison.best,null);assert.equal(absent.deliveryComparison.missingProductCount,2);}
 finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
