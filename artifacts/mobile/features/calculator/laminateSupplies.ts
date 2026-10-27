import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';

export const LAMINATE_JOB = 'laminate-flooring';
export const LAMINATE_SUPPLIES_MODEL = 'laminate-supplies-v1';
const IDS = ['underlay', 'vapor-barrier', 'threshold', 'spacers', 'laminate-joint-tape', 'threshold-fixings'];
export const isLaminateSupply = (jobId: string, id: string) => jobId === LAMINATE_JOB && IDS.includes(id);
export function laminateSupplyWarnings(lines: readonly { quantityKnown?: boolean }[]) {
  const missing = lines.filter(line => line.quantityKnown === false).length;
  return missing ? [{ condition: 'always' as const, level: 'warning' as const, message: `Niepełna wycena: ${missing} pozycji wymaga sprawdzenia. Uzupełnij profile, mocowania, zestaw montażowy i taśmę w obmiarach.` }] : [];
}
const valid = (value: number | undefined, min: number, max: number): value is number => Number.isFinite(value) && value! >= min && value! <= max;
const whole = (value: number | undefined, max: number): value is number => valid(value, 0, max) && Number.isSafeInteger(value);
export function laminateSupplyReference(id: string, m: MeasurementMap = {}): string | null {
  if (id === 'underlay') return m.laminateUnderlayChoice === 1 ? 'mat-underlay-volden-xps-10m2' : m.laminateUnderlayChoice === 2 ? 'mat-underlay-arbiton-xps-aquastop-6m2' : null;
  if (id === 'vapor-barrier') return 'mat-vapor-foil-diall-pe-20m2';
  if (id === 'threshold') return 'mat-vinyl-threshold-cezar-alu-40mm-1m';
  if (id === 'spacers') return 'mat-laminate-kit-wolfcraft-6931000';
  if (id === 'laminate-joint-tape') return 'mat-underlay-joint-tape-arbiton-izo-25m';
  return null;
}

// source: https://www.wolfcraft.com/products/wolfcraft/pl/EUR/p/P_6931
// source: https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m
// source: https://arbiton.com/content/uploads/ARBITON-underlayments-2025.pdf
// source: https://arbiton.com/pl/podklad-pod-panele/akcesoria/tasma
export function laminateSupplyQuantity(id: string, m: MeasurementMap): number | null {
  if (!valid(m.floorArea, 1, 300)) return null;
  if (id === 'underlay' || id === 'vapor-barrier') {
    const choice = m.laminateUnderlayChoice ?? 0;
    if (!whole(choice, 2)) return null;
    if (id === 'vapor-barrier' && choice === 2) return 0;
    return Number((m.floorArea * 1.1).toFixed(8));
  }
  if (id === 'spacers') return whole(m.laminateKitCount, 20) ? m.laminateKitCount : null;
  if (id === 'laminate-joint-tape') return valid(m.laminateJointTapeM, 0, 1000) ? m.laminateJointTapeM : null;
  if (id === 'threshold' || id === 'threshold-fixings') {
    if (!whole(m.laminateThresholdCount, 50)) return null;
    if (m.laminateThresholdCount === 0) return 0;
    if (m.laminateThresholdFit !== 1) return null;
    if (id === 'threshold') return m.laminateThresholdCount;
    return m.laminateThresholdFixings === 1 ? 0 : null;
  }
  return null;
}

export const laminateSupplyInputs: MeasurementInputDefinition[] = [
  { id: 'laminateUnderlayChoice', label: 'Podkład i ochrona przed wilgocią', unit: '', inputType: 'select', placeholder: 'Dobierz do podłogi i podłoża', min: 0, max: 2, defaultValue: 0, required: false,
    options: [{ value: 0, label: 'Wariant z wybranego poziomu + osobna folia PE' }, { value: 1, label: 'Volden XPS Smart 3 mm, 10 m² + osobna folia PE' }, { value: 2, label: 'Arbiton Secura Thermo Aquastop Smart 1,6 mm, 6 m² — 3 w 1' }],
    hint: 'Dobierz zgodnie z instrukcją paneli i podłoża. Arbiton 3 w 1 ma zintegrowaną barierę i taśmę; przy tym jawnym wyborze nie doliczamy drugiej folii. Dodatkowe uszczelnienia po docinaniu policz niżej. Zapas podkładu 10% jest założeniem zakupowym.' },
  { id: 'laminateThresholdCount', label: 'Liczba profili progowych do kupienia', unit: 'szt.', inputType: 'count', placeholder: '0, jeśli nie są potrzebne lub już je masz', min: 0, max: 50, required: true,
    hint: 'Liczymy całe odcinki Cezar 40 mm × 1 m. Nie wyliczamy liczby przejść z powierzchni podłogi. Dla dłuższych przejść dobierz inny profil; nie zakładamy łączenia odcinków.' },
  { id: 'laminateThresholdFit', label: 'Dobór profilu Cezar 40 mm × 1 m', unit: '', inputType: 'select', placeholder: 'Sprawdź przejścia', min: 0, max: 1, defaultValue: 0, required: false,
    options: [{ value: 0, label: 'Dobór wymaga sprawdzenia' }, { value: 1, label: 'Potwierdzam długość, poziomy podłóg, dylatację i mocowanie' }],
    hint: 'Dotyczy tylko dodatniej liczby profili. Srebrny mat, szerokość 40 mm, długość 1 m, montaż na kołek i wkręt. Sprawdź przewody i ogrzewanie w podłożu. Bez potwierdzenia pełna wycena pozostanie nieznana.' },
  { id: 'laminateThresholdFixings', label: 'Mocowania do profili progowych', unit: '', inputType: 'select', placeholder: 'Sprawdź wyposażenie i podłoże', min: 0, max: 1, defaultValue: 0, required: false,
    options: [{ value: 0, label: 'Trzeba jeszcze dobrać lub sprawdzić mocowania' }, { value: 1, label: 'Mam odpowiednie mocowania do wszystkich wybranych profili' }],
    hint: 'Nie zakładamy automatycznie, że kołki i wkręty są w komplecie ani że pasują do każdego podłoża. Jeśli potrzebujesz zakupu, dodaj dobrane mocowania; do tego czasu widać brak pełnej wyceny.' },
  { id: 'laminateKitCount', label: 'Zestawy montażowe do kupienia', unit: 'zestaw', inputType: 'count', placeholder: '0, jeśli masz komplet potrzebnych narzędzi', min: 0, max: 20, required: true,
    hint: 'Wolfcraft 6931000: dobijak, łyżka i 20 klinów. Podaj liczbę zestawów po ocenie potrzeb. Są wielokrotnego użytku: przy wspólnych zakupach wpisz zestaw przy jednej pracy i 0 przy pozostałych, jeśli użyjesz go kolejno. Nie doliczamy drugi raz tych trzech elementów jako narzędzi.' },
  { id: 'laminateJointTapeM', label: 'Dodatkowa taśma do łączenia podkładów i folii', unit: 'm', inputType: 'dimension', placeholder: '0, jeśli masz odpowiednią taśmę lub wystarcza fabryczna', min: 0, max: 1000, required: true,
    hint: 'Arbiton Izo Floor Tape 50 mm × 25 m. Zmierz spoiny wymagające dodatkowej taśmy, uwzględnij docinki. Nie wyliczamy metrów spoin z m² podłogi. We wspólnym koszyku sumujemy długości przed zakupem pełnych rolek.' },
];

export function laminateSupplyMaterial(material: MaterialItem, m: MeasurementMap): MaterialItem {
  const ref = MATERIAL_PRICES.find(row => row.id === laminateSupplyReference(material.id, m));
  if (!ref) return material;
  return { ...material, name: ref.productLabel, brand: ref.brand, ean: PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id))?.ean, unit: ref.packageUnit, category: ref.materialType, sourceUrl: ref.sourceUrl,
    pricePerUnit: ref.pricePerPackage, priceBasis: 'package', packaging: { size: ref.packageSize, label: `${ref.packageSize} ${ref.packageUnit}`, purchaseUnit: material.id === 'spacers' ? 'zestaw' : material.id === 'laminate-joint-tape' ? 'rolka' : 'opakowanie' },
    formulaKey: 'laminateSupply:' + material.id, notes: ref.notes };
}
export const laminateExtraMaterials: MaterialItem[] = [
  { id: 'laminate-joint-tape', name: 'Taśma do łączenia podkładów', unit: 'm', formulaKey: 'laminateSupply:laminate-joint-tape', pricePerUnit: 0, category: 'underlay-joint-tape' },
  { id: 'threshold-fixings', name: 'Mocowania do profili progowych — dobierz do podłoża', unit: 'szt.', formulaKey: 'laminateSupply:threshold-fixings', pricePerUnit: 0, category: 'threshold-fixings-review' },
];
export function reviewLaminateCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (!calc || calc.jobId !== LAMINATE_JOB || calc.quantityModel === LAMINATE_SUPPLIES_MODEL) return calc;
  const materials = calc.materials.map(line => isLaminateSupply(calc.jobId, line.material.id) ? { ...line, quantityKnown: false } : line);
  for (const material of laminateExtraMaterials) if (!materials.some(line => line.material.id === material.id)) materials.push({ material, quantity: 0, cost: 0, rawQuantity: 0, quantityKnown: false });
  return { ...calc, materials, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}
export const reviewLaminateProject = (project: Project): Project => project.jobId === LAMINATE_JOB && project.calculationResult ? { ...project, calculationResult: reviewLaminateCalculation(project.calculationResult) } : project;
export function reviewLaminateShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || calc.jobId !== LAMINATE_JOB) return [...items];
  return items.flatMap(item => {
    const includedTool = item.itemType === 'tool' && ['spacers', 'tapping-block', 'pull-bar'].includes(item.materialId)
      && ['Kliny dystansowe', 'Klocek dobijak z tworzywa', 'Ściągacz (hak montażowy)'].includes(item.name);
    if (includedTool && calc.quantityModel === LAMINATE_SUPPLIES_MODEL && whole(calc.measurements.laminateKitCount, 20)) return [];
    if (item.itemType !== 'material' || !isLaminateSupply(calc.jobId, item.materialId)) return item;
    const line = calc.materials.find(row => row.material.id === item.materialId), required = laminateSupplyQuantity(item.materialId, calc.measurements);
    if (calc.quantityModel !== LAMINATE_SUPPLIES_MODEL || !line || line.quantityKnown === false || required === null) return { ...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false };
    if (required === 0) return [];
    const matches = item.name === line.material.name && item.unit === line.material.unit && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) + 1e-8 >= required;
    return { ...item, name: line.material.name, unit: line.material.unit, quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: required, quantityKnown: true, needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased, notes: line.material.notes };
  });
}
