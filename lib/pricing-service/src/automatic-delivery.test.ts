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
  const large = await compareAutomaticDelivery([await stage(61)], {mode:'shipping',postalCode:'00-001'}, quote);
  assert.equal(large.searchLimited,true);assert.ok(large.best);
  assert.equal(large.best.stores[0].lines[0].packages[0].count,61);
  assert.equal(large.best.totalGrosze,36600);
  assert.equal((await compareAutomaticDelivery([await stage(10001)], {mode:'shipping',postalCode:'00-001'}, quote)).status,'limit_exceeded');
});

async function manyProducts(productCount: number, storeCount: number) {
  const template=await stage(1),line=template.lines[0];assert.ok(line.resolved);
  return {...template,lines:Array.from({length:productCount},(_,index)=>({...line,
    product:{...line.product,id:`product-${index}`,name:`Materiał ${index}`},
    offers:Array.from({length:storeCount},(_,store)=>({...line.offers[0],id:`offer-${index}-${store}`,productId:`product-${index}`,store:`S${String(store).padStart(2,'0')}`,price:((100+store)/100).toFixed(2)})),
  }))};
}

test('all 103 product needs survive a large renovation with 12 stores and bounded quote work',async()=>{
  const input=await manyProducts(103,12);let calls=0;
  const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001'},async(order,postcode)=>{
    calls++;const quoted=await known(order,postcode);assert.ok('quote'in quoted);quoted.quote.costGrosze=order.store==='S11'?0:2000;return quoted;
  });
  assert.equal(result.productCount,103);assert.equal(result.searchLimited,true);assert.ok(result.best);assert.ok(calls<=80);
  assert.equal(result.best.totalGrosze,11433);assert.equal(result.best.stores[0].store,'S11');
  const purchased=result.best.stores.flatMap(s=>s.lines);assert.equal(purchased.length,103);
  assert.equal(new Set(purchased.map(l=>l.product.id)).size,103);
  assert.ok(purchased.every(line=>line.packages.reduce((n,p)=>n+p.count*p.packageSize,0)===5));
});

test('a store beyond the 32-bit mask boundary retains its complete basket and can win on shipping',async()=>{
  const result=await compareAutomaticDelivery([await manyProducts(21,33)],{mode:'shipping',postalCode:'00-001'},async(order,postcode)=>{
    const quoted=await known(order,postcode);assert.ok('quote'in quoted);quoted.quote.costGrosze=order.store==='S32'?0:10000;return quoted;
  });
  assert.ok(result.best);assert.equal(result.best.stores[0].store,'S32');assert.equal(result.best.stores[0].lines.length,21);
  assert.equal(result.best.totalGrosze,2772);
});

test('pickup compares all 103 products across 33 stores without a shipping request or subset truncation',async()=>{
  const result=await compareAutomaticDelivery([await manyProducts(103,33)],{mode:'pickup'},async()=>{throw Error('Pickup must not request shipping');});
  assert.equal(result.status,'compared');assert.equal(result.productCount,103);assert.equal(result.best?.totalGrosze,10300);
  assert.equal(result.best?.deliveryGrosze,0);assert.equal(result.best?.stores.flatMap(s=>s.lines).length,103);
  assert.ok(!result.searchLimited);
});

test('large renovation falls back to explicitly limited complete baskets without exceeding I/O bounds', async () => {
  const a = await stage(30);
  const b = await stage(30);
  b.lines.forEach(line => { if (line.resolved) { line.product = { ...line.product, id: 'other' }; line.offers = line.offers.map(offer => ({ ...offer, id: `other-${offer.id}`, productId: 'other' })); } });
  // 31*31 distributions and >80 unique store orders for just these two EANs.
  const calls: any[] = [];
  const result = await compareAutomaticDelivery([a,b], { mode:'shipping',postalCode:'00-001' }, async (order,postcode) => { calls.push(order); return known(order,postcode); });
  assert.equal(result.searchLimited,true);
  assert.ok(result.best);
  assert.ok(result.comparedBasketCount! > 0);
  assert.ok(calls.length <= 80);
  const purchased = result.best!.stores.flatMap(store => store.lines).flatMap(line => line.packages);
  assert.equal(purchased.reduce((count,pack) => count + pack.count,0),60);
  assert.equal(result.best!.materialsGrosze + result.best!.deliveryGrosze!, result.best!.totalGrosze);
});

test('limited baskets consider another seller when a mandatory store lacks enough units of another product', async () => {
  const paint = await stage(60), mandatory = await stage(60);
  paint.lines.forEach(line => { if (line.resolved) line.offers = line.offers.map(offer => offer.store === 'A' ? { ...offer, price:'4.00' } : offer); });
  mandatory.lines.forEach(line => { if (line.resolved) { line.product = { ...line.product, id:'mandatory' }; line.offers = line.offers.filter(offer => offer.store === 'A').map(offer => ({ ...offer, id:'mandatory-A', productId:'mandatory' })); } });
  const result = await compareAutomaticDelivery([paint,mandatory], {mode:'shipping',postalCode:'00-001'}, async (order,postcode) =>
    order.store === 'A' && order.lines.some(line => line.product.id === 'p') ? {reason:'insufficient_stock'} : known(order,postcode));
  assert.equal(result.searchLimited,true); assert.ok(result.best);
  assert.ok(result.best!.stores.find(store => store.store === 'A')!.lines.every(line => line.product.id === 'mandatory'));
  assert.equal(result.best!.stores.find(store => store.store === 'B')!.lines[0].packages[0].count,60);
});

test('known unavailable integrations remain visible without consuming basket slots or hiding purchasable alternatives', async () => {
  const s = await stage(2), called: string[] = [];
  const result = await compareAutomaticDelivery([s], {mode:'shipping',postalCode:'00-001'}, async (order,postcode) => { called.push(order.store); return known(order,postcode); }, [], new Date(), {A:'retailer_access_required'});
  assert.ok(result.best); assert.deepEqual([...new Set(called)],['B']);
  assert.deepEqual(result.missingDeliveryStores,['A']);
  assert.ok(result.unavailableStores?.some(item => item.store === 'A' && item.reason === 'retailer_access_required'));
});

test('large basket quotes both broad and small orders early so transport alternatives are not crowded out', async () => {
  const first = await stage(30), second = await stage(30);
  second.lines.forEach(line => { if (line.resolved) { line.product = { ...line.product, id:'second' }; line.offers = line.offers.map(offer => ({ ...offer,id:`second-${offer.id}`,productId:'second' })); } });
  const calls: { store: string; products: number }[] = [];
  const result = await compareAutomaticDelivery([first,second], {mode:'shipping',postalCode:'00-001'}, async (order,postcode) => { calls.push({store:order.store,products:order.lines.length}); return known(order,postcode); });
  assert.ok(result.best); assert.equal(result.searchLimited,true);
  for (const store of ['A','B']) assert.ok(calls.slice(0,4).some(call => call.store === store && call.products === 1));
});
