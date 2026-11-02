import type {RetailSource} from './retail-pages';
/** Exact primary cards plus native WooCommerce product IDs/SKUs, reviewed 2026-11-02.
 * A 120 mm cuff is one two-piece retail pack, not one cuff.
 * source: https://fugi.pl/produkt/mapeband-w-mankiet-120x120mm/
 * source: https://fugi.pl/produkt/mapeband-w-mankiet-300x300mm/ */
export const FUGI_SOURCES:readonly RetailSource[]=[
  {
    "id": "fugi-mapeband-w-10m",
    "ean": "8022452113932",
    "name": "Taśma uszczelniająca MAPEI MAPEBAND W opakowanie 10mb",
    "brand": "Mapei",
    "category": "sealing-tape",
    "packageSize": 10,
    "unit": "m",
    "store": "FUGI.PL",
    "format": "fugi-woo",
    "productId": 12115,
    "retailerSku": "Mapeband-w-tasmaN",
    "pickupRequiresConfirmation": true,
    "variant": [
      "10mb"
    ],
    "url": "https://fugi.pl/produkt/mapeband-w-mapei-tasma-uszczelniajaca-120mm-op-10mb/",
    "imageUrl": "https://fugi.pl/wp-content/uploads/2020/04/MAPEBAND-W-TAŚMA_2.jpg"
  },
  {
    "id": "fugi-mapeband-w-floor-300",
    "ean": "8022452113895",
    "name": "Mankiet uszczelniający MAPEI MAPEBAND W 300mm x 300mm",
    "brand": "Mapei",
    "category": "sealing-cuff",
    "packageSize": 1,
    "unit": "szt",
    "store": "FUGI.PL",
    "format": "fugi-woo",
    "productId": 3798,
    "retailerSku": "Mapeband-w-mankiet-300",
    "pickupRequiresConfirmation": true,
    "variant": [
      "300"
    ],
    "url": "https://fugi.pl/produkt/mapeband-w-mankiet-300x300mm/",
    "imageUrl": "https://fugi.pl/wp-content/uploads/2020/04/MAPEBAND-W-MANKIET-USZCZEL.-300x300-1-1.jpg"
  },
  {
    "id": "fugi-mapeband-w-corner-external",
    "ean": "8022452113789",
    "name": "Narożnik zewnątrzny MAPEI MAPEBAND W profil 270°",
    "brand": "Mapei",
    "category": "sealing-corner",
    "packageSize": 1,
    "unit": "szt",
    "store": "FUGI.PL",
    "format": "fugi-woo",
    "productId": 3793,
    "retailerSku": "Mapeband-w-naroznik-zewnetrzny",
    "pickupRequiresConfirmation": true,
    "variant": [
      "270"
    ],
    "url": "https://fugi.pl/produkt/mapeband-w-mapei-naroznik-uszczelniajacy-zewnetrzny-90/",
    "imageUrl": "https://fugi.pl/wp-content/uploads/2020/04/MAPEBAND-W-NAROŻNIK-ZEWNĘTRZNY.jpg"
  },
  {
    "id": "fugi-mapeband-w-cuff-2",
    "ean": "8022452113925",
    "name": "Mankiety uszczelniające MAPEI MAPEBAND W 120x120mm PAKIET 2szt",
    "brand": "Mapei",
    "category": "sealing-cuff",
    "packageSize": 2,
    "unit": "szt",
    "store": "FUGI.PL",
    "format": "fugi-woo",
    "productId": 3797,
    "retailerSku": "PAK-MAPE-W-MANKI-120-2SZT",
    "pickupRequiresConfirmation": true,
    "variant": [
      "120",
      "2szt"
    ],
    "packageDescription": "Pakiet 2 MANKIETÓW",
    "url": "https://fugi.pl/produkt/mapeband-w-mankiet-120x120mm/",
    "imageUrl": "https://fugi.pl/wp-content/uploads/2020/04/MAPEBAND-MANKIET-SCIENNY-120X120_2.jpg"
  },
  {
    "id": "fugi-mapeband-w-corner-internal",
    "ean": "8022452113802",
    "name": "Narożnik wewnętrzny MAPEI MAPEBAND W profil 90°",
    "brand": "Mapei",
    "category": "sealing-corner",
    "packageSize": 1,
    "unit": "szt",
    "store": "FUGI.PL",
    "format": "fugi-woo",
    "productId": 3792,
    "retailerSku": "MAPEBAND W NAROŻNIK WEW.9",
    "pickupRequiresConfirmation": true,
    "variant": [
      "90"
    ],
    "url": "https://fugi.pl/produkt/mapeband-w-mapei-naroznik-uszczelniajacy-wewnetrzny-90/",
    "imageUrl": "https://fugi.pl/wp-content/uploads/2020/04/MAPEBAND-W-NAROZNIK-WEW.-1.jpg"
  }
];
export function confirmFugiSource(source:RetailSource):void{
 const pinned=FUGI_SOURCES.find(s=>s.id===source.id);if(!pinned&&source.store!=='FUGI.PL'&&source.format!=='fugi-woo')return;
 const keys=['id','ean','name','brand','category','packageSize','unit','store','format','productId','retailerSku','packageDescription','url','imageUrl'] as const;
 if(!pinned||keys.some(k=>source[k]!==pinned[k])||(source.minimumPackages??1)!==1||(source.purchaseMultiple??1)!==1)throw Error('invalid_basket');
}
