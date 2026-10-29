import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource } from '../src/lib/retail-pages';
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/v33-easy-kitchen-shoper.json'), 'utf8'));
for (const snap of fixture.snapshots) {
  const source = RETAIL_SOURCES.find(row => row.id === snap.sourceId)!;
  const read = (item: unknown, definition = source) => readRetailSource(definition, (async () => new Response(JSON.stringify(item), { headers: { 'content-type': 'application/json' } })) as typeof fetch);
  test(`V33 ${source.packageSize} ml imports gross price for the exact whole-can SKU and barcode`, async () => {
    const o = await read(snap.item); assert.equal(o.ean, source.ean); assert.equal(o.priceGrosze, source.packageSize === 750 ? 8541 : 17528);
    assert.equal(o.availability, 'in_stock'); assert.equal(o.sourceUrl, source.url);
  });
  test(`V33 ${source.packageSize} ml rejects changed identity, volume, native unit, stock and net/gross ambiguity`, async () => {
    for (const change of [{ ean: '3153895149000' }, { code: 'wrong' }, { id: 1 }, { name: snap.item.name + ' baza do barwienia' }, { unit: { name: 'ml', floating_point: true } }, { can_buy: false }, { price: { gross: { final: snap.item.price.gross.final, final_float: snap.item.price.net.final_float } } }]) await assert.rejects(read({ ...snap.item, ...change }));
    await assert.rejects(read(snap.item, { ...source, packageSize: 1000 }));
    await assert.rejects(read(snap.item, { ...source, unit: 'l' }));
  });
}
