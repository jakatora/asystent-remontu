import type {RetailSource} from './retail-pages';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {cleanHtml,htmlElements,htmlText} from './retail-microdata';
import {ELMAS_ORIGIN,ELMAS_VARIANT,confirmElmasSource} from './elmas-source';

const one=<T>(rows:T[],reason='product_identity_ambiguous'):T=>{if(rows.length!==1)throw Error(reason);return rows[0];};
const cls=(a:Record<string,string>,name:string)=>a.class?.split(/\s+/).includes(name)??false;
const money=(value:unknown)=>{if(typeof value!=='number'||!Number.isFinite(value))throw Error('retailer_gross_price_mismatch');const amount=parsePriceToGrosze(String(value));if(!amount||amount<1||Math.abs(value*100-amount)>1e-7)throw Error('retailer_gross_price_mismatch');return amount;};
export interface ElmasCard{priceGrosze:number;nettoGrosze:number;maxPackages:number;imageUrl:string;product:Record<string,any>}

export function readElmasNativeCard(p:any,source:RetailSource):Omit<ElmasCard,'product'>{
  const item=confirmElmasSource(source);
  if(p?._id!==source.retailerSku||p.name!==source.name||p.url!==new URL(source.url).pathname||p.manufacturer?.name!==source.brand||p.preorder!==false||p.personalization?.length!==0||(p.components?.length??0)!==0||p.type!==undefined&&p.type!=='normal')throw Error('product_identity_not_confirmed');
  if([p.gtin13,p.gtin,p.ean].some(code=>code!==undefined&&code!==source.ean))throw Error('product_ean_not_confirmed');
  if(!Array.isArray(p.variants))throw Error('purchase_rules_changed');const v=one<any>(p.variants);
  if(v.hash!==ELMAS_VARIANT||v.weight!==item.weight||(p.price?.pricedUnit??1)!==1||(p.price?.quantityFactor??1)!==1||p.price?.unit!==undefined&&!['szt','szt.'].includes(p.price.unit))throw Error('retailer_unit_not_confirmed');
  if(!Number.isSafeInteger(v.count)||!Number.isSafeInteger(v.locked)||v.locked<0||v.count-v.locked<1)throw Error('retailer_out_of_stock');
  if(p.price?.currency!=='PLN'||p.price?.vat!==23)throw Error('retailer_gross_price_mismatch');
  if(p.price.discount!==0||v.price?.discount!==0||p.price.brutto!==p.price.discountBrutto||p.price.netto!==p.price.discountNetto)throw Error('purchase_rules_changed');
  const priceGrosze=money(p.price.discountBrutto),nettoGrosze=money(p.price.discountNetto);
  if(money(v.price?.discountBrutto)!==priceGrosze||money(v.price?.discountNetto)!==nettoGrosze||money(p.price.brutto)!==money(v.price?.brutto)||money(p.price.netto)!==money(v.price?.netto)||Math.round(nettoGrosze*1.23)!==priceGrosze)throw Error('retailer_gross_price_mismatch');
  const imageUrl=new URL(p.mainImage?.url,ELMAS_ORIGIN).href;if(imageUrl!==source.imageUrl)throw Error('product_image_not_confirmed');
  return{priceGrosze,nettoGrosze,maxPackages:v.count-v.locked,imageUrl};
}

/** Exact reviewed public primary cards and native single-roll variants, not a generic
 * Selesto catalogue reader or the product-page free-shipping teaser.
 * source: https://sklep-elmas.pl/api/public/p/6a69c6cc869b9bc4c7953c25?lang=pl&id=1 */
export function readElmasProduct(raw:string,source:RetailSource):ElmasCard{
  const item=confirmElmasSource(source);
  const state=JSON.parse(one([...raw.matchAll(/<script>__state__=\s*([\s\S]*?)<\/script>/g)]).at(1)!.trim().replace(/;$/,'')),p=state.product;
  const{priceGrosze,nettoGrosze,maxPackages,imageUrl}=readElmasNativeCard(p,source);
  const html=cleanHtml(raw),primary=one(htmlElements(html,a=>cls(a,'product-conf')&&a['data-p-id']===source.retailerSku)),name=htmlText(one(htmlElements(primary,(_a,t)=>t==='h1'))),code=htmlText(one(htmlElements(primary,a=>cls(a,'code'))));
  if(name!==source.name||code!=='Kod produktu: '+source.ean||htmlText(one(htmlElements(primary,a=>cls(a,'producer'))))!=='Producent: '+source.brand)throw Error('product_ean_not_confirmed');
  const description=one(htmlElements(html,a=>cls(a,'product-description'))),descriptionText=htmlText(description.replace(/<\/?(?:b|strong|em|i|span)\b[^>]*>/gi,''));
  if(!item.packageChecks.every(check=>check.test(descriptionText)))throw Error('product_package_not_confirmed');
  const regular=htmlText(one(htmlElements(primary,a=>cls(a,'regular'))));if(!/^\d+\.\d{2} PLN$/.test(regular)||parsePriceToGrosze(regular.replace(' PLN',''))!==priceGrosze)throw Error('retailer_gross_price_mismatch');
  const products=[...raw.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{const x=JSON.parse(m[1]);return Array.isArray(x['@graph'])?x['@graph']:[x];}).filter(x=>x['@type']==='Product'),schema=one<any>(products);
  if(schema.name!==p.name||schema.mpn!==source.retailerSku||schema.brand?.name!==source.brand||schema.offers?.url!==source.url||schema.offers?.priceCurrency!=='PLN'||schema.offers?.availability!=='InStock'||money(schema.offers.price)!==priceGrosze||[schema.gtin13,schema.gtin,schema.ean].some(code=>code!==undefined&&code!==source.ean))throw Error('product_identity_not_confirmed');
  if(schema.image!==imageUrl)throw Error('product_image_not_confirmed');
  return{priceGrosze,nettoGrosze,maxPackages,imageUrl,product:{'@type':'Product',name:item.catalogueName,brand:source.brand,gtin13:source.ean,image:imageUrl,description:item.description,offers:{'@type':'Offer',url:source.url,price:(priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock'}}};
}
