import assert from 'node:assert/strict';
import {test} from 'node:test';
import data from './fixtures/ceresit-viva-white.json' with {type:'json'};
import {parseRetailPage} from './retail-pages';
import {CERESIT_VIVA_SOURCES} from './ceresit-viva';
import {createRetailerQuoter} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';
const fixture=data as unknown as {observedAt:string;cards:Record<string,string>;observations:{sourceId:string;stockPackages:number}[];cases:{name:string;postcode:string;order:DeliveredStoreBasket;calls:{url:string;method:string;status:number;cardRef?:string;body?:string}[]}[]};

test('actual Viva cards confirm separate White 01 buckets, gross prices and finite whole-bucket stock',()=>{
  for(const[source,price,size]of[[CERESIT_VIVA_SOURCES[0],3544,2],[CERESIT_VIVA_SOURCES[1],5939,4]]as const){
    const o=parseRetailPage(fixture.cards[source.id],source,new Date(fixture.observedAt));assert.equal(o.priceGrosze,price);assert.equal(o.ean,source.ean);assert.equal(source.packageSize,size);assert.equal(o.stockPackages,fixture.observations.find(o=>o.sourceId===source.id)!.stockPackages);assert.equal(o.imageUrl,source.imageUrl);
  }
});
test('Viva cannot borrow CE40, a different shade, another bucket size, a kg purchase unit or invented stock',()=>{
  const source=CERESIT_VIVA_SOURCES[0],html=fixture.cards[source.id];
  for(const patch of[{ean:'5900089140015'},{packageSize:4},{category:'primer'},{url:CERESIT_VIVA_SOURCES[1].url},{minimumPackages:2},{id:'buduj24-ceresit-viva-unreviewed'}])assert.throws(()=>parseRetailPage(html,{...source,...patch},new Date(fixture.observedAt)),Error,JSON.stringify(patch));
  const changedCards=[html.replaceAll(source.ean,'5900089140015'),html.replaceAll('White 01','Carrara 03'),html.replaceAll('CER-3141510','3147322'),html.replace('class="unit product-unit">szt.','class="unit product-unit">kg'),html.replace('data-unit="szt."','data-unit="kg"'),html.replace('1 szt.</span>','1.5 szt.</span>'),html.replace('1 szt.</span>','0 szt.</span>'),html.replaceAll('%2F19506%2F','%2F19564%2F')];
  for(const[i,changed]of changedCards.entries()){assert.notEqual(changed,html);assert.throws(()=>parseRetailPage(changed,source,new Date(fixture.observedAt)),Error,'card mutation '+i);}
});
test('real one-bucket and mixed-bucket responses preserve actual courier charges and reject over-stock before cart mutation',async t=>{
  t.mock.timers.enable({apis:['Date'],now:Date.parse(fixture.observedAt)});
  for(const c of fixture.cases){let at=0;const fetcher:typeof fetch=async(input,init)=>{const expected=c.calls[at++];assert(expected,'Unexpected extra merchant request');assert.equal(String(input),expected.url);assert.equal(init?.method??'GET',expected.method);return new Response(expected.cardRef?fixture.cards[expected.cardRef]:expected.body,{status:expected.status,headers:{'Content-Type':'text/html; charset=utf-8'}});};
    const result=await createRetailerQuoter(fetcher)(c.order as DeliveredStoreBasket,c.postcode);assert.equal(at,c.calls.length);if(c.name==='over-stock')assert.deepEqual(result,{reason:'insufficient_stock'});else{assert('quote'in result);assert.equal(result.quote.costGrosze,1500);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.postalCode,undefined);}
  }
});
