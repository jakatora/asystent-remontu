import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { createRemontService } from '../src/shared-backend';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { DELIVERY_LIMITS } from '../../../lib/pricing-service/src/delivery-limits';
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function observations(observedAt = new Date().toISOString()) {
  return RETAIL_SOURCES.slice(0, 3).map((source, index) => ({ sourceId: source.id, ean: source.ean, name: source.name,
    imageUrl: null, priceGrosze: [11800, 10999, 3548][index], currency: 'PLN' as const, availability: 'in_stock' as const,
    observedAt, sourceUrl: source.url, evidenceSha256: 'a'.repeat(64),
  }));
}

test('one estimate accepts the full 103-item catalogue and the shared 200-item boundary without truncation',async()=>{
 const source=RETAIL_SOURCES[0],service=createRemontService({initialObservations:observations(),background:false});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const root='http://127.0.0.1:'+(server.address() as {port:number}).port;
  const post=(count:number)=>fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'complete-catalogue',materials:Array.from({length:count},(_,index)=>({material:{id:'item-'+index,name:source.name,ean:source.ean,category:source.category,unit:source.unit},quantity:source.packageSize}))}],options:{delivery:{mode:'pickup'}}})});
  for(const count of [103,DELIVERY_LIMITS.products]){
   const response=await post(count);assert.equal(response.status,200);const result=await response.json();
   assert.equal(result.stages[0].lines.length,count);assert.ok(result.stages[0].lines.every((line:any)=>line.resolved));
   assert.equal(result.consolidated.lines.length,1);assert.equal(result.consolidated.lines[0].totalQuantity,count*source.packageSize);
  }
  assert.equal((await post(DELIVERY_LIMITS.products+1)).status,400);
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});

test('disabled merchant evidence cannot reactivate from bootstrap or a persisted cache',t=>{
  const dir=mkdtempSync(join(tmpdir(),'remont-disabled-')),cachePath=join(dir,'cache.json');
  t.after(()=>{unlinkSync(cachePath);rmdirSync(dir);});
  const source=RETAIL_SOURCES.find(source=>source.id==='rodimax-board-gkb')!;
  const old={sourceId:source.id,ean:source.ean,name:source.name,imageUrl:null,priceGrosze:2600,currency:'PLN' as const,availability:'in_stock' as const,observedAt:new Date().toISOString(),sourceUrl:source.url,evidenceSha256:'a'.repeat(64)};
  writeFileSync(cachePath,JSON.stringify({version:2,observations:[old],withdrawnAt:{}}));
  const service=createRemontService({initialObservations:[old],cachePath,background:false});
  t.after(()=>service.close());
  assert.equal(service.status().offers,0);
  assert.equal(service.status().sources.find(row=>row.id===source.id)?.active,false);
  assert.equal(service.status().sources.find(row=>row.id===source.id)?.error,'retailer_checkout_unconfirmed');
  assert.ok(service.status().delivery.automaticStores.includes('KELOT'));
  assert.ok(service.status().delivery.automaticStores.includes('Cezar'));
  assert.ok(service.status().delivery.postcodeStores.includes('Cezar'));
});

test('shared backend retains real observation dates after a failed refresh', async () => {
  const old = new Date(Date.now() - 86400000).toISOString();
  const service = createRemontService({ initialObservations: observations(old), background: false,
    fetchImpl: async () => new Response('blocked', { status: 403 }),
  });
  await service.refresh();
  const status = service.status();
  assert.equal(status.offers, 3);
  assert.ok(status.sources.filter(source => source.checkedAt !== null).every(source => source.checkedAt === old && source.error === 'retailer_http_403'));
  assert.equal(createRemontService({ initialObservations: observations(new Date(Date.now() - 8 * 86400000).toISOString()), background: false }).status().offers, 0);
});

test('shared backend actual HTTP: comparable packs, missing items, validation and health', async () => {
  const service = createRemontService({ initialObservations: observations(), background: false });
  const app = express(); app.use(express.json()); app.use('/api/remont', service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address() as { port: number };
  const root = `http://127.0.0.1:${address.port}/api/remont`;
  const input = { jobs: [{ jobId: 'paint-walls', materials: [
    { material: { id: 'paint', name: 'Farba lateksowa Śnieżka Barwy Natury biała 5 l', unit: 'l', category: 'paint' }, quantity: 8.4 },
    { material: { id: 'primer', name: 'Grunt uniwersalny Knauf 5 l', unit: 'l', category: 'primer' }, quantity: 4 },
    { material: { id: 'unknown', name: 'Taśma malarska', unit: 'szt' }, quantity: 1 },
  ] }] };
  try {
    const response = await fetch(`${root}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
    assert.equal(response.status, 200);
    const estimate = await response.json();
    assert.equal(estimate.storeComparison.optimalBasketGrosze, 25546);
    assert.equal(estimate.storeComparison.cheapestFullStore.store, 'Castorama');
    assert.equal(estimate.storeComparison.cheapestFullStore.totalGrosze, 27148);
    assert.equal(estimate.storeComparison.singleStoreExtraGrosze, 1602);
    assert.ok(estimate.stages[0].lines.some((line: any) => !line.resolved && line.query.normalizedName === 'tasma malarska'));
    assert.equal(estimate.coverage.scope.deliveryIncluded, false);
    input.jobs[0].materials[0].material.unit = 'kg';
    assert.equal((await fetch(`${root}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })).status, 400);
    assert.equal((await fetch(`${root}/health`)).status, 200);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    service.close();
  }
});

test('full painting list compares all four products without promoting an incomplete store basket', async () => {
  const all = [...observations(), ...RETAIL_SOURCES.slice(3, 7).map((source, index) => ({
    sourceId: source.id, ean: source.ean, name: source.name, imageUrl: null,
    priceGrosze: [9850, 1472, 845, 4392][index], currency: 'PLN' as const, availability: 'in_stock' as const,
    observedAt: new Date().toISOString(), sourceUrl: source.url, evidenceSha256: 'b'.repeat(64),
  }))];
  const service = createRemontService({ initialObservations: all, background: false });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const { port } = server.address() as { port: number };
  try {
    const response = await fetch(`http://127.0.0.1:${port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs: [{ jobId: 'paint-walls', materials: [
      { material: { id: 'paint', name: 'Farba lateksowa Śnieżka Barwy Natury biała 5 l', unit: 'l', category: 'paint' }, quantity: 8.5 },
      { material: { id: 'primer-paint', name: 'Grunt uniwersalny Knauf 5 l', unit: 'l', category: 'primer' }, quantity: 4.1 },
      { material: { id: 'painters-tape', name: 'Taśma malarska Blue Dolphin niebieska 30 mm x 50 m', unit: 'mb', category: 'masking-tape' }, quantity: 50 },
      { material: { id: 'drop-cloth', name: 'Folia malarska gruba Blue Dolphin 4 x 5 m', unit: 'm2', category: 'protective-film' }, quantity: 20 },
    ] }] }) });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.ok(result.stages[0].lines.every((line: any) => line.resolved));
    assert.equal(result.storeComparison.productCount, 4);
    assert.equal(result.storeComparison.optimalBasketGrosze, 25565);
    assert.equal(result.storeComparison.cheapestFullStore, null);
    const castorama = result.storeComparison.stores.find((store: any) => store.store === 'Castorama');
    assert.equal(castorama.coveredCount, 2); assert.equal(castorama.totalGrosze, 27148);
    assert.equal(result.coverage.offers, 7);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); service.close();
  }
});
