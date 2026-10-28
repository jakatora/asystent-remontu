import {plasterInputs,plasterMaterials} from '@/features/calculator/plastering';
import { removalMaterials, removalInputs } from '@/features/calculator/wallpaperRemoval';
import { wallpaperRollInputs } from '@/features/calculator/wallpaperRolls';
import { wallpaperAdhesiveInputs } from '@/features/calculator/wallpaperAdhesive';
import { wallpaperTapeInputs } from '@/features/calculator/wallpaperTape';
import { finishingMaterials, finishingInputs } from '@/features/calculator/wallFinishing';
import { substratePrimerMaterial, substratePrimerInputs } from '@/features/calculator/substratePrimer';
import type { RenovationJob } from '@/types/domain';
import { formulaBuilder } from '@/features/calculator/formula-builder';
import { SHARED_SHOP_PRICES } from '@/data/prices/shared-shop-prices';
import { REPAINT_FILM_MATERIAL } from '@/features/calculator/repaint';

// ─────────────────────────────────────────────────────────────────────────────
// WALLS & CEILINGS JOB GROUP
// Jobs: primer, repaint, wall-repair (holes/cracks), skim-coat,
//        wallpaper-install, wallpaper-remove
// ─────────────────────────────────────────────────────────────────────────────

// ─── Gruntowanie ──────────────────────────────────────────────────────────────

export const primerJob: RenovationJob = {
  id: 'primer-walls',
  slug: 'gruntowanie-scian',
  categoryId: 'primer',
  subcategory: 'interior',
  name: 'Gruntowanie ścian',
  shortDescription: 'Przygotuj ściany pod malowanie lub tapetowanie.',
  description: 'Grunt wnika w tynk lub gips i tworzy równomierną, chłonną powierzchnię. Wymagany na: nowych ścianach, naprawianych miejscach, po zeskrobaniu, pylących/chłonnych podłożach. Na stabilnej, wcześniej malowanej ścianie grunt NIE jest konieczny.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 1,
  visibilityMode: 'safe_diy',
  coverIcon: 'layers',
  warningRules: [
    { condition: 'always', message: 'Wietrz pomieszczenie — grunt ma nieprzyjemny zapach.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Powierzchnia ścian', unit: 'm²', inputType: 'area',
      placeholder: 'np. 30', min: 1, max: 500,
      hint: 'Długość ściany × wysokość. Zsumuj wszystkie ściany. Odejmij okna i drzwi.' },
    { id: 'coveragePerLiter', label: 'Wydajność gruntu (m²/litr)', unit: 'm²/litr',
      inputType: 'coverage', placeholder: '10', defaultValue: 10, min: 2, max: 10, required: false,
      hint: 'Ceresit CT 17: 2–10 m²/l (0,10–0,50 l/m²). Domyślnie 10 m²/l; dopasuj do chłonności. Zużycie dotyczy produktu z opakowania, bez wody do rozcieńczenia.' },
  ],
  materials: [
    substratePrimerMaterial('primer-walls'),
  ],
  tools: [
    { id: 'roller', name: 'Wałek malarski', icon: 'edit-2', required: true, shopPrices: SHARED_SHOP_PRICES.roller18cm },
    { id: 'brush', name: 'Pędzel 5 cm', icon: 'edit-3', required: true, shopPrices: SHARED_SHOP_PRICES.brush50mm },
    { id: 'tray', name: 'Kuweta', icon: 'square', required: true, shopPrices: SHARED_SHOP_PRICES.paintTray },
  ],
  instructions: [
    { step: 1, title: 'Oczyść ścianę', description: 'Odkurz ścianę szczotką lub odkurzaczem. Usuń luźne kawałki tynku.', durationMin: 20 },
    { step: 2, title: 'Nanieś grunt', description: 'Wałkiem lub pędzlem nanieś równomierną warstwę gruntu. Grunt powinien wsiąkać.', tip: 'Grunt powinien wsiąkać — to znak, że działa.', durationMin: 45 },
    { step: 3, title: 'Czekaj na wyschnięcie', description: 'Poczekaj minimum 2–4 godziny. W zimie lub przy dużej wilgotności — dłużej.', durationMin: 180 },
  ],
  commonMistakes: ['Gruntowanie mokrej ściany — grunt nie wnika głęboko', 'Zbyt cienka warstwa — chłonne tynki potrzebują więcej'],
  qualityChecklist: [
    { id: 'q1', description: 'Cała powierzchnia jest jednolicie pokryta' },
    { id: 'q2', description: 'Grunt jest suchy i nie odkleja się przy dotknięciu' },
  ],
  hireProfessionalRecommended: false,

  verifiedAt: '2026-06-09',
  verifiedSources: [
    {
      title:       'Przed malowaniem ścian: gruntowanie ścian i przygotowanie podłoża',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-09',
    },
  ],
};

// ─── Malowanie ponowne (repaint) ──────────────────────────────────────────────

export const repaintJob: RenovationJob = {
  id: 'repaint-walls',
  slug: 'przemalowanie-scian',
  categoryId: 'paint',
  subcategory: 'interior',
  name: 'Przemalowanie ścian',
  shortDescription: 'Malowanie ścian pokrytych starą farbą — zmiana koloru lub odświeżenie.',
  description: 'Przemalowanie różni się od malowania nowych ścian tym, że powierzchnia jest już gładka. Kluczem jest dobry grunt kryjący i farba z dobrą krycią zdolnością.',
  beginnerFriendlyDescription:
    'Ściany mają już farbę — chcesz ją odświeżyć lub zmienić kolor. Główna różnica: używaj specjalnego gruntu kryjącego (szczególnie przy zmianie z ciemnego na jasny) i wybierz farbę z oznaczeniem "kryjąca" lub "wydajna".',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 2,
  visibilityMode: 'safe_diy',
  coverIcon: 'droplet',
  warningRules: [
    { condition: 'always', message: 'Sprawdź czy stara farba dobrze trzyma się ściany — odchodząca farba musi być usunięta przed malowaniem.', level: 'warning' },
    { condition: 'always', message: 'Przy zmianie z ciemnego na jasny kolor: użyj gruntu kryjącego lub białej farby podkładowej.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Łączna powierzchnia ścian', unit: 'm²', inputType: 'area',
      placeholder: 'np. 40', min: 1, max: 500,
      hint: 'Długość × wysokość każdej ściany. Odejmij okna (ok. 2 m² każde) i drzwi (ok. 1,8 m²).' },
    { id: 'coats', label: 'Liczba warstw farby', unit: 'warstwy', inputType: 'count',
      placeholder: '2', defaultValue: 2, min: 1, max: 3,
      hint: 'Zmiana koloru — 2–3 warstwy. Odświeżenie tego samego koloru — 1–2 warstwy.' },
    { id: 'coveragePerLiter', label: 'Wydajność farby (m²/litr)', unit: 'm²/litr',
      inputType: 'coverage', placeholder: '8', defaultValue: 8, min: 5, max: 15, required: false,
      hint: 'Farba kryjąca: ok. 6–8 m²/litr. Lepsza farba — większa wydajność.' },
    {id:'undercoatChoice',label:'Biała farba podkładowa',unit:'',placeholder:'',inputType:'select',defaultValue:1,min:0,max:1,required:false,
      options:[{value:1,label:'Potrzebuję podkładu kryjącego'},{value:0,label:'Podkład nie jest potrzebny lub już go mam'}],
      hint:'Osobna warstwa przygotowująca jednolite podłoże. Stabilna stara powłoka nie zawsze wymaga podkładu; sprawdź instrukcję farby nawierzchniowej.'},
    // source: https://www.sniezka.pl/produkt/sniezka-grunt/
    {id:'undercoatCoverage',label:'Wydajność podkładu (jedna warstwa)',unit:'m²/litr',placeholder:'9',inputType:'coverage',defaultValue:9,min:1,max:10,required:false,
      hint:'Śnieżka Grunt: do 10 m²/l według producenta; przyjmujemy 9 m²/l i 5% zapasu. Sprawdź etykietę i chłonność. Wydajność farby nawierzchniowej wpisujesz osobno.'},
    {id:'tapeRolls',label:'Rolki taśmy 50 m do kupienia',unit:'szt.',placeholder:'1',inputType:'count',defaultValue:1,min:0,max:20,required:false,
      hint:'Podaj własną liczbę rolek; 0 jeśli masz taśmę. Nie przeliczamy powierzchni ścian na rolki.'},
    {id:'protectiveFilmPacks',label:'Opakowania folii 4 × 5 m do kupienia',unit:'szt.',placeholder:'1',inputType:'count',defaultValue:1,min:0,max:20,required:false,
      hint:'Jedno opakowanie ma 20 m². Uwzględnij podłogę i meble; 0 jeśli masz odpowiednią osłonę.'},
  ],
  materials: [
    {
      id: 'paint',
      name: 'Farba kryjąca (zmywalna)',
      brand: 'Śnieżka Barwy Natury 173 biały / Majowa Konwalia 5 l (referencja Standard)',
      unit: 'litr',
      formula: formulaBuilder.coverage(8),
      wasteFactor: 1.05,
      roundingRule: 'ceil',
      packaging: { size: 5, label: 'puszka 5 L', purchaseUnit: 'puszka' },
      // source: https://sklep.sewera.pl/barwy-natury-173-majowa-konwalia-5l-p7136
      pricePerUnit: 98.50,
      category: 'farba',
      // source: https://www.sniezka.pl/produkt/sniezka-barwy-natury/173-majowa-konwalia
      notes: 'Referencja biała 173. W porównaniu zobaczysz dokładny wariant dla wybranego poziomu. Liczbę warstw i wydajność dopasuj do etykiety farby; obecne 8 m²/l to założenie użytkownika.',
    },
    {
      id: 'primer-repaint',
      name: 'Biała farba podkładowa Śnieżka Grunt 5 l',
      brand: 'Śnieżka Grunt — lateksowa emulsja podkładowa biała 5 l',
      unit: 'litr',
      formulaKey: 'repaintUndercoat',
      wasteFactor: 1.0,
      roundingRule: 'ceil',
      packaging: { size: 5, label: 'wiadro 5 l', purchaseUnit: 'wiadro' },
      // source: https://sklep.sewera.pl/sniezka-grunt-5l-p6153 (2026-10-27, 56,10 zł/5 l)
      pricePerUnit: 56.10,
      category: 'paint-undercoat',
      optional: true,
      notes: 'Jedna warstwa kryjącego białego podkładu, osobna od gruntu penetrującego. Ilość liczona z własnej wydajności 9 m²/l i 5% zapasu; potwierdź potrzebę i zgodność z farbą nawierzchniową.',
    },
    {
      id: 'painters-tape',
      name: 'Taśma malarska',
      brand: 'Blue Dolphin niebieska 30 mm × 50 m (referencja)',
      unit: 'rolka',
      formulaKey: 'repaintTapeRolls',
      // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zewnatrz-30mm-x-50m-niebieska/2526
      pricePerUnit: 11.99,
      category: 'akcesoria',
    },
    REPAINT_FILM_MATERIAL,
  ],
  tools: [
    { id: 'roller', name: 'Wałek malarski 18–22 cm', icon: 'edit-2', required: true, estimatedBuyCostPLN: 25, shopPrices: SHARED_SHOP_PRICES.roller18cm },
    { id: 'brush', name: 'Pędzel 5 cm (narożniki)', icon: 'edit-3', required: true, estimatedBuyCostPLN: 15, shopPrices: SHARED_SHOP_PRICES.brush50mm },
    { id: 'tray', name: 'Kuweta do farby', icon: 'square', required: true, shopPrices: SHARED_SHOP_PRICES.paintTray },
    { id: 'ladder', name: 'Drabina', icon: 'chevrons-up', required: true, rentable: true, estimatedRentCostPLN: 30, shopPrices: SHARED_SHOP_PRICES.ladder4steps },
  ],
  instructions: [
    { step: 1, title: 'Oceń stan starej farby', description: 'Sprawdź czy stara farba jest stabilna — dotknij i przeciągnij dłonią. Odchodząca farba (kredująca) musi być zmyta lub przeszlifowana.', tip: 'Jeśli stara farba "pudruje się" — zmyj ją mokrą szmatką i zagruntuj.', durationMin: 20 },
    { step: 2, title: 'Przygotuj pomieszczenie', description: 'Wynieś lub przykryj meble folią. Rozłóż folię na podłodze. Oklej taśmą listwy i okna.', durationMin: 25 },
    // source: https://www.sniezka.pl/produkt/sniezka-grunt/
    { step: 3, title: 'Nanieś podkład kryjący (jeśli potrzebny)', description: 'Na przygotowane, stabilne podłoże nałóż jedną warstwę białej farby podkładowej Śnieżka Grunt. Z farbą nawierzchniową poczekaj do całkowitego wyschnięcia, według producenta około 4 godzin. Grunt penetrujący dobierz osobno, jeśli wymaga go podłoże.', durationMin: 60 },
    { step: 4, title: 'Maluj pierwszą warstwą', description: 'Pędzelkiem narożniki, wałkiem reszta. Maluj pasami, zachodząc o 1/3.', durationMin: 90 },
    { step: 5, title: 'Poczekaj 4 godziny i maluj drugą warstwą', description: 'Nie skracaj przerwy. Druga warstwa w kierunku prostopadłym do pierwszej.', durationMin: 90 },
    { step: 6, title: 'Zdejmij taśmę i posprzątaj', description: 'Gdy farba lekko wilgotna — zdejmij taśmę pod kątem 45°. Umyj narzędzia.', durationMin: 20 },
  ],
  commonMistakes: [
    'Malowanie na odchodzącej starej farbie — nowa farba odpada razem z nią',
    'Pominięcie gruntu kryjącego przy zmianie koloru — stary kolor przebija',
    'Za dużo farby na wałku — zacieki',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Kolor jednolity — stary kolor nie przebija', critical: true },
    { id: 'q2', description: 'Brak smug i nierówności' },
    { id: 'q3', description: 'Narożniki są czyste i proste' },
  ],
  hireProfessionalRecommended: false,
  tags: ['malowanie', 'przemalowanie', 'farba', 'ściany', 'interior'],

  verifiedAt: '2026-06-09',
  verifiedSources: [
    {
      title:       'Przed malowaniem ścian: gruntowanie ścian i przygotowanie podłoża',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-09',
    },
    {
      title:       'Malowanie ścian — instrukcja dla początkujących',
      url:         'https://www.castorama.pl/pomaluj-sciany-jak-profesjonalista-malowanie-krok-po-kroku-ins-1119211.html',
      domain:      'castorama.pl',
      consultedAt: '2026-06-09',
    },
  ],
};

// ─── Naprawa pęknięć i ubytków ────────────────────────────────────────────────

export const wallRepairJob: RenovationJob = {
  // source: https://www.acrylputz.pl/produkty/gladzie-sypkie/acrylputz-st10-start
  id: 'wall-repair',
  slug: 'naprawa-pekniec-i-ubytkow',
  categoryId: 'wall-repair',
  name: 'Naprawa pęknięć i ubytków',
  shortDescription: 'Napraw dziury, rysy i odpryski na ścianie przed malowaniem.',
  description: 'Małe ubytki i pęknięcia możesz naprawić samodzielnie w kilka godzin. Kluczem jest dobre oczyszczenie ubytku, warstwy masy (nie za grube) i szlifowanie.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 2,
  visibilityMode: 'safe_diy',
  coverIcon: 'tool',
  warningRules: [
    { condition: 'large-cracks', message: 'Jeśli pęknięcia są szerokie (ponad 3 mm) i ciągną się przez całą ścianę — to może być problem konstrukcyjny. Zadzwoń do inspektora.', level: 'danger' },
    { condition: 'always', message: 'Wilgoć na ścianie: jeśli widzisz zacieki lub grzyb — najpierw usuń przyczynę wilgoci.', level: 'warning' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Powierzchnia ściany do gruntowania', unit: 'm²', inputType: 'area',
      placeholder: 'np. 10', min: 0.001, max: 200,
      hint: 'Ta powierzchnia służy do obliczenia gruntu. Powierzchnię samych ubytków i głębokość podajesz osobno poniżej.' },
    ...finishingInputs('wall-repair'),
    ...substratePrimerInputs('wall-repair'),
  ],
  materials: [
    ...finishingMaterials('wall-repair'),
    substratePrimerMaterial('wall-repair'),
  ],
  tools: [
    { id: 'spatula', name: 'Szpachelka 10 cm', icon: 'minus', required: true, estimatedBuyCostPLN: 10 },
    // source: https://www.bosch-professional.com/pl/pl/klocki-szlifierskie-zapiecie-na-rzepy-2868585-ocs-ac/
    // source: https://intercars.pl/produkty/9e076f-klocek-szlifierski-do-recznego-szlifowania-130-x-70mm-260101
    { id: 'sanding-block', name: 'Klocek do szlifowania ręcznego', icon: 'layers', required: true, notes: 'Dobierz klocek do zwykłych arkuszy: owijany papierem lub z zaciskami. Sam rzep wymaga arkuszy z odpowiednim podkładem. Papier o wybranych gradacjach jest osobno w materiałach.' },
    { id: 'brush', name: 'Pędzelek do gruntowania', icon: 'edit-3', required: true, shopPrices: SHARED_SHOP_PRICES.brush50mm },
  ],
  instructions: [
    { step: 1, title: 'Powiększ i oczyść ubytek', description: 'Nożem lub szpachelką poszerz rysę do ok. 3–5 mm (klucz do trwałej naprawy). Usuń luźne kawałki tynku wokół dziury. Odkurz starannie z kurzu.', durationMin: 15 },
    { step: 2, title: 'Przygotuj suche podłoże', description: 'ST10 wymaga nośnego, suchego i odpylonego podłoża. Podłoże chłonne przygotuj zgodnie z kartą gruntu i masy; gładki beton wymaga osobnego podkładu kontaktowego. Nie zastępuj gruntowania zwilżeniem wodą.', durationMin: 5 },
    { step: 3, title: 'Wypełnij masą', description: 'Szpachelką wciśnij masę w ubytek, wyrównaj z powierzchnią ściany. ST10 nanosi się w warstwie 1–3 mm; do 30 mm wyłącznie przy pojedynczych ubytkach zgodnie z kartą produktu. Na stabilne rysy zastosuj przewidzianą taśmę i zatop ją w masie.', tip: 'Nie nakładaj od razu grubej warstwy — będzie pękać.', durationMin: 30 },
    { step: 4, title: 'Czekaj na pełne wyschnięcie', description: 'Poczekaj 2–8 godzin (zależy od produktu — sprawdź instrukcję). Masa zmieni kolor z ciemnego na jasny. Masa MUSI być całkowicie sucha przed szlifowaniem.', durationMin: 240, surfaceMustBeDry: true },
    { step: 5, title: 'Szlifuj na gładko', description: 'Po wyschnięciu szlifuj wybraną gradacją 100–150 zgodnie z kartą ST10. Drobniejszy P240 jest opcjonalny, jeśli wymaga go dalsze wykończenie. Odpyl podłoże.', tip: 'Wyczuj palcami czy jest równo.', durationMin: 20, removeDustBeforeNext: true },
    { step: 6, title: 'Odkurz z pyłu', description: 'Odkurzaczem lub wilgotną szmatką starannie usuń cały pył po szlifowaniu. Pył uniemożliwia prawidłowe gruntowanie i malowanie.', durationMin: 10 },
    { step: 7, title: 'Zagruntuj i maluj', description: 'Na naprawione miejsca nanieś grunt (obowiązkowy — naprawione miejsce jest chłonne). Poczekaj na wyschnięcie, a potem maluj.', durationMin: 30, surfaceMustBeDry: true },
  ],
  commonMistakes: ['Szpachlowanie bez oczyszczenia i poszerzenia rysy — masa odpada', 'Za gruba warstwa na raz — masa pęka', 'Brak gruntowania naprawionego miejsca — farba inaczej wsiąka', 'Szlifowanie przed pełnym wyschnięciem masy — ściera się nierówno', 'Brak usunięcia pyłu po szlifowaniu — grunt i farba nie trzymają się'],
  qualityChecklist: [
    { id: 'q1', description: 'Naprawione miejsca równe ze ścianą — brak wybrzuszeń' },
    { id: 'q2', description: 'Po zagruntowaniu kolor jest jednolity' },
  ],
  hireProfessionalRecommended: false,

  verifiedAt: '2026-07-10',
  verifiedSources: [
    {
      title:       'Naprawa tynku. Szpachlowanie rys i pęknięć',
      url:         'https://muratordom.pl/remont-domu/odnawianie-wnetrz/naprawa-tynku-szpachlowanie-rys-i-pekniec-aa-22g5-rsVk-J3gH.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Szpachlowanie ────────────────────────────────────────────────────────────

export const skimCoatJob: RenovationJob = {
  // source: https://www.acrylputz.pl/produkty/gladzie-sypkie/acrylputz-st10-start
  id: 'skim-coat',
  slug: 'szpachlowanie-scian',
  categoryId: 'skim-coat',
  name: 'Szpachlowanie ścian',
  shortDescription: 'Wyrównaj ściany masą szpachlową — gotowe pod farbę lub tapetę.',
  description: 'Szpachlowanie to wyrównanie ścian cienką warstwą masy gipsowej. Wymaga cierpliwości i dobrego szlifowania. Efekt: gładka ściana gotowa pod farbę bez widocznych nierówności.',
  difficulty: 'medium',
  riskLevel: 'low',
  estimatedDays: 2,
  estimatedMessLevel: 3,
  visibilityMode: 'caution',
  coverIcon: 'edit-3',
  warningRules: [
    { condition: 'always', message: 'Szpachlowanie całych ścian wymaga wprawy. Przy dużej powierzchni (>30 m²) rozważ zatrudnienie fachowca.', level: 'info' },
    { condition: 'always', message: 'Kurz z szlifowania gipsu jest szkodliwy — używaj maski P2 i wentyluj pomieszczenie.', level: 'warning' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Powierzchnia ścian do szpachlowania', unit: 'm²', inputType: 'area',
      placeholder: 'np. 40', min: 1, max: 500,
      hint: 'Długość × wysokość każdej ściany. Zsumuj wszystkie.' },
    { id: 'layers', label: 'Liczba warstw szpachli', unit: 'warstwy', inputType: 'count',
      placeholder: '2', defaultValue: 2, min: 1, max: 4,
      hint: 'Zwykle 2–3 warstwy dla ściany gotowej pod malowanie. Grubość każdej warstwy ST10 wpisz osobno (1–3 mm).' },
    ...finishingInputs('skim-coat'),
    ...substratePrimerInputs('skim-coat'),
  ],
  materials: [
    ...finishingMaterials('skim-coat'),
    substratePrimerMaterial('skim-coat'),
  ],
  tools: [
    { id: 'trowel-large', name: 'Paca stalowa 40–60 cm', icon: 'minus', required: true, notes: 'Do rozkładania masy na dużej powierzchni', estimatedBuyCostPLN: 80 },
    { id: 'trowel-small', name: 'Szpachelka 15–20 cm', icon: 'minus', required: true, estimatedBuyCostPLN: 20 },
    { id: 'bucket', name: 'Wiadro 10–20 litrów', icon: 'circle', required: true },
    { id: 'drill-mixer', name: 'Wiertarka z mieszadłem', icon: 'settings', required: true, rentable: true, estimatedRentCostPLN: 40 },
    // source: https://www.bosch-professional.com/pl/pl/klocki-szlifierskie-zapiecie-na-rzepy-2868585-ocs-ac/
    // source: https://intercars.pl/produkty/9e076f-klocek-szlifierski-do-recznego-szlifowania-130-x-70mm-260101
    { id: 'sander', name: 'Klocek do szlifowania ręcznego', icon: 'layers', required: true, notes: 'Do zwykłych arkuszy 230 × 280 mm dobierz klocek owijany papierem lub z zaciskami. Sam rzep nie trzyma zwykłego papieru. Przy wyborze szlifierki dobierz osobno pasujące krążki lub siatki.' },
    { id: 'lamp', name: 'Lampa robocza', icon: 'sun', required: false, notes: 'Boczne światło pokaże nierówności' },
    { id: 'mask', name: 'Maska przeciwpyłowa P2', icon: 'shield', required: true, safetyNote: 'Kurz gipsowy jest szkodliwy dla płuc.' },
  ],
  safetyEquipment: [
    { id: 'mask', name: 'Maska pyłowa P2', icon: 'shield', required: true, notes: 'Kurz gipsowy jest szkodliwy — obowiązkowa przy szlifowaniu.' },
    { id: 'goggles', name: 'Okulary ochronne', icon: 'eye', required: false, notes: 'Przy szlifowaniu suitu lub góry ściany.' },
  ],
  dryingTimes: [
    { afterStep: 1, description: 'Grunt przed szpachlowaniem', minHours: 2, maxHours: 4 },
    { afterStep: 3, description: 'Pierwsza warstwa masy', minHours: 4, maxHours: 8, conditions: 'Suchy pokój, 20°C' },
    { afterStep: 5, description: 'Kolejne warstwy', minHours: 4, maxHours: 8 },
  ],
  instructions: [
    { step: 1, title: 'Przygotuj ścianę i nanieś grunt', description: 'Oczyść ścianę, napraw duże ubytki, nanieś grunt. Poczekaj na wyschnięcie (2–4 h).', durationMin: 60 },
    { step: 2, title: 'Wymieszaj masę szpachlową', description: 'Wsyp suchą masę do wody (nie odwrotnie!) i wymieszaj mieszadłem na gładką pastę bez grudek. Konsystencja jak gęsta śmietana.', tip: 'Używaj czystego sprzętu — resztki starej masy psują nową.', durationMin: 15 },
    { step: 3, title: 'Pierwsza warstwa', description: 'Pacą nanieś cienką warstwę masy (grubość zgodna z instrukcją produktu — zazwyczaj 1–3 mm, zależy od masy). Rób pasy poziome lub pionowe. Nie poprawiaj gdy zaczyna schnąć.', tip: 'Lepiej za mało niż za dużo — za gruba warstwa pęka. Sprawdź maksymalną grubość na opakowaniu.', durationMin: 120 },
    { step: 4, title: 'Czekaj na pełne wyschnięcie', description: 'Warstwa MUSI być całkowicie sucha w dotyku (czas schnięcia zależy od produktu i warunków — sprawdź instrukcję). Szlifuj dopiero po pełnym wyschnięciu.', durationMin: 300, surfaceMustBeDry: true },
    { step: 5, title: 'Kolejne warstwy', description: 'Przeszlifuj papierem 150, odkurz pył odkurzaczem (nie zdmuchuj — pył osiada z powrotem). Nanieś kolejną warstwę. Powtórz.', durationMin: 120, removeDustBeforeNext: true },
    { step: 6, title: 'Finalne szlifowanie i odkurzenie', description: 'Do ST10 producent zaleca gradację 100–150. Drobniejszy P240 dobierz opcjonalnie do dalszego wykończenia. Sprawdzaj pod kątem bocznym światłem. Po szlifowaniu odkurz CAŁY pył — pył gipsowy uniemożliwia prawidłowe gruntowanie i malowanie.', tip: 'Gładką ścianę czuć i widać. Czas na szlifowanie procentuje przy malowaniu.', durationMin: 180, removeDustBeforeNext: true },
  ],
  manufacturerPriorityNote: 'Grubość warstwy i czas schnięcia zależą od produktu — zawsze sprawdź instrukcję producenta.',
  removeDustBeforeFinishNote: 'Po każdym szlifowaniu odkurz pył odkurzaczem. Pył gipsowy uniemożliwia prawidłowe gruntowanie i malowanie.',
  commonMistakes: ['Za gruba warstwa na raz — masa pęka', 'Szpachlowanie na mokrym gruncie — masa się nie trzyma', 'Niedomiesana masa — grudki widać przez farbę', 'Brak finalnego szlifowania — farba uwydatni nierówności', 'Szlifowanie przed pełnym wyschnięciem masy — ściera się nierówno i tworzy fale', 'Pozostawienie pyłu po szlifowaniu — grunt i farba nie trzymają się podłoża'],
  qualityChecklist: [
    { id: 'q1', description: 'Ściana jest gładka w dotyku — brak grudek', critical: true },
    { id: 'q2', description: 'Brak pęknięć w masie szpachlowej' },
    { id: 'q3', description: 'Pod bocznym światłem nie widać wyraźnych fal' },
  ],
  hireProfessionalRecommended: false,

  verifiedAt: '2026-07-10',
  verifiedSources: [
    {
      title:       'Jak położyć gładź na ścianie, by uniknąć nierówności i pęknięć? Czytaj poradnik i zabieraj się do pracy',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/jak-polozyc-gladz-na-scianie-by-uniknac-nierownosci-i-pekniec-czytaj-poradnik-i-zabieraj-sie-do-pracy-aa-3MBZ-DbNK-Yd8c.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Tapetowanie ──────────────────────────────────────────────────────────────

export const wallpaperInstallJob: RenovationJob = {
  id: 'wallpaper-install',
  slug: 'tapetowanie',
  categoryId: 'wallpaper',
  subcategory: 'interior',
  name: 'Tapetowanie ścian',
  shortDescription: 'Połóż tapety — krok po kroku, bez bąbli i krzywych szwów.',
  description: 'Tapetowanie wymaga precyzji i dobrego przygotowania ściany. Klej musi być właściwie wymieszany, a tapety rozplanowane od osi lub okna. Efekt zależy od jakości przygotowania podłoża.',
  difficulty: 'medium',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 2,
  visibilityMode: 'safe_diy',
  coverIcon: 'layers',
  warningRules: [
    { condition: 'always', message: 'Ściana musi być gładka, sucha i zagruntowana specjalnym gruntem pod tapety.', level: 'warning' },
    { condition: 'always', message: 'Rozplanuj układ przed klejeniem — pierwsze pasy decydują o całości.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Łączna powierzchnia ścian do tapetowania', unit: 'm²', inputType: 'area',
      placeholder: 'np. 35', min: 1, max: 400,
      hint: 'Długość × wysokość każdej ściany. Odejmij okna i drzwi.' },
    ...substratePrimerInputs('wallpaper-install'),
    ...wallpaperAdhesiveInputs,
    ...wallpaperRollInputs,
    ...wallpaperTapeInputs,
  ],
  materials: [
    {
      id: 'wallpaper',
      name: 'Tapeta (rolki)',
      unit: 'm²',
      formulaKey: 'wallpaper',
      wasteFactor: 1.15,
      roundingRule: 'ceil',
      packaging: { size: 5.33, label: 'rolka (ok. 5,3 m²)', purchaseUnit: 'rolka' },
      pricePerUnit: 18,
      category: 'tapety',
      notes: 'Standardowa rolka: 10,05 m × 0,53 m = ok. 5,3 m². Sprawdź wymiary na opakowaniu. Ceny tapet są bardzo zróżnicowane: marketowe 50–100 zł/rolka, designerskie/premium 200+ zł/rolka — wpisz cenę wybranej tapety.',
    },
    {
      id: 'wallpaper-glue',
      name: 'Klej do tapet',
      unit: 'kg',
      formulaKey: 'wallpaperGlue',
      roundingRule: 'ceil',
      packaging: { size: 0.2, label: 'opakowanie 200 g', purchaseUnit: 'opakowanie' },
      pricePerUnit: 15,
      category: 'klej',
      notes: 'Wybierz rodzaj tapety w obmiarach. Dobieramy Metylan Direct 200 g do flizeliny lub Normal 125 g do papieru; zużycie zależy od wariantu tapety. Bez wyboru ilość i cena kleju pozostają nieustalone.',
    },
    substratePrimerMaterial('wallpaper-install'),
    {
      id: 'masking-tape-wallpaper',
      name: 'Taśma malarska (do zabezpieczenia)',
      brand: 'Tesa Taśma malarska Standard 25 mm × 50 m (referencja)',
      unit: 'rolka',
      formulaKey: 'tape',
      pricePerUnit: 8,
      category: 'akcesoria',
      shopPrices: SHARED_SHOP_PRICES.paintersTape25mm,
    },
  ],
  tools: [
    { id: 'pasting-table', name: 'Stół do tapetowania (lub blat)', icon: 'square', required: true, notes: 'Do nakładania kleju na tapetę' },
    { id: 'wallpaper-brush', name: 'Szczotka do tapetowania', icon: 'edit-2', required: true, estimatedBuyCostPLN: 20 },
    { id: 'squeegee', name: 'Wałek lub gąbka do wygładzania', icon: 'minus', required: true },
    { id: 'plumb-line', name: 'Pion (nić z ciężarkiem)', icon: 'minus', required: true, notes: 'Pierwszy pas musi być pionowy — od tego zależy reszta' },
    { id: 'sharp-knife', name: 'Nóż tapicerski (wymieniać ostrza!)', icon: 'scissors', required: true },
    { id: 'seam-roller', name: 'Wałek do spoin', icon: 'circle', required: true },
    { id: 'bucket-wallpaper', name: 'Wiadro na klej', icon: 'circle', required: true },
  ],
  instructions: [
    { step: 1, title: 'Przygotuj ścianę', description: 'Ściana musi być sucha, gładka i czysta. Nanieś grunt pod tapety. Poczekaj na wyschnięcie.', durationMin: 60 },
    // source: https://datasheets.tdx.henkel.com/METYLAN-Direct-pl_PL.pdf
    // source: https://datasheets.tdx.henkel.com/METYLAN-Normal-pl_PL.pdf
    { step: 2, title: 'Wymieszaj właściwy klej', description: 'Wsyp proszek do odmierzonej zimnej wody i wymieszaj według etykiety. Metylan Direct: około 3–5 minut przygotowania; Normal: około 20 minut. Ilość wody zależy od rodzaju tapety.', tip: 'Nie stosuj jednej proporcji do wszystkich klejów. Sprawdź kartę wybranego opakowania i zalecenia producenta tapety.', durationMin: 20 },
    { step: 3, title: 'Wyznacz pionową oś', description: 'Używając pionu wyznacz pionową linię na ścianie. Pierwszy pas przyklejaj wzdłuż tej linii.', tip: 'Ściany i podłogi rzadko są idealne pionowo/poziomo — zaufaj pionowi, nie narożniku.', durationMin: 15 },
    { step: 4, title: 'Nałóż klej i wieszaj tapetę', description: 'Sposób zależy od rodzaju tapety: tapety papierowe — nanieś klej na tapetę, złóż klejem do wewnątrz i odczekaj czas namaczania (3–10 min, wg instrukcji); tapety flizelinowe — nanieś klej bezpośrednio na ścianę (NIE na tapetę). Zawsze sprawdź symbole na opakowaniu.', tip: 'Czas namaczania i sposób klejenia różni się w zależności od tapety — ZAWSZE czytaj instrukcję na opakowaniu.', durationMin: 180 },
    { step: 5, title: 'Przyklejaj i wygładzaj', description: 'Rozłóż tapetę od góry, przyklejaj do ściany i wygładzaj szczotką od środka na zewnątrz — od góry do dołu. Usuń powietrze i nadmiar kleju.', tip: 'Klej na łączeniach — zetrzyj wilgotną gąbką natychmiast.', durationMin: 60 },
    { step: 6, title: 'Dotnij na dole i górze', description: 'Ostrym nożem dotnij tapetę przy podłodze i suficie. Zawsze wymieniaj ostrze — tępe ostrze drze tapetę.', durationMin: 30 },
  ],
  dryingTimes: [
    { afterStep: 1, description: 'Grunt pod tapety', minHours: 4, maxHours: 12 },
    { afterStep: 6, description: 'Tapety — pełne wyschnięcie', minHours: 24, maxHours: 48 },
  ],
  cleanupSteps: [
    'Zetrzyj klej ze ścian i podłogi wilgotną gąbką — schnie trudno.',
    'Umyj szczotki i wałki ciepłą wodą natychmiast po pracy.',
    'Pozostaw tapetę do wyschnięcia w warunkach wskazanych przez jej producenta.',
  ],
  commonMistakes: [
    'Nieodczekanie czasu namaczania kleju — tapeta się przesuwa',
    'Bąble pod tapetą — klej nałożony nierównomiernie',
    'Krzywe łączenia — nie używanie pionu',
    'Tapetowanie na niezagruntowaną ścianę — tapeta trudna do ściągnięcia w przyszłości',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Szwy między pasami są niewidoczne z normalnej odległości', critical: true },
    { id: 'q2', description: 'Tapeta leży gładko — brak bąbli i pomarszczenia' },
    { id: 'q3', description: 'Wzór jest wyrównany między pasami (przy tapetach z wzorem)' },
    { id: 'q4', description: 'Górna i dolna krawędź są równo docięte' },
  ],
  adhesiveApplicationMode: 'Zależy od rodzaju tapety: flizelinowa — klej na ścianę; papierowa — klej na tapetę + czas namaczania; winylowa na papierze — klej na tapetę + dłuższy czas namaczania. Zawsze sprawdź symbole na rolce.',
  manufacturerPriorityNote: 'Czas namaczania, typ kleju i sposób aplikacji zależą od rodzaju tapety — zawsze sprawdź instrukcję i symbole na opakowaniu.',
  hireProfessionalRecommended: false,
  tags: ['tapety', 'tapetowanie', 'klej', 'ściany'],

  verifiedAt: '2026-07-10',
  verifiedSources: [
    {
      title:       'Tapetowanie ścian — jak samodzielnie położyć tapetę? Wideo "Murator Remontuje"!',
      url:         'https://muratordom.pl/murator-remontuje/tapetowanie-scian-jak-samodzielnie-polozyc-tapete-wideo-murator-remontuje-aa-2vFB-shut-fLpq.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Zrywanie tapet ───────────────────────────────────────────────────────────

export const wallpaperRemoveJob: RenovationJob = {
  id: 'wallpaper-remove',
  slug: 'zrywanie-tapet',
  categoryId: 'wallpaper',
  name: 'Zrywanie starych tapet',
  shortDescription: 'Usuń stare tapety — szybko i bez zniszczenia tynku.',
  description: 'Zrywanie tapet jest proste przy odpowiednim nasiąkaniu. Klucz to dobry środek do zmiękczania i cierpliwość — mokra tapeta schodzi bez niszczenia ściany.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 3,
  visibilityMode: 'safe_diy',
  coverIcon: 'x',
  warningRules: [
    { condition: 'always', message: 'Przed namaczaniem wyłącz zasilanie obwodów w pomieszczeniu i zabezpiecz gniazda przed wodą.', level: 'warning' },
    { condition: 'always', message: 'Stare tapety mogą kryć pod sobą pęknięcia lub wilgoć — sprawdź ścianę po zdjęciu.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Powierzchnia tapet do zerwania', unit: 'm²', inputType: 'area',
      placeholder: 'np. 40', min: 1, max: 500,
      hint: 'Powierzchnia ścian pokrytych tapetą.' },
    ...removalInputs,
    ...substratePrimerInputs('wallpaper-remove'),
  ],
  materials: [
    ...removalMaterials(),
    substratePrimerMaterial('wallpaper-remove'),
  ],
  tools: [
    { id: 'scorer', name: 'Perforator do tapet (kolczatka)', icon: 'grid', required: false, notes: 'Nakleja nakłucia pozwalające wnikać wodzie. Pomocna przy grubych tapetach.', estimatedBuyCostPLN: 15 },
    { id: 'spray-bottle', name: 'Wiadro i pędzel lub szczotka do roztworu', icon: 'droplet', required: true, notes: 'Karta Metylan dopuszcza natrysk wyłącznie dla profesjonalnego wykonawcy.' },
    { id: 'scraper-wide', name: 'Szpachelka szeroka (20–30 cm)', icon: 'minus', required: true, estimatedBuyCostPLN: 25 },
    { id: 'drop-cloth-remove', name: 'Folia ochronna — uwzględniona w materiałach', icon: 'layers', required: false, notes: 'Powierzchnię folii podaj w obmiarach materiałów; nie kupuj drugi raz jako narzędzia.' },
    { id: 'bucket-remove', name: 'Wiadro', icon: 'circle', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zabezpiecz podłogę i wyłącz prąd', description: 'Rozłóż folię na podłodze — zdarta tapeta jest mokra i brudna. Wyłącz bezpieczniki w zrywanym pokoju.', durationMin: 15 },
    { step: 2, title: 'Perforuj tapetę (jeśli nieprzemakalna)', description: 'Nieprzemakalne tapety (winylowe) najpierw nakłuj perforatorem kolcowym. Pozwoli to wodzie wniknąć pod tapetę.', durationMin: 15 },
    // source: https://datasheets.tdx.henkel.com/METYLAN-Remover-pl_PL.pdf
    { step: 3, title: 'Namocz tapetę zgodnie z próbą', description: 'Metylan Remover rozcieńcz według rodzaju tapety: papier/flizelina 1:40, ciężka/raufaza/szklana 1:20. Nakładaj pędzlem lub szczotką na małe odcinki. Po 5–10 min zdejmuj bryty; pozostałe tapety karta zaleca namoczyć 2 razy. Kilka warstw zdejmuj kolejno.', tip: 'Wykonaj próbę i chroń wrażliwe powierzchnie. Resztki roztworu usuń wilgotną, nie mokrą gąbką. Natrysk jest tylko dla profesjonalnego wykonawcy.', durationMin: 30 },
    { step: 4, title: 'Zrywaj tapetę', description: 'Szpachelką lub rękoma oddziel tapetę od ściany zaczynając od naroża lub łączenia. Pracuj od góry do dołu.', tip: 'Tapeta powinna schodzić w dużych kawałkach. Jeśli drze się na małe kawałki — jeszcze za sucha.', durationMin: 120 },
    { step: 5, title: 'Usuń resztki kleju', description: 'Na ścianie zostaje warstwa kleju — namocz i zetrzyj gąbką lub szpachelką.', durationMin: 60 },
    { step: 6, title: 'Napraw ścianę i zagruntuj', description: 'Sprawdź stan ściany po zerwaniu. Napraw ubytki masą. Po wyschnięciu nanieś grunt wzmacniający.', durationMin: 60 },
  ],
  cleanupSteps: [
    'Zbierz mokre kawałki tapet do worków — ciężkie, nie wsypuj luzem.',
    'Zetrzyj klej ze ścian nim zaschnie.',
    'Wywietrz pomieszczenie przez kilka godzin.',
  ],
  commonMistakes: [
    'Zrywanie na sucho — tapeta drze się na drobne kawałki i niszczy tynk',
    'Nie wyłączenie prądu przy namaczaniu — ryzyko zwarcia',
    'Pominięcie gruntu po zerwaniu — ściana jest za chłonna',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Żadne kawałki starej tapety nie pozostały na ścianie' },
    { id: 'q2', description: 'Resztki kleju usunięte ze ścian' },
    { id: 'q3', description: 'Ściana zagruntowana po wyschnięciu' },
  ],
  hireProfessionalRecommended: false,
  tags: ['tapety', 'zrywanie', 'ściany'],

  verifiedAt: '2026-10-27',
  verifiedSources: [
    { title:'Metylan Remover — karta techniczna: koncentrat, rozcieńczenie i nanoszenie', url:'https://datasheets.tdx.henkel.com/METYLAN-Remover-pl_PL.pdf', domain:'datasheets.tdx.henkel.com', consultedAt:'2026-10-27' },
    { title:'Metylan Remover 500 ml — dokładny produkt i opakowanie', url:'https://www.abud.pl/product-pol-5708-Plyn-do-usuwania-tapet-500ml-Metylan.html', domain:'abud.pl', consultedAt:'2026-10-27' },
    { title:'ACRYL-PUTZ ST10 START — zużycie i zastosowanie masy naprawczej', url:'https://www.acrylputz.pl/produkty/gladzie-sypkie/acrylputz-st10-start', domain:'acrylputz.pl', consultedAt:'2026-10-27' },
    {
      title:       'Zrywanie tapety krok po kroku. Instrukcja, jak zerwać tapetę ze ściany',
      url:         'https://www.castorama.pl/usuwanie-tapety-ins-66410.html',
      domain:      'castorama.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Tynkowanie ścian (tynki gipsowe / cementowo-wapienne) ────────────────────
// NOWY job (etap dotąd nieobecny — app miała tylko szpachlowanie/gładzie skim-coat,
// a tynk cienkowarstwowy jest tylko na elewacji BSO). To tynk BAZOWY wewnętrzny na
// surowym murze/pustaku/betonie: gips maszynowy/ręczny lub cementowo-wapienny.
// Materiały bazowe (tynk + grunt/kontakt + narożnik) mają realne EAN w katalogu cen
// (data/prices/materials.ts) i mapowanie tierów w data/prices/mappings.ts.

// source: https://knauf.com/pl-PL/p/produkt/knauf-mp-75-10256_0120
// source: https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120
export const wallPlasteringJob: RenovationJob = {
  id: 'wall-plastering',
  slug: 'tynkowanie-scian',
  categoryId: 'plaster',
  subcategory: 'interior',
  name: 'Tynkowanie ścian',
  shortDescription: 'Wykonaj tynk bazowy na surowym murze — gipsowy lub cementowo-wapienny.',
  description:
    'Tynk bazowy wyrównuje surowe ściany (cegła, pustak, beton komórkowy, beton) i tworzy nośne podłoże pod gładź, malowanie, tapetę lub płytki. Do wyboru: tynk gipsowy (maszynowy MP 75 lub ręczny Goldband), także do zwykle użytkowanych kuchni i łazienek przy wilgotności do 70%; albo cementowo-wapienny Baumit MPI 25 do odpowiednich warunków pomieszczenia. Strefy narażone na wodę wymagają dobranej hydroizolacji. Kluczowe: grunt/kontakt dobrany do podłoża, narożniki na krawędziach zewnętrznych i ściąganie łatą h.',
  beginnerFriendlyDescription:
    'To pierwsza gruba warstwa na gołej ścianie — wyrównuje krzywizny i daje równe podłoże. Wybierz konkretny tynk według podłoża, wilgotności i wykończenia. Gipsowy Knauf jest dopuszczony również w zwykle użytkowanych kuchniach i łazienkach przy wilgotności do 70%. Tynkowanie dużych powierzchni agregatem powierz ekipie; do pracy ręcznej dobierz tynk ręczny, np. Goldband. Gładź jest osobnym, cieńszym etapem wykończenia.',
  difficulty: 'hard',
  riskLevel: 'low',
  estimatedDays: 2,
  estimatedMessLevel: 3,
  visibilityMode: 'caution',
  coverIcon: 'layers',
  warningRules: [
    { condition: 'always', message: 'Dobierz tynk do wilgotności i wykończenia. Knauf dopuszcza gipsowe także w zwykle użytkowanych kuchniach i łazienkach przy wilgotności do 70%; strefy narażone na wodę wymagają odpowiedniego systemu hydroizolacji.', level: 'warning' },
    // source: https://knauf.com/api/download-center/v1/assets/7639fea2-44c7-4c59-b464-b436316de77a?country=pl&download=true
    { condition: 'always', message: 'Dobierz przygotowanie do konkretnego tynku i podłoża. Pod gipsowe Knauf: Betokontakt na gładki niechłonny beton, Grundiermittel 60 na chłonny mur. Dla koncentratu potwierdź rozcieńczenie i wydajność po próbie na podłożu. System Baumit wymaga osobnego doboru według karty producenta.', level: 'warning' },
    { condition: 'large-area', message: 'Tynk maszynowy na dużych powierzchniach wymaga agregatu i wprawy — przy >30 m² rozważ ekipę tynkarską.', level: 'info' },
    { condition: 'always', message: 'Pył gipsowy i praca z agregatem — używaj maski P2 i okularów, wietrz pomieszczenie.', level: 'warning' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Powierzchnia ścian do otynkowania', unit: 'm²', inputType: 'area',
      placeholder: 'np. 40', min: 1, max: 500,
      hint: 'Długość × wysokość każdej ściany. Zsumuj wszystkie. Odejmij okna i drzwi.' },
    { id: 'plasterThickness', label: 'Średnia grubość tynku', unit: 'mm', inputType: 'length',
      placeholder: '10', defaultValue: 10, min: 8, max: 30, required: false,
      hint: 'Średnia grubość według pomiarów. Gipsowe w tym kalkulatorze: 8–30 mm; Baumit MPI 25 na ścianie: 10–25 mm. Grubości poza zakresem wymagają osobnego doboru.' },
    ...plasterInputs,
  ],
  materials: plasterMaterials(),
  tools: [
    { id: 'plaster-mixer', name: 'Wiertarka z mieszadłem / agregat tynkarski', icon: 'settings', required: true, rentable: true, estimatedRentCostPLN: 120, notes: 'Ręcznie — mieszadło; maszynowo — agregat PFT G4 (wynajem).' },
    { id: 'plaster-hawk', name: 'Paca stalowa i kielnia', icon: 'minus', required: true, estimatedBuyCostPLN: 60 },
    { id: 'plaster-h-rule', name: 'Łata h / trapezowa 2 m (do ściągania)', icon: 'maximize-2', required: true, estimatedBuyCostPLN: 90, notes: 'Do ściągnięcia tynku do płaszczyzny listew/narożników.' },
    { id: 'plaster-float', name: 'Paca gąbkowa / filcowa (do zacierania)', icon: 'square', required: true, estimatedBuyCostPLN: 25 },
    { id: 'plaster-bucket', name: 'Wiadro 20–30 litrów', icon: 'circle', required: true },
    { id: 'plaster-level', name: 'Poziomica / niwelator', icon: 'crosshair', required: true, estimatedBuyCostPLN: 80, notes: 'Do ustawienia pasów kierunkowych i narożników w pionie.' },
    { id: 'plaster-mask', name: 'Maska przeciwpyłowa P2 + okulary', icon: 'shield', required: true, safetyNote: 'Pył gipsowy jest szkodliwy dla płuc.' },
  ],
  safetyEquipment: [
    { id: 'mask', name: 'Maska pyłowa P2', icon: 'shield', required: true, notes: 'Obowiązkowa przy mieszaniu i szlifowaniu.' },
    { id: 'goggles', name: 'Okulary ochronne', icon: 'eye', required: false, notes: 'Przy pracy z agregatem i nad głową.' },
  ],
  dryingTimes: [
    { afterStep: 1, description: 'Betokontakt przed tynkiem gipsowym Knauf', minHours: 12, maxHours: 24, conditions: 'Minimum 12 h; wilgotność i temperatura mogą wydłużyć schnięcie. Inne przygotowanie według własnej karty produktu.' },
    { afterStep: 4, description: 'Tynk gipsowy — pełne wyschnięcie', minHours: 168, maxHours: 336, conditions: 'Ok. 1 dzień na 1 mm grubości; przed gładzią/malowaniem tynk musi być suchy.' },
  ],
  instructions: [
    { step: 1, title: 'Przygotuj podłoże i zagruntuj', description: 'Oceń nośność, chłonność i wilgotność podłoża. Usuń kurz, luźne fragmenty i pozostałości środków antyadhezyjnych. Pod gipsowe Knauf: Betokontakt na gładki niechłonny beton, Grundiermittel 60 na chłonny mur. Ten kalkulator dla koncentratu przyjmuje 1:2; dobierz rozcieńczenie według karty i próby na ścianie. Grunt musi całkowicie wyschnąć przed tynkowaniem, minimum 12 h w warunkach karty. Dla MPI 25 dobierz przygotowanie osobno.', tip: 'Inny grunt na beton i chłonny mur — wybierz według rzeczywistego podłoża.', durationMin: 90, surfaceMustBeDry: true },
    { step: 2, title: 'Zamontuj narożniki i pasy kierunkowe', description: 'Na zewnętrznych krawędziach (ościeża, słupki) osadź narożniki aluminiowe z siatką w zaprawie, ustaw w pionie poziomicą. Na dużych ścianach ustaw pasy/listwy kierunkowe wyznaczające płaszczyznę i grubość tynku.', durationMin: 90 },
    { step: 3, title: 'Wymieszaj tynk', description: 'Wsyp suchą mieszankę do odmierzonej wody (nie odwrotnie) i mieszaj mieszadłem/agregatem na jednolitą masę bez grudek. Zachowaj proporcje wody z opakowania — za rzadki tynk spływa, za gęsty źle się rozprowadza.', tip: 'Gips wiąże szybko — mieszaj tyle, ile zużyjesz w czasie roboczym (ok. 30–45 min).', durationMin: 20 },
    { step: 4, title: 'Narzuć i ściągnij tynk łatą', description: 'Narzuć tynk kielnią lub agregatem między narożnikami/pasami, z lekkim naddatkiem. Ściągnij łatą h do płaszczyzny listew, ruchem zygzakowym od dołu do góry. Uzupełnij zagłębienia i ściągnij ponownie.', warning: 'Nie nakładaj grubszej warstwy niż dopuszcza producent na raz — gruby gips pęka i odpada.', durationMin: 180 },
    { step: 5, title: 'Zwilż i zatrzyj na gładko', description: 'Obróbkę i moment zacierania dobierz do konkretnego produktu. Gips pod płytki pozostaw szorstki: nie wygładzaj ani nie zacieraj, minimum 10 mm według karty Knauf. Pod malowanie, tapetę lub gładź wykończ zgodnie z kartą tynku i wymaganiami kolejnej warstwy.', tip: 'Moment zacierania jest krótki — pracuj partiami, testuj palcem.', durationMin: 120 },
  ],
  manufacturerPriorityNote: 'Maksymalna grubość jednej warstwy, proporcje wody i czas wiązania zależą od produktu — zawsze sprawdź instrukcję na worku.',
  commonMistakes: [
    'Tynkowanie bez gruntu/kontaktu — tynk odpada od gładkiego betonu lub „pije" wodę z chłonnego muru i pęka.',
    'Za gruba warstwa na raz — tynk pęka, spływa i odspaja się.',
    'Dobór tynku bez oceny wilgotności, obciążeń i planowanego wykończenia; brak hydroizolacji w strefie narażonej na wodę.',
    'Brak narożników na krawędziach zewnętrznych — róg się wykrusza.',
    'Zacieranie w złym momencie — za wcześnie ciągnie, za późno nie da się zatrzeć.',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Ściana równa — łata 2 m przylega bez prześwitów większych niż 2–3 mm', critical: true },
    { id: 'q2', description: 'Narożniki zewnętrzne proste i w pionie' },
    { id: 'q3', description: 'Brak pęknięć, pustek i odspojeń (opukaj — głuchy dźwięk = pustka)', critical: true },
    { id: 'q4', description: 'Powierzchnia jednolicie zatarta, bez smug i śladów pacy' },
  ],
  hireProfessionalRecommended: false,
  tags: ['tynkowanie', 'tynk', 'gips', 'cementowo-wapienny', 'ściany', 'interior'],

  verifiedAt: '2026-08-24',
  verifiedSources: [
    {title:'Knauf MP 75 — zastosowanie i karta systemu',url:'https://knauf.com/pl-PL/p/produkt/knauf-mp-75-10256_0120',domain:'knauf.com',consultedAt:'2026-10-28'},
    {title:'Knauf Goldband — zastosowanie i karta systemu',url:'https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120',domain:'knauf.com',consultedAt:'2026-10-28'},
    {title:'Knauf Betokontakt — grunt do betonu',url:'https://knauf.com/pl-PL/p/produkt/knauf-betokontakt-10251_0120',domain:'knauf.com',consultedAt:'2026-10-28'},
    {title:'Knauf Grundiermittel 60 — karta 08/2026, wydajność przy 1:2',url:'https://knauf.com/api/download-center/v1/assets/7639fea2-44c7-4c59-b464-b436316de77a?country=pl&download=true',domain:'knauf.com',consultedAt:'2026-10-28'},
    {title:'Knauf Profix — siatka do tynków gipsowych',url:'https://knauf.com/pl-PL/p/produkt/knauf-profix-10681_0120',domain:'knauf.com',consultedAt:'2026-10-28'},
    {
      title:       'Tynk maszynowy Knauf MP 75 25 kg — karta produktu (zużycie, grubość, zastosowanie)',
      url:         'https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd',
      domain:      'castorama.pl',
      consultedAt: '2026-08-24',
    },
    {
      title:       'Tynk gipsowy ręczny Knauf Goldband 25 kg — karta produktu',
      url:         'https://www.castorama.pl/tynk-gipsowy-reczny-knauf-goldband-25-kg/5902367206383_CAPL.prd',
      domain:      'castorama.pl',
      consultedAt: '2026-08-24',
    },
    {
      title:       'Tynk cementowo-wapienny Baumit MPI 25 30 kg — karta produktu',
      url:         'https://mrowka.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html',
      domain:      'mrowka.com.pl',
      consultedAt: '2026-08-24',
    },
  ],
};
