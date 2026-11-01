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

test('a confirmed single-store basket is retained even when the first three alternatives all split purchases',async()=>{
 const input=await stage(),line=input.lines[0];assert.ok(line.resolved);line.offers=['A','B','C','D'].map((store,i)=>({...line.offers[0],id:store,store,price:String(5+i)}));
 const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:false},async(order,p)=>{const q=await known(order,p);assert.ok('quote'in q);q.quote.costGrosze=order.lines.flatMap(l=>l.packages).reduce((n,pack)=>n+pack.count,0)>1?5000:0;return q;});
 assert.equal(result.best!.totalGrosze,1100);assert.equal(result.best!.stores.length,2);assert.equal(result.alternatives.length,3);assert.ok(result.alternatives.every(b=>b.stores.length===2));
 assert.equal(result.cheapestSingleStore!.stores.length,1);assert.equal(result.cheapestSingleStore!.stores[0].store,'A');assert.equal(result.cheapestSingleStore!.totalGrosze,6000);
 assert.ok(!result.alternatives.includes(result.cheapestSingleStore!));
});

test('full one-store variants remain worth quoting beyond the winning multi-store material bound',async()=>{
 const input=await stage(),line=input.lines[0];assert.ok(line.resolved);const original=line.offers[0];line.offers=[
  {...original,id:'a5',store:'A',packageSize:'5',price:'5.00'},{...original,id:'a10',store:'A',packageSize:'10',price:'12.00'},
  {...original,id:'a15',store:'A',packageSize:'15',price:'20.00'},{...original,id:'b5',store:'B',packageSize:'5',price:'2.00'},
 ];const seen:string[][]=[];
 const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:false},async(order,p)=>{const packs=order.lines.flatMap(l=>l.packages);seen.push(packs.map(pack=>pack.offerId+':'+pack.count));const q=await known(order,p);assert.ok('quote'in q);q.quote.costGrosze=packs.length===1&&(packs[0].offerId==='a10'||packs[0].packageSize===5&&packs[0].count===1)?0:5000;return q;});
 assert.equal(result.best!.totalGrosze,700);assert.equal(result.best!.stores.length,2);assert.equal(result.cheapestSingleStore!.totalGrosze,1200);
 assert.deepEqual(result.cheapestSingleStore!.stores[0].lines[0].packages.map(p=>[p.offerId,p.count]),[['a10',1]]);assert.ok(seen.some(p=>p.length===1&&p[0]==='a10:1'));
});

test('one-store output never promotes missing delivery, invalid stock or a stale quote to a payable option',async()=>{
 for(const reason of ['quote_unavailable','insufficient_stock','price_changed']){const result=await compareAutomaticDelivery([await stage()],{mode:'shipping',postalCode:'00-001'},async()=>({reason}));assert.equal(result.best,null);assert.equal(result.cheapestSingleStore??null,null);}
 const result=await compareAutomaticDelivery([await stage()],{mode:'shipping',postalCode:'00-001'},async(order,p)=>{const q=await known(order,p);assert.ok('quote'in q);q.quote.expiresAt=new Date(Date.now()-1).toISOString();return q;});assert.equal(result.cheapestSingleStore??null,null);
});

test('a complete fewer-store choice is retained beyond three cheaper multi-store alternatives and the material bound',async()=>{
 const template=await manyProducts(3,1);
 const sellers:Array<Array<[string,number]>>=[[
  ['A0',100],['A1',101],['A2',102],['A3',103],['D',1000],['E',10000]
 ],[['B',100],['D',1000],['E',10000]],[['C',100],['E',10000]]];
 for(let i=0;i<template.lines.length;i++){const line=template.lines[i];assert.ok(line.resolved);line.offers=sellers[i].map(([store,price])=>({...line.offers[0],id:`${i}-${store}`,store,price:(price/100).toFixed(2)}));}
 const calls:string[][]=[];
 const result=await compareAutomaticDelivery([template],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:false},async(order,p)=>{calls.push(order.lines.flatMap(l=>l.packages.map(pack=>pack.offerId)));const q=await known(order,p);assert.ok('quote'in q);q.quote.costGrosze=0;return q;});
 assert.equal(result.best!.totalGrosze,300);assert.equal(result.best!.stores.length,3);
 assert.equal(result.alternatives.length,3);assert.ok(result.alternatives.every(b=>b.stores.length===3));
 const fewer=result.cheapestFewerStores!;assert.equal(fewer.totalGrosze,2100);assert.deepEqual(fewer.stores.map(s=>s.store).sort(),['C','D']);
 assert.equal(result.cheapestSingleStore!.totalGrosze,30000);assert.ok(!result.alternatives.includes(fewer));
 assert.deepEqual(fewer.stores.flatMap(s=>s.lines.map(l=>l.product.id)).sort(),['product-0','product-1','product-2']);
 assert.ok(calls.some(ids=>ids.length===2&&ids.includes('0-D')&&ids.includes('1-D')));assert.ok(calls.length<=80);
});

test('a fewer-store option cannot be made from a rejected or expired complete order',async()=>{
 for(const failure of ['quote_unavailable','price_changed','expired']){
  const input=await manyProducts(3,1);
  for(let i=0;i<input.lines.length;i++){const line=input.lines[i];assert.ok(line.resolved);line.offers=[{...line.offers[0],id:`${i}-local`,store:`L${i}`,price:'1.00'},...(i<2?[{...line.offers[0],id:`${i}-D`,store:'D',price:'10.00'}]:[])];}
  const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:false},async(order,p)=>{if(order.store==='D'&&failure!=='expired')return{reason:failure};const q=await known(order,p);assert.ok('quote'in q);q.quote.costGrosze=0;if(order.store==='D')q.quote.expiresAt=new Date(Date.now()-1).toISOString();return q;});
  assert.equal(result.best!.stores.length,3);assert.equal(result.best!.totalGrosze,300);assert.equal(result.cheapestFewerStores,null);
 }
});

test('merchant m² rounding affects materials and payable ranking, never freight or physical pack price',async()=>{
 const input=await stage();for(const line of input.lines)if(line.resolved)line.offers=line.offers.filter(o=>o.store==='A');const before=JSON.stringify(input);
 const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:true},async(order,p)=>{const r=await known(order,p);assert.ok('quote'in r);r.quote.costGrosze=100;r.quote.materialsRoundingGrosze=1;return r;});
 const b=result.best!,s=b.stores[0];assert.equal(b.materialsGrosze,1201);assert.equal(b.deliveryGrosze,100);assert.equal(b.totalGrosze,1301);assert.equal(s.materialsGrosze,1201);assert.equal(s.lines[0].packages[0].unitPriceGrosze,600);assert.equal(s.lines[0].packages[0].lineCostGrosze,1200);assert.equal(s.quote!.orders,undefined);assert.equal(result.searchLimited,true);assert.equal(JSON.stringify(input),before);
 for(const rounding of [NaN,1.5,3,-1200]){const bad=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001'},async(order,p)=>{const r=await known(order,p);assert.ok('quote'in r);r.quote.materialsRoundingGrosze=rounding;return r;});assert.equal(bad.best,null);assert.equal(bad.purchasePlan!.materialsGrosze,1200);}
});

test('free delivery with native line rounding remains a limited comparison until separate-cart totals are verified',async()=>{
 const input=await stage();for(const line of input.lines)if(line.resolved)line.offers=line.offers.filter(o=>o.store==='A');let calls=0;
 const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001',allowSeparateOrders:true},async(order,p)=>{calls++;const r=await known(order,p);assert.ok('quote'in r);r.quote.costGrosze=0;r.quote.materialsRoundingGrosze=0;return r;});
 assert.equal(result.best!.totalGrosze,1200);assert.equal(result.best!.stores[0].quote!.orders,undefined);assert.equal(result.searchLimited,true);assert.equal(calls,1);
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

test('rejected stock, price or purchase rules stay visible without requesting delivery for an impossible order',async()=>{
 for(const reason of ['product_unavailable','insufficient_stock','price_changed','purchase_rules_changed']){
  const result=await compareAutomaticDelivery([await stage()],{mode:'shipping',postalCode:'00-001'},async(order,postcode)=>order.store==='B'?{reason}:known(order,postcode));
  assert.equal(result.status,'compared',reason);assert.equal(result.best!.totalGrosze,1200);assert.deepEqual(result.best!.stores.map(s=>s.store),['A']);
  assert.deepEqual(result.missingDeliveryStores,[]);assert.deepEqual(result.partiallyQuotedStores,[]);assert.deepEqual(result.unavailableStores,[{store:'B',reason}]);
 }
 const empty=await compareAutomaticDelivery([await stage()],{mode:'shipping',postalCode:'00-001'},async()=>({reason:'product_unavailable'}));assert.equal(empty.best,null);assert.equal(empty.status,'needs_delivery_costs');
});

test('rejecting one quantity never clears an unknown quote for a different surviving order from the same store',async()=>{
 const result=await compareAutomaticDelivery([await stage()],{mode:'shipping',postalCode:'00-001'},async(order,postcode)=>{
  if(order.store==='A')return known(order,postcode);
  return{reason:order.lines[0].packages[0].count===2?'product_unavailable':'quote_unavailable'};
 });
 assert.equal(result.best!.totalGrosze,1200);assert.equal(result.status,'needs_delivery_costs');assert.deepEqual(result.missingDeliveryStores,['B']);
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

test('alternate-seller expansion retains cheaper mixed sizes for the other products in a large basket',async()=>{
  const input=await manyProducts(21,3);
  for(const [index,line] of input.lines.entries()){
    assert.ok(line.resolved);
    const original=line.offers[0];
    line.offers=[{...original,id:`fixed-${index}`,store:index===20?'C':'A',price:'1.00'}];
    if(index===0){
      line.quantity=15;
      line.offers=[{...original,id:'a5',store:'A',packageSize:'5',price:'43.15'},
        {...original,id:'a10',store:'A',packageSize:'10',price:'84.48'},
        {...original,id:'b5',store:'B',packageSize:'5',price:'40.00'}];
    }
    if(index===1)line.offers=[{...original,id:'paint-a',store:'A',price:'1.00'},
      {...original,id:'paint-d',store:'D',price:'2.00'}];
  }
  const before=JSON.stringify(input);
  for(const rejectMixed of [false,true]){
    let calls=0;
    const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'00-001'},async(order,postcode)=>{
      calls++;
      if(order.lines.some(line=>line.packages.some(pack=>pack.offerId==='paint-a')))return {reason:'product_unavailable'};
      const primer=order.lines.find(line=>line.product.id==='product-0');
      if(rejectMixed&&primer?.packages.some(pack=>pack.offerId==='a10'))return {reason:'price_changed'};
      const outcome=await known(order,postcode);assert.ok('quote'in outcome);
      outcome.quote.costGrosze=order.store==='A'?1500:order.store==='B'?5000:order.store==='C'?1000:0;return outcome;
    });
    assert.equal(result.searchLimited,true);assert.ok(calls<=80);
    assert.equal(result.best!.totalGrosze,rejectMixed?17545:17363);
    assert.deepEqual(result.best!.stores.map(order=>order.store),['A','C','D']);
    const purchased=result.best!.stores.flatMap(order=>order.lines);
    assert.equal(purchased.length,21);
    assert.deepEqual(purchased.find(line=>line.product.id==='product-0')!.packages.map(pack=>[pack.offerId,pack.count]).sort(),rejectMixed?[['a5',3]]:[['a10',1],['a5',1]]);
    assert.equal(JSON.stringify(input),before);
  }
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
