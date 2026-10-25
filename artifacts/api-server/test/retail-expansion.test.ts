import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MATERIAL_PRICES } from '../../mobile/data/prices/materials';
import { getProductPhoto } from '../../mobile/data/products/photos';
import { getProductReferenceStatus, PRODUCT_REFERENCE_STATUS } from '../../mobile/data/products/availability';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { MATERIAL_EAN_OVERLAY } from '../src/lib/ean-overlay';
import { parseRetailPage, readRetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import type { DeliveredStoreBasket } from '../../../../lib/pricing-service/src/delivery';

test('all reference products have precise photographs; Fix All 290 ml never uses the 125 ml code', () => {
  for (const ref of MATERIAL_PRICES) {
    const url = getProductPhoto(ref);
    assert.ok(url?.startsWith('https://'), ref.id);
    assert.ok(!url.includes('export const') && !url.includes('ProductPhoto[]'), ref.id);
  }
  // Image-server presets contain literal $&; import replacement must preserve it.
  assert.match(getProductPhoto(MATERIAL_PRICES.find(r => r.id === 'mat-paint-economy-white-10l')!)!, /\?\$MOB_PREV\$&\$width=284&\$height=284$/);
  const glue = MATERIAL_PRICES.find(r => r.id === 'mat-mounting-adhesive-soudal-fixall-290ml')!;
  assert.equal(glue.packageSize,290); assert.equal(MATERIAL_EAN_OVERLAY[glue.id].ean,'5411183045620');
  assert.ok(glue.sourceUrl?.includes('5411183045620'));
  assert.ok(!RETAIL_SOURCES.some(s => s.ean === '5411183175723'));
  const connector = MATERIAL_PRICES.find(r => r.id === 'mat-wire-connector-wago-221-413')!;
  assert.equal(connector.packageSize,1); assert.match(connector.productLabel,/1 szt/);
  assert.equal(MATERIAL_PRICES.find(r => r.id === 'mat-tile-trim-cezar-corner-8mm-25m')!.packageUnit,'mb');
  const pending = PRODUCT_REFERENCE_STATUS[0];
  assert.equal(getProductReferenceStatus(pending.id,pending.sourceUrl),pending);
  assert.equal(getProductReferenceStatus(pending.id,'https://another-reviewed-retailer.pl/product'),undefined);
});

test('Unimet scopes the main name separately from brand and verifies explicit gross currency and barcode', () => {
  const source = RETAIL_SOURCES.find(s=>s.id==='unimet-fixall-290ml')!;
  const html = `<section itemscope itemtype="https://schema.org/Product"><h1 itemprop="name">${source.name}</h1><meta itemprop="gtin13" content="${source.ean}">
    <div itemprop="brand"><label>Marka</label><span itemprop="name">SOUDAL</span></div>
    <img itemprop="image" src="https://www.unimet.pl/product.webp">
    <div itemprop="offers" itemscope itemtype="https://schema.org/Offer"><meta itemprop="url" content="${source.url}"><meta itemprop="priceCurrency" content="PLN"><link itemprop="availability" href="https://schema.org/InStock"><span itemprop="price" content="31.5">31,50 zł</span></div>
    <div class="tax-shipping-delivery-label">SZT Brutto</div></section>`;
  assert.equal(parseRetailPage(html,source,new Date()).priceGrosze,3150);
  assert.throws(()=>parseRetailPage(html.replace(source.ean,'5411183175723'),source,new Date()),/ean_not_confirmed/);
  assert.throws(()=>parseRetailPage(html.replace('SZT Brutto','SZT Netto'),source,new Date()),/gross_price_mismatch/);
  assert.throws(()=>parseRetailPage(html.replace('31,50 zł','25,61 zł'),source,new Date()),/gross_price_mismatch/);
});

const source = RETAIL_SOURCES.find(s=>s.id==='cezar-tile-trim-8mm-25m')!;
const product = () => ({id:source.productId,title:source.name,available:true,featured_image:'https://cezar.eu/photo.png',variants:[{id:source.variantId,barcode:source.ean,available:true,price:2732,quantity_rule:{min:1,increment:1}}]});
const json = (value: unknown) => new Response(JSON.stringify(value),{headers:{'content-type':'text/javascript','set-cookie':'cart=isolated; Path=/; HttpOnly'}});

test('Shopify price reader confirms exact variant and presentment currency; a same-price wrong variant is rejected', async () => {
  const read = (item: unknown,currency='PLN') => (async (url: unknown) => json(String(url).endsWith('/cart.js')?{currency}:item)) as typeof fetch;
  assert.equal((await readRetailSource(source,read(product()))).priceGrosze,2732);
  await assert.rejects(readRetailSource(source,read(product(),'EUR')),/currency_not_confirmed/);
  const wrong = product(); wrong.variants[0].barcode='5904584853501';
  await assert.rejects(readRetailSource(source,read(wrong)),/ean_not_confirmed/);
});

test('Cezar quotes the actual whole cart and postcode, not the lower shipping teaser; stock changes cannot become zero', async () => {
  const order: DeliveredStoreBasket={store:'Cezar',materialsGrosze:5464,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'cezar-profile',name:source.name,imageUrl:null},unit:'mb',packages:[{offerId:source.id,store:'Cezar',url:source.url,packageSize:2.5,count:2,unitPriceGrosze:2732,lineCostGrosze:5464}]}]};
  let quantity=2; const called:string[]=[];
  const fetchImpl: typeof fetch = async (url,options)=>{
    const u=new URL(String(url));called.push(u.pathname);
    if(u.pathname.includes('/products/'))return json(product());
    if(u.pathname==='/cart/add.js') { const form=new URLSearchParams(String(options?.body));assert.equal(form.get('quantity'),'2');return json({}); }
    if(u.pathname==='/cart.js')return json({currency:'PLN',item_count:quantity,items_subtotal_price:quantity*2732,total_price:quantity*2732,items:[{id:source.variantId,quantity,price:2732,final_price:2732,final_line_price:quantity*2732}]});
    assert.equal(u.pathname,'/cart/shipping_rates.json');assert.equal(u.searchParams.get('shipping_address[zip]'),'00-001');assert.equal(u.searchParams.get('shipping_address[country]'),'Poland');
    return json({shipping_rates:[{name:'InPost Paczkomat',currency:'PLN',price:'14.99'},{name:'DPD Kurier (L)',currency:'PLN',price:'29.99'}]});
  };
  const first=await createRetailerQuoter(fetchImpl)(order,'00-001');assert.ok('quote'in first);assert.equal(first.quote.costGrosze,2999);assert.equal(first.quote.postalCode,'00-001');
  assert.ok(!called.some(path=>path.includes('checkout')));
  quantity=1;assert.deepEqual(await createRetailerQuoter(fetchImpl)(order,'00-001'),{reason:'basket_not_confirmed'});
});

test('Cezar free delivery requires an actual named zero rate for the qualifying whole basket', async () => {
  for (const count of [2,19]) {
    const order: DeliveredStoreBasket={store:'Cezar',materialsGrosze:2732*count,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'profile',name:source.name,imageUrl:null},unit:'mb',packages:[{offerId:source.id,store:'Cezar',url:source.url,packageSize:2.5,count,unitPriceGrosze:2732,lineCostGrosze:2732*count}]}]};
    const fetchImpl: typeof fetch=async url=>{
      const path=new URL(String(url)).pathname;
      if(path.includes('/products/'))return json(product());
      if(path==='/cart/add.js')return json({});
      if(path==='/cart.js')return json({currency:'PLN',item_count:count,items_subtotal_price:2732*count,total_price:2732*count,items:[{id:source.variantId,quantity:count,price:2732,final_price:2732,final_line_price:2732*count}]});
      return json({shipping_rates:[{name:'Gratis',source:'shopify',currency:'PLN',price:'0.00'}]});
    };
    const result=await createRetailerQuoter(fetchImpl)(order,'30-001');
    if(count===19){assert.ok('quote'in result);assert.equal(result.quote.costGrosze,0);}
    else assert.deepEqual(result,{reason:'no_home_delivery'});
  }
});
