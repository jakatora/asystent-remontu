import type {RetailSource} from './retail-pages';

/** Reviewed native retail pieces. Litres are product content, not the shop's
 * shipping weight (the 10 l can currently has a 20 kg shipping attribute).
 * Different Mapegum GTINs remain separate; no old/new barcode aliases.
 * source: https://fugi.pl/wp-content/uploads/2021/06/2949-primergpro-pl.pdf
 */
export const MAPEI_SUPPLY_SOURCES: readonly RetailSource[] = [
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-10l-KONCENTRAT-GRUNTUJACY-GRUNT/15704
  {"id":"rabdom-primer-g-pro-10l","ean":"8022452241147","name":"MAPEI PRIMER G PRO 10l KONCENTRAT GRUNTUJĄCY GRUNT","brand":"Mapei","category":"primer","packageSize":10,"unit":"l","store":"Rab-Dom","format":"shoper-api","productId":15704,"retailerSku":"37971","apiProductCode":"37971","apiPurchaseUnit":"szt.","url":"https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-10l-KONCENTRAT-GRUNTUJACY-GRUNT/15704","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_38733_500_500/primer-g-10l.webp","pickupRequiresConfirmation":true},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-KONCENTRAT-GRUNTUJACY-GRUNT-20L/10828
  {"id":"rabdom-primer-g-pro-20l","ean":"8022452241154","name":"MAPEI PRIMER G PRO KONCENTRAT GRUNTUJĄCY GRUNT 20L","brand":"Mapei","category":"primer","packageSize":20,"unit":"l","store":"Rab-Dom","format":"shoper-api","productId":10828,"retailerSku":"37718","apiProductCode":"37718","apiPurchaseUnit":"szt.","url":"https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-KONCENTRAT-GRUNTUJACY-GRUNT-20L/10828","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_19103_500_500/4_primer-g-pro_20l_pl_4aaf7bd94b4c46708f4e182628687303.webp","pickupRequiresConfirmation":true},
  // source: https://www.rabdom.pl/pl/p/Folia-w-plynie-hydroizolacyjna-MAPEI-Mapegum-WPS-3kg/16590
  {"id":"rabdom-mapegum-wps-3kg","ean":"8022452249266","name":"Folia w płynie hydroizolacyjna MAPEI Mapegum WPS 3kg","brand":"Mapei","category":"waterproofing","packageSize":3,"unit":"kg","store":"Rab-Dom","format":"shoper-api","productId":16590,"retailerSku":"59458","apiProductCode":"59458","apiPurchaseUnit":"szt.","url":"https://www.rabdom.pl/pl/p/Folia-w-plynie-hydroizolacyjna-MAPEI-Mapegum-WPS-3kg/16590","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_48728_500_500/Opakowanie-folii-w-plynie-hydroizalacyjnej-o-pojemnosci-3kg.webp","pickupRequiresConfirmation":true},
  // source: https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-20kg-HYDROIZOLACJA-PLYNNA-FOLIA/9875
  {"id":"rabdom-mapegum-wps-20kg","ean":"8022452242502","name":"MAPEI Mapegum WPS 20kg HYDROIZOLACJA PŁYNNA FOLIA","brand":"Mapei","category":"waterproofing","packageSize":20,"unit":"kg","store":"Rab-Dom","format":"shoper-api","productId":9875,"retailerSku":"36196","apiProductCode":"36196","apiPurchaseUnit":"szt.","url":"https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-20kg-HYDROIZOLACJA-PLYNNA-FOLIA/9875","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_17482_500_500/Zrzut-ekranu-2022-02-12-090849.webp","pickupRequiresConfirmation":true},
];

export function confirmMapeiSupplyPurchase(item:Record<string,any>,source:RetailSource):boolean {
  const reviewed=MAPEI_SUPPLY_SOURCES.find(row=>row.id===source.id);
  if(!reviewed)return false;
  const keys=['ean','name','brand','category','packageSize','unit','store','format','productId','retailerSku','apiProductCode','apiPurchaseUnit','url'] as const;
  if(keys.some(key=>source[key]!==reviewed[key])||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1
    ||item.id!==reviewed.productId||item.ean!==reviewed.ean||item.code!==reviewed.retailerSku||item.name!==reviewed.name||item.url!==reviewed.url
    ||item.unit?.name!=='szt.'||item.unit.floating_point!==false||item.package!=='0')throw Error('product_package_not_confirmed');
  if(item.producer?.id!==57||item.producer.name!=='Mapei')throw Error('product_brand_not_confirmed');
  return true;
}
