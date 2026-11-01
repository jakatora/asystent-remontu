import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {CERESIT_PRIMER_SOURCES} from './ceresit-primers';
import {parseRetailPage} from './retail-pages';

const fixtures=JSON.parse(readFileSync(new URL('./fixtures/ceresit-primers-wave174.json',import.meta.url),'utf8')) as {sourceId:string;html:string;priceGrosze:number}[];
const now=new Date('2026-11-01T17:42:00Z');
test('real retailer product fragments confirm separate litre cans, gross prices and stock',()=>{
  for(const source of CERESIT_PRIMER_SOURCES){
    const fixture=fixtures.find(row=>row.sourceId===source.id)!;
    const observed=parseRetailPage(fixture.html,source,now);
    assert.equal(observed.priceGrosze,fixture.priceGrosze);assert.equal(observed.availability,'in_stock');
    assert.equal(observed.ean,source.ean);assert.equal(observed.sourceId,source.id);assert.equal(observed.sourceUrl,source.url);
    assert.equal(observed.currency,'PLN');assert.ok(observed.imageUrl?.endsWith(source.ean+'_1.webp'));
  }
});
test('a neighbouring CT17 barcode, unavailable offer or inconsistent gross price cannot be imported',()=>{
  for(const source of CERESIT_PRIMER_SOURCES){
    const fixture=fixtures.find(row=>row.sourceId===source.id)!;
    const other=CERESIT_PRIMER_SOURCES.find(row=>row.ean!==source.ean)!;
    assert.throws(()=>parseRetailPage(fixture.html.replaceAll(source.ean,other.ean),source,now));
    assert.throws(()=>parseRetailPage(fixture.html.replaceAll('https://schema.org/InStock','https://schema.org/OutOfStock'),source,now));
    const wrongPrice=fixture.html.replace(/(<meta itemprop="price" content=")[^"]+/, '$11.00');
    assert.notEqual(wrongPrice,fixture.html);assert.throws(()=>parseRetailPage(wrongPrice,source,now));
  }
});
test('duplicate primary products are rejected instead of taking an unrelated recommendation price',()=>{
  const source=CERESIT_PRIMER_SOURCES[0],fixture=fixtures.find(row=>row.sourceId===source.id)!;
  assert.throws(()=>parseRetailPage(fixture.html+fixture.html,source,now));
});

test('reviewed cans cannot become another volume, kilograms, a carton or a neighbouring product through metadata changes',()=>{
  for(const source of CERESIT_PRIMER_SOURCES)for(const patch of [{packageSize:source.packageSize===5?10:5},{unit:'kg'},{purchaseMultiple:12},{minimumPackages:6},{ean:'5901793357737'},{variant:['5l','10l']},{brand:'Knauf'},{productId:99999}]){
    assert.throws(()=>parseRetailPage('',{...source,...patch},now),/product_package_not_confirmed/);
  }
});
