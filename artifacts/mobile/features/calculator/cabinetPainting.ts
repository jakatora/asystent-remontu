import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import { V33_CABINET_FAMILY, V33_CABINET_FAMILY_NAME } from '../../../../lib/pricing-service/src/package-families';
import { mixedPackagePlans } from '../../../../lib/pricing-service/src/mixed-package-plans';

export const CABINET_JOB = 'kitchen-cabinet-paint';
export const CABINET_MODEL = 'cabinet-v33-easy-v1';
const IDS = ['cabinet-primer', 'cabinet-paint', 'sandpaper-cabinet', 'degreaser-cabinet'];
export const isCabinetMaterial = (job: string, id: string) => job === CABINET_JOB && IDS.includes(id);
const valid = (n: number | undefined, min: number, max: number): n is number => Number.isFinite(n) && n! >= min && n! <= max;
const ready = (m: MeasurementMap) => [1, 2].includes(m.cabinetSurface!) && [1, 2, 3].includes(m.cabinetPaintPack!);

export function cabinetReference(id: string, m: MeasurementMap = {}): string | null {
  if (id === 'cabinet-paint') return m.cabinetPaintPack === 1 ? 'mat-cabinet-v33-easy-white-750ml' : m.cabinetPaintPack === 2 ? 'mat-cabinet-v33-easy-white-2000ml' : null;
  if (id === 'sandpaper-cabinet') return 'mat-hand-paper-klingspor-pl28c-p240';
  if (id === 'degreaser-cabinet' && m.cabinetPreparation === 2) return 'mat-extraction-solvent-anser-500ml';
  return null;
}

// Current Easy system, not the older Renowacja drying schedule. Area includes
// every painted side/edge; doorCount never supplies a guessed surface area.
// source: https://www.v33.pl/v33-product/easy-renowacja-kuchnia/
// source: https://v33-renowacja.pl/
export function cabinetQuantity(id: string, m: MeasurementMap): number | null {
  if (!IDS.includes(id) || !ready(m)) return null;
  if (id === 'cabinet-primer') return 0;
  if (id === 'cabinet-paint') {
    const coats = m.cabinetCoats ?? 2, coverage = m.cabinetCoverage ?? 12, reserve = m.cabinetReservePercent ?? 10;
    return valid(m.cabinetArea, 0.1, 500) && Number.isInteger(coats) && valid(coats, 2, 3) && valid(coverage, 1, 12) && valid(reserve, 0, 30)
      ? Number((m.cabinetArea * coats / coverage * 1000 * (1 + reserve / 100)).toFixed(8)) : null;
  }
  if (id === 'sandpaper-cabinet') return m.cabinetSurface === 2 ? 0 : Number.isInteger(m.cabinetP240Sheets) && valid(m.cabinetP240Sheets, 1, 500) ? m.cabinetP240Sheets : null;
  if (m.cabinetPreparation === 1) return 0;
  return m.cabinetPreparation === 2 && Number.isInteger(m.cabinetSolventBottles) && valid(m.cabinetSolventBottles, 1, 100) ? m.cabinetSolventBottles * 500 : null;
}

const labels: Record<string, string> = {
  'cabinet-primer': 'Grunt — dobierz system i podłoże',
  'cabinet-paint': 'Farba do frontów — wybierz opakowanie i zmierz powierzchnię',
  'sandpaper-cabinet': 'Papier P240 — podaj liczbę arkuszy',
  'degreaser-cabinet': 'Mycie i odtłuszczanie — potwierdź potrzebne środki',
};
export function cabinetMaterials(m: MeasurementMap = {}): MaterialItem[] {
  return IDS.map(id => {
    if(id==='cabinet-paint'&&m.cabinetPaintPack===3)return {id,name:V33_CABINET_FAMILY_NAME,packageFamily:V33_CABINET_FAMILY,category:'cabinet-paint',brand:'V33',unit:'ml',formulaKey:'cabinet:'+id,pricePerUnit:0,wasteFactor:1,roundingRule:'none',notes:'Dobierzemy pełne puszki 0,75 l, 2 l lub ich mieszankę tego samego białego satynowego wariantu. Ilości łączymy między pracami przed doborem opakowań, a o wyniku decyduje cały koszyk z dostawą. Każda puszka zachowuje własny EAN i zdjęcie.'};
    const ref = MATERIAL_PRICES.find(row => row.id === cabinetReference(id, m));
    if (!ref) return { id, name: labels[id], unit: 'ml', formulaKey: 'cabinet:' + id, pricePerUnit: 0 };
    const photo = PRODUCT_PHOTOS.find(row => row.ids.includes(ref.id));
    return { id, name: ref.productLabel, brand: ref.brand, ean: photo?.ean, imageUrl: photo?.imageUrl, sourceUrl: ref.sourceUrl,
      category: ref.materialType, unit: ref.packageUnit, formulaKey: 'cabinet:' + id, pricePerUnit: ref.pricePerPackage,
      priceBasis: 'package', wasteFactor: 1, packaging: { size: ref.packageSize, label: `${ref.packageSize} ${ref.packageUnit}`, purchaseUnit: id === 'cabinet-paint' ? 'puszka' : id === 'degreaser-cabinet' ? 'butelka' : 'arkusz' }, notes: ref.notes };
  });
}

/** Reference-only material budget; actual prices and whole-cart shipping are
 * always obtained from the server. Never show the automatic paint as free. */
export function cabinetReferencePlan(m:MeasurementMap){
  const required=cabinetQuantity('cabinet-paint',m);
  if(required===null)return null;
  const ids=['mat-cabinet-v33-easy-white-750ml','mat-cabinet-v33-easy-white-2000ml'];
  return mixedPackagePlans(required,MATERIAL_PRICES.filter(r=>ids.includes(r.id)).map(r=>({packageSize:r.packageSize,unitPriceGrosze:Math.round(r.pricePerPackage*100),store:r.storeName,url:r.sourceUrl??null,offerId:r.id}))).plans[0]??null;
}

export const cabinetInputs: MeasurementInputDefinition[] = [
  { id: 'doorCount', label: 'Liczba frontów szafek', unit: 'szt.', inputType: 'count', placeholder: 'np. 12', min: 1, max: 100, required: false, hint: 'Pomocniczo do planowania pracy. Farbę obliczymy z powierzchni, nie z liczby frontów.' },
  { id: 'cabinetSurface', label: 'Powierzchnia frontów', unit: '', inputType: 'select', placeholder: 'Sprawdź podłoże', min: 0, max: 2, defaultValue: 0, required: false,
    options: [{ value: 0, label: 'Inna lub jeszcze nieustalona — potrzebny dobór systemu' }, { value: 1, label: 'Drewno lub melamina ze stabilną farbą albo lakierem' }, { value: 2, label: 'Laminat w dobrym stanie' }],
    hint: 'Ten wariant V33 nie wymaga osobnego gruntu na wskazanych powierzchniach. Surowy dąb i kasztan, wosk, olej i uszkodzona okleina wymagają osobnego doboru. Wariant nie obejmuje poziomych blatów, które potrzebują dodatkowego lakieru.' },
  { id: 'cabinetPaintPack', label: 'Farba do porównania cen', unit: '', inputType: 'select', placeholder: 'Wybierz farbę i sposób doboru puszek', min: 0, max: 3, defaultValue: 0, required: false,
    options: [{ value: 0, label: 'Jeszcze wybieram farbę' }, { value: 3, label: 'V33 biały satyna — dobierz najtańsze puszki z dostawą' }, { value: 1, label: 'V33 Easy Renowacja Kuchnia — tylko puszki 0,75 l' }, { value: 2, label: 'V33 Easy Renowacja Kuchnia — tylko puszki 2 l' }],
    hint: 'Automatyczny dobór porówna 0,75 l, 2 l i mieszanki tych opakowań. Uwzględni ilości ze wspólnego koszyka i koszt dostawy całych zamówień. Możesz też ograniczyć zakup do jednej wielkości; każdy EAN pozostaje osobnym produktem.' },
  { id: 'cabinetArea', label: 'Łączna powierzchnia do pomalowania', unit: 'm²', inputType: 'area', placeholder: 'Zmierz wszystkie malowane strony i krawędzie', min: 0.1, max: 500, required: true,
    hint: 'Zsumuj szerokość × wysokość każdej malowanej strony oraz powierzchnię krawędzi. Jeśli malujesz obie strony, uwzględnij obie. Nie wpisuj powierzchni podłogi kuchni.' },
  { id: 'cabinetCoats', label: 'Liczba warstw farby', unit: '', inputType: 'count', placeholder: '2', defaultValue: 2, min: 2, max: 3, required: true, hint: 'Producent wymaga minimum dwóch warstw. Odczekaj około 6 godzin między warstwami.' },
  { id: 'cabinetCoverage', label: 'Wydajność na jedną warstwę', unit: 'm²/l', inputType: 'area', placeholder: '12', defaultValue: 12, min: 1, max: 12, required: true, hint: 'Karta podaje około 12 m²/l na jedną warstwę. Zmniejsz wydajność, jeśli próba na Twoich frontach wymaga więcej farby.' },
  { id: 'cabinetReservePercent', label: 'Zapas farby', unit: '%', inputType: 'count', placeholder: '10', defaultValue: 10, min: 0, max: 30, required: false, hint: 'Założenie zakupowe. Dodajemy ten zapas tylko do farby, przed zaokrągleniem do pełnych puszek.' },
  { id: 'cabinetP240Sheets', label: 'Papier P240 do zmatowienia powłoki', unit: 'arkusz', inputType: 'count', placeholder: 'Podaj potrzebną liczbę', min: 1, max: 500, required: true, hint: 'Klingspor PL28C P240. Liczba zależy od stanu frontów; nie zgadujemy jej z metrów kwadratowych. Posiadany papier oznacz później na liście zakupów.' },
  { id: 'cabinetPreparation', label: 'Środki do mycia i odtłuszczania', unit: '', inputType: 'select', placeholder: 'Sprawdź posiadane środki', min: 0, max: 2, defaultValue: 0, required: false,
    options: [{ value: 0, label: 'Jeszcze dobieram środki — zestaw niepełny' }, { value: 1, label: 'Mam odpowiedni detergent i środek do odtłuszczania' }, { value: 2, label: 'Mam odpowiedni detergent; dokupuję benzynę Anser 500 ml' }],
    hint: 'V33 zaleca detergent bez nabłyszczaczy i tłustej warstwy, odtłuszczenie np. benzyną ekstrakcyjną i dokładne płukanie czystą wodą. Przestrzegaj etykiet i wentylacji. Benzyna służy do przygotowania powierzchni, nie do rozcieńczania tej farby.' },
  { id: 'cabinetSolventBottles', label: 'Benzyna Anser 500 ml do kupienia', unit: 'butelka', inputType: 'count', placeholder: 'Podaj potrzebną liczbę', min: 1, max: 100, required: true, hint: 'Podaj liczbę butelek według potrzeb przygotowania frontów. Nie wyliczamy zużycia rozpuszczalnika z powierzchni.' },
];
export function cabinetInputVisible(job: string, id: string, m: Readonly<Record<string, string | number | undefined>>): boolean {
  if (job !== CABINET_JOB) return true;
  if (id === 'cabinetP240Sheets') return Number(m.cabinetSurface) === 1;
  if (id === 'cabinetSolventBottles') return Number(m.cabinetPreparation) === 2;
  return true;
}

export function reviewCabinetCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (calc?.jobId !== CABINET_JOB) return calc;
  const definitions = cabinetMaterials(calc.measurements);
  const materials = calc.materials.map(line => {
    if (!isCabinetMaterial(calc.jobId, line.material.id)) return line;
    const needed = cabinetQuantity(line.material.id, calc.measurements), def = definitions.find(row => row.id === line.material.id);
    const auto = line.material.id==='cabinet-paint'&&calc.measurements.cabinetPaintPack===3;
    const identity = needed === 0 || (auto ? ('packageFamily' in line.material&&line.material.packageFamily===V33_CABINET_FAMILY&&!line.material.ean&&line.material.name===V33_CABINET_FAMILY_NAME&&line.material.unit==='ml'&&!line.material.packaging) : def?.ean && 'ean' in line.material && line.material.ean === def.ean && line.material.unit === def.unit && line.material.packaging?.size === def.packaging?.size);
    return calc.quantityModel === CABINET_MODEL && line.quantityKnown !== false && needed !== null && identity && Number.isFinite(line.rawQuantity) && Math.abs(line.rawQuantity! - needed) <= 1e-7 ? line : { ...line, quantityKnown: false };
  });
  for (const material of definitions) {
    if (!materials.some(line => line.material.id === material.id) && cabinetQuantity(material.id, calc.measurements) !== 0) {
      materials.push({ material, quantity: 0, rawQuantity: 0, cost: 0, quantityKnown: false });
    }
  }
  return { ...calc, materials, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}
export const reviewCabinetProject = (p: Project): Project => p.jobId === CABINET_JOB ? { ...p, calculationResult: reviewCabinetCalculation(p.calculationResult) } : p;
export function reviewCabinetShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (calc?.jobId !== CABINET_JOB) return [...items];
  const reviewed = reviewCabinetCalculation(calc)!;
  return items.flatMap(item => {
    if (item.itemType !== 'material' || !isCabinetMaterial(calc.jobId, item.materialId)) return [item];
    const line = reviewed.materials.find(row => row.material.id === item.materialId), needed = cabinetQuantity(item.materialId, calc.measurements);
    if (!line || line.quantityKnown === false || needed === null) return [{ ...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false }];
    if (needed === 0) return [];
    const matches = item.name === line.material.name && item.unit === line.material.unit && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) + 1e-8 >= needed;
    return [{ ...item, name: line.material.name, unit: line.material.unit, quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: needed,
      quantityKnown: true, needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased, notes: line.material.notes }];
  });
}
