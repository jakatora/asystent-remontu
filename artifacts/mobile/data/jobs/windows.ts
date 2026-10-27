import { frameMaterials, frameInputs } from '@/features/calculator/framePainting';
import type { RenovationJob } from '@/types/domain';
import { formulaBuilder } from '@/features/calculator/formula-builder';
import { SHARED_SHOP_PRICES } from '@/data/prices/shared-shop-prices';

// ─────────────────────────────────────────────────────────────────────────────
// DOORS & WINDOWS JOB GROUP
// Jobs: window sealing, windowsill install, paint frames, trim finishing
// ─────────────────────────────────────────────────────────────────────────────

// ─── Uszczelnienie okien ──────────────────────────────────────────────────────

export const windowSealingJob: RenovationJob = {
  id: 'window-sealing',
  slug: 'uszczelnienie-okien',
  categoryId: 'windows',
  name: 'Uszczelnienie okien',
  shortDescription: 'Usuń stare uszczelki i piankę, załóż nowe — okna przestaną przeciągać.',
  description: 'Nieszczelne okna to jeden z największych strat ciepła w mieszkaniu. Wymiana uszczelek i piankowanie ościeżnicy to tania i skuteczna poprawa izolacji.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 1,
  visibilityMode: 'safe_diy',
  coverIcon: 'wind',
  warningRules: [
    { condition: 'always', message: 'Pianka montażowa ekspanduje — nie nakładaj za dużo. Nadmiar rozepchnie ościeżnicę.', level: 'warning' },
    { condition: 'always', message: 'Stara pianka może zawierać formaldehyd — wietrz pomieszczenie przy usuwaniu.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'perimeter', label: 'Łączny obwód okien', unit: 'm', inputType: 'length',
      placeholder: 'np. 12', min: 1, max: 200,
      hint: 'Dodaj obwody wszystkich okien. Jedno okno 100×120 cm = ok. 4,4 m.' },
  ],
  materials: [
    {
      id: 'window-gasket',
      name: 'Uszczelka okienna EPDM (do skrzydła)',
      unit: 'm',
      formulaKey: 'skirting',
      pricePerUnit: 2.5,
      wasteFactor: 1.1,
      category: 'uszczelka',
      notes: 'Pasuje do rowka skrzydła okna. Mierz i kupuj z zapasem.',
    },
    {
      id: 'mounting-foam',
      name: 'Pianka montażowa zimowa',
      unit: 'szt',
      formula: formulaBuilder.linear('perimeter', 0.125),
      roundingRule: 'ceil',
      pricePerUnit: 25,
      category: 'pianka',
      notes: '1 puszka na ok. 8 mb szczeliny. Pianka zimowa działa do -10°C.',
    },
    {
      id: 'silicone-window',
      name: 'Akryl uszczelniający biały (malowalny, do wnętrza)',
      brand: 'Soudal Akryl 280 ml biały (referencja)',
      unit: 'kartusze',
      formulaKey: 'silicone',
      pricePerUnit: 13,
      category: 'uszczelnienie',
      notes: 'Do uszczelnienia styku ościeżnicy ze ścianą od wewnątrz. Po utwardzeniu można malować.',
      shopPrices: SHARED_SHOP_PRICES.acrylicSealant280ml,
    },
    {
      id: 'window-tape',
      name: 'Taśma rozprężna (Pro Clima lub podobna)',
      unit: 'm',
      formulaKey: 'linearMeters',
      pricePerUnit: 8,
      category: 'taśma',
      optional: true,
      notes: 'Paroprzepuszczalna — uszczelnia ościeżnicę lepiej niż pianka. Opcja premium.',
    },
  ],
  tools: [
    { id: 'knife-window', name: 'Nóż do cięcia uszczelek', icon: 'scissors', required: true },
    { id: 'foam-gun', name: 'Pistolet do pianki', icon: 'tool', required: false, notes: 'Daje lepszą kontrolę dozowania. Bez pistoletu — jednorazowe puszki.' },
    { id: 'caulk-gun', name: 'Pistolet do silikonu', icon: 'tool', required: true },
    { id: 'scraper', name: 'Skrobak (usuwanie starej pianki)', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'Usuń stare uszczelki', description: 'Wyciągnij ze rowków skrzydła stare uszczelki. Jeśli są przyklejone — potnij nożem i zerwij.', durationMin: 30 },
    { step: 2, title: 'Wyczyść rowki', description: 'Dokładnie oczyść rowki z brudu i resztek kleju. Suche rowki lepiej trzymają uszczelkę.', durationMin: 20 },
    { step: 3, title: 'Wciśnij nowe uszczelki', description: 'Wciśnij uszczelkę EPDM w rowek skrzydła. Zacznij od narożnika, idź dookoła. Tnie się nożem w narożnikach pod 45°.', tip: 'Uszczelka powinna być lekko dłuższa niż obwód — skrócisz ją po oklejeniu.', durationMin: 60 },
    { step: 4, title: 'Uszczelnij ościeżnicę', description: 'Jeśli ościeżnica jest luźna lub widać szczeliny — napełnij pianką montażową. Taśma rozprężna jest trwalsza.', tip: 'Pianki jest zawsze za mało na początku — nadmiar po wyschnięciu łatwo zetrzeć.', durationMin: 45 },
    { step: 5, title: 'Uszczelnij krawędzie od wewnątrz', description: 'Wypełnij styk ościeżnicy ze ścianą akrylem uszczelniającym od środka pomieszczenia.', durationMin: 30 },
  ],
  dryingTimes: [
    { afterStep: 4, description: 'Pianka montażowa — ekspansja i twardnienie', minHours: 2, maxHours: 8 },
    { afterStep: 5, description: 'Akryl uszczelniający', minHours: 12, maxHours: 24 },
  ],
  commonMistakes: ['Zła grubość uszczelki — za cienka nie uszczelnia, za gruba uniemożliwia zamknięcie okna', 'Za dużo pianki — rozepchnie ościeżnicę', 'Brak silikonowania od wewnątrz — mostki termiczne pozostają'],
  qualityChecklist: [
    { id: 'q1', description: 'Okno zamyka się bez oporu i nie przeciąga' },
    { id: 'q2', description: 'Brak widocznych szczelin między ościeżnicą a ścianą' },
    { id: 'q3', description: 'Uszczelki leżą równomiernie w rowkach' },
  ],
  hireProfessionalRecommended: false,
  tags: ['okna', 'uszczelnienie', 'pianka', 'izolacja', 'przeciągi'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Uszczelnianie okien. Sprawdź, jak i czym uszczelnić okna — poradnik',
      url:         'https://muratordom.pl/remont-domu/eksploatacja-domu/sposoby-uszczelniania-okien-aa-haki-daQv-Z5cu.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Parapet wewnętrzny ───────────────────────────────────────────────────────

export const windowsillJob: RenovationJob = {
  id: 'windowsill-install',
  slug: 'montaz-parapetu',
  categoryId: 'windows',
  name: 'Montaż parapetu wewnętrznego',
  shortDescription: 'Zamontuj nowy parapet wewnętrzny z PVC, konglomeratu lub drewna.',
  description: 'Parapet wewnętrzny wykańcza wnękę okienną i chroni przed kondensatem z szyby. PVC jest najtańsze i łatwe w montażu, konglomerat elegancki, drewno ciepłe ale wymaga konserwacji.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 1,
  visibilityMode: 'safe_diy',
  coverIcon: 'minus',
  warningRules: [
    { condition: 'always', message: 'Parapet musi wystawać min. 3–4 cm poza lico ściany, żeby odprowadzać wodę z kondensacji.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'linearMeters', label: 'Łączna długość parapetów', unit: 'm', inputType: 'length',
      placeholder: 'np. 3.2', min: 0.3, max: 50,
      hint: 'Zmierz szerokość każdego okna (luz ościeżnicy + 6–8 cm wystawania boków).' },
  ],
  materials: [
    {
      id: 'windowsill',
      name: 'Parapet PVC biały',
      unit: 'm.b.',
      formulaKey: 'linearMeters',
      pricePerUnit: 45,
      wasteFactor: 1.1,
      roundingRule: 'ceil',
      category: 'parapet',
      notes: 'Dostępne szerokości: 15, 20, 25, 30 cm. Dopasuj do głębokości wnęki.',
    },
    {
      id: 'windowsill-foam',
      name: 'Pianka montażowa (pod parapet)',
      unit: 'szt',
      formula: formulaBuilder.fixed(1),
      pricePerUnit: 25,
      category: 'pianka',
    },
    {
      id: 'windowsill-silicone',
      name: 'Silikon biały (uszczelnienie krawędzi parapetu)',
      brand: 'Soudal Silikon sanitarny 280 ml (referencja)',
      unit: 'kartusze',
      formula: formulaBuilder.fixed(1),
      pricePerUnit: 18,
      category: 'uszczelnienie',
      shopPrices: SHARED_SHOP_PRICES.siliconeSanitary280ml,
    },
    {
      id: 'windowsill-endcap',
      name: 'Zatyczki boczne do parapetu PVC',
      unit: 'szt',
      formulaKey: 'sockets',
      pricePerUnit: 4,
      category: 'akcesoria',
      notes: '2 zatyczki na każde okno.',
    },
  ],
  tools: [
    { id: 'saw-window', name: 'Piła ręczna lub wyrzynarka', icon: 'scissors', required: true },
    { id: 'level-window', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'caulk-gun-win', name: 'Pistolet do silikonu', icon: 'tool', required: true },
    { id: 'heat-gun', name: 'Opałarka (do wygięcia PVC)', icon: 'tool', required: false },
  ],
  instructions: [
    { step: 1, title: 'Usuń stary parapet', description: 'Wytnij silikon wokół starego parapetu i go wyjmij. Oczyść podłoże z resztek pianki i kleju.', durationMin: 20 },
    { step: 2, title: 'Przytnij parapet', description: 'Zmierz długość wnęki i przytnij parapet. Boki podcina się pod kątem 45° lub przyklejaj gotowe zatyczki.', tip: 'Parapet powinien wchodzić pod ościeżnicę ok. 1 cm — tak będzie stabilnie.', durationMin: 30 },
    { step: 3, title: 'Montuj parapet', description: 'Wypełnij przestrzeń pod parapetem pianką (nie za dużo!). Wsuń parapet, wypoziomuj, dociśnij do ościeżnicy. Poczekaj 30 min.', warning: 'Nie nakładaj za dużo pianki — uniesie parapet.', durationMin: 40 },
    { step: 4, title: 'Uszczelnij krawędzie', description: 'Silikonem uszczelnij styk parapetu ze ścianą i ościeżnicą z obu stron.', durationMin: 20 },
  ],
  commonMistakes: ['Parapet za krótki — boki nie są zasłonięte', 'Za dużo pianki — parapet się unosi', 'Brak poziomowania — woda staje na parapecie'],
  qualityChecklist: [
    { id: 'q1', description: 'Parapet jest poziomy' },
    { id: 'q2', description: 'Krawędzie uszczelnione silikonem' },
    { id: 'q3', description: 'Zatyczki boczne dobrze dopasowane' },
  ],
  hireProfessionalRecommended: false,
  tags: ['okna', 'parapet', 'PVC', 'montaż'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Wybór parapetów wewnętrznych. Dostępne materiały i ceny styczeń 2026',
      url:         'https://muratordom.pl/budowa/okna/wybor-parapetow-wewnetrznych-dostepne-materialy-i-ceny-styczen-2026-aa-fHxp-375S-m1b8.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Malowanie ościeżnic i ram ────────────────────────────────────────────────

// source: https://www.karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_SUPERMAL%C2%AE_EMALIA_AKRYLOWA.pdf
// source: https://www.karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_UREKOR_D_GRUNT_DO_DREWNA.pdf
// source: https://www.karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_UREKOR_S_PODK%C5%81AD_ANTYKOROZYJNY.pdf
// source: https://packshoty.duluxpolska.pl/wp-content/uploads/karta_techniczna_Dulux-Rapidry.pdf
export const paintFramesJob: RenovationJob = {
  id: 'paint-frames', slug: 'malowanie-oscieznic-i-ram', categoryId: 'paint', subcategory: 'frames',
  name: 'Malowanie ościeżnic drzwi i okien',
  shortDescription: 'Odśwież ramy wewnątrz: dobierz zestaw do drewna, stali lub twardego PVC.',
  description: 'Wybierz podłoże i białe wykończenie. Kalkulator dobiera konkretną emalię, właściwy podkład oraz osobno policzone arkusze, taśmę i preparat do przygotowania. Zakres obejmuje wnętrza; naprawy ubytków i usuwanie nieznanych starych powłok wymagają osobnego doboru.',
  beginnerFriendlyDescription: 'Zmierz rzeczywistą powierzchnię ram: długość każdego elementu pomnóż przez szerokość wszystkich malowanych płaszczyzn i zsumuj wyniki. Wybierz drewno, stal/żeliwo albo twarde PVC. Zrób próbę przyczepności i sprawdź instrukcję wybranych produktów.',
  difficulty:'medium', riskLevel:'medium', estimatedDays:3, estimatedMessLevel:1, visibilityMode:'safe_diy', coverIcon:'square',
  warningRules:[
    // source: https://www.hse.gov.uk/lead/faqs.htm
    {condition:'always',message:'Przed usuwaniem starych powłok nieznanego składu sprawdź ryzyko ołowiu. Przy podejrzeniu zleć ocenę fachowcowi; zwykła maska przeciwpyłowa nie rozwiązuje problemu. Nie szlifuj takich powłok na sucho.',level:'warning'},
    {condition:'always',message:'Wariant PVC dotyczy wyłącznie twardego tworzywa nadającego się do malowania wewnątrz, po umyciu, zmatowieniu i próbie. Nie stosuj do niego benzyny ani podkładu do drewna lub stali.',level:'info'},
    {condition:'always',message:'Podkłady Urekor i benzyna wymagają wentylacji, ochrony według etykiety i braku źródeł zapłonu. Wodne emalie nawierzchniowe nie są rozcieńczane benzyną. Przed malowaniem sprawdź zgodność i wykonaj próbę.',level:'warning'},
  ],
  measurementInputs:[
    {id:'wallArea',label:'Rzeczywista powierzchnia ram do malowania',unit:'m²',inputType:'area',placeholder:'np. 5',min:0.001,max:50,
      hint:'Suma długość × szerokość malowanych płaszczyzn każdego elementu. Nie wpisuj powierzchni otworu drzwiowego ani liczby drzwi.'},
    {id:'coats',label:'Warstwy emalii nawierzchniowej',unit:'warstwy',inputType:'count',placeholder:'2',defaultValue:2,min:1,max:3,
      hint:'Supermal: zwykle 1–2 według krycia; Dulux Rapidry: co najmniej 2. Podkład liczysz oddzielnie.'},
    {id:'coveragePerLiter',label:'Przyjęta wydajność emalii',unit:'m²/l',inputType:'coverage',placeholder:'10',defaultValue:10,min:0.1,max:16,required:false,
      hint:'Domyślnie 10 m²/l na warstwę jako założenie do kosztorysu. Gotowy Supermal: do 14; Rapidry: do 16. Wpisz wynik próby na swojej powierzchni; przekroczenie limitu wybranej farby wymaga poprawy.'},
    ...frameInputs,
  ],
  // Repair the former mixed rich/legacy array in one step; preserve all four old IDs.
  materials:frameMaterials(),
  tools:[
    {id:'brush-narrow',name:'Pędzel wąski 2,5–4 cm do emalii',icon:'edit-3',required:true,notes:'Dobierz włosie do emalii; osobny pędzel do podkładu rozpuszczalnikowego.'},
    {id:'brush-flat',name:'Pędzel płaski 5 cm',icon:'edit-2',required:true,shopPrices:SHARED_SHOP_PRICES.brush50mm},
    // source: https://www.bosch-professional.com/pl/pl/klocki-szlifierskie-zapiecie-na-rzepy-2868585-ocs-ac/
    {id:'frame-sanding-block',name:'Klocek do ręcznego szlifowania',icon:'layers',required:true,notes:'Suche arkusze P120 i P240 kupujesz osobno w materiałach; gradację sprawdź na próbce.'},
    {id:'rag',name:'Czyste ściereczki do usuwania pyłu',icon:'square',required:true},
  ],
  safetyEquipment:[
    {id:'mask',name:'Ochrona dróg oddechowych do pyłu według oceny ryzyka',icon:'shield',required:true,notes:'Nie jest rozwiązaniem dla powłok podejrzanych o zawartość ołowiu. Do par rozpuszczalników potrzebny jest inny dobór ochrony.'},
    {id:'frame-gloves',name:'Rękawice i ochrona oczu według etykiet',icon:'shield',required:true},
  ],
  preparationSteps:[
    {step:1,phase:'preparation',title:'Sprawdź podłoże i stare powłoki',description:'Ustal materiał ramy i skład starych powłok przed ich usuwaniem. Ocenę podejrzanych powłok zleć fachowcowi. Uszkodzenia drewna, korozję i ubytki napraw odpowiednią metodą przed malowaniem.',durationMin:20},
    {step:2,phase:'preparation',title:'Oczyść, zmatów i wykonaj próbę',description:'Przy bezpiecznej, dobrze przyczepnej powłoce usuń brud i drobno zmatów powierzchnię, następnie odpyl. Dla PVC użyj środka powierzchniowo czynnego i drobnego papieru, bez benzyny. Dla stali oraz tłustych/żywicznych miejsc drewna postępuj według kart podkładu i emalii. Pozostaw do wyschnięcia i sprawdź przyczepność na małym fragmencie.',durationMin:30},
    {step:3,phase:'preparation',title:'Zabezpiecz krawędzie i nałóż właściwy podkład',description:'Oklej brzegi. Drewno: Urekor D, jedna warstwa na wymaganej powierzchni. Stal/żeliwo: Urekor S, 1–2 warstwy według warunków. Po podkładzie odczekaj co najmniej 24 h przed emalią. Wybrany wariant przygotowanego twardego PVC wewnątrz nie wymaga osobnego podkładu.',durationMin:30},
  ],
  workSteps:[
    {step:1,phase:'work',title:'Nałóż emalię nawierzchniową',description:'Wymieszaj wybraną farbę. Maluj równomierną warstwą, bez zalewania okuć i uszczelek. Stosuj warunki, narzędzia i sposób aplikacji z etykiety. Rapidry do pędzla/wałka nie rozcieńczaj; do Supermal nie dodawaj obcych rozpuszczalników.',durationMin:30,requiresMaterial:'frame-paint'},
    {step:2,phase:'drying',title:'Zachowaj odstęp między warstwami',description:'Supermal akrylowa: następna warstwa po około 4 h. Dulux Rapidry: 2–4 h. Chłód, wilgoć i grubsza warstwa wydłużają schnięcie. Suchość w dotyku nie oznacza gotowości do kolejnej warstwy ani pełnej twardości.',durationMin:240},
    {step:3,phase:'work',title:'Dokończ wybraną liczbę warstw',description:'Sprawdź krycie i usuń pył po ewentualnym lekkim matowaniu zgodnym z kartą. Supermal zwykle 1–2 warstwy; Rapidry dwie. Po zakończeniu odczekaj czas do użytkowania z etykiety.',durationMin:30,requiresMaterial:'frame-paint'},
  ],
  dryingTimes:[
    {afterStep:3,description:'Minimalna przerwa po Urekor D/S przed emalią',minHours:24,maxHours:24,conditions:'Co najmniej 24 h; warunki mogą wydłużyć schnięcie. Sprawdź kartę i wykonaj próbę zgodności, zwłaszcza przy Urekor S.'},
    {afterStep:1,description:'Między warstwami emalii',minHours:2,maxHours:4,conditions:'Rapidry 2–4 h; Supermal około 4 h. Nie dotyczy schnięcia podkładu.'},
  ],
  instructions:[
    {step:1,title:'Dobierz zestaw do podłoża',description:'W obmiarach wybierz drewno, stal/żeliwo lub twarde PVC wewnątrz oraz biały mat/półpołysk. Zmierz malowane płaszczyzny. Przed usuwaniem nieznanej starej powłoki sprawdź jej skład.',durationMin:20},
    {step:2,title:'Przygotuj i sprawdź przyczepność',description:'Oczyść i zmatów bezpieczną powłokę, usuń pył i zrób próbę. PVC: środek powierzchniowo czynny, drobny papier, bez benzyny. Drewno/stal: przygotowanie zgodne z kartami wybranego zestawu.',durationMin:30},
    {step:3,title:'Podkład tylko tam, gdzie potrzebny',description:'Drewno: Urekor D, jedna warstwa. Stal/żeliwo: Urekor S, 1–2. Przed emalią co najmniej 24 h. Przygotowane twarde PVC wewnątrz w wariancie Rapidry: bez osobnego podkładu.',durationMin:30},
    {step:4,title:'Maluj i zachowaj przerwy',description:'Supermal: kolejna warstwa po około 4 h. Rapidry: dwie warstwy, odstęp 2–4 h. Czas do użytkowania sprawdź na etykiecie. Nie dodawaj benzyny do wodnych emalii.',durationMin:60},
  ],
  cleanupSteps:['Wodne emalie z narzędzi usuń wodą według etykiety. Narzędzia po podkładzie rozpuszczalnikowym czyść odpowiednim preparatem osobno; nie wylewaj pozostałości do kanalizacji.','Taśmę usuń w czasie i sposobem podanym przez jej producenta, aby nie zerwać powłoki.'],
  commonMistakes:['Farba lub podkład do innego podłoża','Powierzchnia otworu drzwi zamiast powierzchni ram','Pomylenie 0,8 l gotowego koloru z bazą 0,75 l','Zbyt wczesne malowanie na podkładzie','Suchy szlif nieznanej starej powłoki','Pominięcie przygotowania i próby przyczepności'],
  qualityChecklist:[{id:'q1',description:'Powłoka równa i przyczepna, zgodna z wybranym wykończeniem',critical:true},{id:'q2',description:'Okucia, uszczelki i szyby pozostają czyste'},{id:'q3',description:'Jednolite krycie i zachowane przerwy schnięcia'}],
  hireProfessionalRecommended:false,tags:['ościeżnica','malowanie','drewno','stal','PVC','drzwi','okna'],
  verifiedAt:'2026-10-27',
  verifiedSources:[
    {title:'Supermal Emalia Akrylowa — gotowe kolory, karta techniczna',url:'https://www.karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_SUPERMAL%C2%AE_EMALIA_AKRYLOWA.pdf',domain:'karty-techniczne.sniezka.pl',consultedAt:'2026-10-27'},
    {title:'Dulux Rapidry — karta techniczna',url:'https://packshoty.duluxpolska.pl/wp-content/uploads/karta_techniczna_Dulux-Rapidry.pdf',domain:'packshoty.duluxpolska.pl',consultedAt:'2026-10-27'},
  ],
};

// ─── Wykończenie progu i maskownicy ───────────────────────────────────────────

export const trimFinishingJob: RenovationJob = {
  id: 'trim-finishing',
  slug: 'wykonczen-prog-maskownice',
  categoryId: 'windows',
  name: 'Wykończenie progów i maskownic',
  shortDescription: 'Zamontuj listwy maskujące, progi i maskownice — ostatnie wykończenie ościeży.',
  description: 'Maskownice i progi zakrywają szczeliny i nierówności przy drzwiach i oknach. To ostatni etap wykończenia, który decyduje o estetyce całości.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 1,
  visibilityMode: 'safe_diy',
  coverIcon: 'square',
  warningRules: [
    { condition: 'always', message: 'Maskownice MDF nie lubią wilgoci — nie stosuj w łazience bez lakierowania.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'linearMeters', label: 'Łączna długość maskownic / progów', unit: 'mb', inputType: 'length',
      placeholder: 'np. 15', min: 1, max: 200,
      hint: 'Zmierz każde ościeże drzwi: 2 boki + nadproże = ok. 6 mb. Dodaj progi (0,8–0,9 m każdy).' },
  ],
  materials: [
    {
      id: 'door-trim',
      name: 'Maskownica/obudowa ościeżnicy MDF',
      brand: 'Arbiton Laque MDF 60 mm × 2,42 m biała (referencja, można użyć takich samych listew co przypodłogowe)',
      unit: 'm.b.',
      formulaKey: 'byPerimeter',
      wasteFactor: 1.1,
      roundingRule: 'ceil',
      packaging: { size: 2.42, label: 'listwa 2,42 m', purchaseUnit: 'listwa' },
      pricePerUnit: 12,
      category: 'maskownice',
      notes: 'Nakrywka zakrywa szczelinę między ościeżnicą a ścianą.',
      shopPrices: SHARED_SHOP_PRICES.baseboardMDF60mm,
    },
    {
      id: 'door-threshold',
      name: 'Listwa progowa aluminium',
      unit: 'szt.',
      formulaKey: 'threshold',
      pricePerUnit: 30,
      category: 'próg',
      notes: 'Płaska lub z uszczelką. Szerokość dobierz do różnicy poziomów.',
    },
    {
      id: 'trim-adhesive',
      name: 'Klej montażowy do maskownic',
      unit: 'kartusze',
      formulaKey: 'skirtingGlue',
      pricePerUnit: 12,
      category: 'klej',
    },
    {
      id: 'trim-silicone',
      name: 'Akryl malarski (uszczelniacz akrylowy)',
      brand: 'Soudal Akryl 280 ml biały (referencja)',
      unit: 'kartusze',
      formula: formulaBuilder.fixed(1),
      pricePerUnit: 13,
      category: 'uszczelnienie',
      optional: true,
      notes: 'Do malowania — możesz pomalować razem ze ścianą.',
      shopPrices: SHARED_SHOP_PRICES.acrylicSealant280ml,
    },
  ],
  tools: [
    { id: 'miter-saw-trim', name: 'Ukośnica lub skrzynka uciosowa', icon: 'scissors', required: true, notes: '45° cięcia w narożnikach', rentable: true },
    { id: 'caulk-gun-trim', name: 'Pistolet do kleju', icon: 'tool', required: true },
    { id: 'finish-nailer', name: 'Zszywacz lub pistolety gwoździarz', icon: 'tool', required: false, notes: 'Gwoździe ukryte — alternatywa dla kleju' },
    { id: 'tape-measure-trim', name: 'Miara', icon: 'maximize-2', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zmierz i zaplanuj cięcia', description: 'Zmierz każde ościeże i zaplanuj cięcia 45° na narożnikach. Zaznacz ołówkiem.', durationMin: 20 },
    { step: 2, title: 'Przytnij maskownice', description: 'Ukośnicą tnij pod 45° na narożnikach. Sprawdzaj dopasowanie przed klejeniem.', durationMin: 25 },
    { step: 3, title: 'Przyklejaj', description: 'Klejem montażowym (zygzakiem na spód listwy) przyklejaj maskownicę do ościeżnicy i ściany. Dociskaj przez 30 sekund.', durationMin: 40 },
    { step: 4, title: 'Montuj próg', description: 'Próg wkręć lub przyklej do podłogi przy drzwiach. Wyrównaj z poziomem podłogi z obu stron.', durationMin: 15 },
    { step: 5, title: 'Uszczelnij akrylem i maluj', description: 'Akrylem malarskim wypełnij szczelinę między maskownicą a ścianą. Po wyschnięciu możesz pomalować razem ze ścianą.', durationMin: 20 },
  ],
  dryingTimes: [
    { afterStep: 5, description: 'Akryl przed malowaniem', minHours: 2, maxHours: 6 },
  ],
  commonMistakes: ['Złe cięcie 45° — widoczna szczelina w narożniku', 'Klejenie bez wyrównania — maskownica krzywa', 'Brak silikonowania — szczeliny widoczne przez farbę'],
  qualityChecklist: [
    { id: 'q1', description: 'Maskownice szczelnie przy ścianie i ościeżnicy' },
    { id: 'q2', description: 'Narożniki są czyste — bez widocznej szczeliny' },
    { id: 'q3', description: 'Próg stabilny i równy z podłogą' },
  ],
  hireProfessionalRecommended: false,
  tags: ['maskownica', 'próg', 'ościeżnica', 'wykończenie', 'drzwi'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Montaż listew maskujących do drzwi: sprawdź, jak to zrobić',
      url:         'https://www.pattex.pl/pomysly/montaz/montaz-listew-maskuj%C4%85cych-do-drzwi-sprawdz-jak-to-zrobic.html',
      domain:      'pattex.pl',
      consultedAt: '2026-07-10',
    },
  ],
};
