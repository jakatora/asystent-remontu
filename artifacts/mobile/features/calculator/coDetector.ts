import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';

export const CO_JOB = 'chimney-work';
export const CO_MODEL = 'co-detector-v1';
export const CO_REFERENCE = 'mat-co-detector-virone-dc11';
export const CO_EAN = '5908254851223';
export function coDetectorQuantity(m: MeasurementMap): number | null {
  return m.coDetectorChoice === 1 && Number.isSafeInteger(m.coDetectorCount) && m.coDetectorCount! >= 1 && m.coDetectorCount! <= 100 ? m.coDetectorCount! : null;
}

// One purchased device includes two AA batteries. Sensor life is not battery life.
// Quantity is entered by the user; this is not a detector-placement assessment.
// source: https://www.virone.pl/pl/czujnik-czadu/744-bateryjny-czujnik-tlenku-wegla-czadu-2xaa-zywotnosc-sensora-10-lat-5908254851223.html
// source: https://files.orno.pl/support/ManualsUserPDF/VIRONE/PL-EN-DE/DC-11_manual_PL_EN_DE.pdf
export function coDetectorMaterial(m: MeasurementMap = {}): MaterialItem {
  const ref = m.coDetectorChoice === 1 ? MATERIAL_PRICES.find(row => row.id === CO_REFERENCE) : undefined;
  if (!ref) return { id: 'co-detector', name: 'Czujnik czadu — wybierz model i podaj liczbę urządzeń', unit: 'szt', formulaKey: 'coDetectorCount', pricePerUnit: 0 };
  const photo = PRODUCT_PHOTOS.find(row => row.ids.includes(ref.id));
  return { id: 'co-detector', name: ref.productLabel, brand: ref.brand, ean: CO_EAN, imageUrl: photo?.imageUrl, sourceUrl: ref.sourceUrl,
    category: ref.materialType, unit: 'szt', formulaKey: 'coDetectorCount', pricePerUnit: ref.pricePerPackage, priceBasis: 'package',
    wasteFactor: 1, packaging: { size: 1, label: '1 urządzenie', purchaseUnit: 'szt' }, notes: ref.notes };
}
export const coDetectorInputs: MeasurementInputDefinition[] = [
  { id: 'coDetectorChoice', label: 'Czujnik czadu do porównania cen', unit: '', inputType: 'select', placeholder: 'Wybierz model', min: 0, max: 1, defaultValue: 0, required: false,
    options: [{ value: 0, label: 'Jeszcze wybieram model czujnika' }, { value: 1, label: 'Virone DC-11 — LCD, 2 × AA w zestawie' }],
    hint: 'Porównamy ten sam model w sklepach. Wybierz według instrukcji i warunków użytkowania; czujnik nie zastępuje przeglądu komina ani wentylacji.' },
  { id: 'coDetectorCount', label: 'Liczba urządzeń do kupienia', unit: 'szt', inputType: 'count', min: 1, max: 100, defaultValue: 1, required: true,
    placeholder: 'Podaj liczbę, np. 1', hint: 'Ustal potrzebną liczbę i rozmieszczenie według instrukcji producenta. Aplikacja nie ocenia pokrycia pomieszczeń. Jeden DC-11 zawiera dwie baterie AA; nie doliczamy drugiego zestawu baterii.' },
];

export function reviewCoDetectorCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (calc?.jobId !== CO_JOB) return calc;
  const needed = coDetectorQuantity(calc.measurements);
  const materials = calc.materials.map(line => {
    if (line.material.id !== 'co-detector') return line;
    const valid = calc.quantityModel === CO_MODEL && needed !== null && line.quantityKnown !== false && 'ean' in line.material && line.material.ean === CO_EAN
      && line.material.unit === 'szt' && line.material.packaging?.size === 1 && line.rawQuantity === needed;
    return valid ? line : { ...line, quantityKnown: false };
  });
  return { ...calc, materials, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}
export const reviewCoDetectorProject = (project: Project): Project => project.jobId === CO_JOB ? { ...project, calculationResult: reviewCoDetectorCalculation(project.calculationResult) } : project;
export function reviewCoDetectorShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (calc?.jobId !== CO_JOB) return [...items];
  const reviewed = reviewCoDetectorCalculation(calc), line = reviewed?.materials.find(row => row.material.id === 'co-detector');
  const needed = coDetectorQuantity(calc.measurements);
  return items.map(item => {
    if (item.itemType !== 'material' || item.materialId !== 'co-detector') return item;
    if (!line || line.quantityKnown === false || needed === null) return { ...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false };
    const matches = item.name === line.material.name && item.unit === line.material.unit && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) >= needed;
    return { ...item, name: line.material.name, unit: line.material.unit, quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: needed,
      quantityKnown: true, needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased, notes: line.material.notes };
  });
}
