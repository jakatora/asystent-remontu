import type {CalculationResult,MaterialItem,Project,ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';

export const UNDERLAY_JOB='underlay-install';
export const UNDERLAY_MODEL='underlay-install-v1';
const IDS=['underlay','vapor-barrier','adhesive-tape'];
export const isUnderlayMaterial=(job:string,id:string)=>job===UNDERLAY_JOB&&IDS.includes(id);
const valid=(n:number|undefined,min:number,max:number):n is number=>Number.isFinite(n)&&n!>=min&&n!<=max;
const FOILS=['','mat-vapor-foil-conkret-conpar-100m2','mat-vapor-foil-conkret-ecovil-p-100m2','mat-vapor-foil-arbiton-aquaprotec-10m2'];
export function underlayReference(id:string,m:MeasurementMap={}):string|null{
  if(id==='underlay')return m.underlaySystem===1?'mat-underlay-volden-xps-10m2':m.underlaySystem===2?'mat-underlay-arbiton-xps-aquastop-6m2':null;
  if(id==='vapor-barrier')return Number.isInteger(m.underlayBarrierChoice)?FOILS[m.underlayBarrierChoice]||null:null;
  if(id==='adhesive-tape')return 'mat-underlay-joint-tape-arbiton-izo-25m';
  return null;
}
// 3in1 includes a vapour barrier and joining tape; do not buy another foil.
// Separate foil demand must include the actual layout/overlaps/upstands.
// source: https://arbiton.com/content/uploads/ARBITON-underlayments-2025.pdf
// source: https://pim.decora.pl/files/gHiJ3PFoVKBHE5Ep.pdf
export function underlayQuantity(id:string,m:MeasurementMap):number|null{
  if(!IDS.includes(id)||!valid(m.floorArea,1,300))return null;
  if(id==='adhesive-tape')return valid(m.underlayTapeM,0,1000)?m.underlayTapeM:null;
  if(id==='vapor-barrier'&&(m.underlaySystem===2||m.underlayBarrierChoice===4))return 0;
  if(id==='vapor-barrier')return underlayReference(id,m)&&m.underlayFoilFit===1&&valid(m.underlayFoilAreaM2,m.floorArea,1000)?m.underlayFoilAreaM2:null;
  const reserve=m.underlayReservePercent??10;
  return underlayReference(id,m)&&m.underlayFit===1&&valid(reserve,0,30)?Number((m.floorArea*(1+reserve/100)).toFixed(8)):null;
}
const labels:Record<string,string>={underlay:'Podkład — wybierz model dopasowany do podłogi','vapor-barrier':'Ochrona przed wilgocią — dobierz folię lub potwierdź istniejącą','adhesive-tape':'Taśma do podkładu i folii — zmierz potrzebne łączenia'};
export function underlayMaterials(m:MeasurementMap={}):MaterialItem[]{
  return IDS.map(id=>{
    const ref=MATERIAL_PRICES.find(r=>r.id===underlayReference(id,m));
    if(!ref)return{id,name:labels[id],unit:id==='adhesive-tape'?'m':'m2',formulaKey:'underlay-install:'+id,pricePerUnit:0};
    const photo=PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id));
    return{id,name:ref.productLabel,brand:ref.brand,ean:photo?.ean,imageUrl:photo?.imageUrl,unit:ref.packageUnit,category:ref.materialType,formulaKey:'underlay-install:'+id,sourceUrl:ref.sourceUrl,pricePerUnit:ref.pricePerPackage,priceBasis:'package',wasteFactor:id==='underlay'?1+(m.underlayReservePercent??10)/100:1,packaging:{size:ref.packageSize,label:`${ref.packageSize} ${ref.packageUnit}`,purchaseUnit:id==='adhesive-tape'?'rolka':'opakowanie'},notes:ref.notes};
  });
}
export const underlayInputs:MeasurementInputDefinition[]=[
  {id:'floorArea',label:'Powierzchnia podłogi',unit:'m²',inputType:'area',placeholder:'np. 20',min:1,max:300,required:true},
  {id:'underlaySystem',label:'Podkład do porównania cen',unit:'',inputType:'select',placeholder:'Dobierz podkład',min:0,max:2,defaultValue:0,required:false,options:[{value:0,label:'Jeszcze dobieram podkład'},{value:1,label:'Volden XPS Smart 3 mm — 10 m², bez osobnej bariery w podkładzie'},{value:2,label:'Arbiton Secura Thermo Aquastop Smart 1,6 mm — 6 m², 3 w 1'}],hint:'Te warianty dotyczą podłóg pływających z paneli laminowanych. Nie dobieramy ich automatycznie do winylu, podłogi klejonej ani ogrzewania elektrycznego. Poziom cen nie zmienia wybranego modelu.'},
  {id:'underlayFit',label:'Zgodność podkładu z podłogą i podłożem',unit:'',inputType:'select',placeholder:'Sprawdź instrukcje',min:0,max:1,defaultValue:0,required:false,options:[{value:0,label:'Zgodność wymaga sprawdzenia'},{value:1,label:'Potwierdzam dobranie podkładu według instrukcji moich paneli'}],hint:'Sprawdź rodzaj paneli, równość i wilgotność podłoża oraz cały układ ogrzewania. Parametry i dopuszczalny podkład wynikają z instrukcji konkretnej podłogi; wybrany produkt nie jest uniwersalnym rozwiązaniem.'},
  {id:'underlayReservePercent',label:'Zapas podkładu na docinki',unit:'%',inputType:'count',placeholder:'10',defaultValue:10,min:0,max:30,required:false,hint:'Założenie zakupowe; skoryguj z planem docinek. Nie zwiększamy ponownie ilości już wskazanej folii ani metrów taśmy.'},
  {id:'underlayBarrierChoice',label:'Osobna folia lub istniejąca ochrona przed wilgocią',unit:'',inputType:'select',placeholder:'Dobierz barierę',min:0,max:4,defaultValue:0,required:false,options:[{value:0,label:'Wymagania bariery jeszcze do ustalenia'},{value:1,label:'Conkret Conpar 0,20 mm — rolka 100 m²'},{value:2,label:'Conkret Ecovil P 0,20 mm — rolka 100 m²'},{value:3,label:'Arbiton Aquaprotec Vapour Barrier 0,18 mm — 10 m²'},{value:4,label:'Bez zakupu folii — odpowiednia bariera już jest lub instrukcja jej nie wymaga'}],hint:'Dobierz według instrukcji paneli i podkładu. Nie utożsamiamy nominalnych grubości i tolerancji. Aquaprotec 0,18 mm / SD>150 m należy do systemu Energy Saving Flooring System; nie jest automatycznym zamiennikiem wymaganej folii min.0,20 mm. Przy Arbiton 3 w 1 nie doliczamy drugiej folii.'},
  {id:'underlayFoilFit',label:'Zgodność osobnej folii z wymaganiami podłogi',unit:'',inputType:'select',placeholder:'Sprawdź parametry folii',min:0,max:1,defaultValue:0,required:false,options:[{value:0,label:'Jeszcze sprawdzę wymaganą barierę'},{value:1,label:'Potwierdzam zgodność wybranej folii i układu podłogi'}],hint:'Sprawdź wymaganą paroszczelność SD, grubość, tolerancje i sposób łączenia. Bariera paroszczelna nie zastępuje hydroizolacji ani osuszenia mokrego podłoża.'},
  {id:'underlayFoilAreaM2',label:'Folia do rozłożenia łącznie z zakładami i wywinięciami',unit:'m²',inputType:'area',placeholder:'Policz z planu pasów folii',min:1,max:1000,required:true,hint:'To całkowite zużycie folii, co najmniej powierzchnia podłogi. Dodaj zakłady i wywinięcia zgodnie z instrukcją swojego systemu. Nie liczymy ich automatycznie z samych m² pomieszczenia i nie dodajemy ponownie zapasu podkładu.'},
  {id:'underlayTapeM',label:'Dodatkowa taśma do uszczelnienia i łączenia',unit:'m',inputType:'length',placeholder:'Zmierz; 0, jeśli nie kupujesz dodatkowej taśmy',min:0,max:1000,required:true,hint:'Arbiton Izo Floor Tape 50 mm × 25 m. Zmierz łączenia, docinki i wywinięcia wymagające taśmy. Przy gotowych zintegrowanych połączeniach może wystarczyć 0. Opakowania tej samej taśmy łączymy również z innymi etapami remontu.'},
];
export function underlayInputVisible(job:string,id:string,m:Readonly<Record<string,string|number|undefined>>):boolean{
  if(job!==UNDERLAY_JOB)return true;
  const integrated=Number(m.underlaySystem)===2,foil=[1,2,3].includes(Number(m.underlayBarrierChoice));
  if(id==='underlayBarrierChoice')return !integrated;
  if(['underlayFoilFit','underlayFoilAreaM2'].includes(id))return !integrated&&foil;
  return true;
}
export function withUnderlayMeasurement(current:Readonly<Record<string,string>>,id:string,value:string|number):Record<string,string>{
  const next={...current,[id]:String(value)};
  if(id==='underlaySystem'&&Number(current[id])!==Number(value)){next.underlayFit='0';next.underlayFoilFit='0';}
  if(id==='underlayBarrierChoice'&&Number(current[id])!==Number(value))next.underlayFoilFit='0';
  return next;
}
export function reviewUnderlayCalculation(calc:CalculationResult|undefined):CalculationResult|undefined{
  if(!calc||calc.jobId!==UNDERLAY_JOB)return calc;
  const defs=underlayMaterials(calc.measurements),materials=calc.materials.map(line=>{
    if(!isUnderlayMaterial(calc.jobId,line.material.id))return line;
    const needed=underlayQuantity(line.material.id,calc.measurements),def=defs.find(d=>d.id===line.material.id);
    const identity=needed===0||def?.ean&&'ean'in line.material&&line.material.ean===def.ean&&line.material.unit===def.unit&&line.material.packaging?.size===def.packaging?.size;
    return calc.quantityModel===UNDERLAY_MODEL&&needed!==null&&identity&&Number.isFinite(line.rawQuantity)&&Math.abs(line.rawQuantity!-needed)<=1e-7?line:{...line,quantityKnown:false};
  });
  return{...calc,materials,quantityIssues:materials.filter(l=>l.quantityKnown===false).map(l=>l.material.name)};
}
export const reviewUnderlayProject=(p:Project):Project=>p.jobId===UNDERLAY_JOB?{...p,calculationResult:reviewUnderlayCalculation(p.calculationResult)}:p;
export function reviewUnderlayShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[]{
  if(calc?.jobId!==UNDERLAY_JOB)return[...items];
  return items.flatMap(item=>{
    if(item.itemType!=='material'||!isUnderlayMaterial(calc.jobId,item.materialId))return[item];
    const line=calc.materials.find(l=>l.material.id===item.materialId),needed=underlayQuantity(item.materialId,calc.measurements);
    if(calc.quantityModel!==UNDERLAY_MODEL||!line||line.quantityKnown===false||needed===null)return[{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false}];
    if(needed===0)return[];
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=needed;
    return[{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:needed,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes}];
  });
}
