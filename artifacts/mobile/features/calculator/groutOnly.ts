import type {CalculationResult, MaterialItem, Project, ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import type {MaterialExplanation} from '@/types/calculation';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import {groutMassKg} from './grout';
import {SANITARY_REFERENCE, SANITARY_STOP_REFERENCE} from './sanitarySealant';

export const GROUT_ONLY_JOB = 'grout-only';
export const GROUT_ONLY_MODEL = 'grout-only-v1';
export const GROUT_REFERENCE = 'mat-grout-atlas-001-white-2kg';
export const GROUT_CLEANER_REFERENCE = 'mat-grout-cleaner-atlas-szop-1kg';
const IDS = ['grout', 'silicone-grout', 'grout-cleaner'];
export const isGroutOnlyMaterial = (job: string, id: string) => job === GROUT_ONLY_JOB && IDS.includes(id);
const valid = (n: number | undefined, min: number, max: number): n is number => Number.isFinite(n) && n! >= min && n! <= max;

export function groutOnlyReference(id: string, m: MeasurementMap = {}): string | null {
  if (id === 'grout') return m.groutProduct === 1 ? GROUT_REFERENCE : null;
  if (id === 'silicone-grout') return m.groutSealantModel === 1 ? SANITARY_REFERENCE : m.groutSealantModel === 2 ? SANITARY_STOP_REFERENCE : null;
  if (id === 'grout-cleaner') return m.groutCleanerChoice === 2 ? GROUT_CLEANER_REFERENCE : null;
  return null;
}

// Atlas formula uses dimensions in metres and finished-joint density 1650 kg/m³.
// source: https://www.atlas.com.pl/wp-content/uploads/2026/08/atlas_fuga_ceramiczna_plik_karta-techniczna.pdf
// SZOP has no universal area yield: demand depends on the contamination.
// source: https://www.atlas.com.pl/wp-content/uploads/2026/08/atlas_szop_plik_karta-techniczna.pdf
// Rectangular elastic joint volume: m × mm × mm = ml, before whole cartridges.
// source: https://www.soudal.pl/sites/default/files/soudal_api/document/TDS_silikon_sanitarny_STOP_2025.pdf
export function groutOnlyQuantity(id: string, m: MeasurementMap): number | null {
  if (!IDS.includes(id)) return null;
  if (id === 'grout-cleaner') {
    if (m.groutCleanerChoice === 1) return 0;
    return groutOnlyReference(id, m) && Number.isSafeInteger(m.groutCleanerPacks) && valid(m.groutCleanerPacks, 1, 20) ? m.groutCleanerPacks : null;
  }
  if (id === 'silicone-grout' && m.groutSealantLength === 0) return 0;
  const reserve = m.groutReservePercent ?? 10;
  if (!valid(reserve, 0, 30) || !groutOnlyReference(id, m)) return null;
  if (id === 'grout') {
    if (!valid(m.wallArea, 1, 300) || !valid(m.tileWidthCm, 5, 120) || !valid(m.tileHeightCm, 5, 120) || !valid(m.groutDepthMm, 1, 30) || !valid(m.groutWidthMm, 1, 20)) return null;
    return groutMassKg(m.wallArea, m.tileWidthCm, m.tileHeightCm, m.groutDepthMm, m.groutWidthMm, 1650, 1 + reserve / 100);
  }
  if (!valid(m.groutSealantLength, 0, 100) || !valid(m.groutSealantWidthMm, 5, 30) || !valid(m.groutSealantDepthMm, 5, 30)) return null;
  return Number((m.groutSealantLength * m.groutSealantWidthMm * m.groutSealantDepthMm * (1 + reserve / 100)).toFixed(8));
}

const labels: Record<string, string> = {grout: 'Fuga — wybierz produkt i zmierz spoiny', 'silicone-grout': 'Silikon — zmierz połączenia i dobierz produkt', 'grout-cleaner': 'Czyszczenie — zdecyduj, czy potrzebujesz preparatu'};
export function groutOnlyMaterials(m: MeasurementMap = {}): MaterialItem[] {
  return IDS.map(id => {
    const ref = MATERIAL_PRICES.find(r => r.id === groutOnlyReference(id, m));
    if (!ref) return {id, name: labels[id], unit: id === 'silicone-grout' ? 'ml' : 'kg', formulaKey: 'grout-only:' + id, pricePerUnit: 0};
    const photo = PRODUCT_PHOTOS.find(p => p.ids.includes(ref.id));
    return {id, name: ref.productLabel, brand: ref.brand, ean: photo?.ean, sourceUrl: ref.sourceUrl, imageUrl: photo?.imageUrl, unit: ref.packageUnit, category: ref.materialType, formulaKey: 'grout-only:' + id, pricePerUnit: ref.pricePerPackage, priceBasis: 'package', wasteFactor: id === 'grout-cleaner' ? 1 : 1 + (m.groutReservePercent ?? 10) / 100, packaging: {size: ref.packageSize, label: `${ref.packageSize} ${ref.packageUnit}`, purchaseUnit: id === 'grout' ? 'opakowanie' : id === 'silicone-grout' ? 'kartusz' : 'butelka'}, notes: ref.notes};
  });
}

export const groutOnlyInputs: MeasurementInputDefinition[] = [
  {id: 'wallArea', label: 'Łączna powierzchnia płytek', unit: 'm²', inputType: 'area', placeholder: 'np. 10', min: 1, max: 300, required: true},
  {id: 'groutProduct', label: 'Fuga i kolor do porównania cen', unit: '', inputType: 'select', placeholder: 'Wybierz produkt', min: 0, max: 1, defaultValue: 0, required: false, options: [{value: 0, label: 'Jeszcze dobieram fugę i kolor'}, {value: 1, label: 'Atlas Fuga Ceramiczna 001 biała, 2 kg'}], hint: 'Wybrany produkt pozostaje taki sam przy zmianie poziomu cen. Biały 001 jest konkretnym kolorem, nie automatycznym zamiennikiem innych fug. Sprawdź próbkę koloru i zgodność z płytkami.'},
  {id: 'tileWidthCm', label: 'Szerokość płytki', unit: 'cm', inputType: 'dimension', placeholder: '30', defaultValue: 30, min: 5, max: 120, required: false},
  {id: 'tileHeightCm', label: 'Długość/wysokość płytki', unit: 'cm', inputType: 'dimension', placeholder: '30', defaultValue: 30, min: 5, max: 120, required: false},
  {id: 'groutWidthMm', label: 'Szerokość spoiny cementowej', unit: 'mm', inputType: 'dimension', placeholder: '3', defaultValue: 3, min: 1, max: 20, required: false, hint: 'Atlas Fuga Ceramiczna: spoiny 1–20 mm. Różne formaty płytek lub szerokości spoin rozdziel na osobne prace.'},
  {id: 'groutDepthMm', label: 'Głębokość wypełnienia spoiny fugą', unit: 'mm', inputType: 'dimension', placeholder: 'Zmierz oczyszczoną spoinę', min: 1, max: 30, required: true, hint: 'Podaj rzeczywistą głębokość wypełnienia po usunięciu kleju ze spoin. Karta wymaga jednakowej, czystej głębokości. Nie zakładamy automatycznie grubości płytki ani 9 mm.'},
  {id: 'groutReservePercent', label: 'Zapas fugi i silikonu', unit: '%', inputType: 'count', placeholder: '10', defaultValue: 10, min: 0, max: 30, required: false, hint: 'Jawne założenie zakupowe ponad obliczone zużycie. Wspólny koszyk dobiera pełne opakowania po zsumowaniu prac.'},
  {id: 'groutSealantLength', label: 'Długość połączeń elastycznych do uszczelnienia', unit: 'm', inputType: 'length', placeholder: 'Zmierz; 0, jeśli nie kupujesz silikonu', min: 0, max: 100, required: true, hint: 'Zmierz narożniki i połączenia wymagające elastycznego uszczelnienia. Nie wyliczamy długości z powierzchni płytek. 0 oznacza świadome pominięcie zakupu.'},
  {id: 'groutSealantModel', label: 'Silikon dobrany do powierzchni', unit: '', inputType: 'select', placeholder: 'Dobierz silikon', min: 0, max: 2, defaultValue: 0, required: false, options: [{value: 0, label: 'Dobór silikonu do ustalenia'}, {value: 1, label: 'Soudal sanitarny biały 280 ml — do ceramiki, szkła i emalii'}, {value: 2, label: 'Soudal sanitarny STOP biały 280 ml — neutralny, także do akrylu'}], hint: 'Sprawdź zgodność produktu i geometrii połączenia z podłożem oraz kartą producenta. Silikon octowy nie jest automatycznym wyborem do akrylowej wanny.'},
  {id: 'groutSealantWidthMm', label: 'Szerokość spoiny silikonowej', unit: 'mm', inputType: 'dimension', placeholder: 'Zmierz', min: 5, max: 30, required: true},
  {id: 'groutSealantDepthMm', label: 'Głębokość wypełnienia silikonem', unit: 'mm', inputType: 'dimension', placeholder: 'Zmierz', min: 5, max: 30, required: true, hint: 'Zakup liczymy z prostokątnego przekroju: długość × szerokość × głębokość. Prawidłowy kształt i podparcie spoiny dobierz według karty silikonu.'},
  {id: 'groutCleanerChoice', label: 'Czy potrzebujesz preparatu do pozostałości cementowych?', unit: '', inputType: 'select', placeholder: 'Zdecyduj o zakupie', min: 0, max: 2, defaultValue: 0, required: false, options: [{value: 0, label: 'Jeszcze sprawdzę — zakup nieustalony'}, {value: 1, label: 'Bez zakupu preparatu — bieżące czyszczenie wodą'}, {value: 2, label: 'Atlas SZOP 1 kg — po sprawdzeniu zgodności i próbie'}], hint: 'Świeżą fugę czyść wodą według jej karty. SZOP zawiera kwas: tylko powierzchnie odporne na kwasy, próba w mało widocznym miejscu i właściwe rozcieńczenie. Może wymyć lub przebarwić fugę cementową; długi kontakt osłabia jej hydrofobowość. Nie zalecamy użycia automatycznie po 24 h.'},
  {id: 'groutCleanerPacks', label: 'Butelki Atlas SZOP 1 kg do kupienia', unit: 'szt.', inputType: 'count', placeholder: 'Ustal po próbie czyszczenia', min: 1, max: 20, required: true, hint: 'Producent nie podaje stałego zużycia na m². Podaj całe butelki po ocenie zabrudzeń. Liczymy 1 kg preparatu na butelkę, nie litr rozcieńczonego roztworu.'},
];

export function groutOnlyInputVisible(job: string, id: string, m: Readonly<Record<string, string | number | undefined>>): boolean {
  if (job !== GROUT_ONLY_JOB) return true;
  if (['groutSealantModel', 'groutSealantWidthMm', 'groutSealantDepthMm'].includes(id)) return Number(m.groutSealantLength) !== 0;
  if (id === 'groutCleanerPacks') return Number(m.groutCleanerChoice) === 2;
  return true;
}

export function groutOnlyExplanation(id: string, m: MeasurementMap, raw: number, packs: number | undefined, unit: string): MaterialExplanation {
  const qty = groutOnlyQuantity(id, m);
  return {
    text: qty === null ? 'Uzupełnij pomiar, dobór produktu lub decyzję o czyszczeniu w obmiarach.' : qty === 0 ? 'Zakup świadomie pominięty w obmiarach.' : `${raw} ${unit} z obmiarów → ${packs} pełnych opakowań.`,
    assumptions: [id === 'grout' ? `Płytki ${m.tileWidthCm} × ${m.tileHeightCm} cm, spoina ${m.groutWidthMm} mm × ${m.groutDepthMm} mm; gęstość wypełnionej spoiny 1650 kg/m³.` : id === 'silicone-grout' ? `Prostokątny przekrój: ${m.groutSealantLength} m × ${m.groutSealantWidthMm} mm × ${m.groutSealantDepthMm} mm = ml przed zapasem.` : 'Butelki 1 kg wskazane przez użytkownika; bez domyślnej wydajności na m².', id === 'grout-cleaner' ? 'SZOP nie jest środkiem do rutynowego czyszczenia świeżej fugi.' : `Zapas zakupowy: ${m.groutReservePercent ?? 10}%.`, 'Wspólny koszyk sumuje surowe ilości tego samego produktu przed doborem opakowań.'],
  };
}

export function reviewGroutOnlyCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (!calc || calc.jobId !== GROUT_ONLY_JOB) return calc;
  const definitions = groutOnlyMaterials(calc.measurements);
  const materials = calc.materials.map(line => {
    if (!isGroutOnlyMaterial(calc.jobId, line.material.id)) return line;
    const needed = groutOnlyQuantity(line.material.id, calc.measurements), definition = definitions.find(m => m.id === line.material.id);
    const identityMatches = needed === 0 || definition?.ean && 'ean' in line.material && line.material.ean === definition.ean && line.material.unit === definition.unit && line.material.packaging?.size === definition.packaging?.size;
    if (calc.quantityModel === GROUT_ONLY_MODEL && needed !== null && identityMatches && Number.isFinite(line.rawQuantity) && Math.abs(line.rawQuantity! - needed) <= 1e-7) return line;
    return {...line, quantityKnown: false};
  });
  return {...calc, materials, quantityIssues: materials.filter(l => l.quantityKnown === false).map(l => l.material.name)};
}
export const reviewGroutOnlyProject = (project: Project): Project => project.jobId === GROUT_ONLY_JOB ? {...project, calculationResult: reviewGroutOnlyCalculation(project.calculationResult)} : project;
export function reviewGroutOnlyShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (calc?.jobId !== GROUT_ONLY_JOB) return [...items];
  return items.flatMap(item => {
    if (item.itemType !== 'material' || !isGroutOnlyMaterial(calc.jobId, item.materialId)) return [item];
    const line = calc.materials.find(l => l.material.id === item.materialId), needed = groutOnlyQuantity(item.materialId, calc.measurements);
    if (calc.quantityModel !== GROUT_ONLY_MODEL || !line || line.quantityKnown === false || needed === null) return [{...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false}];
    if (needed === 0) return [];
    const matches = item.name === line.material.name && item.unit === line.material.unit && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) + 1e-8 >= needed;
    return [{...item, name: line.material.name, unit: line.material.unit, quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: needed, quantityKnown: true, needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased, notes: line.material.notes}];
  });
}
