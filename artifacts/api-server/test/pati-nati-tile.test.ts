import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/pati-carina.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { inspectPatiProduct } from '../src/lib/pati-woo';
import { readRetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(row => row.id === 'pati-paradyz-nati-bianco-struktura-25x40')!;
const clone = <T,>(value:T):T => structuredClone(value);
const product = { ...clone(fixture.product), id:103591, sku:'SS&#8211;250X400-1-NATI.BI',
  name:'PARADYŻ NATI BIANCO ŚCIANA STRUKTURA 25&#215;40', permalink:source.url,
  images:[{ src:source.imageUrl }], low_stock_remaining:null,
  stock_availability:{ text:'39.30 m² na stanie (dozwolone zamówienia oczekujące)', class:'in-stock' },
  prices:{ ...fixture.product.prices, price:'6600' }, extensions:{ gtm4wp:{ item:{ stocklevel:39.3 } } },
};
function cart(phase:'added'|'located'|'selected', count=2) {
  const value:any=clone(fixture[phase]);
  const item=value.items[0]; item.id=103591; item.sku=product.sku; item.name=product.name; item.quantity=count;
  item.prices.price='6600';
  for(const key of ['line_total','line_subtotal']) item.totals[key]=String(6600*count);
  value.items_count=1; value.totals.total_items=String(6600*count);
  value.totals.total_shipping='17000'; value.totals.total_price=String(6600*count+17000);
  for(const group of value.shipping_rates) for(const rate of group.shipping_rates)
    if(rate.rate_id==='flexible_shipping_single:7') rate.price='17000';
  return value;
}
function replay(count=2, mutate?: (value:any,path:string)=>void, mixed=false) {
  const paths:string[]=[]; let cartReads=0;
  const fetcher:typeof fetch=async (input,init)=>{
    const url=new URL(String(input)),path=url.pathname;
    assert.equal(url.origin,'https://patiartstudio.pl'); paths.push(path);
    let value:any;
    if(path==='/wp-json/wc/store/v1/cart') {
      if(cartReads++===0) value=clone(fixture.empty);
      else { assert.equal(init?.headers && (init.headers as Record<string,string>)['Cart-Token'],undefined); value=cart('added',count); }
    } else if(path==='/wp-json/wc/store/v1/products/103591') value=clone(product);
    else if(mixed&&path==='/wp-json/wc/store/v1/products/3065') value=clone(fixture.product);
    else if(path===new URL(source.url).pathname) {
      assert.equal(init?.method,'POST');
      const form=new URLSearchParams(String(init?.body));
      assert.deepEqual(Object.fromEntries(form),{area_needed:(count*1.2).toFixed(1),_measurement_needed:(count*1.2).toFixed(1),_measurement_needed_unit:'sq m',quantity:'1','add-to-cart':'103591'});
      return new Response('<html>cart updated</html>',{headers:{'Content-Type':'text/html','Set-Cookie':'wp_woocommerce_session_test=isolated; Path=/'}});
    } else if(mixed&&path==='/wp-json/wc/store/v1/cart/add-item') {
      assert.deepEqual(JSON.parse(String(init?.body)),{id:3065,quantity:1});value=cart('added',count);
    } else if(path==='/wp-json/wc/store/v1/cart/update-customer') value=cart('located',count);
    else if(path==='/wp-json/wc/store/v1/cart/select-shipping-rate') value=cart('selected',count);
    else assert.fail('Unreviewed Pati route: '+path);
    if(mixed&&path.includes('/cart')&&(path!=='/wp-json/wc/store/v1/cart'||cartReads>2)){
      value.items.push(clone(fixture.added.items[0])); value.items_count=2;
      value.totals.total_items=String(6600*count+27093);
      value.totals.total_shipping='19500';value.totals.total_price=String(6600*count+27093+19500);
      for(const group of value.shipping_rates)for(const rate of group.shipping_rates)if(rate.rate_id==='flexible_shipping_single:7')rate.price='19500';
    }
    mutate?.(value,path);
    return Response.json(value,{headers:path.includes('/cart')?{'Cart-Token':'isolated-pati-tile-session'}:{}});
  };
  return {fetcher,paths};
}

test('Pati Nati Struktura exact SKU, pack, price, stock and image',async()=>{
  const observation=await readRetailSource(source,replay(1).fetcher);
  assert.equal(observation.ean,'5902610507960'); assert.equal(observation.priceGrosze,6600);
  assert.equal(observation.stockPackages,32); assert.equal(observation.imageUrl,source.imageUrl);
  for(const patch of [
    {sku:'S---250X400-1-NATI.BI'},
    {stock_availability:{...product.stock_availability,text:'0 m² na stanie (dozwolone zamówienia oczekujące)'}},
    {extensions:{gtm4wp:{item:{stocklevel:0}}}},
  ]) assert.throws(()=>inspectPatiProduct({...product,...patch},source));
});

test('Pati measurement form quotes two real 1.2 m² packs with postcode courier',async()=>{
  const order:DeliveredStoreBasket={store:source.store,materialsGrosze:13200,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',
    lines:[{product:{id:source.ean,name:source.name,imageUrl:source.imageUrl!},unit:'m2',packages:[{offerId:source.id,count:2,packageSize:1.2,lineCostGrosze:13200,unitPriceGrosze:6600,store:source.store,url:source.url}]}]};
  const {fetcher,paths}=replay();const result=await createRetailerQuoter(fetcher)(order,'00-001');
  assert.ok('quote' in result); assert.equal(result.quote.costGrosze,17000);
  assert.equal(13200+result.quote.costGrosze,30200);
  assert.ok(paths.includes(new URL(source.url).pathname));
  assert.ok(!paths.includes('/wp-json/wc/store/v1/cart/add-item'));
  const changed=await createRetailerQuoter(replay().fetcher)({...order,materialsGrosze:13199},'00-001');
  assert.deepEqual(changed,{reason:'price_changed'});
  const wrongQty=await createRetailerQuoter(replay(2,(value,path)=>{if(path==='/wp-json/wc/store/v1/cart'&&value.items?.length)value.items[0].quantity=1}).fetcher)(order,'00-001');
  assert.deepEqual(wrongQty,{reason:'basket_not_confirmed'});
  const unavailable=await createRetailerQuoter(replay().fetcher)({...order,materialsGrosze:217800,lines:[{...order.lines[0],packages:[{...order.lines[0].packages[0],count:33,lineCostGrosze:217800}]}]},'00-001');
  assert.deepEqual(unavailable,{reason:'insufficient_stock'});
});

test('Pati adds tile before Carina and quotes one courier for the complete mixed cart',async()=>{
  const carina=RETAIL_SOURCES.find(row=>row.id==='pati-cersanit-carina-k98-0135')!;
  const order:DeliveredStoreBasket={store:source.store,materialsGrosze:40293,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[
    {product:{id:carina.ean,name:carina.name,imageUrl:carina.imageUrl!},unit:'szt',packages:[{offerId:carina.id,count:1,packageSize:1,lineCostGrosze:27093,unitPriceGrosze:27093,store:carina.store,url:carina.url}]},
    {product:{id:source.ean,name:source.name,imageUrl:source.imageUrl!},unit:'m2',packages:[{offerId:source.id,count:2,packageSize:1.2,lineCostGrosze:13200,unitPriceGrosze:6600,store:source.store,url:source.url}]},
  ]};
  const {fetcher,paths}=replay(2,undefined,true);
  const result=await createRetailerQuoter(fetcher)(order,'00-001');
  assert.ok('quote' in result);assert.equal(result.quote.costGrosze,19500);
  assert.equal(order.materialsGrosze+result.quote.costGrosze,59793);
  assert.ok(paths.indexOf(new URL(source.url).pathname)<paths.indexOf('/wp-json/wc/store/v1/cart/add-item'));
  assert.equal(paths.filter(path=>path==='/wp-json/wc/store/v1/cart/select-shipping-rate').length,1);
});

test('Pati measurement route accepts only reviewed product and bounded pack count',async()=>{
  const client=new AnonymousShop('https://patiartstudio.pl',async()=>{throw Error('unexpected request')},AbortSignal.timeout(1000));
  for(const count of [0,10001,1.5]) await assert.rejects(client.patiTileAdd(count),/invalid_cart_action/);
  const other=new AnonymousShop('https://budshop24.pl',async()=>{throw Error('unexpected request')},AbortSignal.timeout(1000));
  await assert.rejects(other.patiTileAdd(1),/invalid_cart_action/);
});
