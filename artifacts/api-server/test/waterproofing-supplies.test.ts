import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import fixture from './fixtures/waterproofing-supplies.json' with { type: 'json' };
import seed from '../../../deploy/shared-backend/verified-offers.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource, type RetailObservation } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';
import { calculatorEngine } from '../../mobile/features/calculator/engine';
import { getJobById } from '../../mobile/features/content/registry';
import { toPricingStageInput } from '../../mobile/features/pricing/pricingApi';

function replay(context: string, mutate?: (v: any) => void) {
  const rows = fixture.records.filter(r => r.context === context); let i=0;
  const fetcher: typeof fetch = async(input,init) => { const u=new URL(String(input)),r=rows[i++]; assert.ok(r,context); assert.equal(u.origin,r.origin); assert.equal(u.pathname+u.search,r.path); assert.equal(init?.method??'GET',r.method); assert.deepEqual(init?.body?JSON.parse(String(init.body)):null,r.body); const v=structuredClone(r.response); mutate?.(v); return Response.json(v,{status:r.status}); };
  return {fetcher,done:()=>assert.equal(i,rows.length)};
}
test('seven native hydro offers bind the exact whole pack, gross amount, litre/kg distinction and floor collar', async()=>{
  const amounts=[10400,19897,36770,10270,1997,3790,7990];
  const newSources=fixture.sources.filter(s=>/mapegum|mapeband-w-floor|mapeband-w-10|primer-g-pro/.test(s.id));assert.equal(newSources.length,7);
  for(const [i,ref]of newSources.entries()) { const source=RETAIL_SOURCES.find(s=>s.id===ref.id)!;const native=replay('read:'+source.id),o=await readRetailSource(source,native.fetcher);native.done();assert.equal(o.priceGrosze,amounts[i]);assert.ok(o.imageUrl);
    for(const patch of [{packageSize:source.packageSize+1},{unit:source.unit==='l'?'kg':'l'},{retailerSku:'other'},{apiPurchaseUnit:'kg'}])await assert.rejects(readRetailSource({...source,...patch},replay('read:'+source.id).fetcher));
    for(const change of [(v:any)=>v.ean='5900000000000',(v:any)=>v.unit.floating_point=true,(v:any)=>v.price.gross.final_float++])await assert.rejects(readRetailSource(source,replay('read:'+source.id,change).fetcher));
  }
});
test('actual Express HTTP prices a complete seven-product waterproofing basket from native per-store carts',async()=>{
  const winbud=replay('quote:full-winbud'),primer=replay('quote:primer5'),qw=createRetailerQuoter(winbud.fetcher),qp=createRetailerQuoter(primer.fetcher);
  const service=createRemontService({initialObservations:seed.filter(o=>fixture.sources.some(s=>s.id===o.sourceId)) as RetailObservation[],background:false,basketQuoter:(basket,postcode)=>basket.store==='WinBud'?qw(basket,postcode):basket.store==='Rab-Dom'?qp(basket,postcode):Promise.resolve({reason:'quote_unavailable'})});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  const measurements={wallArea:10,floorArea:5,perimeter:10,hydroSystem:3,hydroSubstrate:1,hydroPrimerPack:5,hydroTapeOverlaps:8,hydroInsideCorners:4,hydroOutsideCorners:1,hydroWallCollars:3,hydroFloorCollars:1,hydroCollarFit:1};
  try{const job=toPricingStageInput(calculatorEngine.calculate(getJobById('bathroom-waterproofing')!,measurements));const response=await fetch(`http://127.0.0.1:${(server.address() as any).port}/pricing/project`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[job],options:{delivery:{mode:'shipping',postalCode:'00-001',allowSeparateOrders:false}}})});assert.equal(response.status,200);const result=await response.json();assert.ok(result.stages[0].lines.every((line:any)=>line.resolved));assert.equal(result.consolidated.lines.length,7);assert.equal(result.deliveryComparison.missingProductCount,0);const best=result.deliveryComparison.best;assert.ok(best);assert.equal(best.materialsGrosze,78632);assert.equal(best.deliveryGrosze,1050);assert.equal(best.totalGrosze,79682);assert.equal(result.consolidated.lines.find((line:any)=>line.product.ean==='8022452113925').packagesNeeded,2);winbud.done();primer.done();}
  finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
});
