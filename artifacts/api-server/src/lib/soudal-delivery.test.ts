import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/soudal-delivery-wave141.json';
import {RETAIL_SOURCES} from './retail-catalog';
import {parseRetailPage} from './retail-pages';
import {quoteChemia,selectChemiaShipping} from './chemia-delivery';
import {quoteAbud} from './abud-delivery';
import {confirmIdosellBasket} from './idosell-basket';
import {AnonymousShop} from './retailer-http';
const pages=fixture.pages,carts=fixture.carts,rates=fixture.rates;
const source=(shop:'chemia'|'abud')=>RETAIL_SOURCES.find(s=>s.id===(shop==='chemia'?'chemiadoparkietu-soudal-26a-5kg':'abud-soudal-26a-5kg'))!;
function order(shop:'chemia'|'abud',count:number){const s=source(shop),price=shop==='chemia'?9350:10520;return{store:s.store,materialsGrosze:price*count,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown' as const,lines:[{product:{id:'remont-'+s.ean,name:s.name,imageUrl:s.imageUrl??null},unit:'kg',packages:[{offerId:s.id,store:s.store,url:s.url,packageSize:5,count,unitPriceGrosze:price,lineCostGrosze:price*count}]}]};}
function native(shop:'chemia'|'abud',count:1|2,mutate?:(kind:string,value:any)=>void){const calls:{url:URL;method:string;body:string}[]=[];const fetchImpl:typeof fetch=async(input,init)=>{
 const url=new URL(String(input)),method=init?.method??'GET',body=String(init?.body??'');calls.push({url,method,body});assert.equal(url.origin,new URL(source(shop).url).origin);assert.ok(!/billing|email|place_order|terms|register|mutation/.test(body));
 if(url.href===source(shop).url){assert.equal(method,'GET');let value:any=pages[shop];mutate?.('page',value);return new Response(value,{headers:{'content-type':'text/html','set-cookie':'soudal_anon=private; Path=/'}});}
 if(url.pathname==='/basketchange.php'){const form=new URLSearchParams(body);assert.deepEqual([...form.keys()],['getAjax','mode','product','size','number']);assert.equal(form.get('product'),String(source(shop).productId));assert.equal(form.get('number'),String(count));assert.equal(form.get('size'),shop==='chemia'?'uniw':'onesize');const value=structuredClone(carts[(shop+count)as keyof typeof carts]);mutate?.('cart',value);return Response.json(value);}
 if(url.pathname==='/ajax/client-new.php'){const value=structuredClone(fixture.destinations.abud);mutate?.('destination',value);return Response.json(value);}
 assert.equal(url.pathname,'/graphql/v1/');const query=JSON.parse(body).query;if(shop==='chemia'){assert.match(query,/forcedRegion: 1143020003/);assert.match(query,/zipCode: "30-001"/);assert.match(query,/shippingCountries/);}const value=structuredClone(rates[(shop+count)as keyof typeof rates]);mutate?.('rates',value);return Response.json(value);
 };return{calls,fetchImpl};}

test('both actual stores sell one entire Soudal 26A 5 kg bucket with the same EAN, not a kg or an Osakryl substitute',()=>{
 for(const shop of ['chemia','abud']as const){const s=source(shop),read=parseRetailPage(pages[shop],s,new Date());assert.equal(read.ean,'5411183028395');assert.equal(read.priceGrosze,shop==='chemia'?9350:10520);for(const code of ['5903518039515','5411183000000'])assert.throws(()=>parseRetailPage(pages[shop].replaceAll('5411183028395',code),s,new Date()));}
});
test('native quantities and whole-basket delivery keep the higher ABUD unit price distinct from its real free courier for two buckets',async()=>{
 for(const shop of ['chemia','abud']as const)for(const count of [1,2]as const){const api=native(shop,count),result=await(shop==='chemia'?quoteChemia:quoteAbud)(order(shop,count),'30-001',api.fetchImpl);assert.ok('quote'in result);assert.equal(result.quote.costGrosze,shop==='abud'&&count===2?0:1300);assert.equal(result.quote.postalCode,'30-001');assert.equal(result.quote.destinationScope,'postal_code');assert.equal(Date.parse(result.quote.expiresAt)-Date.parse(result.quote.checkedAt),600000);assert.equal(api.calls.filter(c=>c.url.pathname==='/basketchange.php').length,1);}
});
test('Chemia confirms explicit Poland and excludes a cheaper locker, collection and COD from a home delivery comparison',()=>{
 assert.deepEqual(selectChemiaShipping(rates.chemia1),{costGrosze:1300,carrier:'InPost Kurier'});
 const missing=structuredClone(rates.chemia1);missing.data.shipping.shipping=missing.data.shipping.shipping.filter(r=>r.prepaid!=='prepaid'||![6,100155].includes(r.courier.id));assert.throws(()=>selectChemiaShipping(missing),/no_home_delivery/);
 for(const change of [(r:any)=>r.data.shippingCountries[0].selected=false,(r:any)=>r.data.shippingCountries[0].name='Niemcy',(r:any)=>r.data.shippingCountries[0].id='other',(r:any)=>r.errors=[{}]]){const value=structuredClone(rates.chemia1);change(value);assert.throws(()=>selectChemiaShipping(value));}
 const duplicate=structuredClone(rates.chemia1),rate=duplicate.data.shipping.shipping.find(r=>r.prepaid==='prepaid'&&r.courier.id===100155)!;duplicate.data.shipping.shipping.push(rate);assert.throws(()=>selectChemiaShipping(duplicate),/invalid_response/);
 rate.cost.value=0;assert.throws(()=>selectChemiaShipping({data:{...rates.chemia1.data,shipping:{shipping:[rate]}}}),/invalid_money/);
});
test('exact native basket proof rejects changed identity, price, quantity, deposits and insufficient stock before shipping',async()=>{
 for(const change of [(r:any)=>r.basket.products[0].id='27095',(r:any)=>r.basket.products[0].link=source('abud').url,(r:any)=>r.basket.products[0].prices.gros='93.49',(r:any)=>r.basket.products[0].count=2,(r:any)=>r.basket.products[0].reservation_stocksown=0,(r:any)=>r.basket.products[0].price_unit='kg',(r:any)=>r.basket.total_deposit=1]){const api=native('chemia',1,(kind,r)=>{if(kind==='cart')change(r);});await assert.rejects(()=>quoteChemia(order('chemia',1),'30-001',api.fetchImpl));assert.ok(!api.calls.some(c=>c.url.pathname==='/graphql/v1/'));}
 assert.equal(confirmIdosellBasket(carts.chemia1,[{source:source('chemia'),count:1,price:9350}],9350).shippingCost,'9.95','the locker/minimum hint is never used as home shipping');
});
test('form-associated product controls have exactly one owner and cannot borrow another form or duplicate ID',()=>{
 const s=source('chemia'),html=pages.chemia;assert.equal(parseRetailPage(html,s,new Date()).priceGrosze,9350);
 for(const changed of [html.replace('form="projector_form" id="projector_product_hidden"','form="other" id="projector_product_hidden"'),html+'<input form="projector_form" id="projector_product_hidden" value="25914">'])assert.throws(()=>parseRetailPage(changed,s,new Date()),/product_id_not_confirmed/);
});
test('new gateway accepts only the reviewed anonymous product and fixed read-only postcode query',async()=>{
 let calls=0;const fetchImpl:typeof fetch=async()=>{calls++;throw Error('network not expected');};const client=new AnonymousShop('https://chemiadoparkietu25.pl',fetchImpl,AbortSignal.timeout(1000));
 for(const [action,args]of [['add',{count:0}],['add',{count:1,productId:27095}],['shipping',{postalCode:'30-001',query:'mutation'}],['shipping',{postalCode:'PL'}],['order',{}]]as any[])await assert.rejects(()=>client.chemia(action,args),/invalid_cart_action/);
 await assert.rejects(()=>new AnonymousShop('https://other.example',fetchImpl,AbortSignal.timeout(1000)).chemia('add',{count:1}),/invalid_cart_action/);assert.equal(calls,0);
});
