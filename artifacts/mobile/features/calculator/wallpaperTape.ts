import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { WALLPAPER_SUPPLIES_MODEL } from './wallpaperAdhesive';

export const WALLPAPER_TAPE_ID = 'masking-tape-wallpaper';
export const WALLPAPER_TAPE_REFERENCE = 'mat-masking-tape-bluedolphin-30mm';
export const WALLPAPER_TAPE_EAN = '5907758515952';
export const isWallpaperTape = (jobId: string, materialId: string) => jobId === 'wallpaper-install' && materialId === WALLPAPER_TAPE_ID;
// source: https://sklep.bluedolphin.pl/pl/p/Tasma-malarska-Blue-Dolphin-niebieska-30mm-x-50m/631
// source: https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966
export function wallpaperTapeQuantity(m: MeasurementMap): number | null {
  const length = m.wallpaperProtectionTapeMetres;
  return typeof length === 'number' && Number.isFinite(length) && length >= 0 && length <= 1000 ? Number(length.toFixed(6)) : null;
}
export const wallpaperTapeInputs: MeasurementInputDefinition[] = [{
  id: 'wallpaperProtectionTapeMetres', label: 'Taśma do zabezpieczenia — łączna długość', unit: 'mb', inputType: 'length', min: 0, max: 1000, required: true, placeholder: 'np. 20; 0, jeśli nie potrzebujesz',
  hint: 'Zsumuj długości listew, ościeżnic i innych krawędzi do zabezpieczenia, z zapasem i powtórnym oklejaniem. Nie wyliczamy taśmy z m² ścian. Rolka Blue Dolphin niebieska 30 mm ma 50 m; resztę można wykorzystać w kolejnym pomieszczeniu. Sprawdź zgodność z oklejaną powierzchnią, zwłaszcza delikatną lub świeżo wykończoną.',
}];
export function wallpaperTapeMaterial(original: MaterialItem): MaterialItem {
  const ref = MATERIAL_PRICES.find(row => row.id === WALLPAPER_TAPE_REFERENCE)!;
  return { ...original, name: ref.productLabel, brand: ref.brand, ean: WALLPAPER_TAPE_EAN, unit: 'mb', category: ref.materialType, sourceUrl: ref.sourceUrl, shopPrices: undefined,
    formulaKey: 'wallpaperProtectionTape', wasteFactor: 1, priceBasis: 'package', pricePerUnit: ref.pricePerPackage,
    packaging: { size: 50, label: 'rolka 30 mm × 50 m', purchaseUnit: 'rolka' },
    notes: 'Długość z Twojego obmiaru, bez stałej liczby rolek z powierzchni ścian. Identyczna taśma z kilku prac sumuje się przed zakupem pełnych rolek. Dobierz taśmę do zabezpieczanej powierzchni.' };
}
export function wallpaperTapeWarnings(lines: readonly { material: { id: string }; quantityKnown?: boolean }[]) {
  return lines.some(line => line.material.id === WALLPAPER_TAPE_ID && line.quantityKnown === false)
    ? [{ condition: 'always' as const, level: 'warning' as const, message: 'Niepełna wycena taśmy: podaj długość zabezpieczanych krawędzi. Wpisz 0, jeśli taśma nie jest potrzebna.' }] : [];
}
export function reviewWallpaperTapeCalculation(calc?: CalculationResult): CalculationResult | undefined {
  if (!calc || calc.jobId !== 'wallpaper-install' || calc.quantityModel === WALLPAPER_SUPPLIES_MODEL) return calc;
  const materials = calc.materials.map(line => line.material.id === WALLPAPER_TAPE_ID ? { ...line, quantityKnown: false } : line);
  return { ...calc, materials, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}
export const reviewWallpaperTapeProject = (p: Project): Project => p.jobId === 'wallpaper-install' && p.calculationResult ? { ...p, calculationResult: reviewWallpaperTapeCalculation(p.calculationResult) } : p;
export function reviewWallpaperTapeShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || calc.jobId !== 'wallpaper-install') return [...items];
  return items.flatMap(item => {
    if (item.itemType !== 'material' || item.materialId !== WALLPAPER_TAPE_ID) return [item];
    const line = calc.materials.find(row => row.material.id === WALLPAPER_TAPE_ID), required = wallpaperTapeQuantity(calc.measurements);
    if (calc.quantityModel !== WALLPAPER_SUPPLIES_MODEL || !line || line.quantityKnown === false || required === null) return [{ ...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false }];
    if (required === 0) return [];
    const same = !item.needsQuantityConfirmation && item.name === line.material.name && item.unit === 'mb' && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) + 1e-8 >= required;
    return [{ ...item, name: line.material.name, unit: 'mb', quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: required, quantityKnown: true, needsQuantityConfirmation: !same, owned: same && item.owned, purchased: same && item.purchased, notes: line.material.notes }];
  });
}
