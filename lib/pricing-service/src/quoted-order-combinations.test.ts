import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {ProductGroup} from './estimate';
import {selectCheapestOffer} from './estimate';
import type {DeliveredBasket,DeliveredStoreBasket} from './delivery';
import {recombineQuotedOrders} from './quoted-order-combinations';

type Item={id:string;count?:number;size?:number;price?:number;multiple?:number;minimum?:number;max?:number;cut?:any;offer?:string};
const now=Date.now();
function order(store:string,items:Item[],fee=0):DeliveredStoreBasket {
 const lines=items.map(item=>{const count=item.count??1,size=item.size??1,price=item.price??100;return{product:{id:item.id,name:item.id,imageUrl:null},unit:'szt',packages:[{offerId:item.offer??store+'-'+item.id+'-'+size,store,url:'https://example.org/'+store+'/'+item.id,packageSize:size,count,unitPriceGrosze:price,lineCostGrosze:count*price,...(item.multiple?{purchaseMultiple:item.multiple}:{}),...(item.minimum?{minimumPackages:item.minimum}:{}),...(item.max!==undefined?{maxPackages:item.max}:{}),...(item.cut?{cutRoll:item.cut}:{})}]};});
 const materialsGrosze=lines.reduce((n,line)=>n+line.packages[0].lineCostGrosze,0);
 return{store,lines,materialsGrosze,deliveryGrosze:fee,deliveryMinimumGrosze:fee,totalGrosze:materialsGrosze+fee,source:'retailer',quote:{costGrosze:fee,carrier:'Fixture home courier',payment:'Prepaid',sourceUrl:'https://example.org/cart',basis:'retailer_basket_national',destinationScope:'PL',checkedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+60000).toISOString(),evidenceSha256:'a'.repeat(64)}};
}
function groups(orders:DeliveredStoreBasket[],needs:Record<string,number>):ProductGroup[]{
 return Object.entries(needs).map(([id,totalQuantity])=>{
  const offers=new Map();for(const o of orders)for(const l of o.lines)if(l.product.id===id)for(const p of l.packages)offers.set(p.offerId,{id:p.offerId,store:o.store,productId:id,price:(p.unitPriceGrosze/100).toFixed(2),promoPrice:null,packageSize:String(p.packageSize),unit:l.unit,productUrl:p.url,availability:'in_stock',fetchedAt:new Date(now),purchaseMultiple:p.purchaseMultiple,minimumPackages:p.minimumPackages,maxPackages:p.maxPackages});
  const product={id,name:id,ean:null,gtin:null,normalizedName:id,category:'fixture',packageSize:'1',packageUnit:'szt'} as ProductGroup['product'];
  return{product,cheapestOffer:selectCheapestOffer([...offers.values()],undefined,{quantity:totalQuantity,product})!,totalQuantity,unit:'szt',offers:[...offers.values()],packageSize:1,perStageCostGrosze:0};
 });
}
const basket=(stores:DeliveredStoreBasket[]):DeliveredBasket=>{const materialsGrosze=stores.reduce((n,o)=>n+o.materialsGrosze,0),deliveryGrosze=stores.reduce((n,o)=>n+o.deliveryGrosze!,0);return{stores,materialsGrosze,deliveryGrosze,totalGrosze:materialsGrosze+deliveryGrosze,lowerBoundGrosze:materialsGrosze+deliveryGrosze};};

test('full quoted carts can recombine across original allocations without borrowing a partial-cart shipping fee',()=>{
 const partial=order('X',[{id:'a'},{id:'c',count:3}],4500),whole=order('X',[{id:'a'},{id:'c',count:4}],1950),extra=order('D',[{id:'c'}],1800),cheap=order('Z',[{id:'b'}],100),dear=order('W',[{id:'b',price:10000}],0),pool=[partial,whole,extra,cheap,dear],plans=[[partial,extra,cheap],[whole,dear]],original=JSON.stringify({pool,plans});
 const result=recombineQuotedOrders(plans,pool,groups(pool,{a:1,b:1,c:4}),'30-001',plans.map(basket),now);
 assert.equal(result.baskets[0].totalGrosze,2650);assert.deepEqual(result.baskets[0].stores.map(s=>s.store),['X','Z']);assert.equal(result.baskets[0].stores[0].lines.find(l=>l.product.id==='c')!.packages[0].count,4);assert.equal(JSON.stringify({pool,plans}),original);
});

test('two independent carts from the same store cannot be combined into a new unquoted order',()=>{
 const a=order('X',[{id:'a'}],0),b=order('X',[{id:'b'}],0),target=order('X',[{id:'a'},{id:'b'}],9999),pool=[a,b];
 assert.deepEqual(recombineQuotedOrders([[target]],pool,groups([target,...pool],{a:1,b:1}),'30-001',[],now).baskets,[]);
});

test('unknown, expired, future or foreign-postcode freight cannot complete a recombined basket',()=>{
 const valid=order('X',[{id:'a'}],100),g=groups([valid],{a:1});
 for(const change of [(o:DeliveredStoreBasket)=>{delete o.quote;},(o:DeliveredStoreBasket)=>{o.deliveryGrosze=null;o.totalGrosze=null;},(o:DeliveredStoreBasket)=>{o.quote!.expiresAt=new Date(now).toISOString();},(o:DeliveredStoreBasket)=>{o.quote!.checkedAt=new Date(now+1).toISOString();},(o:DeliveredStoreBasket)=>{o.quote!.destinationScope='postal_code';o.quote!.postalCode='00-001';},(o:DeliveredStoreBasket)=>{o.quote!.costGrosze++;}]){const bad=structuredClone(valid);change(bad);assert.deepEqual(recombineQuotedOrders([[valid]],[bad],g,'30-001',[],now).baskets,[]);}
});

test('stock, purchase lots, minimum quantities and locked physical sizes still constrain a new allocation',()=>{
 for(const rule of [{max:2},{multiple:2},{minimum:4}]){const limited=order('X',[{id:'p',count:3,...rule}],0),g=groups([limited],{p:3});assert.deepEqual(recombineQuotedOrders([[limited]],[limited],g,'30-001',[],now).baskets,[]);}
 const small=order('X',[{id:'p',count:6,size:1}],0),g=groups([small],{p:6});g[0].requiredBySize={'2':3};assert.deepEqual(recombineQuotedOrders([[small]],[small],g,'30-001',[],now).baskets,[]);
});

test('an expired cheaper result cannot prune a currently valid complete purchase',()=>{
 const expired=order('A',[{id:'p'}],0),current=order('B',[{id:'p'}],10);expired.quote!.expiresAt=new Date(now).toISOString();
 const result=recombineQuotedOrders([[expired]],[current],groups([expired,current],{p:1}),'30-001',[basket([expired])],now);assert.equal(result.baskets[0].totalGrosze,110);
});

test('an offer with smaller minimum cannot turn a forced original lot into unsolicited surplus',()=>{
 const forced=order('A',[{id:'p',count:3,minimum:3}],100),loose=order('B',[{id:'p',count:3}],0),g=groups([forced,loose],{p:1});assert.deepEqual(recombineQuotedOrders([[forced]],[loose],g,'30-001',[],now).baskets,[]);
});

test('physical package size, product identity and exact cut dimensions cannot be interchanged',()=>{
 const single=order('A',[{id:'p',count:3,size:1}],0),box=order('B',[{id:'p',size:25}],0),other=order('C',[{id:'other',count:3}],0);assert.deepEqual(recombineQuotedOrders([[single]],[box,other],groups([single,box,other],{p:3}),'30-001',[],now).baskets,[]);
 const cut={widthMm:2000,lengthMm:3000},correct=order('A',[{id:'roll',count:2,cut}],0),wrong=order('B',[{id:'roll',count:2,cut:{...cut,lengthMm:2000}}],0),g=groups([correct,wrong],{roll:1});g[0].cutRoll={widthMm:2000,cuts:[{id:'cut',lengthMm:3000,widthMm:2000,count:2}]} as any;
 assert.deepEqual(recombineQuotedOrders([[correct]],[wrong],g,'30-001',[],now).baskets,[]);assert.equal(recombineQuotedOrders([[correct]],[correct],g,'30-001',[],now).baskets[0].stores[0].lines[0].packages[0].count,2);
});

test('a verified native rounding adjustment remains in the exact whole-cart amount',()=>{
 const expensive=order('A',[{id:'p'}],100),rounded=order('B',[{id:'p'}],100);rounded.materialsGrosze=99;rounded.totalGrosze=199;rounded.quote!.materialsRoundingGrosze=-1;
 const result=recombineQuotedOrders([[expensive]],[rounded],groups([expensive,rounded],{p:1}),'30-001',[basket([expensive])],now);assert.equal(result.baskets[0].totalGrosze,199);assert.equal(result.baskets[0].stores[0].quote!.materialsRoundingGrosze,-1);
});

test('more than 32 shops remain independent and an exhausted CPU budget never invents a result',()=>{
 const original=Array.from({length:40},(_,i)=>order('Store'+i,[{id:'p'+i}],100)),cheap=order('Store39',[{id:'p39',price:1}],0),pool=[...original,cheap],g=groups(pool,Object.fromEntries(original.map((_,i)=>['p'+i,1]))),existing=[basket(original)];
 const result=recombineQuotedOrders([original],pool,g,'30-001',existing,now);assert.equal(result.baskets[0].stores.length,40);assert.equal(new Set(result.baskets[0].stores.map(s=>s.store)).size,40);assert.equal(result.baskets[0].totalGrosze,7801);
 const limited=recombineQuotedOrders([original],pool,g,'30-001',existing,now,1);assert.equal(limited.limited,true);assert.equal(limited.states,1);assert.deepEqual(limited.baskets,[]);assert.equal(existing[0].totalGrosze,8000);
});

test('small non-additive courier examples match an independent exhaustive order-subset oracle',()=>{
 for(let seed=1;seed<=20;seed++){
  const pool:DeliveredStoreBasket[]=[];
  for(const [i,store]of ['A','B','C'].entries())for(const ids of [['a'],['b'],['c'],['a','b'],['a','b','c']])pool.push(order(store,ids.map(id=>({id,price:10+(seed*(i+3)+id.charCodeAt(0))%70})),(seed*37+i*41+ids.length*53)%211));
  const initial=[pool[0],pool[6],pool[12]],g=groups(pool,{a:1,b:1,c:1});let expected=Infinity;
  for(let mask=1;mask<2**pool.length;mask++){const selected=pool.filter((_o,i)=>mask&(2**i));if(new Set(selected.map(o=>o.store)).size!==selected.length)continue;const counts={a:0,b:0,c:0};for(const o of selected)for(const l of o.lines)counts[l.product.id as keyof typeof counts]+=l.packages[0].count;if(Object.values(counts).every(n=>n===1))expected=Math.min(expected,selected.reduce((n,o)=>n+o.totalGrosze!,0));}
  const result=recombineQuotedOrders([initial],pool,g,'30-001',[basket(initial)],now);assert.equal(Math.min(basket(initial).totalGrosze!,...result.baskets.map(b=>b.totalGrosze!)),expected,String(seed));assert.ok(result.states<=100000);assert.ok(result.steps<=2000000);
 }
});
