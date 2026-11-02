import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import type {PurchaseOffer} from './types';
import {estimateStageCost,estimateProjectCost,groupProjectByProduct,type EstimateDeps} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import {ATLAS_WODER_E_FAMILY,ATLAS_WODER_E_FAMILY_NAME,ATLAS_WODER_E_PACKS,reviewedPackageFamily} from './reviewed-package-families';

const prices=[4890,9900,24900];
const products=ATLAS_WODER_E_PACKS.map(p=>({id:'woder-'+p.ean,ean:p.ean,gtin:null,name:'Atlas Woder E '+p.size+' kg',normalizedName:'woder'+p.size,category:'waterproofing',packageSize:String(p.size),packageUnit:'kg',imageUrl:'https://example.org/'+p.ean+'.jpg'} as Product));
const offers=products.map((p,i)=>({id:'offer-'+p.ean,productId:p.id,store:'Fixture shop',price:(prices[i]/100).toFixed(2),promoPrice:null,packageSize:p.packageSize,unit:'kg',source:'test',availability:'in_stock',fetchedAt:new Date(),productUrl:'https://example.org/'+p.ean} as PurchaseOffer));
const deps:EstimateDeps={findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)};
const query={packageFamily:ATLAS_WODER_E_FAMILY,normalizedName:ATLAS_WODER_E_FAMILY_NAME,category:'waterproofing'};
const stage=(quantity:number,ean?:string,patch:Partial<EstimateDeps>={})=>estimateStageCost({} as Database,[{query:ean?{ean}:query,quantity,unit:'kg'}],{},{...deps,...patch});

test('reviewed Woder E buckets match an independent integer-gram exhaustive price oracle',async()=>{
 for(const grams of [1,1999,2000,2001,4000,4001,5000,5001,6000,6001,7000,7001,10000,10001,12000,14999,15000,15001,17000,20000,30001]){
  let expected=Infinity;for(let a=0;a<=17;a++)for(let b=0;b<=7;b++)for(let c=0;c<=3;c++)if(a*2000+b*5000+c*15000>=grams)expected=Math.min(expected,a*4890+b*9900+c*24900);
  const line=(await stage(grams/1000)).lines[0];assert.ok(line.resolved);assert.equal(line.lineCost,expected,String(grams));assert.ok(line.packagePlan!.packages.every(p=>[2,5,15].includes(p.packageSize)));
 }
 const seven=(await stage(7)).lines[0];assert.ok(seven.resolved);assert.deepEqual(seven.packagePlan!.packages.map(p=>[p.packageSize,p.count]).sort((a,b)=>a[0]-b[0]),[[2,1],[5,1]]);
});

test('fixed 15 kg demand stays fixed when another room allows automatic Woder E sizes',async()=>{
 const fixed=await stage(16,'5905400514506'),automatic=await stage(2),groups=groupProjectByProduct([fixed,automatic]);assert.deepEqual(groups[0].requiredBySize,{'15':16});
 const plan=estimateProjectCost([fixed,automatic]).consolidated.lines[0].packagePlan!;assert.equal(plan.requiredQuantity,18);assert.equal(plan.packages.find(p=>p.packageSize===15)!.count,2);
});

test('actual comparison logic considers whole-basket freight instead of selecting the lowest material price',async()=>{
 const comparison=await compareAutomaticDelivery([await stage(12)],{mode:'shipping',postalCode:'30-001'},async order=>({quote:{costGrosze:order.lines.some(l=>l.packages.some(p=>p.packageSize===15))?0:4590,carrier:'Fixture home courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}}));
 // Deliberately controlled freight, independently of live merchant proof.
 assert.equal(comparison.best!.totalGrosze,24900);assert.deepEqual(comparison.best!.stores.flatMap(s=>s.lines.flatMap(l=>l.packages)).map(p=>[p.packageSize,p.count]),[[15,1]]);
});

test('Woder W, Duo, another GTIN revision, litres and a contradictory barcode cannot identify this family',async()=>{
 for(const[q,unit]of [[{...query,ean:'5905400514506'},'kg'],[{...query,gtin:'5905400514483'},'kg'],[{...query,normalizedName:'Atlas Woder W'},'kg'],[{...query,normalizedName:'Atlas Woder Duo'},'kg'],[{...query,category:'primer'},'kg'],[query,'l']] as const){assert.equal(reviewedPackageFamily(q,unit),undefined);assert.equal((await estimateStageCost({} as Database,[{query:q,quantity:7,unit}],{},deps)).lines[0].resolved,false);}
 for(const change of [{ean:'5905400260076'},{ean:'5905400627671'},{packageSize:'10'},{packageUnit:'l'},{category:'primer'}])assert.equal((await stage(7,undefined,{findProductByCode:async()=>({...products[0],...change})})).lines[0].resolved,false);
});

test('unavailable and limited buckets cannot become a complete free basket or oversell shared stock',async()=>{
 assert.equal((await stage(7,undefined,{listOffers:async()=>[]})).lines[0].resolved,false);
 const limited={listOffers:async(_db:Database,id:string)=>offers.filter(o=>o.productId===id).map(o=>({...o,maxPackages:1}))};const result=estimateProjectCost([await stage(20,undefined,limited),await stage(20,undefined,limited)]);assert.ok(result.stages.flatMap(s=>s.lines).some(line=>!line.resolved));
});
