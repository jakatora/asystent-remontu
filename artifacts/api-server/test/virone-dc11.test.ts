import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource } from '../src/lib/retail-pages';
import fixture from './fixtures/virone-dc11-shoper.json';

test('two actual CO detector sources bind the same exact barcode and whole device to gross PLN prices', async () => {
  for (const row of fixture.snapshots) {
    const source = RETAIL_SOURCES.find(s => s.id === row.sourceId)!; assert.ok(source);
    const mock = async () => new Response(JSON.stringify(row.item), { headers:{'content-type':'application/json'} });
    const observed = await readRetailSource(source, mock as typeof fetch);
    assert.equal(observed.ean, '5908254851223'); assert.equal(source.packageSize, 1); assert.equal(source.unit, 'szt');
    assert.equal(observed.priceGrosze, source.store === 'Prescot' ? 7300 : 9440);
    assert.notEqual(observed.priceGrosze, Math.round(row.item.price.net.final_float * 100));
  }
});
test('wrong CO barcode, native SKU, purchase unit and stock cannot inherit a valid offer', async () => {
  const row = fixture.snapshots[0], source = RETAIL_SOURCES.find(s=>s.id===row.sourceId)!;
  for (const patch of [{ean:'5908254851224'}, {code:'OTHER'}, {unit:{name:'opak',floating_point:false}}, {can_buy:false}]) {
    const mock = async () => new Response(JSON.stringify({...row.item,...patch}), {headers:{'content-type':'application/json'}});
    await assert.rejects(readRetailSource(source,mock as typeof fetch));
  }
});
