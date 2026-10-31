import type {RetailSource} from './retail-pages';

/** A native HIPPER piece buys one complete roll, not one metre or a carton.
 * Exact GTINs and roll lengths were checked against the manufacturer.
 */
export const NORGIPS_JOINT_TAPE_SOURCES: readonly RetailSource[] = [
  // source: https://hipper.pl/tasma-papierowa-z-wkladka-metalowa-50-mm-norgips-2682508803
  // source: https://norgips.pl/media/repository/0/306/47772594ab104a20ab31ac3f7ea22975/NORGIPS_PL_KT_akcesoria_tasma_papierow_784Tcv5.pdf
  {id:'hipper-norgips-metal-paper-50x30',ean:'5907651699940',name:'Taśma papierowa z wkładką metalową 50 mm Norgips',brand:'Norgips',category:'drywall-accessory',packageSize:30,unit:'m',store:'HIPPER',format:'certusoft',productId:2682508803,retailerUnitId:2682508830,apiPurchaseUnit:'szt',variant:['50 mm','wkładką metalową'],pickupRequiresConfirmation:true,url:'https://hipper.pl/tasma-papierowa-z-wkladka-metalowa-50-mm-norgips-2682508803',imageUrl:'https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos|PhotoMed|F2DBF33D-6B74-4EA1-96C8-6B552C5E2730|1/Taśma papierowa z wkładką metalową 50 mm Norgips.webp'},
  // source: https://hipper.pl/tasma-samoprzylepna-z-wlokna-szklanego-45-mm-norgips-2682509844
  // source: https://norgips.pl/media/repository/0/302/821d0d1d23d644d2b9e7ec418df53b90/NORGIPS_PL_KT_akcesoria_tasma_samoprzy_iKwHTWR.pdf
  {id:'hipper-norgips-mesh-45x153',ean:'5907651699995',name:'Taśma samoprzylepna z włókna szklanego 45 mm Norgips',brand:'Norgips',category:'drywall-accessory',packageSize:153,unit:'m',store:'HIPPER',format:'certusoft',productId:2682509844,retailerUnitId:2682509871,apiPurchaseUnit:'szt',variant:['45 mm','włókna szklanego'],pickupRequiresConfirmation:true,url:'https://hipper.pl/tasma-samoprzylepna-z-wlokna-szklanego-45-mm-norgips-2682509844',imageUrl:'https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos|PhotoMed|9837026A-D482-48CC-9F75-C4F4177FF3E5|1/Taśma samoprzylepna z włókna szklanego 45 mm Norgips.webp'},
];

export function isReviewedNorgipsJointTape(source: RetailSource): boolean {
  return NORGIPS_JOINT_TAPE_SOURCES.some(reviewed =>
    (['id','ean','name','brand','category','packageSize','unit','store','format','productId','retailerUnitId','apiPurchaseUnit','url'] as const)
      .every(key => source[key] === reviewed[key])
    && source.variant?.join('|') === reviewed.variant?.join('|')
    && (source.purchaseMultiple ?? 1) === 1);
}
