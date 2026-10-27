import type { CalculationResult, MaterialItem, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import type { MeasurementInputDefinition } from '@/types/engine';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const GYPSUM_MODEL = 'gypsum-board-v1';
export const isGypsumJob = (id: string) => id === 'gypsum-wall' || id === 'gypsum-ceiling';
export function gypsumPriceWarnings(lines: readonly {material:{pricePerUnit:number};quantity:number;quantityKnown?:boolean}[]) {
  const missing=lines.filter(line=>line.quantityKnown===false||line.quantity>0&&line.material.pricePerUnit===0).length;
  return missing ? [{condition:'always' as const,level:'warning' as const,message:`Niepełna wycena: ${missing} pozycji wymaga ceny lub doboru. Kwota referencyjna obejmuje tylko wycenione materiały. Pełną listę braków sprawdzisz w porównaniu sklepów.`}] : [];
}
const WALL = ['gk-board','profile-cw','profile-uw','mineral-wool','gk-screws','gk-tape','gk-filler','dowels-uw','wall-acoustic-tape','gypsum-openings'];
const CEILING = ['gk-ceiling','profile-cd','profile-ud','hanger','gk-screws-ceiling','ceiling-filler','ceiling-tape','ceiling-cross','ceiling-longitudinal','ceiling-metal-screws','ceiling-steel-anchors','ceiling-wall-dowels','ceiling-acoustic-tape'];
export const isGypsumMaterial = (jobId: string, id: string) => (jobId === 'gypsum-wall' ? WALL : jobId === 'gypsum-ceiling' ? CEILING : []).includes(id);
const WALL_SOURCE = 'https://norgips.pl/rozwiazania/sciany-dzialowe/konstrukcja-pojedyncza-z-jednokrotnym-poszyciem-z-plyt-gk/sd-1x125-gkb-acw-50-w/';
const CEILING_SOURCE = 'https://norgips.pl/rozwiazania/sufity-podwieszane/sufity-podwieszane-z-jednokrotnym-poszyciem-z-plyt-g-k-na-ruszcie-dwupoziomowym/sp-1x125-gkb-acd-60-es/';
const BOARD = 'mat-gypsum-board-norgips-gkb-a-1200x';
const FILLER = 'mat-gypsum-norgips-start-finish-20kg';
const WOOL = 'mat-mineral-wool-isover-akuplyta-50mm';
const EANS: Record<string,string> = {
  'mat-gypsum-cross-norgips-100':'5907651696468', 'mat-gypsum-cross-budmat-100':'5901323043369',
  [BOARD+'2600']:'5907651690442', [BOARD+'2000']:'5907651690879', [FILLER]:'5907651699056',
  [WOOL]:'5901644653131', 'mat-profile-cd60-norgips-3m':'5907651698899',
  'mat-profile-cw50-norgips-06-3m-retail':'5907651698912',
  'mat-profile-uw50-norgips-super-06-3m':'5907651698547',
  'mat-profile-ud30-norgips-06-3m':'5907651698905',
  'mat-gypsum-paper-norgips-50x75':'5907651699933',
  'mat-gypsum-fleece-norgips-50x25':'5907651699926',
  'mat-gypsum-acoustic-norgips-50x30':'5907651698004',
  'mat-gypsum-acoustic-norgips-30x30':'5907651698851',
  'mat-gypsum-hanger-norgips-es6075':'5907651699650',
  'mat-gypsum-longitudinal-norgips-cd60':'5907651699674',
  'mat-gk-screws-koelner-fs3525-1000':'5906675305127',
  'mat-gk-profile-screws-koelner-ws3595-1000':'5906675303024',
  'mat-gk-perimeter-koelner-fx06k040-200':'5906675107622',
};
export function gypsumReference(id: string, m: MeasurementMap = {}): string | null {
  if (id === 'gk-board' || id === 'gk-ceiling') return (m.gypsumBoardSize ?? 0) === 0 ? BOARD+'2600' : m.gypsumBoardSize === 1 ? BOARD+'2000' : null;
  if (id === 'gk-filler' || id === 'ceiling-filler') return FILLER;
  if (id === 'mineral-wool') return WOOL;
  if (id === 'profile-cd') return 'mat-profile-cd60-norgips-3m';
  if (id === 'ceiling-cross') return (m.gypsumCrossConnector??0)===0 ? 'mat-gypsum-cross-norgips-100' : m.gypsumCrossConnector===1 ? 'mat-gypsum-cross-budmat-100' : null;
  if (id === 'gk-screws' || id === 'gk-screws-ceiling') return m.gypsumFasteners===1 ? 'mat-gk-screws-koelner-fs3525-1000' : null;
  if (id === 'ceiling-metal-screws') return m.gypsumFasteners===1 ? 'mat-gk-profile-screws-koelner-ws3595-1000' : null;
  if (id === 'dowels-uw' || id === 'ceiling-wall-dowels') return m.gypsumPerimeterFixings===1 ? 'mat-gk-perimeter-koelner-fx06k040-200' : null;
  if (id === 'gk-tape' || id === 'ceiling-tape') return (m.gypsumJointTape??0)===0 ? 'mat-gypsum-paper-norgips-50x75' : m.gypsumJointTape===1 ? 'mat-gypsum-fleece-norgips-50x25' : null;
  const accessories:Record<string,string>={'profile-cw':'mat-profile-cw50-norgips-06-3m-retail','profile-uw':'mat-profile-uw50-norgips-super-06-3m','profile-ud':'mat-profile-ud30-norgips-06-3m','wall-acoustic-tape':'mat-gypsum-acoustic-norgips-50x30','ceiling-acoustic-tape':'mat-gypsum-acoustic-norgips-30x30',hanger:'mat-gypsum-hanger-norgips-es6075','ceiling-longitudinal':'mat-gypsum-longitudinal-norgips-cd60'};
  if (accessories[id]) return accessories[id];
  return null;
}
const finiteRange = (n: number | undefined, min: number, max: number): n is number => Number.isFinite(n) && n! >= min && n! <= max;
const integerChoice = (n: number | undefined, max: number) => Number.isInteger(n) && finiteRange(n,0,max);
const fixed = (n: number) => Number(n.toFixed(6));
const whole = (n: number) => Math.ceil(fixed(n));

// source: https://norgips.pl/rozwiazania/6005/json/
// source: https://norgips.pl/rozwiazania/6325/json/
// Manufacturer allowances exclude waste. Explicit shopping reserve is separate;
// structural layout, substrate capacity and openings still need a project.
export function gypsumQuantity(jobId: string, id: string, m: MeasurementMap): number | null {
  if (!isGypsumMaterial(jobId,id)) return null;
  const wall = jobId === 'gypsum-wall', area = wall ? m.wallArea : m.ceilingArea;
  const reserve = m.gypsumReservePercent ?? 10, finish = m.gypsumFinish ?? 1;
  if (!finiteRange(area,wall?1:2,wall?200:300) || !finiteRange(reserve,0,30)
    || !integerChoice(finish,1) || !integerChoice(m.gypsumBoardSize??0,1)) return null;
  const factor = 1 + reserve / 100;
  if (['gk-screws','gk-screws-ceiling','ceiling-metal-screws'].includes(id)&&!integerChoice(m.gypsumFasteners??0,1))return null;
  if (['dowels-uw','ceiling-wall-dowels'].includes(id)&&!integerChoice(m.gypsumPerimeterFixings??0,1))return null;
  if (id === 'gypsum-openings') return integerChoice(m.gypsumOpenings??0,100) ? (m.gypsumOpenings??0) === 0 ? 0 : null : null;
  if (id === 'gk-board' || id === 'gk-ceiling') return fixed(area * (wall ? 2 : 1) * factor);
  if (id === 'mineral-wool') return fixed(area * factor);
  if (id === 'gk-filler' || id === 'ceiling-filler') return fixed(area * (wall ? 0.4 : 0.2) * (finish === 1 ? 1.5 : 1) * factor);
  if (id === 'gk-tape' || id === 'ceiling-tape') return integerChoice(m.gypsumJointTape??0,1) ? fixed(area * (wall ? 2.6 : 1.3) * factor) : null;
  if (id === 'gk-screws' || id === 'gk-screws-ceiling') return whole(area * (wall ? 24 : 25) * factor);
  if (wall) {
    if (!finiteRange(m.gypsumWallHeight,0.5,3)) return null;
    const height = m.gypsumWallHeight, length = area / height, outline = 2*(length+height);
    if (m.perimeter !== undefined && (!finiteRange(m.perimeter,1,100) || Math.abs(m.perimeter-outline)>0.1)) return null;
    // Cut whole-height studs from 3m stock; never join short offcuts into a stud.
    // For low partitions one stock length can provide several complete studs.
    if (id === 'profile-cw') return Math.ceil((Math.ceil(length / 0.6 - 1e-10) + 1) / Math.floor(3 / height + 1e-10)) * 3;
    if (id === 'profile-uw') return fixed(2 * length * factor);
    if (id === 'wall-acoustic-tape') return fixed(outline * factor);
    if (id === 'dowels-uw') return whole(Math.max(area*1.5,2*(Math.ceil(length/0.8)+1)+2*(Math.ceil(height/0.8)+1))*factor);
    return null;
  }
  if (id === 'profile-ud' || id === 'ceiling-acoustic-tape') {
    if (!finiteRange(m.perimeter,4,100) || m.perimeter+0.1<4*Math.sqrt(area)) return null;
    if (id === 'ceiling-acoustic-tape' && (m.gypsumCeilingAcoustic??1) === 0) return 0;
    if (id === 'ceiling-acoustic-tape' && !integerChoice(m.gypsumCeilingAcoustic??1,1)) return null;
    return fixed(m.perimeter*factor);
  }
  if (id === 'ceiling-cross' && !integerChoice(m.gypsumCrossConnector??0,1)) return null;
  if (id === 'ceiling-steel-anchors' && m.gypsumCeilingSubstrate !== 1) return null;
  // source: https://norgips.pl/rozwiazania/sufity-podwieszane/sufity-podwieszane-z-jednokrotnym-poszyciem-z-plyt-g-k-na-ruszcie-dwupoziomowym/sp-1x125-gkb-acd-60-es/
  if (id === 'ceiling-wall-dowels') return finiteRange(m.perimeter,4,100) ? whole(Math.max(area*1.5,Math.ceil(m.perimeter/0.8)+4)*factor) : null;
  const allowance: Record<string,number> = {'profile-cd':3.3,hanger:1.3,'ceiling-cross':2.5,'ceiling-longitudinal':0.6,'ceiling-metal-screws':12,'ceiling-steel-anchors':1.3,'ceiling-wall-dowels':1.5};
  const rate=allowance[id];
  return rate === undefined ? null : id === 'profile-cd' ? fixed(area*rate*factor) : whole(area*rate*factor);
}

export const gypsumCommonInputs: MeasurementInputDefinition[] = [
  // source: https://rawlplug.com/media/catalog/reference_object/8/6/4/5/8645bed8c1b633e727079ed69d412c22203e40c2/1954.KOELNER.PL.FS_DRYWALL_SCREWS_FOR_SHEET.pdf
  // source: https://rawlplug.com/media/catalog/reference_object/f/c/c/e/fcce52b5d9e9da73d84e9b9ad937ffd32232c6c8/1986.KOELNER.PL.WS_SELF_DRILLING_DRYWALL_SCREWS.pdf
  {id:'gypsumFasteners',label:'Wkręty do płyt i profili',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Norgips zgodnie z projektem — cena do sprawdzenia'},{value:1,label:'Koelner: FS 3,5×25 do płyt / WS 3,5×9,5 do profili'}],hint:'Jawny wybór innej marki. FS: jedna płyta 12,5 mm na profilu stalowym 0,6 mm. WS: połączenia profili, nie płyt. Przy wymaganiach ogniowych lub akustycznych stosuj produkty wskazane w projekcie systemu. Kartony po 1000 szt. sumujemy wspólnie dla remontu.'},
  // source: https://rawlplug.com/media/catalog/reference_object/2/2/c/2/22c27a831711122ca97348d9d058ecd7054427a1/1865.KOELNER.PL.FX_K_HAMMER_IN_FIXING_WITH_MUSHROOM_HEAD.pdf
  {id:'gypsumPerimeterFixings',label:'Kołki pod profile obwodowe',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Podłoże / łącznik wymaga doboru'},{value:1,label:'Koelner FX 6×40 — potwierdzone warunki mocowania w betonie'}],hint:'Wybierz FX tylko dla nośnego betonu: grubość podłoża ≥100 mm, warstwa mocowana wraz z tynkiem i taśmą ≤11 mm; otwór ≥35 mm, osadzenie ≥29 mm, odległości od krawędzi i między kołkami ≥100 mm. Sprawdź to z projektem i kartą produktu. To kołki obwodu UW/CW/UD; nie zastępują stalowych kotew do wieszaków sufitu. Opakowanie 200 szt.'},
  // source: https://norgips.pl/rozwiazania/6005/json/
  // source: https://norgips.pl/rozwiazania/6325/json/
  {id:'gypsumJointTape',label:'Taśma do spoin płyt',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Papierowa Norgips 50 mm × 75 m'},{value:1,label:'Fizelinowa Norgips 50 mm × 25 m'}],hint:'Obie występują w zestawieniu tego systemu. Taśmę zatop w systemowej masie. Koszyk sumuje metry, a następnie dobiera pełne rolki wybranego produktu. Taśmę pod profile liczymy oddzielnie.'},
  {id:'gypsumBoardSize',label:'Format płyty Norgips GKB typ A, 12,5 mm',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'1200 × 2600 mm — 3,12 m² / płyta'},{value:1,label:'1200 × 2000 mm — 2,40 m² / płyta'}],hint:'Suche wnętrze. Długość płyty zmienia liczbę płyt i spoin. H2, podwójne poszycie i wymagania ogniowe wymagają osobnego zestawu.'},
  {id:'gypsumFinish',label:'Wykończenie spoin',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:1,min:0,max:1,options:[{value:0,label:'Q1 — podstawowe spoinowanie'},{value:1,label:'Q2 — dodatkowe wykończenie spoin'}],hint:'Gotowa Norgips Start & Finish. Q2 nie oznacza gładzi na całej powierzchni. Malowanie i pełne szpachlowanie dodaj jako oddzielne prace.'},
  {id:'gypsumReservePercent',label:'Zapas na docinki i zużycie',unit:'%',inputType:'percent',placeholder:'10',defaultValue:10,min:0,max:30,required:false,hint:'Jawne założenie zakupowe, poza normą producenta. Płyty, wełnę i masę sumujemy między pracami przed doborem opakowań. Pionowe CW liczymy w całych profilach 3 m.'},
];
export const gypsumWallInputs: MeasurementInputDefinition[] = [
  {id:'gypsumWallHeight',label:'Wysokość ścianki',unit:'m',inputType:'length',placeholder:'np. 2,5',min:0.5,max:3,hint:'Dla tego wariantu pojedyncze CW 50 o grubości 0,6 mm i długości 3 m, maks. rozstaw 60 cm. Wyższa lub obciążona ścianka wymaga osobnego doboru konstrukcji.'},
  {id:'gypsumOpenings',label:'Otwory drzwiowe i inne wymagające wzmocnień',unit:'szt.',inputType:'count',placeholder:'0',defaultValue:0,min:0,max:100,required:false,hint:'Podaj powierzchnię brutto, bez odejmowania otworów. Przy otworach pozostawiamy dodatkowe profile, nadproża i mocowania jako brak do doboru; nie ogłaszamy niepełnego zestawu kompletnym.'},
];
export const gypsumCeilingInputs: MeasurementInputDefinition[] = [
  // source: https://norgips.pl/produkty/lacznik-krzyzowy-72.html
  // source: https://www.budmat.com/pl/produkt/lacznik-krzyzowy-152
  {id:'gypsumCrossConnector',label:'Łączniki krzyżowe CD 60',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Norgips — karton 100 szt.'},{value:1,label:'Budmat 0,8 mm — opakowanie 100 szt.'}],hint:'Wybierz produkt zgodny z projektem sufitu. Budmat to inna marka: potwierdź zgodność z profilami i wymaganiami systemu. Liczbę łączników sumujemy dla remontu, potem zaokrąglamy do pełnych opakowań po 100 szt.'},
  {id:'gypsumCeilingSubstrate',label:'Podłoże do zamocowania wieszaków',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:0,min:0,max:1,options:[{value:0,label:'Wymaga sprawdzenia / inny strop'},{value:1,label:'Beton — mocowanie stalowe dobrane do stropu'}],hint:'Kotwa stalowa z właściwą aprobatą do mocowania nad głową. Kołek z tworzywa do profilu ściennego nie zastępuje kotwy stropowej. Typ i nośność potwierdza projekt / fachowiec.'},
  {id:'gypsumCeilingAcoustic',label:'Taśma uszczelniająca 30 mm pod UD',unit:'',inputType:'select',placeholder:'Wybierz',defaultValue:1,min:0,max:1,required:false,options:[{value:1,label:'Dodaj taśmę pod profile obwodowe'},{value:0,label:'Projekt nie wymaga taśmy'}],hint:'Opcjonalna w zestawieniu tego systemu. Wyciszenie obwodu nie oznacza potwierdzonej izolacyjności całego sufitu.'},
];

// source: https://norgips.pl/rozwiazania/sciany-dzialowe/konstrukcja-pojedyncza-z-jednokrotnym-poszyciem-z-plyt-gk/sd-1x125-gkb-acw-50-w/
// source: https://norgips.pl/rozwiazania/sufity-podwieszane/sufity-podwieszane-z-jednokrotnym-poszyciem-z-plyt-g-k-na-ruszcie-dwupoziomowym/sp-1x125-gkb-acd-60-es/
export function gypsumMaterials(jobId: string, m: MeasurementMap = {}): MaterialItem[] {
  const wall=jobId==='gypsum-wall', source=wall?WALL_SOURCE:CEILING_SOURCE;
  const descriptions: Record<string,[string,string,string]> = {
    'profile-cw':['Profil Norgips CW 50, 0,6 mm, 3 m — pionowy','m','Liczba słupków z rozstawu do 60 cm i obu końców ścianki. Z profilu 3 m wycinamy tylko odcinki pełnej wysokości, bez łączenia krótkich odpadów. Otwory wymagają dodatkowego doboru.'],
    'profile-uw':['Profil Norgips UW 50, 0,6 mm — podłoga i sufit','m','Dwa razy długość ścianki + zapas; boczne słupki są CW. Nie używamy profilu sufitowego UD.'],
    'profile-ud':['Profil Norgips UD 30, 0,6 mm — obwód sufitu','m','Rzeczywisty obwód pomieszczenia + zapas. Odrębny produkt od UW 50 i Budmat UD 27.'],
    'gk-screws':['Wkręty Norgips TN 3,5 × 25 mm, ostre — płyty ścienne','szt','Norma 24 szt./m² ścianki, obie strony łącznie, + zapas. Nie zamieniamy na pchełki do metalu.'],
    'gk-screws-ceiling':['Wkręty Norgips TN 3,5 × 25 mm, ostre — płyty sufitowe','szt','Norma 25 szt./m² + zapas. Rozstaw wkrętów zgodnie z systemem, maks. 17 cm.'],
    'gk-tape':['Taśma papierowa Norgips 50 mm — spoiny ścianki','m','Norma 2,6 m/m² ścianki, obie strony łącznie, + zapas. Nie jest taśmą pod profile.'],
    'ceiling-tape':['Taśma papierowa Norgips 50 mm — spoiny sufitu','m','Norma 1,3 m/m² + zapas. Nie jest taśmą akustyczną.'],
    'dowels-uw':['Mocowania obwodowe ścianki — dobór do podłoża','szt','Szacunek z maks. 80 cm rozstawu oraz końców odcinków, nie mniej niż norma 1,5 szt./m², + zapas. Rodzaj i długość dobierz do nośnego podłoża.'],
    'wall-acoustic-tape':['Taśma uszczelniająca Norgips 50 mm pod UW i skrajne CW','m','Cały obwód ścianki + zapas. Inna szerokość i zastosowanie niż papierowa taśma do spoin.'],
    'hanger':['Wieszak bezpośredni Norgips ES 60/75','szt','Norma 1,3 szt./m² + zapas. Dotyczy wskazanego rusztu dwupoziomowego, nie wieszaka obrotowego ani sufitu jednopoziomowego.'],
    'ceiling-cross':['Łącznik krzyżowy Norgips CD 60 — ruszt dwupoziomowy','szt','Norma 2,5 szt./m² + zapas. Rozkład ostatecznie według projektu sufitu.'],
    'ceiling-longitudinal':['Łącznik wzdłużny Norgips CD 60','szt','Norma 0,6 szt./m² + zapas. Faktyczna liczba zależy od długości pomieszczenia i profili.'],
    'ceiling-metal-screws':['Wkręty samowiercące Norgips 3,5 × 9,5 mm — pchełki','szt','Norma 12 szt./m² + zapas. Do połączeń metalowych; odrębne od TN 25 do płyt.'],
    'ceiling-steel-anchors':['Stalowe kotwy stropowe do wieszaków — dobór do betonu','szt','Norma 1,3 szt./m² + zapas po potwierdzeniu podłoża. Wymagana odpowiednia aprobata i nośność do zamocowań nad głową. Nigdy plastikowy kołek ścienny.'],
    'ceiling-wall-dowels':['Mocowania profilu obwodowego UD — dobór do ściany','szt','Większy wynik: norma 1,5 szt./m² lub obwód / 0,8 m + 4 narożniki, następnie zapas. Szacunek dla prostokątnego obwodu; oddzielne od stalowych kotew stropowych. Projekt ustala ostateczny rozstaw i mocowania.'],
    'ceiling-acoustic-tape':['Taśma uszczelniająca Norgips 30 mm pod UD','m','Opcjonalny rzeczywisty obwód + zapas; niezależna od taśmy papierowej do spoin.'],
    'gypsum-openings':['Wzmocnienia otworów: profile, nadproża i mocowania — do doboru','pozycja','Otwory wymagają odrębnego doboru. Nie zakładamy, że zwykłe CW/UW pokrywają obciążenia drzwi.'],
  };
  return (wall?WALL:CEILING).map(id=>{
    const reference=gypsumReference(id,m), ref=MATERIAL_PRICES.find(row=>row.id===reference);
    if (ref) return {id,name:ref.productLabel,brand:ref.brand,ean:EANS[ref.id],unit:ref.packageUnit,category:ref.materialType,sourceUrl:ref.sourceUrl,formulaKey:`gypsumBoard:${jobId}:${id}`,wasteFactor:1,pricePerUnit:ref.pricePerPackage,priceBasis:'package',packaging:{size:ref.packageSize,label:`${ref.packageSize} ${ref.packageUnit}`,purchaseUnit:id==='gk-board'||id==='gk-ceiling'?'płyta':id.startsWith('profile-')?'profil':id==='gk-tape'||id==='ceiling-tape'||id.endsWith('acoustic-tape')?'rolka':id==='hanger'||id==='ceiling-longitudinal'?'szt.':'opakowanie'},notes:ref.materialType==='drywall-accessory'?ref.notes+' '+(descriptions[id]?.[2]??''):id==='mineral-wool'?'Aku-Płyta 037, 50 mm, 14,4 m²/paczka. Nie zastępuj wełną 100 mm w profilu CW 50.':id==='gk-filler'||id==='ceiling-filler'?`Gotowa masa Start & Finish, bez dodawania wody jak do proszku. Norma Q${(m.gypsumFinish??1)+1}, bez pełnej gładzi. Opakowanie 20 kg.`:id==='profile-cd'?'Norgips CD 60, 0,6 mm, 3 m. Norma rusztu DWUPOZIOMOWEGO 3,3 m/m² + zapas; nie stosujemy wzoru od gładzi.':'GKB typ A, 12,5 mm, suche wnętrza. Ścianka: jedna warstwa na KAŻDEJ z dwóch stron. Sufit: jedna warstwa. Pełne płyty po zsumowaniu remontu.'};
    const [name,unit,notes]=descriptions[id]??['Płyta / masa / izolacja — wymaga doboru','pozycja','Brak konkretnego produktu nie oznacza darmowego zakupu.'];
    return {id,name,unit,notes,sourceUrl:source,formulaKey:`gypsumBoard:${jobId}:${id}`,wasteFactor:1,pricePerUnit:0,category:'drywall-accessory',...(id==='profile-cw'?{ean:'5907651698165',packaging:{size:3,label:'3 m',purchaseUnit:'profil'},priceBasis:'package' as const}: {})};
  });
}

export function reviewGypsumCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (!calc || !isGypsumJob(calc.jobId)) return calc;
  const warnings=calc.warnings.filter(row=>!row.message.startsWith('Niepełna wycena:'));
  if (calc.quantityModel===GYPSUM_MODEL) return {...calc,warnings:[...warnings,...gypsumPriceWarnings(calc.materials)]};
  const materials=calc.materials.map(line=>({...line,quantityKnown:false}));
  for (const material of gypsumMaterials(calc.jobId)) if (!materials.some(line=>line.material.id===material.id)) materials.push({material,quantity:0,rawQuantity:0,cost:0,quantityKnown:false});
  return {...calc,materials,warnings:[...warnings,...gypsumPriceWarnings(materials)],quantityIssues:materials.map(line=>line.material.name)};
}
export const reviewGypsumProject = (project: Project): Project => isGypsumJob(project.jobId) && project.calculationResult ? {...project,calculationResult:reviewGypsumCalculation(project.calculationResult)} : project;
export function reviewGypsumShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (!calc || !isGypsumJob(calc.jobId)) return [...items];
  return items.flatMap(item=>{
    if (item.itemType!=='material'||!isGypsumMaterial(calc.jobId,item.materialId)) return item;
    const line=calc.materials.find(row=>row.material.id===item.materialId), required=gypsumQuantity(calc.jobId,item.materialId,calc.measurements);
    if (calc.quantityModel!==GYPSUM_MODEL||!line||line.quantityKnown===false||required===null) return {...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false,notes:'Potwierdź w obmiarach format płyt, konstrukcję i mocowania. Starszy zapis nie obejmował kompletnego zestawu.'};
    if (required===0) return [];
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=required;
    return {...item,name:line.material.name,unit:line.material.unit,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:required,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased,notes:line.material.notes};
  });
}
