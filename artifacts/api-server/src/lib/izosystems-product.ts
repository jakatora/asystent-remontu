import {parsePriceToGrosze} from '@workspace/price-collector';
import type {RetailSource} from './retail-pages';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';
import {classElements,exactlyOne} from './prestashop-product';

export const IZOSYSTEMS_ORIGIN='https://izosystems.pl';
export const IZOSYSTEMS_PRODUCT_URL=IZOSYSTEMS_ORIGIN+'/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html';
export const izoAttrs=(node:string)=>htmlAttributes(node.match(/^<[^>]+>/)?.[0]??'');
export const izoOne=exactlyOne;
export function izoMoney(text:unknown,numeric:unknown):number {
 if(typeof text!=='string'||typeof numeric!=='number'||!Number.isFinite(numeric))throw Error('invalid_money');
 const match=text.replace(/[\s\u00a0]/g,'').match(/^(\d+),(\d{2})zł$/),cents=match?Number(match[1])*100+Number(match[2]):NaN;
 if(!Number.isSafeInteger(cents)||cents<0||Math.abs(numeric*100-cents)>0.00001)throw Error('invalid_money');return cents;
}
export function readIzosystemsState(html:string):any {
 const matches=[...html.matchAll(/var prestashop = ([^\r\n]+);/g)];
 if(matches.length!==1)throw Error('cart_session_not_confirmed');
 const value=JSON.parse(matches[0][1]);
 if(value.currency?.iso_code!=='PLN'||value.shop?.name!=='Izosystems.pl'||value.customer?.is_logged!==false)throw Error('cart_session_not_confirmed');
 return value;
}

/** Bind the primary purchase form to its own barcode, gross roll price and
 * stock. The gallery also contains old 70mm photos; only the selected90mm
 * image is accepted. Native unit_price is not the purchase price of a30m roll.
 * source: https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html
 */
export function readIzosystemsProduct(html:string,source:RetailSource) {
 if(source.id!=='izosystems-sws-inside90-30m'||source.store!=='Izosystems'||source.url!==IZOSYSTEMS_PRODUCT_URL||source.productId!==1783||source.retailerSku!=='135633'||source.ean!=='5411183151178'||source.packageSize!==30||source.unit!=='m'||source.apiPurchaseUnit!=='szt.'||source.brand!=='Soudal')throw Error('retailer_unit_not_confirmed');
 const safe=cleanHtml(html),product=izoOne(htmlElements(safe,a=>a.id==='main-product-wrapper'&&a.itemtype==='https://schema.org/Product'),'product_identity_ambiguous');
 const byId=(id:string)=>izoOne(htmlElements(product,a=>a.id===id),'product_identity_ambiguous');
 const detail=byId('product-details'),data=JSON.parse(izoAttrs(detail)['data-product']);
 const name=htmlText(izoOne(htmlElements(product,(_a,t)=>t==='h1'),'product_name_ambiguous'));
 const prices=izoOne(classElements(product,'product-prices'),'product_price_ambiguous');
 const labelled=(cls:string)=>htmlText(izoOne(classElements(prices,cls),'product_identity_ambiguous'));
 if(data.id!==1783||data.id_product!==1783||String(data.id_product_attribute)!=='0'||data.reference!=='135633'||data.name!==name||data.link!==source.url||labelled('product-ean13')!=='EAN: '+source.ean||labelled('product-reference')!=='Indeks: '+source.retailerSku)throw Error('product_identity_mismatch');
 if(!/Soudal SWS Basic Plus Inside 90mm x 30m$/.test(name)||izoAttrs(izoOne(htmlElements(product,a=>a.itemprop==='brand'),'product_brand_ambiguous')).content!=='SOUDAL')throw Error('product_variant_mismatch');
 if(data.available_for_order!=='1'||data.allow_oosp!==0||!Number.isSafeInteger(data.quantity)||data.quantity<1||data.quantity_all_versions!==data.quantity)throw Error('retailer_out_of_stock');
 if(!['Przedmiot','Przedmioty','Przedmiotów'].includes(data.quantity_label)||htmlText(detail)!=='W magazynie '+data.quantity+' '+data.quantity_label||data.minimal_quantity!==1||data.is_virtual!=='0'||data.pack!==0||!Array.isArray(data.packItems)||data.packItems.length||data.customization_required||data.is_customizable)throw Error('purchase_rules_changed');
 if(data.on_sale!=='0'||!Array.isArray(data.specific_prices)||data.specific_prices.length||data.customer_group_discount!==0||data.quantity_discounts?.length||data.price_without_reduction!==data.price)throw Error('conditional_price_not_supported');
 const offer=izoOne(htmlElements(prices,a=>a.itemprop==='offers'&&a.itemtype==='https://schema.org/Offer'),'product_offer_ambiguous');
 const prop=(key:string)=>izoOne(htmlElements(offer,a=>a.itemprop===key),'product_price_ambiguous');
 const priceNode=prop('price'),priceGrosze=izoMoney(htmlText(priceNode).replace(/ \/ szt\.$/,''),data.price);
 if(priceGrosze<=0||parsePriceToGrosze(izoAttrs(priceNode).content)!==priceGrosze||izoAttrs(prop('priceCurrency')).content!=='PLN'||izoAttrs(prop('availability')).href!=='https://schema.org/InStock'||htmlText(izoOne(classElements(prices,'tax-shipping-delivery-label'),'product_tax_ambiguous'))!=='Brutto')throw Error('retailer_gross_price_mismatch');
 const form=byId('add-to-cart-or-refresh'),action=izoAttrs(form);
 if(action.action!==IZOSYSTEMS_ORIGIN+'/koszyk-zakupow'||action.method!=='post')throw Error('invalid_cart_route');
 const input=(name:string)=>izoAttrs(izoOne(htmlElements(form,(a,t)=>t==='input'&&a.name===name),'product_form_ambiguous'));
 if(input('id_product').value!=='1783'||input('id_customization').value!=='0'||input('qty').min!=='1'||input('qty').step!=='1')throw Error('purchase_rules_changed');
 const button=izoOne(htmlElements(form,(a,t)=>t==='button'&&a['data-button-action']==='add-to-cart'),'product_form_ambiguous');
 if(/\bdisabled\b/.test(button.match(/^<[^>]+>/)?.[0]??''))throw Error('retailer_out_of_stock');
 const token=input('token').value;if(!/^[a-f\d]{32}$/i.test(token??''))throw Error('cart_session_not_confirmed');
 const photo=izoAttrs(izoOne(htmlElements(product,(a,t)=>t==='img'&&a.itemprop==='image'&&Boolean(a.src)&&a.content===a.src),'product_image_not_confirmed'));
 const imageUrl=photo.src;
 if(!imageUrl?.startsWith(IZOSYSTEMS_ORIGIN+'/10544-large_default/')||!imageUrl.endsWith('/'+new URL(source.url).pathname.split('/').pop()!.replace(/^\d+-/,'').replace('.html','.jpg'))||!/INSIDE 90mm x 30m\.$/.test(photo.alt??''))throw Error('product_image_not_confirmed');
 return{product:{'@type':'Product',name,brand:'Soudal',gtin13:source.ean,image:imageUrl,offers:{'@type':'Offer',price:priceGrosze/100,priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}},priceGrosze,maxPackages:data.quantity,imageUrl,name,token};
}
