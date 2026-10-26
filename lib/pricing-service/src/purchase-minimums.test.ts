import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import type {PackageVariant,PurchaseOffer} from './types';
import {optimizePackages} from './package-optimizer';
import {buildPackageVariants,computePackagesNeeded,estimateProjectCost,estimateStageCost,isComparableOffer,selectCheapestOffer,type EstimateDeps} from './estimate';
import {compareDeliveredBaskets} from './delivery';
import {compareAutomaticDelivery} from './automatic-delivery';

const product={id:'eps',name:'Styropian 3 m2',ean:'5902578301976',packageSize:'3',packageUnit:'m2'} as Product;
const offer=(id:string,price:string,minimumPackages?:number):PurchaseOffer=>({id,productId:product.id,store:id,price,promoPrice:null,regularPrice:null,unit:'m2',packageSize:'3',productUrl:'https://example.com/'+id,source:'retailer-product-api',availability:'in_stock',fetchedAt:new Date(),pricePerUnit:null,...(minimumPackages!==undefined?{minimumPackages}:{})});
const stage=(quantities:number[],offers:PurchaseOffer[])=>{
 const deps:EstimateDeps={findProductByCode:async()=>product,findProductByNameAndCategory:async()=>null,listOffers:async()=>offers};
 return Promise.all(quantities.map(quantity=>estimateStageCost({}as Database,[{query:{ean:product.ean},quantity,unit:'m2'}],{},deps)));
};

test('minimum 50 allows 51 packs, while a lot of 50 requires 100',()=>{
 const variants=buildPackageVariants([offer('minimum','69.74',50)],product);
 for(const [quantity,count]of [[0,0],[3,50],[150,50],[150.01,51],[153,51],[300,100]]){
  assert.equal(computePackagesNeeded(quantity,3,1,50),count);
  const plan=optimizePackages(quantity,variants)!;
  assert.equal(plan.totalGrosze,count*6974);
  assert.equal(plan.coveredQuantity,count*3);
  if(count){assert.equal(plan.packages[0].count,count);assert.equal(plan.packages[0].minimumPackages,50);assert.equal(plan.packages[0].purchaseMultiple,undefined);}
 }
 assert.equal(computePackagesNeeded(153,3,50),100);
 assert.equal(computePackagesNeeded(1,3,42,50),84);
 assert.equal(optimizePackages(1,[{...variants[0],purchaseMultiple:42}])!.packages[0].count,84);
 const fallback=optimizePackages(300.1234,[...variants,{...variants[0],offerId:'other',unitPriceGrosze:9999}])!;
 assert.equal(fallback.packages[0].count,101);assert.equal(fallback.totalGrosze,704374);
});

test('a lower unit price cannot hide the actual minimum purchase cost',()=>{
 const offers=[offer('minimum','69.74',50),offer('retail','80.00')];
 const variants=buildPackageVariants(offers,product);
 assert.equal(variants.length,2);
 assert.equal(selectCheapestOffer(offers,null,{quantity:3,product})?.store,'retail');
 const plan=optimizePackages(3,variants)!;
 assert.equal(plan.totalGrosze,8000);assert.equal(plan.packages[0].count,1);assert.equal(plan.packages[0].store,'retail');
 const large=optimizePackages(153,variants)!;
 assert.equal(large.totalGrosze,355674);assert.equal(large.packages[0].count,51);
});

test('minimum-aware mixed-size plans match an independent exhaustive count oracle',()=>{
 const variants:PackageVariant[]=[
  {packageSize:2,unitPriceGrosze:170,offerId:'a',store:'A',url:null,minimumPackages:5,purchaseMultiple:3},
  {packageSize:3,unitPriceGrosze:300,offerId:'b',store:'B',url:null,minimumPackages:2},
  {packageSize:0.5,unitPriceGrosze:110,offerId:'c',store:'C',url:null},
 ];
 for(let quantity=0.5;quantity<=30;quantity+=0.5){
  let cost=Infinity,coverage=Infinity;
  for(let a=0;a<=21;a+=3)for(let b=0;b<=15;b++)for(let c=0;c<=60;c++){
   if((a>0&&a<5)||(b>0&&b<2))continue;
   const covered=a*2+b*3+c*0.5,total=a*170+b*300+c*110;
   if(covered>=quantity&&(total<cost||(total===cost&&covered<coverage))){cost=total;coverage=covered;}
  }
  const plan=optimizePackages(quantity,variants)!;
  assert.equal(plan.totalGrosze,cost,'cost at '+quantity);
  assert.equal(plan.coveredQuantity,coverage,'coverage at '+quantity);
  for(const pack of plan.packages){assert.ok(pack.count>=(pack.minimumPackages??1));assert.equal(pack.count%(pack.purchaseMultiple??1),0);}
 }
 // A minimum can coexist with a regular offer in the optimal mixed basket.
 const mixed=optimizePackages(13,[variants[0],variants[2]])!;
 assert.equal(mixed.totalGrosze,1240);assert.equal(mixed.packages.length,2);
});

test('minimum inputs are validated and tiny positive demand never becomes a free empty plan',()=>{
 const good=offer('minimum','1.00',50),variants=buildPackageVariants([good],product);
 for(const invalid of [0,-1,1.5,NaN,Infinity,10001]){
  assert.equal(isComparableOffer({...good,minimumPackages:invalid}),false);
  assert.equal(optimizePackages(1,[{...variants[0],minimumPackages:invalid}]),null);
  assert.throws(()=>computePackagesNeeded(1,3,1,invalid),/invalid_minimum_packages/);
 }
 const tiny=optimizePackages(1e-12,[variants[0],{...variants[0],offerId:'normal',minimumPackages:1,unitPriceGrosze:101}])!;
 assert.equal(tiny.totalGrosze,101);assert.equal(tiny.packages[0].count,1);
});

test('the whole renovation applies the minimum once after combining rooms',async()=>{
 const stages=await stage([75,78],[offer('minimum','69.74',50)]);
 const project=estimateProjectCost(stages);
 assert.equal(project.projectTotalGrosze,697400);
 assert.equal(project.consolidated.consolidatedTotalGrosze,355674);
 assert.equal(project.consolidated.lines[0].packagePlan?.packages[0].count,51);
 assert.equal(project.consolidated.lines[0].packagePlan?.packages[0].minimumPackages,50);
 const delivery=compareDeliveredBaskets(stages,{mode:'shipping',costsGrosze:{minimum:0}});
 assert.equal(delivery.best?.totalGrosze,355674);
 assert.equal(delivery.best?.stores[0].lines[0].packages[0].count,51);
});

test('automatic delivery never quotes fewer than the minimum in exhaustive or bounded search',async()=>{
 for(const [quantity,count]of [[3,50],[153,51],[183,61]]){
  const stages=await stage([quantity],[offer('minimum','69.74',50)]);
  let calls=0;
  const result=await compareAutomaticDelivery(stages,{mode:'shipping',postalCode:'00-001'},async order=>{
   calls++;const pack=order.lines[0].packages[0];assert.ok(pack.count>=50);assert.equal(pack.minimumPackages,50);
   return {quote:{costGrosze:0,carrier:'Transport',payment:'Przelew',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60000).toISOString(),sourceUrl:'https://example.com/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}};
  });
  assert.ok(calls>0);assert.equal(result.best?.totalGrosze,count*6974);
  assert.equal(result.best?.stores[0].lines[0].packages[0].count,count);
 }
});

test('automatic mixed-store splits respect each minimum and retain exact pack totals',async()=>{
 for(const required of [7,61]){
  const stages=await stage([required*3],[offer('A','1.00',5),offer('B','1.00',2)]);
  const result=await compareAutomaticDelivery(stages,{mode:'shipping',postalCode:'00-001'},async order=>{
   const pack=order.lines[0].packages[0];assert.ok(pack.count>=(order.store==='A'?5:2));
   return {quote:{costGrosze:pack.count===(order.store==='A'?5:required-5)?0:10000,carrier:'Transport',payment:'Przelew',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60000).toISOString(),sourceUrl:'https://example.com/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}};
  });
  const packs=result.best!.stores.flatMap(store=>store.lines.flatMap(line=>line.packages));
  assert.equal(result.best?.totalGrosze,required*100);
  assert.equal(packs.reduce((n,pack)=>n+pack.count,0),required);
  assert.deepEqual(packs.map(pack=>[pack.store,pack.count]).sort(),[['A',5],['B',required-5]]);
 }
});
