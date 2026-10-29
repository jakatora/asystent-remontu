import type {CalculationResult,MaterialItem,Project,ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';
import type {MeasurementInputDefinition} from '@/types/engine';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';

export const SOCKET_FRAME_JOB='socket-frame-replace';
export const SOCKET_FRAME_MODEL='asfora-white-frames-v1';
const REFERENCES:Record<string,string>={'socket-frames':'mat-frame-asfora-white-1','socket-frames-double':'mat-frame-asfora-white-2','socket-frames-triple':'mat-frame-asfora-white-3'};
export const isSocketFrame=(job:string,id:string)=>job===SOCKET_FRAME_JOB&&id in REFERENCES;
export const socketFrameReference=(id:string)=>REFERENCES[id]??null;
const whole=(n:number|undefined,min:number,max=50):n is number=>Number.isSafeInteger(n)&&n!>=min&&n!<=max;
// frameCount remains the TOTAL number of frames, not mechanisms/openings.
// A 2/3-gang frame is one purchased piece. The remaining frames are single.
// source: https://www.se.com/pl/pl/product/EPH5800121/asfora-ramka-1krotna-pozioma-bia%C5%82y/
// source: https://www.se.com/pl/pl/product/EPH5800221/asfora-ramka-2krotna-pozioma-bia%C5%82y/
// source: https://www.se.com/pl/pl/product/EPH5800321/asfora-ramka-3krotna-pozioma-bia%C5%82y/
export function socketFrameQuantity(id:string,m:MeasurementMap):number|null{
  if(!REFERENCES[id]||m.frameSeriesConfirmed!==1||!whole(m.frameCount,1)||![1,2].includes(m.frameLayout!))return null;
  const double=m.frameLayout===1?0:m.frameDoubleCount,triple=m.frameLayout===1?0:m.frameTripleCount;
  if(!whole(double,0)||!whole(triple,0)||double+triple>m.frameCount)return null;
  return id==='socket-frames'?m.frameCount-double-triple:id==='socket-frames-double'?double:triple;
}
export function socketFrameMaterials(m:MeasurementMap={}):MaterialItem[]{
  return Object.keys(REFERENCES).map(id=>{
    const ref=m.frameSeriesConfirmed===1?MATERIAL_PRICES.find(r=>r.id===REFERENCES[id]):undefined;
    if(!ref)return{id,name:id==='socket-frames'?'Ramki — potwierdź serię, kolor i układ':id==='socket-frames-double'?'Ramki podwójne — policz całe ramki':'Ramki potrójne — policz całe ramki',unit:'szt',formulaKey:'socketFrame:'+id,pricePerUnit:0,wasteFactor:1,roundingRule:'none'};
    const photo=PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id));
    return{id,name:ref.productLabel,brand:ref.brand,ean:photo?.ean,imageUrl:photo?.imageUrl,sourceUrl:ref.sourceUrl,category:ref.materialType,unit:'szt',formulaKey:'socketFrame:'+id,pricePerUnit:ref.pricePerPackage,priceBasis:'package',wasteFactor:1,roundingRule:'none',packaging:{size:1,label:'1 cała ramka',purchaseUnit:'szt'},notes:ref.notes};
  });
}
export const socketFrameInputs:MeasurementInputDefinition[]=[
  {id:'frameCount',label:'Łączna liczba ramek do wymiany',unit:'szt.',inputType:'count',placeholder:'np. 10',min:1,max:50,required:true,hint:'Policz całe ramki, nie otwory ani mechanizmy. Jedna ramka podwójna lub potrójna to jedna sztuka.'},
  {id:'frameSeriesConfirmed',label:'Zgodność serii i koloru',unit:'',inputType:'select',placeholder:'Sprawdź istniejący osprzęt',min:0,max:1,defaultValue:0,required:false,options:[{value:0,label:'Inna seria lub jeszcze nie sprawdzono — potrzebny dobór'},{value:1,label:'Potwierdzam: pasujące mechanizmy Asfora i białe ramki'}],hint:'Wariant obejmuje ramki Schneider Electric Asfora białe: EPH5800121, EPH5800221 i EPH5800321. Podwójne i potrójne są poziome. Ramki innych serii, kolory i układy pionowe wymagają osobnego doboru. To same ramki, bez nowych gniazdek i wyłączników.'},
  {id:'frameLayout',label:'Układ potrzebnych ramek',unit:'',inputType:'select',placeholder:'Policz rodzaje ramek',min:0,max:2,defaultValue:0,required:false,options:[{value:0,label:'Jeszcze nie policzono rodzajów ramek'},{value:1,label:'Wszystkie są pojedyncze'},{value:2,label:'Różne rodzaje — podaj liczbę podwójnych i potrójnych'}],hint:'Dla różnych rodzajów od łącznej liczby odejmiemy podwójne i potrójne; pozostałe będą pojedyncze. Porównamy cały zestaw i jedną dostawę na sklep.'},
  {id:'frameDoubleCount',label:'W tym ramki podwójne poziome',unit:'szt.',inputType:'count',placeholder:'Podaj liczbę lub 0',min:0,max:50,required:true,hint:'Liczba całych ramek na dwa mechanizmy, nie liczba mechanizmów. Wpisz 0, jeśli takich ramek nie potrzebujesz.'},
  {id:'frameTripleCount',label:'W tym ramki potrójne poziome',unit:'szt.',inputType:'count',placeholder:'Podaj liczbę lub 0',min:0,max:50,required:true,hint:'Liczba całych ramek na trzy mechanizmy. Suma podwójnych i potrójnych nie może przekraczać łącznej liczby ramek.'},
];
export function socketFrameInputVisible(job:string,id:string,m:Readonly<Record<string,string|number|undefined>>){return job!==SOCKET_FRAME_JOB||!['frameDoubleCount','frameTripleCount'].includes(id)||Number(m.frameLayout)===2;}
export function reviewSocketFrameCalculation(calc:CalculationResult|undefined):CalculationResult|undefined{
  if(calc?.jobId!==SOCKET_FRAME_JOB)return calc;
  const definitions=socketFrameMaterials(calc.measurements),materials=calc.materials.map(line=>{
    if(!isSocketFrame(calc.jobId,line.material.id))return line;
    const n=socketFrameQuantity(line.material.id,calc.measurements),def=definitions.find(r=>r.id===line.material.id);
    const identity=n===0||Boolean(def?.ean&&'ean'in line.material&&line.material.ean===def.ean&&line.material.unit==='szt'&&line.material.packaging?.size===1);
    return calc.quantityModel===SOCKET_FRAME_MODEL&&n!==null&&identity&&line.quantityKnown!==false&&line.rawQuantity===n?line:{...line,quantityKnown:false};
  });
  for(const material of definitions)if(!materials.some(l=>l.material.id===material.id)&&socketFrameQuantity(material.id,calc.measurements)!==0)materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
  return{...calc,materials,quantityIssues:materials.filter(l=>l.quantityKnown===false).map(l=>l.material.name)};
}
export const reviewSocketFrameProject=(p:Project):Project=>p.jobId===SOCKET_FRAME_JOB?{...p,calculationResult:reviewSocketFrameCalculation(p.calculationResult)}:p;
export function reviewSocketFrameShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[]{
  if(calc?.jobId!==SOCKET_FRAME_JOB)return[...items];const reviewed=reviewSocketFrameCalculation(calc)!;
  return items.flatMap(item=>{
    if(item.itemType!=='material'||!isSocketFrame(calc.jobId,item.materialId))return[item];
    const n=socketFrameQuantity(item.materialId,calc.measurements),line=reviewed.materials.find(l=>l.material.id===item.materialId);
    if(n===null||!line||line.quantityKnown===false)return[{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false}];if(n===0)return[];
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)>=n;
    return[{...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:n,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes}];
  });
}
