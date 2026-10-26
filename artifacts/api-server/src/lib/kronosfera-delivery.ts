import { createHash } from 'node:crypto';
import { parsePriceToGrosze } from '@workspace/price-collector';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';
import { RETAIL_SOURCES } from './retail-catalog';
import { inspectKronosferaProduct } from './kronosfera-product';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';

const cls=(a:Record<string,string>,name:string)=>a.class?.split(/\s+/).includes(name)??false;
const only=(values:string[])=>{if(values.length!==1)throw Error('basket_not_confirmed');return values[0];};
const attribute=(element:string,key:string)=>htmlAttributes(element.match(/^<[^>]+>/)?.[0]??'')[key];
const money=(text:string)=>{const match=/^([\d\s,.]+)\s*zł(?:\/szt\.)?$/.exec(text);const amount=match?parsePriceToGrosze(match[1].trim()):null;if(amount===null||amount<0)throw Error('invalid_money');return amount;};

export function confirmKronosferaCart(raw:string,wanted:ReadonlyMap<string,{count:number;price:number}>,materialsGrosze:number){
 const html=cleanHtml(raw),form=only(htmlElements(html,(a,tag)=>tag==='form'&&cls(a,'cart-module__form')));
 const rows=htmlElements(form,a=>cls(a,'cart-module__row'));
 if(rows.length!==wanted.size)throw Error('basket_not_confirmed');
 let total=0;const seen=new Set<string>();
 for(const row of rows){
  const title=only(htmlElements(row,a=>cls(a,'cart-module__title'))),url=new URL(attribute(title,'href')??'','https://kronosfera.pl').href,item=wanted.get(url);
  if(!item||seen.has(url)||htmlText(title)!=='Listwa przypodłogowa LK100F24 9002')throw Error('basket_not_confirmed');seen.add(url);
  const quantity=only(htmlElements(row,a=>/^carts\[1_1\]\[quantity\]\[\d+\]$/.test(a.name??'')));
  if(attribute(quantity,'value')!==String(item.count))throw Error('product_unavailable');
  const price=only(htmlElements(row,a=>cls(a,'cart-module__price-col')&&!cls(a,'d-none')));
  if(money(htmlText(only(htmlElements(price,a=>cls(a,'cart-module__price')))))!==item.price)throw Error('price_changed');
  const line=money(htmlText(only(htmlElements(only(htmlElements(row,a=>cls(a,'cart-module__total-price-col'))),a=>cls(a,'cart-module__price')))));
  if(line!==item.count*item.price)throw Error('price_changed');total+=line;
 }
 if(total!==materialsGrosze||!Number.isSafeInteger(total))throw Error('basket_not_confirmed');
 const summary=(label:string)=>{
  const values=htmlElements(form,a=>cls(a,'cart-module__prices-list-item')).filter(item=>htmlText(only(htmlElements(item,a=>cls(a,'cart-module__label'))))===label)
    .map(item=>money(htmlText(only(htmlElements(item,a=>cls(a,'cart-module__price'))))));
  if(!values.length||new Set(values).size!==1)throw Error('basket_not_confirmed');return values[0];
 };
 const materials=summary('Wartość:'),delivery=summary('Koszt dostawy:'),paymentFee=summary('Koszt płatności:'),final=summary('Do zapłaty:');
 if(materials!==total||paymentFee!==0||final!==total+delivery)throw Error('basket_not_confirmed');
 const section=(label:string)=>only(htmlElements(form,a=>cls(a,'cart-module__options-section')).filter(item=>htmlText(only(htmlElements(item,a=>cls(a,'cart-module__label'))))===label));
 const selected=(part:string,type:string)=>only(htmlElements(part,(_a,tag)=>tag==='label').filter(label=>htmlElements(label,(a,tag)=>tag==='input'&&a.type===type).some(input=>/\schecked(?:\s|=|>)/.test(input))));
 const shipping=selected(section('Wyznaczone formy dostawy:'),'checkbox');
 const carrier=htmlText(only(htmlElements(shipping,a=>cls(a,'name'))));
 if(carrier!=='Przesyłka kurierska (paczka 2620x300x300mm, 30kg)')throw Error('no_home_delivery');
 // A crossed-out undiscounted freight amount is not the current charge.
 let shippingValue=only(htmlElements(shipping,a=>cls(a,'value'))).replace(/<(del|s)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
 for(const old of htmlElements(shippingValue,a=>cls(a,'cart-module__price--old')))shippingValue=shippingValue.replace(old,'');
 if(money(htmlText(shippingValue))!==delivery)throw Error('basket_not_confirmed');
 const payment=selected(section('Rodzaj płatności:'),'radio');
 const paymentName=htmlText(only(htmlElements(payment,a=>cls(a,'name'))));
 if(paymentName!=='Płatności elektroniczne Przelewy24'||money(htmlText(only(htmlElements(payment,a=>cls(a,'value')))))!==0)throw Error('no_home_delivery');
 // A genuine free courier is supported by the live basket and the reviewed
 // >2500 PLN rule for this manufacturer's flooring/accessories, not samples.
 // source: https://kronosfera.pl/dostawa
 if(delivery===0&&total<=250_000)throw Error('no_home_delivery');
 return {costGrosze:delivery,carrier,payment:paymentName};
}

/** Native first cart step only: no customer data, address, terms, payment or
 * order submission. Fresh isolated anonymous session for every quote.
 * source: https://kronosfera.pl/themes/kronosfera/js/app.js?id=da7305815818303241f3
 */
export async function quoteKronosfera(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 if(order.store!=='Kronosfera'||!order.lines.length)throw Error('invalid_basket');
 const client=new AnonymousShop('https://kronosfera.pl',fetchImpl,AbortSignal.timeout(20000),retailerRequestBudget(order.lines.length));
 const empty=cleanHtml(await client.text('/koszyk'));
 if(htmlElements(empty,a=>cls(a,'cart-module__row')).length||!htmlText(empty).includes('W Twoim koszyku nie znaleźliśmy żadnych produktów.'))throw Error('basket_not_confirmed');
 const wanted=new Map<string,{count:number;price:number}>();let materials=0;
 for(const line of order.lines)for(const pack of line.packages){
  const source=RETAIL_SOURCES.find(source=>source.id===pack.offerId&&source.store==='Kronosfera'&&source.format==='kronosfera');
  if(!source||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES||wanted.has(source.url))throw Error('invalid_basket');
  const current=inspectKronosferaProduct(await client.text(source.url),source);
  if(current.amount!==pack.unitPriceGrosze)throw Error('price_changed');
  const response=JSON.parse(await client.text('/ajax/store/product/purchase/1/pl/'+source.productId,{_token:current.token,quantity:String(pack.count)}));
  if(response.quantity!==String(pack.count)&&response.quantity!==pack.count)throw Error('product_unavailable');
  wanted.set(source.url,{count:pack.count,price:current.amount});materials+=current.amount*pack.count;
 }
 if(materials!==order.materialsGrosze)throw Error('basket_not_confirmed');
 const raw=await client.text('/koszyk'),selected=confirmKronosferaCart(raw,wanted,materials),now=new Date();
 return {quote:{...selected,checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:'https://kronosfera.pl/dostawa',basis:'retailer_basket_national',destinationScope:'PL',dispatchFrom:'Strzelce Opolskie',evidenceSha256:createHash('sha256').update(raw).digest('hex')}};
}
