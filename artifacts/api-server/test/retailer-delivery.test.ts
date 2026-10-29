import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRetailerQuoter, selectHomeDelivery, confirmedMoney, knownUnavailableRetailers } from '../src/lib/retailer-delivery';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const money = (cents: number) => ({ cost: (cents / 100).toFixed(2).replace('.', ',') + ' zł', cost_float: cents / 100 });
test('Marbet24 requires customer details before delivery selection; its provisional cart fee is not a postcode quote', async () => {
  assert.equal(knownUnavailableRetailers().Marbet24, 'customer_details_required');
  const result = await createRetailerQuoter(async () => { throw Error('Do not submit a customer form'); })({ store: 'Marbet24', materialsGrosze: 9628, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [] }, '00-001');
  assert.deepEqual(result, { reason: 'customer_details_required' });
});
function fixture(cents = 1050): any {
  return { countries: [{ id: 179, name: 'Polska', selected: true }], payments: [{ payment_id: 3, name: 'onlinePayment', title: 'Autopay' }, { payment_id: 2, name: 'cod', title: 'Pobranie' }],
    free_shipping: { missing: -100, shipping_id: 1 }, shippings: [
      { title: 'Odbiór osobisty', engine: 'personal', ...money(0), countries: [{ id:179, ...money(0) }], payments: [{ payment_id:3 }] },
      { title: 'Pocztex AUTOMAT', engine: 'pickupPoint', ...money(870), countries: [{ id:179, ...money(870) }], payments: [{ payment_id:3 }] },
      { title: 'Kurier Pobranie', engine: '', ...money(900), countries: [{ id:179, ...money(900) }], payments: [{ payment_id:2 }] },
      { title: 'Pocztex KURIER', engine: '', ...money(cents), countries: [{ id:179, ...money(cents) }], payments: [{ payment_id:3 }] },
    ] };
}
test('real storefront shape: prepaid home courier, not pickup, COD or free-shipping teaser', () => {
  assert.equal(selectHomeDelivery(fixture()).costGrosze, 1050);
  assert.equal(selectHomeDelivery(fixture(0)).costGrosze, 0);
  const dpd = fixture(2460); dpd.shippings[3].title='Transport DPD';
  assert.equal(selectHomeDelivery(dpd).costGrosze,2460);
  const integrated = fixture(1800); integrated.shippings[3].engine='ShoperShipment'; integrated.shippings[3].title='InPost Kurier';
  integrated.shippings[1].engine='ShoperShipment'; integrated.shippings[1].title='InPost Paczkomaty 24/7';
  integrated.payments[0].name='shoperP24';
  assert.equal(selectHomeDelivery(integrated).costGrosze,1800);
  integrated.shippings[3].engine='unreviewedModule';
  assert.throws(()=>selectHomeDelivery(integrated),/no_home_delivery/);
  const lobo = fixture(2490); lobo.shippings[3].title='Przesyłka kurierska (DHL)';
  lobo.shippings.push({ title:'Przesyłka kurierska (InPost)', description:'Opłata zależy od wagi. Przesyłki paletowe nie zawierają usługi wniesienia.', engine:'inpost', ...money(2290), countries:[{id:179,...money(2290)}], payments:[{payment_id:3}] });
  lobo.shippings.push({ title:'InPost Paczkomat 24/7', engine:'inpost', ...money(1899), countries:[{id:179,...money(1899)}], payments:[{payment_id:3}] });
  assert.equal(selectHomeDelivery(lobo,'Lobo').costGrosze,2290);
  lobo.shippings[4].engine='unknown';
  assert.equal(selectHomeDelivery(lobo,'Lobo').costGrosze,2490);
  const b = fixture(); b.shippings[3].payments[0] = { payment_id:3, additional_cost:'1,50 zł', additional_cost_float:1.5 };
  assert.equal(selectHomeDelivery(b).costGrosze, 1200);
  b.shippings[3].description = 'Wycena indywidualna, prosimy o kontakt';
  assert.throws(() => selectHomeDelivery(b), /no_home_delivery/);
  b.countries[0].selected = false; assert.throws(() => selectHomeDelivery(b), /country_not_confirmed/);
  for (const n of [null, NaN, -1, 10.501, '10.50']) assert.throws(() => confirmedMoney('10,50 zł', n));
  assert.equal(confirmedMoney('1 299,00 zł', 1299), 129900);
});

function order(count = 1): DeliveredStoreBasket {
  return { store: 'Rab-Dom', materialsGrosze: 1199 * count, deliveryGrosze:null, deliveryMinimumGrosze:0, totalGrosze:null, source:'unknown',
    lines: [{ product: { id:'remont-5907758515952', name:'Taśma', imageUrl:null }, unit:'mb',
      packages: [{ packageSize:50, count, unitPriceGrosze:1199, lineCostGrosze:1199*count, offerId:'rabdom-tape-30mm', store:'Rab-Dom', url:null }] }] };
}
test('anonymous carts: basket quantity, gross prices, destination cache isolation, weight-sensitive quotes', async () => {
  let sessions = 0, calls = 0, downsize = false;
  const carts = new Map<string, number>();
  const fetchImpl: typeof fetch = async (input, options) => {
    calls++;
    const url = new URL(String(input)), headers = new Headers(options?.headers);
    const cookie = headers.get('cookie') || `sid=${++sessions}`;
    let data: any;
    if (url.pathname.includes('/products/')) data = { id:2526, ean:'5907758515952', stockId:2526, can_buy:true, price:{ gross:{ final:'11,99 zł', final_float:11.99 } } };
    else if (options?.method === 'POST') { const body = JSON.parse(String(options.body)); carts.set(cookie, body.quantity); data = {}; }
    else {
      const n = downsize ? 1 : carts.get(cookie)!;
      data = { ...fixture(n > 1 ? 2100 : 1050), products: [{ stock_id:2526, quantity:n, price:'11,99 zł', price_float:11.99, sum:(n*11.99).toFixed(2).replace('.',',')+' zł', sum_float:n*11.99 }],
        basket:{ sum_products:(n*11.99).toFixed(2).replace('.',',')+' zł', sum_products_float:n*11.99 } };
    }
    return new Response(JSON.stringify(data), { headers:{ 'content-type':'application/json', 'set-cookie':cookie+'; Path=/; HttpOnly' } });
  };
  const quote = createRetailerQuoter(fetchImpl);
  const first = await quote(order(), '00-001'); assert.ok('quote' in first); assert.equal(first.quote.costGrosze,1050);
  assert.equal(first.quote.basis,'retailer_basket_national');
  const previous = calls; await quote(order(), '00-001'); assert.equal(calls, previous);
  const double = await quote(order(2), '00-001'); assert.ok('quote' in double); assert.equal(double.quote.costGrosze,2100);
  await quote(order(), '30-001'); assert.ok(calls > previous + 3);
  assert.equal(sessions,3);
  downsize = true; const rejected = await quote(order(3), '30-001'); assert.deepEqual(rejected,{ reason:'basket_not_confirmed' });
  const unsupported = await quote({ ...order(), store:'Castorama' }, '00-001'); assert.deepEqual(unsupported,{ reason:'retailer_access_required' });
});

test('Lobo combines Dulux paint, Blue Dolphin tape, Atlas primer and protective film in one prepaid home courier basket', async () => {
  const items = new Map([[55967,{ean:'5904078222379',code:'S7.005777249',stockId:56100,name:'DULUX RAPIDRY Farba do drewna metalu PCV Mat Biały 1 L',price:49.99}],
    [5220,{ean:'5907758515952',code:'s3.566758515952',stockId:5225,name:'BLUE DOLPHIN taśma papierowa niebieska 30mm x 50m',price:15.99}],
    [20533,{ean:'5905400520026',code:'CHEMIK-GRU-02',stockId:20668,name:'ATLAS Emulsja gruntująca UNI-GRUNT 5KG',price:37.9}],
    [11389,{ean:'5907758504932',code:'s3.566CF380',stockId:11394,name:'BLUE DOLPHIN Folia malarska Gruba 4x5m',price:4.49}]]);
  const added=new Map<number,number>(); let calls=0;
  const fakeFetch:typeof fetch=async(input,options)=>{
    calls++; const url=new URL(String(input));
    assert.equal(url.origin,'https://lobo.pl');
    assert.match(url.pathname,/^\/webapi\/front\/pl_PL\/(?:products\/PLN\/\d+|basket\/PLN\/?)$/);
    let body:any;
    const id=Number(url.pathname.match(/\/products\/PLN\/(\d+)/)?.[1]);
    if(id){const item=items.get(id)!;body={id,ean:item.ean,code:item.code,stockId:item.stockId,name:item.name,producer:{name:id===55967?'DULUX':id===20533?'ATLAS':'BLUE DOLPHIN'},unit:{name:'szt.',floating_point:false},can_buy:true,price:{gross:{final:item.price.toFixed(2).replace('.',',')+' zł',final_float:item.price}}};}
    else if(options?.method==='POST'){const addedItem=JSON.parse(String(options.body));added.set(addedItem.stock_id,addedItem.quantity);body={};}
    else {const products=[...items.values()].filter(item=>added.has(item.stockId)).map(item=>{const quantity=added.get(item.stockId)!;return {stock_id:item.stockId,quantity,unit:{name:'szt.',floating_point:false},price:item.price.toFixed(2).replace('.',',')+' zł',price_float:item.price,sum:(item.price*quantity).toFixed(2).replace('.',',')+' zł',sum_float:item.price*quantity};});
      const sum=products.reduce((n,p)=>n+p.sum_float,0);
      body={products,basket:{sum_products:sum.toFixed(2).replace('.',',')+' zł',sum_products_float:sum},countries:[{id:179,name:'Polska',selected:true}],payments:[{payment_id:16,name:'transfer',title:'Przelew'}],shippings:[
        {title:'InPost Paczkomat 24/7',engine:'inpost',...money(1899),countries:[{id:179,...money(1899)}],payments:[{payment_id:16}]},
        {title:'Przesyłka kurierska (InPost)',description:'Przesyłki paletowe nie zawierają usługi wniesienia.',engine:'inpost',...money(2290),countries:[{id:179,...money(2290)}],payments:[{payment_id:16}]}
      ],_flash_messenger:{error:[]}};}
    return Response.json(body,{headers:{'set-cookie':'sid=lobo-test; Path=/; HttpOnly'}});
  };
  const order:DeliveredStoreBasket={store:'Lobo',materialsGrosze:15836,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[
    {product:{id:'dulux',name:'Dulux Rapidry',imageUrl:null},unit:'ml',packages:[{packageSize:1000,count:2,unitPriceGrosze:4999,lineCostGrosze:9998,offerId:'lobo-dulux-rapidry-white-matt-1l',store:'Lobo',url:null}]},
    {product:{id:'tape',name:'Taśma Blue Dolphin',imageUrl:null},unit:'mb',packages:[{packageSize:50,count:1,unitPriceGrosze:1599,lineCostGrosze:1599,offerId:'lobo-tape-30mm',store:'Lobo',url:null}]},
    {product:{id:'primer',name:'Atlas Uni-Grunt',imageUrl:null},unit:'kg',packages:[{packageSize:5,count:1,unitPriceGrosze:3790,lineCostGrosze:3790,offerId:'lobo-atlas-unigrunt-5kg',store:'Lobo',url:null}]},
    {product:{id:'film',name:'Folia Blue Dolphin',imageUrl:null},unit:'m2',packages:[{packageSize:20,count:1,unitPriceGrosze:449,lineCostGrosze:449,offerId:'lobo-film-20m2',store:'Lobo',url:null}]}
  ]};
  const result=await createRetailerQuoter(fakeFetch)(order,'00-001');
  assert.ok('quote' in result);assert.equal(result.quote.costGrosze,2290);
  assert.equal(result.quote.basis,'retailer_basket_national');
  assert.deepEqual([...added],[[56100,2],[5225,1],[20668,1],[11394,1]]);
  assert.equal(calls,9);
});

test('cross-origin redirect never receives storefront cookies or a request', async () => {
  let calls = 0;
  const quote = createRetailerQuoter(async () => { calls++; return new Response('',{status:302,headers:{ location:'https://example.org/', 'set-cookie':'sid=secret' }}); });
  assert.ok('reason' in await quote(order(),'00-001')); assert.equal(calls,1);
});

test('a fourth concurrent quote waits and duplicate requests share its job instead of getting quote_busy',async()=>{
  let started=0,release!:()=>void;
  const gate = new Promise<void>(resolve=>{release=resolve;});
  const quote=createRetailerQuoter(async()=>{started++;await gate;return new Response('',{status:503});});
  const requests=[1,2,3,4].map(count=>quote(order(count),'00-001'));
  const duplicate=quote(order(4),'00-001');
  await new Promise<void>(resolve=>setImmediate(resolve));
  assert.equal(started,3);
  release();
  const results=await Promise.all([...requests,duplicate]);
  assert.equal(started,4);
  assert.ok(results.every(result=>'reason'in result&&result.reason==='quote_unavailable'));
});

test('cached delivery rates refresh before they can expire during another merchant call, without extending native validity', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() }); let calls = 0;
  const quoter = createRetailerQuoter(async (input, init) => {
    calls++; const path = new URL(String(input)).pathname;
    const data = path.includes('/products/') ? { id: 2526, ean: '5907758515952', stockId: 2526, can_buy: true, price: { gross: { final: '11,99 zł', final_float: 11.99 } } }
      : init?.method === 'POST' ? {} : { ...fixture(), products: [{ stock_id: 2526, quantity: 1, price: '11,99 zł', price_float: 11.99, sum: '11,99 zł', sum_float: 11.99 }], basket: { sum_products: '11,99 zł', sum_products_float: 11.99 } };
    return Response.json(data);
  });
  const first = await quoter(order(), '00-001'); assert.ok('quote' in first); assert.equal(calls, 3);
  const expiry = first.quote.expiresAt; t.mock.timers.tick(570000);
  const renewed = await quoter(order(), '00-001'); assert.ok('quote' in renewed); assert.equal(calls, 6);
  assert.equal(first.quote.expiresAt, expiry); assert.ok(Date.parse(renewed.quote.expiresAt) > Date.parse(expiry));
  await quoter(order(), '00-001'); assert.equal(calls, 6);
  let failures = 0; const unavailable = createRetailerQuoter(async () => { failures++; return new Response('', { status: 503 }); });
  await unavailable(order(), '00-001'); t.mock.timers.tick(5000); await unavailable(order(), '00-001'); assert.equal(failures, 1);
});
