import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../src/shared-backend';
import {parseRetailPage} from '../src/lib/retail-pages';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {KRONOSFERA_PRODUCT} from './fixtures/kronosfera';
import {isMissingOffer,unresolvedReasonKey} from '../../mobile/features/pricing/unresolvedReason';
import type {SerializedLine} from '../../mobile/features/pricing/pricingApi';

test('client messages distinguish real HTTP no-query, no-product and no-offer responses without making an incomplete pickup basket free',async()=>{
 const source=RETAIL_SOURCES.find(source=>source.id==='kronosfera-skirting-lk100f-240')!;
 const service=createRemontService({initialObservations:[parseRetailPage(KRONOSFERA_PRODUCT,source,new Date())],background:false});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const base='http://127.0.0.1:'+(server.address() as {port:number}).port;
  const cases=[
   {name:'',category:null,expected:'no-query',key:'cmp.CostEstimate.reason.empty_query'},
   {name:'Materiał bez odpowiednika w katalogu',category:'skirting',expected:'no-product',key:'cmp.CostEstimate.reason.not_found'},
   {name:'Listwa przypodłogowa MDF biała Krono Original LK100F (2,4 mb)',category:'skirting',expected:'no-offer',key:'cmp.CostEstimate.reason.no_offer'},
  ];
  for(const item of cases){
   const response=await fetch(base+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'contract',materials:[{material:{id:'item',name:item.name,unit:'mb',category:item.category},quantity:2.4}]}],options:{delivery:{mode:'pickup'}}})});
   assert.equal(response.status,200);const data=await response.json(),line:SerializedLine=data.stages[0].lines[0];
   assert.equal(line.resolved,false);assert.equal(line.reason,item.expected);assert.equal(unresolvedReasonKey(line.reason),item.key);assert.equal(isMissingOffer(line.reason),item.expected==='no-offer');
   assert.equal(data.deliveryComparison.best,null);assert.equal(data.deliveryComparison.missingProductCount,1);
  }
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});

test('older persisted response reasons remain readable and an unknown status is never presented as a missing product',()=>{
 assert.equal(unresolvedReasonKey('no_offer'),unresolvedReasonKey('no-offer'));
 assert.equal(unresolvedReasonKey('not_found'),unresolvedReasonKey('no-product'));
 assert.equal(unresolvedReasonKey('empty_query'),unresolvedReasonKey('no-query'));
 assert.equal(unresolvedReasonKey('no_price'),'cmp.CostEstimate.reason.no_price');
 assert.equal(unresolvedReasonKey(undefined),'cmp.CostEstimate.reason.unknown');
 assert.equal(isMissingOffer('no-query'),false);assert.equal(isMissingOffer('no-product'),false);
});
