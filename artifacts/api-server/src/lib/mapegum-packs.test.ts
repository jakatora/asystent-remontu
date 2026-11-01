import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/mapegum-packs-wave165.json';
import {RETAIL_SOURCES} from './retail-catalog';
import {readRetailSource} from './retail-pages';
import {createRetailerQuoter} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

const sources=RETAIL_SOURCES.filter(s=>['rabdom-mapegum-wps-5kg','rabdom-mapegum-wps-10kg','sewera-mapegum-wps-5kg','sewera-mapegum-wps-10kg'].includes(s.id));

test('four current Mapegum offers keep their exact 5/10 kg GTIN, gross price and physical purchase unit',async()=>{
  assert.equal(sources.length,4);
  for(const source of sources){const card=fixture.rabCards.find(c=>c.sourceId===source.id),page=fixture.seweraCards.find(c=>c.sourceId===source.id);
    const result=await readRetailSource(source,async()=>card?Response.json(card.item):new Response(page!.html,{headers:{'content-type':'text/html'}}));
    assert.equal(result.ean,source.ean);assert.equal(result.priceGrosze,card?.priceGrosze??page!.priceGrosze);
    assert.equal(source.unit,'kg');assert.equal(source.packageSize,source.id.includes('10kg')?10:5);
  }
});

test('older Mapegum barcodes, changed purchase units, sizes and SKU cannot verify the new retail pieces',async()=>{
  for(const source of sources.filter(s=>s.store==='Rab-Dom')){const card=fixture.rabCards.find(c=>c.sourceId===source.id)!;
    for(const change of [{ean:'8022452002113'},{ean:'8022452002120'},{unit:{name:'kg',floating_point:true}},{package:'2'},{code:'other'}])
      await assert.rejects(readRetailSource(source,async()=>Response.json({...card.item,...change})),/not_confirmed/);
    await assert.rejects(readRetailSource({...source,packageSize:source.packageSize===5?10:5},async()=>Response.json(card.item)),/not_confirmed/);
  }
  for(const source of sources.filter(s=>s.store==='Sewera')){const page=fixture.seweraCards.find(c=>c.sourceId===source.id)!;
    for(const html of [page.html.replaceAll(source.ean,'8022452002113'),page.html.replaceAll('SZT','KG'),page.html.replaceAll(`${source.packageSize}kg`,`${source.packageSize}l`)]){
      assert.notEqual(html,page.html);
      await assert.rejects(readRetailSource(source,async()=>new Response(html,{headers:{'content-type':'text/html'}})));
    }
  }
});

type Cart=typeof fixture.carts[number];
function transport(cart:Cart,change?:(response:string,url:URL)=>string){
  const pending=structuredClone(cart.trace??[]),requests:{url:string;method:string;body:string}[]=[];let add=0;
  const fetcher:typeof fetch=async(input,init)=>{const url=new URL(String(input)),method=init?.method??'GET',body=typeof init?.body==='string'?init.body:'';requests.push({url:url.href,method,body});
    if(cart.order.store==='Sewera'){const index=pending.findIndex(row=>row.url===url.href&&row.method===method&&(row.body??'')===body);assert.ok(index>=0,'Unexpected native request: '+method+' '+url.href+' '+body);const step=pending.splice(index,1)[0];return new Response(change?change(step.response,url):step.response,{status:step.status,headers:{'content-type':'text/html'}});}
    const match=url.pathname.match(/\/products\/PLN\/(\d+)$/);if(match){const card=fixture.rabCards.find(c=>c.item.id===Number(match[1]));assert.ok(card);return Response.json(card.item);}
    assert.equal(url.pathname,'/webapi/front/pl_PL/basket/PLN/');if(method==='POST'){assert.ok(add<cart.added!.length);return Response.json(cart.added![add++]);}return Response.json(cart.basket);
  };return{fetcher,requests,pending};
}

test('eight actual carts validate through the production quoter, preserving postcode-specific Sewera delivery',async()=>{
  for(const cart of fixture.carts){const mock=transport(cart),result=await createRetailerQuoter(mock.fetcher)(cart.order as DeliveredStoreBasket,cart.postalCode);
    assert.ok('quote'in result,cart.name+': '+JSON.stringify(result));assert.equal(result.quote.costGrosze,cart.result.quote.costGrosze);assert.equal(result.quote.basis,cart.result.quote.basis);
    if(cart.order.store==='Sewera'){assert.equal(result.quote.postalCode,cart.postalCode);assert.equal(result.quote.dispatchFrom,'Katowice');assert.equal(mock.pending.length,0);const requests=mock.requests.filter(r=>r.url.includes('get_order_delivery_cost'));assert.ok(requests.length>0);for(const request of requests){const body=new URLSearchParams(request.body);assert.equal(body.get('post_code'),cart.postalCode);assert.equal(body.get('street'),'');assert.equal(body.get('city'),'');}}
  }
});

test('a cheaper Mapegum product can be dearer after its actual delivery quote',()=>{
  const rab=fixture.carts.find(c=>c.name==='rab5')!,sewera=fixture.carts.find(c=>c.name==='sewera5')!;
  assert.ok(sewera.order.materialsGrosze<rab.order.materialsGrosze);
  assert.equal(rab.order.materialsGrosze+rab.result.quote.costGrosze,12340);
  assert.equal(sewera.order.materialsGrosze+sewera.result.quote.costGrosze,13225);
});

test('a blocked Sewera carrier cannot become confirmed delivery',async()=>{
  const cart=fixture.carts.find(c=>c.name==='sewera5')!,mock=transport(cart,(response,url)=>url.searchParams.get('operation')==='get_order_delivery_cost'?response+'<input id="block_order" value="1">':response);
  const result=await createRetailerQuoter(mock.fetcher)(cart.order as DeliveredStoreBasket,cart.postalCode);
  assert.ok('reason'in result);
});

test('a changed Sewera gross price stops the old-price cart before any item is added',async()=>{
  const cart=fixture.carts.find(c=>c.name==='sewera5')!,mock=transport(cart,(response,url)=>url.pathname.includes('p7751')?response.replaceAll('112.35','113.35').replaceAll('112,35','113,35'):response);
  const result=await createRetailerQuoter(mock.fetcher)(cart.order as DeliveredStoreBasket,cart.postalCode);
  assert.deepEqual(result,{reason:'price_changed'});assert.ok(!mock.requests.some(r=>r.url.includes('operation=addToBasket')));
});
