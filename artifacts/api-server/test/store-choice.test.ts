import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { createRemontService } from '../src/shared-backend';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { estimateHonoursStore } from '../../mobile/features/pricing/storeChoice';

test('actual HTTP preserves a chosen retailer across consolidation and delivery, including missing items', async () => {
  const paint = RETAIL_SOURCES.find(s => s.id === 'sewera-sniezka-5l')!, other = RETAIL_SOURCES.find(s => s.id === 'castorama-sniezka-5l')!, primer = RETAIL_SOURCES.find(s => s.id === 'castorama-knauf-5l')!;
  const initialObservations = [paint,other,primer].map((s,i) => ({ sourceId:s.id,ean:s.ean,name:s.name,imageUrl:null,priceGrosze:[20000,10000,3548][i],currency:'PLN' as const,availability:'in_stock' as const,observedAt:new Date().toISOString(),sourceUrl:s.url,evidenceSha256:'a'.repeat(64) }));
  let quoted = 0;
  const service = createRemontService({ initialObservations, background:false, basketQuoter:async order => {
    quoted++; assert.equal(order.store,'Sewera'); assert.equal(order.materialsGrosze,20000);
    assert.equal(order.lines[0].packages[0].count,1);
    return {quote:{costGrosze:1000,carrier:'Kurier',payment:'Przelew',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://sklep.sewera.pl/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'test'}};
  } });
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  try {
    const root='http://127.0.0.1:'+(server.address() as {port:number}).port;
    const jobs=[3,2].map((quantity,i)=>({jobId:'room-'+i,materials:[{material:{id:'paint',ean:paint.ean,name:paint.name,category:paint.category,unit:paint.unit},quantity}]}));
    const post=async (body:any)=>{const response=await fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});assert.equal(response.status,200);return response.json();};
    const all=await post({jobs,options:{delivery:{mode:'pickup'}}});assert.equal(all.consolidated.consolidatedTotalGrosze,20000);
    assert.ok(all.coverage.pickupConfirmationStores.includes('Castorama'));
    const selected=await post({jobs,options:{store:'Sewera',delivery:{mode:'shipping',postalCode:'00-001'}}});
    assert.equal(selected.consolidated.consolidatedTotalGrosze,20000);assert.equal(selected.deliveryComparison.best.totalGrosze,21000);
    assert.equal(estimateHonoursStore(selected,'Sewera'),true);assert.equal(quoted,1);
    const missing={jobId:'primer',materials:[{material:{id:'primer',ean:primer.ean,name:primer.name,category:primer.category,unit:primer.unit},quantity:1}]};
    const partial=await post({jobs:[...jobs,missing],options:{store:'Sewera',delivery:{mode:'shipping',postalCode:'00-001'}}});
    assert.equal(partial.stages.flatMap((s:any)=>s.lines).length,3);assert.equal(partial.stages[2].lines[0].resolved,false);
    assert.equal(partial.deliveryComparison.best,null);assert.equal(partial.deliveryComparison.missingProductCount,1);assert.equal(quoted,1);
  } finally { await new Promise<void>(resolve=>server.close(()=>resolve()));service.close(); }
});
