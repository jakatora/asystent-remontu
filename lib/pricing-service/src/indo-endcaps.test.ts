import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database} from '@workspace/db/repositories';
import type {Product,ProductOffer} from '@workspace/db/schema';
import {estimateProjectCostFromCalculation,type CalculatorStageResult} from './from-calculator';
import type {EstimateDeps} from './estimate';
import {confirmedIndoEndcapDemand,INDO_ENDCAP_EAN} from './indo-endcaps';
const db={}as Database;
const product={id:'pair',ean:INDO_ENDCAP_EAN,gtin:null,name:'INDO L+R',normalizedName:'indo l r',category:'skirting-accessory',packageSize:'1'}as Product;
const offer={id:'pack',productId:'pair',store:'TopBoden',price:'8.00',promoPrice:null,regularPrice:null,unit:'kpl',packageSize:'1',pricePerUnit:null,productUrl:'https://topboden.pl/listwy-przypodlogowe/indo-zakonczenie-prawe-lewe-bialy-polysk-01-opakowanie-foliowe',availability:'in_stock',source:'TopBoden',fetchedAt:new Date()}as ProductOffer;
const deps:EstimateDeps={findProductByCode:async()=>product,findProductByNameAndCategory:async()=>null,listOffers:async()=>[offer]};
const stage=(left:number,right:number):CalculatorStageResult=>({jobId:'skirting-boards',materials:[{material:{id:'skirting-endcaps',ean:INDO_ENDCAP_EAN,name:'INDO L+R',unit:'kpl'},quantity:Math.max(left,right),indoEndcaps:{version:1,left,right}}]});
test('opposite handed requirements share complete left/right packs and preserve additional manual pairs',async()=>{
 const jobs=[stage(2,0),stage(0,2)];const result=await estimateProjectCostFromCalculation(db,jobs,{},deps),line=result.consolidated.lines[0];
 assert.equal(line.totalQuantity,2);assert.equal(line.packagesNeeded,2);assert.equal(line.lineCostGrosze,1600);assert.deepEqual(line.indoEndcapPlan,{left:2,right:2,pairs:2,additionalPairs:0,savedPairs:2});
 const manual={jobId:'manual',materials:[{material:{id:'extra',ean:INDO_ENDCAP_EAN,name:'INDO L+R',unit:'kpl'},quantity:3}]};const extra=await estimateProjectCostFromCalculation(db,[...jobs,manual],{},deps);assert.equal(extra.consolidated.lines[0].packagesNeeded,5);assert.equal(extra.consolidated.lines[0].indoEndcapPlan!.additionalPairs,3);
});
test('handedness metadata cannot optimize another EAN, unit, physical pack or changed manual quantity',async()=>{
 for(const[ean,unit,pack,q,v]of [['5900000000000','kpl',1,2,{version:1,left:2,right:0}],[INDO_ENDCAP_EAN,'szt',1,2,{version:1,left:2,right:0}],[INDO_ENDCAP_EAN,'kpl',2,2,{version:1,left:2,right:0}],[INDO_ENDCAP_EAN,'kpl',1,1,{version:1,left:2,right:0}],[INDO_ENDCAP_EAN,'kpl',1,2,{version:1,left:-1,right:2}]]as const)assert.equal(confirmedIndoEndcapDemand(ean,unit,pack,q,v),null);
 const changed=stage(2,0);(changed.materials[0]as{quantity:number}).quantity=1;const result=await estimateProjectCostFromCalculation(db,[changed,stage(0,2)],{},deps);assert.equal(result.consolidated.lines[0].packagesNeeded,3);assert.equal(result.consolidated.lines[0].indoEndcapPlan!.additionalPairs,1);
});
