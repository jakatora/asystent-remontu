import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {AnonymousShop,MAX_RETAIL_PACKAGES} from './retailer-http';
import {RETAIL_SOURCES} from './retail-catalog';
import {parseRetailPage,type RetailSource,type RetailObservation} from './retail-pages';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';

const origin='https://www.mlazienka.pl',sourceId='mlazienka-cersanit-ovida-50';
const one=(nodes:string[],reason='basket_not_confirmed')=>{if(nodes.length!==1)throw Error(reason);return nodes[0];};
const attrs=(node:string)=>htmlAttributes(node.match(/^<[^>]+>/)?.[0]??'');
const cls=(a:Record<string,string>,name:string)=>a.class?.split(/\s+/).includes(name)??false;
const element=(html:string,id:string)=>one(htmlElements(html,a=>a.id===id));
const has=(node:string,key:string)=>new RegExp('\\s'+key+'(?:\\s|=|>)').test(node.match(/^<[^>]+>/)?.[0]??'');
const money=(value:unknown)=>{
 if(typeof value!=='string'&&typeof value!=='number'||typeof value==='string'&&!/^\d+(?:[.,]\d{1,2})?$/.test(value))throw Error('basket_not_confirmed');
 const n=parsePriceToGrosze(value);if(n===null||!Number.isSafeInteger(n)||n<0||typeof value==='number'&&Math.abs(value*100-n)>0.00001)throw Error('basket_not_confirmed');return n;
};
const amount=(html:string)=>{
 const row=one(htmlElements(html,a=>cls(a,'price-row'))),a=attrs(row),s=htmlText(row).replace(/\s/g,'');
 if(a['data-currency']!=='zł'||!/^\d+,\d{2}zł$/.test(s))throw Error('basket_not_confirmed');
 const n=money(s.replace('zł',''));if(a['data-price']&&money(a['data-price'])!==n)throw Error('basket_not_confirmed');return n;
};
function reviewed(source:RetailSource){
 const pinned=RETAIL_SOURCES.find(s=>s.id===sourceId)!;
 if(source.id!==sourceId||source.store!=='mŁazienka'||source.ean!=='5901771226987'||source.productId!==785642||source.retailerSku!=='K36031'||source.url!==pinned.url||source.packageSize!==1||source.unit!=='szt')throw Error('invalid_basket');
}

/** Both duplicated JSON-LD records, visible gross price, exact SKU and native
 * add-to-cart form must agree with the exact primary product card.
 * source: https://www.mlazienka.pl/umywalka-505x40-cm-polokragla-scienna-bialy-polysk-k36031-cersanit-ovida-785642.html */
export function confirmMlazienkaCard(raw:string,source:RetailSource):RetailObservation{
 reviewed(source);const observed=parseRetailPage(raw,{...source,format:'jsonld'},new Date());
 const products=[...raw.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m=>[JSON.parse(m[1])].flat()).filter(p=>p?.['@type']==='Product');
 if(!products.length||products.some(p=>p.gtin13!==source.ean||p.sku!==source.retailerSku||p.name!==observed.name||p.brand?.name!=='Cersanit'||p.offers?.url!==source.url||p.offers?.priceCurrency!=='PLN'||money(p.offers?.price)!==observed.priceGrosze||!/\/InStock$/.test(p.offers?.availability??'')))throw Error('product_identity_not_confirmed');
 const html=cleanHtml(raw),title=one(htmlElements(html,(_a,t)=>t==='h1'));
 if(htmlText(title)!==observed.name)throw Error('product_identity_not_confirmed');
 if(htmlText(one(htmlElements(html,a=>cls(a,'base-info'))))!=='Nr katalogowy: K36031 Dostępność: w magazynie')throw Error('product_unavailable');
 if(amount(one(htmlElements(html,a=>cls(a,'pricelist'))))!==observed.priceGrosze)throw Error('price_changed');
 const form=element(html,'to-cart'),f=attrs(form);
 if(f.method!=='post'||f.action!==origin+'/koszyk,dodaj.html')throw Error('basket_not_confirmed');
 const fields=htmlElements(form,(_a,t)=>t==='input').map(attrs);
 if(fields.length!==4||!Object.entries({product_id:'785642',subcategory_id:'81',form:'1',quantity:'1'}).every(([key,value])=>fields.filter(a=>a.name===key&&a.value===value&&a.type==='hidden').length===1))throw Error('basket_not_confirmed');
 return observed;
}

export function confirmMlazienkaSummary(raw:string,materials:number,cost:number):void{
 const summary=element(cleanHtml(raw),'cart-summary'),cart=element(summary,'cart-value'),total=element(summary,'total-value');
 if(money(attrs(cart).value)!==materials||amount(cart)!==materials||money(attrs(total)['data-value'])!==materials+cost||amount(total)!==materials+cost)throw Error('basket_not_confirmed');
 // The native template leaves this span unclosed. Scope by its enclosing LI,
 // never by a zero elsewhere (pickup, footer, optional services).
 const shipping=one(htmlElements(summary,a=>cls(a,'ship-value'))),open=one([...shipping.matchAll(/<span\b[^>]*\bid="ship-value"[^>]*>/g)].map(m=>m[0]));
 const a=htmlAttributes(open);if(a.value===undefined||money(a.value)!==cost)throw Error('no_home_delivery');
 if(cost===0?htmlText(shipping)!=='Dostawa i płatność: Gratis!':amount(shipping)!==cost)throw Error('no_home_delivery');
}

export function confirmMlazienkaCart(raw:string,count:number,price:number,selected=false):{stock?:number;costGrosze?:number}{
 const html=cleanHtml(raw),form=element(html,'cart-form'),rows=htmlElements(element(form,'cart-products'),a=>cls(a,'product-row')),row=one(rows);
 if(attrs(form).method!=='post'||attrs(form)['data-refreshv2']!==origin+'/koszyk,zapiszV2.html')throw Error('basket_not_confirmed');
 if(attrs(row)['data-cart-row-id']!=='785642'||Number(attrs(form)['data-total-items'])!==count)throw Error('basket_not_confirmed');
 const source=RETAIL_SOURCES.find(s=>s.id===sourceId)!,input=attrs(one(htmlElements(row,(a,t)=>t==='input'&&cls(a,'quantity'))));
 if(input.id!=='quantity-785642'||input.name!=='items[785642]'||input['data-product_id']!=='785642'||Number(input.value)!==count||Number(input['data-current-quantity'])!==count)throw Error('basket_not_confirmed');
 const product=JSON.parse(input['data-gtm-product']),link=one(htmlElements(row,(a,t)=>t==='a'&&cls(a,'product-name')));
 if(product.id!==785642||product.producer!=='Cersanit'||product.name!==source.name||htmlText(link)!==source.name||attrs(link).href!==source.url)throw Error('basket_not_confirmed');
 if(product.availability!=='w magazynie'||product.GA4availability!=='w magazynie'||htmlText(one(htmlElements(row,a=>cls(a,'product-availability'))))!=='Dostępność: 24h!')throw Error('insufficient_stock');
 if(money(product.price)!==price||amount(element(row,'value-785642'))!==count*price)throw Error('price_changed');
 const alerts=htmlElements(row,a=>cls(a,'hurry-alert')),stock=alerts.length?Number(htmlText(one(alerts)).match(/^Pospiesz się, zostały tylko (\d+) sztuki!$/)?.[1]):undefined;
 if(stock!==undefined&&(!Number.isSafeInteger(stock)||stock<count))throw Error('insufficient_stock');
 if(!selected)return{stock};
 const checked=(name:string)=>{
  const node=one(htmlElements(form,(a,t)=>t==='input'&&a.type==='radio'&&a.name===name).filter(n=>has(n,'checked')),'no_home_delivery');
  if(has(node,'disabled'))throw Error('no_home_delivery');return attrs(node);
 };
 const shipment=checked('shipment'),payment=checked('payment');
 if(shipment.id!=='input-KUR'||shipment.value!=='1'||payment.id!=='input-PZ'||payment.value!=='15'||attrs(one(htmlElements(form,(a,t)=>t==='input'&&a.name==='selected-payment'))).value!=='15')throw Error('no_home_delivery');
 const label=(id:string)=>htmlText(one(htmlElements(form,(a,t)=>t==='label'&&a.for===id))).replace(/\s*\d[\d\s,.]* zł$/,'').trim();
 if(label(shipment.id)!=='Kurier'||label(payment.id)!=='Przelew zwykły')throw Error('no_home_delivery');
 const payments=JSON.parse(shipment['data-payments']);if(payments?.PZ?.disabled||payments?.PZ?.cost===undefined)throw Error('no_home_delivery');
 const cost=money(shipment['data-cost'])+money(payments.PZ.cost);
 if(htmlElements(form,(a,t)=>t==='input'&&a.type==='checkbox').some(n=>has(n,'checked')))throw Error('no_home_delivery');
 confirmMlazienkaSummary(form,count*price,cost);return{stock,costGrosze:cost};
}

async function nativeCart(source:RetailSource,count:number,client:AnonymousShop){
 reviewed(source);if(!Number.isSafeInteger(count)||count<1||count>Math.min(99,MAX_RETAIL_PACKAGES))throw Error('invalid_basket');
 const raw=await client.text(source.url),product=confirmMlazienkaCard(raw,source);
 await client.mlazienka('add',count);const cart=await client.text('/koszyk.html'),confirmed=confirmMlazienkaCart(cart,count,product.priceGrosze);
 return{raw,product,cart,stock:confirmed.stock};
}
export async function readMlazienkaProduct(source:RetailSource,fetchImpl:typeof fetch):Promise<RetailObservation>{
 const current=await nativeCart(source,1,new AnonymousShop(origin,fetchImpl,AbortSignal.timeout(15000),8));
 return{...current.product,...(current.stock===undefined?{}:{stockPackages:current.stock}),evidenceSha256:createHash('sha256').update(current.raw+current.cart).digest('hex')};
}
export async function quoteMlazienka(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 if(order.store!=='mŁazienka'||order.lines.length!==1||order.lines[0].unit!=='szt'||order.lines[0].packages.length!==1)throw Error('invalid_basket');
 const pack=order.lines[0].packages[0],source=RETAIL_SOURCES.find(s=>s.id===pack.offerId&&s.id===sourceId);
 if(!source||pack.packageSize!==1||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<=0||!Number.isSafeInteger(order.materialsGrosze)||order.materialsGrosze!==pack.count*pack.unitPriceGrosze)throw Error('invalid_basket');
 const client=new AnonymousShop(origin,fetchImpl,AbortSignal.timeout(20000),12),current=await nativeCart(source,pack.count,client);
 if(current.product.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
 const updated=JSON.parse(await client.mlazienka('select',pack.count));
 if(updated.cart_quantity!==pack.count||typeof updated.summary!=='string')throw Error('basket_not_confirmed');
 const cart=await client.text('/koszyk.html'),selected=confirmMlazienkaCart(cart,pack.count,pack.unitPriceGrosze,true),costGrosze=selected.costGrosze!;
 confirmMlazienkaSummary(updated.summary,order.materialsGrosze,costGrosze);
 // Scope is Poland: no postcode, address, contact fields or final order sent.
 // source: https://www.mlazienka.pl/koszty-dostawy
 const policy=cleanHtml(await client.text('/koszty-dostawy')),policyText=htmlText(policy);
 if(!/Produkty średnie Umywalki Miski WC Stelaże podtynkowe Zlewozmywaki Przesyłka kurierska 0 , 00 zł/.test(policyText)||!policyText.includes('Koszt dostawy zagranicznej jest uzależniony od różnych czynników i jest obliczany indywidualnie.'))throw Error('no_home_delivery');
 const now=new Date();return{quote:{costGrosze,carrier:'Kurier (bez wniesienia)',payment:'Przelew zwykły',checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:origin+'/koszyk.html',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:createHash('sha256').update(current.raw+cart+JSON.stringify(updated)+policy).digest('hex')}};
}
