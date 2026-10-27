import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const WALLPAPER_ADHESIVE_MODEL = 'wallpaper-adhesive-v1';
export const WALLPAPER_SUPPLIES_MODEL = 'wallpaper-supplies-v1';
export const isCurrentWallpaperAdhesiveModel = (model?: string) => model === WALLPAPER_ADHESIVE_MODEL || model === WALLPAPER_SUPPLIES_MODEL;
export const isWallpaperAdhesiveJob = (id: string) => id === 'wallpaper' || id === 'wallpaper-install';
export const isWallpaperAdhesive = (jobId: string, id: string) => isWallpaperAdhesiveJob(jobId) && id === 'wallpaper-glue';
const choices = [
  { kind: 'direct', size: 200, coverage: 22, ean: '4015000402019' },
  { kind: 'direct', size: 200, coverage: 18, ean: '4015000402019' },
  { kind: 'normal', size: 125, coverage: 50, ean: '4015000095266' },
  { kind: 'normal', size: 125, coverage: 40, ean: '4015000095266' },
  { kind: 'normal', size: 125, coverage: 30, ean: '4015000095266' },
] as const;
function choice(m: MeasurementMap) {
  const type = m.wallpaperAdhesiveType;
  return Number.isSafeInteger(type) && type >= 1 && type <= choices.length ? choices[type - 1] : null;
}
export function wallpaperAdhesiveReference(m: MeasurementMap): string | null {
  const selected = choice(m); return selected ? `mat-wallpaper-adhesive-metylan-${selected.kind}-${selected.size}g` : null;
}
export const wallpaperAdhesiveEan = (m: MeasurementMap): string | null => choice(m)?.ean ?? null;
export function wallpaperAdhesiveWarnings(lines: readonly { material: { id: string }; quantityKnown?: boolean }[]) {
  return lines.some(line => line.material.id === 'wallpaper-glue' && line.quantityKnown === false)
    ? [{ condition: 'always' as const, level: 'warning' as const, message: 'Niepełna wycena kleju: wybierz rodzaj tapety w obmiarach i sprawdź zalecenia jej producenta.' }] : [];
}
// Use the purchased dry powder, not water or diluted paste. Quantities from
// different rooms are consolidated in grams before buying whole packs.
// source: https://datasheets.tdx.henkel.com/METYLAN-Direct-pl_PL.pdf
// source: https://datasheets.tdx.henkel.com/METYLAN-Normal-pl_PL.pdf
export function wallpaperAdhesiveQuantity(m: MeasurementMap): number | null {
  const selected = choice(m), area = m.wallArea, reserve = m.wallpaperAdhesiveReservePercent ?? 10;
  if (!selected || !Number.isFinite(area) || area <= 0 || area > 400 || !Number.isFinite(reserve) || reserve < 0 || reserve > 30) return null;
  return Number((area * selected.size / selected.coverage * (1 + reserve / 100)).toFixed(6));
}
export const wallpaperAdhesiveInputs: MeasurementInputDefinition[] = [
  { id: 'wallpaperAdhesiveType', label: 'Rodzaj tapety i klej', unit: '', inputType: 'select', placeholder: 'Sprawdź etykietę tapety', defaultValue: 0, min: 0, max: 5, required: true,
    options: [
      { value: 0, label: 'Jeszcze nie wiem — dobór kleju do ustalenia' },
      { value: 1, label: 'Flizelinowa gładka — Metylan Direct 200 g' },
      { value: 2, label: 'Flizelinowa tłoczona — Metylan Direct 200 g' },
      { value: 3, label: 'Papierowa cienka — Metylan Normal 125 g' },
      { value: 4, label: 'Papierowa zwykła — Metylan Normal 125 g' },
      { value: 5, label: 'Papierowa gruba — Metylan Normal 125 g' },
    ],
    hint: 'Dobierz według zaleceń producenta tapety. Direct: 22 m² gładkiej lub 18 m² tłoczonej na 200 g. Normal: 50/40/30 m² na 125 g. Przyjmujemy dolny zakres wydajności. To kleje do suchych pomieszczeń; tapety wyjątkowo ciężkie, winylowe na innym podkładzie i specjalne wymagają osobnego sprawdzenia.' },
  { id: 'wallpaperAdhesiveReservePercent', label: 'Zapas kleju', unit: '%', inputType: 'percent', placeholder: '10', defaultValue: 10, min: 0, max: 30, required: false,
    hint: 'Jawny zapas zakupowy ponad zużycie z karty. Liczymy gramy suchego kleju, następnie pełne opakowania. Nie doliczamy wody jako kupowanego produktu.' },
];
export function wallpaperAdhesiveMaterial(original: MaterialItem, m: MeasurementMap): MaterialItem {
  const selected = choice(m), reference = wallpaperAdhesiveReference(m), ref = MATERIAL_PRICES.find(row => row.id === reference);
  if (!selected || !ref) return { ...original, name: 'Klej do tapet — wybierz rodzaj tapety', formulaKey: 'wallpaperAdhesive', pricePerUnit: 0, notes: 'Dobór i ilość pozostają nieznane do wyboru zgodnego rodzaju tapety.' };
  return { ...original, name: ref.productLabel, brand: ref.brand, ean: selected.ean, unit: 'g', category: ref.materialType, sourceUrl: ref.sourceUrl,
    formulaKey: 'wallpaperAdhesive', wasteFactor: 1, priceBasis: 'package', pricePerUnit: ref.pricePerPackage,
    packaging: { size: ref.packageSize, label: `${ref.packageSize} g suchego kleju`, purchaseUnit: 'opakowanie' }, notes: ref.notes };
}
/** Old kg allowances never silently acquire a gram price or a new product. */
export function reviewWallpaperAdhesiveCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (!calc || !isWallpaperAdhesiveJob(calc.jobId) || isCurrentWallpaperAdhesiveModel(calc.quantityModel)) return calc;
  const materials = calc.materials.map(line => isWallpaperAdhesive(calc.jobId, line.material.id) ? { ...line, quantityKnown: false } : line);
  return { ...calc, materials, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}
export const reviewWallpaperAdhesiveProject = (p: Project): Project => isWallpaperAdhesiveJob(p.jobId) && p.calculationResult ? { ...p, calculationResult: reviewWallpaperAdhesiveCalculation(p.calculationResult) } : p;
export function reviewWallpaperAdhesiveShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || !isWallpaperAdhesiveJob(calc.jobId)) return [...items];
  return items.map(item => {
    if (item.itemType !== 'material' || !isWallpaperAdhesive(calc.jobId, item.materialId)) return item;
    const line = calc.materials.find(row => row.material.id === item.materialId), required = wallpaperAdhesiveQuantity(calc.measurements);
    if (!isCurrentWallpaperAdhesiveModel(calc.quantityModel) || !line || line.quantityKnown === false || required === null) return { ...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false };
    const matches = !item.needsQuantityConfirmation && item.name === line.material.name && item.unit === 'g' && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) + 1e-8 >= required;
    return { ...item, name: line.material.name, unit: 'g', quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: required, quantityKnown: true, needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased, notes: line.material.notes };
  });
}
