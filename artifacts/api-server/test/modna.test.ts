import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { modnaProduct, modnaOne, modnaTwo, modnaOrder } from './fixtures/modna';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';
import { readModnaProduct } from '../src/lib/modna-product';
import { confirmModnaCart, quoteModna } from '../src/lib/modna-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import { createRetailerQuoter, retailerDeliveryCapabilities } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(s=>s.id==='modna-paradyz-u117-grey-143m2')!;
const expected = (count:number) => [{ id:34158,name:source.name,url:source.url,size:1.43,count,price:10729 }];
const basket = (count=1):DeliveredStoreBasket => ({store:source.store,materialsGrosze:count*10729,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:source.ean,name:source.name,imageUrl:null},unit:'m2',packages:[{offerId:source.id,store:source.store,packageSize:1.43,count,unitPriceGrosze:10729,lineCostGrosze:count*10729,url:source.url}]}]});
function fixtureFetch(count=1, cart=count===1?modnaOne:modnaTwo, order=modnaOrder) {
  const calls:{path:string;method:string}[]=[];
  const fetcher:typeof fetch = async (input,init) => {
    const url=new URL(String(input)),method=init?.method??'GET',headers=new Headers(init?.headers);calls.push({path:url.pathname,method});
    assert.equal(url.origin,'https://modnalazienka.pl');
    if(method==='GET'&&url.pathname===new URL(source.url).pathname){assert.equal(headers.get('Cookie'),'');return new Response(modnaProduct,{headers:{'content-type':'text/html','Set-Cookie':'modna_anon=fixture; Secure; HttpOnly'}});}
    assert.equal(headers.get('Cookie'),'modna_anon=fixture');
    if(method==='POST'&&url.pathname==='/cart_edit') {
      assert.equal(headers.get('Origin'),url.origin);assert.equal(headers.get('Referer'),url.origin+'/');
      assert.equal(headers.get('X-CSRF-Token'),'test-anonymous-modna-token-1234567890');
      const body=new URLSearchParams(String(init?.body));
      assert.deepEqual([...body.keys()].sort(),['update_cart','product_id','cart_quantity_real_unit_34158','product_single_set_34158'].sort());
      assert.equal(body.get('product_id'),'34158');assert.equal(body.get('cart_quantity_real_unit_34158'),(count*1.43).toFixed(2));assert.equal(body.get('product_single_set_34158'),'true');
      return new Response('{}',{headers:{'content-type':'application/json'}});
    }
    if(method==='GET'&&url.pathname==='/cart/') return new Response(cart,{headers:{'content-type':'text/html'}});
    if(method==='GET'&&url.pathname==='/order/') return new Response(order,{headers:{'content-type':'text/html'}});
    throw Error('Unreviewed request: '+method+' '+url.pathname);
  };
  return {fetcher,calls};
}

test('Modna uses the explicit physical 1.43m² pack price, primary EAN and actual image',()=>{
  const product=readModnaProduct(modnaProduct,source),observation=parseRetailPage(modnaProduct,source,new Date());
  assert.equal(product.maxPackages,349);assert.equal(product.priceGrosze,10729);assert.equal(observation.priceGrosze,10729);
  assert.match(observation.imageUrl!,/thumbnails\/paradyz\/\/u117-grey/);assert.equal(observation.ean,'5904584158261');
});

test('Modna withdraws ambiguous identity, packaging, stock, currency and gross prices',()=>{
  const mutations:[string,string][]=[
    ['value="5904584158261"','value="0000000000000"'],['EAN: 5904584158261','EAN: 0000000000000'],
    ['"name": "Paradyż"','"name": "Inna marka"'],['value="Paradyż"','value="Inna marka"'],
    ["'unit': 1.43","'unit': 1.44"],["'pieces': 4","'pieces': 3"],["'minimum_packages': 1.0","'minimum_packages': 2.0"],
    ['349 paczek','0 paczek'],['gotowe do wysyłki','na zamówienie'],['W paczce: 4 szt.','W paczce: 5 szt.'],
    ['value="107.29"','value="1.00"'],['>107,29</span>','>1,00</span>'],['"price": "107.29"','"price": "1.00"'],
    ['"priceCurrency": "PLN"','"priceCurrency": "EUR"'],['http://schema.org/InStock','http://schema.org/OutOfStock'],
    ['onClick="addToCart(34158)"','onClick="addToCart(34159)"'],
  ];
  for(const [from,to]of mutations){assert.ok(modnaProduct.includes(from),from);const changed=modnaProduct.replace(from,to);assert.notEqual(changed,modnaProduct);assert.throws(()=>parseRetailPage(changed,source,new Date()),from);}
  assert.throws(()=>parseRetailPage(modnaProduct,{...source,packageSize:1},new Date()),/purchase_rules_changed/);
  assert.throws(()=>parseRetailPage(modnaProduct,{...source,ean:'0000000000000'},new Date()),/ean_not_confirmed/);
  const injected=modnaProduct+'<script type="application/ld+json">{"@type":"Product","mpn":"34158","price":"1.00"}</script>';
  assert.throws(()=>parseRetailPage(injected,source,new Date()),/identity_not_confirmed/);
});

test('Modna confirms every cart line and reads current whole-pallet freight with free bank transfer',()=>{
  for(const [cart,count]of [[modnaOne,1],[modnaTwo,2]] as const){const quote=confirmModnaCart(cart,modnaOrder,expected(count),count*10729);assert.equal(quote.costGrosze,22900);assert.equal(quote.payment,'Przelew bankowy');}
});

test('Modna rejects changed quantities, hidden prices, sums, stock and unconfirmed shipping or payment fees',()=>{
  const cases:[string,string][]=[['value="2" step="1"','value="1" step="1"'],['>107.29</span>','>1.00</span>'],['>214,58 zł</h5>','>214,59 zł</h5>'],['Do zapłaty 214,58','Do zapłaty 214,59'],['349 paczek','1 paczek'],['>PLN</span>','>EUR</span>']];
  for(const [from,to]of cases){assert.ok(modnaTwo.includes(from),from);const changed=modnaTwo.replace(from,to);assert.notEqual(changed,modnaTwo);assert.throws(()=>confirmModnaCart(changed,modnaOrder,expected(2),21458),from);}
  for(const replacement of ['Kurier 0','Odbiór 229']){assert.match(modnaTwo,/Kurier\s+229/);const changed=modnaTwo.replace(/Kurier\s+229/,replacement);assert.throws(()=>confirmModnaCart(changed,modnaOrder,expected(2),21458));}
  for(const [from,to]of [['Przelew bankowy','Przelew bankowy + 10 zł'],['data-module_name="courier"','data-module_name="pickup"'],['&#34;PL&#34;','&#34;DE&#34;'],['Kurier + 229','Kurier + 230']] as const){assert.ok(modnaOrder.includes(from),from);assert.throws(()=>confirmModnaCart(modnaTwo,modnaOrder.replace(from,to),expected(2),21458),from);}
  assert.throws(()=>confirmModnaCart(modnaTwo,modnaOrder,[...expected(2),...expected(2)],21458),/basket_not_confirmed/);
});

test('Modna anonymous transport quotes one courier per combined order without order submission or personal data',async()=>{
  for(const count of [1,2]){const {fetcher,calls}=fixtureFetch(count);const result=await quoteModna(basket(count),fetcher);assert.equal(result.quote.costGrosze,22900);assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.destinationScope,'PL');assert.equal(calls.length,4);assert.ok(!JSON.stringify(result).includes('modna_anon'));}
  assert.ok(retailerDeliveryCapabilities().automaticStores.includes('Modna Łazienka'));
  assert.ok('quote' in await createRetailerQuoter(fixtureFetch().fetcher)(basket(),'00-001'));
  await assert.rejects(quoteModna(basket(350),fixtureFetch().fetcher),/insufficient_stock/);
  const changed=basket();changed.lines[0].packages[0].unitPriceGrosze=10728;await assert.rejects(quoteModna(changed,fixtureFetch().fetcher),/price_changed/);
});

test('Modna cart transport only accepts a bounded physical quantity on the reviewed store',async()=>{
  let calls=0;const fetcher:typeof fetch=async()=>{calls++;throw Error('must not request');};
  const client=new AnonymousShop('https://modnalazienka.pl',fetcher,new AbortController().signal);
  for(const [id,qty,token]of [[0,'1.43','test-anonymous-modna-token-1234567890'],[34158,'NaN','test-anonymous-modna-token-1234567890'],[34158,'0.00','test-anonymous-modna-token-1234567890'],[34158,'1.43','x']] as const)await assert.rejects(client.modnaCart(id,qty,token),/invalid_cart_action/);
  await assert.rejects(new AnonymousShop('https://example.com',fetcher,new AbortController().signal).modnaCart(34158,'1.43','test-anonymous-modna-token-1234567890'),/invalid_cart_action/);
  assert.equal(calls,0);
});

test('Modna actual HTTP combines fractional tile needs before rounding physical packs and quoting delivery',async()=>{
  const observation=parseRetailPage(modnaProduct,source,new Date());
  const service=createRemontService({initialObservations:[observation],background:false,basketQuoter:async order=>quoteModna(order,fixtureFetch(order.lines[0].packages[0].count).fetcher)});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  try {
    const endpoint='http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project';
    const post=async (quantities:number[],mode='shipping')=>{const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:quantities.map((quantity,i)=>({jobId:'tile-'+i,materials:[{material:{id:'tile',name:source.name,ean:source.ean,unit:'m2',category:'tile'},quantity}]})),options:{store:source.store,delivery:{mode,postalCode:'00-001'}}})});assert.equal(response.status,200);return response.json();};
    const combined=await post([0.7,0.73]);assert.equal(combined.deliveryComparison.best.materialsGrosze,10729);assert.equal(combined.deliveryComparison.best.totalGrosze,33629);assert.equal(combined.deliveryComparison.best.stores[0].lines[0].packages[0].count,1);
    const exactTwo=await post([2.86]);assert.equal(exactTwo.deliveryComparison.best.totalGrosze,44358);assert.equal(exactTwo.deliveryComparison.best.stores[0].lines[0].packages[0].count,2);
    const over=await post([2.87],'pickup');assert.equal(over.deliveryComparison.best.totalGrosze,32187);assert.equal(over.deliveryComparison.best.stores[0].lines[0].packages[0].count,3);
  } finally {await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});
