import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRetailPage } from '../src/lib/retail-pages';
import type { RetailSource } from '../src/lib/retail-pages';

// Observed main-product fields, 2026-10-25:
// source: https://www.abud.pl/product-pol-6204-Tasma-teflonowa-12mm-x-10m-x-0-075mm-Tycner.html
const source: RetailSource={id:'abud-test',ean:'5900950618100',name:'Taśma teflonowa 12mm x 10m x 0.075mm Tycner',brand:'Tycner',category:'sealing-tape',packageSize:1,unit:'szt',store:'ABUD',url:'https://www.abud.pl/product-pol-6204-Tasma-teflonowa-12mm-x-10m-x-0-075mm-Tycner.html',productId:6204,apiPurchaseUnit:'szt.',format:'idosell',variant:['12mm','10m','0.075mm']};
function idosell() {
  return `<form data-product_id="6204"><input id="projector_product_hidden" value="6204"><strong id="projector_price_value">2,00 zł</strong><span class="price_vat">brutto</span><span id="projector_price_unit">szt.</span><input id="projector_number" data-sellby="1" step="1"></form>
  <div data-producer_code="true"><span class="dictionary__producer_code --value">5900950618100</span></div>
  <script type="application/ld+json">${JSON.stringify({'@type':'Product',name:source.name,brand:{name:'Tycner'},image:'https://www.abud.pl/product.webp',offers:[{'@type':'Offer',price:'2.00',priceCurrency:'PLN',availability:'https://schema.org/InStock',eligibleQuantity:{value:'1',unitCode:'szt.'},shippingDetails:{shippingRate:{value:'0.00',currency:'PLN'},shippingDestination:{addressCountry:'DE'}}}]})}</script>`;
}
test('IdoSell confirms the main product, manufacturer code, gross price and purchase unit; foreign shipping cannot supply a Polish quote',()=>{
  const html=idosell();const read=(value:string)=>parseRetailPage(value,source,new Date());
  assert.equal(read(html).priceGrosze,200);
  assert.equal((read(html) as any).deliveryGrosze,undefined);
  assert.throws(()=>read(html.replace('value="6204"','value="6205"')),/id_not_confirmed/);
  assert.throws(()=>read(html.replace('class="dictionary__producer_code --value">5900950618100','class="dictionary__producer_code --value">5900950618101')+'<aside>5900950618100</aside>'),/ean_not_confirmed/);
  assert.throws(()=>read(html.replace('>brutto<','>netto<')),/unit_or_gross_not_confirmed/);
  assert.throws(()=>read(html.replace('2,00 zł','1,63 zł')),/gross_price_mismatch/);
  assert.throws(()=>read(html.replace('data-sellby="1"','data-sellby="12"')),/unit_or_gross_not_confirmed/);
});

// source: https://fixero.com/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-59g264-59g265-10-szt-55h746.html
test('Fixero uses the scoped specification EAN and main price, not another product or hidden dynamic-price duplicate',()=>{
  const fixero:RetailSource={...source,id:'fixero-test',store:'Fixero',format:'fixero',ean:'5902062502735',productId:1956,brand:'Graphite',packageSize:10,name:'Siatka ścierna 225 mm K180 10 szt. 55H746',variant:['225mm','K180','10szt','55H746']};
  const product={'@type':'Product',name:fixero.name,image:'https://fixero.com/mesh.webp',offers:[{'@type':'Offer',price:37,priceCurrency:'PLN',availability:'https://schema.org/InStock'}]};
  const html=`<form id="product_addtocart_form"><input name="product" value="1956"></form><table class="additional-attributes"><tr><td data-th="EAN">5902062502735</td></tr></table><img class="product-brand-image" alt="GRAPHITE"><div class="final-price" itemprop="offers"><span id="product-price-1956">37,00 zł</span></div><template><span id="product-price-1956">0,00 zł</span></template><script type="application/ld+json">${JSON.stringify(product)}</script>`;
  assert.equal(parseRetailPage(html,fixero,new Date()).priceGrosze,3700);
  assert.throws(()=>parseRetailPage(html.replace('data-th="EAN"','data-th="EAN-in-recommendation"'),fixero,new Date()),/code_not_confirmed/);
  assert.throws(()=>parseRetailPage(html.replace('>37,00 zł<','>30,08 zł<'),fixero,new Date()),/gross_price_mismatch/);
});

// source: https://rodimax.pl/P%C5%82yta-gipsowa-zwyk%C5%82a-Norgips-1200-x-2600-x-12%2C5-mm-3%2C12-m2.html
test('Rodimax confirms visible gross price and code and reads the real main photograph when JSON-LD points at a missing jpg',()=>{
  const board:RetailSource={...source,id:'board',format:'rodimax',ean:'5907651690442',name:'Płyta gipsowa Norgips 1200 x 2600 3,12 m2',brand:'Norgips',category:'gypsum-board',packageSize:3.12,unit:'m2',imageUrl:undefined,variant:undefined,url:'https://rodimax.pl/board.html'};
  const html=`<span id="sku">5907651690442</span><div id="cena">26,00 zł <span>brutto (Z VAT 23%)</span></div><figure id="zdj"><img src="/board.jpeg" alt="${board.name}"></figure><script type="application/ld+json">${JSON.stringify({'@type':'Product',gtin13:board.ean,name:board.name,image:'https://www.abud.pl/missing.jpg',offers:{'@type':'Offer',price:26,priceCurrency:'PLN',availability:'https://schema.org/InStock'}})}</script>`;
  const read=(s:string)=>parseRetailPage(s,board,new Date());
  assert.equal(read(html).imageUrl,'https://rodimax.pl/board.jpeg');assert.equal(read(html).priceGrosze,2600);
  assert.throws(()=>read(html.replace('26,00 zł','21,14 zł')),/gross_price_mismatch/);
  assert.throws(()=>read(html.replace('>5907651690442<','>5907651691616<')),/ean_not_confirmed/);
});
