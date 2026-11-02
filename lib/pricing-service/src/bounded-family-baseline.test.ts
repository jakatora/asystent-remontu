import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import {estimateStageCost} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import type {BasketQuoter} from './delivery';
import type {PurchaseOffer} from './types';
import {REVIEWED_PACKAGE_FAMILIES} from './reviewed-package-families';

// Controlled merchant quotes model the live three-colour regression. Freight
// rules belong to this test only; production must ask each actual whole cart.
async function renovation(automaticWhite:boolean) {
 const families=REVIEWED_PACKAGE_FAMILIES.filter(f=>f.key.startsWith('ceresit-viva-'));
 const products=families.flatMap(f=>f.packs.map(p=>({id:p.ean,ean:p.ean,name:f.name+' '+p.size+' kg',normalizedName:f.name,category:'grout',packageSize:String(p.size),packageUnit:'kg',imageUrl:null}as Product)));
 const offers:PurchaseOffer[]=products.flatMap(p=>{
  const white=p.name.includes('White'),grey=p.name.includes('Grey'),size=Number(p.packageSize);
  return [{id:'B-'+p.id,productId:p.id,store:'B',price:size===2?'35.44':'59.39',packageSize:p.packageSize,unit:'kg',source:'test',availability:'in_stock',fetchedAt:new Date(),maxPackages:size===4?3:white?1:grey?2:3,product:p}as PurchaseOffer,
   ...(!grey&&(white||size===2)?[{id:'A-'+p.id,productId:p.id,store:'A',price:size===2?'39.90':'64.90',packageSize:p.packageSize,unit:'kg',source:'test',availability:'in_stock',fetchedAt:new Date(),product:p}as PurchaseOffer]:[])];
 });
 return estimateStageCost({}as Database,families.map(f=>({query:!automaticWhite&&f.key.includes('white')?{ean:f.packs.find(p=>p.size===4)!.ean}:{packageFamily:f.key,normalizedName:f.name,category:'grout'},quantity:f.key.includes('white')?20:5,unit:'kg'})),{},
  {findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)});
}

for(const threshold of [18000,15000])for(const optional of [false,true])test(`bounded multi-size comparison retains the cheaper fixed-size stock split; A threshold=${threshold}, optional strategies=${optional}`,async()=>{
 const inputs=[await renovation(false),await renovation(true)],results=[];
 for(const input of inputs){
  let calls=0;const quote:BasketQuoter=async order=>{calls++;const now=Date.now();return{quote:{costGrosze:order.store==='A'?(order.materialsGrosze>=threshold?0:1300):(order.materialsGrosze>=30000?0:1500),carrier:'Controlled courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:'https://example.test/cart',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:'a'.repeat(64)}};};
  const result=await compareAutomaticDelivery([input],{mode:'shipping',postalCode:'30-001',allowSeparateOrders:optional,allowExtraPackages:optional},quote);
  assert(result.best);assert(calls<=80);results.push(result);
 }
 const [fixed,automatic]=results;assert(fixed.best);assert(automatic.best);assert.equal(fixed.best.totalGrosze,threshold===18000?50314:50209);assert.equal(automatic.searchLimited,true);
 const fixedTotal=fixed.best.totalGrosze,automaticTotal=automatic.best.totalGrosze;
 assert.equal(typeof fixedTotal,'number');assert.equal(typeof automaticTotal,'number');
 assert(fixedTotal!==null&&automaticTotal!==null&&automaticTotal<=fixedTotal,`automatic ${automaticTotal} omitted fixed-size ${fixedTotal}`);
 assert.equal(automatic.best!.deliveryGrosze,0);
 for(const order of automatic.best!.stores)for(const line of order.lines)for(const pack of line.packages)assert(pack.count<=(pack.maxPackages??Infinity));
 const quantities=new Map<string,number>();for(const order of automatic.best!.stores)for(const line of order.lines)for(const pack of line.packages)quantities.set(line.product.id,(quantities.get(line.product.id)??0)+pack.count*pack.packageSize);
 assert.equal(quantities.get('9000101175134'),20);assert.equal(quantities.get('9000101173451')??0,0);
});
