import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Product, ProductOffer } from '@workspace/db/schema';
import { isComparableOffer, selectCheapestOffer, estimateStageCost, compareStores, consolidateProject, type EstimateDeps } from './estimate';
import type { Database } from '@workspace/db/repositories';

const product = { id: 'paint', packageSize: '5' } as Product;
function offer(id: string, store: string, price: string, packageSize = '5', overrides: Partial<ProductOffer> = {}): ProductOffer {
  return { id, productId: 'paint', store, price, promoPrice: null, regularPrice: null, packageSize, unit: 'l', pricePerUnit: null, productUrl: `https://example.com/${id}`, availability: 'in_stock', source: `${store} — feed`, fetchedAt: new Date(), ...overrides };
}

test('the cheapest can is not necessarily the cheapest required purchase', () => {
  const offers = [offer('small', 'A', '60', '5'), offer('large', 'B', '100', '10')];
  assert.equal(selectCheapestOffer(offers)?.offer.id, 'small');
  assert.equal(selectCheapestOffer(offers, null, { quantity: 9, product })?.offer.id, 'large');
});

test('demo, stale, future, untraceable, unavailable and free placeholder offers cannot win', () => {
  const valid = offer('real', 'A', '100');
  const invalid = [
    offer('demo', 'B', '1', '5', { source: 'reference-seed-multi' }),
    offer('old', 'B', '1', '5', { fetchedAt: new Date('2020-01-01') }),
    offer('future', 'B', '1', '5', { fetchedAt: new Date(Date.now() + 86400000) }),
    offer('missing', 'B', '1', '5', { source: null }),
    offer('stock', 'B', '1', '5', { availability: 'out_of_stock' }),
    offer('compact-stock', 'B', '1', '5', { availability: 'outofstock' }),
    offer('zero', 'B', '0'),
  ];
  assert.ok(invalid.every(item => !isComparableOffer(item)));
  assert.equal(selectCheapestOffer([...invalid, valid])?.offer.id, 'real');
  assert.equal(selectCheapestOffer(invalid), null);
});

test('a full basket is compared by required packs; incomplete stores cannot win', async () => {
  const offers = [offer('a', 'A', '60', '5'), offer('b', 'B', '100', '10'), offer('demo', 'C', '1', '10', { source: 'reference-seed-multi' })];
  const deps: EstimateDeps = { findProductByCode: async () => product, findProductByNameAndCategory: async () => null, listOffers: async () => offers };
  const stage = await estimateStageCost({} as Database, [{ query: { ean: 'known' }, quantity: 9, unit: 'l' }], {}, deps);
  assert.equal(stage.stageTotalGrosze, 10000);
  const comparison = compareStores([stage]);
  assert.equal(comparison.cheapestFullStore?.store, 'B');
  assert.equal(comparison.cheapestFullStore?.totalGrosze, 10000);
  assert.equal(comparison.stores.some(store => store.store === 'C'), false);
});

test('basket comparison combines 10 l and 5 l instead of charging for excess cans', async () => {
  const offers = [offer('small', 'A', '40', '5'), offer('large', 'B', '70', '10')];
  const deps: EstimateDeps = { findProductByCode: async () => product, findProductByNameAndCategory: async () => null, listOffers: async () => offers };
  const stage = await estimateStageCost({} as Database, [{ query: { ean: 'known' }, quantity: 15, unit: 'l' }], {}, deps);
  const comparison = compareStores([stage]);
  const consolidated = consolidateProject([stage]);
  assert.equal(comparison.optimalBasketGrosze, 11000);
  assert.equal(comparison.cheapestFullStore?.totalGrosze, 12000);
  assert.equal(comparison.singleStoreExtraGrosze, 1000);
  assert.equal(consolidated.consolidatedTotalGrosze, comparison.optimalBasketGrosze);
  assert.equal(consolidated.lines[0]?.packagePlan?.packages.length, 2);
});
