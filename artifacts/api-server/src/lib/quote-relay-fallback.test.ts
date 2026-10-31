import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRetailerQuoter} from './retailer-delivery';
import {readRetailSource} from './retail-pages';
import {ETAK_SOURCES} from './etak-sources';
import {QUOTE_RELAY_URL,relayDigest,relaySignature} from './quote-relay-auth';
import {AnonymousShop} from './retailer-http';
import cards from './fixtures/etak-cards-wave158.json';
import native from './fixtures/etak-baskets-wave158.json';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

const secret='1'.repeat(64),source=ETAK_SOURCES[2],saved=native.results[2];
const order:DeliveredStoreBasket={store:'eTak',materialsGrosze:29900,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:null},unit:'szt',packages:[{offerId:source.id,store:'eTak',url:source.url,packageSize:1,count:115,unitPriceGrosze:260,lineCostGrosze:29900}]}]};
function clientMode(t:any){const keys=['REMONT_QUOTE_RELAY_MODE','REMONT_QUOTE_RELAY_SECRET'],before=keys.map(k=>process.env[k]);process.env.REMONT_QUOTE_RELAY_MODE='client';process.env.REMONT_QUOTE_RELAY_SECRET=secret;t.after(()=>keys.forEach((key,i)=>{if(before[i]===undefined)delete process.env[key];else process.env[key]=before[i];}));}
function transport(reason:string){let relayed=0,direct=0;const fetcher:typeof fetch=async(input,init)=>{
  assert.ok(init?.signal);const url=String(input),body=String(init.body??'');
  if(url===QUOTE_RELAY_URL){relayed++;if(reason==='network')throw TypeError('fetch failed');const headers=new Headers(init.headers),raw=JSON.stringify({version:1,requestDigest:relayDigest(body),result:{reason}});return new Response(raw,{headers:{'Content-Type':'application/json','X-Remont-Signature':relaySignature(secret,'response',headers.get('X-Remont-Time')!,headers.get('X-Remont-Nonce')!,raw)}});}
  direct++;if(url===source.url)return new Response(cards[2].html,{headers:{'Content-Type':'text/html'}});
  if(url.includes('/ajax/client-new.php'))return Response.json(saved.destination.body);
  if(url.endsWith('/graphql/v1/'))return Response.json(saved.shipping);
  if(url.endsWith('/pl/basketchange.html'))return Response.json(body==='getAjax=true'?saved.basket:{basket:{products:[],worth:0}});
  throw Error('unreviewed route');
};return{fetcher,counts:()=>({relayed,direct})};}

test('one transient relay failure uses the same verified native basket; duplicate callers share that work',async t=>{
  clientMode(t);
  for(const reason of ['network','quote_unavailable']){const mock=transport(reason),quote=createRetailerQuoter(mock.fetcher),[a,b]=await Promise.all([quote(order,'30-001'),quote(order,'30-001')]);assert.deepEqual(a,b);assert.ok('quote'in a);assert.equal(a.quote.materialsRoundingGrosze,-54);assert.equal(a.quote.costGrosze,1750);assert.equal(a.quote.cartPricing,undefined);assert.equal(mock.counts().relayed,1);assert.equal(mock.counts().direct,5);}
});

test('price, stock, purchase rules, retailer rate limits and a busy quote queue never trigger a second route',async t=>{
  clientMode(t);
  for(const reason of ['price_changed','insufficient_stock','purchase_rules_changed','retailer_rate_limited','quote_busy']){const mock=transport(reason),result=await createRetailerQuoter(mock.fetcher)(order,'30-001');assert.deepEqual(result,{reason});assert.equal(mock.counts().direct,0);assert.equal(mock.counts().relayed,1);}
});

test('price refresh can use a directly verified card after a network failure, while stock and rate limits remain final',async t=>{
  clientMode(t);
  for(const reason of ['network','quote_unavailable']){const mock=transport(reason),result=await readRetailSource(source,mock.fetcher);assert.equal(result.ean,source.ean);assert.equal(result.priceGrosze,260);assert.equal(mock.counts().relayed,1);assert.equal(mock.counts().direct,1);}
  for(const reason of ['retailer_out_of_stock','purchase_rules_changed','retailer_rate_limited']){const mock=transport(reason);await assert.rejects(readRetailSource(source,mock.fetcher),new RegExp(reason));assert.equal(mock.counts().direct,0);}
});

test('a real HTTP429 from the native anonymous client retains its rate-limit meaning',async()=>{
 let calls=0;const client=new AnonymousShop('https://etak.eu',async()=>{calls++;return new Response('Wait',{status:429,headers:{'Retry-After':'60'}});},AbortSignal.timeout(1000));
 await assert.rejects(client.etak('basket'),/retailer_rate_limited/);assert.equal(calls,1);
});

test('a busy price-refresh relay ends the read without adding native merchant traffic',async t=>{
 clientMode(t);const mock=transport('quote_busy');
 await assert.rejects(readRetailSource(source,mock.fetcher),/^Error: quote_busy$/);
 assert.deepEqual(mock.counts(),{relayed:1,direct:0});
});
