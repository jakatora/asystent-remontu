import type {RetailSource} from './retail-pages';

/** Separate manufacturer GTINs and physical litre packs. No substitution
 * between PROFI and TRANSPARENT, or between 5 and 10 litre cans. */
// source: https://dm.henkel-dam.com/is/content/henkel/Cennik-Henkel-ACB-17-03-2025 (p.4, product/size/GTIN only; not a current retail price)
export const CERESIT_PRIMER_SOURCES:readonly RetailSource[]=[
  // source: https://buduj24.pl/produkt/16299,ceresit-grunt-ct17-transparent-gleboko-penetrujacy-5l
  {"id":"buduj24-ceresit-ct17-transparent-5l","ean":"5900089218653","name":"CERESIT Grunt CT17 TRANSPARENT głęboko penetrujący 5L","brand":"Ceresit","category":"primer","packageSize":5,"unit":"l","store":"Buduj24","format":"buduj24","productId":16299,"variant":["5L"],"packageDescription":"5L","url":"https://buduj24.pl/produkt/16299,ceresit-grunt-ct17-transparent-gleboko-penetrujacy-5l","imageUrl":"https://buduj24.pl/files/_product/16299/5900089218653_1.webp","pickupRequiresConfirmation":true},
  // source: https://buduj24.pl/produkt/10218,ceresit-grunt-gleboko-penetrujacy-ct17-profi-primer-10l
  {"id":"buduj24-ceresit-ct17-profi-10l","ean":"5900089617081","name":"CERESIT Grunt głęboko penetrujący CT17 PROFI PRIMER 10L","brand":"Ceresit","category":"primer","packageSize":10,"unit":"l","store":"Buduj24","format":"buduj24","productId":10218,"variant":["10L"],"packageDescription":"10L","url":"https://buduj24.pl/produkt/10218,ceresit-grunt-gleboko-penetrujacy-ct17-profi-primer-10l","imageUrl":"https://buduj24.pl/files/_product/10218/5900089617081_1.webp","pickupRequiresConfirmation":true},
  // source: https://buduj24.pl/produkt/10217,ceresit-grunt-gleboko-penetrujacy-ct17-profi-primer-5l
  {"id":"buduj24-ceresit-ct17-profi-5l","ean":"5900089617050","name":"CERESIT Grunt głęboko penetrujący CT17 PROFI PRIMER 5L","brand":"Ceresit","category":"primer","packageSize":5,"unit":"l","store":"Buduj24","format":"buduj24","productId":10217,"variant":["5L"],"packageDescription":"5L","url":"https://buduj24.pl/produkt/10217,ceresit-grunt-gleboko-penetrujacy-ct17-profi-primer-5l","imageUrl":"https://buduj24.pl/files/_product/10217/5900089617050_1.webp","pickupRequiresConfirmation":true},
  // source: https://buduj24.pl/produkt/15394,ceresit-grunt-gleboko-penetrujacy-ct17-transparent-10l
  {"id":"buduj24-ceresit-ct17-transparent-10l","ean":"5900089218677","name":"CERESIT Grunt głęboko penetrujący CT17 TRANSPARENT 10L","brand":"Ceresit","category":"primer","packageSize":10,"unit":"l","store":"Buduj24","format":"buduj24","productId":15394,"variant":["10L"],"packageDescription":"10L","url":"https://buduj24.pl/produkt/15394,ceresit-grunt-gleboko-penetrujacy-ct17-transparent-10l","imageUrl":"https://buduj24.pl/files/_product/15394/5900089218677_1.webp","pickupRequiresConfirmation":true},
];

export function confirmCeresitPrimerSource(source:RetailSource):void{
  const reviewed=CERESIT_PRIMER_SOURCES.find(row=>row.id===source.id);
  const keys=['id','ean','name','brand','category','packageSize','unit','store','format','productId','packageDescription','url','imageUrl'] as const;
  if(!reviewed||!keys.every(key=>source[key]===reviewed[key])||source.variant?.join('|')!==reviewed.variant?.join('|')
    ||(source.purchaseMultiple??1)!==1||(source.minimumPackages??1)!==1||source.skuIdentity!==undefined)throw Error('product_package_not_confirmed');
}
