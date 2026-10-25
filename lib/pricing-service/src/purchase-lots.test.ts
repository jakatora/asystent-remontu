import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import type {PackageVariant,PurchaseOffer} from './types';
import {optimizePackages} from './package-optimizer';
import {buildPackageVariants,computePackagesNeeded,estimateProjectCost,estimateStageCost,isComparableOffer,selectCheapestOffer,type EstimateDeps} from './estimate';
import {compareDeliveredBaskets} from './delivery';
import {compareAutomaticDelivery} from './automatic-delivery';

const product={id:'skirting',name:'Listwa 2,5 m',ean:'5905167725719',packageSize:'2.5'} as Product;
const offer=(id:string,price:string,multiple?:number):PurchaseOffer=>({id,productId:product.id,store:id,price,promoPrice:null,regularPrice:null,unit:'mb',packageSize:'2.5',productUrl:'https://example.com/'+id,source:'retailer-product-api',availability:'in_stock',fetchedAt:new Date(),pricePerUnit:null,...(multiple!==undefined?{purchaseMultiple:multiple}:{})});
const variants=(offers:PurchaseOffer[])=>buildPackageVariants(offers,product);

test('a lower unit price with a ten-piece lot cannot beat a cheaper actual small purchase',()=>{
 const offers=[offer('ten','10.00',10),offer('one','12.00')];
 assert.equal(variants(offers).length,2);
 assert.equal(selectCheapestOffer(offers,null,{quantity:5,product})?.store,'one');
 const plan=optimizePackages(5,variants(offers))!;
 assert.equal(plan.totalGrosze,2400);assert.equal(plan.packages[0].count,2);assert.equal(plan.packages[0].store,'one');
 const mixed=optimizePackages(27.5,variants(offers))!;
 assert.equal(mixed.totalGrosze,11200);assert.deepEqual(mixed.packages.map(p=>[p.store,p.count]).sort(),[['one',1],['ten',10]]);
});

test('purchase lots retain the physical EAN package, exact counts, overage and fallback',()=>{
 const list=variants([offer('ten','31.98',10)]);
 for(const [required,count] of [[0,0],[2.5,10],[25,10],[25.01,20],[50,20]]){
  const plan=optimizePackages(required,list)!;
  assert.equal(computePackagesNeeded(required,2.5,10),count);
  assert.equal(plan.totalGrosze,count*3198);assert.equal(plan.coveredQuantity,count*2.5);
  if(count){assert.equal(plan.packages[0].count,count);assert.equal(plan.packages[0].packageSize,2.5);assert.equal(plan.packages[0].purchaseMultiple,10);}
 }
 const fallback=optimizePackages(250.1234,list)!;assert.equal(fallback.packages[0].count,110);assert.equal(fallback.totalGrosze,351780);
 for(const invalid of [0,-1,1.5,NaN,Infinity,10001]){
  assert.equal(isComparableOffer(offer('bad','1.00',invalid)),false);
  assert.equal(optimizePackages(1,[{...list[0],purchaseMultiple:invalid}]),null);
 }
});

test('lot-aware dynamic programming matches an independent exhaustive count oracle',()=>{
 const list:PackageVariant[]=[{packageSize:2.5,unitPriceGrosze:700,offerId:'a',store:'A',url:null,purchaseMultiple:4},{packageSize:2.5,unitPriceGrosze:850,offerId:'b',store:'B',url:null,purchaseMultiple:2},{packageSize:2.5,unitPriceGrosze:1100,offerId:'c',store:'C',url:null}];
 for(let required=0.5;required<=30;required+=0.5){
  let expected=Infinity;
  for(let a=0;a<=16;a+=4)for(let b=0;b<=16;b+=2)for(let c=0;c<=12;c++)if((a+b+c)*2.5>=required)expected=Math.min(expected,a*700+b*850+c*1100);
  const plan=optimizePackages(required,list)!;assert.equal(plan.totalGrosze,expected,'quantity '+required);
  for(const pack of plan.packages)assert.equal(pack.count%(pack.purchaseMultiple??1),0);
 }
});

test('whole-project consolidation and delivery fast paths round lots after summing rooms',async()=>{
 const offers=[offer('ten','31.98',10)];
 const deps:EstimateDeps={findProductByCode:async()=>product,findProductByNameAndCategory:async()=>null,listOffers:async()=>offers};
 const stage=(quantity:number)=>estimateStageCost({}as Database,[{query:{ean:product.ean},quantity,unit:'mb'}],{},deps);
 const stages=[await stage(10),await stage(15)];
 assert.equal(stages[0].lines[0].resolved&&stages[0].lines[0].packagesNeeded,10);
 const project=estimateProjectCost(stages);assert.equal(project.projectTotalGrosze,63960);assert.equal(project.consolidated.consolidatedTotalGrosze,31980);assert.equal(project.storeComparison.cheapestFullStore?.totalGrosze,31980);
 const result=compareDeliveredBaskets(stages,{mode:'shipping',costsGrosze:{ten:2999}});
 assert.equal(result.best?.totalGrosze,34979);assert.equal(result.best?.stores[0].lines[0].packages[0].count,10);
 assert.equal(result.best?.stores[0].lines[0].packages[0].packageSize,2.5);
});

test('automatic delivery only asks for valid lots in both exhaustive and bounded searches',async()=>{
 const offers=[offer('ten','31.98',10)];
 const deps:EstimateDeps={findProductByCode:async()=>product,findProductByNameAndCategory:async()=>null,listOffers:async()=>offers};
 for(const [quantity,expectedCount] of [[2.5,10],[155,70]]){
  const stage=await estimateStageCost({}as Database,[{query:{ean:product.ean},quantity,unit:'mb'}],{},deps);
  const result=await compareAutomaticDelivery([stage],{mode:'shipping',postalCode:'00-001'},async order=>{
   assert.ok(order.lines.flatMap(line=>line.packages).every(pack=>pack.count%10===0));
   return {quote:{costGrosze:2999,carrier:'Kurier',payment:'Przelew',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60000).toISOString(),sourceUrl:'https://example.com/delivery',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}};
  });
  assert.equal(result.best?.stores[0].lines[0].packages[0].count,expectedCount);assert.equal(result.best?.totalGrosze,expectedCount*3198+2999);
 }
});

test('forced lot overage does not add removable packs solely to unlock another store shipping discount',async()=>{
 const extra={...product,id:'extra',ean:'extra'};
 const offers=[offer('A','1.00'),offer('B','0.50',10),{...offer('extra-A','1.00'),productId:'extra',store:'A'}];
 const deps:EstimateDeps={findProductByCode:async(_db,code)=>code.ean==='extra'?extra:product,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(offer=>offer.productId===id)};
 const stage=await estimateStageCost({}as Database,[{query:{ean:product.ean},quantity:25,unit:'mb'},{query:{ean:'extra'},quantity:2.5,unit:'mb'}],{},deps);
 const result=await compareAutomaticDelivery([stage],{mode:'shipping',postalCode:'00-001'},async order=>({quote:{costGrosze:order.store==='A'&&order.materialsGrosze<200?1000:0,carrier:'Kurier',payment:'Przelew',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60000).toISOString(),sourceUrl:'https://example.com/delivery',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}}));
 // 10 A + mandatory A: 11 zł. Adding an unnecessary A alongside 10 B would
 // produce a misleading 7 zł result by purchasing 11 pieces for a need of 10.
 assert.equal(result.best?.totalGrosze,1100);
 assert.equal(result.best?.stores.flatMap(store=>store.lines).filter(line=>line.product.id===product.id).flatMap(line=>line.packages).reduce((count,pack)=>count+pack.count,0),10);
});
