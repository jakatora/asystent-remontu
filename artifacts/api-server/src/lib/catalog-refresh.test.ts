import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/plusmarket-pex-wave181.json';
import {catalogReadinessProblems,createRemontService} from '../shared-backend';
import {RETAIL_SOURCES} from './retail-catalog';
import {readRetailSource} from './retail-pages';
import {parseCatalogProductRefresh} from '../../../../lib/pricing-service/src/catalog-refresh';
import {retailProductId} from './retail-sku';

const identity={ean:'5901095517976',category:'pipe',packageSize:1,unit:'mb'},source=RETAIL_SOURCES.find(s=>s.id==='plusmarket-pex-pipe-16x2')!;
async function host(run:(base:string,service:ReturnType<typeof createRemontService>)=>Promise<void>,fetcher:typeof fetch,initial:any[]=[]){const service=createRemontService({background:false,fetchImpl:fetcher,initialObservations:initial,basketQuoter:async()=>{throw Error('Price refresh must not quote freight');}}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));try{await run('http://127.0.0.1:'+(server.address()as {port:number}).port,service);}finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}}
const post=(base:string,body:unknown)=>fetch(base+'/pricing/catalog-availability/refresh',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});

test('explicit refresh restores an expired exact PEX offer with one current product read and no shipping/order action',async()=>{
  let calls=0;const fetcher:typeof fetch=async(input,init)=>{calls++;assert.equal(String(input),'https://www.plus-market.pl/webapi/front/pl_PL/products/PLN/12990');assert.equal(init?.method,undefined);return Response.json(fixture.cases[0].product);};
  const previous=await readRetailSource(source,fetcher);previous.observedAt=new Date(Date.now()-8*86400000).toISOString();calls=0;
  await host(async(base,service)=>{
    const before:any=await(await fetch(base+'/pricing/catalog-availability')).json();assert(!before.products.some((p:any)=>p.ean===identity.ean));
    const expired = service.status().monitoring.stores.find(store => store.store === source.store)!;
    assert.equal(expired.expiredPrices, 1);
    assert.equal(expired.freshWithinCycle, 0);
    assert.equal(expired.withoutComparablePrice, expired.reviewed);
    const r=await post(base,identity);assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');const result=parseCatalogProductRefresh(await r.json());assert.deepEqual(result.refresh.confirmedOfferIds,[source.id]);assert.equal(result.refresh.failedOfferIds.length,0);assert.equal(calls,1);assert(result.availability.products.some(p=>p.ean===identity.ean&&p.packageSize===1&&p.unit==='mb'&&p.stores.includes('Plus-Market')));assert.equal(service.status().sources.find(s=>s.id===source.id)?.active,true);
    const fresh = service.status().monitoring.stores.find(store => store.store === source.store)!;
    assert.equal(fresh.expiredPrices, 0);
    assert.equal(fresh.freshWithinCycle, 1);
    assert.equal(fresh.withoutComparablePrice, fresh.reviewed - 1);
    assert.equal(result.offers?.length,1);assert.equal(result.offers[0].priceGrosze,399);assert.equal(result.offers[0].packageSize,1);assert.equal(result.offers[0].unit,'mb');assert.equal(result.offers[0].previous?.checkedAt,previous.observedAt);assert.equal(result.offers[0].deltaGrosze,0);
    const again=parseCatalogProductRefresh(await(await post(base,identity)).json());assert.equal(again.refresh.status,'recent');assert(again.refresh.retryAfterSeconds>0);assert.equal(calls,1);assert.deepEqual(again.offers,result.offers);
  },fetcher,[previous]);
});

test('unknown product, wrong pack/category and untrusted request fields never contact any retailer',async()=>{
  let calls=0;await host(async(base)=>{for(const body of [{...identity,url:'https://other.example'},{...identity,priceGrosze:1},{...identity,productId:'remont-sku-other'}])assert.equal((await post(base,body)).status,400);for(const body of [{...identity,packageSize:200},{...identity,category:'primer'},{...identity,unit:'kg'},{...identity,ean:'0000000000000'},{productId:'remont-sku-unreviewed',category:'pipe',packageSize:1,unit:'mb'}])assert.equal((await post(base,body)).status,404);assert.equal(calls,0);},async()=>{calls++;throw Error('Unexpected retailer request');});
});

test('concurrent explicit checks share a single product request',async()=>{
  let calls=0,release!:()=>void;const gate=new Promise<void>(r=>release=r);await host(async(base)=>{const first=post(base,identity),second=post(base,identity);await new Promise(r=>setTimeout(r,25));release();for(const r of await Promise.all([first,second])){assert.equal(r.status,200);assert.deepEqual(parseCatalogProductRefresh(await r.json()).refresh.confirmedOfferIds,[source.id]);}assert.equal(calls,1);},async()=>{calls++;await gate;return Response.json(fixture.cases[0].product);});
});

test('out-of-stock refresh withdraws the current badge; a failed read cannot renew an old timestamp',async()=>{
  const initial=await readRetailSource(source,async()=>Response.json(fixture.cases[0].product));for(const kind of ['stock','network'])await host(async(base,service)=>{const r=await post(base,identity);assert.equal(r.status,200);const data=parseCatalogProductRefresh(await r.json());assert.deepEqual(data.refresh.failedOfferIds,[source.id]);assert.deepEqual(data.offers,[]);assert.equal(service.status().sources.find(s=>s.id===source.id)?.checkedAt,initial.observedAt);if(kind==='stock')assert(!data.availability.products.some(p=>p.ean===identity.ean));},async()=>kind==='stock'?Response.json({...fixture.cases[0].product,can_buy:false}):new Response('',{status:503}),[initial]);
});

test('pricing health reports an aging offer and a failed refresh separately without calling the store', async () => {
  const initial = await readRetailSource(source, async () => Response.json(fixture.cases[0].product));
  initial.observedAt = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();
  let calls = 0;
  await host(async base => {
    const read = async () => {
      const response = await fetch(base + '/pricing/health');
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const body = await response.json() as ReturnType<ReturnType<typeof createRemontService>['status']>;
      return body.monitoring;
    };
    const before = await read();
    assert.equal(calls, 0);
    assert.equal(before.scheduled, false);
    assert.equal(before.fullRefreshCompletedAt, null);
    const find = (monitor: typeof before) => {
      const store = monitor.stores.find(store => store.store === source.store);
      assert.ok(store);
      return store;
    };
    assert.equal(find(before).current, 1);
    assert.equal(find(before).olderThanCycle, 1);
    assert.equal(find(before).freshWithinCycle, 0);
    assert.equal(find(before).expiredPrices, 0);
    assert.equal(find(before).readErrors, 0);

    assert.equal((await post(base, identity)).status, 200);
    const after = await read();
    assert.equal(calls, 1);
    assert.equal(after.fullRefreshCompletedAt, null);
    assert.equal(find(after).current, 1);
    assert.equal(find(after).olderThanCycle, 1);
    assert.equal(find(after).readErrors, 1);
    assert.equal(find(after).readErrorBreakdown.httpServer, 1);
    assert.equal(Object.values(find(after).readErrorBreakdown).reduce((sum, count) => sum + count, 0), 1);
  }, async () => { calls++; return new Response('', { status: 503 }); }, [initial]);
});

test('catalogue price changes compare two accepted observations of the same store and package',async()=>{
  for(const [previousPrice,currentPrice]of [[449,399],[349,399],[399,399]]){
    const initial=await readRetailSource(source,async()=>Response.json(fixture.cases[0].product));initial.observedAt=new Date(Date.now()-3600000).toISOString();initial.priceGrosze=previousPrice;
    await host(async base=>{const data=parseCatalogProductRefresh(await(await post(base,identity)).json()),o=data.offers![0];assert.equal(o.priceGrosze,currentPrice);assert.deepEqual(o.previous,{priceGrosze:previousPrice,checkedAt:initial.observedAt});assert.equal(o.deltaGrosze,currentPrice-previousPrice);assert.equal(o.offerId,source.id);assert.equal(o.sourceUrl,source.url);assert.equal(o.store,source.store);assert(Date.parse(o.checkedAt)>Date.parse(o.previous!.checkedAt));},async()=>Response.json(fixture.cases[0].product),[initial]);
  }
});

test('a first accepted offer exposes a price without inventing a baseline or delta',async()=>{
  await host(async base=>{const data=parseCatalogProductRefresh(await(await post(base,identity)).json());assert.equal(data.offers?.length,1);assert.equal(data.offers[0].priceGrosze,399);assert.equal(data.offers[0].previous,null);assert.equal(data.offers[0].deltaGrosze,null);},async()=>Response.json(fixture.cases[0].product));
});
test('all reviewed merchant-only variants have a scoped refresh path without a fabricated manufacturer code',async()=>{
  let calls=0;await host(async base=>{for(const productId of ['remont-sku-ewinyl-5329-2m','remont-sku-ewinyl-5329-4m','remont-sku-irbud-10911','remont-sku-sewera-465325']){const s=RETAIL_SOURCES.find(s=>retailProductId(s)===productId)!;assert.ok(s);const r=await post(base,{productId,category:s.category,packageSize:s.packageSize,unit:s.unit});assert.equal(r.status,200);const result=parseCatalogProductRefresh(await r.json());assert.equal(result.identity.ean,undefined);assert.deepEqual(result.refresh.failedOfferIds,[s.id]);}assert.equal(calls,4);},async()=>{calls++;throw Error('Simulated unavailability; no confirmed price');});
});

test('readiness flags a stopped, overdue or empty catalogue and reports the startup state over HTTP', async () => {
  const now = Date.parse('2026-11-03T21:00:00Z');
  const monitoring = { scheduled: true, fullRefreshCompletedAt: '2026-11-03T14:45:00Z', cacheError: null };
  assert.deepEqual(catalogReadinessProblems(now, 5, monitoring), []);
  assert.deepEqual(catalogReadinessProblems(now + 1, 5, monitoring), ['refresh_overdue']);
  assert.deepEqual(catalogReadinessProblems(now, 0, { ...monitoring, cacheError: 'cache_write_failed' }), ['cache_error', 'no_comparable_offers']);
  await host(async base => {
    const response = await fetch(base + '/pricing/readiness');
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), {
      ready: false,
      problems: ['refresh_disabled', 'no_comparable_offers', 'no_completed_refresh'],
      offers: 0,
      fullRefreshCompletedAt: null,
    });
  }, async () => { throw Error('Readiness must not contact a retailer'); });
});
