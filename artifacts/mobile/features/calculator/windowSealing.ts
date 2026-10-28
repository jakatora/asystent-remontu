import type {CalculationResult, MaterialItem, Project, ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import {MATERIAL_PRICES} from '@/data/prices/materials';

export const WINDOW_JOB = 'window-sealing';
export const WINDOW_MODEL = 'window-repair-v1';
export const WINDOW_IDS = ['window-gasket', 'mounting-foam', 'silicone-window', 'window-tape', 'window-masking-tape', 'window-preparation'] as const;
export const isWindowMaterial = (job: string, id: string) => job === WINDOW_JOB && WINDOW_IDS.includes(id as typeof WINDOW_IDS[number]);
const refs: Record<string, [string, string]> = {
  'mounting-foam': ['mat-foam-soudal-lowexp-750ml', '5411183048522'],
  'silicone-window': ['mat-acrylic-soudal-white-280ml', '5411183157538'],
  'window-tape': ['mat-window-tape-soudal-sws-inside-90mm', '5411183151178'],
  'window-masking-tape': ['mat-masking-tape-bluedolphin-30mm', '5907758515952'],
};
const finite = (n: unknown, min: number, max: number): n is number => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
const whole = (n: unknown, min = 0, max = 200): n is number => finite(n, min, max) && Number.isSafeInteger(n);
const method = (m: MeasurementMap) => whole(m.windowRepair, 1, 3) ? m.windowRepair : null;
const reserve = (m: MeasurementMap) => finite(m.windowReservePercent ?? 10, 0, 30) ? 1 + (m.windowReservePercent ?? 10) / 100 : null;

export function windowReference(id: string, m: MeasurementMap = {}): string | null {
  const selected = method(m);
  if (selected === 2 && ['silicone-window', 'window-masking-tape'].includes(id)
    || selected === 3 && ['window-tape', 'mounting-foam'].includes(id)) return refs[id][0];
  return null;
}

// source: https://www.soudal.pl/sites/default/files/soudal_api/document/900003230/TDS_AKRYL_UNIWERSALNY_2025.pdf
// source: https://www.soudal.pl/sites/default/files/soudal_api/document/SWS_EXTRA_INSIDE_2025.pdf
// source: https://media.soudal.pl/katalogi/Katalog_Prof_Soudal.pdf
/** Physical demand, before rounding and before combining the same SKU across rooms. */
export function windowQuantity(id: string, m: MeasurementMap): number | null {
  if (!isWindowMaterial(WINDOW_JOB, id) || method(m) === null) return null;
  const selected = method(m)!;
  if (id === 'window-preparation') return m.windowPreparation === 1 ? 0 : null;
  if (selected === 1) {
    if (id !== 'window-gasket') return 0;
    // A groove profile must be matched to the window. Never replace it with an
    // arbitrary self-adhesive gasket or let an unpriced product disappear.
    return m.windowFit === 1 && m.windowGasketOwned === 1 && finite(m.windowGasketMetres, 0.01, 200) ? 0 : null;
  }
  if (id === 'window-gasket' || selected === 2 && ['window-tape', 'mounting-foam'].includes(id)
    || selected === 3 && ['silicone-window', 'window-masking-tape'].includes(id)) return 0;
  if (m.windowFit !== 1) return null;
  if (id === 'window-masking-tape') return whole(m.windowMaskingRolls ?? 1, 0, 20) ? (m.windowMaskingRolls ?? 1) * 50 : null;
  if (id === 'mounting-foam') return whole(m.windowFoamCans, 0, 100) ? m.windowFoamCans * 750 : null;
  const allowance = reserve(m);
  if (!finite(m.perimeter, 0.01, 200) || allowance === null) return null;
  if (id === 'silicone-window') {
    // The current TDS recommends 1:1 and at least 5 × 5 mm; >20 mm needs consultation.
    // L[m] × width[mm] × depth[mm] = ml. This bounded variant is a square joint.
    return finite(m.windowJointSize, 5, 20) ? Number((m.perimeter * m.windowJointSize ** 2 * allowance).toFixed(6)) : null;
  }
  if (id === 'window-tape') {
    if (!whole(m.windowTapeJoints) || !finite(m.windowTapeExtraMetres, 0, 200)) return null;
    // At least 3 cm per join. Corner/slack allowance is measured separately;
    // confirming 90 mm fit is essential and is not inferred from the perimeter.
    return Number(((m.perimeter + m.windowTapeJoints * 0.03 + m.windowTapeExtraMetres) * allowance).toFixed(6));
  }
  return null;
}

const names: Record<string, string> = {
  'window-gasket': 'Uszczelka skrzydła — dopasuj profil i potrzebną długość',
  'mounting-foam': 'Pianka — ustal stan izolacji i potrzebne puszki',
  'silicone-window': 'Akryl do drobnej spoiny wewnętrznej — sprawdź zastosowanie',
  'window-tape': 'Taśma wewnętrzna — sprawdź szerokość i układ złącza',
  'window-masking-tape': 'Taśma maskująca do akrylu',
  'window-preparation': 'Przygotowanie i materiały pomocnicze — potwierdź komplet',
};
const notes: Record<string, string> = {
  'silicone-window': 'Biały akryl 280 ml, nie silikon. Wariant spoiny kwadratowej 5–20 mm, wewnątrz przy drewnie/metalu i odpowiednim podłożu. Karta 2025: ruch do 7,5%; nie do stałego kontaktu z wodą. Długość × szerokość × głębokość + wskazany zapas.',
  'window-tape': 'SWS Basic Plus / Extra Inside 90 mm × 30 m, warstwa paroszczelna od wewnątrz. Nie jest taśmą rozprężną ani ochroną zewnętrzną. Długość + minimum 3 cm na każde połączenie + zmierzony naddatek + wskazany zapas.',
  'mounting-foam': 'Soudafoam Low Expansion −10, pistoletowa, 750 ml. Liczba puszek ustalona dla naprawy; nie zakładamy wydajności 8 m/puszkę. 0 oznacza sprawną izolację lub posiadaną całą potrzebną ilość. Wymaga odpowiedniego pistoletu i przygotowania według etykiety.',
  'window-masking-tape': 'Blue Dolphin 30 mm × 50 m. Podana liczba pełnych rolek; 0, gdy masz całą potrzebną taśmę. Zdejmij po obróbce fugi zgodnie z kartą akrylu i instrukcją taśmy.',
  'window-preparation': 'Sprawdź podłoże, środki do czyszczenia oraz potrzebne podparcie spoiny, gruntowanie, ochronę i materiały wykończeniowe. Potwierdź tylko przygotowane podłoże i posiadany komplet. Brak doboru pozostaje brakiem wyceny.',
  'window-gasket': 'Uszczelkę dobierz do profilu okna i zaleceń jego producenta. Nie przyklejaj dowolnego profilu na fabryczną uszczelkę. Zakup wymaga indywidualnego doboru; potwierdzenie posiadania dotyczy całej zmierzonej długości.',
};
export function windowMaterials(m: MeasurementMap = {}): MaterialItem[] {
  return WINDOW_IDS.map(id => {
    const ref = MATERIAL_PRICES.find(r => r.id === windowReference(id, m));
    return ref ? {id, name: ref.productLabel, brand: ref.brand, ean: refs[id][1], unit: ref.packageUnit,
      category: ref.materialType, formulaKey: 'window-v1:' + id, wasteFactor: 1, pricePerUnit: ref.pricePerPackage, priceBasis: 'package' as const,
      packaging: {size: ref.packageSize, label: `${ref.packageSize} ${ref.packageUnit}`, purchaseUnit: id === 'mounting-foam' ? 'puszka' : id === 'silicone-window' ? 'kartusz' : 'rolka'},
      sourceUrl: ref.sourceUrl, notes: notes[id]}
      : {id, name: names[id], unit: 'pozycja', formulaKey: 'window-v1:' + id, wasteFactor: 1, pricePerUnit: 0, notes: notes[id]};
  });
}

export const windowInputs: MeasurementInputDefinition[] = [
  {id: 'windowRepair', label: 'Gdzie jest nieszczelność?', unit: '', inputType: 'select', placeholder: 'Wybierz zakres naprawy', defaultValue: 0, min: 0, max: 3, required: false,
    options: [{value: 0, label: 'Jeszcze nie wiem — sprawdzę przyczynę'}, {value: 1, label: 'Między skrzydłem a ramą — uszczelka'}, {value: 2, label: 'Drobna spoina wewnątrz — biały akryl'}, {value: 3, label: 'Warstwa wewnętrzna złącza — taśma SWS'}],
    hint: 'To różne naprawy. Wybierz jeden zakres dla tej pracy. Luźna rama, nieszczelność od zewnątrz lub problem z okuciami wymaga osobnej oceny. Nie dobieramy produktu tylko z obwodu okna.'},
  // The existing saved measurement ID is deliberately retained.
  {id: 'perimeter', label: 'Łączna długość naprawianego połączenia ramy ze ścianą', unit: 'm', inputType: 'length', min: 0.01, max: 200, required: false, placeholder: 'np. 12',
    hint: 'Zmierz rzeczywisty odcinek naprawy. Pełny obwód wpisz tylko wtedy, gdy naprawiasz całe połączenie. Nie jest to długość uszczelki skrzydła.'},
  {id: 'windowGasketMetres', label: 'Długość dopasowanej uszczelki skrzydła', unit: 'm', inputType: 'length', min: 0.01, max: 200, required: false, placeholder: 'Zmierz przebieg uszczelki', hint: notes['window-gasket']},
  {id: 'windowGasketOwned', label: 'Czy masz dopasowaną uszczelkę?', unit: '', inputType: 'select', placeholder: 'Sprawdź profil i ilość', defaultValue: 0, min: 0, max: 1, required: false,
    options: [{value: 0, label: 'Potrzebuję dobrać lub kupić uszczelkę'}, {value: 1, label: 'Mam właściwy profil w całej potrzebnej długości'}], hint: 'Cena uniwersalnej uszczelki nie potwierdza dopasowania do rowka. Zakup indywidualnego profilu pozostanie do wyceny.'},
  // source: https://www.soudal.pl/sites/default/files/soudal_api/document/900003230/TDS_AKRYL_UNIWERSALNY_2025.pdf
  {id: 'windowJointSize', label: 'Szerokość i głębokość kwadratowej spoiny', unit: 'mm', inputType: 'length', min: 5, max: 20, required: false, placeholder: 'np. 5 = spoina 5 × 5 mm',
    hint: 'Ten wariant liczy przekrój 1:1, co najmniej 5 × 5 mm. Przy innej geometrii albo szerokości powyżej 20 mm skonsultuj dobór. Akryl nie zastępuje izolacji i ochrony całego złącza.'},
  {id: 'windowMaskingRolls', label: 'Rolki taśmy maskującej 30 mm × 50 m', unit: 'rolki', inputType: 'count', placeholder: '1', defaultValue: 1, min: 0, max: 20, required: false, hint: 'Założenie zakupowe: jedna rolka. Dostosuj do pracy; wpisz 0, jeśli masz całą potrzebną taśmę.'},
  // source: https://www.soudal.pl/sites/default/files/soudal_api/document/SWS_EXTRA_INSIDE_2025.pdf
  {id: 'windowTapeJoints', label: 'Połączenia końców taśmy', unit: 'szt.', inputType: 'count', min: 0, max: 200, required: false, placeholder: 'np. 2 dla dwóch zamkniętych obwodów', hint: 'Policz każde łączenie, także przy dołączaniu kolejnego odcinka. Wpisz 0 dla odcinka bez łączenia końców. Na każde połączenie dodajemy minimum 3 cm zakładu według karty. Narożniki i luz policz osobno poniżej.'},
  {id: 'windowTapeExtraMetres', label: 'Dodatkowa długość na narożniki i luz montażowy', unit: 'm', inputType: 'length', min: 0, max: 200, required: false, placeholder: 'Wpisz zmierzoną wartość, także 0',
    hint: 'Ustal na swoim złączu, bez naciągania taśmy. Nie zgadujemy długości z liczby okien. Minimalne zakłady końców dodajemy osobno, potem wskazany zapas.'},
  {id: 'windowFoamCans', label: 'Puszki pianki 750 ml potrzebne do naprawy izolacji', unit: 'szt.', inputType: 'count', min: 0, max: 100, required: false, placeholder: 'Ustal ilość; wpisz 0, gdy zakup niepotrzebny', hint: notes['mounting-foam']},
  {id: 'windowFit', label: 'Czy wybrany sposób naprawy pasuje do okna?', unit: '', inputType: 'select', placeholder: 'Sprawdź zastosowanie', defaultValue: 0, min: 0, max: 1, required: false,
    options: [{value: 0, label: 'Jeszcze sprawdzę dopasowanie'}, {value: 1, label: 'Potwierdzone według instrukcji producentów'}], hint: 'Sprawdź zastosowanie, podłoże i pełny zakres naprawy. Bez potwierdzenia nie pokazujemy przypadkowego zestawu jako gotowego do kupienia.'},
  {id: 'windowPreparation', label: 'Podłoże i potrzebne materiały pomocnicze', unit: '', inputType: 'select', placeholder: 'Sprawdź przygotowanie', defaultValue: 0, min: 0, max: 1, required: false,
    options: [{value: 0, label: 'Potrzebuję jeszcze doboru lub zakupu'}, {value: 1, label: 'Podłoże przygotowane, mam wszystkie potrzebne materiały'}], hint: notes['window-preparation']},
  {id: 'windowReservePercent', label: 'Zapas akrylu lub długości taśmy', unit: '%', inputType: 'percent', placeholder: '10', defaultValue: 10, min: 0, max: 30, required: false,
    hint: 'Założenie zakupowe, domyślnie 10%. Zapas nie zastępuje policzonych zakładów i luzu. Opakowania tego samego produktu sumujemy w całym remoncie.'},
];

export function windowInputVisible(job: string, id: string, m: Readonly<Record<string, number | string | undefined>>): boolean {
  if (job !== WINDOW_JOB || id === 'windowRepair') return true;
  const selected = Number(m.windowRepair);
  if (![1, 2, 3].includes(selected)) return false;
  if (['windowGasketMetres', 'windowGasketOwned'].includes(id)) return selected === 1;
  if (['windowJointSize', 'windowMaskingRolls'].includes(id)) return selected === 2;
  if (['windowTapeJoints', 'windowTapeExtraMetres', 'windowFoamCans'].includes(id)) return selected === 3;
  if (['perimeter', 'windowReservePercent'].includes(id)) return selected !== 1;
  return true;
}
export function windowInputHint(job: string, id: string, m: Readonly<Record<string, number | string | undefined>>, fallback?: string): string | undefined {
  if (job !== WINDOW_JOB || id !== 'windowFit') return fallback;
  return Number(m.windowRepair) === 1 ? 'Sprawdź profil według producenta okna, sposób mocowania i długość. Po naprawie sprawdź prawidłowe działanie okna.'
    : Number(m.windowRepair) === 2 ? 'Karta Soudal 2025: wewnętrzne spoiny przy ramach drewnianych lub metalowych, ruch do 7,5%, przekrój 1:1 od 5 × 5 mm. Ten wariant nie potwierdza dopasowania do PVC, szkła, kamienia ani stałego kontaktu z wodą. Sprawdź podparcie i przygotowanie podłoża.'
      : 'Potwierdź, że 90 mm wystarczy do przyklejenia taśmy do ramy i nośnego, suchego, niepylącego ościeża oraz zostawienia luzu. Taśma od wewnątrz jest paroszczelna. Izolacja i ochrona zewnętrzna złącza muszą być sprawne lub osobno naprawione; luźna rama wymaga oceny fachowca.';
}

export function reviewWindowCalculation(calc?: CalculationResult): CalculationResult | undefined {
  if (!calc || calc.jobId !== WINDOW_JOB || calc.quantityModel === WINDOW_MODEL) return calc;
  const materials = calc.materials.map(line => ({...line, quantityKnown: false}));
  for (const material of windowMaterials()) if (!materials.some(l => l.material.id === material.id)) materials.push({material, quantity: 0, rawQuantity: 0, cost: 0, quantityKnown: false});
  return {...calc, materials, quantityIssues: materials.map(l => l.material.name)};
}
export const reviewWindowProject = (p: Project): Project => p.jobId === WINDOW_JOB && p.calculationResult ? {...p, calculationResult: reviewWindowCalculation(p.calculationResult)} : p;
export function reviewWindowShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || calc.jobId !== WINDOW_JOB) return [...items];
  return items.flatMap(item => {
    if (item.itemType !== 'material' || !isWindowMaterial(calc.jobId, item.materialId)) return item;
    const line = calc.materials.find(l => l.material.id === item.materialId), required = windowQuantity(item.materialId, calc.measurements);
    if (calc.quantityModel !== WINDOW_MODEL || !line || line.quantityKnown === false || required === null) return {...item, quantityKnown: false, needsQuantityConfirmation: true, owned: false, purchased: false};
    if (required === 0) return [];
    const matches = !item.needsQuantityConfirmation && item.name === line.material.name && item.unit === line.material.unit && finite(item.customQuantity ?? item.quantity, required - 1e-8, Number.MAX_SAFE_INTEGER);
    return {...item, name: line.material.name, unit: line.material.unit, quantity: line.quantity, estimatedPrice: line.cost, requiredQuantity: required, quantityKnown: true,
      needsQuantityConfirmation: !matches, owned: matches && item.owned, purchased: matches && item.purchased, notes: line.material.notes};
  });
}
