import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import type {PricingMaterialInput,PricingStageInput} from './pricingApi';
import {normalizeUnit} from './quantity';
import {normalizeProductName} from '../../../../lib/db/src/repositories/helpers';
import type {REVIEWED_PACKAGE_FAMILIES} from '../../../../lib/pricing-service/src/reviewed-package-families';

export type PackageChoice={from:string;to:'automatic'};
/** Closed reviewed families only. Deduct exact-product stock before opting in;
 * this projection carries raw demand, never client prices or pack counts. */
export function createPackageChoiceModel(family:typeof REVIEWED_PACKAGE_FAMILIES[number],invalid:string){
  const products=MATERIAL_PRICES.filter(ref=>ref.materialType===family.category&&ref.packageUnit===family.unit&&family.packs.some(pack=>
    pack.size===ref.packageSize&&PRODUCT_PHOTOS.some(photo=>photo.ids.includes(ref.id)&&photo.ean===pack.ean)));
  function parse(raw:string|null):PackageChoice[]{
    if(raw===null)return [];
    if(raw.length>8000)throw Error(invalid);
    const value=JSON.parse(raw),used=new Set<string>();
    if(value?.version!==1||!Array.isArray(value.choices)||value.choices.length>products.length)throw Error(invalid);
    return value.choices.map((row:any)=>{
      if(!row||Object.keys(row).sort().join(',')!=='from,to'||!products.some(ref=>ref.id===row.from)||row.to!=='automatic'||used.has(row.from))throw Error(invalid);
      used.add(row.from);return{from:row.from,to:'automatic' as const};
    });
  }
  function reference(material:PricingMaterialInput){
    if(normalizeUnit(material.unit)!==family.unit||material.packageFamily||material.category&&material.category!==family.category)return undefined;
    const codes=[...new Set([material.ean,material.gtin].filter((x):x is string=>Boolean(x)))];
    if(codes.length>1)return undefined;
    const matches=products.filter(ref=>codes.length?PRODUCT_PHOTOS.some(photo=>photo.ids.includes(ref.id)&&photo.ean===codes[0])
      :material.category===family.category&&normalizeProductName(material.name)===normalizeProductName(ref.productLabel));
    return matches.length===1?matches[0]:undefined;
  }
  function requirements(stages:readonly PricingStageInput[]){
    const ids=new Set(stages.flatMap(stage=>stage.materials).filter(line=>line.quantity>0).map(line=>reference(line.material)?.id));
    return products.filter(ref=>ids.has(ref.id));
  }
  function apply(stages:readonly PricingStageInput[],choices:readonly PackageChoice[]):PricingStageInput[]{
    const automatic=new Set(parse(JSON.stringify({version:1,choices})).map(c=>c.from));
    return stages.map(stage=>({...stage,materials:stage.materials.map(line=>{
      const ref=reference(line.material);if(!ref||!automatic.has(ref.id))return line;
      const{packs:_packs,...demand}=line;
      return{...demand,material:{id:line.material.id,name:family.name,category:family.category,unit:family.unit,packageFamily:family.key}};
    })}));
  }
  return{products,parse,reference,requirements,apply};
}
