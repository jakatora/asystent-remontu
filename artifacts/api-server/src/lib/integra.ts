import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import type {RetailSource} from './retail-pages';
import {RETAIL_SOURCES} from './retail-catalog';
import {AnonymousShop,MAX_RETAIL_PACKAGES,retailerRequestBudget} from './retailer-http';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';

export const INTEGRA_ORIGIN='https://integra-bielinscy.pl';
const POLICY='/content/1-koszty-dostawy';
// Exact variants, not a generic PrestaShop integration. EANs are confirmed in
// the native basket; the product page itself does not expose a barcode.
// source: https://gtv.com.pl/produkt/UZ-NYXA-128-20M/
// source: https://gtv.com.pl/wp-content/uploads/2024/05/Regulamin_konkursu_SolidnaEkipa.pdf
const PRODUCTS:Record<number,{ean:string;slug:string;name:string}>={
  1614:{ean:'5902801422652',slug:'1614-uchwyt-meblowy-nyxa-c-128-l-138-czarny-mat-5902801422652.html',name:'Uchwyt meblowy NYXA C-128 / L-138 czarny mat'},
  1613:{ean:'5902801422737',slug:'1613-uchwyt-meblowy-nyxa-c-128-l-138-zloto-szczotkowane-5902801422737.html',name:'Uchwyt meblowy NYXA C-128 / L-138 złoto szczotkowane'},
};
const one=(values:string[])=>{if(values.length!==1)throw Error('product_identity_not_confirmed');return values[0];};
/** Read JSON only. Never evaluate retailer scripts. */
export function integraContext(html:string):any{
  const marker='var prestashop = ',i=html.indexOf(marker),start=html.indexOf('{',i+marker.length);
  if(i<0||start<0)throw Error('country_not_confirmed');
  let depth=0,quoted=false,escape=false;
  for(let p=start;p<html.length;p++){
    const c=html[p];
    if(quoted){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')quoted=false;}
    else if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0)return JSON.parse(html.slice(start,p+1));
  }
  throw Error('invalid_response');
}
function reviewed(source:RetailSource){
  const p=source.productId&&PRODUCTS[source.productId];
  if(!p||source.store!=='Integra Bielińscy'||source.format!=='integra'||source.ean!==p.ean||source.name!==p.name||source.url!==INTEGRA_ORIGIN+'/uchwyty/'+p.slug||source.brand!=='GTV'||source.packageSize!==1||source.unit!=='szt')throw Error('integra_source_not_reviewed');
  return p;
}
function money(value:unknown){if(typeof value!=='string'&&typeof value!=='number')throw Error('invalid_money');const n=parsePriceToGrosze(value);if(n===null||!Number.isSafeInteger(n)||n<0)throw Error('invalid_money');return n;}
function equalMoney(text:unknown,numeric:unknown){const cents=money(text);if(typeof numeric!=='number'||!Number.isFinite(numeric)||Math.abs(numeric*100-cents)>0.001)throw Error('invalid_money');return cents;}
function country(context:any){if(context.country?.id!==14||context.country?.iso_code!=='PL'||context.currency?.iso_code!=='PLN')throw Error('country_not_confirmed');}
export function integraProductPage(html:string,source:RetailSource){
  const variant=reviewed(source),safe=cleanHtml(html),context=integraContext(html);country(context);
  const element=one(htmlElements(safe,a=>a.id==='product-details'&&Boolean(a['data-product']))),p=JSON.parse(htmlAttributes(element.slice(0,element.indexOf('>')+1))['data-product']);
  const priceGrosze=equalMoney(p.price,p.price_amount);
  if(p.id!==source.productId||p.id_product!==source.productId||Number(p.id_product_attribute)!==0||p.name!==variant.name||p.manufacturer_name!=='GTV'||p.pack!==0||p.is_virtual!=='0'||p.available_for_order!=='1'||p.minimal_quantity!=='1'||p.allow_oosp!==0||!Number.isSafeInteger(p.quantity)||p.quantity<1)throw Error('product_unavailable');
  if(p.quantity_discounts?.length||Number(p.additional_shipping_cost)!==0||Number(p.ecotax)!==0)throw Error('purchase_rules_changed');
  const imageUrl=p.cover?.bySize?.home_default?.url;
  if(typeof imageUrl!=='string'||!imageUrl.startsWith(INTEGRA_ORIGIN+'/')||!imageUrl.endsWith('.jpg'))throw Error('product_identity_not_confirmed');
  const form=one(htmlElements(safe,(a,t)=>t==='form'&&a.id==='add-to-cart-or-refresh')),a=htmlAttributes(form.slice(0,form.indexOf('>')+1));
  if(a.action!==INTEGRA_ORIGIN+'/koszyk'||a.method!=='post')throw Error('invalid_cart_route');
  const token=htmlAttributes(one(htmlElements(form,(a,t)=>t==='input'&&a.name==='token'))).value;
  const id=htmlAttributes(one(htmlElements(form,(a,t)=>t==='input'&&a.name==='id_product'))).value;
  if(!token||id!==String(source.productId))throw Error('invalid_cart_route');
  const weights=htmlElements(safe,(a,t)=>t==='meta'&&a.property==='product:weight:value'),units=htmlElements(safe,(a,t)=>t==='meta'&&a.property==='product:weight:units');
  const kg=weights.length===1&&units.length===1&&htmlAttributes(units[0]).content==='kg'?Number(htmlAttributes(weights[0]).content):NaN;
  return{token,priceGrosze,stock:p.quantity,imageUrl,weightGrams:Number.isFinite(kg)&&kg>0&&Number.isSafeInteger(kg*1000)?kg*1000:null};
}
export function confirmIntegraCart(cart:any,expected:ReadonlyMap<number,{source:RetailSource;count:number;priceGrosze:number}>){
  if(!Array.isArray(cart?.products)||cart.products.length!==expected.size||cart.vouchers?.added?.length||cart.subtotals?.discounts!==null)throw Error('basket_not_confirmed');
  const seen=new Set<number>();let total=0;
  const proof=cart.products.map((p:any)=>{
    const id=Number(p.id_product??p.id),wanted=expected.get(id);
    if(!wanted||seen.has(id)||String(p.ean13)!==wanted.source.ean||p.name!==wanted.source.name||p.quantity!==wanted.count||String(p.cart_quantity)!==String(wanted.count)||Number(p.id_product_attribute)!==0||p.allow_oosp!==0||!Number.isSafeInteger(p.stock_quantity)||p.stock_quantity<wanted.count||p.pack!==false||p.quantity_discounts?.length||p.has_discount===true||equalMoney(p.price,p.price_amount)!==wanted.priceGrosze||money(p.total)!==wanted.priceGrosze*wanted.count)throw Error(p.stock_quantity<wanted?.count!?'insufficient_stock':'basket_not_confirmed');
    seen.add(id);total+=wanted.priceGrosze*wanted.count;
    return{id,ean:p.ean13,count:p.quantity,priceGrosze:wanted.priceGrosze,stock:p.stock_quantity};
  });
  if(equalMoney(cart.subtotals?.products?.value,cart.subtotals?.products?.amount)!==total)throw Error('basket_not_confirmed');
  return{total,products:proof};
}
async function add(client:AnonymousShop,source:RetailSource,count:number){
  if(!Number.isSafeInteger(count)||count<1||count>MAX_RETAIL_PACKAGES)throw Error('invalid_basket');
  const page=integraProductPage(await client.text(new URL(source.url).pathname),source);
  if(page.stock<count)throw Error('insufficient_stock');
  const response=JSON.parse(await client.text('/koszyk',{token:page.token,id_product:String(source.productId),id_customization:'0',qty:String(count),add:'1',action:'update',ajax:'true'}));
  if(response.success!==true||response.errors)throw Error('basket_not_confirmed');
  return page;
}
export async function readIntegraProduct(source:RetailSource,fetchImpl:typeof fetch){
  reviewed(source);const client=new AnonymousShop(INTEGRA_ORIGIN,fetchImpl,AbortSignal.timeout(15_000),5),page=await add(client,source,1);
  const context=integraContext(await client.text('/koszyk?action=show'));country(context);
  const proof=confirmIntegraCart(context.cart,new Map([[source.productId!,{source,count:1,priceGrosze:page.priceGrosze}]]));
  return{...page,evidenceSha256:createHash('sha256').update(JSON.stringify([proof,page.imageUrl])).digest('hex')};
}
// Public national HOME InPost tariff, not the locker row or the provisional
// shipping amount in an address-less basket. Changed/ambiguous policies fail.
// source: https://integra-bielinscy.pl/content/1-koszty-dostawy
export function integraTariff(html:string,materials:number,grams:number){
  const safe=cleanHtml(html),main=one(htmlElements(safe,a=>a.id==='content')),text=htmlText(main);
  const section=text.match(/Kurier InPost (.*?)Kurier DPD/);
  if(!section||!/maksymalnej długości 1,2 m i wadze do 30 kg/.test(section[1])||!/do 49\.99 zł - 14\.95 zł od 50\.00 do 99\.99 zł - 8\.95 zł od 100\.00 do 149\.00 zł - 4\.95 zł od 150 zł - GRATIS/.test(section[1]))throw Error('delivery_tariff_changed');
  if(!Number.isSafeInteger(grams)||grams<=0||grams>30000)throw Error('delivery_weight_not_confirmed');
  if(!Number.isSafeInteger(materials)||materials<=0)throw Error('invalid_money');
  if(materials<=4999)return 1495;if(materials<=9999)return 895;if(materials<=14900)return 495;if(materials>=15000)return 0;
  throw Error('delivery_threshold_ambiguous');
}
export async function quoteIntegra(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
  if(order.store!=='Integra Bielińscy')throw Error('invalid_basket');
  const client=new AnonymousShop(INTEGRA_ORIGIN,fetchImpl,AbortSignal.timeout(20_000),retailerRequestBudget(order.lines.length)),expected=new Map<number,{source:RetailSource;count:number;priceGrosze:number}>();
  let materials=0,grams=0;
  for(const line of order.lines)for(const pack of line.packages){
    const source=RETAIL_SOURCES.find(s=>s.id===pack.offerId&&s.store===order.store);
    if(!source||expected.has(source.productId!)||pack.url!==source.url||pack.packageSize!==1||line.unit!=='szt'||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze)throw Error('invalid_basket');
    reviewed(source);const page=await add(client,source,pack.count);
    if(page.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
    // Both reviewed 128 mm variants are 138 mm long. Weight is read live;
    // absent weight (currently the gold variant) cannot mean zero freight.
    if(page.weightGrams===null)throw Error('delivery_weight_not_confirmed');
    grams+=page.weightGrams*pack.count;materials+=pack.lineCostGrosze;expected.set(source.productId!,{source,count:pack.count,priceGrosze:page.priceGrosze});
  }
  if(!expected.size||materials!==order.materialsGrosze)throw Error('basket_not_confirmed');
  const context=integraContext(await client.text('/koszyk?action=show'));country(context);const proof=confirmIntegraCart(context.cart,expected);
  if(proof.total!==materials)throw Error('basket_not_confirmed');
  const policy=await client.text(POLICY),costGrosze=integraTariff(policy,materials,grams),checkedAt=new Date();
  return{quote:{costGrosze,carrier:'Kurier InPost',payment:'Przedpłata',checkedAt:checkedAt.toISOString(),expiresAt:new Date(checkedAt.getTime()+600_000).toISOString(),sourceUrl:INTEGRA_ORIGIN+POLICY,basis:'retailer_tariff_national',destinationScope:'PL',evidenceSha256:createHash('sha256').update(JSON.stringify({proof,policy,grams,costGrosze})).digest('hex')}};
}
