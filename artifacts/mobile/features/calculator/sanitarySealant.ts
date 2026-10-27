import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementInputDefinition } from '@/types/engine';
import type { MeasurementMap } from '@/types/calculator';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const SANITARY_MODEL='sanitary-sealant-v1';
export const SANITARY_REFERENCE='mat-sanitary-silicone-soudal-280ml';
export const SANITARY_STOP_REFERENCE='mat-sanitary-silicone-soudal-stop-white-280ml';
export const REMOVER_REFERENCE='mat-silicone-remover-soudal-100ml';
export const isSanitaryJob=(id:string)=>id==='silicone-sealing'||id==='silicone-refresh';
export const sanitarySiliconeId=(id:string)=>id==='silicone-refresh'?'fresh-silicone':'silicone';
export const sanitaryTapeId=(id:string)=>id==='silicone-refresh'?'masking-tape-sil':'masking-tape-seal';

export function sanitaryReferences(m:MeasurementMap={}) {
  const model=m.sealantModel??0,tape=m.sealantTapeModel??0;
  return {silicone:model===0?SANITARY_REFERENCE:model===1?SANITARY_STOP_REFERENCE:null,
    tape:tape===0?'mat-masking-tape-bluedolphin-30mm':tape===1?'mat-masking-tape-bluedolphin-38mm':null};
}

// Volume: 1 m × 1 mm × 1 mm = 1 ml. Explicit rectangular bead and reserve;
// do not round to cartridges until the whole renovation basket is aggregated.
// source: https://www.soudal.pl/diy/produkty/masy-uszczelniajace/silikony/silikon-sanitarny
// source: https://www.soudal.pl/sites/default/files/soudal_api/document/TDS_silikon_sanitarny_STOP_2025.pdf
export function sanitaryQuantity(jobId:string,id:string,m:MeasurementMap):number|null {
  if(!isSanitaryJob(jobId))return null;
  if(id==='silicone-remover'){
    const packs=m.sealantRemoverPacks??1;
    return Number.isSafeInteger(packs)&&packs>=0&&packs<=20?packs*100:null;
  }
  if(id===sanitaryTapeId(jobId)&&m.sealantTapeNeeded===0)return 0;
  const length=m[jobId==='silicone-refresh'?'siliconeLength':'linearMeters'];
  if(!Number.isFinite(length)||length<0.5||length>(jobId==='silicone-refresh'?100:50))return null;
  const reserve=m.sealantReservePercent??10;
  if(!Number.isFinite(reserve)||reserve<0||reserve>30)return null;
  if(id===sanitarySiliconeId(jobId)){
    const width=m.sealantWidthMm??5,depth=m.sealantDepthMm??5;
    if(!sanitaryReferences(m).silicone||!Number.isFinite(width)||width<5||width>30||!Number.isFinite(depth)||depth<5||depth>30)return null;
    return Number((length*width*depth*(1+reserve/100)).toFixed(6));
  }
  if(id===sanitaryTapeId(jobId)){
    if(m.sealantTapeNeeded!==undefined&&m.sealantTapeNeeded!==1||!sanitaryReferences(m).tape)return null;
    return Number((2*length*(1+reserve/100)).toFixed(6));
  }
  return null;
}

export function sanitaryInputs(jobId:string):MeasurementInputDefinition[] {
  return [
    {id:'sealantModel',label:'Biały silikon do porównania',unit:'',inputType:'select',placeholder:'Wybierz model',defaultValue:0,min:0,max:1,required:false,
      options:[{value:0,label:'Soudal sanitarny 280 ml · ceramika, szkło, emalia'},{value:1,label:'Soudal Sanitarny STOP 280 ml · również akryl'}],
      hint:'Różne produkty i osobne oferty. Do kamienia naturalnego, PVC i wrażliwych metali dobierz inny uszczelniacz zgodnie z kartą producenta.'},
    {id:'sealantWidthMm',label:'Szerokość wypełnienia silikonem',unit:'mm',inputType:'dimension',placeholder:'5',defaultValue:5,min:5,max:30,required:false,
      hint:'Wymiary powinny wynikać z wykonanej szczeliny i karty produktu. Przyjmujemy prostokątny przekrój, domyślnie 5 × 5 mm; zalecane proporcje producenta 2:1. Głęboka szczelina wymaga sznura podpierającego.'},
    {id:'sealantDepthMm',label:'Głębokość wypełnienia silikonem',unit:'mm',inputType:'dimension',placeholder:'5',defaultValue:5,min:5,max:30,required:false,
      hint:'Podaj głębokość samego silikonu, po zastosowaniu sznura podpierającego, jeśli jest potrzebny. Nie liczymy całej pustki pod spoiną.'},
    {id:'sealantReservePercent',label:'Zapas na aplikację i odcięcia',unit:'%',inputType:'percent',placeholder:'10',defaultValue:10,min:0,max:30,required:false,
      hint:'Jawne założenie zakupowe: domyślnie 10% dla silikonu i taśmy. Pełne kartusze i rolki dobieramy dopiero po zsumowaniu prac.'},
    {id:'sealantTapeNeeded',label:'Taśma do prostych krawędzi',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:1,min:0,max:1,required:false,
      options:[{value:1,label:'Dolicz taśmę po obu stronach spoiny'},{value:0,label:'Nie potrzebuję taśmy w tym zestawie'}]},
    {id:'sealantTapeModel',label:'Model taśmy maskującej',unit:'',inputType:'select',placeholder:'Wybierz model',defaultValue:0,min:0,max:1,required:false,
      options:[{value:0,label:'Blue Dolphin niebieska 30 mm × 50 m'},{value:1,label:'Blue Dolphin niebieska 38 mm × 50 m'}],hint:'Porównujemy wybraną szerokość. Długość taśmy to dwie krawędzie spoiny plus podany zapas.'},
    {id:'sealantRemoverPacks',label:'Soudal Silicone Remover 100 ml — opakowania',unit:'szt.',inputType:'count',placeholder:'1',defaultValue:1,min:0,max:20,required:false,
      hint:'Preparat służy do resztek po mechanicznym usunięciu starej spoiny. Podaj liczbę opakowań; 0 jeśli go nie potrzebujesz. Nie zgadujemy wydajności żelu z metrów spoiny. Na tworzywach najpierw wykonaj próbę.'},
  ];
}

export function sanitaryMaterials(jobId:string,m:MeasurementMap={}):MaterialItem[] {
  const refs=sanitaryReferences(m);
  const make=(id:string,reference:string|null,formulaKey:string,ean:string,notes:string):MaterialItem=>{
    const ref=MATERIAL_PRICES.find(row=>row.id===reference)??MATERIAL_PRICES.find(row=>row.id===(id==='silicone-remover'?REMOVER_REFERENCE:id===sanitaryTapeId(jobId)?'mat-masking-tape-bluedolphin-30mm':SANITARY_REFERENCE))!;
    return{id,name:ref.productLabel,brand:ref.brand,ean,sourceUrl:ref.sourceUrl,unit:ref.packageUnit,category:ref.materialType,formulaKey,pricePerUnit:ref.pricePerPackage,priceBasis:'package',wasteFactor:1,
      packaging:{size:ref.packageSize,label:`${ref.packageSize} ${ref.packageUnit}`,purchaseUnit:id===sanitaryTapeId(jobId)?'rolka':id==='silicone-remover'?'opakowanie':'kartusz'},notes};
  };
  const silicone=make(sanitarySiliconeId(jobId),refs.silicone,`sanitary:${jobId}:${sanitarySiliconeId(jobId)}`,(m.sealantModel??0)===1?'5411183200326':'5411183157064',
    'Biały, wybrany model 280 ml. Ilość = długość × szerokość × głębokość przekroju prostokątnego + jawny zapas; 1 m × 1 mm × 1 mm = 1 ml. O zgodności z podłożem decyduje karta produktu.');
  const remover=make('silicone-remover',REMOVER_REFERENCE,`sanitary:${jobId}:silicone-remover`,'5411183041899','Soudal Silicone Remover 100 ml, żel do resztek utwardzonego silikonu; nie spray Sealant Remover. Liczba opakowań wpisana osobno. Najpierw usuń mechanicznie starą spoinę; na resztki nałóż żel na 10–15 minut zgodnie z kartą, zrób próbę na tworzywie.');
  const tape=make(sanitaryTapeId(jobId),refs.tape,`sanitary:${jobId}:${sanitaryTapeId(jobId)}`,(m.sealantTapeModel??0)===1?'5907758507285':'5907758515952','Wybrany model i szerokość. Dwie krawędzie spoiny × długość + ten sam jawny zapas. We wspólnym koszyku sumujemy metry przed doborem rolek 50 m.');
  return jobId==='silicone-refresh'?[remover,silicone,tape]:[silicone,remover,tape];
}

export const isSanitaryMaterial=(jobId:string,id:string)=>isSanitaryJob(jobId)&&[sanitarySiliconeId(jobId),'silicone-remover',sanitaryTapeId(jobId)].includes(id);
export function reviewSanitaryCalculation(calc:CalculationResult|undefined):CalculationResult|undefined {
  if(!calc||!isSanitaryJob(calc.jobId)||calc.quantityModel===SANITARY_MODEL)return calc;
  const materials=calc.materials.map(line=>isSanitaryMaterial(calc.jobId,line.material.id)?{...line,quantityKnown:false}:line);
  for(const material of sanitaryMaterials(calc.jobId))if(!materials.some(row=>row.material.id===material.id))materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
  return{...calc,materials,quantityIssues:materials.filter(row=>row.quantityKnown===false).map(row=>row.material.name)};
}
export const reviewSanitaryProject=(project:Project):Project=>isSanitaryJob(project.jobId)&&project.calculationResult?{...project,calculationResult:reviewSanitaryCalculation(project.calculationResult)}:project;

export function reviewSanitaryShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[] {
  if(!calc||!isSanitaryJob(calc.jobId))return[...items];
  return items.flatMap(item=>{
    if(item.itemType!=='material'||!isSanitaryMaterial(calc.jobId,item.materialId))return item;
    const line=calc.materials.find(row=>row.material.id===item.materialId),required=sanitaryQuantity(calc.jobId,item.materialId,calc.measurements);
    if(calc.quantityModel!==SANITARY_MODEL||!line||line.quantityKnown===false||required===null)return{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false};
    if(required===0)return[];
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=required;
    return{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:required,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes};
  });
}
