import type {RetailSource} from './retail-pages';

/** One purchase unit is one 50 m roll. Width, colour and GTIN remain separate;
 * none of these products replaces a tape already selected in a project. */
export const PAINTING_TAPE_SOURCES: readonly RetailSource[] = [
  // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zwenatrz-25mm-x-50m-niebieska/648
  // source: https://sklep.sewera.pl/tasma-malarska-niebieska-25mmx50m-p6965
  {"id":"rabdom-tape-blue25","ean":"5907758507308","name":"BLUE DOLPHIN Taśma malarska papierowa do wnętrz i na zwenątrz 25mm x 50m niebieska","brand":"Blue Dolphin","category":"masking-tape","packageSize":50,"unit":"mb","store":"Rab-Dom","format":"shoper-api","productId":648,"retailerSku":"18948","apiProductCode":"18948","apiPurchaseUnit":"szt.","variant":["25mm","50m"],"url":"https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zwenatrz-25mm-x-50m-niebieska/648","imageUrl":"https://sklep.sewera.pl/photo/23322/tasma-malarska-niebieska-25mmx50m.webp","pickupRequiresConfirmation":true},
  // source: https://sklep.sewera.pl/tasma-malarska-niebieska-25mmx50m-p6965
  // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zwenatrz-25mm-x-50m-niebieska/648
  {"id":"sewera-tape-blue25","ean":"5907758507308","name":"Taśma malarska niebieska 25mmx50m","brand":"Blue Dolphin","category":"masking-tape","packageSize":50,"unit":"mb","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["25","50"],"url":"https://sklep.sewera.pl/tasma-malarska-niebieska-25mmx50m-p6965","imageUrl":"https://sklep.sewera.pl/photo/23322/tasma-malarska-niebieska-25mmx50m.webp","pickupRequiresConfirmation":true},
  // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zewnatrz-48mm-x-50m-niebieska/548
  // source: https://sklep.sewera.pl/tasma-malarska-niebieska-48mmx50m-p6969
  {"id":"rabdom-tape-blue48","ean":"5907758507292","name":"BLUE DOLPHIN Taśma malarska papierowa do wnętrz i na zewnątrz 48mm x 50m niebieska","brand":"Blue Dolphin","category":"masking-tape","packageSize":50,"unit":"mb","store":"Rab-Dom","format":"shoper-api","productId":548,"retailerSku":"18913","apiProductCode":"18913","apiPurchaseUnit":"szt.","variant":["48mm","50m"],"url":"https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zewnatrz-48mm-x-50m-niebieska/548","imageUrl":"https://sklep.sewera.pl/photo/23329/tasma-malarska-niebieska-48mm-x-50m-blue-dolphin.webp","pickupRequiresConfirmation":true},
  // source: https://sklep.sewera.pl/tasma-malarska-niebieska-48mmx50m-p6969
  // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zewnatrz-48mm-x-50m-niebieska/548
  {"id":"sewera-tape-blue48","ean":"5907758507292","name":"Taśma malarska niebieska 48mm x 50m Blue Dolphin","brand":"Blue Dolphin","category":"masking-tape","packageSize":50,"unit":"mb","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["48","50"],"url":"https://sklep.sewera.pl/tasma-malarska-niebieska-48mmx50m-p6969","imageUrl":"https://sklep.sewera.pl/photo/23329/tasma-malarska-niebieska-48mm-x-50m-blue-dolphin.webp","pickupRequiresConfirmation":true},
  // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-38mm-x-50m/3745
  // source: https://sklep.sewera.pl/tasma-malarska-papierowa-38mm-x-50m-zolta-blue-dolphin-p22108
  {"id":"rabdom-tape-yellow38","ean":"5907758504789","name":"BLUE DOLPHIN Taśma malarska papierowa 38mm x 50m","brand":"Blue Dolphin","category":"masking-tape","packageSize":50,"unit":"mb","store":"Rab-Dom","format":"shoper-api","productId":3745,"retailerSku":"18965","apiProductCode":"18965","apiPurchaseUnit":"szt.","variant":["38mm","50m"],"url":"https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-38mm-x-50m/3745","imageUrl":"https://sklep.sewera.pl/photo/356176/tasma-malarska-papierowa-38mm-x-50m-zolta-blue-dolphin.webp","pickupRequiresConfirmation":true},
  // source: https://sklep.sewera.pl/tasma-malarska-papierowa-38mm-x-50m-zolta-blue-dolphin-p22108
  // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-38mm-x-50m/3745
  {"id":"sewera-tape-yellow38","ean":"5907758504789","name":"Taśma malarska papierowa 38mm x 50m żółta Blue Dolphin","brand":"Blue Dolphin","category":"masking-tape","packageSize":50,"unit":"mb","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["38","50"],"url":"https://sklep.sewera.pl/tasma-malarska-papierowa-38mm-x-50m-zolta-blue-dolphin-p22108","imageUrl":"https://sklep.sewera.pl/photo/356176/tasma-malarska-papierowa-38mm-x-50m-zolta-blue-dolphin.webp","pickupRequiresConfirmation":true},
  // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-48mm-x-50m/3744
  // source: https://sklep.sewera.pl/tasma-malarska-papierowa-48mmx50m-p6963
  {"id":"rabdom-tape-yellow48","ean":"5907758504581","name":"BLUE DOLPHIN Taśma malarska papierowa 48mm x 50m","brand":"Blue Dolphin","category":"masking-tape","packageSize":50,"unit":"mb","store":"Rab-Dom","format":"shoper-api","productId":3744,"retailerSku":"18964","apiProductCode":"18964","apiPurchaseUnit":"szt.","variant":["48mm","50m"],"url":"https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-48mm-x-50m/3744","imageUrl":"https://sklep.sewera.pl/photo/356183/tasma-malarska-papierowa-48mm-x-50m-blue-dolphin.webp","pickupRequiresConfirmation":true},
  // source: https://sklep.sewera.pl/tasma-malarska-papierowa-48mmx50m-p6963
  // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-48mm-x-50m/3744
  {"id":"sewera-tape-yellow48","ean":"5907758504581","name":"Taśma malarska papierowa 48mm x 50m Blue Dolphin","brand":"Blue Dolphin","category":"masking-tape","packageSize":50,"unit":"mb","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["48","50"],"url":"https://sklep.sewera.pl/tasma-malarska-papierowa-48mmx50m-p6963","imageUrl":"https://sklep.sewera.pl/photo/356183/tasma-malarska-papierowa-48mm-x-50m-blue-dolphin.webp","pickupRequiresConfirmation":true},
];

export function reviewedPaintingTape(source:RetailSource):RetailSource|undefined {
  const reviewed=PAINTING_TAPE_SOURCES.find(row=>row.id===source.id);
  if(!reviewed)return undefined;
  const keys=['id','ean','name','brand','category','packageSize','unit','store','format','productId','retailerSku','apiProductCode','apiPurchaseUnit','retailUnit','url'] as const;
  if(keys.some(key=>source[key]!==reviewed[key])||source.variant?.join('|')!==reviewed.variant?.join('|')
    ||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1)throw Error('product_package_not_confirmed');
  return reviewed;
}

export function confirmPaintingTapePurchase(item:Record<string,any>,source:RetailSource):boolean {
  const reviewed=reviewedPaintingTape(source);
  if(!reviewed||reviewed.format!=='shoper-api')return false;
  if(item.id!==reviewed.productId||item.ean!==reviewed.ean||item.name!==reviewed.name||item.code!==reviewed.retailerSku||item.url!==reviewed.url
    ||item.producer?.id!==42||item.producer?.name!=='Blue Dolphin'||item.unit?.name!=='szt.'||item.unit?.floating_point!==false||item.package!=='0')throw Error('product_package_not_confirmed');
  return true;
}
