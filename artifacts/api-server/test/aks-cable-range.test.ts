import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/aks-cable-range.json' with {type:'json'};
import previous from './fixtures/aks-cables.json' with {type:'json'};
import {AKS_CABLE_SOURCES,isReviewedAksCableSource} from '../src/lib/aks-cables';
import {parseRetailPage} from '../src/lib/retail-pages';
import {quoteAbud} from '../src/lib/abud-delivery';
import {createRemontService} from '../src/shared-backend';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

const sources=AKS_CABLE_SOURCES.filter(s=>s.store==='ABUD'),pages=[...previous.pages,...fixture.pages];
const page=(id:string)=>pages.find(p=>p.sourceId===id)!.html;
const fresh=()=>sources.map(s=>parseRetailPage(page(s.id),s,new Date()));
type Cart=(typeof fixture.abud)[number];
function order(row:Cart):DeliveredStoreBasket {
 const observations=fresh();
 const lines=row.entries.map(([id,count])=>{
  const s=sources.find(s=>s.productId===id)!,observation=observations.find(o=>o.sourceId===s.id)!;
  return{product:{id:'remont-'+s.ean,name:s.name,imageUrl:s.imageUrl},unit:s.unit,packages:[{offerId:s.id,store:s.store,url:s.url,packageSize:s.packageSize,count,unitPriceGrosze:observation.priceGrosze,lineCostGrosze:count*observation.priceGrosze}]};
 });
 return{store:'ABUD',materialsGrosze:lines.reduce((sum,l)=>sum+l.packages[0].lineCostGrosze,0),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines};
}
function network(row:Cart,mutate?:(kind:string,data:any)=>void):typeof fetch {
 const added:number[][]=[];
 return async(input,init)=>{
  const u=new URL(String(input));assert.equal(u.origin,'https://www.abud.pl');
  const source=sources.find(s=>new URL(s.url).pathname===u.pathname);
  if(source)return new Response(page(source.id),{headers:{'set-cookie':'rangeCart=fixture; Path=/; Secure'}});
  if(u.pathname==='/ajax/client-new.php'){assert.equal(u.searchParams.get('zipcode'),row.postalCode);return Response.json(structuredClone(row.destination));}
  if(u.pathname==='/basketchange.php'){
   assert.equal(init?.method,'POST');const form=new URLSearchParams(String(init?.body));assert.deepEqual([...form.keys()].sort(),['getAjax','mode','number','product','size']);assert.equal(form.get('mode'),'1');assert.equal(form.get('size'),'onesize');
   const pair=[Number(form.get('product')),Number(form.get('number'))];assert.ok(row.entries.some(([id,count])=>pair[0]===id&&pair[1]===count));added.push(pair);const data=structuredClone(row.cart);mutate?.('cart',data);return Response.json(data);
  }
  assert.equal(u.pathname,'/graphql/v1/');assert.equal(init?.method,'POST');assert.match(JSON.parse(String(init?.body)).query,/mode: basket/);assert.deepEqual(added.sort((a,b)=>a[0]-b[0]),structuredClone(row.entries).sort((a,b)=>a[0]-b[0]));const data=structuredClone(row.shipping);mutate?.('shipping',data);return Response.json(data);
 };
}

test('four further manufacturer codes have distinct exact lengths, native purchase units and prices',()=>{
 const wanted=[['abud-aks-ydyp-3x15-25m',25,12170],['abud-aks-ydyp-3x15-50m',50,24250],['abud-aks-ydyp-3x25-50m',50,37010],['abud-aks-ydyp-3x25-5m',5,4270]] as const;
 for(const [id,length,price]of wanted){
  const s=sources.find(s=>s.id===id)!;assert.ok(isReviewedAksCableSource(s));assert.equal(s.packageSize,length);const observation=parseRetailPage(page(id),s,new Date());assert.equal(observation.priceGrosze,price);assert.equal(observation.ean,s.ean);
  for(const change of[{packageSize:1},{unit:'szt'},{apiPurchaseUnit:'mb'},{ean:'5904617573771'},{productId:65373},{variant:['3x4','50m']},{minimumPackages:2}])assert.throws(()=>parseRetailPage(page(id),{...s,...change},new Date()));
 }
});

test('native small, combined and four-product baskets have paid or explicitly free postcode delivery',async()=>{
 const expected=[[4270,1300,5570],[12170,1300,13470],[7160,1300,8460],[77700,0,77700]];
 for(const [index,row]of fixture.abud.slice(0,4).entries()){
  const basket=order(row),result=await quoteAbud(basket,row.postalCode,network(row));assert.ok('quote'in result);assert.deepEqual([basket.materialsGrosze,result.quote.costGrosze,basket.materialsGrosze+result.quote.costGrosze],expected[index]);assert.equal(result.quote.postalCode,row.postalCode);assert.equal(result.quote.destinationScope,'postal_code');
 }
});

test('changed quantities, units, deposit and subtotals cannot borrow the captured courier fee',async()=>{
 const row=fixture.abud[0];
 for(const change of[(b:any)=>b.products[0].count=2,(b:any)=>b.products[0].price_unit='mb',(b:any)=>b.total_deposit=1,(b:any)=>b.worth=0,(b:any)=>b.products[0].prices.gros='0.01']){
  await assert.rejects(quoteAbud(order(row),row.postalCode,network(row,(kind,data)=>{if(kind==='cart')change(data.basket);})));
 }
});

test('a real larger basket with conditional line discounts cannot be sold at unrelated catalogue prices',async()=>{
 const row=fixture.abud[4],basket=order(row);assert.equal(basket.materialsGrosze,204310);assert.equal(Math.round(row.cart.basket.worth*100),202266);
 // The native basket has a conditional discount. Until it has its own quoted
 // material adjustment, keep the mismatch explicit instead of inventing a
 // catalogue price change or returning a falsely confirmed total.
 await assert.rejects(quoteAbud(basket,row.postalCode,network(row)),/price_changed/);
});

test('HTTP keeps raw metre demand, rounds to a complete roll and combines one actual delivery',async()=>{
 const service=createRemontService({initialObservations:fresh(),background:false,basketQuoter:async(basket,code)=>{
  const entries=basket.lines.flatMap(l=>l.packages).map(p=>[sources.find(s=>s.id===p.offerId)!.productId,p.count]).sort((a,b)=>a[0]!-b[0]!);
  const row=fixture.abud.find(r=>r.postalCode===code&&JSON.stringify(structuredClone(r.entries).sort((a,b)=>a[0]-b[0]))===JSON.stringify(entries));assert.ok(row,JSON.stringify(entries));return quoteAbud(basket,code,network(row));
 }}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
 try{
  for(const [ids,quantities,code,total]of[[['abud-aks-ydyp-3x25-5m'],[2.4],'30-001',5570],[['abud-aks-ydyp-3x15-5m','abud-aks-ydyp-3x25-5m'],[2.4,2.4],'00-001',8460],[fixture.pages.map(p=>p.sourceId),[25,50,50,5],'30-001',77700]] as const){
   const materials=ids.map((id,index)=>{const s=sources.find(s=>s.id===id)!;return{material:{id:s.id,name:s.name,ean:s.ean,unit:s.unit,category:'wire'},quantity:quantities[index]};});
   const response=await fetch(`http://127.0.0.1:${(server.address() as {port:number}).port}/pricing/project`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'additional-materials',materials}],options:{delivery:{mode:'shipping',method:'automatic',postalCode:code}}})});assert.equal(response.status,200);const data=await response.json();assert.equal(data.deliveryComparison.best.totalGrosze,total);assert.equal(data.deliveryComparison.best.stores.length,1);assert.deepEqual(data.deliveryComparison.unavailableStores,[]);assert.ok(data.stages[0].lines.every((l:any)=>l.quantity===materials.find(m=>m.material.ean===l.product.ean)!.quantity));
  }
 }finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
});
