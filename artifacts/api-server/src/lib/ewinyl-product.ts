import type {RetailSource} from './retail-pages';
import {ORION_ROLLS} from '../../../../lib/pricing-service/src/cut-rolls';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';

export const EWINYL_ORIGIN='https://ewinyl.pl';
export const EWINYL_ORION_URL=EWINYL_ORIGIN+'/produkt/orion-514-05-wykladzina-winylowy-3m-4m/';
export const EWINYL_ORION_PHOTO=EWINYL_ORIGIN+'/wp-content/uploads/2019/01/514-05-copy-950x950-600x600.jpg';
export const one=(nodes:string[])=>{if(nodes.length!==1)throw Error('basket_not_confirmed');return nodes[0];};
export const attrs=(node:string)=>htmlAttributes(node.match(/^<[^>]+>/)?.[0]??'');
export const hasClass=(a:Record<string,string>,name:string)=>a.class?.split(/\s+/).includes(name)??false;
export function ewinylMoney(node:string):number {
  const text=htmlText(node).replace(/&#122;&#322;/g,'zł'),m=text.match(/^([\d ]+),(\d{2}) zł$/);
  if(!m)throw Error('basket_not_confirmed');const n=Number(m[1].replace(/ /g,''))*100+Number(m[2]);if(!Number.isSafeInteger(n)||n<0)throw Error('basket_not_confirmed');return n;
}
export function isReviewedEwinylSource(s:RetailSource):boolean {
  const width=s.id==='ewinyl-orion514-2m'?2000:s.id==='ewinyl-orion514-4m'?4000:0,spec=ORION_ROLLS.find(p=>p.widthMm===width);
  return Boolean(spec&&s.ean===''&&s.format==='ewinyl'&&s.store==='eWinyl'&&s.name===spec.name&&s.brand==='Lentex'&&s.category==='vinyl-roll'&&s.packageSize===1&&s.unit==='m2'&&s.productId===5329
    &&s.url===EWINYL_ORION_URL&&s.imageUrl===EWINYL_ORION_PHOTO&&s.pickupRequiresConfirmation===true
    &&s.skuIdentity?.kind==='merchant-only'&&s.skuIdentity.catalogKey===`ewinyl-5329-${width/1000}m`&&s.skuIdentity.merchantProductId==='5329'&&s.skuIdentity.manufacturerSku===undefined&&s.skuIdentity.pageBarcode===undefined);
}
/** A merchant product plus an explicit available roll width, never an invented
 * EAN or a sealed one-square-metre package. Price is per square metre.
 * source: https://ewinyl.pl/produkt/orion-514-05-wykladzina-winylowy-3m-4m/
 * source: https://www.lentexflooring.com/wykladziny-obiektowe/orion/ */
export function readEwinylProduct(raw:string,source:RetailSource):Record<string,any> {
  if(!isReviewedEwinylSource(source))throw Error('product_identity_not_confirmed');
  const html=cleanHtml(raw),canonical=attrs(one(htmlElements(html,(a,t)=>t==='link'&&a.rel==='canonical')));
  if(canonical.href!==EWINYL_ORION_URL||htmlText(one(htmlElements(html,(_a,t)=>t==='h1')))!=='Orion 514-05 Wykładzina winylowy 2m 4m')throw Error('product_identity_not_confirmed');
  const form=one(htmlElements(html,(a,t)=>t==='form'&&hasClass(a,'cart')));
  if(attrs(form).action!==EWINYL_ORION_URL||attrs(form).method!=='post')throw Error('purchase_rules_changed');
  const field=(name:string)=>attrs(one(htmlElements(form,(a,t)=>t==='input'&&a.name===name)));
  const button=attrs(one(htmlElements(form,(a,t)=>t==='button'&&a.name==='add-to-cart')));
  if(button.value!=='5329'||field('quantity').step!=='1'||field('quantity').min!=='1'||field('quantity').value!=='1'||field('length_needed')['data-unit']!=='m')throw Error('purchase_rules_changed');
  const widths=one(htmlElements(form,(a,t)=>t==='select'&&a.name==='width_needed'));
  if(JSON.stringify(htmlElements(widths,(_a,t)=>t==='option').map(n=>attrs(n).value))!=='["2","4"]')throw Error('purchase_rules_changed');
  const manufacturer=one(htmlElements(html,(a,t)=>t==='tr'&&hasClass(a,'woocommerce-product-attributes-item--attribute_pa_producent')));
  if(htmlText(one(htmlElements(manufacturer,(_a,t)=>t==='td')))!=='Lentex')throw Error('product_identity_not_confirmed');
  const data=JSON.parse(field('gtm4wp_product_data').value??'null');
  if(data.internal_id!==5329||data.item_id!==5329||data.sku!=='Orion 514-05 Wykładzina winylowy 3m 4m'||data.stockstatus!=='instock')throw Error('retailer_out_of_stock');
  const configMatches=[...raw.matchAll(/var wc_price_calculator_params = (\{[^\n]+?\});/g)];
  if(configMatches.length!==1)throw Error('purchase_rules_changed');
  const config=JSON.parse(configMatches[0][1]);
  if(config.product_id!=='5329'||config.measurement_type!=='area-dimension'||config.calculator_type!=='pricing'||config.product_price_unit!=='sq m'||config.product_total_measurement_common_unit!=='sq m'||config.pricing_overage!=='0')throw Error('purchase_rules_changed');
  const priceNode=one(htmlElements(html,(a,t)=>t==='p'&&a.class==='price'));
  const price=ewinylMoney(one(htmlElements(priceNode,a=>hasClass(a,'woocommerce-Price-amount'))));
  if(!htmlText(priceNode).endsWith('m2')||Math.round(Number(config.product_price)*100)!==price||Math.round(Number(data.price)*100)!==price||price<1)throw Error('price_changed');
  return{'@type':'Product',name:source.name,sku:source.skuIdentity!.catalogKey,brand:'Lentex',image:source.imageUrl,offers:{'@type':'Offer',price:(price/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}};
}
