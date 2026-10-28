import assert from 'node:assert/strict';
import {test} from 'node:test';
import {AnonymousShop} from '../src/lib/retailer-http';
test('reviewed large Strongman GETs remain bounded without enlarging other retailer or POST limits',async()=>{
 const body=(size:number):typeof fetch=>async()=>new Response('x'.repeat(size));
 const origin='https://topboden.pl',path='/listwy-przypodlogowe/klej-montazowy-strongman-300ml';
 const allowed=new AnonymousShop(origin,body(1_100_000),AbortSignal.timeout(1000));assert.equal((await allowed.text(path)).length,1_100_000);
 await assert.rejects(new AnonymousShop(origin,body(2_000_001),AbortSignal.timeout(1000)).text(path),/response_too_large/);
 for(const url of ['https://other.example'+path,origin+'/other-product',origin+path+'?other=1']){const u=new URL(url);await assert.rejects(new AnonymousShop(u.origin,body(1_000_001),AbortSignal.timeout(1000)).text(u.pathname+u.search),/response_too_large/);}
 await assert.rejects(new AnonymousShop(origin,body(1_000_001),AbortSignal.timeout(1000)).text(path,{x:'1'}),/response_too_large/);
});
