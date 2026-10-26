import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import three from './fixtures/sewera-tile-spacers-hardy-3mm-150.json' with { type:'json' };
import four from './fixtures/sewera-tile-spacers-hardy-4mm-100.json' with { type:'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';
import { createRemontService } from '../src/shared-backend';

const fixtures=[three,four];
const sources=fixtures.map(fixture=>RETAIL_SOURCES.find(row=>row.url===fixture.url)!);
test('current primary retailer HTML confirms exact widths, gross bag prices and different package sizes; conflicting evidence is rejected',()=>{
 fixtures.forEach((fixture,index)=>{
  const source=sources[index],read=(html=fixture.html)=>parseRetailPage(html,source,new Date(fixture.capturedAt)),before=fixture.html,row=read();
  assert.equal(row.priceGrosze,346);assert.equal(row.ean,source.ean);assert.equal(row.observedAt,fixture.capturedAt);assert.ok(row.imageUrl?.endsWith('.webp'));assert.equal(fixture.html,before);
  const width=index===0?'3mm':'4mm';assert.ok(fixture.html.includes(width));assert.throws(()=>read(fixture.html.replaceAll(width,'2mm')));
  assert.throws(()=>read(fixture.html.replaceAll(source.ean,'5905061016845')));
  assert.throws(()=>read(fixture.html.replaceAll('3,46','2,81')));
  assert.throws(()=>read(fixture.html.replaceAll('brutto','netto')));
  assert.throws(()=>parseRetailPage(fixture.html,{...source,retailUnit:'SZT'},new Date(fixture.capturedAt)));
 });
});

test('real HTTP combines same-width demand across rooms and never combines 3mm/150 with 4mm/100 or prices an unreviewed width',async()=>{
 const service=createRemontService({initialObservations:fixtures.map((fixture,index)=>parseRetailPage(fixture.html,sources[index],new Date(fixture.capturedAt))),background:false}),api=express();api.use(express.json());api.use(service.router);
 const server=api.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const job=(id:string,ean:string,quantity:number)=>({jobId:id,materials:[{material:{id:'tile-crosses',name:'Krzyżyki',category:'tile-spacer',unit:'szt',ean},quantity}]});
 const request=async(jobs:unknown[])=>{const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs,options:{store:'Sewera',delivery:{mode:'pickup'}}})});assert.equal(response.status,200);return response.json();};
 try{
  const result=await request([job('one','5905061016869',160),job('two','5905061016869',50),job('four','5905061016876',120)]);
  assert.equal(result.consolidated.lines.length,2);assert.equal(result.consolidated.consolidatedTotalGrosze,1384);
  const line=result.consolidated.lines.find((line:any)=>line.product.ean==='5905061016869');assert.equal(line.packages[0].count,2);assert.equal(line.packages[0].packageSize,150);
  const missing=await request([{jobId:'unknown',materials:[{material:{id:'tile-crosses',name:'Krzyżyki dystansowe 5 mm — dobierz opakowanie',category:'tile-spacer-review',unit:'szt'},quantity:200}]}]);assert.equal(missing.stages[0].lines[0].resolved,false);assert.equal(missing.deliveryComparison.best,null);
 }finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
