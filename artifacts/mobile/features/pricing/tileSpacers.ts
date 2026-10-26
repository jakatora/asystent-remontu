import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import type { MaterialPriceReference } from '@/types/pricing';
import type { PricingMaterialLineInput } from './pricingApi';

// Exact widths/physical bags; a price for one width never prices another.
// source: https://sklep.sewera.pl/krzyzyki-dystansowe-2mm-200szt--p12504
// source: https://sklep.sewera.pl/krzyzyki-dystansowe-3mm-150szt--p12505
// source: https://sklep.sewera.pl/krzyzyki-dystansowe-4mm-100szt--p12506
const reviewed = [
  { width: 2, id: 'mat-tile-spacers-hardy-2mm-200' },
  { width: 3, id: 'mat-tile-spacers-hardy-3mm-150' },
  { width: 4, id: 'mat-tile-spacers-hardy-4mm-100' },
] as const;
const jobs = new Set(['floor-tiles', 'wall-tiles-bathroom', 'kitchen-backsplash']);
const ids = new Set(['tile-crosses', 'wall-crosses', 'tile-crosses-kitchen']);
export const isTileSpacer = (jobId: string, materialId: string) => jobs.has(jobId) && ids.has(materialId);
export function tileJointWidth(jobId: string, measurements?: Readonly<Record<string, number>>) {
  // Existing kitchen definition explicitly specifies 2mm; other tile jobs and
  // their saved optional measurement default to 3mm. Do not infer from a SKU.
  return measurements?.groutWidthMm ?? (jobId === 'kitchen-backsplash' ? 2 : 3);
}
export function tileSpacerReference(jobId: string, measurements?: Readonly<Record<string, number>>) {
  if (!jobs.has(jobId)) return null;
  const spec = reviewed.find(row => row.width === tileJointWidth(jobId, measurements));
  return spec ? MATERIAL_PRICES.find(ref => ref.id === spec.id) ?? null : null;
}
export function tileSpacerReferences(refs: MaterialPriceReference[], jobId: string, measurements: Readonly<Record<string, number>>) {
  if (!jobs.has(jobId)) return refs;
  const selected = tileSpacerReference(jobId, measurements);
  return refs.flatMap(ref => ref.materialType === 'tile-spacer' ? selected ? [selected] : [] : [ref]);
}
export function priceTileSpacer(line: PricingMaterialLineInput, jobId: string, measurements?: Readonly<Record<string, number>>): PricingMaterialLineInput {
  if (!isTileSpacer(jobId, line.material.id)) return line;
  const ref = tileSpacerReference(jobId, measurements), { packs: _packs, ...demand } = line;
  const pieces = ['szt','szt.'].includes(line.material.unit.trim().toLowerCase());
  const ean = pieces && ref && PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id))?.ean;
  const { ean: _ean, gtin: _gtin, ...material } = line.material;
  return { ...demand, material: ref && ean
    ? { ...material, name: ref.productLabel, category: ref.materialType, unit: ref.packageUnit, ean }
    : { ...material, name: `Krzyżyki dystansowe ${tileJointWidth(jobId, measurements)} mm — ${pieces ? 'dobierz opakowanie' : 'ustal ilość w sztukach'}`, category: 'tile-spacer-review', unit: pieces ? 'szt' : material.unit } };
}
