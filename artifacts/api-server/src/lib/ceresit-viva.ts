import type {RetailSource} from './retail-pages';
import {cleanHtml,htmlElements as nodes,htmlAttributes as attrs,htmlText as text} from './retail-microdata';

// Exact Viva buckets. Each shade and size keeps its own GTIN, never CE40.
// source: https://www.ceresit.pl/produkty/kleje-i-fugi/fugi/produkt.html/ceresit-fuga-viva/SAP_0201SGC014Y0.html
// source: https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-white-2-kg-ceresit-9000101173451.html
// source: https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-white-4-kg-ceresit-9000101175134.html
export const CERESIT_VIVA_SOURCES:readonly RetailSource[]=[
  // source: https://buduj24.pl/produkt/19506,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-white-01
  {id:'buduj24-ceresit-viva-white-2kg',ean:'9000101173451',name:'CERESIT Fuga VIVA elastyczna CEMENTOWA 1-8 MM 2KG White 01',category:'grout',brand:'Ceresit',packageSize:2,unit:'kg',store:'Buduj24',format:'buduj24',url:'https://buduj24.pl/produkt/19506,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-white-01',imageUrl:'https://buduj24.pl/files/_product/19506/Kopia%20%E2%80%93%20Projekt%20bez%20nazwy%20(1).png'},
  // source: https://buduj24.pl/produkt/19564,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-white-01
  {id:'buduj24-ceresit-viva-white-4kg',ean:'9000101175134',name:'CERESIT Fuga VIVA elastyczna CEMENTOWA 1-8 MM 4KG White 01',category:'grout',brand:'Ceresit',packageSize:4,unit:'kg',store:'Buduj24',format:'buduj24',url:'https://buduj24.pl/produkt/19564,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-white-01',imageUrl:'https://buduj24.pl/files/_product/19564/Kopia%20%E2%80%93%20Projekt%20bez%20nazwy%20(1).png'},
  // source: https://buduj24.pl/produkt/19544,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-grey-07
  {"id":"buduj24-ceresit-viva-grey-2kg","ean":"9000101173499","name":"CERESIT Fuga VIVA elastyczna CEMENTOWA 1-8 MM 2KG Grey 07","category":"grout","brand":"Ceresit","packageSize":2,"unit":"kg","store":"Buduj24","format":"buduj24","url":"https://buduj24.pl/produkt/19544,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-grey-07","imageUrl":"https://buduj24.pl/files/_product/19544/Kopia%20%E2%80%93%20Projekt%20bez%20nazwy%20(3).png"},
  // source: https://buduj24.pl/produkt/19562,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-grey-07
  {"id":"buduj24-ceresit-viva-grey-4kg","ean":"9000101174854","name":"CERESIT Fuga VIVA elastyczna CEMENTOWA 1-8 MM 4KG Grey 07","category":"grout","brand":"Ceresit","packageSize":4,"unit":"kg","store":"Buduj24","format":"buduj24","url":"https://buduj24.pl/produkt/19562,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-grey-07","imageUrl":"https://buduj24.pl/files/_product/19562/Kopia%20%E2%80%93%20Projekt%20bez%20nazwy%20(3).png"},
  // source: https://buduj24.pl/produkt/19516,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-manhattan-10
  {"id":"buduj24-ceresit-viva-manhattan-2kg","ean":"9000101173536","name":"CERESIT FUGA VIVA ELASTYCZNA CEMENTOWA 1-8 MM 2KG MANHATTAN 10","category":"grout","brand":"Ceresit","packageSize":2,"unit":"kg","store":"Buduj24","format":"buduj24","url":"https://buduj24.pl/produkt/19516,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-manhattan-10","imageUrl":"https://buduj24.pl/files/_product/19516/Kopia%20%E2%80%93%20Projekt%20bez%20nazwy.png"},
  // source: https://buduj24.pl/produkt/19561,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-manhattan-10
  {"id":"buduj24-ceresit-viva-manhattan-4kg","ean":"9000101174991","name":"CERESIT FUGA VIVA ELASTYCZNA CEMENTOWA 1-8 MM 4KG MANHATTAN 10","category":"grout","brand":"Ceresit","packageSize":4,"unit":"kg","store":"Buduj24","format":"buduj24","url":"https://buduj24.pl/produkt/19561,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-manhattan-10","imageUrl":"https://buduj24.pl/files/_product/19561/Kopia%20%E2%80%93%20Projekt%20bez%20nazwy.png"},
  // source: https://www.abud.pl/product-pol-67336-Fuga-elastyczna-Viva-1-8mm-2kg-Ceresit-Kolor-01-White.html
  {"id":"abud-ceresit-viva-white-2kg","ean":"9000101173451","name":"Fuga elastyczna Viva 1-8mm 2kg Ceresit Kolor: 01 White","category":"grout","brand":"Ceresit","packageSize":2,"unit":"kg","store":"ABUD","format":"idosell","productId":67336,"apiPurchaseUnit":"op.","variant":["Viva","2 kg","01 White"],"pickupRequiresConfirmation":true,"url":"https://www.abud.pl/product-pol-67336-Fuga-elastyczna-Viva-1-8mm-2kg-Ceresit-Kolor-01-White.html","imageUrl":"https://www.abud.pl/hpeciai/15652d1b95dc2db15d1504b29743e501/pol_pl_Fuga-elastyczna-Viva-1-8mm-2kg-Ceresit-Kolor-01-White-67336_1.webp"},
  // source: https://www.abud.pl/product-pol-67395-Fuga-elastyczna-Viva-1-8mm-4kg-Ceresit-Kolor-01-White.html
  {"id":"abud-ceresit-viva-white-4kg","ean":"9000101175134","name":"Fuga elastyczna Viva 1-8mm 4kg Ceresit Kolor: 01 White","category":"grout","brand":"Ceresit","packageSize":4,"unit":"kg","store":"ABUD","format":"idosell","productId":67395,"apiPurchaseUnit":"op.","variant":["Viva","4 kg","01 White"],"pickupRequiresConfirmation":true,"url":"https://www.abud.pl/product-pol-67395-Fuga-elastyczna-Viva-1-8mm-4kg-Ceresit-Kolor-01-White.html","imageUrl":"https://www.abud.pl/hpeciai/1c258eaa40fa69cb118e831b8e155111/pol_pl_Fuga-elastyczna-Viva-1-8mm-4kg-Ceresit-Kolor-01-White-67395_1.webp"},
  // source: https://www.abud.pl/product-pol-67342-Fuga-elastyczna-Viva-1-8mm-2kg-Ceresit-Kolor-10-Manhattan.html
  {"id":"abud-ceresit-viva-manhattan-2kg","ean":"9000101173536","name":"Fuga elastyczna Viva 1-8mm 2kg Ceresit Kolor: 10 Manhattan","category":"grout","brand":"Ceresit","packageSize":2,"unit":"kg","store":"ABUD","format":"idosell","productId":67342,"apiPurchaseUnit":"op.","variant":["Viva","2 kg","10 Manhattan"],"pickupRequiresConfirmation":true,"url":"https://www.abud.pl/product-pol-67342-Fuga-elastyczna-Viva-1-8mm-2kg-Ceresit-Kolor-10-Manhattan.html","imageUrl":"https://www.abud.pl/hpeciai/c6c324e48687930a9efdd88ae7a6b15a/pol_pl_Fuga-elastyczna-Viva-1-8mm-2kg-Ceresit-Kolor-10-Manhattan-67342_1.webp"},
];
const makers:Readonly<Record<string,string>>={"buduj24-ceresit-viva-white-2kg":"CER-3141510","buduj24-ceresit-viva-white-4kg":"3147322","buduj24-ceresit-viva-grey-2kg":"314155","buduj24-ceresit-viva-grey-4kg":"3147084","buduj24-ceresit-viva-manhattan-2kg":"3141558","buduj24-ceresit-viva-manhattan-4kg":"3147168","abud-ceresit-viva-white-2kg":"3141510","abud-ceresit-viva-white-4kg":"3147322","abud-ceresit-viva-manhattan-2kg":"3141558"};
const one=(values:string[])=>{if(values.length!==1)throw Error('viva_purchase_not_confirmed');return values[0];};
const cls=(a:Record<string,string>,name:string)=>a.class?.split(/\s+/).includes(name)??false;
const path=(url:string)=>{const u=new URL(url);return u.origin+decodeURIComponent(u.pathname).replaceAll('+',' ');};
/** Pin the formulation, shade and whole-bucket unit; retain finite native
 * stock before mixed 2/4 kg optimisation. Recommendations cannot supply it. */
export function ceresitVivaStock(html:string,product:Record<string,any>,source:RetailSource):number|undefined{
  if(!/^(buduj24|abud)-ceresit-viva-/.test(source.id))return undefined;
  const reviewed=CERESIT_VIVA_SOURCES.find(s=>s.id===source.id);
  if(!reviewed||(['ean','name','category','brand','packageSize','unit','store','format','url','imageUrl','productId','apiPurchaseUnit']as const).some(key=>source[key]!==reviewed[key])||source.skuIdentity||source.purchaseMultiple&&source.purchaseMultiple!==1||source.minimumPackages&&source.minimumPackages!==1)throw Error('viva_source_not_reviewed');
  if(source.store==='ABUD'){
    if(product.gtin13!==source.ean||product.name!==source.name||text(one(nodes(cleanHtml(html),(_a,tag)=>tag==='h1')))!==source.name||product.brand?.name!=='Ceresit'||product.productID!=='mpn:'+makers[source.id]||product.image!==source.imageUrl||source.variant?.join('|')!==reviewed.variant?.join('|'))throw Error('viva_identity_not_confirmed');
    return undefined; // A vague warehouse status is not a numeric stock limit. The actual cart must confirm the requested count.
  }
  const main=one(nodes(cleanHtml(html),a=>/\/Product$/.test(a.itemtype??''))),form=one(nodes(main,a=>a.id==='form_product'));
  const manufacturer=makers[source.id],identifiers=one(nodes(main,a=>cls(a,'product-identifiers')));
  if(product.gtin13!==source.ean||product.name!==source.name||text(one(nodes(main,a=>a.itemprop==='brand')))!=='CERESIT'||!text(identifiers).endsWith('Kod producenta: '+manufacturer)||path(product.image)!==path(reviewed.imageUrl!))throw Error('viva_identity_not_confirmed');
  const add=one(nodes(form,a=>a.name==='add')),pid=new URL(source.url).pathname.match(/^\/produkt\/(\d+),/)?.[1];
  if(attrs(add).value!==pid||text(one(nodes(form,a=>cls(a,'product-unit'))))!=='szt.')throw Error('viva_purchase_unit_not_confirmed');
  const stock=one(nodes(main,a=>cls(a,'product-store'))),match=text(stock).match(/^(\d+) szt\.$/);
  if(attrs(stock.match(/^<[^>]+>/)?.[0]??'')['data-unit']!=='szt.'||!match||!Number.isSafeInteger(Number(match[1]))||Number(match[1])>1000000)throw Error('retailer_stock_not_confirmed');
  if(Number(match[1])===0)throw Error('retailer_out_of_stock');
  return Number(match[1]);
}
