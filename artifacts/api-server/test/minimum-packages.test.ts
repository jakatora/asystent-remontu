import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import type {Database,Product} from '@workspace/db/repositories';
import type {PurchaseOffer} from '../../../lib/pricing-service/src/types';
import {createPricingRouter} from '../src/routes/pricing';

test('real pricing HTTP preserves the minimum in offers, stage plans and the consolidated renovation',async()=>{
 const product={id:'minimum-eps',name:'Styropian 3 m2',ean:'5902578301976',packageSize:'3',packageUnit:'m2'} as Product;
 const offer={id:'minimum-store',productId:product.id,store:'Minimum test',price:'69.74',promoPrice:null,regularPrice:null,unit:'m2',packageSize:'3',productUrl:'https://example.com/product',source:'retailer-product-api',availability:'in_stock',fetchedAt:new Date(),pricePerUnit:null,minimumPackages:50} as PurchaseOffer;
 const app=express();app.use(express.json());app.use(createPricingRouter({getDb:()=>({}as Database),deps:{findProductByCode:async()=>product,findProductByNameAndCategory:async()=>null,listOffers:async()=>[offer]}}));
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const root='http://127.0.0.1:'+(server.address()as{port:number}).port;
  for(const quantities of [[3],[153],[75,78]]){
   const response=await fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:quantities.map((quantity,index)=>({jobId:'room-'+index,materials:[{material:{id:'eps',name:product.name,ean:product.ean,category:'insulation-eps',unit:'m2'},quantity}]}))})});
   assert.equal(response.status,200);
   const result=await response.json();
   for(const stage of result.stages){
    assert.equal(stage.lines[0].offers[0].minimumPackages,50);
    assert.equal(stage.lines[0].packages[0].minimumPackages,50);
    assert.equal(stage.lines[0].packages[0].purchaseMultiple,undefined);
   }
   const pack=result.consolidated.lines[0].packages[0],count=quantities[0]===3?50:51;
   assert.equal(pack.count,count);assert.equal(pack.minimumPackages,50);assert.equal(pack.purchaseMultiple,undefined);
   assert.equal(result.consolidated.consolidatedTotalGrosze,count*6974);
  }
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
