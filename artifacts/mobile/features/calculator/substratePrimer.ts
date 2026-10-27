import { REMOVAL_JOB, REMOVAL_MODEL } from './wallpaperRemoval';
import { WALL_FINISHING_MODEL, isWallFinishingJob } from './wallFinishing';
import type { CalculationResult, MaterialItem, MaterialLineItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementInputDefinition } from '@/types/engine';
import type { MeasurementMap } from '@/types/calculator';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const SUBSTRATE_PRIMER_MODEL = 'substrate-primer-v1';

interface PrimerSpecification {
  readonly materialId: string;
  readonly referenceId: string;
  readonly ean: string;
  readonly area: 'wallArea' | 'floorArea';
  readonly usage: number;
  readonly maxArea: number;
  readonly source: string;
}

const KNAUF_CARD = 'https://knauf.com/api/download-center/v1/assets/3ed7306f-27be-4d9d-a14d-388477a68c24?country=pl&download=true';
// Product-specific allowances, with the purchased product's native unit.
// source: https://www.ceresit.pl/produkty/grunty-i-gladzie/grunty/produkt.html/ceresit-ct-17-profi/SAP_0201JAC014F1.html
// source: https://www.atlas.com.pl/produkt/atlas-uni-grunt/
// source: https://knauf.com/pl-PL/p/produkt/knauf-universalgrund-22064_0120
const SPECIFICATIONS: Readonly<Record<string, PrimerSpecification>> = {
  'primer-walls': { materialId: 'primer', referenceId: 'mat-primer-deep-ceresit-ct17-10l', ean: '5900089617081', area: 'wallArea', usage: 0.1, maxArea: 500, source: 'https://www.ceresit.pl/produkty/grunty-i-gladzie/grunty/produkt.html/ceresit-ct-17-profi/SAP_0201JAC014F1.html' },
  'skim-coat': { materialId: 'primer-skim', referenceId: 'mat-universal-primer-5l', ean: '5901793357737', area: 'wallArea', usage: 0.15, maxArea: 500, source: KNAUF_CARD },
  'wall-repair': { materialId: 'primer-repair', referenceId: 'mat-universal-primer-5l', ean: '5901793357737', area: 'wallArea', usage: 0.15, maxArea: 200, source: KNAUF_CARD },
  wallpaper: { materialId: 'primer-wallpaper', referenceId: 'mat-universal-primer-5l', ean: '5901793357737', area: 'wallArea', usage: 0.15, maxArea: 300, source: KNAUF_CARD },
  'wallpaper-install': { materialId: 'primer-wallpaper', referenceId: 'mat-universal-primer-5l', ean: '5901793357737', area: 'wallArea', usage: 0.15, maxArea: 400, source: KNAUF_CARD },
  'wallpaper-remove': { materialId: 'primer-after-remove', referenceId: 'mat-universal-primer-5l', ean: '5901793357737', area: 'wallArea', usage: 0.15, maxArea: 500, source: KNAUF_CARD },
  'floor-tiles': { materialId: 'primer-tiles', referenceId: 'mat-primer-deep-ceresit-ct17-10l', ean: '5900089617081', area: 'floorArea', usage: 0.2, maxArea: 200, source: 'https://www.ceresit.pl/produkty/grunty-i-gladzie/grunty/produkt.html/ceresit-ct-17-profi/SAP_0201JAC014F1.html' },
  'self-leveling': { materialId: 'primer-leveling', referenceId: 'mat-primer-deep-atlas-unigrunt-5kg', ean: '5905400520026', area: 'floorArea', usage: 0.2, maxArea: 500, source: 'https://www.atlas.com.pl/produkt/atlas-uni-grunt/' },
};

export const SUBSTRATE_PRIMER_JOBS: readonly string[] = Object.keys(SPECIFICATIONS);

export function substratePrimerSpecification(jobId: string): PrimerSpecification | undefined {
  return SPECIFICATIONS[jobId];
}

export function substratePrimerQuantity(jobId: string, m: MeasurementMap): number | null {
  const spec = SPECIFICATIONS[jobId];
  if (!spec) return null;
  const area = m[spec.area];
  if (!Number.isFinite(area) || area <= 0 || area > spec.maxArea) return null;
  let usage = m.primerConsumption ?? spec.usage;
  if (jobId === 'primer-walls') {
    const coverage = m.coveragePerLiter ?? 10;
    if (!Number.isFinite(coverage) || coverage < 2 || coverage > 10) return null;
    usage = 1 / coverage;
  }
  const min = spec.ean === '5905400520026' ? 0.05 : spec.ean === '5900089617081' ? 0.1 : 0.01;
  const max = spec.ean === '5905400520026' ? 0.2 : spec.ean === '5900089617081' ? 0.5 : 1;
  if (!Number.isFinite(usage) || usage < min || usage > max) return null;
  return Number((area * usage).toFixed(6));
}

export function levelingEdgeTapeMetres(m: MeasurementMap): number | null {
  if (m.edgeTapeChoice !== undefined && m.edgeTapeChoice !== 0 && m.edgeTapeChoice !== 1) return null;
  const length = m.perimeter;
  return Number.isFinite(length) && length > 0 && length <= 500 ? Number((length * 1.05).toFixed(6)) : null;
}

export function substratePrimerInputs(jobId: string): MeasurementInputDefinition[] {
  const spec = SPECIFICATIONS[jobId];
  if (!spec || jobId === 'primer-walls') return [];
  const atlas = spec.ean === '5905400520026', ceresit = spec.ean === '5900089617081';
  return [{
    id: 'primerConsumption', label: atlas ? 'Zużycie emulsji ATLAS UNI-GRUNT' : 'Zużycie gruntu',
    unit: atlas ? 'kg/m²' : 'l/m²', inputType: 'coverage', placeholder: String(spec.usage),
    defaultValue: spec.usage, min: atlas ? 0.05 : ceresit ? 0.1 : 0.01,
    max: atlas ? 0.2 : ceresit ? 0.5 : 1, step: 0.01, required: false,
    hint: atlas
      ? 'Przyjęto 0,20 kg emulsji z opakowania na m² (zakres producenta 0,05–0,20). Woda do rozcieńczenia nie jest kupowanym gruntem. Dopasuj do chłonności i karty produktu.'
      : ceresit
        ? 'CT 17: założenie 0,20 l/m², zakres producenta 0,10–0,50. Podłoże musi być chłonne; sprawdź zużycie próbą.'
        : 'Knauf Universalgrund: założenie dla ściany 0,15 l/m². Liczymy całą podaną powierzchnię; rzeczywiste zużycie zależy od chłonności. Gotowego gruntu nie traktuj jako koncentratu.',
  }];
}

/** Existing jobs remain legacy materials; exact product and pack are explicit. */
export function substratePrimerMaterial(jobId: string): MaterialItem {
  const spec = SPECIFICATIONS[jobId];
  const ref = MATERIAL_PRICES.find(row => row.id === spec?.referenceId);
  if (!spec || !ref) throw new Error(`Missing reviewed primer for ${jobId}`);
  return {
    id: spec.materialId, name: ref.productLabel, brand: ref.productLabel, ean: spec.ean,
    unit: ref.packageUnit, formulaKey: `substratePrimer:${jobId}`, wasteFactor: 1,
    pricePerUnit: ref.pricePerPackage, priceBasis: 'package', category: 'primer',
    packaging: { size: ref.packageSize, label: `${ref.packageSize} ${ref.packageUnit}`, purchaseUnit: 'kanister' },
    sourceUrl: ref.sourceUrl,
    notes: `${jobId === 'primer-walls' ? 'CT 17: ustaw wydajność 2–10 m²/l zgodnie z chłonnością; domyślnie 10 m²/l.' : substratePrimerInputs(jobId)[0].hint} Grunt na chłonne podłoże; gładkie, niechłonne podłoże wymaga osobnego doboru. Źródło: ${spec.source}`,
  };
}

const currentPrimerModel = (calc: CalculationResult) => calc.quantityModel === SUBSTRATE_PRIMER_MODEL || calc.jobId === REMOVAL_JOB && calc.quantityModel === REMOVAL_MODEL || isWallFinishingJob(calc.jobId) && calc.quantityModel === WALL_FINISHING_MODEL;

export function isCurrentSubstratePrimer(calc: CalculationResult, line: MaterialLineItem): boolean {
  const spec = SPECIFICATIONS[calc.jobId];
  return Boolean(spec && line.material.id === spec.materialId && 'ean' in line.material && line.material.ean === spec.ean
    && currentPrimerModel(calc));
}

/** Keep historical JSON untouched. Its former litre/constant allowance must not
 * silently acquire a kilogram price or become an apparently complete basket. */
export function reviewHistoricalSubstratePrimer(calc: CalculationResult | undefined): CalculationResult | undefined {
  const spec = calc && SPECIFICATIONS[calc.jobId];
  if (!calc || !spec || currentPrimerModel(calc)) return calc;
  const materials = calc.materials.map(line => line.material.id === spec.materialId
    ? { ...line, quantityKnown: false, material: { ...line.material, notes: 'Przelicz obmiary w edycji projektu, aby potwierdzić produkt i zużycie gruntu. Starsza kalkulacja nie określa ich jednoznacznie.' } }
    : line);
  return { ...calc, materials, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}

export function reviewSubstrateProject(project: Project): Project {
  return SPECIFICATIONS[project.jobId] && project.calculationResult
    ? { ...project, calculationResult: reviewHistoricalSubstratePrimer(project.calculationResult) } : project;
}

export function reviewSubstrateShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  const spec = calc && SPECIFICATIONS[calc.jobId];
  if (!calc || !spec) return [...items];
  return items.flatMap(item => {
    if (item.itemType !== 'material') return item;
    const line = calc.materials.find(row => row.material.id === item.materialId);
    if (!line) return item;
    if (!currentPrimerModel(calc) && item.materialId !== spec.materialId) return item;
    if (!currentPrimerModel(calc) || line.quantityKnown === false) return {
      ...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false,
      notes: 'Przelicz obmiary w edycji projektu, aby potwierdzić produkt i zużycie gruntu.',
    };
    if (line.quantity === 0) return [];
    const isPrimer = item.materialId === spec.materialId;
    const specificProduct = isPrimer || calc.jobId === 'self-leveling' && item.materialId === 'expansion-tape';
    const required = isPrimer ? substratePrimerQuantity(calc.jobId, calc.measurements)!
      : calc.jobId === 'self-leveling' && item.materialId === 'expansion-tape' ? levelingEdgeTapeMetres(calc.measurements)!
        : line.rawQuantity ?? line.quantity;
    const matches = (!specificProduct || item.name === line.material.name) && item.unit === line.material.unit
      && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) + 1e-8 >= required;
    return { ...item, name: specificProduct ? line.material.name : item.name, unit: line.material.unit, quantity: line.quantity,
      estimatedPrice: line.cost, quantityKnown: true, requiredQuantity: required,
      needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased,
      notes: line.material.notes };
  });
}
