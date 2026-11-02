import type {RetailSource} from './retail-pages';
// Exact original retail kit; source: https://alnar.pl/wolfcraft-zestaw-do-montazu-paneli-p-6949.html
export const ALNAR_SOURCE:RetailSource={"id":"alnar-wolfcraft-6931000-kit","ean":"4006885693104","name":"WOLFCRAFT ZESTAW DO MONTAŻU PANELI","brand":"Wolfcraft","category":"laminate-installation-kit","packageSize":1,"unit":"szt","store":"ALNAR","format":"alnar","productId":6949,"retailerSku":"WF6931000","variant":["paneli"],"pickupRequiresConfirmation":true,"url":"https://alnar.pl/wolfcraft-zestaw-do-montazu-paneli-p-6949.html","imageUrl":"https://alnar.pl/images/6931000.jpg"};
export const ALNAR_SOURCES:readonly RetailSource[]=[ALNAR_SOURCE];
const sourceId=ALNAR_SOURCE.id;
export function confirmAlnarSource(source:RetailSource):void {
 if(source.id!==sourceId&&source.store!=='ALNAR'&&source.format!=='alnar')return;
 const keys=['id','ean','name','brand','category','packageSize','unit','store','format','productId','retailerSku','url','imageUrl'] as const;
 if(keys.some(key=>source[key]!==ALNAR_SOURCE[key])||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1)throw Error('invalid_basket');
}

