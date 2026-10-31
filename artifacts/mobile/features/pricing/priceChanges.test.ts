import assert from 'node:assert/strict';
import {test} from 'node:test';
import { basketMaterialPriceDelta, collectSeenPrices, comparePriceSnapshots, mergePriceSnapshots, parsePriceSnapshot, emptyPriceSnapshot } from './priceChanges';
import type {SerializedProject} from './pricingApi';
import type {PriceChange} from './priceChanges';
function response(price:number,date='2026-10-25T12:01:00Z',offerId='a',store='Sklep',size='5',quantity=1):SerializedProject {
  return {stages:[{lines:[{resolved:true,quantity,unit:'l',product:{id:'p',name:'Farba',ean:'5903973139188',packageSize:size,packageUnit:'l'},offers:[{offerId,store,packageSize:size,unit:'l',priceGrosze:price,fetchedAt:date}]}]}]} as SerializedProject;
}

test('cut-roll changes retain a price per m² and round the whole quoted cut once',()=>{
  const change={offerId:'ewinyl-orion514-2m',packageSize:1,unit:'m2',previousGrosze:5500,priceGrosze:5599,deltaGrosze:99}as PriceChange;
  const pack={offerId:change.offerId,packageSize:6.2,count:1,unitPriceGrosze:34714,lineCostGrosze:34714,cutRoll:{widthMm:2000,lengthMm:3100,pricePerM2Grosze:5599}};
  assert.equal(basketMaterialPriceDelta(change,pack),614);
  assert.equal(basketMaterialPriceDelta({...change,previousGrosze:5600,deltaGrosze:-1},pack),-6);
  assert.equal(basketMaterialPriceDelta(change,{...pack,packageSize:7}),null);
  assert.equal(basketMaterialPriceDelta(change,{...pack,cutRoll:{...pack.cutRoll,pricePerM2Grosze:5500}}),null);
  assert.equal(basketMaterialPriceDelta({...change,offerId:'different'},pack),null);
});
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
test('basket price notice multiplies only a matching current pack and never includes delivery',()=>{
  const before=collectSeenPrices(response(28720,'2026-10-25T12:00:00Z'));
  const [increase]=comparePriceSnapshots(before,collectSeenPrices(response(29719,'2026-10-25T12:01:00Z')));
  const pack={offerId:'a',packageSize:5,count:2,unitPriceGrosze:29719,lineCostGrosze:59438};
  assert.equal(basketMaterialPriceDelta(increase,pack),1998);
  const [decrease]=comparePriceSnapshots(before,collectSeenPrices(response(28220,'2026-10-25T12:01:00Z')));
  assert.equal(basketMaterialPriceDelta(decrease,{...pack,unitPriceGrosze:28220,lineCostGrosze:56440}),-1000);
  for(const invalid of [
    {...pack,offerId:'another'},
    {...pack,packageSize:10},
    {...pack,unitPriceGrosze:29720},
    {...pack,lineCostGrosze:59437},
    {...pack,count:1.5},
  ]) assert.equal(basketMaterialPriceDelta(increase,invalid),null);
});
