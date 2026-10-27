import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import seed from '../../../deploy/shared-backend/verified-offers.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { createRemontService } from '../src/shared-backend';
import type { BasketQuoter } from '../../../lib/pricing-service/src/delivery';
import type { RetailObservation } from '../src/lib/retail-pages';

test('actual HTTP preserves all packages while exposing two cheaper separately quoted orders at one store', async () => {
  const eans = ['5063022887917','5063022038289','5905167698778'];
  const sources = eans.map(ean => RETAIL_SOURCES.find(s => s.store === 'LiderzyCen' && s.ean === ean)!);
  const observations = sources.map(s => ({...seed.find(row => row.sourceId === s.id)!, observedAt: new Date().toISOString()} as RetailObservation));
  const basketQuoter: BasketQuoter = async order => {
    const keys = order.lines.map(l => l.product.id.replace('remont-','')).sort().join(',');
    const fee = keys === [...eans].sort().join(',') ? 60000 : keys === eans[0] ? 11000 : keys === eans.slice(1).sort().join(',') ? 2200 : null;
    const now=Date.now();return fee === null ? {reason:'no_home_delivery'} : {quote:{costGrosze:fee,carrier:'Verified test courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:'https://liderzycen.pl/pl/basket',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:'a'.repeat(64)}};
  };
  const service = createRemontService({initialObservations:observations,background:false,basketQuoter});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  try {
    const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'laminate-flooring',materials:sources.map((s,i)=>({material:{id:s.id,name:s.name,ean:s.ean,unit:s.unit,category:s.category},quantity:[11,11,7][i]}))}],options:{store:'LiderzyCen',delivery:{mode:'shipping',postalCode:'00-001',allowSeparateOrders:true}}})});
    assert.equal(response.status,200);const result=await response.json(),best=result.deliveryComparison.best;
    assert.equal(best.materialsGrosze,48290);assert.equal(best.deliveryGrosze,13200);assert.equal(best.totalGrosze,61490);assert.equal(best.stores.length,1);
    const orders=best.stores[0].quote.orders;assert.equal(orders.length,2);assert.equal(best.stores[0].quote.singleOrderCostGrosze,60000);
    assert.deepEqual(orders.flatMap((p:any)=>p.lines.flatMap((l:any)=>l.packages.map((p:any)=>[p.offerId,p.count]))).sort(),sources.map((s,i)=>[s.id,[5,2,1][i]]).sort());
    // Clients without the new breakdown, and users preferring one order,
    // must retain the original whole-cart fee and never receive a hidden split.
    for(const allowSeparateOrders of [undefined,false]){
      const old=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'floor',materials:sources.map((s,i)=>({material:{id:s.id,name:s.name,ean:s.ean,unit:s.unit,category:s.category},quantity:[11,11,7][i]}))}],options:{store:'LiderzyCen',delivery:{mode:'shipping',postalCode:'00-001',allowSeparateOrders}}})});
      assert.equal(old.status,200);const legacy=await old.json();assert.equal(legacy.deliveryComparison.best.deliveryGrosze,60000);assert.equal(legacy.deliveryComparison.best.stores[0].quote.orders,undefined);assert.equal(legacy.deliveryComparison.allowSeparateOrders,false);
    }
  } finally {service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
