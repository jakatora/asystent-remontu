import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {quoteTopboden} from '../src/lib/topboden-delivery';
import {createRemontService} from '../src/shared-backend';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

const source=RETAIL_SOURCES.find(row=>row.id==='topboden-indo-gloss-25m')!;
const product=()=>({uuid:source.productUuid,ean:source.ean,name:source.name,brand:{name:'Arbiton'},data:{logisticData:{ean:source.ean}},available:true,baseUnitStock:1000,isSlab:false,isTile:false,promotionCode:null,category:{uuid:'skirting',parentUuid:'trim'},units:{basicUnit:'mb',priceListUnit:'mb',orderUnit:'szt.',numerator:5,denominator:2,multiple:10,minOrderQuantity:10},price:{isDiscount:false,grossPrice:1279,packageGrossPrice:3198,packageNetPrice:2600},images:[{category:'Packshot',resized:{gallery:{webp:'/photos/'+source.ean+'_P_02.webp'}}}]});
const tariffs=()=>[{uuid:'courier',name:'Kurier',isSample:false,type:'COURIER',minOrderValue:2000,prices:{categories:{trim:'29.99'},formats:{}}},{uuid:'sample',name:'Kurier inpost',isSample:true,type:'COURIER',minOrderValue:0,prices:{all:'0'}}];
const card=(p:ReturnType<typeof product>,currency='PLN')=>`<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({props:{pageProps:{categoryAllData:p}}})}</script><script type="application/ld+json">${JSON.stringify({'@type':'Product',name:p.name,offers:{priceCurrency:currency,price:p.price.packageGrossPrice/100,availability:'http://schema.org/InStock'}})}</script>`;
function server(options:{product?:(p:ReturnType<typeof product>)=>any;tariffs?:(t:ReturnType<typeof tariffs>)=>any;currency?:string}={}){
 const paths:string[]=[];
 const fetchImpl:typeof fetch=async(input,init)=>{
  assert.equal(init?.method,'GET','quotes never submit an order or customer data');
  const url=new URL(String(input));paths.push(url.origin+url.pathname);
  const p=options.product?.(product())??product();
  if(url.origin==='https://topboden.pl'){assert.equal(url.pathname,new URL(source.url).pathname);return new Response(card(p,options.currency));}
  assert.equal(url.origin,'https://api.topboden.pl');
  const value=url.pathname==='/api/delivery'?(options.tariffs?.(tariffs())??tariffs()):p;
  if(url.pathname!=='/api/delivery')assert.equal(url.pathname,'/api/product/by-uuid/'+source.productUuid);
  return new Response(JSON.stringify(value),{headers:{'content-type':'application/json'}});
 };
 return {paths,fetchImpl};
}
function order(count=10):DeliveredStoreBasket {
 return {store:'TopBoden',materialsGrosze:count*3198,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:null},unit:'mb',packages:[{offerId:source.id,store:'TopBoden',url:source.url,packageSize:2.5,purchaseMultiple:10,count,unitPriceGrosze:3198,lineCostGrosze:3198*count}]}]};
}

test('TopBoden binds gross piece price, primary barcode, lot and storefront photo origin',async()=>{
 const api=server(),observation=await readRetailSource(source,api.fetchImpl);
 assert.equal(observation.priceGrosze,3198);assert.notEqual(observation.priceGrosze,1279);assert.notEqual(observation.priceGrosze,2600);
 assert.equal(observation.ean,'5905167725719');assert.equal(observation.imageUrl,'https://topboden.pl/photos/'+source.ean+'_P_02.webp');assert.equal(api.paths.length,2);
});

test('TopBoden rejects a changed lot, wrong colour, currency, barcode and unavailable purchase quantity',async()=>{
 for(const change of [
  (p:ReturnType<typeof product>)=>({...p,ean:'5905167781685'}),
  (p:ReturnType<typeof product>)=>({...p,name:p.name.replace('połysk','mat')}),
  (p:ReturnType<typeof product>)=>({...p,units:{...p.units,multiple:20}}),
  (p:ReturnType<typeof product>)=>({...p,units:{...p.units,minOrderQuantity:1}}),
  (p:ReturnType<typeof product>)=>({...p,baseUnitStock:24}),
  (p:ReturnType<typeof product>)=>({...p,available:false}),
 ])await assert.rejects(readRetailSource(source,server({product:change}).fetchImpl));
 await assert.rejects(readRetailSource(source,server({currency:'EUR'}).fetchImpl),/gross_price/);
});

test('TopBoden calculates the whole national tariff and distinguishes it from a postcode basket quote',async()=>{
 const api=server(),result=await quoteTopboden(order(),api.fetchImpl);assert.ok('quote'in result);
 assert.equal(result.quote.costGrosze,2999);assert.equal(result.quote.basis,'retailer_tariff_national');assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.postalCode,undefined);
 assert.equal(order().materialsGrosze+result.quote.costGrosze,34979);assert.equal(api.paths.length,3);
 const free=await quoteTopboden(order(70),server().fetchImpl);assert.ok('quote'in free);assert.equal(free.quote.costGrosze,0);
 const largest=await quoteTopboden(order(),server({tariffs:rows=>[{...rows[0],prices:{categories:{trim:'29.99',skirting:'99.00'},formats:{}}}]}).fetchImpl);assert.ok('quote'in largest);assert.equal(largest.quote.costGrosze,9900);
});

test('a sample zero, unknown category, changed amount or short stock never becomes free delivery',async()=>{
 for(const rows of [tariffs().slice(1),[{...tariffs()[0],prices:{categories:{trim:'0'},formats:{}}}],[{...tariffs()[0],prices:{categories:{other:'29.99'},formats:{}}}]])await assert.rejects(quoteTopboden(order(),server({tariffs:()=>rows}).fetchImpl));
 await assert.rejects(quoteTopboden(order(1),server().fetchImpl),/purchase_multiple/);
 await assert.rejects(quoteTopboden(order(),server({product:p=>({...p,price:{...p.price,packageGrossPrice:3298}})}).fetchImpl),/price_changed/);
 await assert.rejects(quoteTopboden(order(20),server({product:p=>({...p,baseUnitStock:25})}).fetchImpl),/insufficient_stock/);
 const wrongTotal=order();wrongTotal.materialsGrosze--;await assert.rejects(quoteTopboden(wrongTotal,server().fetchImpl),/basket_not_confirmed/);
});

test('a confirmed minimum order change withdraws cached prices across restarts until a compatible fresh read',async()=>{
 const observed=await readRetailSource(source,server().fetchImpl);
 const directory=mkdtempSync(join(tmpdir(),'remont-lot-rules-')),cachePath=join(directory,'offers.json');
 const changed=server({product:p=>({...p,units:{...p.units,minOrderQuantity:20,multiple:20}})});
 const onlyTopboden=(api:ReturnType<typeof server>):typeof fetch=>async(input,init)=>{
  if(!String(input).includes('topboden.pl'))throw Error('retailer_unavailable');
  return api.fetchImpl(input,init);
 };
 const first=createRemontService({initialObservations:[observed],background:false,cachePath,fetchImpl:onlyTopboden(changed)});
 let restored:ReturnType<typeof createRemontService>|undefined;
 try{
  assert.equal(first.status().offers,1);await first.refresh();assert.equal(first.status().offers,0);
  assert.equal(first.status().sources.find(row=>row.id===source.id)?.error,'purchase_rules_changed');
  restored=createRemontService({initialObservations:[observed],background:false,cachePath,fetchImpl:onlyTopboden(server())});
  assert.equal(restored.status().offers,0,'an old bootstrap cannot restore obsolete purchase rules');
  await restored.refresh();assert.equal(restored.status().offers,1);
 }finally{
  first.close();restored?.close();
  assert.ok(resolve(directory).startsWith(resolve(tmpdir())+sep));rmSync(directory,{recursive:true});
 }
});
