import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import type {PurchaseOffer} from './types';
import {estimateStageCost,estimateProjectCost,groupProjectByProduct,type EstimateDeps} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import {KNAUF_SUPER_FINISH_FAMILY,KNAUF_SUPER_FINISH_FAMILY_NAME,KNAUF_SUPER_FINISH_PACKS,reviewedPackageFamily} from './reviewed-package-families';

// Deliberately no 20 kg retail offer: a factory variant alone is not stock.
const products=KNAUF_SUPER_FINISH_PACKS.filter(p=>p.size!==20).map(p=>({id:'finish-'+p.ean,ean:p.ean,gtin:null,name:'Knauf Super Finish '+p.size+' kg',normalizedName:'finish'+p.size,category:'skim-coat',packageSize:String(p.size),packageUnit:'kg',imageUrl:'https://example.org/'+p.ean+'.jpg'} as Product));
const prices=[4470,9900];
const offers=products.map((p,i)=>({id:'offer-'+p.ean,productId:p.id,store:'Fixture ABUD',price:(prices[i]/100).toFixed(2),promoPrice:null,packageSize:p.packageSize,unit:'kg',source:'test',availability:'in_stock',fetchedAt:new Date(),productUrl:'https://example.org/'+p.ean} as PurchaseOffer));
const deps:EstimateDeps={findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)};
const query={packageFamily:KNAUF_SUPER_FINISH_FAMILY,normalizedName:KNAUF_SUPER_FINISH_FAMILY_NAME,category:'skim-coat'};
const stage=(quantity:number,ean?:string,patch:Partial<EstimateDeps>={})=>estimateStageCost({} as Database,[{query:ean?{ean}:query,quantity,unit:'kg'}],{},{...deps,...patch});
const packs=(line:any):[number,number,string][]=>{assert.ok(line.packagePlan,JSON.stringify(line));return line.packagePlan.packages.map((p:any)=>[p.packageSize,p.count,p.product.ean]).sort((a:any,b:any)=>a[0]-b[0]);};

test('Super Finish uses full 5.4 and 28 kg buckets with separate GTINs, without inventing a 20 kg offer',async()=>{
 assert.deepEqual(packs((await stage(29)).lines[0]),[[5.4,1,'5901793357959'],[28,1,'5901793357935']]);
 assert.equal((await stage(29)).lines[0].lineCost,14370);
 assert.deepEqual(packs((await stage(5.5)).lines[0]),[[5.4,2,'5901793357959']]);
 for(const quantity of [20,20.1,29,33.4])assert.ok(packs((await stage(quantity)).lines[0]).every(p=>p[0]!==20));
});

test('fractional sizes match an independent integer-gram exhaustive cost oracle at boundaries',async()=>{
 for(const grams of [1,5399,5400,5401,10800,10801,20000,28000,28001,29000,33399,33400,33401,56001,100001]){
  let expected=Infinity;
  for(let small=0;small<=21;small++)for(let large=0;large<=4;large++)if(small*5400+large*28000>=grams)expected=Math.min(expected,small*4470+large*9900);
  const line=(await stage(grams/1000)).lines[0];assert.equal(line.lineCost,expected,String(grams));
 }
 for(const quantity of [1e-10,1e-8,1e-7])assert.deepEqual(packs((await stage(quantity)).lines[0]),[[5.4,1,'5901793357959']]);
});

test('fixed bucket requests keep their size when another room explicitly permits automatic sizes',async()=>{
 const fixed=await stage(5.5,'5901793357959'),automatic=await stage(28),groups=groupProjectByProduct([fixed,automatic]);
 assert.deepEqual(groups[0].requiredBySize,{'5.4':5.5});
 const plan=estimateProjectCost([fixed,automatic]).consolidated.lines[0].packagePlan!;
 assert.deepEqual(plan.packages.map(p=>[p.packageSize,p.count]).sort((a,b)=>a[0]-b[0]),[[5.4,2],[28,1]]);
 assert.equal(plan.requiredQuantity,33.5);
});

test('the delivered comparison can reject the material-cheapest combination when its freight is more expensive',async()=>{
 const comparison=await compareAutomaticDelivery([await stage(28)],{mode:'shipping',postalCode:'30-001'},async order=>({quote:{costGrosze:order.lines.some(l=>l.packages.some(p=>p.packageSize===28))?9000:1999,carrier:'Fixture courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}}));
 // One large bucket is still cheaper delivered than six small ones. This is
 // a controlled algorithm fixture; actual freight is verified separately.
 assert.equal(comparison.best!.totalGrosze,18900);assert.equal(comparison.best!.stores[0].lines[0].product.id,products[1].id);
 const small=await compareAutomaticDelivery([await stage(5.5)],{mode:'shipping',postalCode:'30-001'},async order=>({quote:{costGrosze:order.lines.some(l=>l.packages.some(p=>p.packageSize===28))?0:9999,carrier:'Fixture courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'b'.repeat(64)}}));
 assert.equal(small.best!.totalGrosze,9900);assert.equal(small.best!.stores[0].lines[0].product.id,products[1].id);assert.equal(small.best!.stores[0].lines[0].product.imageUrl,products[1].imageUrl);
});

test('another formulation, litre unit, category or contradictory barcode cannot refresh or resolve the family',async()=>{
 for(const[q,unit]of [[{...query,ean:'5901793357935'},'kg'],[{...query,gtin:'5901793357959'},'kg'],[{...query,normalizedName:'Knauf Fill & Finish Light'},'kg'],[{...query,category:'primer'},'kg'],[query,'l']] as const){
  assert.equal(reviewedPackageFamily(q,unit),undefined);assert.equal((await estimateStageCost({} as Database,[{query:q,quantity:29,unit}],{},deps)).lines[0].resolved,false);
 }
 for(const change of [{ean:'5901793358123'},{gtin:'5901793357942'},{packageSize:'20'},{packageUnit:'l'},{category:'primer'}])assert.equal((await stage(29,undefined,{findProductByCode:async()=>({...products[0],...change})})).lines[0].resolved,false);
});

test('limited stock remains shared across stages and an unavailable family cannot produce a free basket',async()=>{
 const limited={listOffers:async(_db:Database,id:string)=>offers.filter(o=>o.productId===id).map(o=>({...o,maxPackages:1}))};
 const result=estimateProjectCost([await stage(29,undefined,limited),await stage(29,undefined,limited)]);
 assert.ok(result.stages.flatMap(s=>s.lines).some(line=>!line.resolved));
 assert.equal((await stage(29,undefined,{listOffers:async()=>[]})).lines[0].resolved,false);
});
