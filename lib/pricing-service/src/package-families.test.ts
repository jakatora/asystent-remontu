import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Database, Product } from '@workspace/db/repositories';
import type { PurchaseOffer, PackageVariant } from './types';
import { estimateStageCost, estimateProjectCost, type EstimateDeps, groupProjectByProduct } from './estimate';
import { compareAutomaticDelivery } from './automatic-delivery';
import { V33_CABINET_FAMILY, V33_CABINET_FAMILY_NAME, V33_CABINET_PACKS } from './package-families';
import { mixedPackagePlans } from './mixed-package-plans';
import type { BasketQuoter } from './delivery';

const products=V33_CABINET_PACKS.map(p=>({id:'p-'+p.ean,ean:p.ean,gtin:null,name:V33_CABINET_FAMILY_NAME+' '+p.size,normalizedName:'v33-'+p.size,category:'cabinet-paint',packageSize:String(p.size),packageUnit:'ml',imageUrl:'https://example.org/'+p.ean+'.jpg'} as Product));
const offers=products.map((p,i)=>({id:'o-'+p.ean,productId:p.id,store:'Rab-Dom',price:i?'175.28':'85.41',promoPrice:null,packageSize:p.packageSize,unit:'ml',source:'observed-primary-public-api',availability:'in_stock',fetchedAt:new Date(),productUrl:'https://example.org/'+p.ean} as PurchaseOffer));
const deps:EstimateDeps={findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)};
const query={packageFamily:V33_CABINET_FAMILY,normalizedName:V33_CABINET_FAMILY_NAME,category:'cabinet-paint'};
const stage=(quantity:number,ean?:string,patch:Partial<EstimateDeps>={})=>estimateStageCost({} as Database,[{query:ean?{ean}:query,quantity,unit:'ml'}],{}, {...deps,...patch});
const quote:BasketQuoter=async order=>({quote:{costGrosze:order.lines.some(l=>l.packages.some(p=>p.packageSize===2000&&p.count>=2))?1799:1050,carrier:'Simulated courier for deterministic test',payment:'Prepaid',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:'a'.repeat(64)}});
const packs=(basket:NonNullable<Awaited<ReturnType<typeof compareAutomaticDelivery>>['best']>)=>basket.stores.flatMap(s=>s.lines.flatMap(l=>l.packages));

test('reviewed family prices mixed cans and preserves each exact barcode, name, photo and native offer',async()=>{
  const s=await stage(2750),line=s.lines[0];assert.ok(line.resolved);assert.equal(line.product.ean,null);assert.deepEqual(line.packagePlan.packages.map(p=>[p.packageSize,p.count,p.product?.ean]),[[2000,1,'3153895149228'],[750,1,'3153895149044']]);assert.equal(line.lineCost,26069);
  const result=await compareAutomaticDelivery([s],{mode:'shipping',postalCode:'00-001'},quote);assert.equal(result.best!.totalGrosze,27119);
  assert.equal(result.best!.stores[0].lines.length,2);assert.ok(result.best!.stores[0].lines.every(l=>products.some(p=>p.id===l.product.id&&p.imageUrl===l.product.imageUrl)));
});
test('delivered ranking may choose a dearer material combination to avoid the actual expensive cart shipping',async()=>{
  const s=await stage(1833.33333333),result=await compareAutomaticDelivery([s],{mode:'shipping',postalCode:'00-001'},async(order,p)=>{const r=await quote(order,p);assert.ok('quote'in r);r.quote.costGrosze=order.lines.some(l=>l.packages.some(p=>p.packageSize===2000))?99999:0;return r;});
  assert.equal(result.best!.totalGrosze,25623);assert.deepEqual(packs(result.best!).map(p=>[p.packageSize,p.count]),[[750,3]]);
});
test('automatic paint demand is added across rooms before cans, with no repeated shelf stock',async()=>{
  const first=await stage(916.66666667),second=await stage(916.66666667),result=estimateProjectCost([first,second]);assert.equal(result.consolidated.lines.length,1);assert.equal(result.consolidated.lines[0].packagesNeeded,1);assert.equal(result.consolidated.consolidatedTotalGrosze,17528);
  const delivered=await compareAutomaticDelivery(result.stages,{mode:'shipping',postalCode:'00-001'},quote);assert.equal(delivered.best!.totalGrosze,18578);
  const stock:Partial<EstimateDeps>={listOffers:async(_db,id)=>offers.filter(o=>o.productId===id).map(o=>({...o,maxPackages:1}))};
  const shortage=estimateProjectCost([await stage(1400,undefined,stock),await stage(1400,undefined,stock)]);assert.ok(shortage.stages.flatMap(s=>s.lines).some(l=>!l.resolved));assert.equal((await compareAutomaticDelivery(shortage.stages,{mode:'shipping',postalCode:'00-001'},quote)).best,null);
});
test('locked sizes stay locked when another room permits automatic cans, sharing unused paint without a duplicate purchase',async()=>{
  const pinned=await stage(350,'3153895149044'),automatic=await stage(350),group=groupProjectByProduct([pinned,automatic]);assert.equal(group.length,1);assert.deepEqual(group[0].requiredBySize,{'750':350});
  const result=await compareAutomaticDelivery([pinned,automatic],{mode:'shipping',postalCode:'00-001'},quote);assert.deepEqual(packs(result.best!).map(p=>[p.packageSize,p.count]),[[750,1]]);assert.equal(result.best!.materialsGrosze,8541);
  const forceSmall=await compareAutomaticDelivery([await stage(800,'3153895149044'),await stage(200)],{mode:'shipping',postalCode:'00-001'},quote);assert.deepEqual(packs(forceSmall.best!).map(p=>[p.packageSize,p.count]),[[750,2]]);
  const both=await compareAutomaticDelivery([await stage(350,'3153895149044'),await stage(350,'3153895149228'),await stage(350)],{mode:'shipping',postalCode:'00-001'},quote);assert.deepEqual(packs(both.best!).map(p=>[p.packageSize,p.count]).sort((a,b)=>a[0]-b[0]),[[750,1],[2000,1]]);
});
test('reviewed family rejects a caller barcode, incompatible unit/name and a falsely returned different product size or code',async()=>{
  for(const item of [{query:{...query,ean:products[0].ean},unit:'ml'},{query,unit:'l'},{query:{...query,normalizedName:V33_CABINET_FAMILY_NAME+' black'},unit:'ml'}]){
    const result=await estimateStageCost({} as Database,[{...item,quantity:1000}],{},deps);assert.equal(result.lines[0].resolved,false);
  }
  for(const change of [{ean:'3153895149000'},{packageSize:'1000'},{packageUnit:'l'},{category:'paint'}]){const wrong={...deps,findProductByCode:async()=>({...products[0],...change})};assert.equal((await estimateStageCost({} as Database,[{query,quantity:1000,unit:'ml'}],{},wrong)).lines[0].resolved,false);}
});
test('selected store, missing postcode and unconfirmed pickup cannot quietly reuse other-shop or freight-free totals',async()=>{
  const selected=await estimateStageCost({} as Database,[{query,quantity:1000,unit:'ml'}],{store:'Other'},deps);assert.equal(selected.lines[0].resolved,false);
  assert.equal((await compareAutomaticDelivery([await stage(1000)],{mode:'shipping'},quote)).best,null);
  assert.equal((await compareAutomaticDelivery([selected],{mode:'shipping',postalCode:'00-001'},quote)).best,null);
});

test('minimal mixed plans agree with independent exhaustive purchase counts over a range of demands and locked sizes',()=>{
  const variants:PackageVariant[]=[{packageSize:750,unitPriceGrosze:8541,offerId:'small',store:'A',url:null},{packageSize:2000,unitPriceGrosze:17528,offerId:'large',store:'A',url:null}];
  for(const required of [1,500,750,751,1100,1833.33333333,2000,2001,2500,2750,4200,10000])for(const locked of [{},{'750':800},{'2000':2000},{'750':350,'2000':350}] as Record<string,number>[]){
    const total=Math.max(required,Object.values(locked).reduce((a,b)=>a+b,0)),found=mixedPackagePlans(total,variants,locked);let expected=Infinity;
    for(let small=0;small<=16;small++)for(let large=0;large<=7;large++)if(small*750+large*2000+1e-7>=total&&small*750>=(locked['750']??0)&&large*2000>=(locked['2000']??0))expected=Math.min(expected,small*8541+large*17528);
    assert.equal(found.limited,false);assert.equal(found.plans[0]?.totalGrosze,expected,JSON.stringify({total,locked}));
  }
});
test('mixed pack purchase multiples, minimum lots and finite stock apply to whole physical cans',()=>{
  const variants:PackageVariant[]=[{packageSize:750,unitPriceGrosze:500,offerId:'small',store:'A',url:null,purchaseMultiple:2,minimumPackages:4,maxPackages:4},{packageSize:2000,unitPriceGrosze:1800,offerId:'large',store:'A',url:null,maxPackages:1}];
  const all=mixedPackagePlans(4000,variants);assert.ok(all.plans.length);for(const plan of all.plans){assert.equal(plan.coveredQuantity,5000);assert.equal(plan.packages.find(p=>p.offerId==='small')?.count,4);}
  assert.equal(mixedPackagePlans(5001,variants).plans.length,0);assert.equal(mixedPackagePlans(4000,variants,{},1,2).limited,true);
});
