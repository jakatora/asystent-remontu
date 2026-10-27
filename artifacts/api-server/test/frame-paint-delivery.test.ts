import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/abud-rapidry-63790.json';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { quoteAbud } from '../src/lib/abud-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source=RETAIL_SOURCES.find(row=>row.id==='abud-dulux-rapidry-white-matt-1l')!;
function order():DeliveredStoreBasket{return{store:'ABUD',materialsGrosze:13640,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:source.imageUrl!},unit:'ml',packages:[{offerId:source.id,store:'ABUD',url:source.url,packageSize:1000,count:2,unitPriceGrosze:6820,lineCostGrosze:13640}]}]};}
function native(change?:(cart:any)=>void){
  const paths:string[]=[];
  const fetchImpl:typeof fetch=async(input,init)=>{
    const url=new URL(String(input));assert.equal(url.origin,'https://www.abud.pl');paths.push(url.pathname);
    if(url.href===fixture.url)return new Response(fixture.html,{headers:{'content-type':'text/html','set-cookie':'fixture=frame; Path=/'}});
    assert.equal((init?.headers as Record<string,string>).Cookie,'fixture=frame');
    if(url.pathname==='/ajax/client-new.php'){assert.equal(url.searchParams.get('zipcode'),'00-001');return Response.json(fixture.destination);}
    if(url.pathname==='/basketchange.php'){
      const form=new URLSearchParams(String(init?.body));assert.equal(form.get('product'),'63790');assert.equal(form.get('number'),'2');assert.equal(form.get('size'),'onesize');
      const cart=structuredClone(fixture.cart);change?.(cart);return Response.json(cart);
    }
    assert.equal(url.pathname,'/graphql/v1/');assert.doesNotMatch(String(init?.body),/mutation|customer|payment|order/i);return Response.json(fixture.rates);
  };
  return{fetchImpl,paths};
}
test('real Rapidry 1l MAT cart uses op. purchase unit and verified 13 PLN courier for two cans',async()=>{
  const api=native(),result=await quoteAbud(order(),'00-001',api.fetchImpl);
  assert.ok('quote'in result);assert.equal(result.quote.costGrosze,1300);assert.equal(result.quote.carrier,'Pocztex Kurier 24');
  assert.equal(result.quote.basis,'retailer_basket_postcode');assert.equal(api.paths.length,4);assert.equal(source.ean,'5904078222379');
});
test('Rapidry delivery refuses another finish, unit, changed price, missing stock and extra cart products',async()=>{
  for(const change of [(cart:any)=>{cart.basket.products[0].name+=' satynowa';},(cart:any)=>{cart.basket.products[0].price_unit='l';},(cart:any)=>{cart.basket.products[0].prices.gros='68.21';},(cart:any)=>{cart.basket.products[0].reservation_stocksown=1;},(cart:any)=>{cart.basket.products.push(cart.basket.products[0]);}]){
    const api=native(change);await assert.rejects(quoteAbud(order(),'00-001',api.fetchImpl));assert.ok(!api.paths.includes('/graphql/v1/'));
  }
});
test('reviewing Rapidry only expands the public anonymous SKU allowlist; unrelated products remain rejected',async()=>{
  let calls=0;const client=new AnonymousShop('https://www.abud.pl',async()=>{calls++;return Response.json({});},AbortSignal.timeout(1000));
  await client.abud('add',{productId:63790,count:2});
  await assert.rejects(client.abud('add',{productId:63791,count:2}),/invalid_cart_action/);
  await assert.rejects(client.abud('add',{productId:63790,count:2,postalCode:'00-001'}),/invalid_cart_action/);assert.equal(calls,1);
});
