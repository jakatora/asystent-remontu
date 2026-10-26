import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Product} from '@workspace/db/schema';
import type {Database} from '@workspace/db/repositories';
import type {PackageVariant,PurchaseOffer} from './types';
import {optimizePackages} from './package-optimizer';
import {buildPackageVariants,estimateStageCost,isComparableOffer,selectCheapestOffer,type EstimateDeps} from './estimate';
import {estimateProjectCostFromCalculation} from './from-calculator';
import {compareAutomaticDelivery} from './automatic-delivery';

const variant=(id:string,price:number,max?:number,size=1):PackageVariant=>({offerId:id,store:id,url:null,packageSize:size,unitPriceGrosze:price,...(max===undefined?{}:{maxPackages:max})});
const product={id:'known',name:'Known',packageSize:'1',packageUnit:'szt'} as Product;
const offer=(id:string,price:number,max?:number):PurchaseOffer=>({id,productId:product.id,store:id,productUrl:null,price:(price/100).toFixed(2),promoPrice:null,packageSize:'1',availability:'in_stock',source:'merchant-page',fetchedAt:new Date(),...(max===undefined?{}:{maxPackages:max})} as PurchaseOffer);
const deps=(offers:PurchaseOffer[]):EstimateDeps=>({findProductByCode:async()=>product,findProductByNameAndCategory:async()=>null,listOffers:async()=>offers});
const jobs=(quantities:number[])=>quantities.map((quantity,index)=>({jobId:'room-'+index,materials:[{material:{id:'known',name:'Known',ean:'known',unit:'szt'},quantity}]}));

test('finite same-size stocks survive price grouping and fill a complete split without reusing the cheapest stock',async()=>{
 const offers=[offer('A',100,3),offer('B',200,4)];
 assert.equal(buildPackageVariants(offers,product).length,2);
 assert.equal(selectCheapestOffer(offers,undefined,{quantity:6,product}),null);
 const stage=await estimateStageCost({} as Database,[{query:{ean:'known'},quantity:6}],{},deps(offers));
 const line=stage.lines[0];assert.ok(line.resolved);
 assert.equal(line.lineCost,900);assert.equal(line.packagePlan.totalGrosze,900);
 assert.deepEqual(line.packagePlan.packages.map(p=>[p.store,p.count]),[['A',3],['B',3]]);
 assert.equal(optimizePackages(8,buildPackageVariants(offers,product)),null);
 const full=offer('C',400,20);assert.equal(selectCheapestOffer([...offers,full],undefined,{quantity:6,product})?.store,'C');
});

test('stock respects physical packs, lot increments and the once-only minimum',()=>{
 const v={...variant('A',100,9,2),purchaseMultiple:2,minimumPackages:5};
 assert.equal(optimizePackages(3,[v])?.packages[0].count,6);
 assert.equal(optimizePackages(16,[v])?.packages[0].count,8);
 assert.equal(optimizePackages(18,[v]),null);
 assert.equal(optimizePackages(0,[v])?.totalGrosze,0);
 for(const max of [-1,NaN,Infinity,1.5,1_000_000_001])assert.equal(isComparableOffer(offer('bad',100,max)),false);
 assert.equal(isComparableOffer({...offer('bad',100,5),purchaseMultiple:2,minimumPackages:5}),false);
 assert.equal(optimizePackages(10,[variant('unknown',100)])?.packages[0].count,10);
});

test('bounded optimizer agrees with independent exhaustive enumeration of stock, lots, minimums, prices and overage',()=>{
 let seed=127;const random=(max:number)=>{seed=(seed*1664525+1013904223)>>>0;return seed%max;};
 for(let run=0;run<350;run++){
  const need=(1+random(28))/2;
  const variants=Array.from({length:3},(_,i)=>({...variant(String(i),random(30),random(10),[0.5,1,1.5,2][random(4)]),purchaseMultiple:1+random(3),minimumPackages:1+random(5)}));
  if(run%3===0)delete variants[2].maxPackages;
  let bestCost=Infinity,bestCoverage=Infinity;
  function visit(i:number,cost:number,coverage:number){if(i===variants.length){if(coverage>=need&&(cost<bestCost||cost===bestCost&&coverage<bestCoverage)){bestCost=cost;bestCoverage=coverage;}return;}
   const v=variants[i],step=v.purchaseMultiple,min=Math.ceil(v.minimumPackages/step)*step,max=v.maxPackages??Math.max(min,Math.ceil(need/v.packageSize/step)*step);
   visit(i+1,cost,coverage);for(let count=min;count<=max;count+=step)visit(i+1,cost+count*v.unitPriceGrosze,coverage+count*v.packageSize);
  }
  visit(0,0,0);const actual=optimizePackages(need,variants);
  if(!Number.isFinite(bestCost)){assert.equal(actual,null,JSON.stringify({need,variants}));continue;}
  assert.ok(actual);assert.equal(actual.totalGrosze,bestCost,JSON.stringify({need,variants,actual}));assert.equal(actual.coveredQuantity,bestCoverage);
  for(const pack of actual.packages){const v=variants.find(v=>v.offerId===pack.offerId)!;assert.ok(pack.count<=(v.maxPackages??Infinity));assert.equal(pack.count%v.purchaseMultiple,0);assert.ok(pack.count>=v.minimumPackages);}
 }
});

test('shared stock cannot be independently spent in two rooms; stage job IDs and labor survive reconciliation',async()=>{
 const data=await estimateProjectCostFromCalculation({} as Database,jobs([30,30]),{store:'A'},deps([offer('A',1114,54)]));
 assert.deepEqual(data.stages.map(s=>s.jobId),['room-0','room-1']);assert.equal(data.stages.length,2);
 assert.ok(data.stages.every(s=>s.lines[0].resolved===false&&s.lines[0].reason==='insufficient-stock'&&s.unresolved.length===1));
 assert.equal(data.projectTotalGrosze,0);assert.equal(data.consolidated.lines.length,0);
 const pickup=await compareAutomaticDelivery(data.stages,{mode:'pickup'},async()=>{throw Error('no quote');});
 assert.equal(pickup.status,'partial');assert.equal(pickup.best,null);
 const singleStage=await estimateStageCost({} as Database,[30,30].map(quantity=>({query:{ean:'known'},quantity})),{},deps([offer('A',1114,54)]));
 assert.ok(singleStage.lines.every(l=>!l.resolved&&l.reason==='insufficient-stock'));
});

test('real delivery enumeration never quotes more stock than published and can combine two finite sellers',async()=>{
 const data=await estimateProjectCostFromCalculation({} as Database,jobs([6]),{},deps([offer('A',100,3),offer('B',200,4)]));
 const calls:string[]=[];
 const comparison=await compareAutomaticDelivery(data.stages,{mode:'shipping',postalCode:'00-001'},async order=>{
  const count=order.lines.flatMap(l=>l.packages).reduce((sum,p)=>sum+p.count,0);assert.ok(count<=(order.store==='A'?3:4));calls.push(order.store+':'+count);
  return{quote:{costGrosze:100,carrier:'Kurier',payment:'Przelew',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.com/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'test'}};
 });
 assert.ok(calls.length>0);assert.equal(comparison.best?.totalGrosze,1100);assert.equal(comparison.best?.stores.length,2);
 const pickup=await compareAutomaticDelivery(data.stages,{mode:'pickup'},async()=>{throw Error('no quote');});assert.equal(pickup.best?.totalGrosze,900);
});

test('large selected basket keeps a valid finite-stock split even when no shop can supply the whole quantity',async()=>{
 const data=await estimateProjectCostFromCalculation({} as Database,jobs([50,50]),{},deps([offer('A',100,54),offer('B',200,54)]));
 const comparison=await compareAutomaticDelivery(data.stages,{mode:'shipping',postalCode:'00-001'},async order=>{
  assert.ok(order.lines.every(l=>l.packages.every(p=>p.count<=54)));
  return{quote:{costGrosze:100,carrier:'Kurier',payment:'Przelew',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.com/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'test'}};
 });
 assert.equal(comparison.searchLimited,true);assert.equal(comparison.best?.totalGrosze,14800);assert.equal(comparison.best?.stores.length,2);
 assert.equal(data.consolidated.consolidatedTotalGrosze,14600);
 assert.equal(data.storeComparison.cheapestFullStore,null);assert.ok(data.storeComparison.stores.every(s=>s.missingCount===1));
});
