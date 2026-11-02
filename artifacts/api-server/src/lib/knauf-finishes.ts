import type {RetailSource} from './retail-pages';

// Exact manufacturer variants, not aliases of Kreisel GW180 or Fill&Finish Light.
// source: https://knauf.com/pl-PL/p/produkt/knauf-super-finish-11410_0120
export const KNAUF_FINISH_SOURCES: readonly RetailSource[] = [
  // source: https://www.abud.pl/product-pol-27268-Gotowa-masa-szpachlowa-Super-Finish-5-4-kg-Knauf.html
  {id:'abud-knauf-superfinish-54kg',ean:'5901793357959',name:'Gotowa masa szpachlowa Super Finish 5,4 kg Knauf',brand:'Knauf',category:'skim-coat',packageSize:5.4,unit:'kg',store:'ABUD',format:'idosell',productId:27268,apiPurchaseUnit:'szt.',variant:['Super Finish','5,4 kg'],pickupRequiresConfirmation:true,url:'https://www.abud.pl/product-pol-27268-Gotowa-masa-szpachlowa-Super-Finish-5-4-kg-Knauf.html',imageUrl:'https://www.abud.pl/hpeciai/ee6f4a05d00ce5080a2896b3ba2e256c/pol_pl_Gotowa-masa-szpachlowa-Super-Finish-5-4-kg-Knauf-27268_1.webp'},
  // source: https://www.abud.pl/product-pol-42372--Gotowa-Masa-szpachlowa-Knauf-Super-finish-28kg.html
  {id:'abud-knauf-superfinish-28kg',ean:'5901793357935',name:' Gotowa Masa szpachlowa Knauf Super finish 28kg ',brand:'Knauf',category:'skim-coat',packageSize:28,unit:'kg',store:'ABUD',format:'idosell',productId:42372,apiPurchaseUnit:'szt.',variant:['Super finish','28kg'],pickupRequiresConfirmation:true,url:'https://www.abud.pl/product-pol-42372--Gotowa-Masa-szpachlowa-Knauf-Super-finish-28kg.html',imageUrl:'https://www.abud.pl/hpeciai/8da3f584f3e0b08cab351f35a22ee7b6/pol_pl_-Gotowa-Masa-szpachlowa-Knauf-Super-finish-28kg-42372_1.webp'},
  // source: https://realbud.com/pl/p/Gladz-KNAUF-SUPER-FINISH-28-kg%2C-gotowa-masa-szpachlowa/75056672
  {id:'realbud-knauf-superfinish-28kg',ean:'5901793357935',name:'Gładź KNAUF SUPER FINISH 28 kg, gotowa masa szpachlowa',brand:'Knauf',category:'skim-coat',packageSize:28,unit:'kg',store:'Realbud',format:'shoper-api',productId:75056672,apiProductCode:'18587',retailerSku:'18587',apiPurchaseUnit:'szt.',variant:['Super Finish','28 kg'],pickupRequiresConfirmation:true,url:'https://realbud.com/pl/p/Gladz-KNAUF-SUPER-FINISH-28-kg%2C-gotowa-masa-szpachlowa/75056672',imageUrl:'https://www.abud.pl/hpeciai/8da3f584f3e0b08cab351f35a22ee7b6/pol_pl_-Gotowa-Masa-szpachlowa-Knauf-Super-finish-28kg-42372_1.webp'},
  // source: https://sklep.sewera.pl/szpachla-do-spoinowania-super-finish-28kg-knauf-p15481
  {"id":"sewera-knauf-superfinish-28kg","ean":"5901793357935","name":"Szpachla do spoinowania Super Finish 28kg Knauf","brand":"Knauf","category":"skim-coat","packageSize":28,"unit":"kg","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["Super Finish","28kg"],"pickupRequiresConfirmation":true,"url":"https://sklep.sewera.pl/szpachla-do-spoinowania-super-finish-28kg-knauf-p15481","imageUrl":"https://sklep.sewera.pl/photo/281568/szpachla-do-spoinowania-super-finish-28kg-knauf.webp"},
];

/** One native szt. is one sealed 28 kg bucket. Missing native weight is not a
 * shipping-weight estimate; freight still needs the actual complete basket. */
export function confirmKnaufFinishPurchase(item:Record<string,any>,source:RetailSource):void {
  if(source.id!=='realbud-knauf-superfinish-28kg')return;
  const reviewed=KNAUF_FINISH_SOURCES[2];
  const keys=['ean','name','brand','category','packageSize','unit','store','format','productId','retailerSku','apiProductCode','apiPurchaseUnit','url'] as const;
  if(keys.some(key=>source[key]!==reviewed[key])||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1
    ||item.id!==reviewed.productId||item.ean!==reviewed.ean||item.code!==reviewed.retailerSku||item.name!==reviewed.name||item.url!==reviewed.url
    ||item.unit?.name!=='szt.'||item.unit.floating_point!==false||item.package!=='0'||item.producer?.id!==13||item.producer.name!=='Knauf')throw Error('product_package_not_confirmed');
}

/** Exact Sewera purchase unit for one factory 28 kg bucket, not kilograms. */
export function confirmKnaufFinishSource(source:RetailSource):void{
  if(source.id!=='sewera-knauf-superfinish-28kg')return;
  const reviewed=KNAUF_FINISH_SOURCES.find(s=>s.id===source.id)!;
  const keys=['ean','name','brand','category','packageSize','unit','store','format','retailUnit','url'] as const;
  if(keys.some(key=>source[key]!==reviewed[key])||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1)throw Error('product_package_not_confirmed');
}
