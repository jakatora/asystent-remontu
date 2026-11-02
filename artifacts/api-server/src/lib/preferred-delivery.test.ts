import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product,ProductOffer} from '@workspace/db/repositories';
import {estimateStageCost,groupProjectByProduct} from '../../../../lib/pricing-service/src/estimate';
import {rememberDeliveryAllocation,rebuildDeliveryAllocation} from '../../../../lib/pricing-service/src/preferred-delivery-plan';
import type {BasketQuoter,DeliverySettings} from '../../../../lib/pricing-service/src/delivery';
import {createPreferredDeliveryComparison} from './preferred-delivery';

const settings:DeliverySettings={mode:'shipping',postalCode:'00-001',allowSeparateOrders:false};
async function stage(quantity=5){
  const product={id:'p',name:'Farba',category:'paint',packageSize:'5',packageUnit:'l',imageUrl:null} as Product;
  const offers=['A','B'].map((store,i)=>({id:store,productId:'p',store,price:i?'6.00':'5.00',promoPrice:null,packageSize:'5',source:'observed-store-page',availability:'in_stock',fetchedAt:new Date(),productUrl:null} as ProductOffer));
  return estimateStageCost({} as Database,[{query:{ean:'5903973139188'},quantity,unit:'l'}],{}, {
    findProductByCode:async()=>product,findProductByNameAndCategory:async()=>product,listOffers:async()=>offers,
  });
}
const known:BasketQuoter=async(order,postalCode)=>({quote:{costGrosze:order.store==='A'?0:1000,carrier:'Kurier',payment:'Przelew',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60_000).toISOString(),sourceUrl:'https://example.org/cart',destinationScope:'postal_code',postalCode,basis:'retailer_basket_postcode',evidenceSha256:'a'.repeat(64)}});
const onlyFirst=(seen:string[],quote:BasketQuoter=known):BasketQuoter=>async(order,p,context)=>{seen.push(order.store);return seen.length===1?quote(order,p,context):{reason:'quote_timeout'};};

test('the previous delivered winner is checked before other carts under a fresh deadline',async()=>{
  const compare=createPreferredDeliveryComparison(),input=[await stage()];
  const previous=await compare(input,settings,known);assert.equal(previous.best?.totalGrosze,500);
  const seen:string[]=[],result=await compare(input,settings,onlyFirst(seen));
  assert.equal(seen[0],'A');assert.equal(result.best?.totalGrosze,500);assert.equal(result.best?.stores[0].store,'A');assert.ok(seen.length<=80);
  const coldSeen:string[]=[],cold=await createPreferredDeliveryComparison()(input,settings,onlyFirst(coldSeen));
  assert.equal(coldSeen[0],'B');assert.equal(cold.best?.totalGrosze,1600);
});

test('a stalled previous winner does not hold free workers away from healthy alternatives',{timeout:1000},async()=>{
  const compare=createPreferredDeliveryComparison(),input=[await stage()];await compare(input,settings,known);
  let release!:()=>void;const alternativeStarted=new Promise<void>(resolve=>{release=resolve;});const seen:string[]=[];
  const result=await compare(input,settings,async(order,p)=>{
    seen.push(order.store);
    if(order.store==='A'){await alternativeStarted;return{reason:'quote_timeout'};}
    release();return known(order,p);
  });
  assert.equal(seen[0],'A');assert.ok(seen.includes('B'));assert.equal(result.best?.stores[0].store,'B');assert.equal(result.best?.totalGrosze,1600);
});

test('an allocation survives delivery expiry but never reuses its price, fee, discount or evidence',async()=>{
  let clock=Date.now();const compare=createPreferredDeliveryComparison(()=>clock),input=[await stage()];
  const first=await compare(input,settings,known),old=first.best!.stores[0].quote!;
  clock+=120_000;assert.ok(Date.parse(old.expiresAt)<clock);
  const line=input[0].lines[0];assert.ok(line.resolved);line.offers.find(o=>o.id==='A')!.price='7.50';
  const seen:string[]=[],fresh=await compare(input,settings,onlyFirst(seen,async(order,p)=>{
    assert.equal(order.materialsGrosze,750);assert.equal(order.deliveryGrosze,null);assert.equal(order.quote,undefined);
    const q=await known(order,p);assert.ok('quote'in q);return{quote:{...q.quote,costGrosze:200,expiresAt:new Date(clock+60_000).toISOString(),evidenceSha256:'b'.repeat(64)}};
  }));
  assert.equal(seen[0],'A');assert.equal(fresh.best?.totalGrosze,950);assert.equal(fresh.best?.stores[0].quote?.evidenceSha256,'b'.repeat(64));
  const allocation=rememberDeliveryAllocation(first.best!);assert.ok(allocation);
  assert.ok(!/Grosze|quote|discount|evidence|expiresAt|checkedAt/.test(JSON.stringify(allocation)));
});

test('expired or rejected new quotes never revive the remembered total',async()=>{
  for(const reason of ['quote_timeout','price_changed','insufficient_stock','purchase_rules_changed','expired']){
    const compare=createPreferredDeliveryComparison(),input=[await stage()];await compare(input,settings,known);
    const seen:string[]=[];const result=await compare(input,settings,async(order,p)=>{
      seen.push(order.store);if(reason!=='expired')return{reason};const q=await known(order,p);assert.ok('quote'in q);q.quote.expiresAt=new Date(0).toISOString();return q;
    });
    assert.equal(seen[0],'A');assert.equal(result.best,null,reason);
  }
});

test('current stock, lots, size, identity, availability and full coverage reject a stale allocation',async()=>{
  const input=await stage(),first=await createPreferredDeliveryComparison()([input],settings,known),allocation=rememberDeliveryAllocation(first.best!)!;
  const line=input.lines[0];assert.ok(line.resolved);
  for(const patch of [{maxPackages:0},{minimumPackages:2},{purchaseMultiple:2},{packageSize:'10'},{availability:'out_of_stock'},{fetchedAt:new Date(0)},{productId:'other',product:{...line.product,id:'other'}}]){
    const groups=groupProjectByProduct([input]);groups[0]={...groups[0],offers:groups[0].offers.map(o=>o.id==='A'?{...o,...patch}:o)};
    assert.equal(rebuildDeliveryAllocation(allocation,groups,new Date()),null,JSON.stringify(patch));
  }
  const groups=groupProjectByProduct([input]);assert.equal(rebuildDeliveryAllocation(allocation,[{...groups[0],totalQuantity:6}],new Date()),null);
  assert.equal(rebuildDeliveryAllocation(allocation,[{...groups[0],requiredBySize:{'10':5}}],new Date()),null);
  assert.equal(rebuildDeliveryAllocation(allocation,groups,new Date(),new Set(['A'])),null);
  assert.equal(rebuildDeliveryAllocation([...allocation,...allocation],groups,new Date()),null);
});

test('a changed postcode, demand, selected shop or purchase option cannot inherit another request priority',async()=>{
  for(const change of ['postcode','demand','shop','separate','extra','manual','pickup']){
    const compare=createPreferredDeliveryComparison(),input=[await stage()];await compare(input,settings,known);
    const next={...settings};let store:string|undefined;
    if(change==='postcode')next.postalCode='30-001';if(change==='demand')input[0]=await stage(10);if(change==='shop')store='A';
    if(change==='separate')next.allowSeparateOrders=true;if(change==='extra')next.allowExtraPackages=true;if(change==='manual')next.method='manual';if(change==='pickup')next.mode='pickup';
    const seen:string[]=[];await compare(input,next,onlyFirst(seen),[],new Date(),{},store);
    assert.notEqual(seen[0],'A',change);
  }
});

test('partial projects retain their missing product and do not quote a remembered subset as complete',async()=>{
  const compare=createPreferredDeliveryComparison(),input=[await stage()];await compare(input,settings,known);
  const line=input[0].lines[0];input[0].lines.push({...line,resolved:false,quantity:1,query:{ean:'9999999999999'}} as typeof line);
  const seen:string[]=[],result=await compare(input,settings,onlyFirst(seen));assert.equal(result.status,'partial');assert.equal(result.best,null);assert.equal(seen.length,0);
});

test('the remembered plan covers all rooms together and obeys new finite stock without reducing the requirement',async()=>{
  const compare=createPreferredDeliveryComparison(),input=[await stage(),await stage()];
  const first=await compare(input,settings,known);assert.equal(first.best?.totalGrosze,1000);
  assert.equal(first.best?.stores[0].lines[0].packages[0].count,2);
  for(const stage of input){const line=stage.lines[0];assert.ok(line.resolved);line.offers=line.offers.map(o=>o.id==='A'?{...o,maxPackages:1}:o);}
  const result=await compare(input,settings,async(order,p)=>{
    for(const pack of order.lines.flatMap(l=>l.packages))if(pack.offerId==='A')assert.ok(pack.count<=1);
    return known(order,p);
  });
  assert.equal(result.productCount,1);assert.equal(result.missingProductCount,0);assert.equal(result.best?.totalGrosze,2100);
  assert.equal(result.best?.stores.flatMap(o=>o.lines.flatMap(l=>l.packages)).reduce((n,p)=>n+p.count*p.packageSize,0),10);
});

test('bounded per-service memory expires without extending hint lifetime on unsuccessful reads',async()=>{
  let clock=Date.now();const compare=createPreferredDeliveryComparison(()=>clock,1),input=[await stage()];await compare(input,settings,known);
  await compare(input,{...settings,postalCode:'30-001'},known);
  let seen:string[]=[];await compare(input,settings,onlyFirst(seen));assert.equal(seen[0],'B');
  await compare(input,settings,known);clock+=60*60*1000;
  await compare(input,settings,async()=>({reason:'quote_timeout'}));clock+=60*60*1000+1;
  seen=[];await compare(input,settings,onlyFirst(seen));assert.equal(seen[0],'B');
  await compare(input,settings,known);seen=[];await createPreferredDeliveryComparison()(input,settings,onlyFirst(seen));assert.equal(seen[0],'B');
});
