import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import fixture from './fixtures/unimet-corner-purchase.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';
import { createRemontService } from '../src/shared-backend';

const source = RETAIL_SOURCES.find(s => s.id === 'unimet-corner-mesh-25m')!;

test('the actual Unimet corner card keeps a 2.5 m physical strip and a separate minimum of 25 pieces', () => {
  assert.equal(source.packageSize, 2.5); assert.equal(source.minimumPackages, 25);
  assert.equal(source.purchaseMultiple ?? 1, 1);
  const observation = parseRetailPage(fixture.html, source, new Date());
  assert.equal(observation.ean, '5900308102411'); assert.equal(observation.priceGrosze, 635);
  assert.ok(!/name="token"|form_key|nonce/.test(fixture.html));
});

test('changed minimum, native product, form, unit and ambiguous quantity cannot retain the reviewed purchase rule', () => {
  assert.throws(() => parseRetailPage(fixture.html.replace('min="25"', 'min="26"'), source, new Date()), /purchase_rules_changed/);
  for (const html of [fixture.html.replace('min="25"', ''), fixture.html.replace('name="id_product" value="262771"', 'name="id_product" value="262772"'),
    fixture.html.replace('id="quantity_wanted"', 'id="other_quantity"'), fixture.html.replace('</form>', '<input name="qty" id="quantity_wanted" min="25"></form>')]) {
    assert.throws(() => parseRetailPage(html, source, new Date()));
  }
  for (const patch of [{ minimumPackages: 1 }, { purchaseMultiple: 25 }, { packageSize: 62.5 }, { unit: 'szt' }, { ean: '5900308102589' }]) {
    assert.throws(() => parseRetailPage(fixture.html, { ...source, ...patch }, new Date()), /product_package_not_confirmed/);
  }
});

test('project HTTP applies the retailer minimum once across jobs while leaving unquoted transport unknown', async () => {
  const observation = parseRetailPage(fixture.html, source, new Date());
  // Isolate the minimum-order regression from merchant transport availability.
  const service = createRemontService({ initialObservations: [observation], background: false,
    basketQuoter: async () => ({ reason: 'quote_unavailable' }),
  });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const port = (server.address() as { port: number }).port;
    for (const [quantities, count] of [[[2.5, 2.5], 25], [[65], 26]] as const) {
      const response = await fetch(`http://127.0.0.1:${port}/pricing/project`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jobs: quantities.map((quantity, i) => ({ jobId: 'corner-' + i, materials: [{
          material: { id: 'corner', name: source.name, ean: source.ean, category: source.category, unit: source.unit }, quantity,
        }] })), options: { store: 'Unimet', delivery: { mode: 'shipping', postalCode: '30-001' } } }),
      });
      assert.equal(response.status, 200); const result = await response.json(), d = result.deliveryComparison;
      assert.equal(d.best, null); assert.equal(d.status, 'needs_delivery_costs');
      const plan = d.purchasePlan; assert.equal(plan.stores.length, 1);
      assert.equal(plan.materialsGrosze, count * 635); assert.equal(plan.deliveryGrosze, null); assert.equal(plan.totalGrosze, null);
      assert.equal(plan.stores[0].lines[0].packages[0].count, count);
      assert.equal(plan.stores[0].lines[0].packages[0].packageSize, 2.5);
    }
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});
