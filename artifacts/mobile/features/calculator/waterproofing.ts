import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementInputDefinition } from '@/types/engine';
import type { MeasurementMap } from '@/types/calculator';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const WATERPROOFING_JOB = 'bathroom-waterproofing';
export const WATERPROOFING_MODEL = 'waterproofing-mapei-v1';
export const WATERPROOFING_IDS = ['membrane', 'sealing-tape', 'primer-waterproof', 'hydro-corner-inside', 'hydro-corner-outside', 'hydro-collar-wall', 'hydro-collar-floor'] as const;
export const isWaterproofingMaterial = (job: string, id: string) => job === WATERPROOFING_JOB && WATERPROOFING_IDS.some(role => role === id);
const CODES: Readonly<Record<string, string>> = {
  'mat-mapegum-wps-5kg': '8022452002113', 'mat-mapegum-wps-10kg': '8022452002120', 'mat-mapegum-wps-20kg': '8022452242502',
  'mat-mapeband-w-10m': '8022452113932', 'mat-primer-g-pro-1l': '8022452241123', 'mat-primer-g-pro-5l': '8022452241130',
  'mat-sealing-corner-internal-mapei': '8022452113802', 'mat-sealing-corner-external-mapei': '8022452113789',
  'mat-sealing-cuff-wall-mapei-12x12-2': '8022452113925', 'mat-mapeband-w-floor-300': '8022452113895',
};
export function waterproofingReference(id: string, m: MeasurementMap = {}): string | null {
  if (![1, 2, 3].includes(m.hydroSystem)) return null;
  if (id === 'membrane') return `mat-mapegum-wps-${m.hydroSystem === 1 ? 5 : m.hydroSystem === 2 ? 10 : 20}kg`;
  if (id === 'sealing-tape') return 'mat-mapeband-w-10m';
  if (id === 'primer-waterproof') return m.hydroSubstrate === 1 ? (m.hydroPrimerPack ?? 1) === 1 ? 'mat-primer-g-pro-1l' : m.hydroPrimerPack === 5 ? 'mat-primer-g-pro-5l' : null : null;
  return ({ 'hydro-corner-inside': 'mat-sealing-corner-internal-mapei', 'hydro-corner-outside': 'mat-sealing-corner-external-mapei', 'hydro-collar-wall': 'mat-sealing-cuff-wall-mapei-12x12-2', 'hydro-collar-floor': 'mat-mapeband-w-floor-300' } as Record<string, string>)[id] ?? null;
}
const count = (value: number | undefined, max = 200): number | null => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max ? value : null;
const rounded = (value: number) => Number(value.toFixed(6));
// source: https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_02014_mapegum-wps_pl-pl_6ff17f2c535848d99d22681a305a079c.pdf?sfvrsn=eb49cbd6_0
// source: https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_07657_mapeband-w_pl-pl_bd946808daf84ab9b92e29950ceddef5.pdf?sfvrsn=51f52cb3_0
// source: https://cdnmedia.mapei.com/docs/librariesprovider24/dokumenty---landing-pages/2949-primergpro-pl.pdf?sfvrsn=a9bbe175_7
export function waterproofingQuantity(id: string, m: MeasurementMap): number | null {
  const counts: Record<string, string> = { 'hydro-corner-inside': 'hydroInsideCorners', 'hydro-corner-outside': 'hydroOutsideCorners', 'hydro-collar-wall': 'hydroWallCollars', 'hydro-collar-floor': 'hydroFloorCollars' };
  if (counts[id]) {
    const pieces = count(m[counts[id]]);
    if (pieces === 0) return 0;
    if (pieces === null || !waterproofingReference(id, m)) return null;
    if (id.startsWith('hydro-collar-') && m.hydroCollarFit !== 1) return null;
    return pieces;
  }
  if (!waterproofingReference(id, m)) return null;
  const wall = m.wallArea, floor = m.floorArea;
  if (!Number.isFinite(wall) || wall < 0 || wall > 200 || !Number.isFinite(floor) || floor < 0 || floor > 50 || wall + floor <= 0) return null;
  if (id === 'membrane') {
    const usage = m.hydroMembraneConsumption ?? 1.2, reserve = m.hydroReservePercent ?? 10;
    if (!Number.isFinite(usage) || usage < 1.2 || usage > 3 || !Number.isFinite(reserve) || reserve < 0 || reserve > 30) return null;
    return rounded((wall + floor) * usage * (1 + reserve / 100));
  }
  if (id === 'sealing-tape') {
    const length = m.perimeter, joins = count(m.hydroTapeOverlaps, 1000);
    return Number.isFinite(length) && length >= 0 && length <= 500 && joins !== null && (length > 0 || joins === 0) ? rounded(length + joins * 0.05) : null;
  }
  if (id === 'primer-waterproof') {
    const usage = m.hydroPrimerConsumption ?? 0.2;
    return Number.isFinite(usage) && usage >= 0.1 && usage <= 0.2 ? rounded((wall + floor) * usage) : null;
  }
  return null;
}

export const waterproofingInputs: MeasurementInputDefinition[] = [
  { id: 'hydroSystem', label: 'System hydroizolacji i opakowanie folii', unit: '', inputType: 'select', placeholder: 'Wybierz', defaultValue: 0, min: 0, max: 3, required: false,
    options: [{ value: 0, label: 'Jeszcze nie wiem — dobiorę system' }, { value: 1, label: 'Mapei Mapegum WPS 5 kg + Mapeband W' }, { value: 2, label: 'Mapei Mapegum WPS 10 kg + Mapeband W' }, { value: 3, label: 'Mapei Mapegum WPS 20 kg + Mapeband W' }],
    hint: 'Spójny zestaw do wnętrz pod płytki. Wybierz wielkość wiadra i porównaj koszt. Nie stosuj Mapegum WPS do stałego zanurzenia, na zewnątrz ani na podłoża z podciągającą wilgocią.' },
  { id: 'hydroSubstrate', label: 'Podłoże pod hydroizolację', unit: '', inputType: 'select', placeholder: 'Wybierz', defaultValue: 0, min: 0, max: 2, required: false,
    options: [{ value: 0, label: 'Rodzaj i przygotowanie podłoża do ustalenia' }, { value: 1, label: 'Chłonne mineralne lub gipsowe — Primer G Pro' }, { value: 2, label: 'Inne, np. stare płytki — grunt do osobnego doboru' }],
    hint: 'Powierzchnia musi być nośna, sucha i przygotowana według karty. Istniejące płytki i inne niechłonne podłoża wymagają odrębnego doboru gruntu. Wymagania wilgotności i sezonowania sprawdź przed aplikacją.' },
  { id: 'hydroPrimerPack', label: 'Opakowanie Primer G Pro', unit: '', inputType: 'select', placeholder: 'Wybierz', defaultValue: 1, min: 1, max: 5, required: false, options: [{ value: 1, label: 'Butelka 1 l' }, { value: 5, label: 'Kanister 5 l' }], hint: 'Ten sam koncentrat, różne opakowania i osobne oferty. Zmień wielkość, aby porównać koszt dla swoich obmiarów.' },
  { id: 'hydroAdvanced', label: 'Zużycie i zapas materiałów', unit: '', inputType: 'select', placeholder: 'Wybierz', defaultValue: 0, min: 0, max: 1, required: false, options: [{ value: 0, label: 'Założenia standardowe według kart produktów' }, { value: 1, label: 'Dostosuję zużycie i zapas' }], hint: 'Standard: folia 1,2 kg/m² łącznie dla dwóch warstw + 10% zapasu; koncentrat gruntu 0,20 l/m². Rozwiń, jeśli próba na Twoim podłożu wymaga zmiany.' },
  { id: 'hydroMembraneConsumption', label: 'Zużycie folii łącznie dla obu warstw', unit: 'kg/m²', inputType: 'coverage', placeholder: 'Wartość z karty', defaultValue: 1.2, min: 1.2, max: 3, step: 0.1, required: false, hint: 'Mapegum WPS: około 1,2 kg/m² łącznie dla dwóch warstw na równym podłożu. Nie mnożymy tej wartości ponownie przez dwa. Nierówne podłoże może wymagać większego zużycia.' },
  { id: 'hydroReservePercent', label: 'Zapas zakupowy folii', unit: '%', inputType: 'percent', placeholder: '10', defaultValue: 10, min: 0, max: 30, required: false, hint: 'Jawny zapas ponad zużycie z karty. Liczbę pełnych wiader zaokrąglamy po połączeniu prac w koszyku remontu.' },
  { id: 'hydroPrimerConsumption', label: 'Zużycie koncentratu Primer G Pro', unit: 'l/m²', inputType: 'coverage', placeholder: 'Wartość z karty', defaultValue: 0.2, min: 0.1, max: 0.2, step: 0.01, required: false, hint: 'Zakładamy górną wartość 0,20 l produktu/m² (producent 0,10–0,20). Dopasuj do chłonności i karty. Wody do rozcieńczenia nie doliczamy jako kupowanego gruntu.' },
  { id: 'hydroTapeOverlaps', label: 'Liczba zakładów taśmy', unit: 'szt', inputType: 'count', min: 0, max: 1000, placeholder: 'np. 8', hint: 'Policz wszystkie łączenia taśmy oraz z narożnikami i innymi elementami. Do każdego doliczamy co najmniej 5 cm taśmy. Wpisz 0, jeśli nie ma łączeń.' },
  { id: 'hydroInsideCorners', label: 'Narożniki wewnętrzne do uszczelnienia', unit: 'szt', inputType: 'count', min: 0, max: 200, placeholder: 'np. 4', hint: 'Gotowe narożniki Mapeband W 90°. Policz miejsca, gdzie spotykają się trzy płaszczyzny; wpisz 0, jeśli nie występują w tej pracy.' },
  { id: 'hydroOutsideCorners', label: 'Narożniki zewnętrzne do uszczelnienia', unit: 'szt', inputType: 'count', min: 0, max: 200, placeholder: 'np. 0', hint: 'Gotowe narożniki Mapeband W 270°, np. przy obudowie wanny. Wpisz 0, jeśli nie są potrzebne.' },
  { id: 'hydroWallCollars', label: 'Przejścia rur w ścianach', unit: 'szt', inputType: 'count', min: 0, max: 200, placeholder: 'np. 2', hint: 'Mankiety Mapeband W 120 × 120 mm są sprzedawane po 2 sztuki. Policz osobne przejścia wymagające uszczelnienia; wpisz 0, jeśli ich nie ma.' },
  { id: 'hydroFloorCollars', label: 'Przejścia lub odpływy w podłodze', unit: 'szt', inputType: 'count', min: 0, max: 200, placeholder: 'np. 1', hint: 'Mankiet Mapeband W 300 × 300 mm, 1 sztuka. Nie zastępuje dedykowanego kołnierza odpływu liniowego lub innego zestawu wymaganego przez jego producenta.' },
  { id: 'hydroCollarFit', label: 'Dopasowanie mankietów do rur i odpływów', unit: '', inputType: 'select', placeholder: 'Wybierz', defaultValue: 0, min: 0, max: 1, required: false,
    options: [{ value: 0, label: 'Wymiar i połączenie do sprawdzenia' }, { value: 1, label: 'Potwierdzone dopasowanie wybranych mankietów' }], hint: 'Przy dodatniej liczbie przejść wycenimy mankiety dopiero po potwierdzeniu zgodności wymiarów i sposobu połączenia. Wymiar 120/300 mm to zewnętrzny rozmiar mankietu, nie średnica rury.' },
];

/** Show detailed assumptions when useful, while keeping all saved values. */
export function waterproofingInputVisible(jobId: string, inputId: string, m: Readonly<Record<string, number | string>>): boolean {
  if (jobId !== WATERPROOFING_JOB || !inputId.startsWith('hydro') || inputId === 'hydroSystem') return true;
  if (![1, 2, 3].includes(Number(m.hydroSystem))) return false;
  if (['hydroMembraneConsumption', 'hydroReservePercent', 'hydroPrimerConsumption'].includes(inputId)) return Number(m.hydroAdvanced) === 1 && (inputId !== 'hydroPrimerConsumption' || Number(m.hydroSubstrate) === 1);
  if (inputId === 'hydroPrimerPack') return Number(m.hydroSubstrate) === 1;
  if (inputId === 'hydroCollarFit') return Number(m.hydroWallCollars ?? 0) > 0 || Number(m.hydroFloorCollars ?? 0) > 0;
  return true;
}

const unknownNames: Record<string, string> = { membrane: 'Folia hydroizolacyjna — wybierz system', 'sealing-tape': 'Taśma systemowa — wybierz system i policz łączenia', 'primer-waterproof': 'Grunt pod hydroizolację — dobierz do podłoża', 'hydro-corner-inside': 'Narożniki wewnętrzne — ilość do ustalenia', 'hydro-corner-outside': 'Narożniki zewnętrzne — ilość do ustalenia', 'hydro-collar-wall': 'Mankiety ścienne — dopasowanie i ilość do ustalenia', 'hydro-collar-floor': 'Mankiety podłogowe — dopasowanie i ilość do ustalenia' };
export function waterproofingMaterials(m: MeasurementMap = {}): MaterialItem[] {
  return WATERPROOFING_IDS.map(id => {
    const refId = waterproofingReference(id, m), ref = MATERIAL_PRICES.find(row => row.id === refId);
    return ref ? { id, name: ref.productLabel, ean: CODES[ref.id], brand: ref.brand, unit: ref.packageUnit, category: ref.materialType, formulaKey: 'waterproofing:' + id, wasteFactor: 1, pricePerUnit: ref.pricePerPackage, priceBasis: 'package' as const, packaging: { size: ref.packageSize, label: `${ref.packageSize} ${ref.packageUnit}`, purchaseUnit: id === 'membrane' ? 'wiadro' : id === 'sealing-tape' ? 'rolka' : 'opakowanie' }, sourceUrl: ref.sourceUrl, notes: ref.notes }
      : { id, name: unknownNames[id], unit: id === 'membrane' ? 'kg' : id === 'sealing-tape' ? 'm' : id === 'primer-waterproof' ? 'l' : 'szt', formulaKey: 'waterproofing:' + id, wasteFactor: 1, pricePerUnit: 0 };
  });
}
export function reviewWaterproofingCalculation(calc?: CalculationResult): CalculationResult | undefined {
  if (!calc || calc.jobId !== WATERPROOFING_JOB || calc.quantityModel === WATERPROOFING_MODEL) return calc;
  const materials = calc.materials.map(line => isWaterproofingMaterial(calc.jobId, line.material.id) ? { ...line, quantityKnown: false } : line);
  for (const material of waterproofingMaterials(calc.measurements)) if (!materials.some(line => line.material.id === material.id)) materials.push({ material, quantity: 0, rawQuantity: 0, cost: 0, quantityKnown: false });
  return { ...calc, materials, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}
export const reviewWaterproofingProject = (p: Project): Project => p.jobId === WATERPROOFING_JOB && p.calculationResult ? { ...p, calculationResult: reviewWaterproofingCalculation(p.calculationResult) } : p;
export function reviewWaterproofingShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || calc.jobId !== WATERPROOFING_JOB) return [...items];
  return items.flatMap(item => {
    if (item.itemType !== 'material' || !isWaterproofingMaterial(calc.jobId, item.materialId)) return item;
    const line = calc.materials.find(row => row.material.id === item.materialId), required = waterproofingQuantity(item.materialId, calc.measurements);
    if (calc.quantityModel !== WATERPROOFING_MODEL || !line || line.quantityKnown === false || required === null) return { ...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false };
    if (required === 0) return [];
    const matches = !item.needsQuantityConfirmation && item.name === line.material.name && item.unit === line.material.unit && Number.isFinite(item.customQuantity ?? item.quantity) && (item.customQuantity ?? item.quantity) + 1e-8 >= required;
    return { ...item, name: line.material.name, unit: line.material.unit, quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: required, quantityKnown: true, needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased, notes: line.material.notes };
  });
}
