import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createServer} from 'node:http';
import {createQuoteRelayHandler} from './quote-relay-server';
import {quoteThroughRelay,readThroughRelay} from './quote-relay-client';
import {QUOTE_RELAY_URL} from './quote-relay-auth';
import {createRetailerQuoter} from './retailer-delivery';
import {createRetailerConnectionGuard} from './retailer-connection';
import {RETAIL_SOURCES} from './retail-catalog';
import fixture from './fixtures/ceresit-viva-shades.json' with {type:'json'};
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

const secret='1'.repeat(64),sample=fixture.cases.find(c=>c.order.store==='Buduj24')!,order=sample.order as DeliveredStoreBasket;
function mode(t:any){const before=[process.env.REMONT_QUOTE_RELAY_MODE,process.env.REMONT_QUOTE_RELAY_SECRET];process.env.REMONT_QUOTE_RELAY_MODE='client';process.env.REMONT_QUOTE_RELAY_SECRET=secret;t.after(()=>{for(const [i,key]of ['REMONT_QUOTE_RELAY_MODE','REMONT_QUOTE_RELAY_SECRET'].entries())if(before[i]===undefined)delete process.env[key];else process.env[key]=before[i];});}
async function service(t:any,options:any){const server=createServer(createQuoteRelayHandler({secret,...options}));server.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));t.after(()=>new Promise<void>(r=>server.close(()=>r())));const url='http://127.0.0.1:'+(server.address()as any).port;return(async(input:any,init:any)=>{assert.equal(String(input),QUOTE_RELAY_URL);return fetch(url,init);})as typeof fetch;}
function replay(){let at=0;const fetcher:typeof fetch=async(input,init)=>{const call=sample.calls[at++]as {url:string;method:string;status:number;cardRef?:string;body?:string};assert(call);assert.equal(String(input),call.url);assert.equal(init?.method??'GET',call.method);return new Response(call.cardRef?(fixture.cards as Record<string,string>)[call.cardRef]:call.body,{status:call.status,headers:{'content-type':'text/html'}});};return{fetcher,count:()=>at};}

test('signed Buduj24 delivery replays the real exact cart and retains national PL scope without a postcode claim',async t=>{
 t.mock.timers.enable({apis:['Date'],now:Date.parse(fixture.observedAt)});const native=replay(),transport=await service(t,{fetchImpl:native.fetcher});const result=await quoteThroughRelay(order,'00-001',transport,secret);assert('quote'in result);assert.equal(result.quote.costGrosze,1500);assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.postalCode,undefined);assert.equal(result.quote.sourceUrl,'https://buduj24.pl/cart');assert.equal(native.count(),sample.calls.length);
});

test('a native-origin connection cooldown does not suppress the independent authenticated Buduj24 route',async t=>{
 mode(t);t.mock.timers.enable({apis:['Date'],now:Date.parse(fixture.observedAt)});const native=replay(),transport=await service(t,{fetchImpl:native.fetcher});let direct=0;const source=RETAIL_SOURCES.find(s=>s.id===order.lines[0].packages[0].offerId)!;
 const guard=createRetailerConnectionGuard(async(input,init)=>{if(String(input)===QUOTE_RELAY_URL)return transport(input,init);direct++;throw new TypeError('fetch failed',{cause:Object.assign(Error('connection'),{code:'UND_ERR_CONNECT_TIMEOUT'})});},[source.url]);await assert.rejects(guard.fetch(source.url),/retailer_connection_unavailable/);assert(guard.isUnavailable(source.url));const result=await createRetailerQuoter(guard.fetch,guard)(order,'00-001');assert('quote'in result);assert.equal(result.quote.costGrosze,1500);assert.equal(direct,1);assert.equal(native.count(),sample.calls.length);assert.equal(guard.isUnavailable(source.url),false);
});

test('signed Buduj24 refresh selects the reviewed source and binds finite bucket stock and actual prices',async t=>{
 const source=RETAIL_SOURCES.find(s=>s.id==='buduj24-ceresit-viva-grey-2kg')!,observed=fixture.observations.find(o=>o.sourceId===source.id)!;let bad=false,calls=0;const transport=await service(t,{readSource:async(s:any)=>{calls++;assert.equal(s.id,source.id);return{...observed,observedAt:new Date().toISOString(),ean:bad?'9000101173536':source.ean};}});const result=await readThroughRelay(source,transport,secret);assert.equal(result.priceGrosze,3544);assert.equal(result.stockPackages,2);bad=true;await assert.rejects(readThroughRelay(source,transport,secret),/retailer_observation_not_confirmed/);assert.equal(calls,2);
});

test('a signed national Buduj24 reply cannot acquire a false postcode, source URL, extra discount or expiry',async t=>{
 const valid=()=>{const now=Date.now();return{quote:{costGrosze:0,carrier:'Controlled courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:'https://buduj24.pl/cart',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:'a'.repeat(64)}};};
 for(const patch of [{postalCode:'00-001'},{destinationScope:'postal_code'},{sourceUrl:'https://other.example/cart'},{cartPricing:{}},{materialsRoundingGrosze:1},{expiresAt:new Date(Date.now()+6000010).toISOString()}]){const transport=await service(t,{quote:async()=>{const r=valid();Object.assign(r.quote,patch);return r;}});await assert.rejects(quoteThroughRelay(order,'00-001',transport,secret),/quote_unavailable/);}
});
