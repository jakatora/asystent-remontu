import type {CalculationResult,MaterialItem,Project,ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';

export const PLASTER_JOB='wall-plastering';
export const PLASTER_MODEL='wall-plastering-v1';
const IDS=['plaster-base','plaster-primer','plaster-corner','plaster-mesh'];
export const isPlasterMaterial=(job:string,id:string)=>job===PLASTER_JOB&&IDS.includes(id);
const BASES=['','mat-plaster-gypsum-machine-knauf-mp75-25kg','mat-plaster-gypsum-manual-knauf-goldband-25kg','mat-plaster-cementlime-baumit-mpi25-30kg'];
export function plasterReference(id:string,m:MeasurementMap={}):string|null{
  if(id==='plaster-base')return Number.isInteger(m.plasterSystem)?BASES[m.plasterSystem]||null:null;
  if(id==='plaster-primer')return m.plasterPrimerChoice===1&&[1,2].includes(m.plasterSystem)?'mat-plaster-primer-knauf-betokontakt-5kg':null;
  if(id==='plaster-mesh')return m.plasterMeshChoice===1&&[1,2].includes(m.plasterSystem)?'mat-plaster-mesh-knauf-profix-50m2':null;
  if(id==='plaster-corner')return m.plasterCornerFit===1?'mat-plaster-corner-alu-mesh-25m':null;
  return null;
}
const valid=(n:number|undefined,min:number,max:number):n is number=>Number.isFinite(n)&&n!>=min&&n!<=max;
const fixed=(n:number)=>Number(n.toFixed(8));
// source: https://knauf.com/api/download-center/v1/assets/6602d6e6-07ff-4657-b150-7f81c1ed40c4?download=true
// source: https://knauf.com/api/download-center/v1/assets/2c71e1e0-2050-4334-a0ef-712579cd9dc9?country=pl&download=true&locale=pl-PL
// source: https://baumit.pl/files/pl/pdf_files/pds_mpi_25_bpl_pl_13202.pdf
// source: https://knauf.com/api/download-center/v1/assets/c3040106-6435-4ba9-bc4d-1d22ed5451ed?download=true
// source: https://knauf.com/api/download-center/v1/assets/b839a52b-89ad-4679-8a6e-33ce1c23399a?country=pl&download=true
export function plasterQuantity(id:string,m:MeasurementMap):number|null{
  if(!IDS.includes(id)||!valid(m.wallArea,1,500))return null;
  const reserve=m.plasterReservePercent??10;
  if(!valid(reserve,0,30))return null;
  const factor=1+reserve/100;
  if(id==='plaster-base'){
    const system=m.plasterSystem,thickness=m.plasterThickness??10;
    const finish=m.plasterFinish??0;
    const minimum=system===3?10:(m.plasterMeshArea??0)>0?15:finish===1?10:8;
    if(![0,1].includes(finish)||!plasterReference(id,m)||!valid(thickness,minimum,system===3?25:30))return null;
    return fixed(m.wallArea*thickness/10*([0,10,8.5,14][system])*factor);
  }
  if(id==='plaster-primer'){
    if(m.plasterPrimerChoice===2)return 0;
    return plasterReference(id,m)?fixed(m.wallArea*0.225*factor):null;
  }
  if(id==='plaster-mesh'){
    if(!valid(m.plasterMeshArea,0,m.wallArea))return null;
    if(m.plasterMeshArea===0)return 0;
    // Manufacturer's 1.1 covers overlaps. Do not add the shopping reserve twice.
    return plasterReference(id,m)&&valid(m.plasterThickness??10,15,30)?fixed(m.plasterMeshArea*1.1):null;
  }
  if(!Number.isSafeInteger(m.plasterCornerCount)||!valid(m.plasterCornerCount,0,1000))return null;
  if(m.plasterCornerCount===0)return 0;
  return plasterReference(id,m)?fixed(m.plasterCornerCount*2.5):null;
}
const labels:Record<string,string>={'plaster-base':'Tynk — wybierz konkretny produkt','plaster-primer':'Przygotowanie podłoża — dobierz grunt','plaster-mesh':'Siatka zbrojąca — zmierz potrzebny obszar','plaster-corner':'Narożniki tynkarskie — policz listwy i sprawdź dopasowanie'};
export function plasterMaterials(m:MeasurementMap={}):MaterialItem[]{
  return IDS.map(id=>{
    const ref=MATERIAL_PRICES.find(r=>r.id===plasterReference(id,m));
    if(!ref)return{id,name:labels[id],unit:id==='plaster-primer'||id==='plaster-base'?'kg':id==='plaster-mesh'?'m2':'m',formulaKey:'plastering:'+id,pricePerUnit:0};
    const photo=PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id));
    return{id,name:ref.productLabel,brand:ref.brand,ean:photo?.ean,sourceUrl:ref.sourceUrl,imageUrl:photo?.imageUrl,unit:ref.packageUnit,category:ref.materialType,formulaKey:'plastering:'+id,pricePerUnit:ref.pricePerPackage,priceBasis:'package',packaging:{size:ref.packageSize,label:`${ref.packageSize} ${ref.packageUnit}`,purchaseUnit:id==='plaster-base'?'worek':id==='plaster-primer'?'wiadro':id==='plaster-mesh'?'rolka':'listwa'},notes:ref.notes};
  });
}
export const plasterInputs:MeasurementInputDefinition[]=[
  {id:'plasterFinish',label:'Planowane wykończenie tynku',unit:'',inputType:'select',placeholder:'Wybierz wykończenie',min:0,max:1,defaultValue:0,required:false,options:[{value:0,label:'Malowanie, tapeta lub gładź'},{value:1,label:'Płytki ceramiczne'}],hint:'Pod płytki gipsowy Knauf musi mieć co najmniej 10 mm; powierzchni nie wygładzaj i nie zacieraj. Dobierz ciężar okładziny i hydroizolację do całego systemu. Zbrojenie siatką wymaga minimum 15 mm niezależnie od wykończenia.'},
  {id:'plasterSystem',label:'Tynk dopasowany do pomieszczenia i sposobu pracy',unit:'',inputType:'select',placeholder:'Wybierz system',min:0,max:3,defaultValue:0,required:false,options:[{value:0,label:'Jeszcze dobieram tynk'},{value:1,label:'Knauf MP 75 25 kg — maszynowo'},{value:2,label:'Knauf Goldband 25 kg — ręcznie'},{value:3,label:'Baumit MPI 25 30 kg — cementowo-wapienny'}],hint:'Tynk i grunt dobieramy według zastosowania, nie poziomu ceny. MP 75: ok. 10 kg/m²/10 mm, Goldband: 8,5 kg, MPI 25: 14 kg. Dla gipsowych sprawdź warunki wilgotności i wykończenie. MPI 25 na ścianie: 10–25 mm; tutaj gipsowe: 8–30 mm.'},
  {id:'plasterPrimerChoice',label:'Podłoże i grunt pod wybrany tynk',unit:'',inputType:'select',placeholder:'Sprawdź podłoże',min:0,max:2,defaultValue:0,required:false,options:[{value:0,label:'Podłoże lub przygotowanie do ustalenia'},{value:1,label:'Gładki niechłonny beton pod tynk Knauf — Betokontakt 5 kg'},{value:2,label:'Podłoże już prawidłowo przygotowane — bez zakupu gruntu'}],hint:'Betokontakt liczymy w kilogramach: ok. 0,225 kg/m². Nie dobieramy go do chłonnego muru ani automatycznie do Baumit. Tam dobierz przygotowanie zgodnie z kartą tynku; brak wyboru pozostaje widoczny w kosztorysie. Betokontakt: minimum 12 h schnięcia w odpowiednich warunkach.'},
  {id:'plasterReservePercent',label:'Zapas tynku i gruntu',unit:'%',inputType:'count',placeholder:'10',defaultValue:10,min:0,max:30,required:false,hint:'Założenie zakupowe ponad zużycie orientacyjne producenta. Opakowania zaokrąglamy po zsumowaniu zapotrzebowania we wspólnym koszyku.'},
  {id:'plasterMeshArea',label:'Powierzchnia wymagająca zbrojenia siatką',unit:'m²',inputType:'area',placeholder:'0, jeśli siatka nie jest potrzebna lub już ją masz',min:0,max:500,required:true,hint:'Zmierz obszary zbrojenia, uwzględniając wyjście poza styk materiałów według karty systemu. Nie zakładamy siatki na całej ścianie. Do wskazanej powierzchni dodajemy 10% na zakłady; nie dodajemy ponownie zapasu tynku.'},
  {id:'plasterMeshChoice',label:'Siatka do zbrojenia tynku',unit:'',inputType:'select',placeholder:'Dobierz do systemu',min:0,max:1,defaultValue:0,required:false,options:[{value:0,label:'Dobór siatki do ustalenia'},{value:1,label:'Knauf Profix 100 cm × 50 m — do wybranego tynku gipsowego'}],hint:'Rolka 50 m², oczko 10×10 mm, 110 g/m². Przy zbrojeniu gipsowego Knauf karta wymaga minimum 15 mm tynku. Aktualna karta Profix opisuje zastosowanie w tynkach gipsowych wewnątrz. Dodatnia ilość przy MPI 25 wymaga dobrania innego potwierdzonego rozwiązania.'},
  {id:'plasterCornerCount',label:'Całe listwy narożnikowe 2,5 m do kupienia',unit:'szt.',inputType:'count',placeholder:'Policz z planu docinek; 0, jeśli nie kupujesz',min:0,max:1000,required:true,hint:'Nie wyliczamy krawędzi z powierzchni ściany. Każdy narożnik musi dać się wykonać z wybranej listwy; dla wyższych krawędzi dobierz dłuższy produkt.'},
  {id:'plasterCornerFit',label:'Dopasowanie narożników',unit:'',inputType:'select',placeholder:'Sprawdź wybrany profil',min:0,max:1,defaultValue:0,required:false,options:[{value:0,label:'Jeszcze sprawdzę profil i plan docinek'},{value:1,label:'Potwierdzam profil aluminiowy z siatką 2,5 m do mojego tynku'}],hint:'Sprawdź zgodność materiału profilu, grubości tynku i warunków pomieszczenia. Nie traktujemy profilu elewacyjnego jako automatycznego zamiennika dowolnego narożnika tynkarskiego.'},
];
export function plasterInputVisible(job:string,id:string,m:Readonly<Record<string,string|number|undefined>>):boolean{
  return job!==PLASTER_JOB||!(id==='plasterMeshChoice'&&Number(m.plasterMeshArea)===0||id==='plasterCornerFit'&&Number(m.plasterCornerCount)===0);
}
export function withPlasterMeasurement(job:string,current:Readonly<Record<string,string>>,id:string,value:string|number):Record<string,string>{
  const next={...current,[id]:String(value)};
  if(job===PLASTER_JOB&&id==='plasterSystem'&&Number(current[id]??0)!==Number(value)){next.plasterPrimerChoice='0';next.plasterMeshChoice='0';next.plasterCornerFit='0';}
  return next;
}
export function reviewPlasterCalculation(calc:CalculationResult|undefined):CalculationResult|undefined{
  if(!calc||calc.jobId!==PLASTER_JOB||calc.quantityModel===PLASTER_MODEL)return calc;
  const materials=calc.materials.map(line=>isPlasterMaterial(calc.jobId,line.material.id)?{...line,quantityKnown:false}:line);
  return{...calc,materials,quantityIssues:materials.filter(l=>l.quantityKnown===false).map(l=>l.material.name)};
}
export const reviewPlasterProject=(project:Project):Project=>project.jobId===PLASTER_JOB?{...project,calculationResult:reviewPlasterCalculation(project.calculationResult)}:project;
export function reviewPlasterShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[]{
  if(calc?.jobId!==PLASTER_JOB)return[...items];
  return items.flatMap(item=>{
    if(item.itemType!=='material'||!isPlasterMaterial(calc.jobId,item.materialId))return[item];
    const line=calc.materials.find(l=>l.material.id===item.materialId),needed=plasterQuantity(item.materialId,calc.measurements);
    if(calc.quantityModel!==PLASTER_MODEL||!line||line.quantityKnown===false||needed===null)return[{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false}];
    if(needed===0)return[];
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=needed;
    return[{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:needed,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes}];
  });
}
