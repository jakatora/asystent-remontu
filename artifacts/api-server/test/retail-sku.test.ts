import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';
import { retailProductId, retailProductName } from '../src/lib/retail-sku';
import { createRemontService } from '../src/shared-backend';

const source=RETAIL_SOURCES.find(row=>row.id==='sewera-packcenter-edge-tape-50m')!;
// Minimal fields from the actual main retail card, read 2026-10-27. The
// full original HTML and hash are retained in the release research evidence.
const html=`<link rel="canonical" href="${source.url}">
<div itemscope itemtype="https://schema.org/Product">
<h1 itemprop="name">Taśma dylatacyjna 5mm x 10cm x 50m</h1>
<link itemprop="image" href="https://sklep.sewera.pl/photo/364366/tasma-dylatacyjna-5mm-x-10cm-x-50m.webp">
<input name="add_to_basket_pid" value="465325">
<div><strong>Producent:</strong> PACK-CENTER KOŁODZIEJ I WSPÓLNICY SP.J.</div>
<div><strong>Kod producenta:</strong> TB-FB00202</div>
<div><strong>Kod kreskowy:</strong> 465325</div>
<div><strong>Dostępne:</strong> 46 SZT</div>
<div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
<meta itemprop="price" content="14.06"><meta itemprop="priceCurrency" content="PLN">
<span class="priceShow">14,06 zł brutto / SZT</span></div></div>`;
const now=new Date('2026-10-27T01:34:02Z');

test('a reviewed merchant SKU has a distinct identity, real gross price and no invented EAN',()=>{
  const observation=parseRetailPage(html,source,now);
  assert.equal(observation.ean,'');assert.equal(observation.priceGrosze,1406);
  assert.equal(retailProductId(source),'remont-sku-sewera-465325');
  assert.equal(retailProductName(source),'Taśma dylatacyjna 5mm x 10cm x 50m (Pack-Center TB-FB00202)');
  assert.ok(observation.imageUrl?.includes('/photo/364366/'));
});

test('merchant identity needs the same canonical URL, native cart ID, manufacturer code and primary barcode',()=>{
  for(const changed of [
    html.replace(source.url,'https://sklep.sewera.pl/inny-produkt-p7755'),
    html.replace('value="465325"','value="136125"'),
    html.replace('TB-FB00202','TB-FB00201'),
    html.replace('Kod kreskowy:</strong> 465325','Kod kreskowy:</strong> 5906725207227'),
    html.replace('PACK-CENTER KOŁODZIEJ I WSPÓLNICY SP.J.','ARTCHEM'),
    html.replace('5mm x 10cm x 50m','5mm x 15cm x 50m'),
  ])assert.throws(()=>parseRetailPage(changed,source,now));
  assert.throws(()=>parseRetailPage(html,{...source,ean:'5906725207227'},now));
  assert.throws(()=>parseRetailPage(html,{...source,skuIdentity:{...source.skuIdentity!,catalogKey:'unrelated'}},now));
  assert.throws(()=>retailProductId({...source,skuIdentity:undefined}));
  const actualEan=RETAIL_SOURCES[0];assert.throws(()=>parseRetailPage(html,{...actualEan,ean:''},now));
});

test('a related product, net amount, another currency, unavailable stock or unit cannot supply this SKU price',()=>{
  for(const changed of [html.replace('14,06 zł brutto','11,43 zł brutto'),html.replace('content="PLN"','content="EUR"'),html.replace('46 SZT','0 SZT'),html.replace('46 SZT','46 OPA')])assert.throws(()=>parseRetailPage(changed,source,now));
  const wrong=html.replace('TB-FB00202','OTHER');
  const recommendation='<div><strong>Kod producenta:</strong> TB-FB00202</div><span>14,06 zł</span>';
  assert.throws(()=>parseRetailPage(wrong+recommendation,source,now));
});

test('an identified branch card with zero stock and no purchase form is unavailable, not another product',()=>{
  const input='<input name="add_to_basket_pid" value="465325">';
  const unavailable=html.replace(input,'').replace('46 SZT','0 SZT');
  assert.throws(()=>parseRetailPage(unavailable,source,now),/retailer_out_of_stock/);
  assert.throws(()=>parseRetailPage(html.replace(input,'')+'<input name="add_to_basket_pid" value="136125">',source,now),/identity_not_confirmed/);
});

test('actual HTTP keeps EAN and merchant SKU products separate and aggregates exact named SKU demand',async()=>{
  const fola=RETAIL_SOURCES.find(row=>row.id==='castorama-fola-50mb')!;
  const observation=parseRetailPage(html,source,new Date());
  const service=createRemontService({background:false,basketQuoter:async()=>({reason:'integration_unavailable'}),initialObservations:[observation,{...observation,sourceId:fola.id,ean:fola.ean,name:fola.name,sourceUrl:fola.url,priceGrosze:3548,verification:{method:'browser',checkedAt:observation.observedAt,expiresAt:new Date(Date.parse(observation.observedAt)+86400000).toISOString()}}]});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  const root='http://127.0.0.1:'+(server.address() as {port:number}).port;
  const material={id:'edge',name:retailProductName(source),category:'expansion-tape',unit:'mb'};
  const post=async(materials:unknown[])=>{const r=await fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'first',materials}],options:{delivery:{mode:'shipping',postalCode:'00-001'}}})});assert.equal(r.status,200);return r.json();};
  try{
    const out=await post([{material,quantity:14.7},{material,quantity:14.7},{material:{id:'fola',name:fola.name,ean:fola.ean,category:fola.category,unit:'mb'},quantity:10}]);
    assert.equal(service.status().products,2);assert.equal(out.consolidated.lines.length,2);
    const sku=out.consolidated.lines.find((line:any)=>line.product.id==='remont-sku-sewera-465325');
    assert.equal(sku.product.ean,null);assert.equal(sku.product.gtin,null);assert.equal(sku.totalQuantity,29.4);assert.equal(sku.packagesNeeded,1);assert.equal(sku.lineCostGrosze,1406);
    assert.equal(out.consolidated.lines.find((line:any)=>line.product.ean===fola.ean).lineCostGrosze,3548);
    const wrong=await post([{material:{...material,name:'Taśma dylatacyjna dowolna'},quantity:10}]);assert.equal(wrong.stages[0].lines[0].resolved,false);
    const wrongUnit=await fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'wrong-unit',materials:[{material:{...material,unit:'kg'},quantity:10}]}]})});
    assert.equal(wrongUnit.status,400);assert.equal((await wrongUnit.json()).error,'incompatible_product_unit');
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});
