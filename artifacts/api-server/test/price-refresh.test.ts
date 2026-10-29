import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../src/shared-backend';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {collectSeenPrices,comparePriceSnapshots} from '../../mobile/features/pricing/priceChanges';

test('actual HTTP refresh coalesces requests, preserves failed source dates and exposes same-store price delta',async()=>{
  const source=RETAIL_SOURCES.find(s=>s.id==='sewera-sniezka-5l')!;
  const old=new Date(Date.now()-3600_000).toISOString();let reads=0,price='99.50';
  const service=createRemontService({background:false,initialObservations:[{sourceId:source.id,ean:source.ean,name:source.name,imageUrl:null,priceGrosze:9850,currency:'PLN',availability:'in_stock',observedAt:old,sourceUrl:source.url,evidenceSha256:'a'.repeat(64)}],fetchImpl:async input=>{
    reads++;await new Promise(r=>setTimeout(r,1));
    if(String(input)!==source.url)return new Response('',{status:503});
    const html=`<div itemscope itemtype="http://schema.org/Product"><h1 itemprop="name">${source.name}</h1><div itemprop="offers" itemscope itemtype="http://schema.org/Offer"><meta itemprop="priceCurrency" content="PLN"><meta itemprop="price" content="${price}"><span class="priceShow">${price.replace('.',',')} zł brutto / SZT</span></div><div><strong>Kod kreskowy:</strong>${source.ean}</div><div><strong>Producent:</strong>${source.brand}</div><div><strong>Dostępne:</strong>10 SZT</div></div>`;
    return new Response(html,{headers:{'content-type':'text/html'}});
  }});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  const url=`http://127.0.0.1:${(server.address() as any).port}/pricing/project`;
  const post=async(refreshPrices=false,material={id:'p',name:source.name,ean:source.ean,unit:'l'})=>{const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'paint',materials:[{material,quantity:8.5}]}],options:{refreshPrices}})});assert.equal(r.status,200);return r.json()};
  try{
    const before=await post();assert.equal(reads,0);
    const [a,b]=await Promise.all([post(true),post(true)]);
    const projectSources=RETAIL_SOURCES.filter(row=>row.ean===source.ean);
    assert.equal(reads,projectSources.length);assert.deepEqual(a.priceRefresh.confirmedOfferIds,[source.id]);
    assert.equal(a.priceRefresh.failedOfferIds.length,projectSources.length-1);
    assert.deepEqual(b.priceRefresh.confirmedOfferIds,[source.id]);
    for(const disabled of RETAIL_SOURCES.filter(source=>source.disabledReason))assert.equal(a.coverage.sources.find((row:any)=>row.id===disabled.id).error,disabled.disabledReason);
    for(const untouched of RETAIL_SOURCES.filter(row=>row.store==='Leroy Merlin'&&row.browserReviewAllowed&&!projectSources.includes(row)))assert.equal(a.coverage.sources.find((row:any)=>row.id===untouched.id).error,null);
    const changes=comparePriceSnapshots(collectSeenPrices(before),collectSeenPrices(a));assert.equal(changes[0].deltaGrosze,100);
    assert.equal(a.stages[0].lines[0].offers[0].packageSize,'5');assert.equal(b.stages[0].lines[0].offers[0].priceGrosze,9950);
    price='97.50';const cached=await post(true);assert.equal(cached.priceRefresh.status,'recent');assert.equal(reads,projectSources.length);
    const tape=RETAIL_SOURCES.find(row=>row.id==='sewera-tape-30mm')!;
    const tapeSources=RETAIL_SOURCES.filter(row=>row.ean===tape.ean);
    const other=await post(true,{id:'tape',name:tape.name,ean:tape.ean,unit:tape.unit});
    assert.equal(other.priceRefresh.status,'updated');
    assert.equal(other.priceRefresh.confirmedOfferIds.length,0);
    assert.equal(other.priceRefresh.failedOfferIds.length,tapeSources.length);
    assert.equal(reads,projectSources.length+tapeSources.length);
    await service.refresh();const cheaper=await post();assert.equal(comparePriceSnapshots(collectSeenPrices(a),collectSeenPrices(cheaper))[0].deltaGrosze,-200);
  }finally{await new Promise<void>(r=>server.close(()=>r()));service.close();}
});

test('project refresh completes while the periodic full catalogue read is still in progress',async()=>{
  const blocked=new Set(RETAIL_SOURCES.slice(0,3).map(source=>source.url));
  const tape=RETAIL_SOURCES.find(source=>source.id==='sewera-tape-30mm')!;
  let release!:()=>void;
  const gate=new Promise<void>(resolve=>{release=resolve});
  let blockedReads=0;
  const service=createRemontService({background:false,fetchImpl:async input=>{
    if(blocked.has(String(input))){blockedReads++;await gate}
    return new Response('',{status:503});
  }});
  const app=express();app.use(express.json());app.use(service.router);
  const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  try{
    const full=service.refresh();
    assert.equal(blockedReads,3);
    const url=`http://127.0.0.1:${(server.address() as any).port}/pricing/project`;
    const response=await Promise.race([
      fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        jobs:[{jobId:'paint',materials:[{material:{id:'tape',name:tape.name,ean:tape.ean,unit:tape.unit},quantity:1}]}],
        options:{refreshPrices:true},
      })}),
      new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('project refresh waited for full catalogue')),3000)),
    ]);
    assert.equal(response.status,200);
    const body=await response.json();
    assert.equal(body.priceRefresh.status,'updated');
    assert.equal(body.priceRefresh.failedOfferIds.length,RETAIL_SOURCES.filter(source=>source.ean===tape.ean).length);
    assert.equal(service.status().running,true);
    release();await full;
  }finally{release();await new Promise<void>(resolve=>server.close(()=>resolve()));service.close()}
});
