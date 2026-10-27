import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/laminate-supplies.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

test('primary native products confirm one 22-part kit and one 25m roll at their gross PLN prices', async () => {
  for (const [index,row] of fixture.products.entries()) {
    const source = RETAIL_SOURCES.find(source => source.id === row.sourceId)!;
    const get: typeof fetch = async input => { assert.equal(String(input),new URL('/webapi/front/pl_PL/products/PLN/'+source.productId,source.url).href);return Response.json(row.product); };
    const observation = await readRetailSource(source,get);
    assert.equal(observation.priceGrosze,index===0?6490:1233);assert.equal(observation.ean,source.ean);assert.equal(source.packageSize,index===0?1:25);
    assert.notEqual(observation.priceGrosze,Math.round(row.product.price.net.final_float*100));
    const mutations: ((p: any) => void)[] = [p=>p.ean='0000000000000',p=>p.id++,p=>p.code='unknown',p=>p.unit.floating_point=true,p=>p.unit.name='m²',p=>p.price.gross.final_float=1,p=>p.can_buy=false,p=>p.description='different package'];
    for (const mutate of mutations) {const changed=clone(row.product);mutate(changed);await assert.rejects(readRetailSource(source,async()=>Response.json(changed)));}
  }
});

test('Mensura delivery verifies the actual whole kit and prepaid home courier, ignoring the cheaper locker and net price', async () => {
  const row=fixture.products[0],source=RETAIL_SOURCES.find(s=>s.id===row.sourceId)!;
  const order: DeliveredStoreBasket={store:'Mensura',materialsGrosze:6490,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:source.ean,name:source.name,imageUrl:null},unit:'szt',packages:[{offerId:source.id,count:1,packageSize:1,unitPriceGrosze:6490,lineCostGrosze:6490,store:source.store,url:source.url}]}]};
  const actions: string[]=[];
  const get=(cart: any=fixture.mensuraCart,product: any=row.product): typeof fetch=>async(input,init)=>{
    const url=new URL(String(input));assert.equal(url.origin,'https://www.mensura.pl');actions.push((init?.method??'GET')+' '+url.pathname);
    if(url.pathname==='/webapi/front/pl_PL/products/PLN/17167')return Response.json(product);
    assert.equal(url.pathname,'/webapi/front/pl_PL/basket/PLN/');
    if(init?.method==='POST'){assert.deepEqual(JSON.parse(String(init.body)),{stock_id:19590,quantity:1});return Response.json({});}
    return Response.json(cart);
  };
  const quote=await createRetailerQuoter(get())(order,'00-001');assert.ok('quote'in quote);assert.equal(quote.quote.costGrosze,1399);assert.equal(quote.quote.carrier,'Kurier GLS');assert.equal(quote.quote.destinationScope,'PL');
  assert.equal(actions.filter(a=>a.startsWith('POST')).length,1);
  const bad=clone(fixture.mensuraCart);bad.products[0].quantity=0;
  assert.deepEqual(await createRetailerQuoter(get(bad))(order,'00-001'),{reason:'basket_not_confirmed'});
  const net=clone(row.product);net.price.gross.final='52,76 zł';net.price.gross.final_float=52.76;actions.length=0;
  assert.deepEqual(await createRetailerQuoter(get(undefined,net))(order,'00-001'),{reason:'price_changed'});assert.equal(actions.filter(a=>a.startsWith('POST')).length,0);
});
