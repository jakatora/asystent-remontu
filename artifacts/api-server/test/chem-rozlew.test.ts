import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource } from '../src/lib/retail-pages';
const { item } = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/chem-rozlew-shoper.json'), 'utf8'));
const source = RETAIL_SOURCES.find(row => row.id === 'rabdom-chem-rozlew-extraction-solvent-500ml')!;
const read = (product: unknown, definition = source) => readRetailSource(definition, (async () => new Response(JSON.stringify(product), { headers: { 'content-type': 'application/json' } })) as typeof fetch);

test('Chem-Rozlew gross observation binds one native piece to the exact liquid 500 ml bottle', async () => {
  const o = await read(item);
  assert.equal(o.ean, '5906681230253'); assert.equal(o.priceGrosze, 890);
  assert.equal(o.availability, 'in_stock'); assert.equal(o.imageUrl, source.imageUrl);
  assert.equal(source.packageSize, 500); assert.equal(source.unit, 'ml');
});
test('Chem-Rozlew rejects the 5 l or spray barcode, renamed pack, wrong native SKU/unit, gross mismatch and unavailable stock', async () => {
  for (const patch of [{ ean: '5906681230260' }, { ean: '5906681231083' }, { name: item.name.replace('0,5L', '5L') }, { name: item.name + ' aerozol' }, { code: 'wrong' }, { id: 5458 }, { unit: { name: 'ml', floating_point: true } }, { unit: { name: 'szt.', floating_point: true } }, { can_buy: false }, { price: { gross: { final: item.price.gross.final, final_float: item.price.net.final_float } } }]) await assert.rejects(read({ ...item, ...patch }));
  for (const patch of [{ packageSize: 5000 }, { unit: 'l' }, { retailerSku: undefined }, { apiPurchaseUnit: undefined }, { productId: 6863 }, { ean: '5906681230260' }]) await assert.rejects(read(item, { ...source, ...patch }));
});
