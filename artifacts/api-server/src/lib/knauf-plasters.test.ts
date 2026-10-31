import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixtures from './fixtures/knauf-plasters-wave159.json';
import {KNAUF_PLASTER_SOURCES,selectRealbudMp75lDelivery} from './knauf-plasters';
import {readRetailSource} from './retail-pages';
import {createRetailerQuoter} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

test('five primary native cards confirm exact Knauf models, 30kg bags, current gross price and purchase multiples',async()=>{
  for(const fixture of fixtures.cards){const source=KNAUF_PLASTER_SOURCES.find(s=>s.id===fixture.sourceId)!;
    const observed=await readRetailSource(source,async()=>Response.json(fixture.item));
    assert.equal(observed.ean,source.ean);assert.equal(observed.priceGrosze,fixture.priceGrosze);
    assert.equal(source.packageSize,30);assert.equal(source.purchaseMultiple??1,source.id==='realbud-knauf-mp75l-30kg'?40:1);
  }
});

test('native bag, pallet, model, manufacturer and SKU changes cannot become verified prices',async()=>{
  for(const fixture of fixtures.cards){const source=KNAUF_PLASTER_SOURCES.find(s=>s.id===fixture.sourceId)!;
    const changes=[{weight:{weight_float:25,weight:'25 kg'}},{weight:{weight_float:0,weight:'0 kg'}},{unit:{name:'kg',floating_point:true}},
      {package:source.purchaseMultiple===40?'0':'40'},{ean:'5902367206352'},{code:'other'},{name:'Knauf MP 75 25 kg'},{producer:{id:99,name:'other'}}];
    for(const change of changes)await assert.rejects(readRetailSource(source,async()=>Response.json({...fixture.item,...change})),/not_confirmed/);
    for(const change of [{packageSize:1},{packageSize:25},{purchaseMultiple:source.purchaseMultiple===40?1:40},{unit:'szt'}])
      await assert.rejects(readRetailSource({...source,...change},async()=>Response.json(fixture.item)),/not_confirmed/);
  }
});

test('confirmed 40- and 80-bag native MP75L baskets qualify for the named prepaid Polish free delivery',()=>{
  for(const fixture of fixtures.carts.slice(1,3)){
    const result=selectRealbudMp75lDelivery(fixture.basket,fixture.order as DeliveredStoreBasket);
    assert.deepEqual(result,{costGrosze:0,carrier:'Darmowa dostawa',payment:'Autopay'});
    assert.equal(fixture.basket.products[0].quantity,fixture.order.lines[0].packages[0].count);
  }
});

test('empty, partial, changed or unpaid pallet carts and placeholder zeros do not qualify for free delivery',()=>{
  const fixture=fixtures.carts[1];
  const changes:((b:any)=>void)[]=[b=>b.products=[],b=>b.products[0].quantity=1,b=>b.products[0].product_id=6645,b=>b.products.push({...b.products[0]}),
    b=>b.products[0].unit.name='kg',b=>b.basket.sum_float++,b=>delete b.basket.sum_products,b=>b.countries[0].id=200,
    b=>b.shippings.find((s:any)=>s.shipping_id===89).cost_float=25,b=>delete b.shippings.find((s:any)=>s.shipping_id===89).cost,
    b=>b.shippings.find((s:any)=>s.shipping_id===89).countries[0].cost_float=1,
    b=>b.shippings.find((s:any)=>s.shipping_id===89).title='Transport na zapytanie',
    b=>b.shippings.find((s:any)=>s.shipping_id===89).engine='personal',
    b=>b.shippings.find((s:any)=>s.shipping_id===89).shipping_id=23,b=>b.payments.find((p:any)=>p.payment_id===3).name='cash',
    b=>{const p=b.shippings.find((s:any)=>s.shipping_id===89).payments.find((p:any)=>p.payment_id===3);p.additional_cost='1,00 zł';p.additional_cost_float=1;},
    b=>delete b.free_shipping];
  for(const change of changes){const basket=structuredClone(fixture.basket);change(basket);let result=null;
    try{result=selectRealbudMp75lDelivery(basket,fixture.order as DeliveredStoreBasket);}catch(error){assert.ok(error instanceof Error);}
    assert.equal(result,null);
  }
  const mixed=fixtures.carts[6];assert.equal(selectRealbudMp75lDelivery(mixed.basket,mixed.order as DeliveredStoreBasket),null);
});

function transport(fixture:typeof fixtures.carts[number]){
  const requests:{url:string;method:string}[]=[];
  const fetcher:typeof fetch=async(input,init)=>{const url=new URL(String(input)),method=init?.method??'GET';requests.push({url:String(input),method});
    const match=url.pathname.match(/\/products\/PLN\/(\d+)$/);
    if(match){const card=[...fixtures.cards,...fixtures.supportCards].find(c=>c.item.id===Number(match[1])&&new URL(c.item.url).origin===url.origin);assert.ok(card);return Response.json(card.item);}
    assert.equal(url.pathname,'/webapi/front/pl_PL/basket/PLN/');
    if(method==='POST'){assert.ok(fixture.added);return Response.json(fixture.added);}
    return Response.json(fixture.basket);
  };
  return{fetcher,requests};
}

test('actual native responses pass through the shipping coordinator, including differing mixed-basket fees',async()=>{
  for(const fixture of fixtures.carts){
    const mock=transport(fixture),result=await createRetailerQuoter(mock.fetcher)(fixture.order as DeliveredStoreBasket,'30-001');
    const expected=fixture.result.quote;
    if(expected){assert.ok('quote'in result);assert.equal(result.quote.costGrosze,expected.costGrosze);assert.equal(result.quote.sourceUrl,expected.sourceUrl);}
    else assert.deepEqual(result,{reason:fixture.result.reason});
  }
});

test('asking for one Realbud MP75L bag is rejected before a native cart can silently round it to forty',async()=>{
  const fixture=fixtures.carts[1],order=structuredClone(fixture.order) as DeliveredStoreBasket,pack=order.lines[0].packages[0];
  pack.count=1;pack.lineCostGrosze=pack.unitPriceGrosze;order.materialsGrosze=pack.unitPriceGrosze;
  const mock=transport(fixture),result=await createRetailerQuoter(mock.fetcher)(order,'30-001');
  assert.deepEqual(result,{reason:'purchase_rules_changed'});assert.equal(mock.requests.filter(r=>r.method==='POST').length,0);
});
