import type {RetailSource} from './retail-pages';
// One native opk. is one 10 m² roll. Published m² and package prices must agree.
// source: https://arbiton.com/content/uploads/ARBITON-underlayments-2025.pdf
export const TOPBODEN_UNDERLAY_SOURCES:readonly RetailSource[]=[
  // source: https://topboden.pl/podklad-pod-panele/arbiton-optima-thermo-aquastop-podklady-pod-panele-laminowane
  {"id":"topboden-optima-thermo-aquastop-10m2","ean":"5905167881811","name":"Podkład pod panele Arbiton Optima Thermo Aquastop - 1.5mm - do paneli laminowanych","brand":"Arbiton","category":"underlay","packageSize":10,"unit":"m2","store":"TopBoden","format":"topboden-api","productUuid":"72ace8a7-643a-4f87-a517-e98e05d476c0","apiPurchaseUnit":"m<sup>2</sup>","variant":["Optima","Thermo","Aquastop"],"pickupRequiresConfirmation":true,"url":"https://topboden.pl/podklad-pod-panele/arbiton-optima-thermo-aquastop-podklady-pod-panele-laminowane","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167881811_P_02.webp"},
  // source: https://topboden.pl/podklad-pod-panele/arbiton-optima-aquastop-podklady-pod-panele-laminowane
  {"id":"topboden-optima-aquastop-10m2","ean":"5905167881804","name":"Podkład pod panele Arbiton Optima Aquastop - 2mm - do paneli laminowanych","brand":"Arbiton","category":"underlay","packageSize":10,"unit":"m2","store":"TopBoden","format":"topboden-api","productUuid":"fb3e962e-5389-4fca-b7d0-4e63d2c1b29d","apiPurchaseUnit":"m<sup>2</sup>","variant":["Optima","Aquastop"],"pickupRequiresConfirmation":true,"url":"https://topboden.pl/podklad-pod-panele/arbiton-optima-aquastop-podklady-pod-panele-laminowane","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167881804_P_02.webp"},
];
export function confirmTopbodenUnderlaySource(source:RetailSource):boolean{
  const reviewed=TOPBODEN_UNDERLAY_SOURCES.find(s=>s.id===source.id);if(!reviewed)return false;
  const fields=['id','ean','name','brand','category','packageSize','unit','store','format','productUuid','apiPurchaseUnit','url'] as const;
  if(fields.some(key=>source[key]!==reviewed[key])||source.variant?.join('|')!==reviewed.variant?.join('|')||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1)throw Error('product_package_not_confirmed');
  return true;
}
