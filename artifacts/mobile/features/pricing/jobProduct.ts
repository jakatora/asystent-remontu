import {parseCatalogRefreshIdentity,type CatalogRefreshIdentity} from '../../../../lib/pricing-service/src/catalog-refresh';
import {SHARED_SHOP_PRICES} from '@/data/prices/shared-shop-prices';
import type {ShopPrice} from '@/types/domain';

export interface ReviewedJobProduct {
  identity:CatalogRefreshIdentity;
  name:string;
  imageUrl?:string;
  example?:boolean;
}

interface JobProductItem {
  id?:string;name:string;ean?:string;category?:string;unit?:string;
  packaging?:{size:number};shopPrices?:readonly ShopPrice[];
}

/** A generic tool has no GTIN. Display a named example, never pretend all
 * models behind its old shop links are the same product. */
// source: https://sklep.sewera.pl/pedzel-angielski-50mm-kraus-p22518
// source: https://www.kraus.net.pl/pl/oferta/15-test.html
const KRAUS_A50:ReviewedJobProduct={
  identity:{ean:'5904178020035',category:'paint-brush',packageSize:1,unit:'szt'},
  name:'Kraus A50 — pędzel angielski 50 mm',example:true,
  imageUrl:'https://sklep.sewera.pl/photo/359076/pedzel-angielski-50mm-kraus.webp',
};

// source: https://b2b.hardy.pl/hardy-walek-malarski-maxprofi-szer-18-cm-wys-runa-12-mm-z-raczka?c=257
const HARDY_MAXPROFI:ReviewedJobProduct={
  identity:{ean:'5905061052744',category:'paint-roller',packageSize:1,unit:'szt'},
  name:'Hardy Maxprofi — wałek 18 cm, runo 12 mm, z rączką',example:true,
  imageUrl:'https://sklep.sewera.pl/photo/309526/walek-malarski-maxprofi-18cm-runo-12mm-hardy.webp',
};

export function reviewedJobProduct(item:JobProductItem,kind:'material'|'tool'):ReviewedJobProduct|null{
  if(kind==='tool'){
    if(item.shopPrices===SHARED_SHOP_PRICES.brush50mm)return KRAUS_A50;
    if(item.id==='roller'&&item.name==='Wałek malarski 18–22 cm'&&item.shopPrices===SHARED_SHOP_PRICES.roller18cm)return HARDY_MAXPROFI;
    return null;
  }
  // A local ID or a similar name is insufficient to choose a merchant model.
  if(!item.ean||!item.category||!item.packaging||!item.unit)return null;
  try{return {name:item.name,identity:parseCatalogRefreshIdentity({ean:item.ean,category:item.category,packageSize:item.packaging.size,unit:item.unit})};}
  catch{return null;}
}

export function jobProductKey(identity:CatalogRefreshIdentity):string{
  const p=parseCatalogRefreshIdentity(identity);
  return JSON.stringify([p.ean??p.productId,p.category,p.packageSize,p.unit]);
}
