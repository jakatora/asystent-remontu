import type {RetailSource} from './retail-pages';
import {cleanHtml,htmlElements as nodes,htmlAttributes as attrs,htmlText as text} from './retail-microdata';

// These are Viva White 01, not the older CE40 barcode or another white shade.
// source: https://www.ceresit.pl/produkty/kleje-i-fugi/fugi/produkt.html/ceresit-fuga-viva/SAP_0201SGC014Y0.html
// source: https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-white-2-kg-ceresit-9000101173451.html
// source: https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-white-4-kg-ceresit-9000101175134.html
export const CERESIT_VIVA_SOURCES:readonly RetailSource[]=[
  // source: https://buduj24.pl/produkt/19506,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-white-01
  {id:'buduj24-ceresit-viva-white-2kg',ean:'9000101173451',name:'CERESIT Fuga VIVA elastyczna CEMENTOWA 1-8 MM 2KG White 01',category:'grout',brand:'Ceresit',packageSize:2,unit:'kg',store:'Buduj24',format:'buduj24',url:'https://buduj24.pl/produkt/19506,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-white-01',imageUrl:'https://buduj24.pl/files/_product/19506/Kopia%20%E2%80%93%20Projekt%20bez%20nazwy%20(1).png'},
  // source: https://buduj24.pl/produkt/19564,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-white-01
  {id:'buduj24-ceresit-viva-white-4kg',ean:'9000101175134',name:'CERESIT Fuga VIVA elastyczna CEMENTOWA 1-8 MM 4KG White 01',category:'grout',brand:'Ceresit',packageSize:4,unit:'kg',store:'Buduj24',format:'buduj24',url:'https://buduj24.pl/produkt/19564,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-white-01',imageUrl:'https://buduj24.pl/files/_product/19564/Kopia%20%E2%80%93%20Projekt%20bez%20nazwy%20(1).png'},
];
const one=(values:string[])=>{if(values.length!==1)throw Error('viva_purchase_not_confirmed');return values[0];};
const cls=(a:Record<string,string>,name:string)=>a.class?.split(/\s+/).includes(name)??false;
const path=(url:string)=>{const u=new URL(url);return u.origin+decodeURIComponent(u.pathname).replaceAll('+',' ');};
/** Pin the formulation, shade and whole-bucket unit; retain finite native
 * stock before mixed 2/4 kg optimisation. Recommendations cannot supply it. */
export function ceresitVivaStock(html:string,product:Record<string,any>,source:RetailSource):number|undefined{
  if(!source.id.startsWith('buduj24-ceresit-viva-'))return undefined;
  const reviewed=CERESIT_VIVA_SOURCES.find(s=>s.id===source.id);
  if(!reviewed||(['ean','name','category','brand','packageSize','unit','store','format','url','imageUrl']as const).some(key=>source[key]!==reviewed[key])||source.skuIdentity||source.purchaseMultiple&&source.purchaseMultiple!==1||source.minimumPackages&&source.minimumPackages!==1)throw Error('viva_source_not_reviewed');
  const main=one(nodes(cleanHtml(html),a=>/\/Product$/.test(a.itemtype??''))),form=one(nodes(main,a=>a.id==='form_product'));
  const manufacturer=reviewed.packageSize===2?'CER-3141510':'3147322',identifiers=one(nodes(main,a=>cls(a,'product-identifiers')));
  if(product.gtin13!==source.ean||product.name!==source.name||text(one(nodes(main,a=>a.itemprop==='brand')))!=='CERESIT'||!text(identifiers).endsWith('Kod producenta: '+manufacturer)||path(product.image)!==path(reviewed.imageUrl!))throw Error('viva_identity_not_confirmed');
  const add=one(nodes(form,a=>a.name==='add')),pid=new URL(source.url).pathname.match(/^\/produkt\/(\d+),/)?.[1];
  if(attrs(add).value!==pid||text(one(nodes(form,a=>cls(a,'product-unit'))))!=='szt.')throw Error('viva_purchase_unit_not_confirmed');
  const stock=one(nodes(main,a=>cls(a,'product-store'))),match=text(stock).match(/^(\d+) szt\.$/);
  if(attrs(stock.match(/^<[^>]+>/)?.[0]??'')['data-unit']!=='szt.'||!match||!Number.isSafeInteger(Number(match[1]))||Number(match[1])>1000000)throw Error('retailer_stock_not_confirmed');
  if(Number(match[1])===0)throw Error('retailer_out_of_stock');
  return Number(match[1]);
}
