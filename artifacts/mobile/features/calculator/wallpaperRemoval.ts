import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const REMOVAL_JOB = 'wallpaper-remove';
export const REMOVAL_MODEL = 'wallpaper-removal-v1';
const REMOVER = 'mat-wallpaper-remover-metylan-500ml';
const MASS = 'mat-skim-coat-acrylputz-st10-';
const FILM = 'mat-protective-film-bluedolphin-4x5m';
const IDS = ['wallpaper-remover', 'filler-after', 'removal-film'];
export const isRemovalMaterial = (jobId: string, id: string) => jobId === REMOVAL_JOB && IDS.includes(id);
export function removalWarnings(lines: readonly {quantityKnown?: boolean}[]) {
  const missing=lines.filter(line=>line.quantityKnown===false).length;
  return missing ? [{condition:'always' as const,level:'warning' as const,message:`Niepełna wycena: ${missing} pozycji wymaga obmiarów. Potwierdź naprawy, zabezpieczenie i zużycie w edycji projektu. Szacunek obejmuje tylko materiały o znanej ilości.`}] : [];
}
export function removalReference(id: string, m: MeasurementMap = {}): string | null {
  if (id === 'wallpaper-remover') return REMOVER;
  if (id === 'removal-film') return FILM;
  if (id === 'filler-after') return (m.removalRepairPackKg ?? 5) === 5 ? MASS + '5kg' : m.removalRepairPackKg === 20 ? MASS + '20kg' : null;
  return null;
}
const range = (v: number | undefined, min: number, max: number): v is number => Number.isFinite(v) && v! >= min && v! <= max;
// source: https://datasheets.tdx.henkel.com/METYLAN-Remover-pl_PL.pdf
// Purchased concentrate, not the diluted solution:500ml covers200/100m²
// at one application. The technical card recommends two for non-paper types.
export function removalQuantity(id: string, m: MeasurementMap): number | null {
  if (!range(m.wallArea, 1, 500)) return null;
  if (id === 'wallpaper-remover') {
    const kind = m.removalWallpaperType ?? 0, mode = m.removalApplications ?? 0, reserve = m.removalReservePercent ?? 10;
    if (!Number.isInteger(kind) || !range(kind, 0, 2) || !Number.isInteger(mode) || !range(mode, 0, 3) || !range(reserve, 0, 30)) return null;
    const applications = mode === 0 ? kind === 0 ? 1 : 2 : mode;
    return Number((m.wallArea * 500 / (kind === 2 ? 100 : 200) * applications * (1 + reserve / 100)).toFixed(6));
  }
  if (id === 'filler-after') return removalReference(id, m) && range(m.removalRepairKg, 0, 1000) ? m.removalRepairKg : null;
  if (id === 'removal-film') return range(m.removalFilmArea, 0, 1000) ? m.removalFilmArea : null;
  return null;
}
// source: https://datasheets.tdx.henkel.com/METYLAN-Remover-pl_PL.pdf
// source: https://www.acrylputz.pl/produkty/gladzie-sypkie/acrylputz-st10-start
// source: https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034
export const removalInputs: MeasurementInputDefinition[] = [
  {id:'removalWallpaperType',label:'Rodzaj usuwanej tapety',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:2,options:[{value:0,label:'Papierowa / farba klejowa'},{value:1,label:'Flizelina / włóknina'},{value:2,label:'Ciężka, raufaza lub z włókna szklanego'}],hint:'Metylan Remover: butelka 500 ml na 200 m² dla papieru/flizeliny, 100 m² dla ciężkich tapet, przy jednym nanoszeniu. Warstwy i ponowne namaczanie zwiększają zużycie.'},
  {id:'removalApplications',label:'Liczba naniesień roztworu',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:3,options:[{value:0,label:'Zalecenie karty: papier 1, pozostałe 2'},{value:1,label:'1 nanoszenie — potwierdzone próbą'},{value:2,label:'2 nanoszenia'},{value:3,label:'3 nanoszenia'}],hint:'Najpierw wykonaj próbę. Kilka warstw tapet zdejmuj kolejno; zwiększ liczbę naniesień, jeśli potrzebna jest większa ilość roztworu. Kupowany koncentrat liczymy oddzielnie od wody.'},
  {id:'removalReservePercent',label:'Zapas koncentratu',unit:'%',inputType:'percent',placeholder:'10',defaultValue:10,min:0,max:30,required:false,hint:'Jawne założenie zakupowe, dodatkowe wobec wydajności producenta.'},
  {id:'removalRepairKg',label:'Zapotrzebowanie masy ST10 do napraw',unit:'kg',inputType:'dimension',placeholder:'0, jeśli naprawy nie są potrzebne',min:0,max:1000,required:true,hint:'Po zdjęciu tapet oceń ubytki. Wpisz własne zapotrzebowanie w kg; 0 pomija naprawy. ST10 około 1 kg/m²/mm; dla głębokości 1–3 mm na warstwę, do 30 mm tylko pojedyncze ubytki. Puste pole oznacza nieznaną ilość, nie darmową masę.'},
  {id:'removalRepairPackKg',label:'Opakowanie ST10 do napraw',unit:'kg',inputType:'select',placeholder:'Wybierz',defaultValue:5,min:5,max:20,required:false,options:[{value:5,label:'ACRYL-PUTZ ST10 START 5 kg'},{value:20,label:'ACRYL-PUTZ ST10 START 20 kg'}],hint:'Dokładnie wybrane opakowanie. Z innymi pracami sumujemy kg tego samego wariantu przed zaokrągleniem do pełnych worków.'},
  {id:'removalFilmArea',label:'Powierzchnia do zabezpieczenia folią',unit:'m²',inputType:'area',placeholder:'Zmierz podłogę i inne powierzchnie',min:0,max:1000,required:true,hint:'Blue Dolphin 4 × 5 m: 20 m² w opakowaniu. Nie wyliczamy podłogi z powierzchni ścian. Wpisz 0, jeśli stosujesz inny odpowiedni sposób zabezpieczenia; posiadaną folię możesz oznaczyć jako „Mam” w Zakupach.'},
];
export function removalMaterials(m: MeasurementMap = {}): MaterialItem[] {
  return IDS.map(id => {
    const reference = removalReference(id, m) ?? removalReference(id)!;
    const ref = MATERIAL_PRICES.find(r => r.id === reference)!;
    const ean = id === 'wallpaper-remover' ? '9000100222969' : id === 'filler-after' ? reference.endsWith('20kg') ? '5903973104421' : '5903973104414' : '5907758504932';
    return {id,name:ref.productLabel,brand:ref.brand,ean,unit:ref.packageUnit,category:ref.materialType,sourceUrl:ref.sourceUrl,formulaKey:'wallpaperRemoval:'+id,wasteFactor:1,pricePerUnit:ref.pricePerPackage,priceBasis:'package',packaging:{size:ref.packageSize,label:`${ref.packageSize} ${ref.packageUnit}`,purchaseUnit:id==='wallpaper-remover'?'butelka':id==='filler-after'?'worek':'opakowanie'},notes:id==='wallpaper-remover'?'Koncentrat 500 ml. Papier1:40, ciężkie1:20; pozostałe tapety karta zaleca namaczać 2 razy. Próbę i liczbę naniesień ustaw w obmiarach. Nanieś pędzlem/szczotką, po 5–10 min zdejmuj warstwami; resztki usuń wilgotną gąbką.':id==='filler-after'?'Ilość podana po ocenie ubytków, bez stałych 2 kg dla każdej ściany. Sucha masa ST10, nie gotowa pasta.':'Osobny obmiar powierzchni do zabezpieczenia. Pełne opakowanie 20 m²; nie 20 opakowań.'};
  });
}
/** Historical snapshots need a user review; never persist this projection. */
export function reviewRemovalCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (!calc || calc.jobId !== REMOVAL_JOB || calc.quantityModel === REMOVAL_MODEL) return calc;
  const materials = calc.materials.map(line => isRemovalMaterial(calc.jobId,line.material.id) ? {...line,quantityKnown:false} : line);
  for (const material of removalMaterials()) if (!materials.some(l=>l.material.id===material.id)) materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
  return {...calc,materials,quantityIssues:materials.filter(l=>l.quantityKnown===false).map(l=>l.material.name)};
}
export const reviewRemovalProject = (project: Project): Project => project.jobId === REMOVAL_JOB && project.calculationResult ? {...project,calculationResult:reviewRemovalCalculation(project.calculationResult)} : project;
export function reviewRemovalShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || calc.jobId !== REMOVAL_JOB) return [...items];
  return items.flatMap(item=>{
    if (item.itemType !== 'material' || !isRemovalMaterial(calc.jobId,item.materialId)) return item;
    const line=calc.materials.find(l=>l.material.id===item.materialId),q=removalQuantity(item.materialId,calc.measurements);
    if (calc.quantityModel!==REMOVAL_MODEL || !line || line.quantityKnown===false || q===null) return {...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false,notes:'Potwierdź rodzaj tapety, koncentrat, naprawy i folię w obmiarach projektu.'};
    if (q===0) return [];
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=q;
    return {...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:q,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes};
  });
}
