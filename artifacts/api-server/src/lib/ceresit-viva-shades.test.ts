import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/ceresit-viva-shades.json' with {type:'json'};
import {CERESIT_VIVA_SOURCES} from './ceresit-viva';
import {parseRetailPage} from './retail-pages';
import {createRetailerQuoter} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

test('actual three-shade cards bind exact factory buckets, whole-package prices and native units in both retailers',()=>{
 const cards=fixture.cards as Record<string,string>;
 for(const s of CERESIT_VIVA_SOURCES){const expected=fixture.observations.find(o=>o.sourceId===s.id)!;assert(expected);const actual=parseRetailPage(cards[s.id],s,new Date(fixture.observedAt));assert.equal(actual.ean,s.ean);assert.equal(actual.priceGrosze,expected.priceGrosze);assert.equal(actual.imageUrl,s.imageUrl);if(s.store==='Buduj24')assert.equal(actual.stockPackages,expected.stockPackages);else assert.equal(actual.stockPackages,undefined,'Vague stock text must not invent a numeric warehouse limit');}
});

test('a shade, size, producer, image, GTIN or native purchase-unit mismatch cannot reuse a reviewed Viva source',()=>{
 const cards=fixture.cards as Record<string,string>;
 for(const s of CERESIT_VIVA_SOURCES.filter(s=>s.id.includes('-grey-')||s.store==='ABUD')){const html=cards[s.id],other=CERESIT_VIVA_SOURCES.find(o=>o.store===s.store&&o.ean!==s.ean)!;for(const patch of[{ean:other.ean},{packageSize:s.packageSize===2?4:2},{imageUrl:other.imageUrl},{apiPurchaseUnit:'kg'},{minimumPackages:2}])assert.throws(()=>parseRetailPage(html,{...s,...patch},new Date(fixture.observedAt)),Error);assert.throws(()=>parseRetailPage(html.replaceAll(s.ean,'5900089140015'),s,new Date(fixture.observedAt)),Error);}
 const abud=CERESIT_VIVA_SOURCES.find(s=>s.id==='abud-ceresit-viva-white-2kg')!,html=cards[abud.id];assert.throws(()=>parseRetailPage(html.replace(/(<h1\b[^>]*>)[\s\S]*?<\/h1>/,'$1Fuga Viva Grey 07 2kg</h1>'),abud,new Date(fixture.observedAt)),Error);
});

test('real native mixed-colour and ABUD postcode carts retain physical counts, current discounts and courier evidence',async t=>{
 t.mock.timers.enable({apis:['Date'],now:Date.parse(fixture.observedAt)});const cards=fixture.cards as Record<string,string>;
 for(const c of fixture.cases){let at=0;const q=createRetailerQuoter(async(input,init)=>{const call=c.calls[at++] as {url:string;method:string;status:number;cardRef?:string;body?:string};assert(call);assert.equal(String(input),call.url);assert.equal(init?.method??'GET',call.method);return new Response(call.cardRef?cards[call.cardRef]:call.body,{status:call.status,headers:{'content-type':call.cardRef||c.order.store==='Buduj24'?'text/html':'application/json'}});});const result=await q(c.order as DeliveredStoreBasket,c.postcode);assert.equal(at,c.calls.length);assert('quote'in result);assert.equal(result.quote.costGrosze,c.result.quote.costGrosze);assert.equal(result.quote.basis,c.result.quote.basis);assert.equal(result.quote.destinationScope,c.order.store==='ABUD'?'postal_code':'PL');if(c.order.store==='ABUD')assert.equal(result.quote.postalCode,c.postcode);else assert.equal(result.quote.postalCode,undefined);if(c.name==='white-abud-large'){assert.equal(c.order.lines[0].packages[0].count,5);assert.equal(result.quote.costGrosze,0);assert.equal(result.quote.carrier,'Pocztex Kurier 24');}}
});

test('a missing gross courier amount in the actual free-delivery response never becomes a zero-cost quote',async t=>{
 t.mock.timers.enable({apis:['Date'],now:Date.parse(fixture.observedAt)});const c=fixture.cases.find(c=>c.name==='white-abud-large')!,cards=fixture.cards as Record<string,string>;let at=0;
 const result=await createRetailerQuoter(async(input,init)=>{const call=c.calls[at++] as {url:string;method:string;status:number;cardRef?:string;body?:string};assert.equal(String(input),call.url);assert.equal(init?.method??'GET',call.method);let body=call.cardRef?cards[call.cardRef]:call.body!;if(call.url.endsWith('/graphql/v1/')){const data=JSON.parse(body);for(const r of data.data.shipping.shipping)delete r.cost;body=JSON.stringify(data);}return new Response(body,{status:call.status});})(c.order as DeliveredStoreBasket,c.postcode);assert('reason'in result);assert.equal(at,c.calls.length);
});
