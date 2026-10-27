import type { CalculationResult, MaterialLineItem } from '@/types/domain';
import type { MaterialPriceReference } from '@/types/pricing';
import { getRequiredQuantity } from '@/features/calculator/requirements';
import { isTileSpacer } from './tileSpacers';

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
  'paint-undercoat': /^primer-repaint$/,
  'skim-coat': /^skim-coat$/,
  plaster: /^plaster-base$/,
  'plaster-corner': /^plaster-corner$/,
  screed: /^leveling-compound$/,
  adhesive: /^(tile-adhesive|wall-tile-adhesive|vinyl-adhesive)$/,
  grout: /^(grout|wall-grout)$/,
  'epoxy-grout': /^grout-kitchen$/,
  'white-tile-adhesive': /^tile-adhesive$/,
  'tile-spacer': /^(tile-crosses|wall-crosses|tile-crosses-kitchen)$/,
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
  trap: /^basin-trap$/,
  silicone: /^(sanitary-silicone|silicone-kitchen)$/,
  valve: /angle-valve/,
  hose: /flex-hose/,
  'mounting-set': /^wc-mounting-set$/,
  'basin-fixings': /^basin-fixings$/,
  threshold: /^threshold/,
  screws: /^gk-screws(?:-ceiling)?$/,
  dowels: /^dowels-uw$/,
  'adhesive-eps': /^glue-k20$/,
  foam: /^(mounting-foam|windowsill-foam)$/,
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
  if (source.quantityKnown === false) return null;
  if (['epoxy-grout','white-tile-adhesive'].includes(ref.materialType) && calc.jobId !== 'kitchen-backsplash') return null;
  if (calc.jobId === 'kitchen-backsplash' && ref.materialType === 'adhesive') return null;
  if(ref.materialType==='paint-undercoat'&&calc.jobId!=='repaint-walls')return null;
  if(calc.jobId==='repaint-walls'&&ref.materialType==='primer'&&source.material.id==='primer-repaint')return null;
  // The sink recipe explicitly counts cartridges of this exact 280 ml model.
  // Preserve that allowance; the API/catalogue require millilitres, not "1 ml".
  // source: https://www.castorama.pl/silikon-sanitarny-soudal-280-ml-bialy/5411183157064_CAPL.prd
  if ((calc.jobId === 'sink-installation' && source.material.id === 'sanitary-silicone'
      || calc.jobId === 'kitchen-backsplash' && source.material.id === 'silicone-kitchen') && ref.id === 'mat-sanitary-silicone-soudal-280ml'
      && source.material.unit === 'kartusze'
      && (calc.jobId === 'sink-installation' ? /Soudal 280 ml/.test(source.material.brand ?? '') : source.material.brand === 'Soudal Silikon sanitarny biały 280 ml (referencja)') && ref.packageUnit === 'ml' && ref.packageSize === 280) {
    const quantity = getRequiredQuantity(source, calc) * 280;
    return Number.isFinite(quantity) && quantity >= 0 ? { quantity, source } : null;
  }
  if (ref.materialType === 'adhesive-eps' &&
      (calc.jobId !== 'eps-insulation-bso' || ref.id !== 'mat-adhesive-eps-atlas-stopter-k20-25kg' || source.material.id !== 'glue-k20' || !/Atlas Stopter K-20 25 kg/i.test(source.material.brand ?? ''))) return null;
  // These existing jobs count cans. The selected references each contain
  // exactly 750 ml; convert the same demand, then let the basket round once.
  // Never apply a can-to-volume assumption to another product or unit.
  if (ref.materialType === 'foam') {
    const knownCan = ['mat-foam-tytan-pro65-750ml', 'mat-foam-soudal-lowexp-750ml'].includes(ref.id)
      && ref.packageSize === 750 && ref.packageUnit === 'ml'
      && ['window-sealing', 'windowsill-install', 'interior-doors'].includes(calc.jobId)
      && (normalizeUnit(source.material.unit) === 'szt' || calc.jobId === 'interior-doors' && source.material.unit === 'puszka');
    if (!knownCan) return null;
    const quantity = Number((getRequiredQuantity(source, calc) * 750).toFixed(8));
    return Number.isFinite(quantity) && quantity >= 0 ? { quantity, source } : null;
  }
  const legacyPaintingTape = (calc.jobId === 'paint-walls' || calc.jobId==='repaint-walls'&&ref.id==='mat-masking-tape-bluedolphin-30mm'&&ref.packageSize===50&&/50\s*m\b/.test(source.material.brand??'')) && source.material.id === 'painters-tape' && source.material.unit === 'rolka' && normalizeUnit(ref.packageUnit) === 'm';
  // Old tile snapshots called the crosses formula (a count of individual
  // spacers) but labelled its result "opak.". Never multiply that raw count
  // by a guessed bag size; accept only the known job/ID/formula combination.
  const legacySpacer = ref.materialType === 'tile-spacer' && isTileSpacer(calc.jobId, source.material.id)
    && source.material.formulaKey === 'crosses' && ['opak', 'opakowanie'].includes(normalizeUnit(source.material.unit))
    && normalizeUnit(ref.packageUnit) === 'szt';
  if (!legacyPaintingTape && !legacySpacer && normalizeUnit(source.material.unit) !== normalizeUnit(ref.packageUnit)) return null;
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
