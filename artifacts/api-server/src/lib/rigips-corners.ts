import type {RetailSource} from './retail-pages';
import {cleanHtml,htmlLabel} from './retail-microdata';

// Factory numbers 11511804 / 11511805 identify different complete profiles.
// Sewera's native SZT buys one profile; the factory bundle contains 50.
// source: https://www.rigips.pl/sites/default/files/2025-06/cennik_24-06-2025.pdf
export const RIGIPS_CORNER_SOURCES:readonly RetailSource[]=[
  // source: https://sklep.sewera.pl/naroznik-aluminiowy-23-5x23-5mm-2-5m-rigips-p7501
  {id:'sewera-rigips-alu-corner-235-25m',ean:'5905637118041',name:'Narożnik aluminiowy 23,5x23,5mm 2,5m Rigips',brand:'Rigips',category:'drywall-accessory',packageSize:2.5,unit:'mb',store:'Sewera',format:'sewera',retailUnit:'SZT',variant:['23,5x23,5mm','2,5m'],pickupRequiresConfirmation:true,url:'https://sklep.sewera.pl/naroznik-aluminiowy-23-5x23-5mm-2-5m-rigips-p7501',imageUrl:'https://sklep.sewera.pl/photo/195931/naroznik-aluminiowy-23-5x23-5mm-2-5m-rigips.webp'},
  // source: https://sklep.sewera.pl/naroznik-aluminiowy-23-5x23-5mm-3m-rigips-p7500
  {id:'sewera-rigips-alu-corner-235-3m',ean:'5905637118058',name:'Narożnik aluminiowy 23,5x23,5mm 3m Rigips',brand:'Rigips',category:'drywall-accessory',packageSize:3,unit:'mb',store:'Sewera',format:'sewera',retailUnit:'SZT',variant:['23,5x23,5mm','3m'],pickupRequiresConfirmation:true,url:'https://sklep.sewera.pl/naroznik-aluminiowy-23-5x23-5mm-3m-rigips-p7500',imageUrl:'https://sklep.sewera.pl/photo/195935/naroznik-aluminiowy-23-5x23-5mm-3m-rigips.webp'},
];

/** A price for one 2.5/3 m bar must never become a metre or 50-bar price. */
export function confirmRigipsCorner(html:string,product:Record<string,any>,source:RetailSource):void{
  const reviewed=RIGIPS_CORNER_SOURCES.find(s=>s.id===source.id);if(!reviewed)return;
  if(!(['ean','name','brand','category','packageSize','unit','store','format','retailUnit','url','imageUrl','pickupRequiresConfirmation'] as const).every(k=>source[k]===reviewed[k])
    ||source.variant?.join('|')!==reviewed.variant!.join('|')||(source.minimumPackages??1)!==1||(source.purchaseMultiple??1)!==1||source.skuIdentity!==undefined)throw Error('product_package_not_confirmed');
  const safe=cleanHtml(html),code=source.packageSize===2.5?'11511804':'11511805';
  if(product.name!==source.name||product.gtin13!==source.ean||product.image!==source.imageUrl||htmlLabel(safe,'Producent:','strong')!=='RIGIPS'||htmlLabel(safe,'Kod producenta:','strong')!==code)throw Error('product_identity_not_confirmed');
}
