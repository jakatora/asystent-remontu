import type {CalculationResult, MaterialItem, Project, ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';

export const VINYL_CLICK_JOB = 'vinyl-flooring';
export const VINYL_CLICK_MODEL = 'vinyl-click-v1';
const IDS = ['vinyl-panels','underlay-vinyl','vinyl-vapor-barrier','vinyl-joint-tape','threshold-vinyl','vinyl-threshold-fixings'];
export const isVinylClickMaterial = (job:string,id:string) => job===VINYL_CLICK_JOB && IDS.includes(id);
const range = (n:number|undefined,min:number,max:number):n is number => Number.isFinite(n) && n!>=min && n!<=max;
const choice = (n:number|undefined,max:number):n is number => Number.isInteger(n) && range(n,0,max);

export function vinylClickReference(id:string,m:MeasurementMap={}):string|null {
  if(id==='vinyl-panels')return (m.vinylPanelChoice??0)===0?'mat-vinyl-spc-click-goodhome-marvo-224m2':m.vinylPanelChoice===1?'mat-vinyl-spc-click-goodhome-arilla-25m2':null;
  if(id==='underlay-vinyl')return m.vinylUnderlayChoice===1?'mat-vinyl-underlay-volden-lvt-625m2':m.vinylUnderlayChoice===2?'mat-vinyl-underlay-corksystem-lvt-6m2':null;
  if(id==='vinyl-vapor-barrier')return m.vinylVaporBarrier===1?'mat-vapor-foil-conkret-conpar-100m2':null;
  if(id==='vinyl-joint-tape')return 'mat-underlay-joint-tape-arbiton-izo-25m';
  if(id==='threshold-vinyl')return 'mat-vinyl-threshold-cezar-alu-40mm-1m';
  return null;
}

// The 10% cutting allowance is the existing shopping assumption, not a
// manufacturer's installation rate. Retail packs are rounded after rooms merge.
// source: https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474
export function vinylClickQuantity(id:string,m:MeasurementMap):number|null {
  if(!range(m.floorArea,1,200))return null;
  const area=Number((m.floorArea*1.1).toFixed(8));
  if(id==='vinyl-panels')return choice(m.vinylPanelChoice??0,1)?area:null;
  if(id==='underlay-vinyl')return !choice(m.vinylUnderlayChoice,3)||m.vinylUnderlayChoice===0?null:m.vinylUnderlayChoice===3?0:area;
  if(id==='vinyl-vapor-barrier')return !choice(m.vinylVaporBarrier,2)||m.vinylVaporBarrier===0?null:m.vinylVaporBarrier===2?0:area;
  if(id==='vinyl-joint-tape')return range(m.vinylJointTapeM,0,1000)?m.vinylJointTapeM:null;
  if(id==='threshold-vinyl'||id==='vinyl-threshold-fixings'){
    if(!choice(m.vinylThresholdCount,50))return null;
    if(m.vinylThresholdCount===0)return 0;
    if(m.vinylThresholdFit!==1)return null;
    return id==='threshold-vinyl'?m.vinylThresholdCount:m.vinylThresholdFixings===1?0:null;
  }
  return null;
}

export const vinylClickInputs:MeasurementInputDefinition[]=[
  {id:'vinylPanelChoice',label:'Model paneli winylowych click',unit:'',inputType:'select',placeholder:'Wybierz model',defaultValue:0,min:0,max:2,
    options:[{value:0,label:'GoodHome SPC Marvo — paczka 2,235 m²'},{value:1,label:'GoodHome SPC Arilla Dark Grey — paczka 2,5 m²'},{value:2,label:'Inny model — produkt do ustalenia'}],
    hint:'Model pozostaje taki sam przy zmianie poziomu cenowego. Dodajemy 10% zapasu na docinki; pełne paczki liczymy po zsumowaniu pomieszczeń. Podkład dobierz według instrukcji tego modelu.'},
  {id:'vinylUnderlayChoice',label:'Podkład dobrany do paneli',unit:'',inputType:'select',placeholder:'Sprawdź instrukcję paneli',defaultValue:0,min:0,max:3,
    options:[{value:0,label:'Jeszcze dobieram — pozostaw brak w wycenie'},{value:1,label:'Volden XPS LVT 1 mm — 6,25 m²'},{value:2,label:'Corksystem LVT 1,5 mm — 6 m², bez ogrzewania'},{value:3,label:'Mam całą ilość właściwego podkładu'}],
    hint:'Wybierz po sprawdzeniu wymagań panela, zamków i ogrzewania. Nie dokładamy drugiego podkładu pod panel z podkładem zintegrowanym. Nie zastępuj podkładu winylowego grubszym XPS do laminatu.'},
  {id:'vinylVaporBarrier',label:'Bariera przeciwwilgociowa',unit:'',inputType:'select',placeholder:'Sprawdź podłoże i instrukcję',defaultValue:0,min:0,max:2,
    options:[{value:0,label:'Wymagania trzeba jeszcze sprawdzić'},{value:1,label:'Kupuję folię Conkret Conpar 0,20 mm — rolka 100 m²'},{value:2,label:'Mam wymaganą barierę lub instrukcja jej nie wymaga'}],
    hint:'Sam opis „odporny na wilgoć” lub warstwa aluminium nie potwierdza kompletnej bariery. Nie doliczamy folii, gdy potwierdzisz jej brak w zakupach. Sprawdź wymagane uszczelnienie połączeń.'},
  {id:'vinylJointTapeM',label:'Dodatkowa taśma do spoin podkładu i folii',unit:'m',inputType:'dimension',placeholder:'0, jeśli masz odpowiednią taśmę',required:false,min:0,max:1000,
    hint:'Arbiton Izo Floor Tape 50 mm × 25 m. Zmierz potrzebne spoiny i docinki; nie wyliczamy ich długości z m². Brak liczby pozostawia pozycję do ustalenia.'},
  {id:'vinylThresholdCount',label:'Profile progowe Cezar 40 mm × 1 m do kupienia',unit:'szt.',inputType:'count',placeholder:'0, jeśli nie potrzebujesz zakupu',required:false,min:0,max:50,
    hint:'Podaj całe odcinki po sprawdzeniu przejść. Nie zakładamy jednego progu dla każdego pomieszczenia ani łączenia odcinków w długim przejściu.'},
  {id:'vinylThresholdFit',label:'Dopasowanie wybranych profili progowych',unit:'',inputType:'select',placeholder:'Sprawdź przejścia',defaultValue:0,min:0,max:1,
    options:[{value:0,label:'Jeszcze sprawdzam'},{value:1,label:'Potwierdzam długość, poziomy podłóg, dylatację i mocowanie'}],
    hint:'Dotyczy srebrnych profili Cezar 40 mm × 1 m. Dobierz zgodnie z układem i grubością podłogi.'},
  {id:'vinylThresholdFixings',label:'Mocowania do profili progowych',unit:'',inputType:'select',placeholder:'Dobierz do podłoża',defaultValue:0,min:0,max:1,
    options:[{value:0,label:'Pozostaw mocowania do doboru'},{value:1,label:'Mam odpowiednie mocowania do wszystkich wybranych profili'}],
    hint:'Nie zakładamy, że kołki i wkręty są w zestawie ani że każde mocowanie pasuje do podłoża.'},
];

export function vinylClickInputVisible(job:string,id:string,m:Readonly<Record<string,string|number|undefined>>):boolean {
  if(job!==VINYL_CLICK_JOB)return true;
  if(id==='panelPackCoverageM2')return false; // retained legacy ID; exact selected packs supply coverage
  if(id==='vinylThresholdFit'||id==='vinylThresholdFixings')return Number(m.vinylThresholdCount)>0;
  return true;
}
export function withVinylClickMeasurement(current:Readonly<Record<string,string>>,id:string,value:string|number):Record<string,string> {
  const next={...current,[id]:String(value)};
  if(['vinylPanelChoice','vinylUnderlayChoice'].includes(id)&&Number(current[id]??0)!==Number(value)){
    next.vinylVaporBarrier='0';next.vinylThresholdFit='0';
    if(id==='vinylPanelChoice')next.vinylUnderlayChoice='0';
  }
  if(id==='floorArea'&&Number(current.floorArea)!==Number(value)){
    if(current.vinylUnderlayChoice==='3')next.vinylUnderlayChoice='0';
    if(current.vinylVaporBarrier==='2')next.vinylVaporBarrier='0';
    next.vinylThresholdFit='0';
  }
  return next;
}

export function vinylClickMaterials(m:MeasurementMap={}):MaterialItem[] {
  const labels:Record<string,string>={'vinyl-panels':'Panele winylowe click — wybierz model','underlay-vinyl':'Podkład do paneli winylowych — do doboru','vinyl-vapor-barrier':'Bariera przeciwwilgociowa — sprawdź wymagania','vinyl-joint-tape':'Taśma do spoin podkładu i folii','threshold-vinyl':'Profile progowe — sprawdź dopasowanie','vinyl-threshold-fixings':'Mocowania profili progowych — do doboru'};
  return IDS.map(id=>{
    const ref=MATERIAL_PRICES.find(r=>r.id===vinylClickReference(id,m));
    if(!ref)return{id,name:labels[id],unit:'pozycja',formulaKey:`vinylClick:${id}`,pricePerUnit:0,wasteFactor:1};
    return{id,name:ref.productLabel,brand:ref.brand,ean:PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id))?.ean,unit:ref.packageUnit,category:ref.materialType,sourceUrl:ref.sourceUrl,
      formulaKey:`vinylClick:${id}`,pricePerUnit:ref.pricePerPackage,priceBasis:'package',wasteFactor:1,packaging:{size:ref.packageSize,label:`${ref.packageSize} ${ref.packageUnit}`,purchaseUnit:id==='vinyl-panels'?'paczka':id==='vinyl-joint-tape'?'rolka':'opakowanie'},notes:ref.notes};
  });
}
export function vinylClickWarnings(lines:readonly {quantityKnown?:boolean}[]) {
  const n=lines.filter(l=>l.quantityKnown===false).length;
  return n?[{condition:'always' as const,level:'warning' as const,message:`Niepełna wycena podłogi winylowej: ${n} pozycji wymaga doboru lub podania ilości w obmiarach.`}]:[];
}
export function reviewVinylClickCalculation(calc:CalculationResult|undefined):CalculationResult|undefined {
  if(!calc||calc.jobId!==VINYL_CLICK_JOB)return calc;
  const definitions=vinylClickMaterials(calc.measurements),current=calc.quantityModel===VINYL_CLICK_MODEL;
  const materials=calc.materials.map(line=>{
    if(!isVinylClickMaterial(calc.jobId,line.material.id))return line;
    const def=definitions.find(d=>d.id===line.material.id)!,n=vinylClickQuantity(line.material.id,calc.measurements);
    return !current||n===null||n>0&&def.ean!==('ean'in line.material?line.material.ean:undefined)?{...line,quantityKnown:false}:line;
  });
  for(const material of definitions)if(!materials.some(l=>l.material.id===material.id))materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
  return{...calc,materials,quantityIssues:materials.filter(l=>l.quantityKnown===false).map(l=>l.material.name),warnings:[...calc.warnings.filter(w=>!w.message.startsWith('Niepełna wycena podłogi winylowej:')),...vinylClickWarnings(materials)]};
}
export const reviewVinylClickProject=(project:Project):Project=>project.jobId===VINYL_CLICK_JOB&&project.calculationResult?{...project,calculationResult:reviewVinylClickCalculation(project.calculationResult)}:project;
export function reviewVinylClickShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[] {
  if(!calc||calc.jobId!==VINYL_CLICK_JOB)return [...items];
  return items.flatMap(item=>{
    if(item.itemType!=='material'||!isVinylClickMaterial(calc.jobId,item.materialId))return item;
    const line=calc.materials.find(l=>l.material.id===item.materialId),def=vinylClickMaterials(calc.measurements).find(m=>m.id===item.materialId)!,n=vinylClickQuantity(item.materialId,calc.measurements);
    if(calc.quantityModel!==VINYL_CLICK_MODEL||!line||line.quantityKnown===false||n===null||n>0&&def.ean!==('ean'in line.material?line.material.ean:undefined))return{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false};
    if(n===0)return [];
    const same=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=n;
    return{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,requiredQuantity:n,quantityKnown:true,needsQuantityConfirmation:!same,owned:same&&item.owned,purchased:same&&item.purchased,estimatedPrice:line.cost,notes:line.material.notes};
  });
}
