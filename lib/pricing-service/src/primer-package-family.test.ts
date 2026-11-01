import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import type {PurchaseOffer} from './types';
import {estimateStageCost,estimateProjectCost,groupProjectByProduct,type EstimateDeps} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import {PRIMER_G_PRO_FAMILY,PRIMER_G_PRO_FAMILY_NAME,PRIMER_G_PRO_PACKS,V33_CABINET_FAMILY_NAME,reviewedPackageFamily} from './reviewed-package-families';

const prices=[3790,7990,13990,24900];
const products=PRIMER_G_PRO_PACKS.map(p=>({id:'p-'+p.ean,ean:p.ean,gtin:null,name:'Primer G Pro '+p.size+' l',normalizedName:'primer'+p.size,category:'primer',packageSize:String(p.size),packageUnit:'l',imageUrl:'https://example.org/'+p.ean+'.jpg'} as Product));
const offers=products.map((p,i)=>({id:'o-'+p.ean,productId:p.id,store:'Test store',price:(prices[i]/100).toFixed(2),promoPrice:null,packageSize:p.packageSize,unit:'l',source:'test',availability:'in_stock',fetchedAt:new Date(),productUrl:'https://example.org/'+p.ean} as PurchaseOffer));
const deps:EstimateDeps={findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)};
const query={packageFamily:PRIMER_G_PRO_FAMILY,normalizedName:PRIMER_G_PRO_FAMILY_NAME,category:'primer'};
const stage=(quantity:number,ean?:string,patch:Partial<EstimateDeps>={})=>estimateStageCost({} as Database,[{query:ean?{ean}:query,quantity,unit:'l'}],{}, {...deps,...patch});
const counts=(line:any)=>line.packagePlan.packages.map((p:any)=>[p.packageSize,p.count,p.product.ean]).sort((a:any,b:any)=>a[0]-b[0]);

test('Primer G Pro mixes four exact litre packs and keeps each can identity',async()=>{
  const s=await stage(21);assert.equal(s.lines[0].resolved,true);assert.deepEqual(counts(s.lines[0]),[[1,1,'8022452241123'],[20,1,'8022452241154']]);assert.equal(s.lines[0].lineCost,28690);
  assert.deepEqual(counts((await stage(6)).lines[0]),[[1,1,'8022452241123'],[5,1,'8022452241130']]);
});

test('two rooms merge raw primer litres before packs and preserve fixed-size requests',async()=>{
  const a=await stage(3),b=await stage(3),result=estimateProjectCost([a,b]);assert.equal(result.consolidated.lines.length,1);assert.equal(result.consolidated.consolidatedTotalGrosze,11780);
  const locked=await stage(6,'8022452241130'),automatic=await stage(1),group=groupProjectByProduct([locked,automatic]);assert.equal(group.length,1);assert.deepEqual(group[0].requiredBySize,{'5':6});
  const plan=estimateProjectCost([locked,automatic]).consolidated.lines[0].packagePlan;assert.ok(plan);assert.deepEqual(plan.packages.map(p=>[p.packageSize,p.count]),[[5,2]]);
});

test('unknown, older, kilogram or contradictory family requests do not resolve',async()=>{
  for(const [q,unit]of [[{...query,ean:'8022452241123'},'l'],[{...query,gtin:'8022452241130'},'l'],[{...query,normalizedName:'Primer G'},'l'],[{...query,category:'waterproofing'},'l'],[{...query,normalizedName:V33_CABINET_FAMILY_NAME},'l'],[query,'kg'],[query,'ml']] as const){
    assert.equal(reviewedPackageFamily(q,unit),undefined);assert.equal((await estimateStageCost({} as Database,[{query:q,quantity:5,unit}],{},deps)).lines[0].resolved,false);
  }
  for(const change of [{ean:'8022452002564'},{gtin:'8022452002564'},{packageSize:'20'},{packageUnit:'kg'},{category:'paint'}]){
    const wrong={...deps,findProductByCode:async()=>({...products[0],...change})};assert.equal((await estimateStageCost({} as Database,[{query,quantity:1,unit:'l'}],{},wrong)).lines[0].resolved,false);
  }
});

test('shipping can select a dearer pack plan and exposes real member names and pictures',async()=>{
  const result=await compareAutomaticDelivery([await stage(6)],{mode:'shipping',postalCode:'30-001'},async order=>({quote:{costGrosze:order.lines.some(l=>l.packages.some(p=>p.packageSize===1))?100000:1000,carrier:'Simulated test courier',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}}));
  assert.equal(result.best!.totalGrosze,14990);assert.equal(result.best!.stores[0].lines.length,1);assert.equal(result.best!.stores[0].lines[0].product.id,'p-8022452241147');assert.equal(result.best!.stores[0].lines[0].product.imageUrl,products[2].imageUrl);
});

test('missing members and real finite stock cannot be multiplied across rooms',async()=>{
  const limited={listOffers:async(_db:Database,id:string)=>offers.filter(o=>o.productId===id).map(o=>({...o,maxPackages:1}))};
  const result=estimateProjectCost([await stage(19,undefined,limited),await stage(19,undefined,limited)]);assert.ok(result.stages.flatMap(s=>s.lines).some(l=>!l.resolved));
  const onlyLarge=await stage(6,undefined,{findProductByCode:async(_db,q)=>q.ean==='8022452241154'?products[3]:null});assert.deepEqual(counts(onlyLarge.lines[0]),[[20,1,'8022452241154']]);
});

test('material-only four-size plans agree with an independent whole-can search',async()=>{
  for(const required of [0.1,1,1.1,3,5,5.1,6,10,10.1,11,19,20,20.1,21,26,31]){
    let expected=Infinity;for(let a=0;a<=32;a++)for(let b=0;b<=7;b++)for(let c=0;c<=4;c++)for(let d=0;d<=2;d++)if(a+5*b+10*c+20*d+1e-7>=required)expected=Math.min(expected,a*prices[0]+b*prices[1]+c*prices[2]+d*prices[3]);
    assert.equal((await stage(required)).lines[0].lineCost,expected,String(required));
  }
});
