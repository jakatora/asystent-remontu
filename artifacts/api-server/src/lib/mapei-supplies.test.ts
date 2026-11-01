import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixtures from './fixtures/mapei-supplies-wave163.json';
import {MAPEI_SUPPLY_SOURCES} from './mapei-supplies';
import {RETAIL_SOURCES} from './retail-catalog';
import {readRetailSource} from './retail-pages';
import {createRetailerQuoter} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

test('native cards identify whole Primer G Pro 10/20 litre cans and Mapegum 3/20 kg buckets',async()=>{
  for(const source of MAPEI_SUPPLY_SOURCES){const fixture=fixtures.cards.find(c=>c.sourceId===source.id)!;
    const result=await readRetailSource(source,async()=>Response.json(fixture.item));
    assert.equal(result.ean,source.ean);assert.equal(result.priceGrosze,fixture.priceGrosze);
  }
});

test('different GTINs, purchase units, brands, product cards and multi-packs cannot be verified',async()=>{
  for(const source of MAPEI_SUPPLY_SOURCES){const fixture=fixtures.cards.find(c=>c.sourceId===source.id)!;
    for(const change of [{ean:'8022452002571'},{ean:''},{code:'other'},{id:1},{name:'Primer G 10 kg'},{url:'https://www.rabdom.pl/pl/p/other/1'},
      {package:'12'},{package:0},{unit:{name:'l',floating_point:true}},{unit:{name:'szt.',floating_point:true}},
      {producer:{name:'Mapei',id:8}},{producer:{name:'other',id:57}}])
      await assert.rejects(readRetailSource(source,async()=>Response.json({...fixture.item,...change})),/not_confirmed/);
    for(const change of [{packageSize:1},{unit:'kg'},{unit:'szt'},{store:'WinBud'},{retailerSku:'other'},{category:'paint'},{purchaseMultiple:12},{minimumPackages:2}]){
      if(Object.entries(change).every(([key,value])=>(source as any)[key]===value))continue;
      await assert.rejects(readRetailSource({...source,...change},async()=>Response.json(fixture.item)),/not_confirmed/);
    }
  }
});

test('shipping weight does not relabel a 10 litre can as twenty kilograms of primer',async()=>{
  const source=MAPEI_SUPPLY_SOURCES[0],fixture=fixtures.cards.find(c=>c.sourceId===source.id)!;
  assert.equal(fixture.item.weight.weight_float,20);assert.equal(source.unit,'l');assert.equal(source.packageSize,10);
  assert.equal((await readRetailSource(source,async()=>Response.json(fixture.item))).ean,'8022452241147');
});

function transport(fixture:typeof fixtures.carts[number],changeBasket?:(b:any)=>void,changeCard?:(p:any)=>void){
  const requests:{url:string;method:string}[]=[];let nextAdd=0;
  const fetcher:typeof fetch=async(input,init)=>{const url=new URL(String(input)),method=init?.method??'GET';requests.push({url:String(input),method});
    const match=url.pathname.match(/\/products\/PLN\/(\d+)$/);
    if(match){const card=fixtures.cards.find(c=>c.item.id===Number(match[1])&&new URL(c.item.url).origin===url.origin);assert.ok(card);const item=structuredClone(card.item);changeCard?.(item);return Response.json(item);}
    assert.equal(url.pathname,'/webapi/front/pl_PL/basket/PLN/');
    if(method==='POST'){assert.ok(nextAdd<fixture.added.length);return Response.json(fixture.added[nextAdd++]);}
    const basket=structuredClone(fixture.basket);changeBasket?.(basket);return Response.json(basket);
  };return{fetcher,requests};
}

test('eight captured native baskets pass through real shipping selection and exact cart validation',async()=>{
  for(const fixture of fixtures.carts){const result=await createRetailerQuoter(transport(fixture).fetcher)(fixture.order as DeliveredStoreBasket,'30-001');
    assert.ok('quote'in result);assert.equal(result.quote.costGrosze,fixture.result.quote.costGrosze);
    assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.destinationScope,'PL');
  }
});

test('a dearer bucket can win the complete basket through its actual combined shipping rate',()=>{
  const mixed=fixtures.carts[4],primer=fixtures.carts[0],winbud=fixtures.carts[7];
  assert.equal(mixed.order.materialsGrosze+mixed.result.quote.costGrosze,52490);
  assert.equal(primer.order.materialsGrosze+primer.result.quote.costGrosze+winbud.order.materialsGrosze+winbud.result.quote.costGrosze,54509);
  assert.ok(mixed.order.lines[1].packages[0].unitPriceGrosze>winbud.order.lines[0].packages[0].unitPriceGrosze);
});

test('missing shipping, changed contents or inconsistent native totals cannot become confirmed delivery',async()=>{
  for(const change of [(b:any)=>b.shippings=[],(b:any)=>b.products.pop(),(b:any)=>b.products[0].quantity++,
    (b:any)=>b.products[0].unit.name='l',(b:any)=>b.basket.sum_products_float++]){
    const result=await createRetailerQuoter(transport(fixtures.carts[4],change).fetcher)(fixtures.carts[4].order as DeliveredStoreBasket,'30-001');
    assert.ok('reason'in result);
  }
});

test('a changed current native price stops before creating a cart',async()=>{
  const mock=transport(fixtures.carts[0],undefined,p=>{p.price.gross.final='140,90 zł';p.price.gross.final_float=140.9;});
  const result=await createRetailerQuoter(mock.fetcher)(fixtures.carts[0].order as DeliveredStoreBasket,'30-001');
  assert.deepEqual(result,{reason:'price_changed'});assert.equal(mock.requests.filter(r=>r.method==='POST').length,0);
});

test('the second Mapegum 20kg store shares only its exact barcode, not other Mapegum packs',()=>{
  const source=MAPEI_SUPPLY_SOURCES[3],other=RETAIL_SOURCES.find(s=>s.id==='winbud-mapegum-wps-20kg')!;
  assert.equal(source.ean,other.ean);assert.equal(source.packageSize,other.packageSize);assert.equal(source.unit,other.unit);
  assert.notEqual(source.ean,MAPEI_SUPPLY_SOURCES[2].ean);assert.notEqual(source.ean,'8022452242489');
});
