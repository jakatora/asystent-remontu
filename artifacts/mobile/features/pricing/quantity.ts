import type { CalculationResult, MaterialLineItem } from '@/types/domain';
import type { MaterialPriceReference } from '@/types/pricing';
import { getRequiredQuantity } from '@/features/calculator/requirements';

export function normalizeUnit(unit: string): string {
  const key = unit.toLowerCase().replace(/[.\s]/g, '');
  if (['l', 'litr', 'litry', 'litrow'].includes(key)) return 'l';
  if (['m²', 'm2'].includes(key)) return 'm2';
  if (['m', 'mb', 'mbieżący'].includes(key)) return 'm';
  if (['szt', 'sztuka', 'sztuki'].includes(key)) return 'szt';
  return key;
}

// These aliases identify existing calculator materials. They do not introduce
// consumption assumptions or conversions between unrelated physical units.
const MATERIAL_IDS: Readonly<Record<string, RegExp>> = {
  paint: /^(paint|ceiling-paint|cabinet-paint)$/,
  primer: /primer/,
  'skim-coat': /^skim-coat$/,
  plaster: /^plaster-base$/,
  'plaster-corner': /^plaster-corner$/,
  screed: /^leveling-compound$/,
  adhesive: /^(tile-adhesive|wall-tile-adhesive|vinyl-adhesive)$/,
  grout: /^(grout|wall-grout|grout-kitchen)$/,
  tile: /^(tiles|wall-tiles|backsplash-tiles)$/,
  laminate: /^laminate-panels$/,
  'vinyl-panel': /^(vinyl-panels|vinyl-roll)$/,
  underlay: /^underlay/,
  'vapor-barrier': /^vapor-barrier$/,
  skirting: /^(skirting|skirting-glued)$/,
  'expansion-tape': /^expansion-tape$/,
  'sealing-tape': /^sealing-tape$/,
  waterproofing: /^membrane$/,
  'masking-tape': /^(painters-tape|masking-tape.*)$/,
  'protective-film': /^drop-cloth$/,
  washbasin: /^washbasin$/,
  toilet: /^wc-compact$/,
  faucet: /^basin-mixer$/,
  valve: /angle-valve/,
  hose: /flex-hose/,
  'mounting-set': /^wc-mounting-set$/,
  threshold: /^threshold/,
  screws: /^gk-screws(?:-ceiling)?$/,
  dowels: /^dowels-uw$/,
  'adhesive-eps': /^glue-k20$/,
};

/** Match a known material and compatible units; missing information is not m². */
export function resolveMaterialQuantity(
  ref: MaterialPriceReference,
  calc: CalculationResult,
): { quantity: number; source: MaterialLineItem } | null {
  const pattern = MATERIAL_IDS[ref.materialType];
  const candidates = calc.materials.filter(line =>
    line.material.id === ref.id || pattern?.test(line.material.id),
  );
  if (candidates.length !== 1) return null;
  const source = candidates[0];
  if (ref.materialType === 'adhesive-eps' &&
      (calc.jobId !== 'eps-insulation-bso' || ref.id !== 'mat-adhesive-eps-atlas-stopter-k20-25kg' || source.material.id !== 'glue-k20' || !/Atlas Stopter K-20 25 kg/i.test(source.material.brand ?? ''))) return null;
  const legacyPaintingTape = calc.jobId === 'paint-walls' && source.material.id === 'painters-tape' && source.material.unit === 'rolka' && normalizeUnit(ref.packageUnit) === 'm';
  if (!legacyPaintingTape && normalizeUnit(source.material.unit) !== normalizeUnit(ref.packageUnit)) return null;
  if (calc.jobId === 'self-leveling' && ref.materialType === 'screed') {
    const thickness = calc.measurements.levelingThickness, area = calc.measurements.floorArea;
    // source: https://www.atlas.com.pl/produkt/atlas-sam-100/ (5–30 mm, 1.6 kg/m²/mm)
    // source: https://www.atlas.com.pl/produkt/atlas-sam-200/ (25–60 mm, 2 kg/m²/mm)
    const specification = ref.id === 'mat-screed-atlas-sam100-25kg' ? { min: 5, max: 30, rate: 1.6 }
      : ref.id === 'mat-screed-atlas-sam200-25kg' ? { min: 25, max: 60, rate: 2 } : undefined;
    if (specification) {
      if (!Number.isFinite(area) || area <= 0 || !Number.isFinite(thickness) || thickness < specification.min || thickness > specification.max) return null;
      const quantity = Math.round(area * thickness * specification.rate * (source.material.wasteFactor ?? 1.1) * 10) / 10;
      return { quantity, source };
    }
  }
  // Old saved results contain rounded quantities only. Recompute their original
  // requirement from the same calculator formula instead of rounding twice.
  // Original tape reference was explicitly 50 m per roll. Never infer this for other materials.
  const quantity = getRequiredQuantity(source, calc) * (legacyPaintingTape ? 50 : 1);
  if (!Number.isFinite(quantity) || quantity < 0) return null;
  return { quantity, source };
}
