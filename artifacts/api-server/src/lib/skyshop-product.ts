import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';
import type {RetailSource} from './retail-pages';
import {AnonymousShop} from './retailer-http';

export const MATBUD_ORIGIN='https://centrummatbud.pl';
export const MATBUD_URL=MATBUD_ORIGIN+'/Styropian-elewacyjny-10-cm-Yetico-Gamma-Fasada-044-3m2-op-p96729';
export const MATBUD_NAME='Styropian elewacyjny 10 cm Yetico Gamma Fasada 044 3m2/op';
export const MATBUD_PRODUCER='YETICO - PRODECENT SYSTEMU DOCIEPLEŃ';
export const MATBUD_PASSIVE_URL=MATBUD_ORIGIN+'/Styropian-grafitowy-15cm-Yetico-Gama-Passive-Fasada-033-p131345';
export const MATBUD_PASSIVE_NAME='Styropian grafitowy 15cm Yetico Gama Passive Fasada 033';
const reviews=[
 {id:96729,url:MATBUD_URL,name:MATBUD_NAME,ean:'5902578301976',sku:'FASADA 044 10CM',area:3,nativePerPack:1,nativeUnit:'OP',precision:1,color:'biały',lambda:'0,044',thickness:10,boards:6,photo:'241757'},
 {id:131345,url:MATBUD_PASSIVE_URL,name:MATBUD_PASSIVE_NAME,ean:'5902578307268',sku:'FASADA 033 15CM',area:2,nativePerPack:2,nativeUnit:'M2',precision:2,color:'grafitowy',lambda:'0,033',thickness:15,boards:4,photo:'307747'},
] as const;
export function skyshopReview(id:number|undefined){const review=reviews.find(row=>row.id===id);if(!review)throw Error('product_identity_not_confirmed');return review;}
export function reviewedSkyshopSource(source:RetailSource){
 const review=skyshopReview(source.productId);
 if(source.format!=='skyshop'||source.store!=='Centrum Matbud'||source.url!==review.url||source.ean!==review.ean||source.brand!=='Yetico'||source.name!==review.name||source.retailerSku!==review.sku||source.packageSize!==review.area||source.unit!=='m2')throw Error('product_identity_not_confirmed');
 if(source.minimumPackages!==50||(source.purchaseMultiple??1)!==1)throw Error('purchase_rules_changed');
 return review;
}
export interface SkyshopExpectedLine {productId:number;count:number;unitPriceGrosze:number;itemId?:string}
const only=(values:string[],reason:string)=>{if(values.length!==1)throw Error(reason);return values[0];};
const attribute=(element:string,key:string)=>htmlAttributes(element.match(/^<[^>]+>/)?.[0]??'')[key];
const amount=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0;
const price=(value:any)=>{
 const number=parsePriceToGrosze(value?.gross),display=parsePriceToGrosze(String(value?.grossDisplay??'').replace(/\s*zł$/,''));
 if(value?.currency!=='PLN'||value.tax?.percent!==23||!number||!Number.isSafeInteger(number)||number!==display)throw Error('retailer_gross_price_not_confirmed');
 return number;
};

/** Reviewed manufacturer crosswalk, not a barcode read from this shop.
 * Manufacturer EAN table p.32 row682: 5902578301976 = GAMMA FASADA10x50x100.
 * The current Polish technical card p.4 distinguishes 100mm smooth packs
 * (6 boards,0.3m3,3m2) from milled packs (0.287m3,2.87m2). The shop's exact
 * pack facts AND native 50OP=15m3 rule identify the former. Generic text about
 * both edge types cannot replace any of these required physical facts.
 * source: https://yetico.com/wp-content/uploads/2026/01/ecommerce_regulamin-programu-motywacyjnego_jubileuszowa-ekstraklasa-yetico_aktualizacja.pdf
 * source: https://yetico.com/wp-content/uploads/2022/06/karta_tech_gamma_fasada_pl.pdf
 * Passive: manufacturer EAN table p.34 row752 distinguishes smooth 15cm
 * 5902578307268 from milled 5902578307442 (row769). Current technical card
 * p.5: 4 boards,0.3m3,2m2 versus milled 0.287m3,1.91m2. The retailer sells
 * native M2 in increments of 2, minimum100: one physical pack is two native
 * units. Confirm native unit prices and cart gross before converting to packs.
 * source: https://yetico.com/wp-content/uploads/2022/09/karta_tech_gamma_passive_fasada.pdf
 */
export function inspectSkyshopProduct(html:string,api:any,parameters:any,source:RetailSource){
 const review=reviewedSkyshopSource(source),minimum=50*review.nativePerPack;
 const safe=cleanHtml(html),heading=only(htmlElements(safe,a=>a.id==='product-name-information'),'product_identity_not_confirmed');
 if(htmlText(heading)!==review.name)throw Error('product_identity_not_confirmed');
 const add=only(htmlElements(safe,a=>a['data-cy']==='addToCartButton'&&a['aria-label']==='Dodaj do koszyka'),'product_form_not_confirmed');
 if(attribute(add,'data-product-id')!==String(review.id))throw Error('product_form_not_confirmed');
 const producer=only(htmlElements(safe,(_a,tag)=>tag==='a').filter(el=>attribute(el,'href')==='/YETICO-PRODECENT-SYSTEMU-DOCIEPLEN/pr/982'),'product_manufacturer_not_confirmed');
 if(!htmlText(producer).includes(MATBUD_PRODUCER))throw Error('product_manufacturer_not_confirmed');
 const description=only(htmlElements(safe,a=>a.id==='product_description'),'product_variant_mismatch');
 const facts=htmlElements(description,(_a,tag)=>tag==='li').map(htmlText);
 for(const fact of ['skład: polistyren','kolor: '+review.color,'lambda: '+review.lambda+' W/mK','grubość płyty: '+review.thickness+' cm','wymiar płyty: 100 x 50 cm','ilość płyt w opakowaniu: '+review.boards+' szt','objętość opakowania: 0,3 m3','powierzchnia płyt: '+review.area+' m2','Euroklasa: E'])if(facts.filter(value=>value===fact).length!==1)throw Error('product_variant_mismatch');
 if(!htmlText(description).includes('Wysyłka GRATIS od 50 paczek w każde dowolne miejsce Polski.'))throw Error('purchase_rules_changed');
 const counter=only(htmlElements(safe,a=>a.id==='product_counter'),'purchase_rules_changed');
 for(const [key,value]of Object.entries({'data-real-min':String(minimum),'data-min':String(minimum),'data-tick':String(review.nativePerPack),'data-boxamount':String(review.nativePerPack),'data-boxrestrict':String(review.nativePerPack),'data-boxrestrict-whole':'true'}))if(attribute(counter,key)!==value)throw Error('purchase_rules_changed');
 if(api?.id!==review.id||api.name!==review.name||api.url!==review.url||api.symbol!==review.sku||api.type!=='product'||api.ean!==null||api.barCode!==null||!Array.isArray(api.setItems)||api.setItems.length)throw Error('product_identity_not_confirmed');
 const native=api.amount;
 if(native?.minAmount!==minimum||native.tick!==review.nativePerPack||native.isBox!==true||native.unit!==review.nativeUnit||api.amountPrecision!==review.precision)throw Error('purchase_rules_changed');
 if(native.availability?.type!=='amount'||!amount(native.availability.amount)||native.availability.amount<minimum||attribute(counter,'data-max')!==String(native.availability.amount))throw Error('retailer_out_of_stock');
 if(!Array.isArray(parameters)||parameters.length!==1||parameters[0].productId!==review.id||parameters[0].symbol!==api.symbol||parameters[0].ean!==null||parameters[0].barCode!==null)throw Error('product_variant_mismatch');
 for(const list of [api.parameters,parameters[0].parameters]){
  if(!Array.isArray(list)||list.length!==1||list[0].id!==20||list[0].type!=='info'||list[0].required!==false||!Array.isArray(list[0].values)||list[0].values.length!==2)throw Error('product_variant_mismatch');
  const minimum=list[0].values.find((value:any)=>value.id===214),free=list[0].values.find((value:any)=>value.id===228);
  if(!minimum?.name.includes('poniżej 50op=15m3')||!free?.name.includes('Styropian DARMOWA WYSYŁKA !')||list[0].values.some((value:any)=>value.changePrice!==0))throw Error('purchase_rules_changed');
 }
 const nativePriceGrosze=price(api.price),priceGrosze=nativePriceGrosze*review.nativePerPack,products:any[]=[];
 if(!Number.isSafeInteger(priceGrosze))throw Error('retailer_gross_price_not_confirmed');
 for(const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{const value=JSON.parse(match[1]);if(value?.['@type']==='Product')products.push(value);}catch{/* Other scripts do not provide identity. */}
 }
 if(products.length!==1)throw Error('product_identity_not_confirmed');
 const product=products[0],offer=product.offers;
 if(product.name!==review.name||product.brand?.name!==MATBUD_PRODUCER||['gtin','gtin13','gtin14'].some(key=>product[key]!==undefined&&product[key]!==source.ean))throw Error('product_identity_not_confirmed');
 if(offer?.['@type']!=='Offer'||offer.priceCurrency!=='PLN'||!/^https?:\/\/schema.org\/InStock$/.test(offer.availability))throw Error('retailer_out_of_stock');
 if(parsePriceToGrosze(offer.price)!==nativePriceGrosze)throw Error('retailer_gross_price_mismatch');
 const imageUrl=new URL(product.image,MATBUD_ORIGIN).href;
 if(new URL(imageUrl).origin!==MATBUD_ORIGIN||!imageUrl.includes(review.photo))throw Error('product_photo_not_confirmed');
 return{priceGrosze,nativePriceGrosze,stock:Math.floor(native.availability.amount/review.nativePerPack),imageUrl,product:{...product,gtin13:source.ean,image:imageUrl,offers:{...offer,price:(priceGrosze/100).toFixed(2),url:source.url}}};
}

export async function readSkyshopProduct(source:RetailSource,client:AnonymousShop){
 reviewedSkyshopSource(source);
 const html=await client.text(source.url),api=await client.skyshop('product',undefined,source.productId),parameters=await client.skyshop('parameters',undefined,source.productId);
 return{...inspectSkyshopProduct(html,api,parameters,source),evidence:[html,api,parameters]};
}

export function confirmSkyshopCart(cart:any,count:number,unitPriceGrosze:number){
 return confirmSkyshopBasket(cart,[{productId:96729,count,unitPriceGrosze}]);
}
export function confirmSkyshopBasket(cart:any,expected:readonly SkyshopExpectedLine[]){
 if(!expected.length||expected.length>reviews.length||new Set(expected.map(row=>row.productId)).size!==expected.length)throw Error('invalid_basket');
 if(cart?.canBuy!==true||!Array.isArray(cart.items)||cart.items.length!==expected.length||cart.discountCode!==null||cart.loyaltyPoints!==null)throw Error('basket_not_confirmed');
 if(!Array.isArray(cart.warnings)||cart.warnings.some((warning:any)=>warning.type!=='MINIMUM_ORDER_PRICE'||warning.context?.minimumPrice!==0))throw Error('basket_not_confirmed');
 let total=0;const seen=new Set<number>();
 for(const item of cart.items){
 const product=item.product,line=expected.find(row=>row.productId===product?.id);
 if(!line||seen.has(line.productId))throw Error('basket_not_confirmed');seen.add(line.productId);
 const review=skyshopReview(line.productId),{count,unitPriceGrosze}=line;
 if(!Number.isSafeInteger(count)||count<50*review.nativePerPack||count%review.nativePerPack||!Number.isSafeInteger(unitPriceGrosze)||unitPriceGrosze<1||!Number.isSafeInteger(count*unitPriceGrosze))throw Error('invalid_basket');
 if(product.name!==review.name||product.symbol!==review.sku||product.producerId!==982||product.producerName!==MATBUD_PRODUCER||product.url!==review.url||item.type!=='ORDINARY_PRODUCT'||!Array.isArray(item.parameters)||item.parameters.length)throw Error('basket_not_confirmed');
 if(item.quantity!==count)throw Error('insufficient_stock');
 if(price(item.unitPriceSummary?.final)!==unitPriceGrosze||price(item.unitPriceSummary?.base)!==unitPriceGrosze||item.unitPriceSummary.discounts?.length||item.priceSummary?.discounts?.length||cart.priceSummary?.discounts?.length)throw Error('price_changed');
 for(const value of [item.priceSummary?.base,item.priceSummary?.final])if(price(value)!==count*unitPriceGrosze)throw Error('price_changed');
 total+=count*unitPriceGrosze;
 }
 // Aggregate cart tax may be null, so verify currency, displayed gross and
 // numeric gross directly without treating the net subtotal as gross.
 for(const value of [cart.priceSummary?.base,cart.priceSummary?.final]){
  if(value?.currency!=='PLN'||parsePriceToGrosze(value.gross)!==total||parsePriceToGrosze(String(value.grossDisplay??'').replace(/\s*zł$/,''))!==total)throw Error('basket_not_confirmed');
 }
 return cart;
}

export const skyshopEvidenceHash=(evidence:unknown[])=>createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
