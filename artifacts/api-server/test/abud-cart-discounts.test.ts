import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/abud-cart-discounts.json' with {type:'json'};
import previous from './fixtures/aks-cables.json' with {type:'json'};
import range from './fixtures/aks-cable-range.json' with {type:'json'};
import {AKS_CABLE_SOURCES} from '../src/lib/aks-cables';
import {parseRetailPage} from '../src/lib/retail-pages';
import {quoteAbud} from '../src/lib/abud-delivery';
import {confirmIdosellBasket} from '../src/lib/idosell-basket';
import {createRemontService} from '../src/shared-backend';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const sources=AKS_CABLE_SOURCES.filter(s=>s.store==='ABUD'),pages=[...previous.pages,...range.pages];
const page=(id:string)=>pages.find(p=>p.sourceId===id)!.html;
const fresh=()=>sources.map(s=>parseRetailPage(page(s.id),s,new Date()));
type Cart=(typeof fixture.cases)[number];
function order(row:Cart):DeliveredStoreBasket {
 const observations=fresh(),lines=row.entries.map(([id,count])=>{const s=sources.find(s=>s.productId===id)!,o=observations.find(o=>o.sourceId===s.id)!;return{product:{id:'remont-'+s.ean,name:s.name,imageUrl:s.imageUrl},unit:s.unit,packages:[{offerId:s.id,store:s.store,url:s.url,packageSize:s.packageSize,count,unitPriceGrosze:o.priceGrosze,lineCostGrosze:count*o.priceGrosze}]};});
 return{store:'ABUD',materialsGrosze:lines.reduce((n,l)=>n+l.packages[0].lineCostGrosze,0),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines};
}
function network(row:Cart,mutate?:(data:any)=>void):typeof fetch {
 const added:number[][]=[];return async(input,init)=>{const u=new URL(String(input));assert.equal(u.origin,'https://www.abud.pl');const source=sources.find(s=>new URL(s.url).pathname===u.pathname);
  if(source)return new Response(page(source.id),{headers:{'set-cookie':'discountCart=fixture; Path=/; Secure'}});
  if(u.pathname==='/ajax/client-new.php'){assert.equal(u.searchParams.get('zipcode'),row.postalCode);return Response.json(structuredClone(row.destination));}
  if(u.pathname==='/basketchange.php'){assert.equal(init?.method,'POST');const form=new URLSearchParams(String(init?.body));assert.deepEqual([...form.keys()].sort(),['getAjax','mode','number','product','size']);assert.equal(form.get('size'),'onesize');assert.equal(form.get('mode'),'1');const pair=[Number(form.get('product')),Number(form.get('number'))];assert.ok(row.entries.some(([id,count])=>id===pair[0]&&count===pair[1]));added.push(pair);const data=structuredClone(row.cart);mutate?.(data);return Response.json(data);}
  assert.equal(u.pathname,'/graphql/v1/');assert.deepEqual(added.sort((a,b)=>a[0]-b[0]),structuredClone(row.entries).sort((a,b)=>a[0]-b[0]));return Response.json(structuredClone(row.shipping));
 };
}

test('actual anonymous carts prove both discount levels and preserve unchanged small orders',async()=>{
 const expected=[[204310,202266,2044,0],[408620,402492,6128,0],[4270,4270,0,1300],[77700,77700,0,0]];
 for(const [index,row]of fixture.cases.entries()){
  const basket=order(row),before=JSON.stringify(basket),result=await quoteAbud(basket,row.postalCode,network(row));assert.ok('quote'in result);const pricing=result.quote.cartPricing;
  assert.deepEqual([basket.materialsGrosze,pricing?.materialsGrosze??basket.materialsGrosze,pricing?.discountGrosze??0,result.quote.costGrosze],expected[index]);
  if(pricing){assert.equal(pricing.lines.reduce((n,p)=>n+p.lineCostGrosze,0),pricing.materialsGrosze);assert.ok(pricing.lines.every(p=>p.lineCostGrosze===p.count*p.unitPriceGrosze&&p.unitPriceGrosze<=p.baseUnitPriceGrosze));}
  assert.equal(JSON.stringify(basket),before);
 }
 // The native base_price of a two-roll cart differs from a one-pack card.
 // It is not substituted for the freshly checked baseline or used as a rate.
 assert.notEqual(fixture.cases[1].cart.basket.products[0].prices.base_price,413.6);
});

test('discount permission cannot accept increases, free lines, missing proof, wrong stock or a changed basket',async()=>{
 const row=fixture.cases[0];
 const changes=[(b:any)=>b.products[0].count=2,(b:any)=>b.products[0].reservation_stocksown=0,(b:any)=>b.products[0].price_unit='mb',(b:any)=>b.products[0].bundle=1,(b:any)=>b.products[0].prices.base_price=0,(b:any)=>delete b.products[0].prices.base_price,(b:any)=>b.total_deposit=1,(b:any)=>b.currency='EUR',(b:any)=>b.worth=2022.65,(b:any)=>b.productsNumber=7,(b:any)=>b.products[0].prices.gros_formatted='28,60 zł',(b:any)=>{b.products[0].prices.gros='0.00';b.products[0].prices.gros_formatted='0,00 zł';b.products[0].prices.worth_gros='0.00';b.products[0].prices.worth_gros_formatted='0,00 zł';},(b:any)=>{b.products[0].prices.gros='9999.00';b.products[0].prices.gros_formatted='9999,00 zł';b.products[0].prices.worth_gros='9999.00';b.products[0].prices.worth_gros_formatted='9999,00 zł';}];
 for(const change of changes)await assert.rejects(quoteAbud(order(row),row.postalCode,network(row,data=>change(data.basket))));
 const expected=order(row).lines.map(l=>{const p=l.packages[0];return{source:sources.find(s=>s.id===p.offerId)!,count:p.count,price:p.unitPriceGrosze};});
 assert.throws(()=>confirmIdosellBasket(row.cart,expected,204310),/price_changed/);
});

test('HTTP returns the native paid total and item prices without writing the cart discount into product history',async()=>{
 const row=fixture.cases[0],basket=order(row),service=createRemontService({initialObservations:fresh(),background:false,basketQuoter:(order,code)=>{assert.equal(code,row.postalCode);return quoteAbud(order,code,network(row));}}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
 try{
  const response=await fetch(base+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'cable-kit',materials:basket.lines.map(l=>({material:{id:l.product.id,name:l.product.name,ean:l.product.id.slice(7),unit:l.unit,category:'wire'},quantity:l.packages[0].packageSize}))}],options:{delivery:{mode:'shipping',method:'automatic',postalCode:row.postalCode}}})});assert.equal(response.status,200);const data=await response.json(),best=data.deliveryComparison.best,store=best.stores[0];
  assert.deepEqual([best.materialsGrosze,best.deliveryGrosze,best.totalGrosze],[202266,0,202266]);assert.equal(store.quote.cartPricing.discountGrosze,2044);assert.equal(store.lines.reduce((n:number,l:any)=>n+l.packages.reduce((m:number,p:any)=>m+p.lineCostGrosze,0),0),202266);assert.equal(store.lines.flatMap((l:any)=>l.packages).find((p:any)=>p.offerId==='abud-aks-ydyp-3x15-100m').unitPriceGrosze,40946);assert.equal(data.stages[0].lines.find((l:any)=>l.product.ean==='5904617579735').cheapestOffer.unitPriceGrosze,41360);
  const historyResponse=await fetch(base+'/pricing/history?ean=5904617579735');assert.equal(historyResponse.status,200);const history=await historyResponse.json();assert.equal(history.stats.current,41360);assert.equal(history.stats.count,1);assert.equal(history.stats.isRealPromo,false);
 }finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
});

test('cached discount cannot follow another postcode, quantity, catalogue price or expired quote',async t=>{
 t.mock.timers.enable({apis:['Date'],now:Date.now()});const row=fixture.cases[0],basket=order(row),transport=network(row);let calls=0;
 const quoter=createRetailerQuoter(async(input,init)=>{calls++;return transport(input,init);});
 const first=await quoter(basket,row.postalCode);assert.ok('quote'in first);assert.equal(first.quote.cartPricing!.materialsGrosze,202266);const count=calls;
 assert.deepEqual(await quoter(basket,row.postalCode),first);assert.equal(calls,count);assert.deepEqual(quoter.cached!(basket,row.postalCode),first);
 assert.equal(quoter.cached!(basket,'00-001'),null);assert.equal(quoter.cached!(order(fixture.cases[1]),row.postalCode),null);
 const changed=structuredClone(basket);changed.lines[0].packages[0].unitPriceGrosze++;changed.lines[0].packages[0].lineCostGrosze++;changed.materialsGrosze++;assert.equal(quoter.cached!(changed,row.postalCode),null);
 t.mock.timers.tick(600001);assert.equal(quoter.cached!(basket,row.postalCode),null);
});
