import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const FRAME_MODEL = 'frame-painting-v1';
export const isFrameJob = (id: string) => id === 'paint-frames';
const IDS = ['frame-paint', 'frame-primer', 'frame-sandpaper', 'frame-paper-240', 'frame-tape', 'frame-cleaner', 'frame-pvc-cleaner'];
export const isFrameMaterial = (jobId: string, id: string) => isFrameJob(jobId) && IDS.includes(id);
export function frameInputVisible(jobId: string, id: string, selected: string | number | undefined): boolean {
  if (!isFrameJob(jobId)) return true;
  const pvc=Number(selected??0)===4;
  if (id==='framePvcCleanerOwned') return pvc;
  return !pvc || !['framePrimerArea','framePrimerCoverage','framePrimerCoats','frameCleanerPacks','frameCoarseSheets'].includes(id);
}
const SNOW = 'mat-frame-supermal-acrylic-white-';
const EANS: Record<string, string> = {
  [SNOW + 'matt-800ml']: '5903973147756', [SNOW + 'semigloss-800ml']: '5903973232131',
  'mat-frame-urekor-d-white-800ml': '5903973231684', 'mat-frame-urekor-s-white-800ml': '5903973228790',
  'mat-frame-dulux-rapidry-white-matt-1l': '5904078222379', 'mat-extraction-solvent-anser-500ml': '5903231606117',
  'mat-hand-paper-klingspor-pl28c-p120': '5907560017644', 'mat-hand-paper-klingspor-pl28c-p240': '5907560039820',
  'mat-masking-tape-bluedolphin-30mm': '5907758515952',
};
const system = (m: MeasurementMap) => Number.isInteger(m.frameSystem ?? 0) && (m.frameSystem ?? 0) >= 0 && (m.frameSystem ?? 0) <= 4 ? m.frameSystem ?? 0 : null;

export function frameReference(id: string, m: MeasurementMap = {}): string | null {
  const selected = system(m);
  if (selected === null) return null;
  if (id === 'frame-paint') return selected === 4 ? 'mat-frame-dulux-rapidry-white-matt-1l' : SNOW + (selected % 2 ? 'semigloss-800ml' : 'matt-800ml');
  if (id === 'frame-primer') return selected === 4 ? null : `mat-frame-urekor-${selected < 2 ? 'd' : 's'}-white-800ml`;
  if (id === 'frame-cleaner') return selected === 4 ? null : 'mat-extraction-solvent-anser-500ml';
  if (id === 'frame-tape') return 'mat-masking-tape-bluedolphin-30mm';
  if (id === 'frame-sandpaper' || id === 'frame-paper-240') return 'mat-hand-paper-klingspor-pl28c-p' + (id === 'frame-sandpaper' ? '120' : '240');
  return null;
}

// source: https://www.karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_SUPERMAL%C2%AE_EMALIA_AKRYLOWA.pdf
// source: https://packshoty.duluxpolska.pl/wp-content/uploads/karta_techniczna_Dulux-Rapidry.pdf
// Raw millilitres are aggregated across jobs before rounding whole retail cans.
export function frameQuantity(id: string, m: MeasurementMap): number | null {
  if (!IDS.includes(id) || system(m) === null) return null;
  const selected = system(m)!, pvc = selected === 4;
  if (id === 'frame-pvc-cleaner') return !pvc || m.framePvcCleanerOwned === 1 ? 0 : null;
  if (pvc && (id === 'frame-primer' || id === 'frame-cleaner')) return 0;
  if (['frame-sandpaper', 'frame-paper-240', 'frame-tape', 'frame-cleaner'].includes(id)) {
    const [key, initial, multiple] = id === 'frame-sandpaper' ? ['frameCoarseSheets', 0, 1] as const
      : id === 'frame-paper-240' ? ['frameFineSheets', 2, 1] as const
      : id === 'frame-tape' ? ['frameTapeRolls', 1, 50] as const : ['frameCleanerPacks', 1, 500] as const;
    const count = m[key] ?? initial;
    if (pvc && id === 'frame-sandpaper' && count > 0) return null;
    return Number.isSafeInteger(count) && count >= 0 && count <= 500 ? count * multiple : null;
  }
  const area = id === 'frame-primer' ? m.framePrimerArea ?? m.wallArea : m.wallArea;
  const coats = id === 'frame-primer' ? m.framePrimerCoats ?? 1 : m.coats ?? 2;
  const coverage = id === 'frame-primer' ? m.framePrimerCoverage ?? 9 : m.coveragePerLiter ?? 10;
  const reserve = m.frameReservePercent ?? 10;
  if (!Number.isFinite(m.wallArea) || m.wallArea <= 0 || m.wallArea > 50 || !Number.isFinite(area) || area < 0 || area > m.wallArea
    || !Number.isSafeInteger(coats) || coats < (pvc ? 2 : 1) || coats > (id === 'frame-primer' ? selected < 2 ? 1 : 2 : 3)
    || !Number.isFinite(coverage) || coverage <= 0 || coverage > (id === 'frame-primer' ? 9 : pvc ? 16 : 14)
    || !Number.isFinite(reserve) || reserve < 0 || reserve > 30) return null;
  return Number((area * coats / coverage * 1000 * (1 + reserve / 100)).toFixed(6));
}

export const frameInputs: MeasurementInputDefinition[] = [
  {id:'frameSystem',label:'Podłoże i białe wykończenie — wewnątrz',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:4,
    options:[{value:0,label:'Drewno — Supermal mat + Urekor D'},{value:1,label:'Drewno — Supermal półpołysk + Urekor D'},{value:2,label:'Stal / żeliwo — Supermal mat + Urekor S'},{value:3,label:'Stal / żeliwo — Supermal półpołysk + Urekor S'},{value:4,label:'Twarde PVC wewnątrz — Dulux Rapidry mat'}],
    hint:'Wybór ustala konkretną farbę i podkład. PVC: tylko nadające się do malowania twarde tworzywo, po próbie przyczepności. Inne metale i prace na zewnątrz wymagają osobnego doboru.'},
  {id:'framePrimerArea',label:'Powierzchnia wymagająca podkładu',unit:'m²',inputType:'area',placeholder:'Puste = cała powierzchnia',min:0,max:50,required:false,
    hint:'Drewno/stal: odsłonięte podłoże i miejsca wymagające podkładu. 0 tylko gdy potwierdzisz, że istniejąca powłoka nadaje się do przemalowania. PVC: osobny podkład pomijamy w tym wariancie.'},
  {id:'framePrimerCoverage',label:'Wydajność podkładu Urekor D / S',unit:'m²/l',inputType:'coverage',placeholder:'9',defaultValue:9,min:0.1,max:9,required:false,hint:'Producent podaje do 9 m²/l na warstwę. Zmniejsz po próbie na chłonnym podłożu. Nie dotyczy PVC.'},
  {id:'framePrimerCoats',label:'Warstwy podkładu',unit:'warstwy',inputType:'count',placeholder:'1',defaultValue:1,min:1,max:2,required:false,hint:'Urekor D: 1. Urekor S: 1–2 według warunków i etykiety. PVC: nie dotyczy.'},
  {id:'frameReservePercent',label:'Zapas farby i podkładu',unit:'%',inputType:'percent',placeholder:'10',defaultValue:10,min:0,max:30,required:false,hint:'Założenie zakupowe, domyślnie 10%. Opakowania zaokrąglamy po zsumowaniu prac.'},
  {id:'frameTapeRolls',label:'Rolki taśmy Blue Dolphin 30 mm × 50 m',unit:'rolki',inputType:'count',placeholder:'1',defaultValue:1,min:0,max:500,required:false,hint:'Podaj liczbę do oklejenia; 0 pomija zakup. Nie przeliczamy powierzchni na długość taśmy.'},
  {id:'frameCoarseSheets',label:'Dodatkowe suche arkusze P120 — drewno / stal',unit:'szt.',inputType:'count',placeholder:'0',defaultValue:0,min:0,max:500,required:false,hint:'Opcjonalne do wstępnego przygotowania, po próbie. Dla PVC pozostaw 0. To osobny produkt od P240; brak stałej wydajności arkusza na m².'},
  {id:'frameFineSheets',label:'Suche arkusze P240 — matowanie',unit:'szt.',inputType:'count',placeholder:'2',defaultValue:2,min:0,max:500,required:false,hint:'Klingspor PL 28 C, 230 × 280 mm, pojedyncze arkusze. Liczbę dopasuj do stanu powierzchni; 0 pomija zakup.'},
  {id:'frameCleanerPacks',label:'Benzyna ekstrakcyjna Anser 0,5 l — przygotowanie drewna / stali',unit:'butelki',inputType:'count',placeholder:'1',defaultValue:1,min:0,max:500,required:false,hint:'Do wskazanych w karcie tłustych/żywicznych miejsc. Nie do PVC ani rozcieńczania wodnej emalii. 0, jeśli masz odpowiedni preparat lub nie jest potrzebny. Nie zakładamy wydajności butelki na m².'},
  {id:'framePvcCleanerOwned',label:'PVC: mam odpowiedni środek myjący do przygotowania',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,required:false,
    options:[{value:0,label:'Potrzebuję dobrać / kupić środek'},{value:1,label:'Mam odpowiedni środek powierzchniowo czynny'}],hint:'Dotyczy wyłącznie PVC. Bez potwierdzenia pozostawiamy środek jako brak do wyceny, zamiast pokazywać niepełny zestaw jako kompletny. Benzyna nie jest zamiennikiem.'},
];

// source: https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c
// source: https://anser.pl/pub/Aktualne%20karty%20charakterystyk%202025/Rozpuszczalnik%20Benzyna%20ekstrakcyjna_KARTA%20CHARAKTERYTYKI_PL3.1.pdf
export function frameMaterials(m: MeasurementMap = {}): MaterialItem[] {
  return IDS.map(id => {
    const reference = frameReference(id, m), ref = MATERIAL_PRICES.find(row => row.id === reference);
    if (!ref) return {id,name:id === 'frame-pvc-cleaner' ? 'Środek myjący do przygotowania PVC — dobierz lub potwierdź posiadanie' : id === 'frame-primer' ? 'Osobny podkład — nie dotyczy wybranego PVC' : 'Benzyna ekstrakcyjna — nie stosować do PVC',unit:'pozycja',category:'preparation',formulaKey:`framePainting:${id}`,pricePerUnit:0,wasteFactor:1,notes:'Brak wycenionego konkretnego produktu nie oznacza darmowego zakupu. Przygotowanie według karty farby.'};
    const liquid = ref.packageUnit === 'ml';
    return {id,name:ref.productLabel,brand:ref.brand,ean:EANS[ref.id],unit:ref.packageUnit,category:ref.materialType,sourceUrl:ref.sourceUrl,
      formulaKey:`framePainting:${id}`,wasteFactor:1,pricePerUnit:ref.pricePerPackage,priceBasis:'package',
      packaging:{size:ref.packageSize,label:`${ref.packageSize} ${ref.packageUnit}`,purchaseUnit:id==='frame-cleaner'?'butelka':liquid?'puszka':id==='frame-tape'?'rolka':'arkusz'},
      notes:id==='frame-paint'?'Dokładny biały wariant i pojemność. Powierzchnia × warstwy / wydajność + podany zapas. Przed pracą wykonaj próbę przyczepności.'
        :id==='frame-primer'?'Podkład do wybranego podłoża, nie grunt do ścian. Do 9 m²/l na warstwę. Przed emalią co najmniej 24 h; sprawdź etykietę i wykonaj próbę.'
        :id==='frame-cleaner'?'Benzyna EKSTRAKCYJNA, nie lakowa. Do przygotowania wskazanych miejsc, nie do PVC ani rozcieńczania emalii akrylowej. Wentylacja, ochrona i brak źródeł zapłonu według etykiety.'
        :id==='frame-tape'?'Podana liczba rolek po 50 m. Suma zapotrzebowania w całym remoncie przed doborem opakowań.'
        :'Suchy arkusz 230 × 280 mm o tej konkretnej gradacji. Podana osobno liczba, bez przeliczania m² na arkusze.'};
  });
}

export function reviewFrameCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (!calc || !isFrameJob(calc.jobId) || calc.quantityModel === FRAME_MODEL) return calc;
  const materials = calc.materials.map(line => isFrameMaterial(calc.jobId,line.material.id) ? {...line,quantityKnown:false} : line);
  for (const material of frameMaterials()) if (!materials.some(row=>row.material.id===material.id)) materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
  return {...calc,materials,quantityIssues:materials.filter(row=>row.quantityKnown===false).map(row=>row.material.name)};
}
export const reviewFrameProject = (project: Project): Project => isFrameJob(project.jobId) && project.calculationResult ? {...project,calculationResult:reviewFrameCalculation(project.calculationResult)} : project;
export function reviewFrameShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || !isFrameJob(calc.jobId)) return [...items];
  return items.flatMap(item=>{
    if(item.itemType!=='material'||!isFrameMaterial(calc.jobId,item.materialId))return item;
    const line=calc.materials.find(row=>row.material.id===item.materialId),required=frameQuantity(item.materialId,calc.measurements);
    if(calc.quantityModel!==FRAME_MODEL||!line||line.quantityKnown===false||required===null)return{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false,notes:'Otwórz obmiary i potwierdź podłoże, farbę, podkład oraz osobne ilości akcesoriów. Starszy zapis nie określa tych zakupów jednoznacznie.'};
    if(required===0)return[];
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=required;
    return{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:required,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes};
  });
}
