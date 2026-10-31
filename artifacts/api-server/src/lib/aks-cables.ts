import type {RetailSource} from './retail-pages';

// Four separately identified purchase units in the manufacturer's declaration.
// Never alias them to legacy retail GTINs 5904617573771/5904617573764, change
// cross-section by price tier or read an op./szt. price as the price of a metre.
// source: https://media.adeo.com/media/4774947/media.pdf (AKS declaration015/2025, p1)
export const AKS_CABLE_SOURCES: readonly RetailSource[] = [
  // source: https://www.abud.pl/product-pol-65373-Przewod-elektryczny-3x1-5mm2-YDYP-5m-Bialy-AKS-Zielonka.html
  {id:'abud-aks-ydyp-3x15-5m',ean:'5901602190944',name:'Przewód elektryczny 3x1,5mm2 YDYP 5m Biały AKS Zielonka',brand:'AKS Zielonka',category:'wire',packageSize:5,unit:'mb',store:'ABUD',format:'idosell',productId:65373,apiPurchaseUnit:'szt.',variant:['3x1,5mm2','5m'],pickupRequiresConfirmation:true,url:'https://www.abud.pl/product-pol-65373-Przewod-elektryczny-3x1-5mm2-YDYP-5m-Bialy-AKS-Zielonka.html',imageUrl:'https://www.abud.pl/hpeciai/63d002db68a8e4b49f22986e04d3d3c5/pol_pl_Przewod-elektryczny-3x1-5mm2-YDYP-5m-Bialy-AKS-Zielonka-65373_1.webp'},
  // source: https://www.abud.pl/product-pol-50450-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x1-5-100m.html
  {id:'abud-aks-ydyp-3x15-100m',ean:'5904617579735',name:'Przewód elektryczny AKS ZIELONKA YDYP 3x1,5 (100m)',brand:'AKS Zielonka',category:'wire',packageSize:100,unit:'mb',store:'ABUD',format:'idosell',productId:50450,apiPurchaseUnit:'op.',variant:['3x1,5','100m'],pickupRequiresConfirmation:true,url:'https://www.abud.pl/product-pol-50450-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x1-5-100m.html',imageUrl:'https://www.abud.pl/hpeciai/b5a27da15d1eb3073ec3741e9d64a4dc/pol_pl_Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x1-5-100m-50450_1.webp'},
  // source: https://www.abud.pl/product-pol-6900-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-25m.html
  {id:'abud-aks-ydyp-3x25-25m',ean:'5904617578721',name:'Przewód elektryczny AKS ZIELONKA YDYP 3x2,5 (25m)',brand:'AKS Zielonka',category:'wire',packageSize:25,unit:'mb',store:'ABUD',format:'idosell',productId:6900,apiPurchaseUnit:'op.',variant:['3x2,5','25m'],pickupRequiresConfirmation:true,url:'https://www.abud.pl/product-pol-6900-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-25m.html',imageUrl:'https://www.abud.pl/hpeciai/b3e45b96a86d1ae7a0ce0efd7442665c/pol_pl_Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-25m-6900_1.webp'},
  // source: https://www.abud.pl/product-pol-50414-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-100m.html
  {id:'abud-aks-ydyp-3x25-100m',ean:'5904617579759',name:'Przewód elektryczny AKS ZIELONKA YDYP 3x2,5 (100m)',brand:'AKS Zielonka',category:'wire',packageSize:100,unit:'mb',store:'ABUD',format:'idosell',productId:50414,apiPurchaseUnit:'op.',variant:['3x2,5','100m'],pickupRequiresConfirmation:true,url:'https://www.abud.pl/product-pol-50414-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-100m.html',imageUrl:'https://www.abud.pl/hpeciai/b5a27da15d1eb3073ec3741e9d64a4dc/pol_pl_Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-100m-50414_1.webp'},
  // source: https://hipper.pl/przewod-elektroenergetyczny-ydyp-3-x-2-5-mm2-450-750-v-25-m-aks-zielonka-956340429
  {id:'hipper-aks-ydyp-3x25-25m',ean:'5904617578721',name:'Przewód elektroenergetyczny YDYP 3 x 2,5 mm2 450/750 V 25 m AKS Zielonka',brand:'AKS Zielonka',category:'wire',packageSize:25,unit:'mb',store:'HIPPER',format:'certusoft',productId:956340429,retailerUnitId:956397306,apiPurchaseUnit:'szt',variant:['3 x 2,5','25 m'],pickupRequiresConfirmation:true,url:'https://hipper.pl/przewod-elektroenergetyczny-ydyp-3-x-2-5-mm2-450-750-v-25-m-aks-zielonka-956340429'},
];

export function isReviewedAksCableSource(source: RetailSource): boolean {
  const reviewed=AKS_CABLE_SOURCES.find(s=>s.id===source.id);
  const identity=(s:RetailSource)=>[s.id,s.ean,s.name,s.brand,s.category,s.packageSize,s.unit,s.store,s.format,s.productId,s.retailerUnitId,s.apiPurchaseUnit,s.url,s.variant];
  return Boolean(reviewed)&&JSON.stringify(identity(source))===JSON.stringify(identity(reviewed!))&&(source.purchaseMultiple??1)===1&&(source.minimumPackages??1)===1&&source.skuIdentity===undefined;
}
