import type {CalculationResult,MaterialItem,Project,ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';

export const HARDWARE_JOB='kitchen-hardware';
export const HARDWARE_MODEL='cabinet-nyxa-128-v1';
export const isHardwareMaterial=(job:string,id:string)=>job===HARDWARE_JOB&&['cabinet-handles','longer-screws'].includes(id);
export const hardwareReference=(id:string,m:MeasurementMap={})=>id==='cabinet-handles'?(m.handleVariant===1?'mat-handle-gtv-nyxa-128-black':m.handleVariant===2?'mat-handle-gtv-nyxa-128-gold':null):null;
// One handle, two M4×22 screws included. Only the explicitly selected 128 mm
// variant is priced. Count is not faucet count and carries no default waste.
// source: https://gtv.com.pl/produkt/UZ-NYXA-128-20M/
// source: https://api2.gtv.com.pl/pimcore/assets/attachments/karta_produktowa/UZ-NYXA__PL-EN-UA-HU__uchwyt__KP.pdf
export function hardwareQuantity(id:string,m:MeasurementMap):number|null{
  if(!isHardwareMaterial(HARDWARE_JOB,id)||![1,2].includes(m.handleVariant!)||m.handleHolePitchMm!==128||!Number.isSafeInteger(m.handleCount)||m.handleCount!<1||m.handleCount!>100)return null;
  return id==='cabinet-handles'?m.handleCount!:[1,2].includes(m.handleScrewFit!)?0:null;
}
export function hardwareMaterials(m:MeasurementMap={}):MaterialItem[]{
  return ['cabinet-handles','longer-screws'].map(id=>{
    const ref=MATERIAL_PRICES.find(r=>r.id===hardwareReference(id,m)),photo=ref&&PRODUCT_PHOTOS.find(r=>r.ids.includes(ref.id));
    if(!ref)return{id,name:id==='cabinet-handles'?'Uchwyty — wybierz model i zmierz rozstaw':'Śruby — potwierdź pasowanie zestawu lub dobierz długość',unit:'szt',formulaKey:'hardware:'+id,pricePerUnit:0,wasteFactor:1,roundingRule:'none',notes:'Każdy NYXA zawiera dwie śruby M4×22. Potwierdź ich pasowanie do frontu i gwintu uchwytu lub posiadanie odpowiednich śrub. Inna długość wymaga osobnego doboru; brak danych nie oznacza darmowego kompletu.'};
    return{id,name:ref.productLabel,brand:ref.brand,ean:photo?.ean,imageUrl:photo?.imageUrl,sourceUrl:ref.sourceUrl,category:ref.materialType,unit:'szt',formulaKey:'hardware:'+id,pricePerUnit:ref.pricePerPackage,priceBasis:'package',wasteFactor:1,roundingRule:'none',packaging:{size:1,label:'1 uchwyt + 2 śruby M4×22',purchaseUnit:'szt'},notes:ref.notes};
  });
}
export const hardwareInputs:MeasurementInputDefinition[]=[
  {id:'handleCount',label:'Liczba uchwytów do wymiany',unit:'szt.',inputType:'count',placeholder:'np. 15',min:1,max:100,required:true,hint:'Policz potrzebne uchwyty. Jeden uchwyt to jedna sztuka; nie dodajemy automatycznego zapasu.'},
  {id:'handleVariant',label:'Uchwyty do porównania cen',unit:'',inputType:'select',placeholder:'Wybierz konkretny wariant',min:0,max:2,defaultValue:0,required:false,options:[{value:0,label:'Jeszcze wybieram uchwyty lub gałki'},{value:1,label:'GTV NYXA 128 mm — czarny mat'},{value:2,label:'GTV NYXA 128 mm — złoto szczotkowane'}],hint:'Każdy kolor zachowuje własny EAN i zdjęcie. Nie zamieniamy koloru ani rozstawu na tańszy. Oferta złota ma ograniczony zapas; koszt jej dostawy wymaga potwierdzenia.'},
  {id:'handleHolePitchMm',label:'Zmierzony rozstaw środków otworów',unit:'mm',inputType:'length',placeholder:'np. 128 — zmierz od środka do środka',min:1,max:1000,required:true,hint:'NYXA w tych wariantach ma rozstaw 128 mm i długość całkowitą 138 mm. To dwa różne wymiary. Inny rozstaw lub gałka z jednym otworem wymaga innego produktu.'},
  {id:'handleScrewFit',label:'Śruby i grubość frontu',unit:'',inputType:'select',placeholder:'Sprawdź długość śrub',min:0,max:3,defaultValue:0,required:false,options:[{value:0,label:'Jeszcze nie sprawdzono — zestaw niepełny'},{value:1,label:'Potwierdzam: śruby M4×22 z zestawu pasują'},{value:2,label:'Mam odpowiednie śruby M4 do tych uchwytów i frontów'},{value:3,label:'Potrzebuję śrub o innej długości — do doboru'}],hint:'Sprawdź grubość frontu i pasowanie śruby do gwintu uchwytu. Śruba nie może być za krótka ani opierać się o dno gwintu przed dociśnięciem uchwytu. Nie zakładamy pasowania wyłącznie na podstawie nazwy szafki.'},
];
export function reviewHardwareCalculation(calc:CalculationResult|undefined):CalculationResult|undefined{
  if(calc?.jobId!==HARDWARE_JOB)return calc;
  const definitions=hardwareMaterials(calc.measurements),materials=calc.materials.map(line=>{
    if(!isHardwareMaterial(calc.jobId,line.material.id))return line;
    const needed=hardwareQuantity(line.material.id,calc.measurements),def=definitions.find(r=>r.id===line.material.id);
    const identity=needed===0||Boolean(def?.ean&&'ean'in line.material&&line.material.ean===def.ean&&line.material.unit==='szt'&&line.material.packaging?.size===1);
    return calc.quantityModel===HARDWARE_MODEL&&needed!==null&&identity&&line.quantityKnown!==false&&Number.isFinite(line.rawQuantity)&&line.rawQuantity===needed?line:{...line,quantityKnown:false};
  });
  for(const material of definitions)if(!materials.some(r=>r.material.id===material.id)&&hardwareQuantity(material.id,calc.measurements)!==0)materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
  return{...calc,materials,quantityIssues:materials.filter(r=>r.quantityKnown===false).map(r=>r.material.name)};
}
export const reviewHardwareProject=(p:Project):Project=>p.jobId===HARDWARE_JOB?{...p,calculationResult:reviewHardwareCalculation(p.calculationResult)}:p;
export function reviewHardwareShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[]{
  if(calc?.jobId!==HARDWARE_JOB)return[...items];
  const reviewed=reviewHardwareCalculation(calc)!;
  return items.flatMap(item=>{
    if(item.itemType!=='material'||!isHardwareMaterial(calc.jobId,item.materialId))return[item];
    const line=reviewed.materials.find(r=>r.material.id===item.materialId),needed=hardwareQuantity(item.materialId,calc.measurements);
    if(!line||line.quantityKnown===false||needed===null)return[{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false}];
    if(needed===0)return[];
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)>=needed;
    return[{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:needed,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes}];
  });
}
