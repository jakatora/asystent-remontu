import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AnonymousShop, retailerRequestBudget } from '../src/lib/retailer-http';

test('whole-cart request allowance scales beyond 14 products while origin, redirects and a finite call bound remain enforced',async()=>{
  let calls=0;
  const fetchImpl:typeof fetch=async()=>{calls++;return new Response('{}',{headers:{'content-type':'application/json'}});};
  const small=new AnonymousShop('https://shop.example',fetchImpl,AbortSignal.timeout(1000));
  for(let i=0;i<30;i++)await small.json('/product');
  await assert.rejects(small.json('/product'),/request_limit/);
  const large=new AnonymousShop('https://shop.example',fetchImpl,AbortSignal.timeout(1000),retailerRequestBudget(103));
  for(let i=0;i<207;i++)await large.json('/basket-part');
  assert.equal(calls,237);
  await assert.rejects(large.json('https://another-shop.example/basket'),/invalid_redirect/);
  const redirected=new AnonymousShop('https://shop.example',async()=>new Response('',{status:302,headers:{location:'/another'}}),AbortSignal.timeout(1000),retailerRequestBudget(103));
  await assert.rejects(redirected.json('/basket'),/invalid_redirect/);
  for(const invalid of [0,-1,NaN,201,1.5])assert.throws(()=>retailerRequestBudget(invalid),/invalid_basket/);
});
