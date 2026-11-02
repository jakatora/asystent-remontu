import type {RetailSource} from './retail-pages';

// Same single-component Woder E formulation; other Woder systems and unreviewed
// GTIN revisions are not interchangeable. Shipping weight is not pack contents.
// source: https://www.atlas.com.pl/produkt/atlas-szybkoschnaca-folia-w-plynie-woder-e/
export const ATLAS_WODER_E_SOURCES:readonly RetailSource[]=[
  // source: https://lobo.pl/atlas-woder-e-szybkoschnaca-folia-w-plynie-2-kg
  {"id":"lobo-atlas-woder-e-2kg","ean":"5905400514483","name":"ATLAS WODER E Szybkoschnąca folia w płynie 2 KG","brand":"Atlas","category":"waterproofing","packageSize":2,"unit":"kg","store":"Lobo","format":"shoper-api","productId":55847,"apiProductCode":"n.Woder E - 02","retailerSku":"n.Woder E - 02","apiPurchaseUnit":"szt.","variant":["WODER E","2 KG"],"pickupRequiresConfirmation":true,"url":"https://lobo.pl/atlas-woder-e-szybkoschnaca-folia-w-plynie-2-kg","imageUrl":"https://lobo.pl/environment/cache/images/productGfx_129684_500_500/ATLAS-WODER-E-Szybkoschnaca-folia-w-plynie-2-KG.webp"},
  // source: https://lobo.pl/atlas-woder-e-szybkoschnaca-folia-w-plynie-5-kg
  {"id":"lobo-atlas-woder-e-5kg","ean":"5905400514490","name":"ATLAS WODER E Szybkoschnąca folia w płynie 5 KG","brand":"Atlas","category":"waterproofing","packageSize":5,"unit":"kg","store":"Lobo","format":"shoper-api","productId":54319,"apiProductCode":"n.WODER E-055","retailerSku":"n.WODER E-055","apiPurchaseUnit":"szt.","variant":["WODER E","5 KG"],"pickupRequiresConfirmation":true,"url":"https://lobo.pl/atlas-woder-e-szybkoschnaca-folia-w-plynie-5-kg","imageUrl":"https://lobo.pl/environment/cache/images/productGfx_122194_500_500/ATLAS-WODER-E-Szybkoschnaca-folia-w-plynie-5-KG.webp"},
  // source: https://lobo.pl/atlas-woder-e-szybkoschnaca-folia-w-plynie-15-kg
  {"id":"lobo-atlas-woder-e-15kg","ean":"5905400514506","name":"ATLAS WODER E Szybkoschnąca folia w płynie 15 KG","brand":"Atlas","category":"waterproofing","packageSize":15,"unit":"kg","store":"Lobo","format":"shoper-api","productId":59282,"apiProductCode":"n.Woder E - 15","retailerSku":"n.Woder E - 15","apiPurchaseUnit":"szt.","variant":["WODER E","15 KG"],"pickupRequiresConfirmation":true,"url":"https://lobo.pl/atlas-woder-e-szybkoschnaca-folia-w-plynie-15-kg","imageUrl":"https://lobo.pl/environment/cache/images/productGfx_142134_500_500/ATLAS-WODER-E-Szybkoschnaca-folia-w-plynie-15-KG.webp"},
  // source: https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-2kg-atlas-p11568
  {"id":"sewera-atlas-woder-e-2kg","ean":"5905400514483","name":"Folia w płynie szybkoschnąca Woder E 2kg Atlas","brand":"Atlas","category":"waterproofing","packageSize":2,"unit":"kg","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["Woder E","2kg"],"pickupRequiresConfirmation":true,"url":"https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-2kg-atlas-p11568","imageUrl":"https://sklep.sewera.pl/photo/186397/folia-w-plynie-szybkoschnaca-woder-e-2kg-atlas.webp"},
  // source: https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-5kg-atlas-p11569
  {"id":"sewera-atlas-woder-e-5kg","ean":"5905400514490","name":"Folia w płynie szybkoschnąca Woder E 5kg Atlas","brand":"Atlas","category":"waterproofing","packageSize":5,"unit":"kg","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["Woder E","5kg"],"pickupRequiresConfirmation":true,"url":"https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-5kg-atlas-p11569","imageUrl":"https://sklep.sewera.pl/photo/186396/folia-w-plynie-szybkoschnaca-woder-e-5kg-atlas.webp"},
];

/** Only these reviewed whole buckets may use the native retail purchase unit. */
export function confirmAtlasWoderSource(source:RetailSource):void{
  const reviewed=ATLAS_WODER_E_SOURCES.find(row=>row.id===source.id);
  if(!reviewed)return;
  const keys=['ean','name','brand','category','packageSize','unit','store','format','productId','retailerSku','apiProductCode','apiPurchaseUnit','retailUnit','url'] as const;
  if(keys.some(key=>source[key]!==reviewed[key])||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1)throw Error('product_package_not_confirmed');
}

export function confirmAtlasWoderPurchase(item:Record<string,any>,source:RetailSource):void{
  const reviewed=ATLAS_WODER_E_SOURCES.find(row=>row.id===source.id&&row.store==='Lobo');
  if(!reviewed)return;
  confirmAtlasWoderSource(source);
  if(item.id!==reviewed.productId||item.ean!==reviewed.ean||item.name!==reviewed.name||item.code!==reviewed.apiProductCode||item.url!==reviewed.url
    ||item.producer?.id!==81||item.producer.name!=='ATLAS'||item.unit?.name!=='szt.'||item.unit.floating_point!==false||item.package!=='0')throw Error('product_package_not_confirmed');
}
