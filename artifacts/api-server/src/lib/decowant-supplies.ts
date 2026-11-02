import type {RetailSource} from './retail-pages';

// Native retail SZT: one 10 m roll or one corner; never a carton inferred from GTIN.
// Keep 4260112880754/761 separate from 5905400601459/442 revisions.
// source: https://www.atlas.com.pl/produkt/atlas-narozniki-uszczelniajace-hydroband-3g/
// source: https://www.atlas.com.pl/produkt/atlas-hydroband-3g/
export const DECOWANT_SOURCES:readonly RetailSource[]=[
  // source: https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-tasma-uszczelniajaca-125-mm-10-m/370
  {"id":"decowant-atlas-hydroband-125-10m","ean":"5905400602807","name":"ATLAS HYDROBAND 3G taśma uszczelniająca 125 mm × 10 m","brand":"Atlas","category":"sealing-tape","packageSize":10,"unit":"m","store":"Decowant","format":"shoper-api","productId":370,"apiProductCode":"13766461859","retailerSku":"13766461859","apiPurchaseUnit":"szt.","variant":["HYDROBAND","125","10 m"],"pickupRequiresConfirmation":true,"url":"https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-tasma-uszczelniajaca-125-mm-10-m/370","packageDescription":"1 rolkę taśmy","imageUrl":"https://www.sklepdecowant.pl/environment/cache/images/productGfx_1099_500_500/AT-HYDROBAND-3G-TASMA-USZCZELNIAJACA-A-10.jpg"},
  // source: https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-NAROZNIK-WEWNETRZNY/318
  {"id":"decowant-atlas-hydroband-internal","ean":"4260112880754","name":"ATLAS HYDROBAND 3G NAROŻNIK WEWNĘTRZNY","brand":"Atlas","category":"sealing-corner","packageSize":1,"unit":"szt","store":"Decowant","format":"shoper-api","productId":318,"apiProductCode":"14462773403","retailerSku":"14462773403","apiPurchaseUnit":"szt.","variant":["HYDROBAND","WEWNĘTRZNY"],"pickupRequiresConfirmation":true,"url":"https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-NAROZNIK-WEWNETRZNY/318","packageDescription":"1 sztuka","imageUrl":"https://www.sklepdecowant.pl/environment/cache/images/productGfx_952_500_500/ATLAS-HYDROBAND-3G-NAROZNIK-WEWNETRZNY.jpg"},
  // source: https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-NAROZNIK-ZEWNETRZNY/319
  {"id":"decowant-atlas-hydroband-external","ean":"4260112880761","name":"ATLAS HYDROBAND 3G NAROŻNIK ZEWNĘTRZNY","brand":"Atlas","category":"sealing-corner","packageSize":1,"unit":"szt","store":"Decowant","format":"shoper-api","productId":319,"apiProductCode":"14462780805","retailerSku":"14462780805","apiPurchaseUnit":"szt.","variant":["HYDROBAND","ZEWNĘTRZNY"],"pickupRequiresConfirmation":true,"url":"https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-NAROZNIK-ZEWNETRZNY/319","packageDescription":"1 sztuka","imageUrl":"https://www.sklepdecowant.pl/environment/cache/images/productGfx_954_500_500/ATLAS-HYDROBAND-3G-NAROZNIK-ZEWNETRZNY.jpg"},
  // source: https://www.sklepdecowant.pl/pl/p/ATLAS-WODER-E-FOLIA-IZOLACYJNA-5-KG/317
  {"id":"decowant-atlas-woder-e-5kg","ean":"5905400514490","name":"ATLAS WODER E-FOLIA IZOLACYJNA 5 KG","brand":"Atlas","category":"waterproofing","packageSize":5,"unit":"kg","store":"Decowant","format":"shoper-api","productId":317,"apiProductCode":"14419222906","retailerSku":"14419222906","apiPurchaseUnit":"szt.","variant":["WODER E","5 KG"],"pickupRequiresConfirmation":true,"url":"https://www.sklepdecowant.pl/pl/p/ATLAS-WODER-E-FOLIA-IZOLACYJNA-5-KG/317","imageUrl":"https://lobo.pl/environment/cache/images/productGfx_122194_500_500/ATLAS-WODER-E-Szybkoschnaca-folia-w-plynie-5-KG.webp"},
  // source: https://www.sklepdecowant.pl/pl/p/ATLAS-WODER-E-FOLIA-IZOLACYJNA-15-KG/367
  {"id":"decowant-atlas-woder-e-15kg","ean":"5905400514506","name":"ATLAS WODER E-FOLIA IZOLACYJNA 15 KG","brand":"Atlas","category":"waterproofing","packageSize":15,"unit":"kg","store":"Decowant","format":"shoper-api","productId":367,"apiProductCode":"13783058229","retailerSku":"13783058229","apiPurchaseUnit":"szt.","variant":["WODER E","15 KG"],"pickupRequiresConfirmation":true,"url":"https://www.sklepdecowant.pl/pl/p/ATLAS-WODER-E-FOLIA-IZOLACYJNA-15-KG/367","imageUrl":"https://lobo.pl/environment/cache/images/productGfx_142134_500_500/ATLAS-WODER-E-Szybkoschnaca-folia-w-plynie-15-KG.webp"},
];

export function confirmDecowantSource(source:RetailSource):void {
  const reviewed=DECOWANT_SOURCES.find(row=>row.id===source.id);
  if(!reviewed){if(source.store==='Decowant')throw Error('product_package_not_confirmed');return;}
  const keys=['ean','name','brand','category','packageSize','unit','store','format','productId','retailerSku','apiProductCode','apiPurchaseUnit','packageDescription','url'] as const;
  if(keys.some(key=>source[key]!==reviewed[key])||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1)throw Error('product_package_not_confirmed');
}

export function confirmDecowantPurchase(item:Record<string,any>,source:RetailSource):void {
  const reviewed=DECOWANT_SOURCES.find(row=>row.id===source.id);if(!reviewed&&source.store!=='Decowant')return;
  confirmDecowantSource(source);
  if(!reviewed||item.id!==reviewed.productId||item.ean!==reviewed.ean||item.name!==reviewed.name||item.code!==reviewed.apiProductCode||item.url!==reviewed.url||item.producer?.id!==26||item.producer.name!=='Atlas'||item.unit?.name!=='szt.'||item.unit.floating_point!==false||item.package!=='0')throw Error('product_package_not_confirmed');
}
