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

// source: https://sklep.sewera.pl/pedzel-lawkowiec-190mm-kraus-p22550
const KRAUS_L19:ReviewedJobProduct={
  identity:{ean:'5904178021308',category:'paint-brush',packageSize:1,unit:'szt'},
  name:'Kraus Ł19 — pędzel ławkowiec 190 mm',example:true,
  imageUrl:'https://sklep.sewera.pl/photo/359210/pedzel-lawkowiec-190mm-kraus.webp',
};

// source: https://sklep.sewera.pl/miara-zwijana-5m-x-19mm-gumowana-stalco-p20547
// source: https://stalco.pl/media/katalogi/KATALOG_STALCO_2026_PL.pdf
const STALCO_MEASURE:ReviewedJobProduct={
  identity:{ean:'5905947919611',category:'tape-measure',packageSize:1,unit:'szt'},
  name:'Stalco S010124205 — miara zwijana 5 m × 19 mm',example:true,
  imageUrl:'https://sklep.sewera.pl/photo/292162/miara-zwijana-5m-x-19mm-gumowana-stalco.webp',
};

// source: https://sklep.sewera.pl/kuweta-malarska-37x34-cm-hardy-p6310
// source: https://hardy.pl/product/resource?prid=909
const HARDY_TRAY:ReviewedJobProduct={
  identity:{ean:'5905061980771',category:'paint-tray',packageSize:1,unit:'szt'},
  name:'Hardy 0146-323734K — kuweta 37 × 34 cm, do wałka do 25 cm',example:true,
  imageUrl:'https://sklep.sewera.pl/photo/308205/kuweta-malarska-37x34-cm-hardy.webp',
};

// source: https://sklep.sewera.pl/wyciskacz-do-kartuszy-szkieletowy-310ml-tytan-p18099
// source: https://tytan.com/pl/produkt/akcesoria/wyciskacz-mechaniczny-szkieletowy-do-kartuszy/
const TYTAN_CAULK_GUN:ReviewedJobProduct={
  identity:{ean:'5903518042997',category:'caulk-gun',packageSize:1,unit:'szt'},
  name:'Tytan 10003240 — wyciskacz szkieletowy do kartuszy 310 ml',example:true,
  imageUrl:'https://sklep.sewera.pl/photo/256251/wyciskacz-do-kartuszy-szkieletowy-310ml-tytan.webp',
};

export function reviewedJobProduct(item:JobProductItem,kind:'material'|'tool'):ReviewedJobProduct|null{
  if(kind==='tool'){
    // Do not replace combined kits, measuring lasers or foam guns with one tool.
    if(item.id==='tape-measure'&&item.name==='Miara')return STALCO_MEASURE;
    if(item.id==='tray'&&item.name==='Kuweta do farby')return HARDY_TRAY;
    if(item.id==='caulk-gun'&&item.name==='Pistolet do silikonu')return TYTAN_CAULK_GUN;
    if(item.id==='paint-roller-bso'&&item.name==='Wałek lub szeroki pędzel do gruntu pod tynk')return KRAUS_L19;
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
