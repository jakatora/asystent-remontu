import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/aks-cables.json' with {type:'json'};
import {AKS_CABLE_SOURCES,isReviewedAksCableSource} from '../src/lib/aks-cables';
import {parseRetailPage} from '../src/lib/retail-pages';
import {quoteAbud} from '../src/lib/abud-delivery';
import {quoteCertusoft} from '../src/lib/certusoft-delivery';
import {createRemontService} from '../src/shared-backend';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const clone=<T,>(value:T):T=>structuredClone(value),sources=AKS_CABLE_SOURCES;
const page=(id:string)=>fixture.pages.find(p=>p.sourceId===id)!.html;
function abudOrder(row:(typeof fixture.abud)[number]):DeliveredStoreBasket{
 return{store:'ABUD',materialsGrosze:Math.round(row.cart.basket.worth*100),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:row.cart.basket.products.map(p=>{const s=sources.find(s=>s.store==='ABUD'&&String(s.productId)===p.id)!;return{product:{id:'remont-'+s.ean,name:s.name,imageUrl:s.imageUrl},unit:s.unit,packages:[{offerId:s.id,store:s.store,url:s.url,packageSize:s.packageSize,count:p.count,unitPriceGrosze:Math.round(Number(p.prices.gros)*100),lineCostGrosze:Math.round(Number(p.prices.worth_gros)*100)}]};})};
}
function abudNetwork(row:(typeof fixture.abud)[number],mutate?:(kind:string,data:any)=>void):typeof fetch{
 const adds:number[][]=[];
 return async(input,init)=>{const u=new URL(String(input));assert.equal(u.origin,'https://www.abud.pl');const s=sources.find(s=>s.store==='ABUD'&&new URL(s.url).pathname===u.pathname);
  if(s){assert.equal(init?.method??'GET','GET');return new Response(page(s.id),{headers:{'set-cookie':'aksCart=fixture; Path=/; Secure'}});}
  if(u.pathname==='/ajax/client-new.php'){assert.equal(u.searchParams.get('zipcode'),row.postalCode);return Response.json(clone(row.destination));}
  if(u.pathname==='/basketchange.php'){assert.equal(init?.method,'POST');const form=new URLSearchParams(String(init?.body));assert.deepEqual([...form.keys()].sort(),['getAjax','mode','number','product','size']);assert.equal(form.get('mode'),'1');assert.equal(form.get('size'),'onesize');adds.push([Number(form.get('product')),Number(form.get('number'))]);assert.ok(row.entries.some(([id,count])=>id===Number(form.get('product'))&&count===Number(form.get('number'))));const data=clone(row.cart);mutate?.('cart',data);return Response.json(data);}
  assert.equal(u.pathname,'/graphql/v1/');assert.equal(init?.method,'POST');assert.match(JSON.parse(String(init?.body)).query,/mode: basket/);assert.deepEqual(adds.sort((a,b)=>a[0]-b[0]),clone(row.entries).sort((a,b)=>a[0]-b[0]));const data=clone(row.shipping);mutate?.('shipping',data);return Response.json(data);
 };
}
function hipperNetwork(mutate?:(index:number,body:string)=>string):typeof fetch{
 let cursor=0;
 return async(input,init)=>{const expected=fixture.hipper.events[cursor],index=cursor++;assert.ok(expected,'Unexpected native request');assert.equal(String(input),expected.url);assert.equal(init?.method??'GET',expected.method);if(expected.requestBody)assert.deepEqual(JSON.parse(String(init?.body)),expected.requestBody);return new Response(mutate?mutate(index,expected.body):expected.body,{status:expected.status,headers:{'content-type':expected.method==='POST'?'application/json':'text/html'}});};
}

test('four manufacturer-coded rolls have five exact current offers; op./szt. prices are full rolls, not metres',()=>{
 assert.equal(sources.length,5);assert.equal(new Set(sources.map(s=>s.ean)).size,4);assert.ok(sources.every(s=>isReviewedAksCableSource(s)&&s.unit==='mb'&&s.pickupRequiresConfirmation&&!['5904617573771','5904617573764'].includes(s.ean)));
 const prices=[2890,41360,19270,63090,18900];for(const [i,s]of sources.entries()){const o=parseRetailPage(page(s.id),s,new Date());assert.equal(o.priceGrosze,prices[i]);assert.equal(o.ean,s.ean);assert.equal(o.availability,'in_stock');assert.ok(o.imageUrl);}
 assert.deepEqual(sources.map(s=>[s.packageSize,s.apiPurchaseUnit]),[[5,'szt.'],[100,'op.'],[25,'op.'],[100,'op.'],[25,'szt']]);
});

test('another length, cross-section, legacy GTIN or retailer unit cannot reuse a cable offer',()=>{
 for(const s of sources)for(const patch of[{packageSize:1},{packageSize:1000},{unit:'szt',packageSize:1},{ean:'5904617573771'},{productId:1},{variant:['3x4','100m']},{apiPurchaseUnit:'mb'},{purchaseMultiple:2}])assert.throws(()=>parseRetailPage(page(s.id),{...s,...patch},new Date()),JSON.stringify([s.id,patch]));
});

test('captured ABUD whole carts confirm both paid and explicit free home shipping, bound to their postcodes',async()=>{
 for(const row of fixture.abud){const result=await quoteAbud(abudOrder(row),row.postalCode,abudNetwork(row));assert.ok('quote'in result);const native=row.shipping.data.shipping.shipping.find(r=>r.prepaid==='prepaid'&&r.courier.id===100037)!;assert.equal(result.quote.costGrosze,Math.round(native.cost.value*100));assert.equal(result.quote.destinationScope,'postal_code');assert.equal(result.quote.postalCode,row.postalCode);}
});

test('wrong quantities, stock, unit, bundle or gross subtotal cannot create a confirmed cheap cable basket',async()=>{
 const row=fixture.abud[0],order=abudOrder(row);
 for(const mutate of[(b:any)=>b.basket.products[0].price_unit='m',(b:any)=>b.basket.products[0].count=2,(b:any)=>b.basket.products[0].reservation_stocksown=0,(b:any)=>b.basket.products[0].bundle=1,(b:any)=>b.basket.worth=0,(b:any)=>b.basket.products[0].prices.gros='0.01'])await assert.rejects(quoteAbud(order,row.postalCode,abudNetwork(row,(kind,data)=>{if(kind==='cart')mutate(data);})));
 await assert.rejects(quoteAbud(order,row.postalCode,abudNetwork(row,(kind,data)=>{if(kind==='shipping')data.data.shipping.shipping=data.data.shipping.shipping.filter((r:any)=>r.courier.id===0||/Paczkomat|Paczka Smile/.test(r.courier.name));})),/no_home_delivery/);
});

test('HIPPER native cart confirms one 25m roll plus18.90PLN home delivery; changed totals cannot borrow that rate',async()=>{
 const order=fixture.hipper.order as DeliveredStoreBasket,result=await quoteCertusoft(order,hipperNetwork());assert.ok('quote'in result);assert.equal(result.quote.costGrosze,1890);assert.equal(result.quote.destinationScope,'PL');assert.equal(order.materialsGrosze+result.quote.costGrosze,20790);
 await assert.rejects(quoteCertusoft(order,hipperNetwork((index,body)=>index===4?body.replace('"deliveryMethodsCUnitPrice":18.9','"deliveryMethodsCUnitPrice":0'):body)));
});

test('actual HTTP ranks the more expensive roll as the cheaper delivered order and keeps the four-roll basket together',async()=>{
 const initial=sources.map(s=>parseRetailPage(page(s.id),s,new Date())),nativeQuote=async(order:DeliveredStoreBasket,code:string)=>{
  if(order.store==='HIPPER')return quoteCertusoft(order,hipperNetwork());
  const wanted=order.lines.flatMap(l=>l.packages).map(p=>[sources.find(s=>s.id===p.offerId)!.productId,p.count]).sort((a,b)=>a[0]!-b[0]!);const row=fixture.abud.find(r=>r.postalCode===code&&JSON.stringify(clone(r.entries).sort((a,b)=>a[0]-b[0]))===JSON.stringify(wanted));assert.ok(row,JSON.stringify(wanted));return quoteAbud(order,code,abudNetwork(row));
 };
 const service=createRemontService({initialObservations:initial,background:false,basketQuoter:nativeQuote}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
 try{const post=async(selected:typeof sources)=>{const r=await fetch(`http://127.0.0.1:${(server.address() as {port:number}).port}/pricing/project`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'cable-kit',materials:selected.map(s=>({material:{id:s.id,name:s.name,ean:s.ean,unit:s.unit,category:'wire'},quantity:s.packageSize}))}],options:{delivery:{mode:'shipping',method:'automatic',postalCode:'30-001',allowSeparateOrders:true}}})});assert.equal(r.status,200);return r.json();};
  const one=await post([sources[2]]),best=one.deliveryComparison.best;assert.equal(one.stages[0].lines[0].cheapestOffer.unitPriceGrosze,18900);assert.deepEqual([best.stores[0].store,best.materialsGrosze,best.deliveryGrosze,best.totalGrosze],['ABUD',19270,0,19270]);
  for(const key of ['unavailableStores','partiallyQuotedStores','missingDeliveryStores'])assert.deepEqual(one.deliveryComparison[key]??[],[],key+' must not hide a failed HIPPER quote');
  const all=await post(sources.filter(s=>s.store==='ABUD')),whole=all.deliveryComparison.best;assert.deepEqual([whole.stores.length,whole.materialsGrosze,whole.deliveryGrosze,whole.totalGrosze],[1,126610,0,126610]);assert.equal(whole.stores[0].store,'ABUD');assert.equal(new Set(all.stages[0].lines.map((l:any)=>l.product.ean)).size,4);
 }finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
});
