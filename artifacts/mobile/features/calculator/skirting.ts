import type {CalculationResult,MaterialItem,Project,ShoppingItem} from '@/types/domain';
import type {MeasurementInputDefinition} from '@/types/engine';
import type {MeasurementMap} from '@/types/calculator';
import {MATERIAL_PRICES} from '@/data/prices/materials';

export const SKIRTING_JOB='skirting-boards';
export const SKIRTING_MODEL='skirting-indo-v1';
export const SKIRTING_IDS=['skirting','corner-inside','skirting-corner-outside','skirting-connectors','skirting-endcaps','skirting-glue','skirting-fixings'] as const;
const refs:Record<string,[string,string]>={
 skirting:['mat-skirting-arbiton-2500','5905167725719'],
 'corner-inside':['mat-indo-inside-gloss-2','5905167726037'],
 'skirting-corner-outside':['mat-indo-outside-gloss-2','5905167726198'],
 'skirting-connectors':['mat-indo-connector-gloss-2','5905167725870'],
 'skirting-endcaps':['mat-indo-endcaps-gloss-pair','5905167726358'],
 'skirting-glue':['mat-strongman-300ml','5905167788264'],
};
export const isSkirtingMaterial=(job:string,id:string)=>job===SKIRTING_JOB&&[...SKIRTING_IDS,'corner-pieces','silicone-skirting'].includes(id as typeof SKIRTING_IDS[number]);
export function skirtingReference(id:string,m:MeasurementMap={}):string|null {
 if(m.skirtingSystem!==1||id==='skirting-glue'&&m.skirtingMounting!==1)return null;
 return refs[id]?.[0]??null;
}
const whole=(n:unknown,max=200):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=max;
export function skirtingEndcapDemand(m:MeasurementMap):{version:1;left:number;right:number}|null {
 return m.skirtingSystem===1&&whole(m.skirtingEndLeft)&&whole(m.skirtingEndRight)?{version:1,left:m.skirtingEndLeft,right:m.skirtingEndRight}:null;
}
/** A per-room purchase takeoff with explicit waste; not a global cutting optimizer. */
export function skirtingPieces(m:MeasurementMap):number|null {
 const length=m.perimeter,reserve=m.skirtingReservePercent??10,extra=m.skirtingExtraPieces??0;
 if(!Number.isFinite(length)||length<0.5||length>200||!Number.isFinite(reserve)||reserve<0||reserve>30||!whole(extra))return null;
 return Math.ceil(length*(1+reserve/100)/2.5-1e-10)+extra;
}
// source: https://topboden.pl/files/0PeVEtM3BdxD3EXs.pdf
// source: https://topboden.pl/files/gLzn06xW67cMmUsA.pdf
// source: https://arbiton.com/pl/klej-montazowy-strongman-300ml
export function skirtingQuantity(id:string,m:MeasurementMap):number|null {
 if(m.skirtingSystem!==1)return null;
 if(id==='skirting'){
  const pieces=skirtingPieces(m);return pieces!==null&&m.skirtingLayoutFit===1?pieces*2.5:null;
 }
 const counts:Record<string,string>={'corner-inside':'skirtingInside','skirting-corner-outside':'skirtingOutside','skirting-connectors':'skirtingConnectors'};
 if(counts[id])return whole(m[counts[id]])?m[counts[id]]:null;
 if(id==='skirting-endcaps'){const p=skirtingEndcapDemand(m);return p?Math.max(p.left,p.right):null;}
 if(id==='skirting-glue'||id==='skirting-fixings'){
  if(![1,2].includes(m.skirtingMounting)||m.skirtingMountFit!==1)return null;
  if(id==='skirting-fixings'||m.skirtingMounting===2)return 0;
  return whole(m.skirtingGlueCartridges,100)&&m.skirtingGlueCartridges>0?m.skirtingGlueCartridges*300:null;
 }
 return null;
}
const unknown:Record<string,string>={skirting:'Listwy — wybierz model i sprawdź plan docinek','corner-inside':'Narożniki wewnętrzne — policz miejsca','skirting-corner-outside':'Narożniki zewnętrzne — policz miejsca','skirting-connectors':'Łączniki proste — policz połączenia','skirting-endcaps':'Zakończenia lewe i prawe — policz osobno','skirting-glue':'Klej — wybierz sposób mocowania','skirting-fixings':'Materiały montażowe — dobierz do ściany'};
export function skirtingMaterials(m:MeasurementMap={}):MaterialItem[]{
 return SKIRTING_IDS.map(id=>{const refId=skirtingReference(id,m),ref=MATERIAL_PRICES.find(r=>r.id===refId);
  return ref?{id,name:ref.productLabel,ean:refs[id][1],brand:ref.brand,unit:ref.packageUnit,category:ref.materialType,formulaKey:'skirting-v1:'+id,wasteFactor:1,pricePerUnit:ref.pricePerPackage,priceBasis:'package' as const,packaging:{size:ref.packageSize,label:`${ref.packageSize} ${ref.packageUnit}`,purchaseUnit:id==='skirting'?'listwa':id==='skirting-glue'?'kartusz':'opakowanie'},sourceUrl:ref.sourceUrl,notes:ref.notes}
   :{id,name:unknown[id],unit:id==='skirting'?'mb':id==='skirting-glue'?'ml':id==='skirting-endcaps'?'kpl':'szt',formulaKey:'skirting-v1:'+id,wasteFactor:1,pricePerUnit:0};});
}
export const skirtingInputs:MeasurementInputDefinition[]=[
 {id:'skirtingSystem',label:'Model listew',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,required:false,options:[{value:0,label:'Jeszcze nie wiem — dobiorę listwy'},{value:1,label:'Arbiton INDO 70 mm, biały połysk 01, 2,5 m'}],hint:'Wspólny system listew i czterech rodzajów akcesoriów. Inny kolor lub seria wymaga osobnego doboru. TopBoden sprzedaje listwy w partiach po 10 sztuk (25 m).'},
 {id:'skirtingInside',label:'Narożniki wewnętrzne',unit:'szt',inputType:'count',placeholder:'np. 4; wpisz 0, jeśli nie ma',min:0,max:200},
 {id:'skirtingOutside',label:'Narożniki zewnętrzne',unit:'szt',inputType:'count',placeholder:'np. 0',min:0,max:200},
 {id:'skirtingConnectors',label:'Łączenia listew na prostej ścianie',unit:'szt',inputType:'count',placeholder:'np. 2',min:0,max:200,hint:'Policz styki dwóch odcinków listew. Nie wyliczamy ich z liczby narożników. Gotowe elementy są sprzedawane po 2 sztuki.'},
 {id:'skirtingEndLeft',label:'Zakończenia lewe',unit:'szt',inputType:'count',placeholder:'np. 1',min:0,max:200,hint:'Policz strony przy drzwiach i końcach listew. Opakowanie zawiera jedno lewe i jedno prawe zakończenie; potrzebne strony połączymy między pomieszczeniami.'},
 {id:'skirtingEndRight',label:'Zakończenia prawe',unit:'szt',inputType:'count',placeholder:'np. 1',min:0,max:200},
 {id:'skirtingLayoutFit',label:'Plan docinek i połączeń',unit:'',inputType:'select',placeholder:'Sprawdź odcinki ścian',defaultValue:0,min:0,max:1,required:false,options:[{value:0,label:'Plan docinek wymaga sprawdzenia'},{value:1,label:'Sprawdzony — wyliczone odcinki i łączniki wystarczą'}],hint:'Z długości netto i domyślnych 10% zapasu liczymy pełne listwy 2,5 m dla tej pracy. Sprawdź odcinki ścian, grubość cięcia i łączniki. Jeśli potrzeba więcej sztuk, dodaj je w założeniach. Nie planujemy automatycznie rozkroju ani ponownego użycia resztek między pomieszczeniami.'},
 {id:'skirtingMounting',label:'Mocowanie do ściany',unit:'',inputType:'select',placeholder:'Dobierz mocowanie',defaultValue:0,min:0,max:2,required:false,options:[{value:0,label:'Dobór mocowania do podłoża jeszcze przede mną'},{value:1,label:'Klej Arbiton Strongman 300 ml'},{value:2,label:'Mam komplet materiałów montażowych dobranych do ściany'}],hint:'INDO dopuszcza klej, kołki, taśmę lub zszywki według instrukcji. W wariancie zakupu kleju liczymy Strongman. Innych mocowań nie zastępujemy dowolnymi kołkami.'},
 {id:'skirtingGlueCartridges',label:'Kartusze kleju Strongman potrzebne do tej pracy',unit:'szt',inputType:'count',placeholder:'Ustal po próbie na swoim podłożu',min:1,max:100,hint:'Jeden kartusz zawiera 300 ml. Aktualna karta nie podaje pewnej wydajności dla wszystkich podłoży. Podaj sprawdzoną liczbę, zamiast przyjmować pozornie dokładne zużycie. Pistolet jest narzędziem liczonym osobno.'},
 {id:'skirtingMountFit',label:'Przygotowanie podłoża i dobór mocowania',unit:'',inputType:'select',placeholder:'Potwierdź dobór',defaultValue:0,min:0,max:1,required:false,options:[{value:0,label:'Wymaga sprawdzenia'},{value:1,label:'Potwierdzone podłoże i komplet potrzebnych materiałów'}],hint:'Sprawdź nośność i przygotowanie ściany, instrukcję kleju lub pozostałych mocowań. Mocuj do ściany, pozostawiając swobodę pracy podłogi. Bez potwierdzenia pokażemy brak pełnej wyceny.'},
 {id:'skirtingAdvanced',label:'Zapas i dodatkowe listwy',unit:'',inputType:'select',placeholder:'Założenia',defaultValue:0,min:0,max:1,required:false,options:[{value:0,label:'10% zapasu na docinki, bez dodatkowych sztuk'},{value:1,label:'Dostosuję zapas i dodatkowe sztuki'}]},
 {id:'skirtingReservePercent',label:'Zapas długości listew na docinki',unit:'%',inputType:'percent',placeholder:'10',defaultValue:10,min:0,max:30,required:false},
 {id:'skirtingExtraPieces',label:'Dodatkowe całe listwy po sprawdzeniu planu',unit:'szt',inputType:'count',placeholder:'0',defaultValue:0,min:0,max:200,required:false},
];
export function skirtingInputVisible(job:string,id:string,m:Readonly<Record<string,number|string>>):boolean {
 if(job!==SKIRTING_JOB||!id.startsWith('skirting')||id==='skirtingSystem')return true;
 if(Number(m.skirtingSystem)!==1)return false;
 if(id==='skirtingGlueCartridges')return Number(m.skirtingMounting)===1;
 if(id==='skirtingMountFit')return [1,2].includes(Number(m.skirtingMounting));
 if(['skirtingReservePercent','skirtingExtraPieces'].includes(id))return Number(m.skirtingAdvanced)===1;
 return true;
}
export function skirtingInputHint(job:string,id:string,m:Readonly<Record<string,number|string>>,fallback?:string):string|undefined {
 if(job!==SKIRTING_JOB||id!=='skirtingLayoutFit')return fallback;
 const parsed=Object.fromEntries(Object.entries(m).filter(([,v])=>String(v).trim()!=='').map(([k,v])=>[k,typeof v==='number'?v:Number(v.replace(',','.'))]));
 const pieces=skirtingPieces(parsed);
 return pieces===null?fallback:`Z tego obmiaru wynika ${pieces} listew po 2,5 m (${String(pieces*2.5).replace('.',',')} m, z zapasem). Sprawdź docinki, szerokość cięcia i łączniki; dodatkowe sztuki możesz dodać poniżej. Sklep zaokrągli zakup do swojej partii. Resztek między pomieszczeniami nie planujemy automatycznie.`;
}
// source: https://topboden.pl/files/0PeVEtM3BdxD3EXs.pdf
export const skirtingInstructions=[
 {step:1,title:'Zmierz odcinki i policz akcesoria',description:'Odejmij otwory drzwiowe od długości ścian. Sprawdź docinki z listew 2,5 m, policz narożniki, łączenia proste oraz osobno lewe i prawe zakończenia. Nie traktuj samej sumy metrów jako planu cięcia.',durationMin:30},
 {step:2,title:'Przygotuj listwy i ścianę',description:'Aklimatyzuj listwy co najmniej 24 godziny w temperaturze montażu. Sprawdź nośność i przygotowanie ściany oraz instrukcję wybranego mocowania. Przy klejeniu utrzymuj tę temperaturę przez czas wiązania wskazany w instrukcji.',durationMin:30},
 {step:3,title:'Przytnij i przymierz na sucho',description:'Przymierz listwy i akcesoria INDO biały połysk 01. Uwzględnij rzeczywiste cięcia oraz elementy łączące; po sprawdzeniu dostosuj dodatkowe całe listwy w obmiarach.',durationMin:45},
 {step:4,title:'Zamocuj szynę do ściany',description:'Postępuj według instrukcji INDO i instrukcji kleju albo posiadanych mocowań. Dla klejenia rysunek producenta pokazuje punkty kleju w odstępach maksymalnie 30–40 cm. Nie przyklejaj listwy do pływającej podłogi.',durationMin:60},
 {step:5,title:'Załóż listwę i akcesoria',description:'Zatrzaśnij listwę na szynie według instrukcji. Załóż właściwe narożniki, łączniki oraz zakończenia lewe i prawe. Sprawdź swobodę pracy podłogi i estetykę połączeń.',durationMin:30},
];
export function reviewSkirtingCalculation(calc?:CalculationResult):CalculationResult|undefined {
 if(!calc||calc.jobId!==SKIRTING_JOB||calc.quantityModel===SKIRTING_MODEL)return calc;
 const materials=calc.materials.map(line=>({...line,quantityKnown:false}));
 for(const material of skirtingMaterials(calc.measurements))if(!materials.some(line=>line.material.id===material.id))materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
 return{...calc,materials,quantityIssues:materials.map(l=>l.material.name)};
}
export const reviewSkirtingProject=(p:Project):Project=>p.jobId===SKIRTING_JOB&&p.calculationResult?{...p,calculationResult:reviewSkirtingCalculation(p.calculationResult)}:p;
export function reviewSkirtingShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[]{
 if(!calc||calc.jobId!==SKIRTING_JOB)return[...items];
 return items.flatMap(item=>{if(item.itemType!=='material'||!isSkirtingMaterial(calc.jobId,item.materialId))return item;
  const line=calc.materials.find(l=>l.material.id===item.materialId),required=skirtingQuantity(item.materialId,calc.measurements);
  if(calc.quantityModel!==SKIRTING_MODEL||!line||line.quantityKnown===false||required===null)return{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false};
  if(required===0)return[];
  const matches=!item.needsQuantityConfirmation&&item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=required;
  return{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:required,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes};});
}
