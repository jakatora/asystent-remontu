import {windowMaterials,windowInputs} from '@/features/calculator/windowSealing';
import { frameMaterials, frameInputs } from '@/features/calculator/framePainting';
import type { RenovationJob } from '@/types/domain';
import { formulaBuilder } from '@/features/calculator/formula-builder';
import { SHARED_SHOP_PRICES } from '@/data/prices/shared-shop-prices';

// ─────────────────────────────────────────────────────────────────────────────
// DOORS & WINDOWS JOB GROUP
// Jobs: window sealing, windowsill install, paint frames, trim finishing
// ─────────────────────────────────────────────────────────────────────────────

// ─── Uszczelnienie okien ──────────────────────────────────────────────────────

// source: https://www.soudal.pl/sites/default/files/soudal_api/document/900003230/TDS_AKRYL_UNIWERSALNY_2025.pdf
// source: https://www.soudal.pl/sites/default/files/soudal_api/document/SWS_EXTRA_INSIDE_2025.pdf
export const windowSealingJob: RenovationJob = {
  id:'window-sealing',slug:'uszczelnienie-okien',categoryId:'windows',name:'Uszczelnienie okien',
  shortDescription:'Sprawdź miejsce nieszczelności i dobierz uszczelkę, akryl lub warstwę wewnętrzną złącza.',
  description:'Uszczelka skrzydła i połączenie ramy ze ścianą wymagają innych napraw. Kalkulator rozdziela trzy zakresy: indywidualny profil uszczelki, drobną spoinę akrylową wewnątrz oraz taśmę SWS Inside 90 mm. Wybrane produkty i ich ilości trafiają do wspólnego koszyka; brak dopasowania lub materiałów pomocniczych pozostaje widocznym brakiem wyceny.',
  beginnerFriendlyDescription:'Najpierw ustal, którędy przepływa powietrze. Nie zakrywaj problemu luźnej ramy ani niesprawnych okuć pianką. Ten zakres nie obejmuje montażu okna ani naprawy ochrony zewnętrznej. Wybierz jeden rodzaj naprawy i sprawdź jego zastosowanie według instrukcji producentów.',
  difficulty:'medium',riskLevel:'medium',estimatedDays:1,estimatedMessLevel:1,visibilityMode:'safe_diy',coverIcon:'wind',
  warningRules:[
    {condition:'always',message:'Luźna rama lub problem z jej zamocowaniem wymaga oceny fachowca. Pianka jest warstwą izolacji, a nie zamiennikiem poprawnego zamocowania okna.',level:'warning'},
    {condition:'always',message:'SWS Inside to taśma paroszczelna od wewnątrz. Nie zastępuje uszczelki skrzydła, pianki ani ochrony zewnętrznej złącza. Sprawdź cały układ i szerokość 90 mm przed zakupem.',level:'info'},
    {condition:'always',message:'Akryl uniwersalny: karta 2025 ogranicza ruch spoiny do 7,5%. Wybrany wariant dotyczy drobnych połączeń wewnętrznych przy drewnie lub metalu, nie dowolnego złącza PVC.',level:'info'},
  ],
  measurementInputs:windowInputs,
  // Repair the mixed legacy/rich array together; retain all four existing material IDs.
  materials:windowMaterials(),
  tools:[
    {id:'knife-window',name:'Nóż lub nożyczki do dobranego materiału',icon:'scissors',required:false,notes:'Do uszczelki lub taśmy, według ich instrukcji. Nie uszkodź ramy.'},
    {id:'foam-gun',name:'Pistolet do wybranej pianki pistoletowej',icon:'tool',required:false,notes:'Potrzebny tylko przy zakupie pianki. Sprawdź instrukcję czyszczenia i potrzebny preparat.'},
    {id:'caulk-gun',name:'Pistolet do kartusza akrylu 280 ml',icon:'tool',required:false,notes:'Potrzebny w wariancie akrylowym. Nie oznacza zakupu silikonu.'},
    {id:'scraper',name:'Szpachelka do przygotowania podłoża',icon:'tool',required:false},
    {id:'window-tape-roller',name:'Miękka szpachelka lub gumowa rolka do taśmy',icon:'tool',required:false,notes:'Do dociśnięcia SWS bez pęcherzy, według karty.'},
  ],
  instructions:[
    {step:1,title:'Ustal miejsce i zakres naprawy',description:'Sprawdź oddzielnie uszczelkę między skrzydłem a ramą oraz styk ramy ze ścianą. Usterkę okuć, mocowania lub ochrony zewnętrznej oceń osobno. W obmiarach wybierz właściwy zakres; nie kupuj wszystkich trzech rodzajów uszczelnień automatycznie.',durationMin:20},
    {step:2,title:'Potwierdź dopasowanie i przygotuj podłoże',description:'Uszczelkę dobierz według profilu okna. Akryl: sprawdź nośne, czyste i suche podłoże oraz właściwy przekrój; sznur podpierający i gruntowanie wykonaj, jeśli wymaga tego karta. SWS: sprawdź miejsce przyklejenia po obu stronach złącza i potrzebny luz. Potwierdź posiadanie pozostałych materiałów dopiero po ich doborze.',durationMin:30},
    {step:3,title:'Wykonaj tylko wybraną naprawę',description:'Uszczelka: montuj dopasowany profil według producenta okna. Akryl: zabezpiecz brzegi taśmą, nałóż pistoletem i wygładź wilgotną szpachelką przed naskórkowaniem; taśmę zdejmij po obróbce fugi. SWS: zadbaj najpierw o izolację złącza, przyklej taśmę bez naciągania, zachowaj minimum 3 cm na połączeniach i dociśnij bez pęcherzy.',durationMin:60},
    {step:4,title:'Sprawdź efekt i czas do wykończenia',description:'Czasy schnięcia i warunki pracy sprawdź w karcie konkretnego produktu. Akryl można malować po utwardzeniu i próbie zgodności; nie przyjmuj jednego czasu dla każdej grubości. Taśmę SWS zabezpiecz przed uszkodzeniami według instrukcji. Sprawdź działanie okna i naprawione połączenie.',durationMin:20},
  ],
  commonMistakes:['Dowolna uszczelka zamiast profilu pasującego do okna','Pianka użyta do naprawienia luźnego mocowania ramy','Taśma Inside zastosowana jako warstwa zewnętrzna','Akryl użyty w złączu o zbyt dużym ruchu lub niepasującym podłożu','Pominięte zakłady, luz montażowy lub materiały do przygotowania'],
  qualityChecklist:[{id:'q1',description:'Okno działa prawidłowo po naprawie'},{id:'q2',description:'Wybrany materiał pasuje do miejsca naprawy i podłoża'},{id:'q3',description:'Uszczelka lub spoina jest ciągła, bez naprężeń i przerw'}],
  hireProfessionalRecommended:false,tags:['okna','uszczelnienie','akryl','taśma','uszczelka','przeciągi'],verifiedAt:'2026-10-28',
  verifiedSources:[
    {title:'Soudal Akryl uniwersalny — karta 2025',url:'https://www.soudal.pl/sites/default/files/soudal_api/document/900003230/TDS_AKRYL_UNIWERSALNY_2025.pdf',domain:'soudal.pl',consultedAt:'2026-10-28'},
    {title:'Soudal SWS Extra / Basic Plus Inside — karta 2025',url:'https://www.soudal.pl/sites/default/files/soudal_api/document/SWS_EXTRA_INSIDE_2025.pdf',domain:'soudal.pl',consultedAt:'2026-10-28'},
    // source: https://tytan.com/pl/produkt/piany-poliuretanowe/piana-pistoletowa-65/
    {title:'Tytan Professional 65 — zastosowanie, temperatury i EAN 750 ml',url:'https://tytan.com/pl/produkt/piany-poliuretanowe/piana-pistoletowa-65/',domain:'tytan.com',consultedAt:'2026-10-28'},
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
