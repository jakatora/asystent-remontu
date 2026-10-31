import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/dekork-shopify.json' with {type:'json'};
import {DEKORK_SOURCES,confirmDekorkProduct,readDekorkProduct} from '../src/lib/dekork';
import {createRetailerQuoter,retailerDeliveryCapabilities} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const sources=DEKORK_SOURCES;
const normalize=(entries:number[][])=>JSON.stringify([...entries].sort((a,b)=>a[0]-b[0]));
function network(mutate?:(kind:string,data:any)=>void):typeof fetch{
 let session=0;const carts=new Map<string,number[][]>();
 return async(input,init)=>{
  const url=new URL(String(input));assert.equal(url.origin,'https://dekork.pl');const headers=new Headers(init?.headers),cookie=headers.get('cookie')??'',found=cookie.match(/cart=(qa\d+)/),id=found?.[1]??'qa'+(++session);if(!carts.has(id))carts.set(id,[]);const entries=carts.get(id)!;
  const response=(data:any)=>Response.json(data,{headers:{'set-cookie':'cart='+id+'; Path=/; Secure'}}),product=fixture.products.find(p=>url.pathname==='/products/'+p.handle+'.js');
  if(product){assert.equal(init?.method??'GET','GET');const data=structuredClone(product);mutate?.('product',data);return response(data);}
  const htmlIndex=fixture.products.findIndex(p=>url.pathname==='/products/'+p.handle);if(htmlIndex>=0){const notice={html:fixture.grossNotices[htmlIndex]};mutate?.('gross',notice);return new Response(notice.html,{headers:{'set-cookie':'cart='+id+'; Path=/; Secure'}});}
  if(url.pathname==='/cart/add.js'){assert.equal(init?.method,'POST');const form=new URLSearchParams(String(init?.body));assert.deepEqual([...form.keys()].sort(),['id','quantity']);entries.push([Number(form.get('id')),Number(form.get('quantity'))]);return response({});}
  const row=fixture.cartCases.find(c=>normalize(c.entries)===normalize(entries)&&c.code===(url.searchParams.get('shipping_address[zip]')??'30-001'));
  if(url.pathname==='/cart.js'){assert.equal(init?.method??'GET','GET');if(!entries.length)return response({currency:'PLN',items:[]});assert.ok(row,'unreviewed native cart');const data={currency:row.currency,item_count:row.item_count,total_price:row.total_price,items_subtotal_price:row.items_subtotal_price,items:structuredClone(row.items)};mutate?.('cart',data);return response(data);}
  assert.equal(url.pathname,'/cart/shipping_rates.json');assert.equal(init?.method??'GET','GET');assert.equal(url.searchParams.get('shipping_address[country]'),'Poland');assert.deepEqual([...url.searchParams.keys()].sort(),['shipping_address[country]','shipping_address[zip]']);assert.ok(row);const data=structuredClone(row.rates);mutate?.('rates',data);return response(data);
 };
}
function basket(entries:number[][]):DeliveredStoreBasket{
 const packages=entries.map(([id,count])=>{const source=sources.find(s=>s.variantId===id)!,p=fixture.products.find(p=>p.id===source.productId)!,v=p.variants.find(v=>v.id===id)!;return{source,pack:{offerId:source.id,store:'Dekork',url:source.url,packageSize:source.packageSize,count,unitPriceGrosze:v.price,lineCostGrosze:v.price*count}};});
 return{store:'Dekork',materialsGrosze:packages.reduce((n,row)=>n+row.pack.lineCostGrosze,0),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:packages.map(({source,pack})=>({product:{id:'remont-'+source.ean,name:source.name,imageUrl:source.imageUrl},unit:'m2',packages:[pack]}))};
}

test('Dekork has three distinct reviewed products and ten exact physical bundle sizes; neither product minimum nor Corksystem old GTIN is substituted',async()=>{
 assert.equal(sources.length,12);assert.equal(new Set(sources.map(s=>s.ean)).size,3);assert.ok(sources.every(s=>s.ean!=='5061092900925'&&new URL(s.url).searchParams.get('variant')===String(s.variantId)));
 for(const source of sources){const p=fixture.products.find(p=>p.id===source.productId)!,v=p.variants.find(v=>v.id===source.variantId)!,row=await readDekorkProduct(source,network());assert.equal(row.priceGrosze,v.price);assert.equal(row.ean,source.ean);assert.equal(row.availability,'in_stock');assert.equal(row.imageUrl,source.imageUrl);assert.ok(source.packageSize===10||source.packageSize%6===0);}
 const bundle=sources.find(s=>s.id==='dekork-professional-2pack')!,p=fixture.products[0];assert.equal(confirmDekorkProduct(p,bundle).priceGrosze,13099);assert.equal(bundle.packageSize,12);assert.equal(p.variants[1].barcode,null);
 for(const change of[{ean:'5061092900925'},{packageSize:6},{variantId:57433631359307},{brand:'Corksystem'},{url:bundle.url.split('?')[0]}])assert.throws(()=>confirmDekorkProduct(p,{...bundle,...change}));
});

test('changed native brand, codes, variant count, pack contents, stock or missing gross inclusion fail closed',async()=>{
 const source=sources[0],p=fixture.products[0];for(const mutate of[(p:any)=>p.vendor='Other',(p:any)=>p.id++,(p:any)=>p.variants[0].barcode='5061092900925',(p:any)=>p.variants[0].title='2 Paczki',(p:any)=>p.variants[0].sku='other',(p:any)=>p.available=false,(p:any)=>p.variants[0].available=false,(p:any)=>p.variants[0].taxable=false,(p:any)=>p.description=p.description.replace('15 szt.','10 szt.'),(p:any)=>p.variants[0].price=1.1]){const data=structuredClone(p);mutate(data);assert.throws(()=>confirmDekorkProduct(data,source));}
 await assert.rejects(readDekorkProduct(source,network((kind,data)=>{if(kind==='gross')data.html='<div class="product__tax">Podatek obliczony przy zakupie.</div>';})),/gross_price/);
});

test('every captured whole cart, bundle and postcode uses its native shipping rate and exact quantities',async()=>{
 const capabilities=retailerDeliveryCapabilities();assert.ok(capabilities.automaticStores.includes('Dekork'));assert.ok(capabilities.postcodeStores.includes('Dekork'));
 for(const row of fixture.cartCases){const result=await createRetailerQuoter(network())(basket(row.entries),row.code);assert.ok('quote'in result,JSON.stringify(result));assert.equal(result.quote.costGrosze,1799);assert.equal(result.quote.destinationScope,'postal_code');assert.equal(result.quote.postalCode,row.code);assert.equal(result.quote.basis,'retailer_basket_postcode');assert.equal(basket(row.entries).materialsGrosze,row.total_price);}
 assert.equal(2*6899-13099,699);
});

test('changed cart quantities, units, currency, subtotal or absent/unexpected rates cannot invent a cheap total',async()=>{
 const order=basket([[57433631392075,1]]);for(const mutation of[(kind:string,data:any)=>{if(kind==='cart')data.items[0].quantity++;},(kind:string,data:any)=>{if(kind==='cart')data.items[0].product_id++;},(kind:string,data:any)=>{if(kind==='cart')data.items[0].final_line_price=1;},(kind:string,data:any)=>{if(kind==='cart')data.currency='EUR';},(kind:string,data:any)=>{if(kind==='cart')data.total_price=1;}])assert.deepEqual(await createRetailerQuoter(network(mutation))(order,'30-001'),{reason:'basket_not_confirmed'});
 for(const mutation of[(data:any)=>data.shipping_rates=[],(data:any)=>data.shipping_rates[0].price=null,(data:any)=>data.shipping_rates[0].currency='EUR',(data:any)=>data.shipping_rates[0].name='Paczkomat',(data:any)=>data.shipping_rates.push(data.shipping_rates[0])])assert.deepEqual(await createRetailerQuoter(network((kind,data)=>{if(kind==='rates')mutation(data);}))(order,'30-001'),{reason:'no_home_delivery'});
 assert.deepEqual(await createRetailerQuoter(network((kind,data)=>{if(kind==='product')data.variants[1].price++;}))(order,'30-001'),{reason:'price_changed'});
});
