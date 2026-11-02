import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import {estimateStageCost,type EstimateDeps} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import {CERESIT_VIVA_WHITE_FAMILY as key,CERESIT_VIVA_WHITE_FAMILY_NAME as name,CERESIT_VIVA_WHITE_PACKS as packs} from './reviewed-package-families';
import type {PurchaseOffer} from './types';

const products=packs.map(p=>({id:'p-'+p.ean,ean:p.ean,name:'Ceresit Viva White 01 '+p.size+' kg',normalizedName:'ceresit viva white01 '+p.size,category:'grout',packageSize:String(p.size),packageUnit:'kg',imageUrl:null}as Product));
const offers=products.map((p,i)=>({id:'offer-'+p.ean,productId:p.id,store:'Test shop',price:i?'59.39':'35.44',packageSize:p.packageSize,unit:'kg',source:'test',availability:'in_stock',fetchedAt:new Date(),maxPackages:i?3:1}as PurchaseOffer));
const deps:EstimateDeps={findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)};
const calculate=(quantity:number,patch={})=>estimateStageCost({}as Database,[{query:{packageFamily:key,normalizedName:name,category:'grout',...patch},quantity,unit:'kg'}],{},deps);
test('Viva automatically combines real-sized finite buckets while keeping both EANs and raw kg, never CE40',async()=>{
  const stage=await calculate(5),line=stage.lines[0];assert(line.resolved);assert.equal(line.quantity,5);assert.equal(line.lineCost,9483);assert(line.packagePlan);assert.deepEqual(line.packagePlan.packages.map(p=>[p.packageSize,p.count]).sort((a,b)=>a[0]-b[0]),[[2,1],[4,1]]);assert.deepEqual(line.packagePlan.packages.map(p=>p.product?.ean).sort(),packs.map(p=>p.ean).sort());
  const old=await calculate(5,{ean:'5900089140015'});assert.equal(old.lines[0].resolved,false);const shade=await calculate(5,{normalizedName:name.replace('White 01','Carrara 03')});assert.equal(shade.lines[0].resolved,false);
  const unavailable=await calculate(15);assert.equal(unavailable.lines[0].resolved,false,'Published stock covers at most 14kg, never 15');
});
test('whole-basket delivered comparison uses complete physical package orders and does not invent unavailable extra two-kg buckets',async()=>{
  const stage=await calculate(5),calls:{size:number;count:number}[][]=[];
  const result=await compareAutomaticDelivery([stage],{mode:'shipping',postalCode:'30-001'},async order=>{const physical=order.lines.flatMap(l=>l.packages.map(p=>({size:p.packageSize,count:p.count})));assert(physical.filter(p=>p.size===2).reduce((n,p)=>n+p.count,0)<=1);assert(physical.filter(p=>p.size===4).reduce((n,p)=>n+p.count,0)<=3);calls.push(physical);const now=Date.now();return{quote:{costGrosze:1500,carrier:'Controlled courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:'https://example.test/cart',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:'a'.repeat(64)}};});
  assert(result.best);assert.equal(result.best.materialsGrosze,9483);assert.equal(result.best.deliveryGrosze,1500);assert.equal(result.best.totalGrosze,10983);assert(calls.length>0);
});
