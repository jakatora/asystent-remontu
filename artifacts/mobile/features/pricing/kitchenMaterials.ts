import { MATERIAL_PRICES } from '@/data/prices/materials';
import type { PricingMaterialLineInput } from './pricingApi';

export const KITCHEN_EPOXY_REFERENCE = 'mat-epoxy-grout-mapei-kerapoxy-easy-100-3kg';
export const KITCHEN_WHITE_REFERENCE = 'mat-white-adhesive-atlas-plus-25kg';
/** Bind the specified kitchen chemistry to exact physical products; a generic
 * grout/adhesive alias must not price epoxy as cement or white glue as grey.
 * source: https://www.rabdom.pl/pl/p/Mapei-Kerapoxy-Easy-Design-Uniwersalna-fuga-epoksydowa-3kg-Bialy-100/14527
 * source: https://sklep.sewera.pl/atlas-plus-klej-do-plytek-bialy-25kg-p8896
 */
export function priceKitchenMaterial(line: PricingMaterialLineInput, jobId: string): PricingMaterialLineInput {
  if (jobId !== 'kitchen-backsplash') return line;
  const identity = line.material.id === 'grout-kitchen' ? {id:KITCHEN_EPOXY_REFERENCE,ean:'8022452132940'}
    : line.material.id === 'tile-adhesive' ? {id:KITCHEN_WHITE_REFERENCE,ean:'5905400313390'} : null;
  if (!identity) return line;
  const ref=MATERIAL_PRICES.find(row=>row.id===identity.id);
  if (!ref || line.material.unit !== ref.packageUnit) throw Error('kitchen_material_identity_missing');
  const {packs:_packs,...demand}=line,{ean:_ean,gtin:_gtin,...material}=line.material;
  return {...demand,material:{...material,name:ref.productLabel,unit:ref.packageUnit,category:ref.materialType,ean:identity.ean}};
}
