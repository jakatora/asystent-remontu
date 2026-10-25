import assert from 'node:assert/strict';
import {test} from 'node:test';
import {inspectWooProductCard} from '../src/lib/woocommerce-product';
import {readRetailSource,type RetailSource} from '../src/lib/retail-pages';
import {AnonymousShop} from '../src/lib/retailer-http';

const source:RetailSource={id:'domat-test',store:'Domat',format:'woocommerce',productId:29071,ean:'5907651691616',name:'Płyta gipsowa GKBI 12.5 1200*2600 ZIELONA',brand:'Norgips',category:'gypsum-board',packageSize:3.12,unit:'m2',variant:['GKBI','12.5','1200','2600'],url:'https://domat24.pl/produkt/plyta-gipsowa-gkbi-12-5-12002600-zielona/'};
const card=()=>`<div id="product-29071"><h2 class="product_title">${source.name}</h2><div data-widget_type="riode_sproduct_price.default"><p class="price"><span>57,12&nbsp;<span>&#122;&#322;</span></span></p></div><p class="stock in-stock">Dostępny w magazynie</p><form class="cart"><input name="quantity" min="1" step="1"><button name="add-to-cart" value="29071">Dodaj</button></form><div class="product_meta"><span class="sku">01909</span><span class="hwp-gtin">EAN: <span>${source.ean}</span></span></div></div>`;
const money=(extra:object)=>({currency_code:'PLN',currency_minor_unit:2,...extra});
const cart=()=>({items_count:1,items:[{id:29071,quantity:1,sku:'01909',name:source.name,images:[{src:'https://domat24.pl/board.jpg'}],prices:money({price:'5712'}),totals:money({line_total:'4644',line_total_tax:'1068',line_subtotal:'4644',line_subtotal_tax:'1068'})}],shipping_address:{country:'PL'},coupons:[],fees:[],errors:[],totals:money({total_items:'4644',total_items_tax:'1068',total_discount:'0',total_discount_tax:'0',total_fees:'0',total_fees_tax:'0'}),shipping_rates:[{shipping_rates:[{method_id:'domat_transport_wlasny',price:'0',taxes:'0'}]}]});
function mock(transform:(value:ReturnType<typeof cart>)=>unknown=value=>value) {
  let sessions=0;const seen:string[]=[];
  const fetchImpl:typeof fetch=async(input,options)=>{
    const url=new URL(String(input));seen.push(url.pathname);
    if(url.pathname===new URL(source.url).pathname)return new Response(card());
    if(url.pathname==='/wp-json/wc/store/v1/cart') {
      const session=++sessions;
      return new Response(JSON.stringify({items:[],items_count:0}),{headers:{'content-type':'application/json','Cart-Token':`anonymous-${session}`,'Set-Cookie':`woosid=${session}; Path=/; HttpOnly`}});
    }
    assert.equal(url.pathname,'/wp-json/wc/store/v1/cart/add-item');
    assert.equal(new Headers(options?.headers).get('content-type'),'application/json');
    const headers=new Headers(options?.headers);
    const session=headers.get('cookie')?.match(/(?:^|;\s*)woosid=(\d+)(?:;|$)/)?.[1];
    assert.ok(session,'each token must belong to its own anonymous cookie session');
    assert.equal(headers.get('cart-token'),`anonymous-${session}`);
    assert.deepEqual(JSON.parse(String(options?.body)),{id:29071,quantity:1});
    return new Response(JSON.stringify(transform(cart())),{status:201,headers:{'content-type':'application/json'}});
  };
  return {fetchImpl,seen,get sessions(){return sessions;}};
}

test('WooCommerce price is the confirmed gross cart amount, never net tax base or a free-HDS placeholder',async()=>{
  const server=mock();const result=await readRetailSource(source,server.fetchImpl);
  assert.equal(result.priceGrosze,5712);assert.equal(result.ean,source.ean);assert.equal(result.imageUrl,'https://domat24.pl/board.jpg');
  assert.equal('deliveryGrosze'in result,false);assert.equal('costGrosze'in result,false);
  assert.ok(!JSON.stringify(result).includes('anonymous-'));
  assert.equal(server.seen.length,3);
  for(const change of [
    (value:ReturnType<typeof cart>)=>{value.items[0].totals.line_total_tax='0';return value;},
    (value:ReturnType<typeof cart>)=>{value.items[0].quantity=2;return value;},
    (value:ReturnType<typeof cart>)=>{value.items[0].sku='another';return value;},
    (value:ReturnType<typeof cart>)=>{value.totals.currency_minor_unit=0;return value;},
    (value:ReturnType<typeof cart>)=>{value.shipping_address.country='DE';return value;},
  ])await assert.rejects(readRetailSource(source,mock(change).fetchImpl));
});

test('WooCommerce primary EAN, form and stock cannot come from a related product',()=>{
  assert.equal(inspectWooProductCard(card(),source).sku,'01909');
  assert.throws(()=>inspectWooProductCard(card().replace(source.ean,'5907651690442')+`<aside>${source.ean}</aside>`,source),/ean_not_confirmed/);
  assert.throws(()=>inspectWooProductCard(card().replace('value="29071"','value="29078"'),source),/id_not_confirmed/);
  assert.throws(()=>inspectWooProductCard(card().replace('stock in-stock','stock out-of-stock'),source),/out_of_stock/);
  assert.throws(()=>inspectWooProductCard(card().replace('step="1"','step="10"'),source),/unit_not_confirmed/);
});

test('WooCommerce anonymous tokens are isolated and cannot authorize checkout endpoints',async()=>{
  const server=mock();await Promise.all([readRetailSource(source,server.fetchImpl),readRetailSource(source,server.fetchImpl)]);
  assert.equal(server.sessions,2);
  const isolated=new AnonymousShop('https://domat24.pl',server.fetchImpl,AbortSignal.timeout(1000));
  await assert.rejects(isolated.cartJson('/wp-json/wc/store/v1/checkout',{id:29071}),/invalid_cart_route/);
  await assert.rejects(isolated.cartJson('/wp-json/wc/store/v1/cart/add-item',{id:29071}),/cart_session_not_confirmed/);
  assert.equal(server.sessions,2);
});
