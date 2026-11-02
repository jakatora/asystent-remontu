import type {RetailSource} from './retail-pages';

// Same manufacturer's GTIN and colour 173 as the existing Sewera offer.
// source: https://hipper.pl/sniezka-barwy-natury-bialy-173-5l-farba-lateksowa-956234361
// source: https://sklep.sewera.pl/barwy-natury-173-majowa-konwalia-5l-p7136
export const HIPPER_PAINT_SOURCES:readonly RetailSource[]=[{
  id:'hipper-sniezka-barwy-173-5l',ean:'5903973139188',name:'Śnieżka Barwy Natury Biały 173 5L farba lateksowa',
  brand:'Śnieżka',category:'paint',packageSize:5,unit:'l',store:'HIPPER',format:'certusoft',
  productId:956234361,retailerUnitId:956413761,apiPurchaseUnit:'szt',pickupRequiresConfirmation:true,
  url:'https://hipper.pl/sniezka-barwy-natury-bialy-173-5l-farba-lateksowa-956234361',
}];

export function isReviewedHipperPaint(source:RetailSource):boolean{
  const reviewed=HIPPER_PAINT_SOURCES.find(row=>row.id===source.id);if(!reviewed)return false;
  for(const key of ['ean','name','brand','category','packageSize','unit','store','format','productId','retailerUnitId','apiPurchaseUnit','url','pickupRequiresConfirmation'] as const){
    if(source[key]!==reviewed[key])throw Error('retailer_unit_not_confirmed');
  }
  if((source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1||source.skuIdentity!==undefined)throw Error('retailer_unit_not_confirmed');
  return true;
}

/** A native szt is one 5 l can, not one litre. Other capacities or colours
 * must be reviewed separately before importing a whole-can price. */
export function confirmHipperPaintCard(card:any,source:RetailSource):void{
  if(!isReviewedHipperPaint(source))return;
  const features=card?.dataSets?.features?.rows,row=card?.dataSets?.itemCard?.rows?.[0];
  if(row?.itemName!==source.name||!Array.isArray(features))throw Error('retailer_unit_not_confirmed');
  for(const[name,value]of [['Pojemność','5 l'],['Symbol koloru','173'],['Marka','Śnieżka'],['Kolekcja','Śnieżka Barwy Natury'],['Wykończenie','Mat'],['Rodzaj','Lateksowa']]){
    const matches=features.filter((row:any)=>row.featureDesc?.trim()===name);
    if(matches.length!==1||matches[0].featureValue!==value)throw Error('retailer_unit_not_confirmed');
  }
}
