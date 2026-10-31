import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixtures from './fixtures/wago-connectors-wave157.json';
import {RETAIL_SOURCES} from './retail-catalog';
import {confirmShoperPurchaseUnit, readRetailSource} from './retail-pages';

const box = RETAIL_SOURCES.find(s => s.id === 'ehw-wago-221415-25')!;
const fixture = fixtures.find(f => f.sourceId === box.id)!.item;

test('WAGO manufacturer GTIN does not turn an EHW25-piece box into a single piece', () => {
  confirmShoperPurchaseUnit(fixture, box);
  for (const change of [{packageSize:1}, {packageSize:50}, {unit:'opak'}, {productId:463},
    {ean:'4050821808435'}, {retailerSku:'221-415'}, {apiPurchaseUnit:'opak.'}, {packageDescription:undefined}]) {
    assert.throws(() => confirmShoperPurchaseUnit(fixture, {...box,...change}), /product_package_not_confirmed/);
  }
  for (const change of [{name:fixture.name.replace('25 szt.','1 szt.')}, {producer:{name:'OTHER'}},
    {unit:{name:'szt.',floating_point:true}}, {code:'WAGO-125138'}, {description:'Cena dotyczy jednej złączki.'}]) {
    assert.throws(() => confirmShoperPurchaseUnit({...fixture,...change}, box));
  }
});

test('native WAGO cards confirm gross prices and reject switched EAN/model, unavailable stock and purchase units', async () => {
  for (const saved of fixtures) {
    const source = RETAIL_SOURCES.find(s => s.id === saved.sourceId)!;
    const read = (item: unknown) => readRetailSource(source, async () => new Response(JSON.stringify(item), {headers:{'Content-Type':'application/json'}}));
    const observed = await read(saved.item);
    assert.equal(observed.ean,'4055143234658');
    assert.equal(observed.priceGrosze, saved.sourceId === box.id ? 6984 : 423);
    for (const change of [{ean:'4050821808442'}, {can_buy:false}, {name:'WAGO 221-413 3x4mm'},
      {unit:{name:'m',floating_point:true}}, {id:1}, {code:'221-412'}]) {
      await assert.rejects(read({...saved.item,...change}));
    }
    await assert.rejects(read({...saved.item,price:{gross:{final:'0,01 zł',final_float:4.23}}}), /gross_price_mismatch/);
  }
});
