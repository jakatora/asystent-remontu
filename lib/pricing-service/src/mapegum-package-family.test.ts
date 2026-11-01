import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import type {PurchaseOffer} from './types';
import {estimateStageCost,estimateProjectCost,groupProjectByProduct,type EstimateDeps} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import {MAPEGUM_WPS_FAMILY,MAPEGUM_WPS_FAMILY_NAME,MAPEGUM_WPS_PACKS,PRIMER_G_PRO_FAMILY_NAME,reviewedPackageFamily} from './reviewed-package-families';
const prices=[7990,11290,19990,36770],products=MAPEGUM_WPS_PACKS.map(p=>({id:'map-'+p.ean,ean:p.ean,gtin:null,name:'Mapegum WPS '+p.size+' kg',normalizedName:'mapegum'+p.size,category:'waterproofing',packageSize:String(p.size),packageUnit:'kg',imageUrl:'https://example.org/'+p.ean+'.jpg'} as Product));
const offers=products.map((p,i)=>({id:'o-'+p.ean,productId:p.id,store:'Test store',price:(prices[i]/100).toFixed(2),promoPrice:null,packageSize:p.packageSize,unit:'kg',source:'test',availability:'in_stock',fetchedAt:new Date(),productUrl:'https://example.org/'+p.ean} as PurchaseOffer));
const deps:EstimateDeps={findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)},query={packageFamily:MAPEGUM_WPS_FAMILY,normalizedName:MAPEGUM_WPS_FAMILY_NAME,category:'waterproofing'};
const stage=(quantity:number,ean?:string,patch:Partial<EstimateDeps>={})=>estimateStageCost({} as Database,[{query:ean?{ean}:query,quantity,unit:'kg'}],{}, {...deps,...patch});
const counts=(line:any)=>{assert.ok(line.packagePlan,JSON.stringify(line));return line.packagePlan.packages.map((p:any)=>[p.packageSize,p.count,p.product.ean]).sort((a:any,b:any)=>a[0]-b[0]);};
test('Mapegum mixes reviewed kilograms and retains every bucket identity',async()=>{
  assert.deepEqual(counts((await stage(6)).lines[0]),[[3,2,'8022452249266']]);
  const eleven=await stage(11);assert.equal(eleven.lines[0].lineCost,27270);assert.deepEqual(counts(eleven.lines[0]),[[3,2,'8022452249266'],[5,1,'8022452242489']]);
});
test('raw kilograms merge across rooms while fixed-size requirements remain real buckets',async()=>{
  assert.equal(estimateProjectCost([await stage(3),await stage(3)]).consolidated.consolidatedTotalGrosze,15980);
  const fixed=await stage(6,'8022452242489'),auto=await stage(1),groups=groupProjectByProduct([fixed,auto]);assert.deepEqual(groups[0].requiredBySize,{'5':6});
  const plan=estimateProjectCost([fixed,auto]).consolidated.lines[0].packagePlan;assert.ok(plan);assert.deepEqual(plan.packages.map(p=>[p.packageSize,p.count]),[[5,2]]);
});
test('a Mapegum family cannot resolve older codes, another product, litres, or a contradictory identity',async()=>{
  for(const[q,unit]of [[{...query,ean:'8022452242489'},'kg'],[{...query,gtin:'8022452242496'},'kg'],[{...query,normalizedName:'Mapelastic'},'kg'],[{...query,category:'primer'},'kg'],[{...query,normalizedName:PRIMER_G_PRO_FAMILY_NAME},'kg'],[query,'l']] as const){assert.equal(reviewedPackageFamily(q,unit),undefined);assert.equal((await estimateStageCost({} as Database,[{query:q,quantity:6,unit}],{},deps)).lines[0].resolved,false);}
  for(const change of [{ean:'8022452002113'},{gtin:'8022452002120'},{packageSize:'5'},{packageUnit:'l'},{category:'primer'}])assert.equal((await stage(3,undefined,{findProductByCode:async()=>({...products[0],...change})})).lines[0].resolved,false);
});
test('a delivered plan can choose a dearer material combination when its native shipping is lower',async()=>{
  const comparison=await compareAutomaticDelivery([await stage(6)],{mode:'shipping',postalCode:'30-001'},async order=>({quote:{costGrosze:order.lines.some(l=>l.packages.some(p=>p.packageSize===3))?100000:1000,carrier:'Fixture courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}}));
  assert.equal(comparison.best!.totalGrosze,20990);assert.equal(comparison.best!.stores[0].lines[0].product.id,products[2].id);assert.equal(comparison.best!.stores[0].lines[0].product.imageUrl,products[2].imageUrl);
});
test('finite stock is shared across rooms and missing members stay missing',async()=>{
  const limited={listOffers:async(_db:Database,id:string)=>offers.filter(o=>o.productId===id).map(o=>({...o,maxPackages:1}))},result=estimateProjectCost([await stage(25,undefined,limited),await stage(25,undefined,limited)]);assert.ok(result.stages.flatMap(s=>s.lines).some(l=>!l.resolved));
  assert.deepEqual(counts((await stage(6,undefined,{findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean&&Number(p.packageSize)===20)??null})).lines[0]),[[20,1,'8022452242502']]);
});
test('minimum material costs match an independent exhaustive oracle over small bucket counts',async()=>{
  for(const required of [0.1,3,3.1,5,5.1,6,9,10.1,11,13,20.1,21,27,43]){let expected=Infinity;
    for(let a=0;a<=15;a++)for(let b=0;b<=10;b++)for(let c=0;c<=5;c++)for(let d=0;d<=3;d++)if(a*3+b*5+c*10+d*20+1e-7>=required)expected=Math.min(expected,a*prices[0]+b*prices[1]+c*prices[2]+d*prices[3]);
    assert.equal((await stage(required)).lines[0].lineCost,expected,String(required));
  }
});
test('tiny positive kilograms and fixed sizes cannot yield a free empty plan',async()=>{
  for(const quantity of [1e-10,1e-8,1e-7])assert.deepEqual(counts((await stage(quantity)).lines[0]),[[3,1,'8022452249266']]);
  const plan=estimateProjectCost([await stage(1e-8,'8022452242496'),await stage(3)]).consolidated.lines[0].packagePlan;assert.ok(plan);assert.equal(plan.totalGrosze,19990);assert.deepEqual(plan.packages.map(p=>[p.packageSize,p.count]),[[10,1]]);
});
