import type { Product } from '@workspace/db/schema';
import type { Database } from '@workspace/db/repositories';
import type { EstimateDeps, ProductGroup } from './estimate';
import type { ItemQuery, PurchaseOffer } from './types';
import {REVIEWED_PACKAGE_FAMILIES,reviewedPackageFamily} from './reviewed-package-families';
export * from './reviewed-package-families';

// Reviewed current product/formulation (and paint colour/finish) in exact packs.
// No fuzzy name/category, client-supplied barcode list or tinted-base substitution.
// source: https://www.v33.pl/v33-product/easy-renowacja-kuchnia/
// source: https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-0%2C75L/7607
// source: https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-2L/7613
export async function resolvePackageFamily(db:Database,deps:EstimateDeps,query:ItemQuery,unit:string|null):Promise<{product:Product;offers:PurchaseOffer[]}|null>{
  const family=reviewedPackageFamily(query,unit);
  if(!family)return null;
  const found:Product[]=[],offers:PurchaseOffer[]=[];
  for(const pack of family.packs){
    const product=await deps.findProductByCode(db,{ean:pack.ean});
    if(!product||product.ean!==pack.ean||(product.gtin&&product.gtin!==pack.ean)||Number(product.packageSize)!==pack.size||product.packageUnit!==family.unit||product.category!==family.category)continue;
    found.push(product);
    offers.push(...(await deps.listOffers(db,product.id)).filter(o=>o.productId===product.id&&Number(o.packageSize)===pack.size&&o.unit===family.unit).map(o=>({...o,product})));
  }
  return found.length?{product:{...found[0],id:'remont-family-'+family.key,name:family.name,ean:null,gtin:null,normalizedName:query.normalizedName!,packageSize:null,imageUrl:null},offers}:null;
}

/** When one room permits automatic sizes, share the same reviewed product across
 * that request and explicitly sized rooms, preserving their size constraints. */
export function mergePackageFamilyGroups(groups:ProductGroup[]):ProductGroup[]{
  let result=groups;
  for(const family of REVIEWED_PACKAGE_FAMILIES){
    const automatic=result.find(g=>g.product.id==='remont-family-'+family.key);
    if(!automatic)continue;
    const locked=result.filter(g=>g.unit===family.unit&&g.product.category===family.category&&family.packs.some(p=>p.ean===g.product.ean&&p.size===Number(g.product.packageSize)));
    if(!locked.length)continue;
    const requiredBySize:Record<string,number>={...automatic.requiredBySize};
    for(const g of locked){const size=String(Number(g.product.packageSize));requiredBySize[size]=(requiredBySize[size]??0)+g.totalQuantity;}
    const offers=new Map(automatic.offers.map(o=>[o.id,o]));
    for(const g of locked)for(const offer of g.offers)offers.set(offer.id,{...offer,product:g.product});
    const merged={...automatic,totalQuantity:automatic.totalQuantity+locked.reduce((n,g)=>n+g.totalQuantity,0),perStageCostGrosze:automatic.perStageCostGrosze+locked.reduce((n,g)=>n+g.perStageCostGrosze,0),offers:[...offers.values()],requiredBySize};
    result=result.filter(g=>!locked.includes(g)).map(g=>g===automatic?merged:g);
  }
  return result;
}
