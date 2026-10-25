import assert from 'node:assert/strict';
import {test} from 'node:test';
import { collectSeenPrices, comparePriceSnapshots, mergePriceSnapshots, parsePriceSnapshot, emptyPriceSnapshot } from './priceChanges';
import type {SerializedProject} from './pricingApi';
function response(price:number,date='2026-10-25T12:01:00Z',offerId='a',store='Sklep',size='5',quantity=1):SerializedProject {
  return {stages:[{lines:[{resolved:true,quantity,unit:'l',product:{id:'p',name:'Farba',ean:'5903973139188',packageSize:size,packageUnit:'l'},offers:[{offerId,store,packageSize:size,unit:'l',priceGrosze:price,fetchedAt:date}]}]}]} as SerializedProject;
}
test('price increases and decreases are exact grosze per identical offer/pack; persist across reopen',()=>{
  const before=collectSeenPrices(response(10000,'2026-10-25T12:00:00Z'));
  const saved=parsePriceSnapshot(JSON.stringify(before));
  const up=comparePriceSnapshots(saved,collectSeenPrices(response(10999)));
  assert.equal(up[0].deltaGrosze,999);assert.equal(up[0].previousGrosze,10000);
  const down=comparePriceSnapshots(saved,collectSeenPrices(response(9500)));
  assert.equal(down[0].deltaGrosze,-500);
  assert.deepEqual(comparePriceSnapshots(emptyPriceSnapshot(),before),[]);
});
test('quantities, new stores/offers, different pack sizes and old readings cannot create a false price change',()=>{
  const before=collectSeenPrices(response(10000));
  for(const data of [response(10000,'2026-10-25T12:02:00Z','a','Sklep','5',7),response(9000,'2026-10-25T12:02:00Z','b'),response(9000,'2026-10-25T12:02:00Z','a','Inny'),response(9000,'2026-10-25T12:02:00Z','a','Sklep','10'),response(9000,'2026-10-25T12:00:00Z')]) assert.deepEqual(comparePriceSnapshots(before,collectSeenPrices(data)),[]);
  assert.equal(Object.values(mergePriceSnapshots(before,collectSeenPrices(response(9000,'2026-10-25T12:00:00Z'))).offers)[0].priceGrosze,10000);
  assert.deepEqual(parsePriceSnapshot('{bad'),emptyPriceSnapshot());
  const missing=response(9000);missing.stages[0].lines[0].offers![0].priceGrosze=null;
  assert.deepEqual(comparePriceSnapshots(before,collectSeenPrices(missing)),[]);
});
