import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import type {PricingMaterialInput,PricingStageInput} from './pricingApi';
import {normalizeUnit} from './quantity';
import {normalizeProductName} from '../../../../lib/db/src/repositories/helpers';
import {PRIMER_G_PRO_FAMILY,PRIMER_G_PRO_FAMILY_NAME,PRIMER_G_PRO_PACKS} from '../../../../lib/pricing-service/src/reviewed-package-families';

export const PRIMER_PACKAGE_CHOICE_PREFIX='remont.primer-package-choice.v1:';
export type PrimerPackageChoice={from:string;to:'automatic'};
export const PRIMER_PACKAGE_PRODUCTS=MATERIAL_PRICES.filter(ref=>ref.materialType==='primer'&&ref.packageUnit==='l'&&PRIMER_G_PRO_PACKS.some(pack=>
  pack.size===ref.packageSize&&PRODUCT_PHOTOS.some(photo=>photo.ids.includes(ref.id)&&photo.ean===pack.ean)));

export function parsePrimerPackageChoices(raw:string|null):PrimerPackageChoice[]{
  if(raw===null)return [];
  if(raw.length>8000)throw Error('invalid_primer_package_choices');
  const value=JSON.parse(raw),used=new Set<string>();
  if(value?.version!==1||!Array.isArray(value.choices)||value.choices.length>PRIMER_PACKAGE_PRODUCTS.length)throw Error('invalid_primer_package_choices');
  return value.choices.map((row:any)=>{
    if(!row||Object.keys(row).sort().join(',')!=='from,to'||!PRIMER_PACKAGE_PRODUCTS.some(ref=>ref.id===row.from)||row.to!=='automatic'||used.has(row.from))throw Error('invalid_primer_package_choices');
    used.add(row.from);return{from:row.from,to:'automatic'};
  });
}

export function primerPackageReference(material:PricingMaterialInput){
  if(normalizeUnit(material.unit)!=='l'||material.packageFamily||material.category&&material.category!=='primer')return undefined;
  const codes=[...new Set([material.ean,material.gtin].filter((x):x is string=>Boolean(x)))];
  if(codes.length>1)return undefined;
  const matches=PRIMER_PACKAGE_PRODUCTS.filter(ref=>codes.length?PRODUCT_PHOTOS.some(photo=>photo.ids.includes(ref.id)&&photo.ean===codes[0])
    :material.category==='primer'&&normalizeProductName(material.name)===normalizeProductName(ref.productLabel));
  return matches.length===1?matches[0]:undefined;
}
export function primerPackageRequirements(stages:readonly PricingStageInput[]){
  const ids=new Set(stages.flatMap(stage=>stage.materials).filter(line=>line.quantity>0).map(line=>primerPackageReference(line.material)?.id));
  return PRIMER_PACKAGE_PRODUCTS.filter(ref=>ids.has(ref.id));
}
/** Apply after owned items and exact-product allocated stock, before the API
 * consolidates raw litres. No pack counts or money are computed on the client. */
export function applyPrimerPackageChoices(stages:readonly PricingStageInput[],choices:readonly PrimerPackageChoice[]):PricingStageInput[]{
  const validated=parsePrimerPackageChoices(JSON.stringify({version:1,choices})),automatic=new Set(validated.map(c=>c.from));
  return stages.map(stage=>({...stage,materials:stage.materials.map(line=>{
    const ref=primerPackageReference(line.material);if(!ref||!automatic.has(ref.id))return line;
    const{packs:_packs,...demand}=line;
    return{...demand,material:{id:line.material.id,name:PRIMER_G_PRO_FAMILY_NAME,category:'primer',unit:'l',packageFamily:PRIMER_G_PRO_FAMILY}};
  })}));
}
