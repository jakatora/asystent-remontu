import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRetailerConnectionGuard,RETAILER_CONNECTION_COOLDOWN_MS} from './retailer-connection';

const first='https://www.abud.pl/product-pol-27268-Gotowa-masa-szpachlowa-Super-Finish-5-4-kg-Knauf.html',other='https://realbud.com/webapi/front/pl_PL/products/PLN/75056672';
const failed=()=>new TypeError('fetch failed',{cause:Object.assign(new Error('connect timed out'),{code:'UND_ERR_CONNECT_TIMEOUT'})});

test('a confirmed connection failure pauses only the reviewed origin for exactly 30 seconds and does not extend itself',async()=>{
 let now=1000,calls=0,healthy=false;const guard=createRetailerConnectionGuard(async()=>{calls++;if(!healthy)throw failed();return Response.json({actual:'response'});},[first,other],()=>now);
 await assert.rejects(guard.fetch(first),/^Error: retailer_connection_unavailable$/);assert.equal(calls,1);
 now+=RETAILER_CONNECTION_COOLDOWN_MS-1;await assert.rejects(guard.fetch('https://www.abud.pl/basketedit.php'),/retailer_connection_unavailable/);assert.equal(calls,1);assert.equal(guard.isUnavailable(other),false);
 healthy=true;assert.equal((await guard.fetch(other)).status,200);assert.equal(guard.isUnavailable(first),true);now++;
 assert.equal(guard.isUnavailable(first),false);assert.equal((await guard.fetch(first)).status,200);assert.equal(calls,3);
});

test('HTTP rejection, rate limits, basket failures and generic fetch failures never open the connection cooldown',async()=>{
 for(const status of [400,403,429,500,503]){let calls=0;const guard=createRetailerConnectionGuard(async()=>{calls++;return new Response('',{status});},[first]);for(let i=0;i<2;i++)assert.equal((await guard.fetch(first)).status,status);assert.equal(calls,2);assert.equal(guard.isUnavailable(first),false);}
 for(const error of [Error('price_changed'),Error('insufficient_stock'),Error('retailer_rate_limited'),new TypeError('fetch failed'),new DOMException('expired','TimeoutError')]){let calls=0;const guard=createRetailerConnectionGuard(async()=>{calls++;throw error;},[first]);for(let i=0;i<2;i++)await assert.rejects(guard.fetch(first),e=>e===error);assert.equal(calls,2);assert.equal(guard.isUnavailable(first),false);}
});

test('caller cancellation is never mistaken for an unavailable retailer connection',async()=>{
 for(const requestInput of [false,true]){const controller=new AbortController();controller.abort();let calls=0;const guard=createRetailerConnectionGuard(async()=>{calls++;throw failed();},[first]);for(let i=0;i<2;i++)await assert.rejects(requestInput?guard.fetch(new Request(first,{signal:controller.signal})):guard.fetch(first,{signal:controller.signal}));assert.equal(calls,2);assert.equal(guard.isUnavailable(first),false);}
});

test('unreviewed endpoints are not tracked, and unrelated service instances do not share a failure',async()=>{
 let calls=0;const guard=createRetailerConnectionGuard(async()=>{calls++;throw failed();},[first]);for(let i=0;i<2;i++)await assert.rejects(guard.fetch(other));assert.equal(calls,2);assert.equal(guard.isUnavailable(other),false);await assert.rejects(guard.fetch(first));assert.equal(guard.isUnavailable(first),true);assert.equal(createRetailerConnectionGuard(fetch,[first]).isUnavailable(first),false);
});

test('a newly verified response through another existing route clears the short connectivity pause',async()=>{
 let healthy=false,calls=0;const guard=createRetailerConnectionGuard(async()=>{calls++;if(!healthy)throw failed();return Response.json({});},[first]);await assert.rejects(guard.fetch(first));assert.equal(guard.isUnavailable(first),true);guard.confirmAvailable(first);healthy=true;assert.equal((await guard.fetch(first)).status,200);assert.equal(guard.isUnavailable(first),false);assert.equal(calls,2);
});

test('bounded nested and aggregate system errors are recognized without looping through cyclic causes',async()=>{
 const nested=new AggregateError([Object.assign(new Error('unreachable'),{code:'ENETUNREACH'})]);const error=new TypeError('fetch failed',{cause:nested});const guard=createRetailerConnectionGuard(async()=>{throw error;},[first]);await assert.rejects(guard.fetch(first),/retailer_connection_unavailable/);assert.equal(guard.isUnavailable(first),true);
 const cyclic=new Error('unknown')as Error&{cause?:unknown};cyclic.cause=cyclic;const safe=createRetailerConnectionGuard(async()=>{throw cyclic;},[first]);await assert.rejects(safe.fetch(first),e=>e===cyclic);assert.equal(safe.isUnavailable(first),false);
});
