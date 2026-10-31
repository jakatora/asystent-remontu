import type {CalculationResult,MaterialItem,Project,ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import {cutRollArea,type CutRollDemand} from '../../../../lib/pricing-service/src/cut-rolls';

export const ROLLED_JOB='vinyl-glued',ROLLED_MODEL='rolled-vinyl-v1';
const IDS=['vinyl-roll','vinyl-adhesive','primer-vinyl','skirting-glued','roll-joint-work'];
export const isRolledMaterial=(job:string,id:string)=>job===ROLLED_JOB&&IDS.includes(id);
export function rolledMaterialMatches(actual:Pick<MaterialItem,'name'|'unit'|'brand'|'packaging'>,expected:MaterialItem):boolean {
 return actual.name===expected.name&&actual.unit===expected.unit&&actual.brand===expected.brand&&('sourceUrl'in actual?actual.sourceUrl:undefined)===expected.sourceUrl&&('ean'in actual?actual.ean:undefined)===expected.ean&&!('gtin'in actual&&actual.gtin)&&actual.packaging?.size===expected.packaging?.size;
}
const valid=(v:number|undefined,min:number,max:number):v is number=>Number.isFinite(v)&&v!>=min&&v!<=max;
export function rolledFloorArea(m:MeasurementMap):number|null {
  return valid(m.rollRoomLengthM,0.1,25)&&valid(m.rollRoomWidthM,0.1,25)&&m.rollRoomLengthM*m.rollRoomWidthM<=200?Number((m.rollRoomLengthM*m.rollRoomWidthM).toFixed(8)):null;
}
const rollWidth=(m:MeasurementMap)=>m.rollChoice===1?2000:m.rollChoice===2?4000:null;
export function rolledNeedsSeams(m:MeasurementMap):boolean {const width=rollWidth(m);return Boolean(width&&valid(m.rollRoomWidthM,0.1,25)&&m.rollRoomWidthM*1000+100>width);}
/** Manufacturer proposes 10 cm added to EACH dimension, not 10% of floor area.
 * Multi-strip layouts require the actual repeat/overlap plan, never guessed seams.
 * source: https://www.lentexflooring.com/wp-content/uploads/2016/04/Instrukcja-montazu-i-uzytkowania-wykladziny-2026-PL.pdf */
export function rolledDemand(m:MeasurementMap):CutRollDemand|null {
  const width=rollWidth(m);if(!width||rolledFloorArea(m)===null)return null;
  const length=Math.ceil((m.rollRoomLengthM!*1000+100)/10-1e-9)*10;
  if(!rolledNeedsSeams(m))return length<=25000?{version:1,widthMm:width,cuts:[{id:'room',lengthMm:length}]}:null;
  const count=m.rollStripCount,cutLength=m.rollStripLengthM;
  if(m.rollLayoutFit!==1||!Number.isInteger(count)||!valid(count,2,100)||!valid(cutLength,0.1,25)||cutLength*1000+1e-7<length||count*width<m.rollRoomWidthM!*1000+100)return null;
  const mm=Math.ceil(cutLength*100-1e-9)*10;
  return{version:1,widthMm:width,cuts:Array.from({length:count},(_,i)=>({id:String(i),lengthMm:mm}))};
}
export function rolledReference(id:string,m:MeasurementMap={}):string|null {
  if(id==='vinyl-roll')return m.rollChoice===1?'mat-roll-orion514-ewinyl-2m':m.rollChoice===2?'mat-roll-orion514-ewinyl-4m':null;
  return id==='vinyl-adhesive'?m.rollAdhesiveChoice===1?'mat-vinyl-adhesive-soudal-26a-5kg':m.rollAdhesiveChoice===3?'mat-vinyl-adhesive-tytan-osakryl-4kg':null:null;
}
export function rolledQuantity(id:string,m:MeasurementMap):number|null {
  const area=rolledFloorArea(m);if(area===null)return null;
  if(id==='vinyl-roll'){const demand=rolledDemand(m);return demand?cutRollArea(demand):null;}
  if(id==='vinyl-adhesive'){
    if(m.rollAdhesiveChoice===2)return 0;
    // Use this product's range, not the flooring maker's generic A1/A2 example.
    // source: https://www.soudal.pl/sites/default/files/soudal_api/document/F0039177_0001.pdf
    const amount=m.rollAdhesiveChoice===1?m.rollAdhesiveGm2??600:m.rollAdhesiveGm2,range=m.rollAdhesiveChoice===1?[400,600]:m.rollAdhesiveChoice===3?[300,1700]:null;
    return range&&m.rollAdhesiveFit===1&&valid(amount,range[0],range[1])&&valid(m.rollAdhesiveReserve??5,0,15)?Number((area*amount/1000*(1+(m.rollAdhesiveReserve??5)/100)).toFixed(8)):null;
  }
  if(id==='primer-vinyl')return m.rollPreparation===1?0:null;
  if(id==='skirting-glued')return m.rollSkirting===1?0:null;
  if(id==='roll-joint-work')return !rolledNeedsSeams(m)||m.rollJointReady===1?0:null;
  return null;
}
const labels:Record<string,string>={'vinyl-roll':'Wykładzina rolowa — wybierz produkt i obmiar','vinyl-adhesive':'Klej do wykładziny — dobierz do podłoża','primer-vinyl':'Przygotowanie i gruntowanie podłoża — do ustalenia','skirting-glued':'Listwy, cokoły i mocowania — do ustalenia','roll-joint-work':'Sznur i spawanie pasów wykładziny — do ustalenia'};
export function rolledMaterials(m:MeasurementMap={}):MaterialItem[]{return IDS.map(id=>{
  const ref=MATERIAL_PRICES.find(r=>r.id===rolledReference(id,m));
  if(!ref)return{id,name:labels[id],unit:'pozycja',formulaKey:'rolled:'+id,pricePerUnit:0,wasteFactor:1};
  return{id,name:ref.productLabel,brand:ref.brand,ean:PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id))?.ean,sourceUrl:ref.sourceUrl,category:ref.materialType,unit:ref.packageUnit,priceBasis:id==='vinyl-roll'?'unit':'package',pricePerUnit:ref.pricePerPackage,wasteFactor:1,formulaKey:'rolled:'+id,packaging:{size:ref.packageSize,label:id==='vinyl-roll'?'m² rozliczeniowy':`wiadro ${ref.packageSize} kg`,purchaseUnit:id==='vinyl-roll'?'odcinek':'wiadro'},notes:ref.notes};
});}
export const rolledInputs:MeasurementInputDefinition[]=[
 {id:'rollChoice',label:'Wykładzina z rolki',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:2,options:[{value:0,label:'Jeszcze wybieram — bez podstawiania paneli'},{value:1,label:'Lentex Orion 514-05 — szerokość 2 m (eWinyl)'},{value:2,label:'Lentex Orion 514-05 — szerokość 4 m (eWinyl)'}],hint:'Cena sklepu jest za m². Kupujesz pełną szerokość i zamówioną długość, a nie paczki paneli. Model i szerokość nie zmieniają się wraz z poziomem cenowym.'},
 {id:'rollRoomLengthM',label:'Długość pokoju w kierunku rozwijania wykładziny',unit:'m',inputType:'length',min:0.1,max:25,placeholder:'Zmierz największy wymiar w tym kierunku',hint:'Prostokąt bez wywinięcia na ściany. Dodajemy 10 cm do długości i szerokości na docinki. Uwzględnij wnęki w pomiarze; dla złożonego kształtu przygotuj osobny plan pasów.'},
 {id:'rollRoomWidthM',label:'Szerokość pokoju w poprzek pasów',unit:'m',inputType:'length',min:0.1,max:25,placeholder:'Zmierz największą szerokość',hint:'Jeśli rolka mieści cały wymiar z zapasem, wystarczy jeden pas. Kierunek nadruku wybierasz tymi wymiarami; nie obracamy wzoru automatycznie dla niższej ceny.'},
 {id:'rollStripCount',label:'Liczba pasów z planu dopasowania wzoru',unit:'szt.',inputType:'count',min:2,max:100,required:false,placeholder:'Podaj liczbę, łącznie z zakładami',hint:'Pokój jest szerszy od wybranej rolki. Policz pasy, zakłady i szwy z planu; nie łączymy przypadkowych resztek szerokości.'},
 {id:'rollStripLengthM',label:'Długość każdego pasa z docinką i dopasowaniem wzoru',unit:'m',inputType:'length',min:0.1,max:25,required:false,placeholder:'Długość z planu, z raportem nadruku',hint:'Dotyczy pasów o tej samej długości. Zaokrąglamy w górę do 1 cm. Podana długość musi mieścić długość pokoju i 10 cm docinki.'},
 {id:'rollLayoutFit',label:'Sprawdzenie planu pasów',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Plan wymaga jeszcze sprawdzenia'},{value:1,label:'Potwierdzam pokrycie, kierunek wzoru, dopasowanie i szwy'}]},
 {id:'rollJointReady',label:'Materiały i wykonanie łączeń pasów',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Pozostaw do doboru i wyceny'},{value:1,label:'Mam dobrany sznur i zapewnione spawanie zgodne z instrukcją'}],hint:'Instrukcja wykładziny obiektowej wymaga spawania na gorąco. Nie doliczamy przypadkowej taśmy ani kleju do szwów.'},
 {id:'rollAdhesiveChoice',label:'Klej do pełnego przyklejenia wykładziny',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:3,options:[{value:0,label:'Klej trzeba dobrać'},{value:1,label:'Kupuję Soudal 26A — wiadro 5 kg'},{value:2,label:'Mam całą potrzebną ilość właściwego kleju'},{value:3,label:'Kupuję Tytan Osakryl uniwersalny — wiadro 4 kg'}]},
 {id:'rollAdhesiveFit',label:'Zgodność kleju i podłoża',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Sprawdzam warunki użycia'},{value:1,label:'Potwierdzam zgodność wykładziny, porowatego podłoża i warunków montażu'}],hint:'26A wymaga co najmniej jednej powierzchni porowatej. Sprawdź aktualną kartę kleju i instrukcję wykładziny, także ogrzewanie oraz warunki wilgotnościowe.'},
 {id:'rollAdhesiveGm2',label:'Zużycie wybranego kleju według dobranej pacy',unit:'g/m²',inputType:'dimension',placeholder:'Ustal według karty i warunków montażu',min:300,max:1700,hint:'Soudal 26A: 400–600 g/m². Osakryl: producent podaje 300–1700 g/m² zależnie od elementów — wpisz zużycie ustalone dla PVC i dobranej pacy A2/A3. Nie przyjmujemy automatycznie węższego zakresu z opisu sklepu. Klej liczymy na podłogę, nie na odpad wykładziny.'},
 {id:'rollAdhesiveReserve',label:'Dodatkowa rezerwa zakupowa kleju',unit:'%',inputType:'dimension',placeholder:'Wpisz wartość',defaultValue:5,min:0,max:15,hint:'To wybrana rezerwa planowania, naliczana raz, poza zużyciem producenta. Pełne wiadra zaokrąglamy po połączeniu pomieszczeń.'},
 {id:'rollPreparation',label:'Przygotowanie podłoża',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Naprawę, wyrównanie lub grunt trzeba jeszcze dobrać'},{value:1,label:'Podłoże jest przygotowane zgodnie z instrukcjami — bez nowych zakupów'}]},
 {id:'rollSkirting',label:'Listwy, cokoły i mocowania',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Pozostaw do ustalenia — dodam osobną pracę do koszyka'},{value:1,label:'Mam całe wykończenie lub nie wymaga nowych zakupów'}]},
];
export function rolledInputVisible(job:string,id:string,m:Readonly<Record<string,string|number|undefined>>):boolean {
 if(job!==ROLLED_JOB)return true;if(id==='floorArea'||id==='perimeter')return false;
 if(['rollStripCount','rollStripLengthM','rollLayoutFit','rollJointReady'].includes(id))return rolledNeedsSeams(Object.fromEntries(Object.entries(m).map(([k,v])=>[k,Number(String(v).replace(',','.'))])));
 if(['rollAdhesiveFit','rollAdhesiveGm2','rollAdhesiveReserve'].includes(id))return [1,3].includes(Number(m.rollAdhesiveChoice));
 return true;
}
export function withRolledMeasurement(current:Readonly<Record<string,string>>,id:string,value:string|number):Record<string,string>{
 const next={...current,[id]:String(value)},num=(v:string|number|undefined)=>Number(String(v??'').replace(',','.'));
 if(id==='rollAdhesiveChoice'&&num(current[id])!==num(value)){next.rollAdhesiveFit='0';next.rollAdhesiveGm2=num(value)===1?'600':'';}
 if(['rollChoice','rollRoomLengthM','rollRoomWidthM'].includes(id)&&num(current[id])!==num(value)){
  next.rollLayoutFit='0';next.rollJointReady='0';next.rollAdhesiveFit='0';next.rollPreparation='0';next.rollSkirting='0';
  if(current.rollAdhesiveChoice==='2')next.rollAdhesiveChoice='0';
 }
 if(['rollStripCount','rollStripLengthM'].includes(id)&&num(current[id])!==num(value))next.rollLayoutFit='0';
 return next;
}
export function rolledWarnings(lines:readonly{quantityKnown?:boolean}[]){const n=lines.filter(l=>l.quantityKnown===false).length;return n?[{condition:'always' as const,level:'warning' as const,message:`Niepełna wycena wykładziny rolowej: ${n} pozycji wymaga obmiaru, doboru lub potwierdzenia istniejących materiałów.`}]:[];}
export function reviewRolledCalculation(calc:CalculationResult|undefined):CalculationResult|undefined {
 if(!calc||calc.jobId!==ROLLED_JOB)return calc;
 const defs=rolledMaterials(calc.measurements),materials=calc.materials.map(line=>{
  if(!isRolledMaterial(calc.jobId,line.material.id))return line;const def=defs.find(d=>d.id===line.material.id)!,n=rolledQuantity(def.id,calc.measurements);
  const exact=n===0||rolledMaterialMatches(line.material,def);
  return calc.quantityModel===ROLLED_MODEL&&n!==null&&exact&&Number.isFinite(line.rawQuantity)&&Math.abs(line.rawQuantity!-n)<1e-7?line:{...line,quantityKnown:false};
 });
 for(const material of defs)if(!materials.some(l=>l.material.id===material.id))materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
 return{...calc,materials,quantityIssues:materials.filter(l=>l.quantityKnown===false).map(l=>l.material.name),warnings:[...calc.warnings.filter(w=>!w.message.startsWith('Niepełna wycena wykładziny rolowej:')),...rolledWarnings(materials)]};
}
export const reviewRolledProject=(p:Project):Project=>p.jobId===ROLLED_JOB?{...p,calculationResult:reviewRolledCalculation(p.calculationResult)}:p;
export function reviewRolledShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[]{
 if(calc?.jobId!==ROLLED_JOB)return[...items];
 return items.flatMap(item=>{
  if(item.itemType!=='material'||!isRolledMaterial(calc.jobId,item.materialId))return[item];const line=calc.materials.find(l=>l.material.id===item.materialId),n=rolledQuantity(item.materialId,calc.measurements);
  if(calc.quantityModel!==ROLLED_MODEL||!line||line.quantityKnown===false||n===null)return[{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false}];
  if(n===0)return[];
  const same=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=n;
  return[{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,requiredQuantity:n,estimatedPrice:line.cost,quantityKnown:true,needsQuantityConfirmation:!same,owned:same&&item.owned,purchased:same&&item.purchased,notes:line.material.notes}];
 });
}
