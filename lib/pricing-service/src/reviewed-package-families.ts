/** Each member keeps its own factory barcode and physical purchase package.
 * No category-wide substitution, old Primer G, or litre/kilogram conversion.
 * source: https://fugi.pl/wp-content/uploads/2021/06/2949-primergpro-pl.pdf (page 3)
 * source: https://www.v33.pl/v33-product/easy-renowacja-kuchnia/
 */
export const V33_CABINET_FAMILY = 'v33-easy-kitchen-white-satin-v1' as const;
export const V33_CABINET_FAMILY_NAME = 'V33 Easy Renowacja Kuchnia — biały satyna, dobór opakowań';
export const V33_CABINET_PACKS = [{ean:'3153895149044',size:750},{ean:'3153895149228',size:2000}] as const;
export const PRIMER_G_PRO_FAMILY = 'mapei-primer-g-pro-litres-v1' as const;
export const PRIMER_G_PRO_FAMILY_NAME = 'Mapei Primer G Pro — koncentrat, dobór opakowań 1/5/10/20 l';
export const PRIMER_G_PRO_PACKS = [
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-1l-KONCENTRAT-GRUNTUJACY-GRUNT/10970
  {ean:'8022452241123',size:1},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-5l-KONCENTRAT-GRUNTUJACY-GRUNT/10969
  {ean:'8022452241130',size:5},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-10l-KONCENTRAT-GRUNTUJACY-GRUNT/15704
  {ean:'8022452241147',size:10},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-KONCENTRAT-GRUNTUJACY-GRUNT-20L/10828
  {ean:'8022452241154',size:20},
] as const;
// source: https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_02014_mapegum-wps_pl-pl_6ff17f2c535848d99d22681a305a079c.pdf?sfvrsn=eb49cbd6_0
export const MAPEGUM_WPS_FAMILY = 'mapei-mapegum-wps-kg-v1' as const;
export const MAPEGUM_WPS_FAMILY_NAME = 'Mapei Mapegum WPS — dobór opakowań 3/5/10/20 kg';
export const MAPEGUM_WPS_PACKS = [
  // source: https://www.rabdom.pl/pl/p/Folia-w-plynie-hydroizolacyjna-MAPEI-Mapegum-WPS-3kg/16590
  {ean:'8022452249266',size:3},
  // source: https://sklep.sewera.pl/folia-w-plynie-mapegum-wps-5kg-mapei-p7751
  {ean:'8022452242489',size:5},
  // source: https://sklep.sewera.pl/folia-w-plynie-mapegum-wps-10kg-mapei-p7754
  {ean:'8022452242496',size:10},
  // source: https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-20kg-HYDROIZOLACJA-PLYNNA-FOLIA/9875
  {ean:'8022452242502',size:20},
] as const;
// Factory product/size/GTIN table, not a current retail price list.
// source: https://dm.henkel-dam.com/is/content/henkel/Cennik-Henkel-ACB-17-03-2025 (p.4)
export const CT17_PROFI_FAMILY='ceresit-ct17-profi-litres-v1' as const;
export const CT17_PROFI_FAMILY_NAME='Ceresit CT 17 PROFI — dobór opakowań 5/10 l';
export const CT17_PROFI_PACKS=[{ean:'5900089617050',size:5},{ean:'5900089617081',size:10}] as const;
export const CT17_TRANSPARENT_FAMILY='ceresit-ct17-transparent-litres-v1' as const;
export const CT17_TRANSPARENT_FAMILY_NAME='Ceresit CT 17 Transparent — dobór opakowań 5/10 l';
export const CT17_TRANSPARENT_PACKS=[{ean:'5900089218653',size:5},{ean:'5900089218677',size:10}] as const;
// Factory GTINs identify one formulation in three sealed bucket sizes. A
// listed factory size is not an available offer: resolution still requires
// a verified product and comparable current retail offer for that exact GTIN.
// source: https://knauf.com/pl-PL/p/produkt/knauf-super-finish-11410_0120
export const KNAUF_SUPER_FINISH_FAMILY='knauf-super-finish-kg-v1' as const;
export const KNAUF_SUPER_FINISH_FAMILY_NAME='Knauf Super Finish — dobór dostępnych opakowań';
export const KNAUF_SUPER_FINISH_PACKS=[{ean:'5901793357959',size:5.4},{ean:'5901793357942',size:20},{ean:'5901793357935',size:28}] as const;
export const REVIEWED_PACKAGE_FAMILIES = [
  {key:V33_CABINET_FAMILY,name:V33_CABINET_FAMILY_NAME,category:'cabinet-paint',unit:'ml',packs:V33_CABINET_PACKS},
  {key:PRIMER_G_PRO_FAMILY,name:PRIMER_G_PRO_FAMILY_NAME,category:'primer',unit:'l',packs:PRIMER_G_PRO_PACKS},
  {key:MAPEGUM_WPS_FAMILY,name:MAPEGUM_WPS_FAMILY_NAME,category:'waterproofing',unit:'kg',packs:MAPEGUM_WPS_PACKS},
  {key:CT17_PROFI_FAMILY,name:CT17_PROFI_FAMILY_NAME,category:'primer',unit:'l',packs:CT17_PROFI_PACKS},
  {key:CT17_TRANSPARENT_FAMILY,name:CT17_TRANSPARENT_FAMILY_NAME,category:'primer',unit:'l',packs:CT17_TRANSPARENT_PACKS},
  {key:KNAUF_SUPER_FINISH_FAMILY,name:KNAUF_SUPER_FINISH_FAMILY_NAME,category:'skim-coat',unit:'kg',packs:KNAUF_SUPER_FINISH_PACKS},
] as const;
export const REVIEWED_PACKAGE_FAMILY_KEYS=[V33_CABINET_FAMILY,PRIMER_G_PRO_FAMILY,MAPEGUM_WPS_FAMILY,CT17_PROFI_FAMILY,CT17_TRANSPARENT_FAMILY,KNAUF_SUPER_FINISH_FAMILY] as const;
export type ReviewedPackageFamily = typeof REVIEWED_PACKAGE_FAMILIES[number]['key'];
export function isReviewedPackageFamilyKey(value:unknown):value is ReviewedPackageFamily{
  return typeof value==='string'&&REVIEWED_PACKAGE_FAMILY_KEYS.some(key=>key===value);
}
const normalized=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9]/g,'');
export function reviewedPackageFamily(query:{packageFamily?:string;ean?:string|null;gtin?:string|null;category?:string|null;normalizedName?:string|null},unit:string|null){
  return REVIEWED_PACKAGE_FAMILIES.find(f=>query.packageFamily===f.key&&!query.ean&&!query.gtin&&query.category===f.category&&unit===f.unit&&normalized(query.normalizedName??'')===normalized(f.name));
}
