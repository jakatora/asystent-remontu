import {createHash} from 'node:crypto';
import type {RetailSource} from './retail-pages';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {RETAIL_SOURCES} from './retail-catalog';
import {AnonymousShop,MAX_RETAIL_PACKAGES} from './retailer-http';
import {cleanHtml,htmlElements,htmlAttributes,htmlText} from './retail-microdata';
import {exactlyOne,classElements,prestashopMoney} from './prestashop-product';

export const BMB_ORIGIN='https://bmbtechnologie.pl';
export const BMB_BASKET='/order/basket.html';
const NAME='Środek gruntujący Knauf Grundiermittel 60 15KG';
const URL=BMB_ORIGIN+'/grunty-do-tynkowania/srodek-gruntujacy-knauf-grundiermittel-60-15kg.html';
const one=(nodes:string[])=>exactlyOne(nodes,'basket_not_confirmed');
const cls=(html:string,name:string)=>one(classElements(html,name));
const attr=(html:string)=>htmlAttributes(html.match(/^<[^>]+>/)?.[0]??'');
const byName=(html:string,name:string)=>one(htmlElements(html,(a,t)=>t==='input'&&a.name===name));
const form=(html:string,id:string)=>{
 const node=one(htmlElements(html,(a,t)=>t==='form'&&a.id===id)),a=attr(node);
 if(a.method!=='post'||a.action!==BMB_ORIGIN+BMB_BASKET)throw Error('invalid_cart_route');
 return node;
};
export function reviewedBmbSource(s:RetailSource){
 if(s.id!=='bmb-knauf-grundiermittel60-15kg'||s.store!=='BMB Technologie'||s.format!=='bmb'||s.url!==URL||s.ean!=='5901793357799'||s.retailerSku!==s.ean||s.productId!==5454||s.packageSize!==15||s.unit!=='kg'||s.brand!=='Knauf'||s.apiPurchaseUnit!=='szt.'||s.name!==NAME)throw Error('bmb_source_not_reviewed');
}
// source: https://bmbtechnologie.pl/grunty-do-tynkowania/srodek-gruntujacy-knauf-grundiermittel-60-15kg.html
// The product card calls this "Twoja cena". Confirm gross in the cart before
// publishing an observation. Recommendations cannot supply stock/EAN/price.
export function readBmbProduct(html:string,source:RetailSource){
 reviewedBmbSource(source);
 const primary=one(classElements(cleanHtml(html),'productCardMain'));
 const name=htmlText(cls(primary,'productCardMain__name'));
 const brand=cls(primary,'productCardMain__producer'),brandImage=one(htmlElements(brand,(_a,t)=>t==='img'));
 if(name!==NAME||attr(brand).href!==BMB_ORIGIN+'/knauf/'||attr(brandImage).alt!=='Knauf')throw Error('product_identity_mismatch');
 const info=cls(primary,'productCardMain__infoBlock');
 if(attr(info)['data-id']!=='5454')throw Error('product_id_not_confirmed');
 const param=(name:string)=>htmlText(cls(cls(info,'productParam--'+name),'productParam__value'));
 if(param('symbol')!==source.ean)throw Error('product_ean_not_confirmed');
 const stockMatch=param('availability').match(/^(\d{1,9}) szt\.$/);
 if(!stockMatch)throw Error('retailer_stock_not_confirmed');
 const stock=Number(stockMatch[1]);if(!stock)throw Error('retailer_out_of_stock');
 const input=attr(byName(form(info,'js__productBasketForm'),'add_product[5454]'));
 if(input.type!=='text'||input.value!=='1'||input['data-min']!=='1'||input['data-qip']!=='1'||input['data-max']!==String(stock))throw Error('purchase_rules_changed');
 const priceGrosze=prestashopMoney(param('price'));
 if(priceGrosze<=0)throw Error('invalid_money');
 const image=attr(one(htmlElements(primary,(a,t)=>t==='img'&&a.alt===NAME))).src;
 if(image!==source.imageUrl)throw Error('product_image_not_confirmed');
 return{name,stock,priceGrosze,imageUrl:image};
}

/** Confirm the primary order table, not the duplicated header preview. */
export function confirmBmbBasket(html:string,source:RetailSource,count:number,priceGrosze:number){
 reviewedBmbSource(source);
 if(!Number.isSafeInteger(count)||count<1||count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(priceGrosze)||priceGrosze<=0||!Number.isSafeInteger(count*priceGrosze))throw Error('invalid_basket');
 const safe=cleanHtml(html),table=cls(safe,'order_table'),row=one(classElements(table,'order_product_row'));
 const name=cls(row,'col_name'),link=one(htmlElements(name,(_a,t)=>t==='a'));
 if(attr(link).href!==source.url||htmlText(link)!==NAME+' '+source.ean||htmlText(name)!==NAME+' '+source.ean)throw Error('basket_not_confirmed');
 const input=attr(byName(row,'product[5454]'));
 if(input.value!==String(count)||input['data-qip']!=='1'||input['data-min']!=='1')throw Error('basket_not_confirmed');
 const gross=cls(row,'col_priceg'),value=cls(row,'col_valueg');
 if(attr(gross)['data-th']!=='Cena brutto'||attr(value)['data-th']!=='Wartość brutto')throw Error('retailer_gross_price_not_confirmed');
 if(prestashopMoney(htmlText(gross))!==priceGrosze)throw Error('price_changed');
 const total=count*priceGrosze;
 if(prestashopMoney(htmlText(value))!==total||prestashopMoney(htmlText(one(htmlElements(table,a=>a['data-th']==='Wartość produktów brutto:'))))!==total||prestashopMoney(htmlText(cls(table,'order-sum-with-discount-value')))!==total)throw Error('basket_not_confirmed');
 return{safe,materialsGrosze:total};
}

// source: https://bmbtechnologie.pl/order/basket.html
// This cart advertises a carrier price plus a separate KN-WO pallet amount.
// Require their sum to reconcile with the actual gross payable total. Never
// turn a free-shipping banner, pickup or an unexplained residual into delivery.
export function confirmBmbDelivery(html:string,source:RetailSource,count:number,priceGrosze:number){
 const {safe,materialsGrosze}=confirmBmbBasket(html,source,count,priceGrosze);
 if(htmlText(cls(safe,'order_delivery_country_wrap'))!=='Kraj dostawy Polska - zmień')throw Error('country_not_confirmed');
 const selected=(id:string)=>{
  const f=form(safe,id),inputs=htmlElements(f,(a,t)=>t==='input'&&a.name==='payment_delivery'&&a.checked==='checked');
  if(attr(one(inputs)).value!=='51')throw Error('no_home_delivery');
  return one(htmlElements(f,(_a,t)=>t==='label').filter(n=>htmlElements(n,(a,t)=>t==='input'&&a.name==='payment_delivery'&&a.value==='51').length===1));
 };
 const carrier=selected('delivery'),payment=selected('payment'),pallet=cls(carrier,'delivery_tile_pallet_info');
 if(htmlText(cls(carrier,'order_tile_name').replace(pallet,''))!=='Wysyłka paletowa'||htmlText(cls(payment,'order_tile_name'))!=='Przelewy24.pl')throw Error('no_home_delivery');
 const palletRow=one(htmlElements(pallet,(_a,t)=>t==='li')),match=htmlText(palletRow).match(/^(\d{1,4}) x Paleta KN-WO - (\d{1,6})(?:,(\d{2}))?zł$/);
 if(!match||Number(match[1])<1)throw Error('basket_not_confirmed');
 const palletGrosze=Number(match[1])*(Number(match[2])*100+Number(match[3]??0));
 const carrierGrosze=prestashopMoney(htmlText(cls(carrier,'order_tile_price'))),paymentText=htmlText(cls(payment,'order_tile_price'));
 if(!paymentText.startsWith('+'))throw Error('invalid_money');
 const paymentGrosze=prestashopMoney(paymentText.slice(1)),costGrosze=carrierGrosze+palletGrosze+paymentGrosze;
 const totalGrosze=prestashopMoney(htmlText(cls(safe,'order_price_summ')));
 if(!Number.isSafeInteger(costGrosze)||totalGrosze!==materialsGrosze+costGrosze)throw Error('basket_not_confirmed');
 return{costGrosze,carrier:'Wysyłka paletowa + paleta KN-WO',payment:'Przelewy24.pl',carrierGrosze,palletGrosze,paymentGrosze,totalGrosze};
}

/** Fresh guest cookies. The only POST adds a reviewed product to the basket;
 * no customer/address, acceptance, order or payment endpoint is exposed. */
export async function readBmbCart(source:RetailSource,count:number,fetchImpl:typeof fetch,expectedPrice?:number){
 reviewedBmbSource(source);
 if(!Number.isSafeInteger(count)||count<1||count>MAX_RETAIL_PACKAGES)throw Error('invalid_basket');
 const client=new AnonymousShop(BMB_ORIGIN,fetchImpl,AbortSignal.timeout(25_000),12);
 const page=await client.text(source.url),product=readBmbProduct(page,source);
 if(expectedPrice!==undefined&&expectedPrice!==product.priceGrosze)throw Error('price_changed');
 if(count>product.stock)throw Error('insufficient_stock');
 await client.text(BMB_BASKET,{'add_product[5454]':String(count)});
 const cart=await client.text(BMB_BASKET);
 confirmBmbBasket(cart,source,count,product.priceGrosze);
 return{product,cart,evidenceSha256:createHash('sha256').update(page).update(cart).digest('hex')};
}

export async function quoteBmb(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 if(order.store!=='BMB Technologie'||order.lines.length!==1||order.lines[0].packages.length!==1)throw Error('invalid_basket');
 const pack=order.lines[0].packages[0],source=RETAIL_SOURCES.find(s=>s.id===pack.offerId&&s.store===order.store);
 if(!source||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze*pack.count!==order.materialsGrosze)throw Error('invalid_basket');
 const current=await readBmbCart(source,pack.count,fetchImpl,pack.unitPriceGrosze);
 const quote=confirmBmbDelivery(current.cart,source,pack.count,pack.unitPriceGrosze),checkedAt=new Date();
 return{quote:{costGrosze:quote.costGrosze,carrier:quote.carrier,payment:quote.payment,checkedAt:checkedAt.toISOString(),expiresAt:new Date(checkedAt.getTime()+600_000).toISOString(),sourceUrl:BMB_ORIGIN+BMB_BASKET,basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:current.evidenceSha256}};
}
