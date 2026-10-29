import type { Product } from '@workspace/db/schema';
import type { Database } from '@workspace/db/repositories';
import type { EstimateDeps, ProductGroup } from './estimate';
import type { ItemQuery, PurchaseOffer } from './types';

export const V33_CABINET_FAMILY = 'v33-easy-kitchen-white-satin-v1' as const;
export const V33_CABINET_FAMILY_NAME = 'V33 Easy Renowacja Kuchnia — biały satyna, dobór opakowań';
export const V33_CABINET_PACKS = [{ean:'3153895149044',size:750},{ean:'3153895149228',size:2000}] as const;
const familyId='remont-family-'+V33_CABINET_FAMILY;
const normalized=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9]/g,'');

// Reviewed same current product/colour/finish in two distinct native cans.
// No fuzzy name/category, client-supplied barcode list or tinted-base substitution.
// source: https://www.v33.pl/v33-product/easy-renowacja-kuchnia/
// source: https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-0%2C75L/7607
// source: https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-2L/7613
export async function resolvePackageFamily(db:Database,deps:EstimateDeps,query:ItemQuery,unit:string|null):Promise<{product:Product;offers:PurchaseOffer[]}|null>{
  if(query.packageFamily!==V33_CABINET_FAMILY||query.ean||query.gtin||query.category!=='cabinet-paint'||unit!=='ml'||normalized(query.normalizedName??'')!==normalized(V33_CABINET_FAMILY_NAME))return null;
  const found:Product[]=[],offers:PurchaseOffer[]=[];
  for(const pack of V33_CABINET_PACKS){
    const product=await deps.findProductByCode(db,{ean:pack.ean});
    if(!product||product.ean!==pack.ean||Number(product.packageSize)!==pack.size||product.packageUnit!=='ml'||product.category!=='cabinet-paint')continue;
    found.push(product);
    offers.push(...(await deps.listOffers(db,product.id)).filter(o=>o.productId===product.id&&Number(o.packageSize)===pack.size&&o.unit==='ml').map(o=>({...o,product})));
  }
  return found.length?{product:{...found[0],id:familyId,name:V33_CABINET_FAMILY_NAME,ean:null,gtin:null,normalizedName:query.normalizedName!,packageSize:null,imageUrl:null},offers}:null;
}

/** When one room permits automatic sizes, share the same physical paint across
 * that request and explicitly sized rooms, preserving their size constraints. */
export function mergePackageFamilyGroups(groups:ProductGroup[]):ProductGroup[]{
  const automatic=groups.find(g=>g.product.id===familyId);
  if(!automatic)return groups;
  const locked=groups.filter(g=>V33_CABINET_PACKS.some(p=>p.ean===g.product.ean)&&g.unit==='ml');
  if(!locked.length)return groups;
  const requiredBySize:Record<string,number>={};
  for(const g of locked){const size=String(Number(g.product.packageSize));requiredBySize[size]=(requiredBySize[size]??0)+g.totalQuantity;}
  const offers=new Map(automatic.offers.map(o=>[o.id,o]));
  for(const g of locked)for(const offer of g.offers)offers.set(offer.id,{...offer,product:g.product});
  const result={...automatic,totalQuantity:automatic.totalQuantity+locked.reduce((n,g)=>n+g.totalQuantity,0),perStageCostGrosze:automatic.perStageCostGrosze+locked.reduce((n,g)=>n+g.perStageCostGrosze,0),offers:[...offers.values()],requiredBySize};
  return groups.filter(g=>!locked.includes(g)).map(g=>g===automatic?result:g);
}
