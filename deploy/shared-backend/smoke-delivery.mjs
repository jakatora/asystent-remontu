import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

// Run against the actual service with a genuine calculator request, never fake
// shipping fees. This creates anonymous quote baskets, without placing orders.
const [base, inputFile, outputFile] = process.argv.slice(2);
if (!base?.startsWith('https://') || !inputFile) throw Error('Usage: node smoke-delivery.mjs <HTTPS api/remont base> <calculator-request.json> [proof.json]');
const input = JSON.parse(readFileSync(inputFile, 'utf8'));
const post = async (delivery, jobs = input.jobs) => {
  const start = Date.now();
  const response = await fetch(`${base}/pricing/project`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ jobs, options:{delivery} }), signal:AbortSignal.timeout(40_000) });
  return { status:response.status, elapsedMs:Date.now()-start, body:await response.json() };
};
const check = result => {
  assert.equal(result.status,200);
  const comparison = result.body.deliveryComparison, best = comparison.best;
  assert.ok(best, 'No fully quoted basket');
  assert.equal(comparison.method,'automatic');
  assert.equal(best.totalGrosze,best.materialsGrosze+best.deliveryGrosze);
  assert.equal(best.totalGrosze,best.stores.reduce((sum,s)=>sum+s.totalGrosze,0));
  for (const store of best.stores) {
    assert.equal(store.source,'retailer'); assert.ok(store.quote);
    assert.equal(store.deliveryGrosze,store.quote.costGrosze);
    assert.equal(store.quote.basis,'retailer_basket_national');
    assert.equal(store.quote.destinationScope,'PL');
    assert.match(store.quote.evidenceSha256,/^[a-f0-9]{64}$/);
    assert.ok(Date.parse(store.quote.expiresAt)>Date.now());
    assert.equal(store.materialsGrosze,store.lines.flatMap(l=>l.packages).reduce((sum,p)=>sum+p.count*p.unitPriceGrosze,0));
  }
  return comparison;
};
const first = await post({mode:'shipping',method:'automatic',postalCode:'00-001'}); const a=check(first);
const second = await post({mode:'shipping',method:'automatic',postalCode:'30-001',costsGrosze:{Zino:0,Realbud:0,'Rab-Dom':0}}); const b=check(second);
assert.equal(a.postalCode,'00-001');assert.equal(b.postalCode,'30-001');
// These retailer APIs return national Polish tariffs; the app must say so.
assert.equal(a.best.deliveryGrosze,b.best.deliveryGrosze);
const missing = await post({mode:'shipping'}); assert.equal(missing.body.deliveryComparison.status,'needs_postal_code'); assert.equal(missing.body.deliveryComparison.best,null);
assert.equal((await post({mode:'shipping',postalCode:'bad'})).status,400);
const jobs = structuredClone(input.jobs);
const paint = jobs.flatMap(j=>j.materials).find(l=>l.material.ean==='5903973139188' || /Śnieżka Barwy Natury/.test(l.material.name));
if (!paint) throw Error('Expected genuine painting calculation with two 5l packs');
paint.quantity=4;
const changed=await post({mode:'shipping',method:'automatic',postalCode:'00-001'},jobs);const c=check(changed);
const large=a.best.stores.find(s=>s.store==='Zino'),small=c.best.stores.find(s=>s.store==='Zino');
assert.ok(large&&small);assert.equal(large.lines[0].packages[0].count,2);assert.equal(small.lines[0].packages[0].count,1);
assert.ok(large.deliveryGrosze>small.deliveryGrosze,'Retailer must reprice changed quantities, not reuse flat fee');
const origin=new URL(base).origin;
assert.equal((await fetch(origin+'/health')).status,200);assert.equal((await fetch(origin+'/auth/me')).status,401);
const health=await (await fetch(base+'/health')).json();assert.ok(health.stores.includes('Zino'));
const proof={checkedAt:new Date().toISOString(),base,health,input,first,second,changed,missingStatus:missing.body.deliveryComparison.status,authStatus:401};
if(outputFile)writeFileSync(outputFile,JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify({materialsGrosze:a.best.materialsGrosze,deliveryGrosze:a.best.deliveryGrosze,totalGrosze:a.best.totalGrosze,
  stores:a.best.stores.map(s=>({store:s.store,deliveryGrosze:s.deliveryGrosze,carrier:s.quote.carrier})),
  changedBasketDeliveryGrosze:c.best.deliveryGrosze,unknownStores:a.missingDeliveryStores,offers:health.offers,checks:'HTTPS + two destinations + automatic ignores manual fees + missing/invalid postcode + quantity change + health/auth'},null,2));
