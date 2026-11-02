import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Database,Product} from '@workspace/db/repositories';
import type {PurchaseOffer} from './types';
import {estimateStageCost,type EstimateDeps} from './estimate';
import {compareAutomaticDelivery} from './automatic-delivery';
import type {BasketQuoter,DeliveryQuote} from './delivery';
const quote=(costGrosze:number):DeliveryQuote=>{const now=Date.now();return{costGrosze,carrier:'Fixture courier',payment:'Prepaid',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),sourceUrl:'https://example.test/cart',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:'a'.repeat(64)};};

test('all mandatory whole-store baskets are checked before optional quantity and line partitions can consume the shared budget',async()=>{
 const stores=['A','A','A','A','A','B','C','D'],products=stores.map((_store,i)=>({id:'p'+i,ean:'fixture-'+i,name:'Product '+i,normalizedName:'product'+i,category:'fixture',packageSize:'1',packageUnit:'szt',imageUrl:null} as Product));
 const offers=products.map((p,i)=>({id:'offer'+i,productId:p.id,store:stores[i],price:'1.00',packageSize:'1',unit:'szt',source:'test',availability:'in_stock',fetchedAt:new Date()} as PurchaseOffer));
 const deps:EstimateDeps={findProductByCode:async(_db,q)=>products.find(p=>p.ean===q.ean)??null,findProductByNameAndCategory:async()=>null,listOffers:async(_db,id)=>offers.filter(o=>o.productId===id)};
 const stage=await estimateStageCost({} as Database,products.map((p,i)=>({query:{ean:p.ean},quantity:i<5?20:1,unit:'szt'})),{},deps);
 const calls:{store:string;whole:boolean}[]=[];
 const atomic:BasketQuoter=async order=>{calls.push({store:order.store,whole:order.store!=='A'||order.lines.length===5&&order.lines.every(line=>line.packages[0].count===20)});return{quote:quote(1000)};};
 const result=await compareAutomaticDelivery([stage],{mode:'shipping',postalCode:'30-001',allowSeparateOrders:true},atomic);
 assert.ok(result.best);assert.equal(result.best.stores.length,4);assert(calls.length<=80);
 const firstPartial=calls.findIndex(call=>!call.whole),lastWhole=Math.max(...['A','B','C','D'].map(store=>calls.findIndex(call=>call.store===store&&call.whole)));
 assert(firstPartial>lastWhole,JSON.stringify({firstPartial,lastWhole,firstCalls:calls.slice(0,10)}));
});

test('after whole baskets are safe, native separate orders can still reduce the confirmed delivered sum',async()=>{
 const product={id:'p',ean:'fixture',name:'Pipe',normalizedName:'pipe',category:'fixture',packageSize:'10',packageUnit:'m',imageUrl:null} as Product;
 const offer={id:'offer',productId:'p',store:'A',price:'39.90',packageSize:'10',unit:'m',source:'test',availability:'in_stock',fetchedAt:new Date()} as PurchaseOffer;
 const deps:EstimateDeps={findProductByCode:async()=>product,findProductByNameAndCategory:async()=>null,listOffers:async()=>[offer]};
 const stage=await estimateStageCost({} as Database,[{query:{ean:'fixture'},quantity:20,unit:'m'}],{},deps),calls:number[]=[];
 const result=await compareAutomaticDelivery([stage],{mode:'shipping',postalCode:'30-001',allowSeparateOrders:true},async order=>{const count=order.lines[0].packages[0].count;calls.push(count);return{quote:quote(count===2?7000:2000)};});
 assert.equal(result.best!.totalGrosze,11980);assert.equal(result.best!.deliveryGrosze,4000);assert.equal(result.best!.stores[0].quote!.orders!.length,2);assert.deepEqual(calls,[2,1]);
});
