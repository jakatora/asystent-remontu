import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {KNAUF_FINISH_SOURCES,confirmKnaufFinishPurchase} from './knauf-finishes';
import {parseRetailPage,readRetailSource} from './retail-pages';
import {selectAbudHomeRate} from './abud-delivery';
import {createRetailerQuoter} from './retailer-delivery';

const fixture=(name:string)=>readFileSync(new URL('../../test/fixtures/knauf-finishes/'+name,import.meta.url),'utf8');
const source=(id:string)=>KNAUF_FINISH_SOURCES.find(s=>s.id===id)!;
const small=source('abud-knauf-superfinish-54kg'),large=source('abud-knauf-superfinish-28kg'),real=source('realbud-knauf-superfinish-28kg');
const now=new Date('2026-11-01T23:20:00Z');
function alterOffer(html:string,change:(offer:Record<string,any>)=>void):string {
 return html.replace(/(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/,(_all,a,json,b)=>{const p=JSON.parse(json);change(p.offers[0]);return a+JSON.stringify(p)+b;});
}

test('actual primary ABUD cards bind each full bucket and select the dated sale, excluding list price and delivery teaser',()=>{
 const little=parseRetailPage(fixture('abud-superfinish-small.html'),small,now),big=parseRetailPage(fixture('abud-superfinish-28.html'),large,now);
 assert.equal(little.priceGrosze,4470);assert.equal(little.ean,'5901793357959');assert.equal(big.priceGrosze,9900);assert.equal(big.ean,'5901793357935');assert.equal(big.validUntil,'2026-11-30');
 assert.equal((big as any).deliveryGrosze,undefined);assert.equal((little as any).deliveryGrosze,undefined);
});
test('ambiguous, expired or foreign promotional specifications cannot supply a price',()=>{
 const original=fixture('abud-superfinish-28.html');
 for(const change of [(o:any)=>o.priceSpecification.push(o.priceSpecification[1]),(o:any)=>o.priceSpecification[1].priceCurrency='EUR',
  (o:any)=>delete o.priceSpecification[1].validThrough,(o:any)=>o.priceSpecification[1].validThrough='2026-11-29',
  (o:any)=>o.priceSpecification[0].price='98.00',(o:any)=>o.priceSpecification[1].priceType='https://schema.org/ListPrice',
  (o:any)=>o.priceSpecification[1].price='NaN',(o:any)=>o.priceCurrency='EUR'])assert.throws(()=>parseRetailPage(alterOffer(original,change),large,now),/promotion_not_confirmed/);
 assert.throws(()=>parseRetailPage(original,large,new Date('2026-11-30T23:00:00Z')),/promotion_not_confirmed/);
 assert.equal(parseRetailPage(original,large,new Date('2026-11-30T22:59:59Z')).priceGrosze,9900);
});
test('the promotional amount must agree with the actual gross form and the exact primary barcode',()=>{
 const original=fixture('abud-superfinish-28.html');
 assert.throws(()=>parseRetailPage(alterOffer(original,o=>{o.priceSpecification[1].price='98.00';}),large,now),/gross_price_mismatch/);
 assert.throws(()=>parseRetailPage(original.replace('dictionary__producer_code --value">5901793357935','dictionary__producer_code --value">5901793357959'),large,now),/ean_not_confirmed/);
 const net=original.replace(/(class="price_vat">\s*)brutto/,'$1netto');assert.notEqual(net,original);
 assert.throws(()=>parseRetailPage(net,large,now),/unit_or_gross_not_confirmed/);
 assert.throws(()=>parseRetailPage(original,small,now),/id_not_confirmed/);
});
test('the actual Realbud API is one sealed 28 kg bucket with its factory GTIN and gross price',async()=>{
 const raw=fixture('realbud-superfinish-28.json'),item=JSON.parse(raw);confirmKnaufFinishPurchase(item,real);
 const observed=await readRetailSource(real,async(input)=>{assert.equal(String(input),'https://realbud.com/webapi/front/pl_PL/products/PLN/75056672');return new Response(raw,{headers:{'content-type':'application/json'}});});
 assert.equal(observed.priceGrosze,10305);assert.equal(observed.ean,'5901793357935');assert.equal(observed.imageUrl,real.imageUrl);
});
test('changed Realbud pack, brand, product identifier or unit cannot leave a confirmed bucket',()=>{
 for(const change of [(i:any)=>i.ean='5901793357959',(i:any)=>i.id++,(i:any)=>i.name=i.name.replace('28 kg','20 kg'),
  (i:any)=>i.unit.floating_point=true,(i:any)=>i.unit.name='kg',(i:any)=>i.producer.id++,(i:any)=>i.package='33',(i:any)=>i.code='different']){
  const item=JSON.parse(fixture('realbud-superfinish-28.json'));change(item);assert.throws(()=>confirmKnaufFinishPurchase(item,real),/package_not_confirmed/);
 }
 for(const patch of [{packageSize:20},{unit:'l'},{brand:'Kreisel'},{url:real.url+'?other=true'},{purchaseMultiple:33}])assert.throws(()=>confirmKnaufFinishPurchase(JSON.parse(fixture('realbud-superfinish-28.json')),{...real,...patch}),/package_not_confirmed/);
});

test('a real heavy ABUD basket selects the explicit prepaid pallet instead of pickup or COD',()=>{
 const response=JSON.parse(fixture('abud-pallet-rates.json'));const rate=selectAbudHomeRate(response);
 assert.equal(rate.costGrosze,9000);assert.equal(rate.carrier,'Pekaes - Paleta 60x40');assert.equal(rate.payment,'Płatność z góry');
 const euro=structuredClone(response);euro.data.shipping.shipping=euro.data.shipping.shipping.filter((r:any)=>r.courier.id!==100072);assert.equal(selectAbudHomeRate(euro).costGrosze,18500);
 const pickup=structuredClone(response);pickup.data.shipping.shipping=pickup.data.shipping.shipping.filter((r:any)=>r.prepaid==='dvp'||r.courier.id===0);assert.throws(()=>selectAbudHomeRate(pickup),/no_home_delivery/);
});
test('changed pallet names, duplicate rates, absent fees and conflicting gross amounts stay unconfirmed',()=>{
 const rates=JSON.parse(fixture('abud-pallet-rates.json')).data.shipping.shipping,rate=rates.find((r:any)=>r.prepaid==='prepaid'&&r.courier.id===100072);
 const response=(shipping:any[])=>({data:{shipping:{shipping}}});
 assert.throws(()=>selectAbudHomeRate(response([{...rate,courier:{...rate.courier,name:'Odbiór palety'}}])),/no_home_delivery/);
 assert.throws(()=>selectAbudHomeRate(response([rate,rate])),/invalid_response/);
 for(const cost of [{value:0,formatted:'90,00 zł'},{formatted:'0,00 zł'},{value:-1,formatted:'-1,00 zł'},{value:90.001,formatted:'90,00 zł'}])assert.throws(()=>selectAbudHomeRate(response([{...rate,cost}])),/invalid_money/);
});

test('the actual Realbud individual-transport placeholder never becomes free delivery despite the free-shipping teaser',async()=>{
 const item=JSON.parse(fixture('realbud-superfinish-28.json')),basket=JSON.parse(fixture('realbud-one-cart.json')),calls:string[]=[];
 const quote=createRetailerQuoter(async(input,init)=>{const u=new URL(String(input));assert.equal(u.origin,'https://realbud.com');calls.push((init?.method??'GET')+' '+u.pathname);if(u.pathname==='/webapi/front/pl_PL/products/PLN/75056672')return Response.json(item);assert.equal(u.pathname,'/webapi/front/pl_PL/basket/PLN/');return Response.json(basket);});
 const order={store:'Realbud',materialsGrosze:10305,deliveryGrosze:null,totalGrosze:null,deliveryMinimumGrosze:0,source:'unknown' as const,lines:[{product:{id:real.ean,name:real.name,imageUrl:null},unit:'kg',packages:[{offerId:real.id,store:'Realbud',url:real.url,packageSize:28,count:1,unitPriceGrosze:10305,lineCostGrosze:10305}]}]};
 assert.deepEqual(await quote(order,'30-001'),{reason:'retailer_transport_quote_required'});assert.equal(calls.length,3);
});
