import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Product} from '@workspace/db/schema';
import type {Database} from '@workspace/db/repositories';
import type {PurchaseOffer} from './types';
import {cutRollArea,cutRollCost,cutRollPackagePlan,cutRollPurchaseLengths,ORION_ROLLS,type CutRollDemand} from './cut-rolls';
import {estimateStageCost,estimateProjectCost} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';

const p={...ORION_ROLLS[0],ean:null,gtin:null,brand:'Lentex',category:'vinyl-roll',packageUnit:'m2',packageSize:'1',imageUrl:null}as unknown as Product;
const offer={id:'ewinyl-orion514-2m',productId:p.id,store:'eWinyl',price:'55.00',promoPrice:null,packageSize:'1',unit:'m2',productUrl:'https://ewinyl.pl/produkt/orion-514-05-wykladzina-winylowy-3m-4m/',availability:'in_stock',source:'observed-store-page',fetchedAt:new Date()}as PurchaseOffer;
const demand=(...lengths:number[]):CutRollDemand=>({version:1,widthMm:2000,cuts:lengths.map((lengthMm,i)=>({id:String(i),lengthMm}))});
const deps={findProductByCode:async()=>p,findProductByNameAndCategory:async()=>p,listOffers:async()=>[offer]};
const stage=(cut:CutRollDemand)=>estimateStageCost({}as Database,[{query:{normalizedName:p.name,category:'vinyl-roll'},unit:'m2',quantity:cutRollArea(cut)!,cutRoll:cut}],{},deps);

test('the whole full-width cut is priced once in grosze, including non-integer m² and a cent-sensitive m² price',()=>{
  assert.equal(cutRollCost(2000,3100,5500),34100);
  assert.equal(cutRollCost(2000,3100,5599),34714);
  const plan=cutRollPackagePlan(p,demand(3100),6.2,[offer])!;
  assert.equal(plan.totalGrosze,34100);assert.equal(plan.coveredQuantity,6.2);assert.equal(plan.packages.length,1);
  assert.equal(plan.packages[0].count,1);assert.equal(plan.packages[0].packageSize,6.2);assert.deepEqual(plan.packages[0].cutRoll,{widthMm:2000,lengthMm:3100,pricePerM2Grosze:5500,cutLengthsMm:[3100]});
});
test('room cuts remain intact in feasible bounded merchant lengths; leftover widths are never invented',()=>{
  assert.deepEqual(cutRollPurchaseLengths(demand(13000,12000,10000)),[25000,10000]);
  assert.equal(cutRollArea(demand(3100,2300)),10.8);
  assert.equal(cutRollPurchaseLengths(demand(25010)),null);assert.equal(cutRollPurchaseLengths(demand(3101)),null);
  const duplicate=demand(3100,2300);duplicate.cuts[1].id='0';assert.equal(cutRollPurchaseLengths(duplicate),null);
});
test('unknown roll, width, measurement mismatch or absent cuts never fall back to whole square-metre packs',async()=>{
  for(const product of [{...p,id:'other'},{...p,ean:'5901234567890'},{...p,packageUnit:'szt'},{...p,packageSize:'2'}])assert.equal(cutRollPackagePlan(product,demand(3100),6.2,[offer]),null);
  assert.equal(cutRollPackagePlan(p,{...demand(3100),widthMm:4000},6.2,[offer]),null);
  assert.equal(cutRollPackagePlan(p,demand(3100),6,[offer]),null);
  const missing=await estimateStageCost({}as Database,[{query:{normalizedName:p.name,category:'vinyl-roll'},quantity:6.2,unit:'m2'}],{},deps);
  assert.equal(missing.lines[0].resolved,false);assert.equal(missing.stageTotalGrosze,0);
});
test('two rooms consolidate one actual cut and keep this exact plan through delivered basket selection',async()=>{
  const a=await stage(demand(3100)),b=await stage(demand(2300));
  assert.equal(a.stageTotalGrosze,34100);assert.equal(b.stageTotalGrosze,25300);
  const project=estimateProjectCost([a,b]);assert.equal(project.consolidated.consolidatedTotalGrosze,59400);
  const result=await compareAutomaticDelivery([a,b],{mode:'shipping',postalCode:'00-001'},async order=>{
    assert.equal(order.materialsGrosze,59400);assert.equal(order.lines.length,1);
    assert.deepEqual(order.lines[0].packages[0].cutRoll,{widthMm:2000,lengthMm:5400,pricePerM2Grosze:5500,cutLengthsMm:[3100,2300]});
    return{quote:{costGrosze:19900,carrier:'Test courier',payment:'Test upfront',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60000).toISOString(),sourceUrl:offer.productUrl!,destinationScope:'postal_code',postalCode:'00-001',basis:'retailer_basket_postcode',evidenceSha256:'a'.repeat(64)}};
  });
  assert.equal(result.status,'compared');assert.equal(result.best?.materialsGrosze,59400);assert.equal(result.best?.totalGrosze,79300);assert.equal(result.missingProductCount,0);
});

test('a bounded comparison keeps all continuous pieces when the total exceeds one merchant-length bound',async()=>{
 const a=await stage(demand(13000,12000,10000));
 const result=await compareAutomaticDelivery([a],{mode:'shipping',postalCode:'00-001'},async order=>{
  assert.equal(order.materialsGrosze,385000);assert.deepEqual(order.lines[0].packages.map(p=>p.cutRoll?.lengthMm),[25000,10000]);
  assert.ok(order.lines[0].packages.every(p=>p.cutRoll&&p.count===1));
  return{quote:{costGrosze:19900,carrier:'Test courier',payment:'Test upfront',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60000).toISOString(),sourceUrl:offer.productUrl!,destinationScope:'postal_code',postalCode:'00-001',basis:'retailer_basket_postcode',evidenceSha256:'a'.repeat(64)}};
 });
 assert.equal(result.status,'compared');assert.equal(result.best?.totalGrosze,404900);
});
