import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { WALLPAPER_ROLLS_MODEL, isWallpaperAdhesiveJob } from './wallpaperAdhesive';
import { ERISMANN_3333_5_EAN, ERISMANN_3333_5_ROLL, planPlainWallpaperPanels, type WallpaperPanel } from '../../../../lib/pricing-service/src/wallpaper-rolls';

export const WALLPAPER_ROLL_REFERENCE = 'mat-wallpaper-erismann-rollover-3333-5';
export const isWallpaperRoll = (jobId: string, materialId: string) => isWallpaperAdhesiveJob(jobId) && materialId === 'wallpaper';
export const wallpaperRollReference = (m: MeasurementMap) => m.wallpaperRollChoice === 1 ? WALLPAPER_ROLL_REFERENCE : null;
// source: https://www.erismann.de/en/collection/rollover-27
// source: https://www.erismann.de/en/service/wallpapering-tips
export function wallpaperRollPanels(m: MeasurementMap): WallpaperPanel[] | null {
  if (m.wallpaperRollChoice !== 1) return null;
  const height = m.wallpaperHeightM, allowance = m.wallpaperCutAllowanceCm ?? 10;
  if (typeof height !== 'number' || !Number.isFinite(height) || height < 1 || height > 10 || !Number.isFinite(allowance) || allowance < 5 || allowance > 20) return null;
  const panels: WallpaperPanel[] = [];
  for (let i = 1; i <= 4; i++) {
    const width = m[`wallpaperWidth${i}M`] ?? 0;
    if (!Number.isFinite(width) || width < 0 || width > 100) return null;
    if (width > 0) panels.push({ id: `wall-${i}`, widthMm: Math.ceil(width * 1000 - 1e-8), heightMm: Math.ceil(height * 1000 - 1e-8), allowanceMm: Math.ceil(allowance * 10 - 1e-8) });
  }
  const grossArea = panels.reduce((sum, panel) => sum + panel.widthMm / 1000 * panel.heightMm / 1000, 0);
  if (!panels.length || !Number.isFinite(m.wallArea) || m.wallArea <= 0 || m.wallArea > grossArea + 0.01) return null;
  return panels;
}
export function wallpaperRollPlan(m: MeasurementMap) {
  const panels = wallpaperRollPanels(m); return panels ? planPlainWallpaperPanels(panels, ERISMANN_3333_5_ROLL) : null;
}
export const wallpaperRollQuantity = (m: MeasurementMap): number | null => wallpaperRollPlan(m)?.rollsNeeded ?? null;
export const wallpaperRollInputs: MeasurementInputDefinition[] = [
  { id: 'wallpaperRollChoice', label: 'Model tapety do kupienia', unit: '', inputType: 'select', placeholder: 'Wybierz model', min: 0, max: 1, defaultValue: 0, required: false, options: [{ value: 0, label: 'Dobiorę inny model lub jeszcze nie wiem' }, { value: 1, label: 'Erismann RollOver 3333-5 — biała flizelina do malowania, 0,75 × 25 m' }], hint: 'To gładka podkładowa flizelina bez pasowania wzoru. Malowanie lub kolejna tapeta to osobna praca. Inny model wymaga sprawdzenia wymiarów i raportu; nie podstawiamy go automatycznie.' },
  { id: 'wallpaperHeightM', label: 'Wysokość pasów tapety', unit: 'm', inputType: 'length', min: 1, max: 10, required: false, placeholder: 'np. 2,50', hint: 'Dla wybranego modelu podaj największą wysokość ścian w tej pracy. Okna i drzwi nie skracają pełnych pasów. Dla różnych wysokości możesz utworzyć osobne prace i połączyć je w koszyku remontu.' },
  ...[1, 2, 3, 4].map(i => ({ id: `wallpaperWidth${i}M`, label: `Szerokość ściany ${i} do tapetowania`, unit: 'm', inputType: 'length' as const, min: 0, max: 100, required: false, placeholder: i === 1 ? 'np. 4,00' : '0, jeśli nie dotyczy', ...(i > 1 ? { defaultValue: 0 } : {}), hint: 'Szerokość całej ściany, z oknami i drzwiami. Każdą ścianę liczymy osobno, zaokrąglając do pełnych pasów szerokości 75 cm. Dla kolejnych ścian dodaj osobną pracę.' })),
  { id: 'wallpaperCutAllowanceCm', label: 'Naddatek na docięcie pasa', unit: 'cm', inputType: 'length', placeholder: '10', min: 5, max: 20, defaultValue: 10, required: false, hint: 'Producent podaje zwykle 5–10 cm na docięcie. Domyślnie doliczamy 10 cm do każdego pasa; większy zapas jest Twoim założeniem zakupowym. Nie doliczamy drugiego procentowego zapasu do rolek.' },
];
export function wallpaperRollMaterial(original: MaterialItem, m: MeasurementMap): MaterialItem {
  const ref = MATERIAL_PRICES.find(row => row.id === wallpaperRollReference(m));
  if (!ref) return { ...original, name: 'Tapeta — wybierz model i podaj wymiary ścian', formulaKey: 'wallpaperRolls', pricePerUnit: 0 };
  return { ...original, name: ref.productLabel, brand: ref.brand, ean: ERISMANN_3333_5_EAN, unit: 'szt', category: ref.materialType, sourceUrl: ref.sourceUrl, shopPrices: undefined, formulaKey: 'wallpaperRolls', wasteFactor: 1, priceBasis: 'package', pricePerUnit: ref.pricePerPackage, packaging: { size: 1, label: 'rolka 0,75 × 25 m', purchaseUnit: 'rolka' }, notes: ref.notes };
}
export function wallpaperRollWarnings(lines: readonly { material: { id: string }; quantityKnown?: boolean }[]) {
  return lines.some(line => line.material.id === 'wallpaper' && line.quantityKnown === false)
    ? [{ condition: 'always' as const, level: 'warning' as const, message: 'Niepełna wycena tapety: wybierz model i podaj wysokość oraz szerokości ścian. Ich powierzchnia brutto musi obejmować podaną powierzchnię tapetowania.' }] : [];
}
export function reviewWallpaperRollCalculation(calc?: CalculationResult): CalculationResult | undefined {
  if (!calc || !isWallpaperAdhesiveJob(calc.jobId) || calc.quantityModel === WALLPAPER_ROLLS_MODEL) return calc;
  const materials = calc.materials.map(line => line.material.id === 'wallpaper' ? { ...line, quantityKnown: false } : line);
  return { ...calc, materials, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}
export const reviewWallpaperRollProject = (p: Project): Project => isWallpaperAdhesiveJob(p.jobId) && p.calculationResult ? { ...p, calculationResult: reviewWallpaperRollCalculation(p.calculationResult) } : p;
export function reviewWallpaperRollShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || !isWallpaperAdhesiveJob(calc.jobId)) return [...items];
  return items.map(item => {
    if (item.itemType !== 'material' || item.materialId !== 'wallpaper') return item;
    const line = calc.materials.find(row => row.material.id === 'wallpaper'), required = wallpaperRollQuantity(calc.measurements);
    if (calc.quantityModel !== WALLPAPER_ROLLS_MODEL || !line || line.quantityKnown === false || required === null) return { ...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false };
    const same = !item.needsQuantityConfirmation && item.name === line.material.name && item.unit === 'szt' && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) >= required;
    return { ...item, name: line.material.name, unit: 'szt', quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: required, quantityKnown: true, needsQuantityConfirmation: !same, owned: same && item.owned, purchased: same && item.purchased, notes: line.material.notes };
  });
}
