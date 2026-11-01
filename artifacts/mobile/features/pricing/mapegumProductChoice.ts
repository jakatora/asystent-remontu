import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import {normalizeUnit} from './quantity';
import {normalizeProductName} from '../../../../lib/db/src/repositories/helpers';
import type {PricingMaterialInput,PricingStageInput} from './pricingApi';

export const MAPEGUM_PRODUCT_CHOICE_PREFIX='remont.mapegum-product-choice.v1:';
// An explicit purchase choice, never a barcode alias or an automatic migration.
// source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131
// source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419
// source: https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-5kg-HYDROIZOLACJA-PLYNNA-FOLIA/1906
// source: https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-10kg-HYDROIZOLACJA-PLYNNA-FOLIA/9873
export const MAPEGUM_PRODUCT_PAIRS=[
  {from:'mat-mapegum-wps-5kg',to:'mat-mapegum-wps-5kg-124805pl'},
  {from:'mat-mapegum-wps-10kg',to:'mat-mapegum-wps-10kg-124810pl'},
] as const;
export type MapegumProductChoice={from:string;to:string};
export const NO_MAPEGUM_PRODUCT_CHOICES:readonly MapegumProductChoice[]=[];
export const mapegumProductReference=(id:string)=>MATERIAL_PRICES.find(ref=>ref.id===id);
export const mapegumProductEan=(id:string)=>PRODUCT_PHOTOS.find(photo=>photo.ids.includes(id))?.ean;

export function parseMapegumProductChoices(raw:string|null):MapegumProductChoice[]{
  if(raw===null)return [];
  if(raw.length>8000)throw Error('invalid_mapegum_product_choices');
  const saved=JSON.parse(raw),used=new Set<string>();
  if(saved?.version!==1||Object.keys(saved).sort().join(',')!=='choices,version'||!Array.isArray(saved.choices)||saved.choices.length>MAPEGUM_PRODUCT_PAIRS.length)throw Error('invalid_mapegum_product_choices');
  return saved.choices.map((row:MapegumProductChoice)=>{
    const pair=MAPEGUM_PRODUCT_PAIRS.find(pair=>pair.from===row?.from&&pair.to===row?.to);
    if(!pair||Object.keys(row).sort().join(',')!=='from,to'||used.has(row.from))throw Error('invalid_mapegum_product_choices');
    const from=mapegumProductReference(pair.from),to=mapegumProductReference(pair.to);
    if(!from||!to||from.materialType!=='waterproofing'||to.materialType!=='waterproofing'||from.packageUnit!=='kg'||to.packageUnit!=='kg'||from.packageSize!==to.packageSize||!mapegumProductEan(to.id))throw Error('invalid_mapegum_product_identity');
    used.add(row.from);return{from:row.from,to:row.to};
  });
}
function legacyReference(material:PricingMaterialInput){
  if(normalizeUnit(material.unit)!=='kg'||material.packageFamily||material.category&&material.category!=='waterproofing')return undefined;
  const codes=[...new Set([material.ean,material.gtin].filter(Boolean))];if(codes.length>1)return undefined;
  return MAPEGUM_PRODUCT_PAIRS.map(pair=>mapegumProductReference(pair.from)!).find(ref=>codes.length?mapegumProductEan(ref.id)===codes[0]:material.category==='waterproofing'&&normalizeProductName(material.name)===normalizeProductName(ref.productLabel));
}
export function mapegumProductRequirements(stages:readonly PricingStageInput[]){
  const ids=new Set(stages.flatMap(stage=>stage.materials).filter(line=>line.quantity>0).map(line=>legacyReference(line.material)?.id));
  return MAPEGUM_PRODUCT_PAIRS.map(pair=>mapegumProductReference(pair.from)!).filter(ref=>ids.has(ref.id));
}
export function applyMapegumProductChoices(stages:readonly PricingStageInput[],choices:readonly MapegumProductChoice[]):PricingStageInput[]{
  const validated=parseMapegumProductChoices(JSON.stringify({version:1,choices}));if(!validated.length)return [...stages];
  return stages.map(stage=>({...stage,materials:stage.materials.map(line=>{
    const from=legacyReference(line.material),choice=from&&validated.find(choice=>choice.from===from.id);if(!choice)return line;
    const to=mapegumProductReference(choice.to)!;const{packs:_packs,...demand}=line;
    const{ean:_ean,gtin:_gtin,...identity}=line.material;
    return{...demand,material:{...identity,name:to.productLabel,unit:'kg',category:'waterproofing',ean:mapegumProductEan(to.id)}};
  })}));
}
