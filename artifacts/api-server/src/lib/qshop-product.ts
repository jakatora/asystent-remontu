import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {AnonymousShop} from './retailer-http';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';
import type {RetailSource} from './retail-pages';

export const TOKMET_ORIGIN='https://sklep.tokmet.pl';
export const TOKMET_URL=TOKMET_ORIGIN+'/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i';
export const TOKMET_NAME='WĘŻYK DO BATERII STOJĄCEJ 3/8" x M10*1 L - 30 CM DŁUGA KOŃCÓWKA';
const one=(rows:string[],reason:string)=>{if(rows.length!==1)throw Error(reason);return rows[0];};
const attrs=(el:string)=>htmlAttributes(el.match(/^<[^>]+>/)?.[0]??'');
const text=(el:string)=>htmlText(el).replace(/&#47;/g,'/');
const money=(el:string)=>{const amount=text(el).match(/^([\d ,.]+)\s*zł$/)?.[1],value=amount?parsePriceToGrosze(amount):null;if(!value||!Number.isSafeInteger(value))throw Error('retailer_gross_price_not_confirmed');return value;};

/** Reviewed manufacturer-part crosswalk; TOK-MET does not publish a barcode.
 * Its own listing binds item 2806 to WS-20-030-G. Invena's exact model 3559
 * confirms 30 cm, 3/8 GW x M10, long WS-20 end (not the short WS-21).
 * Independent primary seller CS Megastore binds WS-20-030 to EAN 5907798716258.
 * A conflicting barcode from CentroBud is deliberately not imported/overridden.
 * source: https://invena.pl/produkt/wezyk-do-bat-w-opl-stal-3-8-dl-konc-30cm-3559
 * source: https://api.invena.pl/storage/7748/Katalog-Instalacje-2025-Invena.pdf (p.60)
 * source: https://www.csmegastore.se/i/5469388/invena-anslutningsslang-f%C3%B6r-kranar-l%C3%A5ng-%C3%A4nde-3-8-x-m10-ws-20-030
 * source: https://sklep.tokmet.pl/94,wezyki_w_oplocie_stalowym.html
 */
function review(source:RetailSource){
 if(source.format!=='qshop'||source.id!=='tokmet-invena-ws20-030'||source.store!=='TOK-MET'||source.productId!==2806||source.retailerSku!=='WS-20-030-G'||source.ean!=='5907798716258'||source.brand!=='Invena'||source.name!==TOKMET_NAME||source.url!==TOKMET_URL||source.packageSize!==1||source.unit!=='szt'||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1)throw Error('product_identity_not_confirmed');
}
export function inspectTokmetProduct(listHtml:string,cardHtml:string,source:RetailSource){
 review(source);const list=cleanHtml(listHtml),card=cleanHtml(cardHtml);
 if(!text(card).includes('Obecna waluta: PL'))throw Error('retailer_currency_not_confirmed');
 const row=one(htmlElements(list,(_a,tag)=>tag==='figure').filter(el=>htmlElements(el,a=>a.class==='rwd-item-name'&&/\-2806i$/.test(a.href??'')).length),'product_identity_not_confirmed');
 if(text(one(htmlElements(row,a=>a.class==='rwd-product-list-sign'),'product_identity_not_confirmed'))!=='Symbol: WS-20-030-G')throw Error('product_identity_not_confirmed');
 const anchor=one(htmlElements(row,a=>a.class==='rwd-item-name'),'product_identity_not_confirmed');
 if(new URL(attrs(anchor).href,TOKMET_ORIGIN).href!==source.url||text(anchor)!==source.name)throw Error('product_variant_mismatch');
 if(text(one(htmlElements(card,(_a,t)=>t==='h1'),'product_identity_not_confirmed'))!==source.name.replace('3/8"','3/8'))throw Error('product_variant_mismatch');
 if(htmlElements(card,(a,t)=>t==='a'&&a.href==='invena-INVENA.html').map(text).join('|')!=='INVENA')throw Error('product_brand_not_confirmed');
 const id=one(htmlElements(card,a=>a.id==='product-cart-itemId'),'product_identity_not_confirmed');if(attrs(id).value!=='2806')throw Error('product_identity_not_confirmed');
 if(!htmlElements(card,(_a,t)=>t==='button').some(el=>attrs(el).onclick==="dynamic_cart.add_content('2806');"&&text(el)==='shopping_cart Dodaj do koszyka'))throw Error('product_form_not_confirmed');
 const priceGrosze=money(one(htmlElements(card,a=>a.id==='product_price_simple_brutto1'),'retailer_gross_price_not_confirmed'));
 if(money(one(htmlElements(row,a=>a.class==='product_price_simple'),'retailer_gross_price_not_confirmed'))!==priceGrosze||parsePriceToGrosze(attrs(one(htmlElements(card,a=>a.id==='product-cart-price'),'retailer_gross_price_not_confirmed')).value)!==priceGrosze)throw Error('retailer_gross_price_mismatch');
 if(!/^VAT: 23 % - [\d .]+ zł netto$/.test(text(one(htmlElements(card,a=>a.class==='rwd_show_item_price_netto'),'retailer_gross_price_not_confirmed'))))throw Error('retailer_gross_price_not_confirmed');
 const stock=text(one(htmlElements(row,a=>a.class==='rwd-avl-b'),'retailer_stock_not_confirmed')).match(/^Dostępność: (\d+) szt\.$/)?.[1];
 if(!stock||Number(stock)<1)throw Error('retailer_out_of_stock');
 if(text(one(htmlElements(card,a=>a.id==='rwd-avl'),'retailer_stock_not_confirmed'))!==`Dostępność: ${stock} szt. Dostępne natychmiast!`)throw Error('retailer_stock_not_confirmed');
 const image=one(htmlElements(card,(a,t)=>t==='img'&&a.id==='picture'),'product_photo_not_confirmed'),imageUrl=new URL(attrs(image).src,TOKMET_ORIGIN).href;
 if(new URL(imageUrl).origin!==TOKMET_ORIGIN||!imageUrl.includes('pic81087437639.jpg'))throw Error('product_photo_not_confirmed');
 return{priceGrosze,stock:Number(stock),imageUrl};
}

export function confirmTokmetCart(html:string,priceGrosze:number){
 const safe=cleanHtml(html),quantities=htmlElements(safe,a=>/^qty\[/.test(a.id??'')),ids=htmlElements(safe,a=>/^cart_qty_type\[/.test(a.id??''));
 if(quantities.length!==1||attrs(quantities[0]).id!=='qty[1]'||attrs(quantities[0]).value!=='1'||!/^cart_operate\.UpdateQty\(event,'1','2806','\d+'\)$/.test(attrs(quantities[0]).onkeyup??'')||ids.length!==1||attrs(ids[0]).id!=='cart_qty_type[2806]'||attrs(ids[0]).value!=='0')throw Error('basket_not_confirmed');
 const links=htmlElements(safe,(a,t)=>t==='a'&&a.href==='cart.php?action=remove_item&id=2806');if(links.length!==1)throw Error('basket_not_confirmed');
 const prices=htmlElements(safe,a=>a.class==='step3_data').map(text).filter(s=>/^\d[\d ,.]*zł$/.test(s));
 if(prices.length!==2||prices.some(value=>money(value)!==priceGrosze)||money(one(htmlElements(safe,a=>a.class==='simple_cart_step_1_sum_netto'),'basket_not_confirmed'))!==priceGrosze)throw Error('retailer_gross_price_mismatch');
 if(!text(safe).includes(TOKMET_NAME)||!htmlElements(safe,a=>a.id==='submit'&&a.onclick==="__cart_form.Send('buyall.php')").length)throw Error('basket_not_confirmed');
}

// Only the shop's isolated first cart step. Never submits customer data, agrees
// to terms or follows buyall into an order. Sidebar shipping fees are not quotes.
// source: https://sklep.tokmet.pl/_js/_main_functions.js?version=1.0.0
export async function readTokmetProduct(source:RetailSource,fetchImpl:typeof fetch){
 review(source);const client=new AnonymousShop(TOKMET_ORIGIN,fetchImpl,AbortSignal.timeout(15000),8,'iso-8859-2');
 const list=await client.text('/94,wezyki_w_oplocie_stalowym.html'),card=await client.text(source.url),current=inspectTokmetProduct(list,card,source);
 const empty=await client.text('/cart.php');if(!text(cleanHtml(empty)).includes('Twój koszyk jest pusty')||htmlElements(empty,a=>/^qty\[|^cart_qty_type\[/.test(a.id??'')).length)throw Error('basket_not_confirmed');
 // The add response contains a stale promotional amount unrelated to the
 // basket. Only the subsequent whole cart confirms the actual gross price.
 const added=await client.text('/_dynamic_cart.php?action=add&itemId=2806&qty=1&dbv=&view_only_price=false'),cart=await client.text('/cart.php');confirmTokmetCart(cart,current.priceGrosze);
 return{product:{'@type':'Product',name:source.name,gtin13:source.ean,brand:source.brand,image:current.imageUrl,offers:{'@type':'Offer',price:(current.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}},evidenceSha256:createHash('sha256').update(JSON.stringify([list,card,empty,added,cart])).digest('hex')};
}
