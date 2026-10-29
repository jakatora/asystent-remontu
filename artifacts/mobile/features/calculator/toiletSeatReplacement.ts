import type {CalculationResult, MaterialItem, Project, ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';

export const SEAT_JOB = 'toilet-seat-replace';
export const SEAT_MODEL = 'carina-seats-v1';
const IDS = ['toilet-seat-mat', 'seat-mounting-parts'];
const REFS: Record<number, string> = {
  1: 'mat-seat-cersanit-carina-standard',
  2: 'mat-seat-cersanit-carina-softclose',
  3: 'mat-seat-cersanit-carina-slim',
};
export const isSeatMaterial = (job: string, id: string) => job === SEAT_JOB && IDS.includes(id);
export const seatReference = (id: string, m: MeasurementMap = {}) => id === 'toilet-seat-mat' ? REFS[m.seatVariant ?? 0] ?? null : null;
export function withSeatMeasurement(current: Readonly<Record<string, string>>, id: string, value: string | number): Record<string, string> {
  const next = String(value);
  if ((id === 'seatVariant' || id === 'seatCount') && current[id] !== next) return {...current, [id]: next, seatFit: '0', seatMounts: '0'};
  return {...current, [id]: next};
}

// Cersanit's three different Carina seat codes and dimensions must remain
// distinct. A compatible replacement by another maker is not the same EAN.
// source: https://www.cersanit.com.pl/katalogi/cersanit_general_catalogue_2025_2026_pl/
// source: https://www.cersanit.com.pl/lazienka/deska-carina-slim-duroplastowa-antybakteryjna-wolnoopadajaca-z-funkcja-latwego-wypinania-jednym-przyciskiem,190.html
export function seatQuantity(id: string, m: MeasurementMap): number | null {
  if (!IDS.includes(id) || !REFS[m.seatVariant ?? 0] || m.seatFit !== 1 || !Number.isSafeInteger(m.seatCount) || m.seatCount! < 1 || m.seatCount! > 10) return null;
  return id === 'toilet-seat-mat' ? m.seatCount! : m.seatMounts === 1 ? 0 : null;
}

export function seatMaterials(m: MeasurementMap = {}): MaterialItem[] {
  return IDS.map(id => {
    const ref = MATERIAL_PRICES.find(r => r.id === seatReference(id, m));
    const photo = ref && PRODUCT_PHOTOS.find(p => p.ids.includes(ref.id));
    if (!ref) return {id, name: id === 'toilet-seat-mat' ? 'Deska sedesowa — wybierz dokładny model i sprawdź miskę' : 'Mocowania i podkładki — potwierdź komplet lub dobierz brakujące', unit: 'szt', formulaKey: 'toiletSeatReplacement:' + id, pricePerUnit: 0, wasteFactor: 1, roundingRule: 'none', notes: 'Pełna cena wymaga sprawdzenia modelu miski, wymiarów, sposobu mocowania i kompletu elementów. Jeśli potrzebne są inne śruby, zawiasy lub podkładki, wymagają osobnego doboru i wyceny.'};
    return {id, name: ref.productLabel, brand: ref.brand, ean: photo?.ean, imageUrl: photo?.imageUrl, sourceUrl: ref.sourceUrl, category: ref.materialType, unit: 'szt', formulaKey: 'toiletSeatReplacement:' + id, pricePerUnit: ref.pricePerPackage, priceBasis: 'package', wasteFactor: 1, roundingRule: 'none', packaging: {size: 1, label: '1 deska', purchaseUnit: 'szt'}, notes: `Oryginalna deska Cersanit ${ref.productLabel}, EAN ${photo?.ean}. Potwierdź oznaczenie miski WC, jej kształt i wymiary oraz sposób montażu z instrukcją. Oferty innych kodów i zamienników nie są ceną tego produktu.`};
  });
}

export const seatInputs: MeasurementInputDefinition[] = [
  {id: 'seatCount', label: 'Liczba desek do wymiany', unit: 'szt.', inputType: 'count', placeholder: 'np. 1', min: 1, max: 10, required: true, hint: 'Jedna miska to jedna deska. Kupujemy dokładnie tę liczbę całych sztuk, bez automatycznego zapasu. Jeśli zmienisz liczbę, potwierdź zgodność każdej miski ponownie.'},
  {id: 'seatVariant', label: 'Dokładny model deski Carina', unit: '', inputType: 'select', placeholder: 'Wybierz kod produktu', min: 0, max: 3, defaultValue: 0, required: false, options: [{value: 0, label: 'Inny model lub jeszcze wybieram'}, {value: 1, label: 'K98-0068 — standardowa, 36,1 × 43,4 cm'}, {value: 2, label: 'K98-0069 — wolnoopadająca, 36,1 × 43,8 cm'}, {value: 3, label: 'K98-0135 — SLIM wolnoopadająca, 35,7 × 44,8 cm'}], hint: 'To trzy różne oryginalne produkty Cersanit. Porównujemy oferty tylko tego samego kodu i EAN.'},
  {id: 'seatFit', label: 'Zgodność z miską WC', unit: '', inputType: 'select', placeholder: 'Sprawdź miskę i mocowanie', min: 0, max: 2, defaultValue: 0, required: false, options: [{value: 0, label: 'Jeszcze nie sprawdzono — wycena niepełna'}, {value: 1, label: 'Potwierdzam zgodność wszystkich misek, wymiarów i mocowań'}, {value: 2, label: 'Inna miska lub mocowanie — potrzebny dobór'}], hint: 'Sprawdź nazwę lub kod każdej miski, kształt, rzeczywiste wymiary i rozstaw mocowań z rysunkiem producenta. Sama nazwa „Carina” albo ogólny rozstaw śrub nie wystarczą. Po zmianie modelu lub liczby potwierdź ponownie.'},
  {id: 'seatMounts', label: 'Mocowania, podkładki i zawiasy', unit: '', inputType: 'select', placeholder: 'Sprawdź zawartość opakowania', min: 0, max: 2, defaultValue: 0, required: false, options: [{value: 0, label: 'Jeszcze nie sprawdzono — części do ustalenia'}, {value: 1, label: 'Potwierdzam kompletny, pasujący zestaw bez dodatkowych części'}, {value: 2, label: 'Potrzebuję innych lub brakujących elementów'}], hint: 'Sprawdź zawartość wybranej oferty oraz instrukcję montażu dla swojej miski. Bez potwierdzenia dodatkowych elementów pokażemy cenę częściową.'},
];

export function reviewSeatCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (calc?.jobId !== SEAT_JOB) return calc;
  const definitions = seatMaterials(calc.measurements);
  const materials = calc.materials.map(line => {
    if (!isSeatMaterial(calc.jobId, line.material.id)) return line;
    const n = seatQuantity(line.material.id, calc.measurements), def = definitions.find(r => r.id === line.material.id);
    const identity = n === 0 || Boolean(def?.ean && 'ean' in line.material && line.material.ean === def.ean && line.material.unit === 'szt' && line.material.packaging?.size === 1);
    return calc.quantityModel === SEAT_MODEL && n !== null && identity && line.quantityKnown !== false && line.rawQuantity === n ? line : {...line, quantityKnown: false};
  });
  for (const material of definitions) if (!materials.some(l => l.material.id === material.id) && seatQuantity(material.id, calc.measurements) !== 0) materials.push({material, quantity: 0, rawQuantity: 0, cost: 0, quantityKnown: false});
  return {...calc, materials, quantityIssues: materials.filter(l => l.quantityKnown === false).map(l => l.material.name)};
}
export const reviewSeatProject = (p: Project): Project => p.jobId === SEAT_JOB ? {...p, calculationResult: reviewSeatCalculation(p.calculationResult)} : p;
export function reviewSeatShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (calc?.jobId !== SEAT_JOB) return [...items];
  const reviewed = reviewSeatCalculation(calc)!;
  return items.flatMap(item => {
    if (item.itemType !== 'material' || !isSeatMaterial(calc.jobId, item.materialId)) return [item];
    const n = seatQuantity(item.materialId, calc.measurements), line = reviewed.materials.find(l => l.material.id === item.materialId);
    if (n === null || !line || line.quantityKnown === false) return [{...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false}];
    if (n === 0) return [];
    const matches = item.name === line.material.name && item.unit === line.material.unit && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) >= n;
    return [{...item, name: line.material.name, unit: line.material.unit, quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: n, quantityKnown: true, needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased, notes: line.material.notes}];
  });
}
