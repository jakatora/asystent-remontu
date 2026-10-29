import type {CalculationResult, MaterialItem, Project, ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';

export const TRAP_JOB = 'sink-trap-replace';
export const TRAP_MODEL = 'basin-trap-whb-v1';
const IDS = ['sink-trap-mat', 'teflon-trap'];
export const isTrapMaterial = (job: string, id: string) => job === TRAP_JOB && IDS.includes(id);
export const trapReference = (id: string, m: MeasurementMap = {}) => id === 'sink-trap-mat' && m.trapVariant === 1 ? 'mat-basin-trap-mcalpine-whb1-32' : null;

// This is a basin half-trap, not a kitchen-sink trap or a new waste fitting.
// source: https://mcalpine.pl/product/syfon-umywalkowy-niski-bialy-whb1-32/
// source: https://mcalpine.pl/wp-content/uploads/2025/06/WHB1-32-Karta-produktu-2025.pdf
// source: https://sklep.instato.pl/pl/p/SYFON-UMYWALKOWY-BARDZO-NISKI-MALY-MEMBRANOWY-oszczedzajacy-miejsce-WHB1-32/23062689
export function trapQuantity(id: string, m: MeasurementMap): number | null {
  if (!IDS.includes(id) || m.trapVariant !== 1 || m.trapFit !== 1 || !Number.isSafeInteger(m.trapCount) || m.trapCount! < 1 || m.trapCount! > 10) return null;
  // The legacy accessory ID remains, but PTFE is never added automatically.
  // Zero is justified only by the user's explicit complete-joint declaration.
  return id === 'sink-trap-mat' ? m.trapCount! : m.trapJoints === 1 ? 0 : null;
}

export function trapMaterials(m: MeasurementMap = {}): MaterialItem[] {
  return IDS.map(id => {
    const ref = MATERIAL_PRICES.find(r => r.id === trapReference(id, m));
    const photo = ref && PRODUCT_PHOTOS.find(p => p.ids.includes(ref.id));
    if (!ref) return {id, name: id === 'sink-trap-mat' ? 'Syfon — wybierz model i sprawdź przyłącza' : 'Uszczelki i przyłącza — potwierdź komplet lub dobierz brakujące', unit: 'szt', formulaKey: 'trapReplacement:' + id, pricePerUnit: 0, wasteFactor: 1, roundingRule: 'none', notes: 'Cena kompletna wymaga potwierdzenia dopasowania syfonu oraz sprawnego, pasującego odpływu, rury i uszczelek. Nie dodajemy taśmy PTFE ani nie zakładamy, że zastępuje brakującą uszczelkę. Brakujące części wymagają osobnego doboru.'};
    return {id, name: ref.productLabel, brand: ref.brand, ean: photo?.ean, imageUrl: photo?.imageUrl, sourceUrl: ref.sourceUrl, category: ref.materialType, unit: 'szt', formulaKey: 'trapReplacement:' + id, pricePerUnit: ref.pricePerPackage, priceBasis: 'package', wasteFactor: 1, roundingRule: 'none', packaging: {size: 1, label: '1 syfon bez spustu', purchaseUnit: 'szt'}, notes: 'McAlpine WHB1-32, EAN 5036484088390: umywalka, przyłącze 1¼″, odpływ 32 mm, biały, membrana. Wysokość syfonu według producenta 62 mm; sprawdź pełny rysunek i miejsce na połączenia. Bez nowego spustu. Ten wariant nie obejmuje przebudowy instalacji ani syfonu zlewozmywakowego.'};
  });
}

export const trapInputs: MeasurementInputDefinition[] = [
  {id: 'trapCount', label: 'Liczba syfonów do wymiany', unit: 'szt.', inputType: 'count', placeholder: 'np. 1', min: 1, max: 10, required: true, hint: 'Jedna wymieniana umywalka to jeden syfon. Kupujemy podaną liczbę całych sztuk, bez automatycznego zapasu.'},
  {id: 'trapVariant', label: 'Syfon do porównania cen', unit: '', inputType: 'select', placeholder: 'Wybierz model', min: 0, max: 1, defaultValue: 0, required: false, options: [{value: 0, label: 'Inny syfon lub jeszcze wybieram — potrzebny dobór'}, {value: 1, label: 'Umywalka: McAlpine WHB1-32, biały, bez spustu'}], hint: 'Porównujemy dokładnie ten sam EAN 5036484088390 w sklepach. Model z membraną, niski; nie jest automatycznym zamiennikiem syfonu do zlewozmywaka.'},
  {id: 'trapFit', label: 'Dopasowanie do umywalki i instalacji', unit: '', inputType: 'select', placeholder: 'Sprawdź połączenia i miejsce', min: 0, max: 2, defaultValue: 0, required: false, options: [{value: 0, label: 'Jeszcze nie sprawdzono — wycena niepełna'}, {value: 1, label: 'Potwierdzam: 1¼″, odpływ 32 mm i miejsce według rysunku'}, {value: 2, label: 'Inne wymiary, zlewozmywak lub potrzebna przebudowa'}], hint: 'Sprawdź gwint istniejącego spustu umywalkowego, średnicę rury, układ oraz przestrzeń na cały montaż. Karta producenta podaje wysokość syfonu 62 mm; sam ten wymiar nie potwierdza pasowania.'},
  {id: 'trapJoints', label: 'Spust, rura i komplet uszczelek', unit: '', inputType: 'select', placeholder: 'Sprawdź komplet połączeń', min: 0, max: 2, defaultValue: 0, required: false, options: [{value: 0, label: 'Jeszcze nie sprawdzono — części do ustalenia'}, {value: 1, label: 'Mam sprawny, pasujący spust, rurę i uszczelki; bez dodatkowych zakupów'}, {value: 2, label: 'Potrzebuję dodatkowych części — do doboru'}], hint: 'Oferta obejmuje syfon bez nowego spustu. Potwierdź cały układ zgodnie z instrukcją, w tym potrzebne uszczelki. W przeciwnym razie pokażemy częściową cenę; nie potraktujemy brakujących przyłączy jako darmowych.'},
];

export function reviewTrapCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (calc?.jobId !== TRAP_JOB) return calc;
  const definitions = trapMaterials(calc.measurements);
  const materials = calc.materials.map(line => {
    if (!isTrapMaterial(calc.jobId, line.material.id)) return line;
    const n = trapQuantity(line.material.id, calc.measurements), def = definitions.find(r => r.id === line.material.id);
    const identity = n === 0 || Boolean(def?.ean && 'ean' in line.material && line.material.ean === def.ean && line.material.unit === 'szt' && line.material.packaging?.size === 1);
    return calc.quantityModel === TRAP_MODEL && n !== null && identity && line.quantityKnown !== false && line.rawQuantity === n ? line : {...line, quantityKnown: false};
  });
  for (const material of definitions) if (!materials.some(l => l.material.id === material.id) && trapQuantity(material.id, calc.measurements) !== 0) materials.push({material, quantity: 0, rawQuantity: 0, cost: 0, quantityKnown: false});
  return {...calc, materials, quantityIssues: materials.filter(l => l.quantityKnown === false).map(l => l.material.name)};
}
export const reviewTrapProject = (p: Project): Project => p.jobId === TRAP_JOB ? {...p, calculationResult: reviewTrapCalculation(p.calculationResult)} : p;
export function reviewTrapShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (calc?.jobId !== TRAP_JOB) return [...items];
  const reviewed = reviewTrapCalculation(calc)!;
  return items.flatMap(item => {
    if (item.itemType !== 'material' || !isTrapMaterial(calc.jobId, item.materialId)) return [item];
    const n = trapQuantity(item.materialId, calc.measurements), line = reviewed.materials.find(l => l.material.id === item.materialId);
    if (n === null || !line || line.quantityKnown === false) return [{...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false}];
    if (n === 0) return [];
    const matches = item.name === line.material.name && item.unit === line.material.unit && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) >= n;
    return [{...item, name: line.material.name, unit: line.material.unit, quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: n, quantityKnown: true, needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased, notes: line.material.notes}];
  });
}
