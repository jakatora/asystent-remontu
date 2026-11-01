import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import old from './fixtures/elmas-tape-wave176.json';
import fixture from './fixtures/elmas-mixed-wave179.json';
import {ELMAS_TAPE,ELMAS_TAPE_75,ELMAS_ORIGIN} from './elmas-source';
import {readElmasProduct,readElmasNativeCard} from './elmas-product';
import {parseRetailPage} from './retail-pages';
import {quoteElmas} from './elmas-delivery';
import {createRemontService} from '../shared-backend';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

function order(counts:readonly number[]):DeliveredStoreBasket{
  const lines=[ELMAS_TAPE,ELMAS_TAPE_75].flatMap((source,i)=>counts[i]?[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:source.imageUrl!},unit:'m',packages:[{offerId:source.id,store:'Elmas',url:source.url,packageSize:30,count:counts[i],unitPriceGrosze:i?3200:2289,lineCostGrosze:counts[i]*(i?3200:2289)}]}]:[]);
  return{store:'Elmas',materialsGrosze:lines.reduce((s,l)=>s+l.packages[0].lineCostGrosze,0),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines};
}
function network(change?:(phase:string,data:any)=>void){
  const calls:{url:string;method:string;body?:any}[]=[];
  const fetcher:typeof fetch=async(input,init)=>{
    const url=String(input),method=init?.method??'GET',body=init?.body?JSON.parse(String(init.body)):undefined;calls.push({url,method,body});
    for(const [source,f]of [[ELMAS_TAPE,old],[ELMAS_TAPE_75,fixture]]as const){
      if(url===source.url){assert.equal(method,'GET');return new Response(f.html,{headers:{'content-type':'text/html'}});}
      if(url===ELMAS_ORIGIN+'/api/public/p/'+source.retailerSku+'?lang=pl&id=1'){assert.equal(method,'GET');const data=structuredClone(f.api);change?.('product-'+source.ean,data);return Response.json(data);}
    }
    assert.equal(url,ELMAS_ORIGIN+'/api/public/order/form');assert.equal(method,'POST');assert.equal(body.deliveryCountry,'pl');
    const counts=[ELMAS_TAPE,ELMAS_TAPE_75].map(s=>body.basket.find((r:any)=>r.product._id===s.retailerSku)?.quantity??0),record=fixture.cases.find(c=>c.counts.join()===counts.join());assert.ok(record,'No native fixture for '+counts);
    assert.deepEqual(body.basket,record.request.basket);assert.equal(body.currency,'PLN');
    assert.ok(Object.keys(body).every(k=>['step','code','giftCardCode','currency','basket','lang','deliveryCountry','total','init','selectedDeliveryId'].includes(k)));
    const phase=body.selectedDeliveryId===undefined?'initial':'selected',data=structuredClone(record[phase]);change?.(phase,data);return Response.json(data);
  };return{calls,fetcher};
}

test('actual 75 mm primary card proves its own EAN, whole 30 m roll, 46 stock and matching photo',()=>{
  const card=readElmasProduct(fixture.html,ELMAS_TAPE_75),row=parseRetailPage(fixture.html,ELMAS_TAPE_75,new Date(fixture.capturedAt));
  assert.equal(card.priceGrosze,3200);assert.equal(card.maxPackages,46);assert.equal(card.imageUrl,ELMAS_TAPE_75.imageUrl);assert.equal(row.ean,'5907651698011');assert.ok(row.name.endsWith('30 m'));assert.equal(row.stockPackages,46);assert.equal(row.availability,'in_stock');
});

test('75 mm cannot borrow the 50 mm variant, its photo, a carton multiple or a different primary length',()=>{
  for(const source of [{...ELMAS_TAPE_75,ean:ELMAS_TAPE.ean},{...ELMAS_TAPE_75,imageUrl:ELMAS_TAPE.imageUrl},{...ELMAS_TAPE_75,purchaseMultiple:12},{...ELMAS_TAPE_75,packageSize:360}])assert.throws(()=>readElmasProduct(fixture.html,source));
  assert.throws(()=>readElmasProduct(fixture.html,ELMAS_TAPE));
  for(const [from,to]of [['30 metrów','12 metrów'],['7<b>5 mm','5<b>0 mm']]as const){assert.ok(fixture.html.includes(from));assert.throws(()=>readElmasProduct(fixture.html.replaceAll(from,to),ELMAS_TAPE_75));}
  for(const change of [(p:any)=>p.manufacturer.name='Criss',(p:any)=>p.mainImage.url=new URL(ELMAS_TAPE.imageUrl!).pathname,(p:any)=>p.variants[0].weight=0.3,(p:any)=>p.price.quantityFactor=12]){const p=structuredClone(fixture.api);change(p);assert.throws(()=>readElmasNativeCard(p,ELMAS_TAPE_75));}
});

test('seven recorded native mixed and single-width carts charge the home courier once, including actual free mixed delivery',async()=>{
  const hashes=[];for(const c of fixture.cases){const n=network(),q=await quoteElmas(order(c.counts),n.fetcher);assert.ok('quote'in q);assert.equal(q.quote.costGrosze,c.shippingGrosze);assert.equal(q.quote.basis,'retailer_basket_national');assert.equal(q.quote.destinationScope,'PL');assert.equal(n.calls.filter(c=>c.method==='POST').length,2);hashes.push(q.quote.evidenceSha256);}
  assert.equal(new Set(hashes).size,fixture.cases.length);
});

test('invalid combined totals, duplicate lines and swapped SKU are rejected before any merchant request',async()=>{
  for(const mutate of [(o:DeliveredStoreBasket)=>o.materialsGrosze++,(o:DeliveredStoreBasket)=>o.lines.push(o.lines[0]),(o:DeliveredStoreBasket)=>o.lines[1].product.id='remont-'+ELMAS_TAPE.ean,(o:DeliveredStoreBasket)=>o.lines[1].packages[0].url=ELMAS_TAPE.url]){const o=order([1,1]);mutate(o);const n=network();await assert.rejects(quoteElmas(o,n.fetcher),/invalid_basket/);assert.equal(n.calls.length,0);}
});

test('a changed second product price or exhausted second product never leaves a confirmed mixed quote',async()=>{
  for(const mutate of [(p:any)=>{p.price.brutto=p.price.discountBrutto=p.variants[0].price.brutto=p.variants[0].price.discountBrutto=33;p.price.netto=p.price.discountNetto=p.variants[0].price.netto=p.variants[0].price.discountNetto=26.83;},(p:any)=>p.variants[0].count=0]){const n=network((phase,p)=>{if(phase==='product-'+ELMAS_TAPE_75.ean)mutate(p);});await assert.rejects(quoteElmas(order([1,1]),n.fetcher));assert.equal(n.calls.filter(c=>c.method==='POST').length,0);}
});

test('actual Express comparison keeps both widths and independently rounds raw metres into full rolls',async()=>{
  const n=network(),service=createRemontService({background:false,initialObservations:[parseRetailPage(old.html,ELMAS_TAPE,new Date()),parseRetailPage(fixture.html,ELMAS_TAPE_75,new Date())],fetchImpl:n.fetcher}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  try{const r=await fetch('http://127.0.0.1:'+(server.address()as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'additional-materials',materials:[ELMAS_TAPE,ELMAS_TAPE_75].map((s,i)=>({material:{id:s.id,ean:s.ean,name:s.name,unit:'m',category:s.category},quantity:i?30:1e-8}))}],options:{delivery:{mode:'shipping',postalCode:'30-001',allowExtraPackages:false,allowSeparateOrders:false}}})});assert.equal(r.status,200);const data:any=await r.json(),best=data.deliveryComparison.best;assert.equal(best.materialsGrosze,5489);assert.equal(best.deliveryGrosze,5000);assert.equal(best.totalGrosze,10489);assert.equal(best.stores.length,1);assert.equal(best.stores[0].lines.length,2);assert.deepEqual(best.stores[0].lines.map((l:any)=>l.packages[0].count),[1,1]);assert.deepEqual(data.stages[0].lines.map((l:any)=>l.quantity),[1e-8,30]);
    const extraResponse=await fetch('http://127.0.0.1:'+(server.address()as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'additional-materials',materials:[ELMAS_TAPE,ELMAS_TAPE_75].map((s,i)=>({material:{id:s.id,ean:s.ean,name:s.name,unit:'m',category:s.category},quantity:i?150:30}))}],options:{delivery:{mode:'shipping',postalCode:'00-001',allowExtraPackages:true,allowSeparateOrders:false}}})});assert.equal(extraResponse.status,200);const extraData:any=await extraResponse.json(),comparison=extraData.deliveryComparison;
    assert.equal(comparison.best.totalGrosze,23289);assert.equal(comparison.extraPackageOption.basket.totalGrosze,20578);assert.equal(comparison.extraPackageOption.savingGrosze,2711);assert.equal(comparison.extraPackageOption.basket.deliveryGrosze,0);assert.equal(comparison.extraPackageOption.basket.stores.length,1);
    assert.deepEqual(comparison.extraPackageOption.basket.stores[0].lines.map((l:any)=>l.packages[0].count),[2,5]);assert.deepEqual(extraData.stages[0].lines.map((l:any)=>l.quantity),[30,150]);
  }finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
});
