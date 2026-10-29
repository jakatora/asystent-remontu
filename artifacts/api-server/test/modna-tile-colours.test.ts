import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixtures from './fixtures/modna-tile-colours.json';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readModnaProduct} from '../src/lib/modna-product';
import {parseRetailPage} from '../src/lib/retail-pages';

test('new Ennis colours each bind their own primaryEAN/photo and price one1.43m² four-tile pack',()=>{
 for(const fixture of fixtures){const source=RETAIL_SOURCES.find(s=>s.id===fixture.sourceId)!;assert.ok(source);const p=readModnaProduct(fixture.html,source),o=parseRetailPage(fixture.html,source,new Date(fixture.observedAt));assert.equal(p.priceGrosze,10729);assert.equal(o.priceGrosze,10729);assert.equal(o.ean,source.ean);assert.equal(source.packageSize,1.43);assert.equal(p.maxPackages,349);assert.match(p.imageUrl,new RegExp(source.ean==='5904584158285'?'light-grey':'light-beige'));assert.equal(source.pickupRequiresConfirmation,true);}
});
test('new Ennis sources reject another colour, format, package or inconsistent gross amount',()=>{
 for(const fixture of fixtures){const source=RETAIL_SOURCES.find(s=>s.id===fixture.sourceId)!;assert.throws(()=>readModnaProduct(fixture.html,{...source,ean:source.ean==='5904584158285'?'5904584158247':'5904584158285'}));assert.throws(()=>readModnaProduct(fixture.html,{...source,packageSize:1}));assert.throws(()=>readModnaProduct(fixture.html.replaceAll('107,29','88,65'),source));assert.throws(()=>readModnaProduct(fixture.html.replaceAll('59,8X59,8','59,8X119,8'),source));}
});
