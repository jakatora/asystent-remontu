import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const WALL_FINISHING_MODEL = 'wall-finishing-v1';
export const isWallFinishingJob = (id: string) => id === 'wall-repair' || id === 'skim-coat';
export const finishingCoarseId = (jobId: string) => jobId === 'wall-repair' ? 'sandpaper-repair' : 'sandpaper';
export const finishingMassId = (jobId: string) => jobId === 'wall-repair' ? 'filler' : 'skim-coat';
const PAPER = 'mat-hand-paper-klingspor-pl28c-p';
const MASS = 'mat-skim-coat-acrylputz-st10-';
const TAPE = 'mat-joint-tape-bluedolphin-fsh-48mm-20m';

export function finishingReference(jobId: string, id: string, m: MeasurementMap = {}): string | null {
  if (!isWallFinishingJob(jobId)) return null;
  if (id === finishingMassId(jobId)) {
    const pack = m.fillerPackSize ?? (jobId === 'wall-repair' ? 5 : 20);
    return pack === 5 || pack === 20 ? MASS + pack + 'kg' : null;
  }
  if (id === 'mesh-tape' && jobId === 'wall-repair') return TAPE;
  if (id === finishingCoarseId(jobId)) return PAPER + (jobId === 'wall-repair' ? '120' : '150');
  return id === 'finishing-paper-240' ? PAPER + '240' : null;
}
export const isFinishingMaterial = (jobId: string, id: string) => Boolean(finishingReference(jobId, id));

// source: https://www.acrylputz.pl/produkty/gladzie-sypkie/acrylputz-st10-start
// About 1 kg/m²/mm; repair area is independent of the whole wall to prime.
export function finishingQuantity(jobId: string, id: string, m: MeasurementMap): number | null {
  if (!isFinishingMaterial(jobId, id)) return null;
  if (id === finishingCoarseId(jobId) || id === 'finishing-paper-240') {
    const count = m[id === 'finishing-paper-240' ? 'finePaperSheets' : 'coarsePaperSheets'] ?? (id === 'finishing-paper-240' ? 0 : 1);
    return Number.isSafeInteger(count) && count >= 0 && count <= 500 ? count : null;
  }
  const reserve = m.fillerReservePercent ?? 10;
  if (!Number.isFinite(reserve) || reserve < 0 || reserve > 30) return null;
  if (id === 'mesh-tape') {
    const length = m.repairTapeLength ?? 0;
    return Number.isFinite(length) && length >= 0 && length <= 500 ? Number((length * (1 + reserve / 100)).toFixed(6)) : null;
  }
  if (!finishingReference(jobId, id, m)) return null;
  const area = jobId === 'wall-repair' ? m.repairArea : m.wallArea;
  const wall = m.wallArea;
  const depth = jobId === 'wall-repair' ? m.repairDepthMm ?? 2 : m.skimLayerThicknessMm ?? 1;
  const layers = jobId === 'wall-repair' ? 1 : m.layers ?? 2;
  if (!Number.isFinite(area) || area <= 0 || !Number.isFinite(wall) || wall <= 0 || wall > (jobId === 'wall-repair' ? 200 : 500) || area > wall
      || !Number.isFinite(depth) || depth < 1 || depth > (jobId === 'wall-repair' ? 30 : 3)
      || !Number.isSafeInteger(layers) || layers < 1 || layers > 4) return null;
  return Number((area * depth * layers * (1 + reserve / 100)).toFixed(6));
}

export function finishingInputs(jobId: string): MeasurementInputDefinition[] {
  const repair = jobId === 'wall-repair';
  return [
    ...(repair ? [
      {id:'repairArea',label:'Łączna powierzchnia samych napraw',unit:'m²',inputType:'area' as const,placeholder:'np. 0,5',min:0.001,max:200,
        hint:'Zsumuj powierzchnie łat i ubytków. 10 × 10 cm to 0,01 m². To osobny obmiar od całej ściany do gruntowania.'},
      {id:'repairDepthMm',label:'Średnia głębokość wypełnienia',unit:'mm',inputType:'dimension' as const,placeholder:'2',defaultValue:2,min:1,max:30,required:false,
        hint:'ST10: typowa warstwa 1–3 mm; do 30 mm tylko w pojedynczych ubytkach. Przy różnych głębokościach podaj średnią lub rozdziel prace.'},
      {id:'repairTapeLength',label:'Długość rys do zbrojenia taśmą',unit:'m',inputType:'dimension' as const,placeholder:'0',defaultValue:0,min:0,max:500,required:false,
        hint:'0 przy samych otworach bez rys. Mierzymy długość, a nie powierzchnię ściany. Taśma 48 mm do stabilnych rys wewnętrznych; pęknięcia konstrukcyjne wymagają oceny fachowca.'},
    ] : [
      {id:'skimLayerThicknessMm',label:'Grubość jednej warstwy ST10',unit:'mm',inputType:'dimension' as const,placeholder:'1',defaultValue:1,min:1,max:3,required:false,
        hint:'ST10: 1–3 mm na warstwę. Zużycie około 1 kg/m²/mm; mnożymy przez podaną liczbę warstw.'},
    ]),
    {id:'fillerPackSize',label:'Opakowanie masy do porównania',unit:'kg',inputType:'select',placeholder:'Wybierz',defaultValue:repair?5:20,min:5,max:20,required:false,
      options:[{value:5,label:'ACRYL-PUTZ ST10 START 5 kg'},{value:20,label:'ACRYL-PUTZ ST10 START 20 kg'}],
      hint:'Wybierasz wielkość opakowania tej samej masy. Porównujemy wybrany wariant między sklepami; liczba opakowań wynika z sumy prac.'},
    {id:'fillerReservePercent',label:'Zapas masy i taśmy',unit:'%',inputType:'percent',placeholder:'10',defaultValue:10,min:0,max:30,required:false,
      hint:'Jawne założenie zakupowe. Zapas nie zmienia liczby arkuszy papieru, którą podajesz osobno.'},
    {id:'coarsePaperSheets',label:`Arkusze Klingspor PL 28 C P${repair?'120':'150'}`,unit:'szt.',inputType:'count',placeholder:'1',defaultValue:1,min:0,max:500,required:false,
      hint:'Pojedyncze suche arkusze 230 × 280 mm do szlifowania ręcznego. Podaj własną liczbę; 0 pomija zakup. Nie zakładamy stałej wydajności arkusza na m².'},
    {id:'finePaperSheets',label:'Dodatkowe arkusze Klingspor PL 28 C P240',unit:'szt.',inputType:'count',placeholder:'0',defaultValue:0,min:0,max:500,required:false,
      hint:'Opcjonalna drobniejsza gradacja, jeśli wymaga jej wykończenie. 0 pomija zakup; ST10 zaleca do szlifowania gradację 100–150. To inny produkt niż P120/P150.'},
  ];
}

// source: https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c
// source: https://www.grupapsb.com.pl/produkt/tasma-antyrysowa-48-mm-x-20-m-blue-dolphin-5907758504369.html
export function finishingMaterials(jobId: string, m: MeasurementMap = {}): MaterialItem[] {
  const ids = [finishingMassId(jobId), ...(jobId === 'wall-repair' ? ['mesh-tape'] : []), finishingCoarseId(jobId), 'finishing-paper-240'];
  return ids.map(id => {
    const reference = finishingReference(jobId, id, m) ?? finishingReference(jobId, id)!;
    const ref = MATERIAL_PRICES.find(row => row.id === reference)!;
    const ean = reference === MASS+'5kg' ? '5903973104414' : reference === MASS+'20kg' ? '5903973104421' : reference === TAPE ? '5907758504369'
      : reference === PAPER+'120' ? '5907560017644' : reference === PAPER+'150' ? '5907560023553' : '5907560039820';
    const mass = id === finishingMassId(jobId), tape = id === 'mesh-tape';
    return {id,name:ref.productLabel,brand:ref.brand,ean,unit:ref.packageUnit,category:ref.materialType,sourceUrl:ref.sourceUrl,
      formulaKey:`wallFinishing:${jobId}:${id}`,wasteFactor:1,pricePerUnit:ref.pricePerPackage,priceBasis:'package',
      packaging:{size:ref.packageSize,label:`${ref.packageSize} ${ref.packageUnit}`,purchaseUnit:mass?'worek':tape?'rolka':'arkusz'},
      notes:mass?`Sypka masa ST10. Około 1 kg/m²/mm; ${jobId==='wall-repair'?'powierzchnia samych napraw × średnia głębokość':'powierzchnia × liczba warstw × grubość warstwy'} + podany zapas. Przygotowanie i ilość wody sprawdź na etykiecie bieżącej partii.`
        :tape?'Blue Dolphin FSH 48 mm × 20 m. Zmierzona długość stabilnych rys + podany zapas. Metry sumujemy przed doborem rolek. Nie rozwiązuje przyczyny pęknięć konstrukcyjnych.'
        :'Suchy arkusz PL 28 C 230 × 280 mm do szlifowania ręcznego, wybrana gradacja. Liczbę arkuszy podajesz osobno.'};
  });
}

export function reviewFinishingCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (!calc || !isWallFinishingJob(calc.jobId) || calc.quantityModel === WALL_FINISHING_MODEL) return calc;
  const materials = calc.materials.map(line => isFinishingMaterial(calc.jobId,line.material.id) ? {...line,quantityKnown:false} : line);
  for (const material of finishingMaterials(calc.jobId)) if (!materials.some(row=>row.material.id===material.id)) materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
  return {...calc,materials,quantityIssues:materials.filter(row=>row.quantityKnown===false).map(row=>row.material.name)};
}
export const reviewFinishingProject = (project: Project): Project => isWallFinishingJob(project.jobId) && project.calculationResult ? {...project,calculationResult:reviewFinishingCalculation(project.calculationResult)} : project;
export function reviewFinishingShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || !isWallFinishingJob(calc.jobId)) return [...items];
  return items.flatMap(item=>{
    if(item.itemType!=='material'||!isFinishingMaterial(calc.jobId,item.materialId))return item;
    const line=calc.materials.find(row=>row.material.id===item.materialId),required=finishingQuantity(calc.jobId,item.materialId,calc.measurements);
    if(calc.quantityModel!==WALL_FINISHING_MODEL||!line||line.quantityKnown===false||required===null)return{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false,notes:'Otwórz obmiary projektu i potwierdź powierzchnię napraw, głębokość, długość rys oraz liczbę arkuszy. Starszy zapis nie określa tych ilości jednoznacznie.'};
    if(required===0)return[];
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=required;
    return{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:required,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes};
  });
}
