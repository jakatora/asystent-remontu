import assert from 'node:assert/strict';
import { test } from 'node:test';
import { estimateStageCost } from './estimate';
import { compareAutomaticDelivery } from './automatic-delivery';
import type { BasketQuoter, DeliveryStockLimit, DeliveredStoreBasket } from './delivery';
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

test('merchant m² rounding affects materials and payable ranking, never freight or physical pack price',async()=>{
 const input=await stage();for(const line of input.lines)if(line.resolved)line.offers=line.offers.filter(o=>o.store==='A');const before=JSON.stringify(input);
 const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:true},async(order,p)=>{const r=await known(order,p);assert.ok('quote'in r);r.quote.costGrosze=100;r.quote.materialsRoundingGrosze=1;return r;});
 const b=result.best!,s=b.stores[0];assert.equal(b.materialsGrosze,1201);assert.equal(b.deliveryGrosze,100);assert.equal(b.totalGrosze,1301);assert.equal(s.materialsGrosze,1201);assert.equal(s.lines[0].packages[0].unitPriceGrosze,600);assert.equal(s.lines[0].packages[0].lineCostGrosze,1200);assert.equal(s.quote!.orders,undefined);assert.equal(result.searchLimited,true);assert.equal(JSON.stringify(input),before);
 for(const rounding of [NaN,1.5,3,-1200]){const bad=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001'},async(order,p)=>{const r=await known(order,p);assert.ok('quote'in r);r.quote.materialsRoundingGrosze=rounding;return r;});assert.equal(bad.best,null);assert.equal(bad.purchasePlan!.materialsGrosze,1200);}
});

test('expired merchant rounding cannot remain in an unconfirmed purchase plan',async t=>{
 t.mock.timers.enable({apis:['Date'],now:Date.now()});const input=await stage();for(const line of input.lines)if(line.resolved)line.offers=line.offers.filter(o=>o.store==='A');
 const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001'},async(order,p)=>{const r=await known(order,p);assert.ok('quote'in r);r.quote.materialsRoundingGrosze=1;r.quote.expiresAt=new Date(Date.now()+10).toISOString();t.mock.timers.tick(20);return r;});assert.equal(result.best,null);assert.equal(result.purchasePlan!.materialsGrosze,1200);assert.equal(result.purchasePlan!.stores[0].quote,undefined);
});
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

test('separate-order opt-in splits oneSKU quantities while one-order mode retains the actual full-cart freight',async()=>{
 const input=await stage(4);for(const line of input.lines)if(line.resolved)line.offers=line.offers.filter(o=>o.store==='A');
 const native:BasketQuoter=async order=>({quote:{costGrosze:order.lines[0].packages[0].count===4?24900:6900,carrier:'Courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}});
 const single=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:false},native),split=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:true},native);
 assert.equal(single.best!.deliveryGrosze,24900);assert.equal(single.best!.stores[0].quote!.orders,undefined);assert.equal(single.allowSeparateOrders,false);
 assert.equal(split.best!.deliveryGrosze,13800);assert.equal(split.best!.materialsGrosze,single.best!.materialsGrosze);assert.equal(single.best!.totalGrosze!-split.best!.totalGrosze!,11100);assert.equal(split.allowSeparateOrders,true);
 assert.deepEqual(split.best!.stores[0].quote!.orders!.map(o=>o.lines[0].packages[0].count),[2,2]);assert.equal(split.best!.stores[0].lines[0].packages[0].count,4);
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
test('an ordinary offer short in one branch can join another complete dispatch without a false global stock cap',async()=>{
 const input=await manyProducts(3,1),ids=['paper','paint','tape'];
 for(let i=0;i<input.lines.length;i++){const line=input.lines[i];assert.ok(line.resolved);line.offers=line.offers.map(o=>({...o,id:ids[i],store:'Sewera'}));}
 const native:BasketQuoter=async order=>{
  const offers=order.lines.flatMap(line=>line.packages.map(pack=>pack.offerId));
  if(offers.length===3)return{reason:'requires_separate_dispatch',dispatchGroups:[{dispatchFrom:'Sosnowiec',offerIds:['paper']},{dispatchFrom:'Tarnowskie Góry',offerIds:['paint']},{dispatchFrom:'Katowice',offerIds:[]}],flexibleDispatchOfferIds:['tape']};
  if(offers.length===1&&offers[0]==='tape')return{reason:'insufficient_stock',stockLimits:[{offerId:'tape',store:'Sewera',productId:order.lines[0].product.id,productName:order.lines[0].product.name,maxPackages:0,requestedPackages:1,unitPriceGrosze:100,postalCode:'00-001',dispatchFrom:'Katowice',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://sklep.sewera.pl/index.php?page=koszyk',evidenceSha256:'a'.repeat(64)}]};
  return{quote:{costGrosze:offers.includes('paper')?1990:3090,carrier:'Courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://sklep.sewera.pl/zamowienie',destinationScope:'postal_code',postalCode:'00-001',dispatchFrom:offers.includes('paper')?'Sosnowiec':'Tarnowskie Góry',basis:'retailer_basket_postcode',evidenceSha256:'a'.repeat(64)}};
 };
 const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:true},native);
 assert.equal(result.status,'compared');assert.equal(result.missingProductCount,0);assert.equal(result.best!.materialsGrosze,300);assert.equal(result.best!.deliveryGrosze,5080);assert.equal(result.best!.stores[0].quote!.orders!.length,2);
 assert.ok(!result.stockLimits?.some(limit=>limit.offerId==='tape'));
 assert.equal(result.best!.stores[0].lines.flatMap(line=>line.packages).find(pack=>pack.offerId==='tape')!.count,1);
});

test('proved material lower bounds avoid unnecessary mixed-cart retailer quotes', async () => {
  const input = await manyProducts(5, 2);
  for (const line of input.lines) if (line.resolved) line.offers = line.offers.map(offer => ({
    ...offer, price: offer.store === 'S00' ? '1.00' : '20.00',
  }));
  const called: DeliveredStoreBasket[] = [];
  const result = await compareAutomaticDelivery([input], { mode: 'shipping', postalCode: '00-001' }, async order => {
    called.push(order);
    return { quote: { costGrosze: order.store === 'S00' ? 100 : 0,
      carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 600_000).toISOString(), sourceUrl: 'https://example.org/cart',
      destinationScope: 'PL', basis: 'retailer_basket_national', evidenceSha256: 'a'.repeat(64) } };
  });
  assert.equal(result.status, 'compared');
  assert.equal(result.best?.totalGrosze, 600);
  assert.equal(result.best?.stores[0].store, 'S00');
  assert.ok(called.some(order => order.store === 'S01'));
  assert.ok(called.length < 20, `Expected proven losers to be pruned, got ${called.length} quotes`);
});

test('material bounds still quote a mixed basket that can beat a complete store', async () => {
  const input = await manyProducts(5, 2);
  for (const [index, line] of input.lines.entries()) if (line.resolved) line.offers = line.offers.map(offer => ({
    ...offer, price: index === 4
      ? offer.store === 'S00' ? '2.00' : '0.50'
      : offer.store === 'S00' ? '1.00' : '20.00',
  }));
  const called: DeliveredStoreBasket[] = [];
  const result = await compareAutomaticDelivery([input], { mode: 'shipping', postalCode: '00-001' }, async order => {
    called.push(order);
    return { quote: { costGrosze: order.store === 'S00' ? 100 : 0,
      carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 600_000).toISOString(), sourceUrl: 'https://example.org/cart',
      destinationScope: 'PL', basis: 'retailer_basket_national', evidenceSha256: 'a'.repeat(64) } };
  });
  assert.equal(result.status, 'compared');
  assert.equal(result.best?.totalGrosze, 550);
  assert.deepEqual(result.best?.stores.map(store => store.store), ['S00', 'S01']);
  assert.ok(called.some(order => order.store === 'S00' && order.lines.length === 4));
  assert.ok(called.some(order => order.store === 'S01' && order.lines.length === 1));
});

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

function checkoutLimit(order:DeliveredStoreBasket,maxPackages=2):DeliveryStockLimit {
  const line=order.lines.find(line=>line.product.id==='product-0')!,pack=line.packages[0],checkedAt=new Date();
  return {offerId:pack.offerId,store:order.store,productId:line.product.id,productName:line.product.name,maxPackages,requestedPackages:pack.count,unitPriceGrosze:pack.unitPriceGrosze,
    postalCode:'00-001',dispatchFrom:'Katowice',checkedAt:checkedAt.toISOString(),expiresAt:new Date(checkedAt.getTime()+600_000).toISOString(),sourceUrl:'https://example.org/basket',evidenceSha256:'b'.repeat(64)};
}
async function nativeStockStage() {
  const input=await manyProducts(21,12);
  for(const [index,line] of input.lines.entries())if(line.resolved){
    line.offers=line.offers.filter(offer=>offer.store==='S00'||index===0&&offer.store==='S01');
    if(index===0){line.quantity=20;line.offers=line.offers.map(offer=>({...offer,price:offer.store==='S00'?'4.00':'5.00'}));}
  }
  return input;
}
test('native SKU cap replans a large basket, keeps mandatory goods at the same shop and quotes the remainder elsewhere',async()=>{
  const input=await nativeStockStage(),calls:string[]=[];
  const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001'},async(order,postcode)=>{
    const key=JSON.stringify([order.store,order.lines.flatMap(l=>l.packages.map(p=>[p.offerId,p.count]))]);assert.ok(!calls.includes(key));calls.push(key);
    const paint=order.lines.find(line=>line.product.id==='product-0');
    return order.store==='S00'&&paint&&paint.packages[0].count>2?{reason:'insufficient_stock',stockLimits:[checkoutLimit(order)]}:known(order,postcode);
  });
  assert.ok(result.best);assert.equal(result.searchLimited,true);assert.ok(calls.length<=80);
  const paint=result.best.stores.flatMap(s=>s.lines).filter(l=>l.product.id==='product-0').flatMap(l=>l.packages);
  assert.deepEqual(paint.map(p=>[p.store,p.count]).sort(),[['S00',2],['S01',2]]);
  assert.equal(result.best.stores.find(s=>s.store==='S00')!.lines.length,21);
  assert.equal(result.best.materialsGrosze+result.best.deliveryGrosze!,result.best.totalGrosze);
  assert.equal(result.stockLimits?.[0].maxPackages,2);
  assert.ok(input.lines.every(l=>!l.resolved||l.offers.every(o=>o.maxPackages===undefined)));
  const pickup=await compareAutomaticDelivery([input],{mode:'pickup'},async()=>{throw Error('No checkout for pickup');});
  assert.equal(pickup.stockLimits,undefined);assert.equal(pickup.best!.stores.flatMap(s=>s.lines).find(l=>l.product.id==='product-0')!.packages[0].count,4);
});
test('checkout stock hints require exact offer, count, price, postcode, whole packs and fresh evidence',async()=>{
  const mutations:((limit:DeliveryStockLimit)=>void)[]=[l=>l.offerId='wrong',l=>l.postalCode='40-001',l=>l.unitPriceGrosze++,l=>l.requestedPackages++,l=>l.maxPackages=1.5,l=>l.expiresAt='2020-01-01T00:00:00Z',l=>l.evidenceSha256=''];
  for(const mutate of mutations){
    const result=await compareAutomaticDelivery([await nativeStockStage()],{mode:'shipping',postalCode:'00-001'},async(order,postcode)=>{
      const paint=order.lines.find(line=>line.product.id==='product-0');
      if(order.store!=='S00'||!paint)return known(order,postcode);
      const limit=checkoutLimit(order);mutate(limit);return {reason:'insufficient_stock',stockLimits:[limit]};
    });
    assert.equal(result.stockLimits,undefined);
    assert.ok(result.best?.stores.flatMap(s=>s.lines).filter(l=>l.product.id==='product-0').every(l=>l.packages.every(p=>p.store!=='S00')));
  }
});
test('zero native stock cannot become a free or incomplete full basket',async()=>{
  const input=await nativeStockStage();for(const line of input.lines)if(line.resolved&&line.product.id==='product-0')line.offers=line.offers.filter(o=>o.store==='S00');
  const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001'},async order=>({reason:'insufficient_stock',stockLimits:[checkoutLimit(order,0)]}));
  assert.equal(result.best,null);assert.equal(result.missingProductCount,1);assert.equal(result.stockLimits?.[0].maxPackages,0);
});

test('a delivery expiring during the quote batch keeps materials but cannot remain a confirmed fee or winner', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
  const input = await stage(); for (const line of input.lines) if (line.resolved) line.offers = line.offers.filter(offer => offer.store === 'A');
  const result = await compareAutomaticDelivery([input], { mode: 'shipping', postalCode: '00-001' }, async (order, postcode) => {
    const outcome = await known(order, postcode); assert.ok('quote' in outcome);
    outcome.quote.expiresAt = new Date(Date.now() + 10).toISOString(); t.mock.timers.tick(20); return outcome;
  });
  assert.equal(result.best, null); assert.equal(result.purchasePlan!.materialsGrosze, 1200);
  const store = result.purchasePlan!.stores[0]; assert.equal(store.deliveryGrosze, null); assert.equal(store.totalGrosze, null); assert.equal(store.quote, undefined); assert.equal(store.source, 'unknown');
  assert.ok(result.unavailableStores?.some(row => row.store === 'A' && row.reason === 'quote_expired'));
});
