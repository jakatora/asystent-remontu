import {createHash} from 'node:crypto';
import type {RetailSource} from './retail-pages';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {confirmDekoratorSummary} from './dekorator';
import {AnonymousShop,MAX_RETAIL_PACKAGES} from './retailer-http';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';

import {ALNAR_SOURCE,confirmAlnarSource} from './alnar-source';
export {ALNAR_SOURCE} from './alnar-source';
const origin='https://alnar.pl',sourceId=ALNAR_SOURCE.id;
const one=(values:string[],reason='basket_not_confirmed')=>{if(values.length!==1)throw Error(reason);return values[0];};
const attrs=(node:string)=>htmlAttributes(node.match(/^<[^>]+>/)?.[0]??'');
const cls=(a:Record<string,string>,n:string)=>a.class?.split(/\s+/).includes(n)??false;
const element=(html:string,id:string)=>one(htmlElements(html,a=>a.id===id));
const has=(html:string,name:string)=>new RegExp('\\s'+name+'(?:\\s|=|>)').test(html.match(/^<[^>]+>/)?.[0]??'');
const amount=(html:string)=>{
 const text=htmlText(html).replace(/\u00a0/g,' '),m=text.match(/^([\d ]+),(\d{2}) zł$/);
 if(!m)throw Error('basket_not_confirmed');const n=Number(m[1].replace(/ /g,''))*100+Number(m[2]);if(!Number.isSafeInteger(n))throw Error('basket_not_confirmed');return n;
};
/** One retail unit is one original Wolfcraft 6931000 installation kit, not 22 kits.
 * Exact GTIN/MPN and the native one-piece integer purchase form are required.
 * source: https://alnar.pl/wolfcraft-zestaw-do-montazu-paneli-p-6949.html
 * source: https://shop.wolfcraft.com/en-ua/products/p_6931_laminatelayingset */
export function readAlnarProduct(raw:string,source:RetailSource):Record<string,any>{
 confirmAlnarSource(source);const html=cleanHtml(raw),product=element(html,'RamkaProduktu');
 if(attrs(product).itemtype!=='https://schema.org/Product')throw Error('product_identity_not_confirmed');
 const prop=(scope:string,name:string)=>{const node=one(htmlElements(scope,a=>a.itemprop===name));return attrs(node).content??htmlText(node);};
 const name=htmlText(one(htmlElements(product,(_a,t)=>t==='h1'))),ean=prop(element(product,'KodEan'),'gtin13');
 const brand=prop(one(htmlElements(product,a=>a.itemprop==='brand')),'name');
 if(name!==source.name||ean!==source.ean||brand!=='WOLFCRAFT'||prop(product,'mpn')!=='WF6931000'||prop(product,'productID')!=='6949')throw Error('product_identity_not_confirmed');
 if(htmlText(element(product,'Dostepnosc'))!=='Dostępność: Dostępny')throw Error('retailer_out_of_stock');
 const offer=one(htmlElements(product,a=>a.itemprop==='offers'));
 if(attrs(offer).itemtype!=='https://schema.org/Offer'||prop(offer,'priceCurrency')!=='PLN'||prop(offer,'url')!==source.url||prop(offer,'availability')!=='https://schema.org/InStock')throw Error('retailer_out_of_stock');
 const price=one(htmlElements(offer,a=>a.itemprop==='price')),gross=amount(price),declared=attrs(price).content;
 if(!/^\d+\.\d{2}$/.test(declared??'')||Math.round(Number(declared)*100)!==gross||htmlText(element(product,'CenaGlownaProduktuBrutto'))!=='Cena brutto: '+htmlText(price))throw Error('retailer_gross_price_mismatch');
 const meta=(name:string)=>attrs(one(htmlElements(html,(a,t)=>t==='meta'&&a.property===name))).content;
 if(meta('product:price:currency')!=='PLN'||meta('product:retailer_item_id')!=='6949'||meta('product:availability')!=='in stock'||meta('og:url')!==source.url||meta('product:price:amount')!==declared)throw Error('product_identity_not_confirmed');
 const image=meta('og:image');if(image!==ALNAR_SOURCE.imageUrl)throw Error('product_identity_not_confirmed');
 const deposit=element(product,'CenaKaucja');
 if((attrs(deposit).style??'').replace(/\s/g,'')!=='display:none'||htmlText(deposit)!=='+ kaucja')throw Error('purchase_rules_changed');
 const quantity=attrs(one(htmlElements(element(product,'FormKartaProduktu'),(a,t)=>t==='input'&&a.name==='ilosc')));
 if(!/^ilosc_\d+_6949$/.test(quantity.id??'')||quantity.min!=='1'||quantity.step!=='1'||quantity.value!=='1')throw Error('purchase_rules_changed');
 const variant=attrs(element(product,'InputWybraneCechy_'+quantity.id.replace('ilosc_','')));
 if(variant.value!=='')throw Error('purchase_rules_changed');
 return{'@type':'Product',name,brand,mpn:'WF6931000',gtin13:ean,image,offers:{'@type':'Offer',price:declared,priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}};
}

export function confirmAlnarCart(raw:string,count:number,packPrice:number):number{
 const html=cleanHtml(raw),cart=element(html,'TrescKoszyka'),source=ALNAR_SOURCE;
 const table=one(htmlElements(cart,(a,t)=>t==='table'&&cls(a,'Koszyk'))),rows=htmlElements(table,(_a,t)=>t==='tr').filter(n=>htmlElements(n,(a,t)=>t==='input'&&cls(a,'InputPrzeliczKoszyk')).length);
 const row=one(rows),input=attrs(one(htmlElements(row,(a,t)=>t==='input'&&cls(a,'InputPrzeliczKoszyk'))));
 if(!/^ilosc_\d+_6949$/.test(input.id??'')||Number(input.value)!==count||input.min!=='1'||input.step!=='1')throw Error('basket_not_confirmed');
 if(htmlElements(table,(a,t)=>t==='input'&&cls(a,'InputPrzeliczKoszyk')).length!==1)throw Error('basket_not_confirmed');
 const link=one(htmlElements(one(htmlElements(row,(_a,t)=>t==='h3')),(_a,t)=>t==='a'));
 if(attrs(link).href!==source.url||htmlText(link)!==source.name)throw Error('basket_not_confirmed');
 const grossAmount=(scope:string)=>{
  const gross=one(htmlElements(scope,a=>cls(a,'Brutto'))),label=one(htmlElements(gross,(_a,t)=>t==='small'));
  if(htmlText(label)!=='brutto'||!htmlText(gross).endsWith(' brutto'))throw Error('retailer_gross_price_mismatch');
  return amount(htmlText(gross).slice(0,-7));
 };
 // This storefront renders both gross and net in each price cell. Select the
 // explicitly labelled gross amount; never use the lower net figure.
 const prices=htmlElements(row,a=>cls(a,'Cena'));
 if(prices.length!==2||grossAmount(prices[0])!==packPrice||grossAmount(prices[1])!==packPrice*count)throw Error('price_changed');
 if(grossAmount(one(htmlElements(table,a=>cls(a,'Suma'))))!==packPrice*count)throw Error('basket_not_confirmed');
 const country=element(cart,'kraj_dostawy'),countries=htmlElements(country,(_a,t)=>t==='option').filter(n=>has(n,'selected'));
 if(attrs(one(countries)).value!=='PL'||htmlText(countries[0])!=='Polska')throw Error('no_home_delivery');
 const checked=(name:string)=>{
  const node=one(htmlElements(cart,(a,t)=>t==='input'&&a.type==='radio'&&a.name===name).filter(n=>has(n,'checked')),'no_home_delivery');
  if(has(node,'disabled'))throw Error('no_home_delivery');return attrs(node);
 };
 const shipping=checked('rodzaj_wysylki'),payment=checked('rodzaj_platnosci');
 if(shipping.id!=='rodzaj_wysylki_14'||shipping.value!=='14'||shipping.wysylka!=='wysylka_standard'||payment.id!=='rodzaj_platnosci_1'||payment.value!=='1'||payment.wysylka!=='platnosc_przelew')throw Error('no_home_delivery');
 for(const [id,label]of [[shipping.id,'Kurier po przedpłacie'],[payment.id,'Przelew bankowy']]){
  const node=one(htmlElements(cart,(a,t)=>t==='label'&&a.for===id));if(attrs(node)['aria-label']!==label||htmlText(one(htmlElements(node,a=>cls(a,'RodzajNazwa'))))!==label)throw Error('no_home_delivery');
 }
 if(htmlElements(cart,(a,t)=>t==='input'&&a.type==='checkbox').some(n=>has(n,'checked')))throw Error('basket_not_confirmed');
 // Keep the selected courier fee and bank-payment fee scoped to their
 // shipping/payment container so an empty payment fee cannot mean free freight.
 const cost=confirmDekoratorSummary(element(cart,'podsumowanie_zamowienia'),packPrice*count),rate=htmlText(element(element(cart,'rodzaj_wysylki'),'CenaWysylki14'));
 const paymentFee=htmlText(element(element(cart,'rodzaj_platnosci'),'CenaWysylki1'));if(paymentFee!==''&&amount(paymentFee)!==0)throw Error('no_home_delivery');
 if(cost>0?amount(rate)!==cost:rate!=='')throw Error('no_home_delivery');
 // The real selected cart is free only above the reviewed PL threshold. An
 // empty carrier label alone must never become a zero-charge quotation.
 // source: https://alnar.pl/koszyk.html (reviewed 2026-11-02)
 if(cost===0&&packPrice*count<=29900)throw Error('no_home_delivery');return cost;
}

function token(script:string,route:string):string{
 const match=script.match(new RegExp('["\x27](inne/'+route+'\\.php\\?tok=([a-z0-9]{8,48}))["\x27]'));
 if(!match)throw Error('purchase_rules_changed');return match[2];
}
export async function quoteAlnar(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 if(order.store!=='ALNAR'||order.lines.length!==1||order.lines[0].unit!=='szt'||order.lines[0].packages.length!==1)throw Error('invalid_basket');
 const pack=order.lines[0].packages[0],source=(pack.offerId===sourceId?ALNAR_SOURCE:undefined);
 if(!source||pack.store!==source.store||pack.url!==source.url||pack.packageSize!==1||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<1||!Number.isSafeInteger(order.materialsGrosze)||order.materialsGrosze!==pack.count*pack.unitPriceGrosze)throw Error('invalid_basket');
 const client=new AnonymousShop(origin,fetchImpl,AbortSignal.timeout(20000),16),raw=await client.text(source.url),product=readAlnarProduct(raw,source);
 if(Math.round(Number(product.offers.price)*100)!==pack.unitPriceGrosze)throw Error('price_changed');
 const script=await client.text('/javascript/skrypty.php');
 const check=JSON.parse(await client.alnar('check',token(script,'do_koszyka_ilosc'),pack.count));
 if(!Array.isArray(check)||check.length!==1||check[0]?.nazwa!==source.name||check[0].komunikat!==''||check[0].ilosc!==''||check[0].id_inputa!=='')throw Error('insufficient_stock');
 await client.alnar('add',token(script,'do_koszyka'),pack.count);
 await client.text('/koszyk.html');const cartJs=await client.text('/javascript/koszyk.php');
 await client.alnar('country',token(cartJs,'zmiana_kraju'));
 const shipment=JSON.parse(await client.alnar('shipping',token(cartJs,'zmiana_wysylki')));
 const payment=JSON.parse(await client.alnar('payment',token(cartJs,'zmiana_platnosci')));
 if(shipment?.przycisk_zamow!==true||shipment.kupon!=='nie'||typeof shipment.podsumowanie!=='string'||typeof payment?.podsumowanie!=='string'||payment.kupon!=='nie')throw Error('basket_not_confirmed');
 const cart=await client.text('/koszyk.html'),costGrosze=confirmAlnarCart(cart,pack.count,pack.unitPriceGrosze);
 if(confirmDekoratorSummary(shipment.podsumowanie,order.materialsGrosze)!==costGrosze||confirmDekoratorSummary(payment.podsumowanie,order.materialsGrosze)!==costGrosze)throw Error('basket_not_confirmed');
 if(typeof shipment.wysylka_free!=='string')throw Error('purchase_rules_changed');
 if(order.materialsGrosze<=29900){
  const remaining=((29900-order.materialsGrosze)/100).toFixed(2).replace('.',',');
  if(htmlText(shipment.wysylka_free)!=='Zamówienia powyżej 299,00 zł są wysyłane na nasz koszt na terenie Polski. Do darmowej wysyłki brakuje Ci: '+remaining+' zł')throw Error('purchase_rules_changed');
 }else if(htmlText(shipment.wysylka_free)!=='')throw Error('purchase_rules_changed');
 const now=new Date();return{quote:{costGrosze,carrier:'Kurier po przedpłacie',payment:'Przelew bankowy',checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:origin+'/koszyk.html',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:createHash('sha256').update(raw+cart+JSON.stringify([check,shipment,payment])).digest('hex')}};
}
