import assert from 'node:assert/strict';
import {test} from 'node:test';
import cards from './fixtures/etak-cards-wave158.json';
import native from './fixtures/etak-baskets-wave158.json';
import {ETAK_SOURCES,ETAK_ORIGIN} from './etak-sources';
import {readEtakCard} from './etak-product';
import {parseRetailPage} from './retail-pages';
import {confirmEtakBasket,confirmEtakDestination,quoteEtak,selectEtakShipping} from './etak-delivery';
import {AnonymousShop} from './retailer-http';
import {quotedMaterialsGrosze} from '../../../../lib/pricing-service/src/cart-pricing';
import {compareAutomaticDelivery} from '../../../../lib/pricing-service/src/automatic-delivery';
import {estimateStageCost} from '../../../../lib/pricing-service/src/estimate';
import type {Database,Product,ProductOffer} from '@workspace/db/repositories';

const expected=(quantities:number[])=>ETAK_SOURCES.flatMap((source,i)=>quantities[i]?[{source,count:quantities[i],price:cards[i].card.priceGrosze,net:cards[i].card.netPriceGrosze}]:[]);
const base=(rows:ReturnType<typeof expected>)=>rows.reduce((n,r)=>n+r.count*r.price,0);
const order=(rows:ReturnType<typeof expected>)=>({store:'eTak',materialsGrosze:base(rows),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown' as const,lines:rows.map(r=>({product:{id:'remont-'+r.source.ean,name:r.source.name,imageUrl:r.source.imageUrl!},unit:'szt',packages:[{offerId:r.source.id,store:'eTak',url:r.source.url,packageSize:1,count:r.count,unitPriceGrosze:r.price,lineCostGrosze:r.count*r.price}]}))});

test('three native eTak cards bind model, GTIN, individual sale, net/gross23% and finite stock',()=>{
  for(const [i,s]of ETAK_SOURCES.entries()){
    const card=readEtakCard(cards[i].html,s),observed=parseRetailPage(cards[i].html,s,new Date());
    assert.equal(card.priceGrosze,cards[i].card.priceGrosze);assert.equal(observed.ean,s.ean);assert.equal(observed.stockPackages,card.maxPackages);
    for(const change of [{packageSize:25},{ean:ETAK_SOURCES[(i+1)%3].ean},{productId:1},{retailerSku:'221-612'},{url:'https://other.example/product'},{purchaseMultiple:25}])assert.throws(()=>readEtakCard(cards[i].html,{...s,...change}));
    for(const [from,to]of [['"vat":"23"','"vat":"8"'],['"unit_sellby":"1"','"unit_sellby":"25"'],['"code_extern":"'+s.retailerSku+'"','"code_extern":"221-612"'],['"basket_enable":"y"','"basket_enable":"n"']]){
      assert.ok(cards[i].html.includes(from));assert.throws(()=>readEtakCard(cards[i].html.replace(from,to),s));
    }
    assert.throws(()=>readEtakCard(cards[i].html+cards[i].html,s));
  }
});

test('native VAT rounding preserves exact mixed line totals, whole basket subtotal and free-shipping threshold',()=>{
  const expectedRounding=[-3,0,-54,-55];
  for(const [i,saved]of native.results.entries()){
    const rows=expected(saved.quantities),confirmed=confirmEtakBasket(saved.basket,rows,base(rows));
    assert.equal(confirmed.materialsRoundingGrosze,expectedRounding[i]);assert.equal(selectEtakShipping(saved.shipping).costGrosze,i===3?0:1750);
    confirmEtakDestination(saved.destination.body);
  }
});

test('no small tolerance can admit a forged net price, VAT, line sum, missing stock, duplicate line or wrong model',()=>{
  const rows=expected(native.results[0].quantities),original=native.results[0].basket;
  const mutations=[(x:any)=>x.basket.products[0].prices.net='2.10',(x:any)=>x.basket.products[0].prices.worth_gros='10.39',(x:any)=>x.basket.products[0].vat='8.0',
    (x:any)=>x.basket.products[0].count++,(x:any)=>x.basket.products[0].name='WAGO 221-413',(x:any)=>x.basket.products[0].reservation_stocksown=0,
    (x:any)=>x.basket.products[0].subscription_period='30',(x:any)=>x.basket.products[0].available_now='n',(x:any)=>x.basket.products.push(x.basket.products[0]),(x:any)=>x.basket.worth=17.41,(x:any)=>x.basket.worth_net=14.15,
    (x:any)=>x.basket.total_deposit=1,(x:any)=>x.basket.currency='EUR'];
  for(const mutate of mutations){const changed=structuredClone(original);mutate(changed);assert.throws(()=>confirmEtakBasket(changed,rows,base(rows)));}
  assert.throws(()=>confirmEtakBasket(original,rows,base(rows)-1));
});

test('home courier must be explicit for Poland and prepaid; lockers, COD and shippingCost placeholder do not qualify',()=>{
  const sample=native.results[0].shipping;assert.equal(selectEtakShipping(sample).costGrosze,1750);
  for(const mutate of [(x:any)=>x.data.shipping.shipping=x.data.shipping.shipping.filter((r:any)=>r.prepaid!=='prepaid'||r.courier.id!==100206),
    (x:any)=>x.data.shippingCountries[0].selected=false,(x:any)=>x.data.shippingCountries[0].id='OTHER',(x:any)=>x.data.shipping.shipping.find((r:any)=>r.prepaid==='prepaid'&&r.courier.id===100206).cost.formatted='0,00 zł',
    (x:any)=>x.data.shipping.shipping.push(x.data.shipping.shipping.find((r:any)=>r.prepaid==='prepaid'&&r.courier.id===100206))]){const changed=structuredClone(sample);mutate(changed);assert.throws(()=>selectEtakShipping(changed));}
  const changed=structuredClone(native.results[0].destination.body);changed.valid_region['1'][0].url='https://elektrykowo.pl';assert.throws(()=>confirmEtakDestination(changed));
});

test('transport permits only pinned products, postcode-only checks and anonymous cart reads, never checkout or customer data',async()=>{
  let calls=0;const client=new AnonymousShop(ETAK_ORIGIN,async()=>{calls++;return new Response('{}')},AbortSignal.timeout(1000));
  for(const[action,args]of [['order',{}],['add',{productId:999,count:1}],['add',{productId:732,count:1,email:'x@example.com'}],['shipping',{postalCode:'30-001',productId:732}],['basket',{count:1}],['destination',{postalCode:'30-001&order=1'}]])await assert.rejects(client.etak(action as any,args as any),/invalid_cart_action/);
  const wrong=new AnonymousShop('https://other.example',async()=>{calls++;return new Response('{}')},AbortSignal.timeout(1000));await assert.rejects(wrong.etak('basket'),/invalid_cart_action/);assert.equal(calls,0);
});

test('quoter ignores the stale add response, verifies a separate complete read and keeps VAT out of discount/history',async()=>{
  const saved=native.results[0],rows=expected(saved.quantities),requests:{url:string;body:string}[]=[];
  const fetcher:typeof fetch=async(input,init)=>{
    const url=new URL(String(input)),body=String(init?.body??'');requests.push({url:url.href,body});
    const source=ETAK_SOURCES.find(s=>s.url===url.href);if(source)return new Response(cards[ETAK_SOURCES.indexOf(source)].html);
    if(url.pathname==='/ajax/client-new.php')return Response.json(saved.destination.body);
    if(url.pathname==='/graphql/v1/')return Response.json(saved.shipping);
    if(url.pathname==='/pl/basketchange.html')return Response.json(body==='getAjax=true'?saved.basket:{basket:{products:[],worth:0}});
    throw Error('unreviewed request');
  };
  const basket=order(rows),before=JSON.stringify(basket),result=await quoteEtak(basket,'30-001',fetcher);assert.ok('quote'in result);
  assert.equal(result.quote.materialsRoundingGrosze,-3);assert.equal(result.quote.cartPricing,undefined);assert.equal(quotedMaterialsGrosze(basket,result.quote),1742);assert.equal(result.quote.costGrosze,1750);assert.equal(JSON.stringify(basket),before);
  assert.equal(requests.filter(r=>r.body.includes('mode=1')).length,3);assert.equal(requests.filter(r=>r.body==='getAjax=true').length,1);assert.equal(requests.at(-1)!.url,ETAK_ORIGIN+'/graphql/v1/');assert.ok(requests.at(-1)!.body.includes('30-001'));
});

test('actual native threshold changes the cheapest delivered basket without changing the catalogue unit price',async()=>{
  const source=ETAK_SOURCES[2],product={id:'remont-'+source.ean,name:source.name,category:'wire-connector',packageSize:'1',packageUnit:'szt',imageUrl:source.imageUrl} as Product;
  for(const [quantity,index,winner,total]of [[115,2,'Other',31000],[116,3,'eTak',30105]] as const){
    const offers=['eTak','Other'].map((store,i)=>({id:i?'other':source.id,productId:product.id,store,price:i?'2.60':'2.60',promoPrice:null,packageSize:'1',source:'observed-store-page',availability:'in_stock',fetchedAt:new Date(),productUrl:i?'https://other.example':source.url} as ProductOffer));
    const stage=await estimateStageCost({} as Database,[{query:{ean:source.ean},quantity,unit:'szt'}],{},{findProductByCode:async()=>product,findProductByNameAndCategory:async()=>product,listOffers:async()=>offers});
    const result=await compareAutomaticDelivery([stage],{mode:'shipping',postalCode:'30-001'},async basket=>({quote:{costGrosze:basket.store==='eTak'?selectEtakShipping(native.results[index].shipping).costGrosze:31000-quantity*260,
      ...(basket.store==='eTak'?{materialsRoundingGrosze:confirmEtakBasket(native.results[index].basket,expected(native.results[index].quantities),basket.materialsGrosze).materialsRoundingGrosze}:{}),carrier:'Courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://etak.eu/pl/basketedit.html',destinationScope:'postal_code',postalCode:'30-001',basis:'retailer_basket_postcode',evidenceSha256:'a'.repeat(64)}}));
    assert.equal(result.best!.totalGrosze,total);assert.equal(result.best!.stores[0].store,winner);assert.equal(result.best!.stores[0].lines[0].packages[0].unitPriceGrosze,260);
  }
});
