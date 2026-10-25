import assert from 'node:assert/strict';
import { test } from 'node:test';
import { estimateStageCost } from './estimate';
import { compareAutomaticDelivery } from './automatic-delivery';
import type { BasketQuoter } from './delivery';
import type { Database, Product, ProductOffer } from '@workspace/db/repositories';

async function stage(quantity = 2) {
  const product = { id:'p', name:'Farba', category:'paint', packageSize:'5', packageUnit:'l', imageUrl:null } as Product;
  const offers = ['A','B'].map((store,i) => ({ id:store, productId:'p', store, price:i ? '5.00' : '6.00', promoPrice:null, packageSize:'5', source:'observed-store-page', availability:'in_stock', fetchedAt:new Date(), productUrl:null } as ProductOffer));
  return estimateStageCost({} as Database, [{ query:{ ean:'5903973139188' }, quantity:quantity*5, unit:'l' }], {}, {
    findProductByCode:async()=>product, findProductByNameAndCategory:async()=>product, listOffers:async()=>offers,
  });
}
const known: BasketQuoter = async order => ({ quote:{ costGrosze:order.store === 'A' && order.materialsGrosze >= 1200 ? 0 : 600,
  carrier:'Kurier', payment:'Przelew', checkedAt:new Date().toISOString(), expiresAt:new Date(Date.now()+60_000).toISOString(),
  sourceUrl:'https://example.org/basket', destinationScope:'PL', basis:'retailer_basket_national', evidenceSha256:'a'.repeat(64) } });
test('actual basket threshold can outweigh cheaper materials; each store charged once', async () => {
  const result = await compareAutomaticDelivery([await stage()], {mode:'shipping',postalCode:'00-001'}, known);
  assert.equal(result.status,'compared'); assert.equal(result.best!.totalGrosze,1200);
  assert.equal(result.best!.stores[0].store,'A'); assert.equal(result.best!.stores.length,1);
  assert.equal(result.best!.stores[0].lines[0].packages[0].count,2);
});
test('all pack splits are considered; fixed store-subset greedy pricing would miss this case', async () => {
  const result = await compareAutomaticDelivery([await stage()], {mode:'shipping',postalCode:'00-001'}, async order => {
    const outcome = await known(order,'00-001'); if ('quote' in outcome) outcome.quote.costGrosze = order.lines[0].packages[0].count === 1 ? 0 : 2000; return outcome;
  });
  assert.equal(result.best!.totalGrosze,1100); assert.equal(result.best!.stores.length,2);
});
test('automatic mode ignores old manual fees, blocks missing postcode, exposes unknown quotes', async () => {
  let calls = 0;
  const quote: BasketQuoter = async order => { calls++; return order.store === 'A' ? known(order,'00-001') : { reason:'quote_unavailable' }; };
  const s = await stage();
  const empty = await compareAutomaticDelivery([s], {mode:'shipping',costsGrosze:{B:0}}, quote);
  assert.equal(empty.status,'needs_postal_code'); assert.equal(calls,0);
  const result = await compareAutomaticDelivery([s], {mode:'shipping',postalCode:'00-001',costsGrosze:{B:0}}, quote);
  assert.equal(result.best!.stores[0].store,'A'); assert.equal(result.status,'needs_delivery_costs');
  assert.deepEqual(result.missingDeliveryStores,['B']);
  assert.equal((await compareAutomaticDelivery([await stage(61)], {mode:'shipping',postalCode:'00-001'}, quote)).status,'limit_exceeded');
});
