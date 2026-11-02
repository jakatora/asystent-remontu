import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BRUSH_SOURCES} from './brush-sources';
import {RETAIL_SOURCES} from './retail-catalog';
import {parseRetailPage} from './retail-pages';

// Narrow fixture mirrors the actual Sewera card structure, excluding related
// products. Price is a test input, never production catalogue data.
const card=(overrides:{ean?:string;name?:string;gross?:string;stock?:number}={})=>`<div itemscope itemtype="https://schema.org/Product"><h1 itemprop="name">${overrides.name??'Pędzel angielski 50mm Kraus'}</h1><div itemprop="offers" itemscope itemtype="https://schema.org/Offer"><meta itemprop="price" content="3.85"><meta itemprop="priceCurrency" content="PLN"><div class="priceShow">${overrides.gross??'3,85'} zł brutto / SZT</div></div><div><strong>Kod kreskowy:</strong> ${overrides.ean??'5904178020035'}</div><div><strong>Producent:</strong> KRAUS POLAND</div><div><strong>Dostępne:</strong> ${overrides.stock??427} SZT</div></div>`;

test('one exact Kraus model is registered, with a gross piece price and its own reviewed photograph',()=>{
  const source=BRUSH_SOURCES[0];assert.equal(RETAIL_SOURCES.filter(s=>s.id===source.id).length,1);assert.equal(source.packageSize,1);assert.equal(source.unit,'szt');
  const actual=parseRetailPage(card(),source,new Date('2026-11-02T18:00:00Z'));assert.equal(actual.priceGrosze,385);assert.equal(actual.ean,'5904178020035');assert.equal(actual.availability,'in_stock');assert.equal(actual.imageUrl,source.imageUrl);
});

test('a different barcode, brush width, gross mismatch or unavailable product cannot become a current offer',()=>{
  for(const changed of [{ean:'5907758558157'},{name:'Pędzel angielski 25mm Kraus'},{gross:'3,13'},{stock:0}])assert.throws(()=>parseRetailPage(card(changed),BRUSH_SOURCES[0],new Date()));
});
