import { waterproofingInputs, waterproofingMaterials } from '@/features/calculator/waterproofing';
import { sanitaryInputs, sanitaryMaterials } from '@/features/calculator/sanitarySealant';
import type { RenovationJob } from '@/types/domain';
import { formulaBuilder } from '@/features/calculator/formula-builder';
import { SHARED_SHOP_PRICES } from '@/data/prices/shared-shop-prices';
import { sinkConnectionQuantity, SINK_FIXING_MATERIAL } from '@/features/calculator/sink';

// ─────────────────────────────────────────────────────────────────────────────
// BATHROOM & WET AREAS JOB GROUP
// Jobs: waterproofing, wall tiles, floor tiles (bathroom), grout (standalone),
//        silicone sealing
// ─────────────────────────────────────────────────────────────────────────────

// ─── Hydroizolacja ────────────────────────────────────────────────────────────

export const waterproofingJob: RenovationJob = {
  id: 'bathroom-waterproofing',
  slug: 'hydroizolacja-lazienki',
  categoryId: 'waterproofing',
  name: 'Hydroizolacja łazienki',
  shortDescription: 'Zabezpiecz łazienkę przed wilgocią — obowiązkowy krok przed płytkami.',
  description: 'Hydroizolacja to elastyczna masa uszczelniająca nakładana przed układaniem płytek. Bez niej woda przesiąka przez spoiny i klej, powodując grzyb i uszkodzenia struktury.',
  difficulty: 'medium',
  riskLevel: 'low',
  estimatedDays: 2,
  estimatedMessLevel: 2,
  visibilityMode: 'safe_diy',
  coverIcon: 'shield',
  warningRules: [
    { condition: 'always', message: 'Hydroizolacja to obowiązkowy krok w łazience — bez niej woda przecieka przez ściany i powoduje grzyb.', level: 'warning' },
    { condition: 'always', message: 'Każda warstwa musi całkowicie wyschnąć przed nałożeniem kolejnej.', level: 'warning' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Powierzchnia ścian (prysznic/wanna)', unit: 'm²', inputType: 'area',
      placeholder: 'np. 12', min: 0, max: 100,
      hint: 'Ściany prysznica lub wanny do wysokości 180–200 cm. Jeśli tylko podłoga — wpisz 0.' },
    { id: 'floorArea', label: 'Powierzchnia podłogi', unit: 'm²', inputType: 'area',
      placeholder: 'np. 5', min: 0, max: 50,
      hint: 'Cała podłoga łazienki.' },
    { id: 'perimeter', label: 'Łączna długość połączeń do uszczelnienia', unit: 'm', inputType: 'length',
      placeholder: 'np. 12', min: 0, max: 50,
      hint: 'Zmierz wszystkie połączenia ściana-podłoga, pionowe naroża, dylatacje i inne odcinki taśmy. Zakłady doliczymy osobno na podstawie liczby łączeń.' },
    ...waterproofingInputs,
  ],
  materials: waterproofingMaterials(),
  tools: [
    { id: 'brush-waterproof', name: 'Pędzel szeroki 10–15 cm', icon: 'edit-2', required: true },
    { id: 'roller-small', name: 'Mały wałek (do powierzchni)', icon: 'edit-2', required: false },
    { id: 'scissors', name: 'Nożyczki do cięcia taśmy', icon: 'scissors', required: true },
  ],
  safetyEquipment: [
    { id: 'gloves', name: 'Rękawice gumowe', icon: 'shield', required: true, notes: 'Masa uszczelniająca może podrażniać skórę.' },
  ],
  instructions: [
    { step: 1, title: 'Przygotuj powierzchnię', description: 'Sprawdź suchość, nośność i przygotowanie podłoża według karty wybranego systemu. Dla chłonnych podłoży w wariancie Mapei dobierz Primer G Pro i odczekaj do pełnego wyschnięcia. Stare płytki wymagają odrębnego gruntu.', durationMin: 60 },
    { step: 2, title: 'Uszczelnij narożniki taśmą', description: 'W narożnikach podłoga-ściana naklej taśmę uszczelniającą wciśniętą w warstwę masy. Nanieś masę → wciśnij taśmę → nanieś masę na taśmę.', tip: 'Narożniki to miejsca najczęstszych przecieków — poświęć im szczególną uwagę.', durationMin: 45 },
    { step: 3, title: 'Pierwsza warstwa masy', description: 'W wariancie Mapegum WPS nałóż pierwszą z co najmniej dwóch warstw zgodnie z kartą. Zużycie około 1,2 kg/m² dotyczy łącznie obu warstw na równym podłożu; nie traktuj go jako zużycia jednej warstwy. Uszczelnij taśmą, narożnikami i dopasowanymi mankietami wszystkie wymagane detale.', durationMin: 90 },
    { step: 4, title: 'Czekaj na wyschnięcie', description: 'Pierwsza warstwa musi całkowicie wyschnąć — masa zmieni kolor z mokrego na suchy. Czas schnięcia zależy od produktu (zazwyczaj 2–4 h). Sprawdź instrukcję producenta.', durationMin: 240, surfaceMustBeDry: true },
    { step: 5, title: 'Druga warstwa (prostopadle)', description: 'Nanieś drugą warstwę prostopadle do pierwszej. Upewnij się że nie ma prześwitów. Łączna grubość obu warstw musi spełniać wymagania producenta.', durationMin: 90 },
    { step: 6, title: 'Czekaj na pełne utwardzenie', description: 'Pełne utwardzenie masy — czas zależy od produktu (zazwyczaj 24 h, ale sprawdź instrukcję). Dopiero po pełnym utwardzeniu można kłaść klej i płytki.', durationMin: 1440, surfaceMustBeDry: true },
  ],
  dryingTimes: [
    { afterStep: 3, description: 'Pierwsza warstwa masy', minHours: 2, maxHours: 4 },
    { afterStep: 5, description: 'Pełne utwardzenie przed płytkami', minHours: 24, maxHours: 48 },
  ],
  manufacturerPriorityNote: 'Grubość warstwy, czas schnięcia i czas utwardzenia zależą od produktu — zawsze sprawdź kartę techniczną producenta.',
  productDependentRules: [
    'Grubość mokrej warstwy masy uszczelniającej — sprawdź w karcie produktu (np. Ceresit CL 51 vs Knauf Hydro Flex mają różne wymagania)',
    'Czas schnięcia między warstwami — od 2 do 6 godzin zależnie od produktu i temperatury',
    'Czas pełnego utwardzenia przed klejeniem płytek — od 24 do 72 godzin zależnie od masy',
  ],
  commonMistakes: ['Pomijanie narożników — tam woda zaczyna przeciekać', 'Zbyt cienka warstwa — masa musi być widocznie pokryta', 'Układanie płytek przed pełnym wyschnięciem masy', 'Pominięcie podłogi', 'Ignorowanie instrukcji producenta dot. grubości i czasu schnięcia'],
  qualityChecklist: [
    { id: 'q1', description: 'Narożniki zakryte taśmą i masą — brak przerw', critical: true },
    { id: 'q2', description: 'Masa na całej powierzchni bez prześwitu' },
    { id: 'q3', description: 'Masa jest sucha i twarda w dotyku' },
  ],
  hireProfessionalRecommended: false,
  tags: ['hydroizolacja', 'łazienka', 'uszczelnienie', 'masa'],

  verifiedAt: '2026-06-09',
  verifiedSources: [
    {
      title:       'Hydroizolacja łazienki krok po kroku. Jak prawidłowo wykonać hydroizolację łazienki?',
      url:         'https://muratordom.pl/budowa/inne-technologie-budowlane/hydroizolacja-lazienki-krok-po-kroku-ten-blad-moze-zniszczyc-sciany-i-kosztowac-fortune-jak-prawidlowo-wykonac-hydroizolacje-lazienki-aa-1u9X-XegK-z2rm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Płytki ścienne (łazienka) ────────────────────────────────────────────────

export const bathroomWallTilesJob: RenovationJob = {
  id: 'wall-tiles-bathroom',
  slug: 'plytki-scienne-lazienka',
  categoryId: 'wall-tiles',
  name: 'Płytki ścienne w łazience',
  shortDescription: 'Wyłóż ściany płytkami — trwałe i estetyczne wykończenie.',
  description: 'Płytki ścienne w łazience wymagają hydroizolacji pod spodem i elastycznego kleju. Kluczowe: pionowe krawędzie i równe spoiny. Na ścianach jest mniej odpadów niż na podłodze.',
  difficulty: 'hard',
  riskLevel: 'low',
  estimatedDays: 2,
  estimatedMessLevel: 3,
  visibilityMode: 'caution',
  coverIcon: 'grid',
  warningRules: [
    { condition: 'always', message: 'Ściana musi być pokryta hydroizolacją przed układaniem płytek w strefach mokrych.', level: 'warning' },
    { condition: 'always', message: 'Używaj elastycznego kleju C2TE — nie twardnieje krucho i nie pęka przy pracy ściany.', level: 'info' },
    { condition: 'beginner', message: 'Układanie płytek na ścianach jest trudniejsze niż na podłodze — grawitacja sprawia, że płytki chcą się zsuwać.', level: 'warning' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Powierzchnia ścian do wyłożenia', unit: 'm²', inputType: 'area',
      placeholder: 'np. 15', min: 1, max: 200,
      hint: 'Suma powierzchni każdej ściany (długość × wysokość). Odejmij otwory.' },
    { id: 'tileWidthCm', label: 'Szerokość płytki', unit: 'cm', inputType: 'dimension',
      placeholder: '30', defaultValue: 30, min: 5, max: 120, required: false },
    { id: 'tileHeightCm', label: 'Długość/wysokość płytki', unit: 'cm', inputType: 'dimension',
      placeholder: '60', defaultValue: 60, min: 5, max: 120, required: false,
      hint: 'Płytki 30×60 cm są popularne na ściany łazienki.' },
    { id: 'wastePercent', label: 'Odpad na cięcia (%)', unit: '%', inputType: 'percent',
      placeholder: '10', defaultValue: 10, min: 5, max: 25, required: false,
      hint: 'Ściany mają mniej cięć niż podłoga. Prosty wzór: 10%. Z wnękami: 15%.' },
    { id: 'groutWidthMm', label: 'Szerokość spoiny', unit: 'mm', inputType: 'dimension',
      placeholder: '2', defaultValue: 2, min: 1, max: 8, required: false,
      hint: 'Na ściany zazwyczaj 1–3 mm.' },
  ],
  materials: [
    {
      id: 'wall-tiles',
      name: 'Płytki ścienne ceramiczne',
      unit: 'm²',
      formulaKey: 'tiles',
      wasteFactor: 1.0,
      roundingRule: 'ceil',
      pricePerUnit: 70,
      category: 'płytki',
      notes: 'Kup z 10% zapasem. Płytki gresowe (R9) do prysznica dla antypoślizgowości.',
    },
    {
      id: 'wall-tile-adhesive',
      name: 'Klej do płytek ściennych C2TE',
      brand: 'Atlas Plus C2TE S1 25 kg (referencja)',
      unit: 'kg',
      formulaKey: 'tileAdhesive',
      wasteFactor: 1.1,
      roundingRule: 'ceil',
      packaging: { size: 25, label: 'worek 25 kg', purchaseUnit: 'worek' },
      pricePerUnit: 2.8,
      category: 'klej',
      notes: 'Klej elastyczny C2TE. Do prysznica stosuj klej do stref mokrych.',
      shopPrices: SHARED_SHOP_PRICES.tileAdhesiveAtlasPlus25kg,
    },
    {
      id: 'wall-grout',
      name: 'Fuga do płytek ściennych',
      brand: 'Atlas Fuga ceramiczna 2 kg (do spoin 2-7 mm) (referencja)',
      unit: 'kg',
      formulaKey: 'grout',
      wasteFactor: 1.1,
      roundingRule: 'ceil',
      packaging: { size: 2, label: 'worek 2 kg', purchaseUnit: 'worek' },
      pricePerUnit: 18,
      category: 'fuga',
      notes: 'Na ściany wystarczy mniejsza paczka niż na podłogę.',
      shopPrices: SHARED_SHOP_PRICES.tileGroutAtlas2kg,
    },
    {
      id: 'wall-crosses',
      name: 'Krzyżyki dystansowe',
      // source: https://sklep.sewera.pl/krzyzyki-dystansowe-3mm-150szt--p12505 (3,46 zł / woreczek 150 szt.; crosses liczy sztuki)
      unit: 'szt',
      formulaKey: 'crosses',
      pricePerUnit: 3.46 / 150,
      category: 'akcesoria',
      notes: 'Szerokość dobierz do spoiny. Szacunek jednostkowy dla 3 mm; wycena zakupów dobiera pełne paczki właściwego modelu.',
    },
    {
      id: 'wall-silicone',
      name: 'Silikon sanitarny (narożniki)',
      brand: 'Soudal Silikon sanitarny biały 280 ml (referencja)',
      unit: 'kartusze',
      formula: formulaBuilder.fixed(2),
      pricePerUnit: 18,
      category: 'uszczelnienie',
      notes: 'W narożnikach ściana-ściana i ściana-podłoga zamiast fugi — elastyczność zapobiega pęknięciom.',
      shopPrices: SHARED_SHOP_PRICES.siliconeSanitary280ml,
    },
    {
      id: 'tile-trim',
      name: 'Profile aluminiowe (narożniki/krawędzie)',
      unit: 'm.b.',
      formula: formulaBuilder.fixed(3),
      pricePerUnit: 12,
      category: 'wykończenie',
      optional: true,
      notes: 'Na otwarte krawędzie i narożniki zewnętrzne.',
    },
  ],
  tools: [
    { id: 'tile-cutter-wall', name: 'Przecinarka do płytek', icon: 'scissors', required: true, rentable: true, estimatedRentCostPLN: 40 },
    { id: 'notched-trowel-wall', name: 'Paca zębata 6 mm (ściany)', icon: 'minus', required: true },
    { id: 'rubber-mallet-wall', name: 'Gumowy młotek', icon: 'tool', required: true },
    { id: 'level-long', name: 'Poziomica 60–120 cm', icon: 'minus', required: true },
    { id: 'suction-cup', name: 'Przyssawka do układania płytek', icon: 'circle', required: false, notes: 'Do dużych płytek — ułatwia obsługę' },
    { id: 'rubber-float-wall', name: 'Paca gumowa do fugowania', icon: 'minus', required: true },
    { id: 'sponge-wall', name: 'Gąbka do czyszczenia fugi', icon: 'circle', required: true },
    { id: 'caulk-gun-wall', name: 'Pistolet do silikonu', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zagruntuj i wyznacz poziom', description: 'Na hydroizolacji nanieś grunt pod klej. Wyznacz poziomą linię startową — punkt startowy powinien być widoczny i symetryczny.', durationMin: 60 },
    { step: 2, title: 'Zacznij od dołu (nad wanną/brodziku)', description: 'Zacznij od najniższego rzędu tuż nad wanną lub podłogą. Pierwsza listwa pozioma decyduje o prostości wszystkich rzędów.', durationMin: 30 },
    { step: 3, title: 'Nałóż klej i układaj płytki', description: 'Pacą zębatą nanieś klej na ścianę. Na duże płytki (powyżej 30×30 cm) stosuj metodę kombinowaną: klej na ścianę I na płytkę. Wciśnij płytkę i lekko obróć. Sprawdzaj poziomnicą. Krzyżyki między płytkami.', tip: 'Klej na ścianie schnie szybciej niż na podłodze — pracuj w małych sekcjach (maks. 0,5 m²). Pokrycie klejem w strefach mokrych musi być 100%.', durationMin: 240 },
    { step: 4, title: 'Czekaj 24 godziny', description: 'Klej musi wyschnąć przed fugowaniem. Nie dotykaj płytek.', durationMin: 1440 },
    { step: 5, title: 'Fuguj i wkładaj silikon', description: 'Fuguj jak na podłodze. W narożnikach — silikon zamiast fugi, bo narożniki pracują.', durationMin: 120 },
    { step: 6, title: 'Montuj wykończenia', description: 'Profile aluminiowe na otwarte krawędzie. Listwy okapowe nad wanną.', durationMin: 30 },
  ],
  dryingTimes: [
    { afterStep: 3, description: 'Klej do płytek ściennych', minHours: 24, maxHours: 48 },
    { afterStep: 5, description: 'Fuga cementowa', minHours: 24, maxHours: 48 },
  ],
  commonMistakes: ['Płytki zsuwają się zanim klej złapie — za mało kleju lub zbyt rzadki', 'Brak poziomowania pierwszego rzędu', 'Fuga w narożnikach — popęka', 'Brak silikonu w strefach ruchu termicznego', 'Niepełne pokrycie klejem w strefach mokrych — woda wnika za płytkę'],
  qualityChecklist: [
    { id: 'q1', description: 'Płytki leżą pionowo i poziomo — bez przechyleń', critical: true },
    { id: 'q2', description: 'Spoiny są równe dookoła' },
    { id: 'q3', description: 'Narożniki uszczelnione silikonem' },
    { id: 'q4', description: 'Profile aluminiowe zakryją krawędzie' },
  ],
  hireProfessionalRecommended: false,
  tags: ['płytki', 'ścienne', 'łazienka', 'prysznic'],

  verifiedAt: '2026-06-09',
  verifiedSources: [
    {
      title:       'Jak układać płytki na ścianie? Zobacz nowe WIDEO „Murator Remontuje"',
      url:         'https://muratordom.pl/murator-remontuje/jak-ukladac-plytki-na-scianie-zobacz-nowe-wideo-murator-remontuje-aa-Bm4p-9vUn-L4HF.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Fugowanie (standalone) ───────────────────────────────────────────────────

export const groutJob: RenovationJob = {
  id: 'grout-only',
  slug: 'fugowanie-plytek',
  categoryId: 'grout',
  name: 'Fugowanie płytek',
  shortDescription: 'Wypełnij spoiny między płytkami fugą — ostatni etap kafelkowania.',
  description: 'Fugowanie to wypełnienie spoin między płytkami. Poprawnie wykonane chroni przed wnikaniem wody i nadaje wykończeniu estetyczny wygląd.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 2,
  visibilityMode: 'safe_diy',
  coverIcon: 'grid',
  warningRules: [
    { condition: 'always', message: 'Klej do płytek musi być całkowicie suchy przed fugowaniem — minimum 24 godziny.', level: 'warning' },
    { condition: 'always', message: 'W narożnikach ściana-podłoga i ściana-ściana zawsze używaj silikonu, nie fugi.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'wallArea', label: 'Łączna powierzchnia płytek', unit: 'm²', inputType: 'area',
      placeholder: 'np. 10', min: 1, max: 300,
      hint: 'Powierzchnia ścian lub podłogi z płytkami.' },
    { id: 'tileWidthCm', label: 'Szerokość płytki', unit: 'cm', inputType: 'dimension',
      placeholder: '30', defaultValue: 30, min: 5, max: 120, required: false },
    { id: 'tileHeightCm', label: 'Długość/wysokość płytki', unit: 'cm', inputType: 'dimension',
      placeholder: '30', defaultValue: 30, min: 5, max: 120, required: false },
    { id: 'groutWidthMm', label: 'Szerokość spoiny', unit: 'mm', inputType: 'dimension',
      placeholder: '3', defaultValue: 3, min: 1, max: 10, required: false },
  ],
  materials: [
    {
      id: 'grout',
      name: 'Fuga cementowa do płytek',
      brand: 'Atlas Fuga ceramiczna 2 kg (referencja)',
      unit: 'kg',
      formulaKey: 'grout',
      wasteFactor: 1.1,
      roundingRule: 'ceil',
      packaging: { size: 2, label: 'worek 2 kg', purchaseUnit: 'worek' },
      pricePerUnit: 18,
      category: 'fuga',
      notes: 'Do spoin wąskich (1–6 mm) — fuga cementowa drobnoziarnista. Kolor dobierz do płytek.',
      shopPrices: SHARED_SHOP_PRICES.tileGroutAtlas2kg,
    },
    {
      id: 'silicone-grout',
      name: 'Silikon sanitarny (narożniki)',
      brand: 'Soudal Silikon sanitarny biały 280 ml (referencja)',
      unit: 'kartusze',
      formula: formulaBuilder.siliconeTubes(6, 'perimeter'),
      pricePerUnit: 18,
      category: 'uszczelnienie',
      notes: 'Użyj silikonu zamiast fugi we wszystkich narożnikach i przy wannie/brodziku.',
      shopPrices: SHARED_SHOP_PRICES.siliconeSanitary280ml,
    },
    {
      id: 'grout-cleaner',
      name: 'Środek do czyszczenia fugi (po 24h)',
      unit: 'szt.',
      formula: formulaBuilder.fixed(1),
      pricePerUnit: 15,
      category: 'chemia',
      optional: true,
      notes: 'Usuwa nalot fugi z powierzchni płytek po wyschnięciu.',
    },
  ],
  tools: [
    { id: 'rubber-float-grout', name: 'Paca gumowa do fugowania', icon: 'minus', required: true, estimatedBuyCostPLN: 20 },
    { id: 'sponge-grout', name: 'Gąbka do czyszczenia', icon: 'circle', required: true },
    { id: 'bucket-grout', name: 'Wiadro z czystą wodą', icon: 'circle', required: true },
    { id: 'caulk-gun-grout', name: 'Pistolet do silikonu', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'Usuń krzyżyki', description: 'Usuń wszystkie krzyżyki dystansowe. Sprawdź czy klej jest w pełni suchy.', durationMin: 20 },
    { step: 2, title: 'Wymieszaj fugę', description: 'Dodaj suchą fugę do wody (nie odwrotnie!) i wymieszaj na jednolitą pastę. Konsystencja jak gęsty krem.', durationMin: 10 },
    { step: 3, title: 'Nałóż fugę', description: 'Pacą gumową wciśnij fugę w spoiny pod kątem 45° do płytek. Pracuj ukośnie do spoin — lepiej wypełnia. Nanieś fugę na ok. 1 m², potem oczyść.', durationMin: 60 },
    { step: 4, title: 'Oczyść po 15–20 min', description: 'Wilgotną gąbką zetrzyj nadmiar fugi z powierzchni płytek. Płukaj gąbkę często i zmieniaj wodę.', tip: 'Nie czekaj za długo — fuga zaschnie na płytkach.', durationMin: 40 },
    { step: 5, title: 'Nałóż silikon w narożnikach', description: 'W narożnikach ściana-podłoga nanieś silikon zamiast fugi. Wygładź palcem, zdejmij taśmę.', durationMin: 30 },
    { step: 6, title: 'Poleruj po 24 godzinach', description: 'Suchą szmatką wypoleruj powierzchnię płytek — zniknie nalot fugi.', durationMin: 20 },
  ],
  dryingTimes: [
    { afterStep: 5, description: 'Fuga cementowa — użytkowanie', minHours: 24, maxHours: 48 },
    { afterStep: 5, description: 'Silikon sanitarny', minHours: 24, maxHours: 48 },
  ],
  cleanupSteps: [
    'Natychmiast umyj pacę gumową i wiadro — fuga zaschnie w narzędziach.',
    'Przepłucz gąbkę, wyciśnij i zostaw do wyschnięcia.',
  ],
  commonMistakes: ['Fugowanie przed pełnym wyschnięciem kleju — fuga pęka', 'Fuga w narożnikach — powinna być tam elastyczna', 'Zbyt późne czyszczenie — fuga zaschnie na płytkach', 'Za rzadka fuga — osiada w spoinach'],
  qualityChecklist: [
    { id: 'q1', description: 'Spoiny są pełne — brak wybranych pustych miejsc', critical: true },
    { id: 'q2', description: 'Fuga ma jednolity kolor bez smug' },
    { id: 'q3', description: 'Narożniki uszczelnione silikonem' },
    { id: 'q4', description: 'Płytki czyste — brak nalotu fugi' },
  ],
  hireProfessionalRecommended: false,
  tags: ['fuga', 'fugowanie', 'płytki', 'łazienka'],

  verifiedAt: '2026-06-09',
  verifiedSources: [
    {
      title:       'Fugowanie płytek. Bezbłędne spoinowanie krok po kroku',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/fugowanie-plytek-bezbledne-spoinowanie-krok-po-kroku-aa-orPn-4jeQ-rzYf.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Silikonowanie ────────────────────────────────────────────────────────────

export const siliconeJob: RenovationJob = {
  id: 'silicone-sealing',
  slug: 'silikonowanie',
  categoryId: 'silicone',
  name: 'Silikonowanie fug i połączeń',
  shortDescription: 'Uszczelnij brodzik, wannę, zlewozmywak i narożniki silikonem.',
  description: 'Silikon sanitarny tworzy elastyczne, wodoodporne uszczelnienie. Kluczowe: czyste i suche podłoże oraz całkowite usunięcie starego silikonu.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  estimatedMessLevel: 1,
  visibilityMode: 'safe_diy',
  coverIcon: 'minus',
  warningRules: [
    { condition: 'always', message: 'Użyj silikonu sanitarnego z fungicydem — zapobiega powstawaniu czarnego grzyba.', level: 'info' },
    { condition: 'always', message: 'Stary silikon musi być całkowicie usunięty przed nałożeniem nowego — nowy się nie trzyma starego.', level: 'warning' },
  ],
  measurementInputs: [
    { id: 'linearMeters', label: 'Łączna długość fug do silikonowania', unit: 'mb', inputType: 'length',
      placeholder: 'np. 8', min: 0.5, max: 50,
      hint: 'Obwód wanny/brodzika + narożniki ściany. Wanna = ok. 5 mb.' },
    ...sanitaryInputs('silicone-sealing'),
  ],
  materials: sanitaryMaterials('silicone-sealing'),
  tools: [
    { id: 'caulk-gun', name: 'Pistolet do silikonu', icon: 'tool', required: true, notes: 'Tani pistolet za 10–15 zł wystarczy', estimatedBuyCostPLN: 15 },
    { id: 'cutter', name: 'Nóż do usunięcia starego silikonu', icon: 'scissors', required: true },
    { id: 'wet-finger', name: 'Szpachelka do wygładzania silikonu', icon: 'circle', required: true },
    { id: 'cloth', name: 'Szmatka do czyszczenia', icon: 'square', required: true },
    { id: 'alcohol', name: 'Alkohol (odtłuszczanie)', icon: 'droplet', required: true, notes: 'Odtłuść podłoże spirytusem lub IPA przed aplikacją' },
  ],
  instructions: [
    { step: 1, title: 'Usuń stary silikon', description: 'Nożem wytnij i usuń stary silikon. Użyj środka do miękczenia resztek. Podłoże musi być czyste i suche.', tip: 'Nowy silikon nie trzyma się starego. Całkowite usunięcie to klucz.', durationMin: 30 },
    { step: 2, title: 'Odtłuść podłoże', description: 'Przetrzyj fugi spirytusem lub alkoholem izopropylowym. Silikon przylega tylko do czystego, odtłuszczonego podłoża.', durationMin: 10, surfaceMustBeDry: true },
    { step: 3, title: 'Wstaw sznur dylatacyjny (przy głębokich fugach)', description: 'Jeśli fuga jest głębsza niż 10 mm, wstaw sznur dylatacyjny (backer rod) na dno szczeliny. Silikon powinien wypełniać max. 10 mm głębokości — głębszy silikon schnie nierówno i pęka.', tip: 'Sznur dylatacyjny to tania piankowa linka — kupisz w sklepie budowlanym.', durationMin: 5 },
    { step: 4, title: 'Naklej taśmę malarską', description: 'Po obu stronach fugi naklej taśmę malarską równolegle. Zostaw 5–8 mm szczelinę na silikon.', tip: 'Taśma zapewnia prostą, estetyczną linię silikonu.', durationMin: 15 },
    { step: 5, title: 'Nałóż silikon', description: 'Pod kątem 45°, prowadź pistolet równomiernie jednym ruchem. Nie zatrzymuj się.', tip: 'Ćwicz na kawałku kartonu zanim zaczniesz w łazience.', durationMin: 20 },
    { step: 6, title: 'Wygładź szpachelką', description: 'Natychmiast wygładź silikon szpachelką z preparatem dopuszczonym przez producenta. Unikaj kontaktu nieutwardzonego silikonu ze skórą.', tip: 'Wygładź spoinę przed utworzeniem naskórka.', durationMin: 10 },
    { step: 7, title: 'Zdejmij taśmę i poczekaj na utwardzenie', description: 'Zdejmij taśmę od razu po wygładzeniu. Nie mocz spoiny do pełnego utwardzenia według karty wybranego silikonu; czas zależy od głębokości i warunków. Suchy naskórek nie oznacza gotowej spoiny.', durationMin: 10 },
  ],
  dryingTimes: [
    { afterStep: 7, description: 'Silikon sanitarny — gotowy do użycia', minHours: 24, maxHours: 48 },
  ],
  cleanupSteps: ['Zetrzyj nadmiar silikonu natychmiast po zdejmowaniu taśmy.', 'Umyj pistolet silikonowy — usunąć wtyczkę z dyszy.'],
  commonMistakes: ['Silikonowanie na mokrym/zatłuszczonym podłożu — silikon odpada', 'Brak usunięcia starego silikonu — nowy się nie trzyma', 'Spóźnione zdejmowanie taśmy — silikon zaschnie z taśmą', 'Za dużo silikonu — trudno wygładzić', 'Zbyt głęboka fuga bez sznura dylatacyjnego — silikon pęka przy wysychaniu'],
  qualityChecklist: [
    { id: 'q1', description: 'Linia silikonu jest prosta i równa', critical: true },
    { id: 'q2', description: 'Brak przerw i dziur w silikonie' },
    { id: 'q3', description: 'Silikon dobrze wciśnięty w szczelinę' },
  ],
  hireProfessionalRecommended: false,
  tags: ['silikon', 'silikonowanie', 'łazienka', 'uszczelnienie', 'wanna'],

  verifiedAt: '2026-06-09',
  verifiedSources: [
    {
      title:       'Silikonowanie umywalki, brodzika oraz wanny. Zasady uszczelnienia silikonem',
      url:         'https://muratordom.pl/wnetrza/lazienka/silikonowanie-brodzika-i-silikonowanie-wanny-zasady-uszczelnienia-silikonem-aa-p733-988U-AthQ.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-07-10',
    },
  ],
};

// ─── Biały montaż: umywalka + bateria ─────────────────────────────────────────
// „Biały montaż" to montaż ceramiki sanitarnej i armatury. Job odpowiada stawce
// robocizny `labor-sink-installation` (renovationJobId: 'sink-installation') już
// obecnej w data/prices/labor.ts oraz wpisowi w JOB_LABOR_MAPPINGS — dotąd bez
// definicji joba. Materiały wyceniane przez katalog (JOB_MATERIAL_MAPPINGS:
// 1 umywalka + 1 bateria/tier), tu materials[] napędza listę zakupową kalkulatora.

export const sinkInstallationJob: RenovationJob = {
  id: 'sink-installation',
  slug: 'montaz-umywalki-z-bateria',
  categoryId: 'plumbing',
  name: 'Montaż umywalki z baterią (biały montaż)',
  // source: https://www.leroymerlin.pl/produkty/lazienka/umywalki/postumenty-polpostumenty/
  shortDescription: 'Zamocuj umywalkę do ściany i podłącz baterię — biały montaż łazienki.',
  description: 'Biały montaż umywalki: zamocowanie ceramiki do ściany, montaż baterii stojącej, podłączenie zaworów kątowych, przyłączy i syfonu oraz uszczelnienie silikonem. Mocowania dobierz do umywalki i podłoża. Opcjonalny półpostument osłania przyłącza i wymaga osobnego doboru.',
  difficulty: 'medium',
  riskLevel: 'medium',
  estimatedDays: 1,
  estimatedMessLevel: 1,
  visibilityMode: 'safe_diy',
  coverIcon: 'droplet',
  warningRules: [
    { condition: 'always', message: 'PRZED montażem zakręć wodę zaworami kątowymi lub głównym zaworem — po podłączeniu wężyków sprawdź szczelność przy pełnym ciśnieniu.', level: 'warning' },
    { condition: 'always', message: 'Ceramikę na ścianie mocuj kołkami dobranymi do materiału ściany — umywalka z wodą waży kilkanaście kg.', level: 'info' },
    { condition: 'always', message: 'W płytkach wierć wiertłem do glazury bez udaru — udar rozłupie płytkę.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'sinkCount', label: 'Liczba umywalek do montażu', unit: 'szt.', placeholder: '1', min: 1, max: 10, inputType: 'count', required: true },
    // source: https://www.ferrocompany.com/pliki/en/FERRO_Stillo_EN.pdf
    // source: https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44
    { id: 'sinkExtraHoses', label: 'Dodatkowe wężyki do kupienia', unit: 'szt.', placeholder: '0', min: 0, max: 20, step: 1, inputType: 'count', defaultValue: 0,
      hint: 'Bateria referencyjna Ferro Stillo BSL2 ma przyłącza w komplecie. Pozostaw 0, jeśli wystarczą. Wpisz liczbę dodatkowych lub wymiennych wężyków; sprawdź długość i gwinty.' },
    // source: https://www.fischerpolska.pl/pl-pl/produkty/mocowania-sanitarne/ceramiczne-umywalki-pisuary-i-wyposazenie-sanitarne/mocowanie-umywalek-wst
    { id: 'sinkFixingChoice', label: 'Mocowania umywalki', unit: '', placeholder: '', inputType: 'select', min: 0, max: 2, defaultValue: 0,
      options: [
        { value: 0, label: 'Do ustalenia — nie znam odpowiedniego zestawu' },
        { value: 1, label: 'Kupuję Fischer WST 140 K — mam potwierdzone dopasowanie' },
        { value: 2, label: 'Mam już dobrane mocowania do wszystkich umywalek' },
      ],
      hint: 'WST 140 K ma 2 kołki UX 14×75 i śruby M10×140. Wybierz go dopiero po potwierdzeniu zgodności z umywalką, nośną ścianą i grubością okładziny. Płytki i tynk nie są podłożem nośnym. Inne mocowania, płytę g-k i stelaż dobierz osobno.' },
  ],
  materials: [
    {
      id: 'washbasin',
      name: 'Umywalka ceramiczna (z otworem na baterię)',
      brand: 'Cersanit Facile 50 cm (referencja)',
      unit: 'szt.',
      formula: formulaBuilder.perItem('sinkCount'),
      pricePerUnit: 148,
      category: 'ceramika',
      notes: 'Umywalka z otworem na baterię i przelewem; mocowania ścienne dobierz do modelu i podłoża. Dopasowany półpostument jest opcjonalną osłoną przyłączy, wycenianą osobno.',
    },
    {
      id: 'basin-mixer',
      name: 'Bateria umywalkowa stojąca',
      brand: 'Ferro Stillo BSL2 (referencja)',
      unit: 'szt.',
      formula: formulaBuilder.perItem('sinkCount'),
      pricePerUnit: 195,
      category: 'armatura',
      // source: https://www.ferrocompany.com/pliki/en/FERRO_Stillo_EN.pdf
      notes: 'Referencja Ferro Stillo BSL2: automatyczny korek G1¼ i przyłącza elastyczne G3/8–M10x1 w komplecie. Dodatkowe wężyki wpisz osobno po sprawdzeniu długości i gwintów.',
    },
    {
      id: 'basin-trap',
      name: 'Syfon umywalkowy',
      brand: 'McAlpine WHB1-32 (referencja)',
      unit: 'szt.',
      formula: formulaBuilder.perItem('sinkCount'),
      pricePerUnit: 105,
      category: 'armatura',
      // source: https://mcalpine.pl/product/syfon-umywalkowy-niski-bialy-whb1-32/
      notes: 'McAlpine WHB1-32: niski syfon membranowy G1¼ × 32 mm, bez spustu. Spust jest w referencyjnej baterii BSL2. Sprawdź dopasowanie do odpływu ściennego; potrzebne przedłużki lub redukcje dobierz osobno.',
    },
    {
      id: 'angle-valve',
      name: 'Zawór kątowy z filtrem 1/2" × 3/8"',
      brand: 'Ferro (referencja)',
      unit: 'szt.',
      // source: https://www.ferrocompany.com/pliki/en/FERRO_Stillo_EN.pdf
      formula: (m) => sinkConnectionQuantity('angle-valve', m, true) ?? 0,
      pricePerUnit: 35,
      category: 'armatura',
      notes: 'Dwa zawory na umywalkę: ciepła i zimna woda. Potwierdź gwinty podejść i baterii.',
    },
    {
      id: 'flex-hose',
      name: 'Dodatkowy wężyk przyłączeniowy 3/8" × M10',
      brand: 'Invena 30 cm (referencja)',
      unit: 'szt.',
      // source: https://www.ferrocompany.com/pliki/en/FERRO_Stillo_EN.pdf
      formula: (m) => sinkConnectionQuantity('flex-hose', m, true) ?? 0,
      pricePerUnit: 37,
      category: 'armatura',
      notes: 'Dodatkowe lub wymienne przyłącze poza kompletem baterii. Referencja Invena ma 30 cm i gwinty G3/8 × M10; potwierdź długość i zgodność z baterią.',
    },
    {
      id: 'sanitary-silicone',
      name: 'Silikon sanitarny (uszczelnienie umywalki)',
      brand: 'Soudal 280 ml (referencja)',
      unit: 'kartusze',
      formula: formulaBuilder.perItem('sinkCount'),
      pricePerUnit: 20,
      category: 'uszczelnienie',
      notes: 'Uszczelnienie styku umywalki ze ścianą. Silikon z fungicydem.',
    },
    SINK_FIXING_MATERIAL,
  ],
  tools: [
    { id: 'adjustable-wrench-sink', name: 'Klucz nastawny', icon: 'tool', required: true },
    { id: 'basin-wrench-sink', name: 'Klucz do baterii (długi)', icon: 'tool', required: false },
    { id: 'drill-tile-sink', name: 'Wiertarka + wiertło do glazury (bez udaru)', icon: 'tool', required: true },
    { id: 'level-sink', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'caulk-gun-sink', name: 'Pistolet do silikonu', icon: 'tool', required: true },
    { id: 'bucket-sink', name: 'Wiadro i szmaty', icon: 'circle', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zakręć wodę i zamontuj zawory kątowe', description: 'Zakręć wodę. Na podejściach ściennych nawiń taśmę i wkręć zawory kątowe z filtrem (ciepła + zimna).', durationMin: 20 },
    { step: 2, title: 'Wyznacz i wywierć otwory pod umywalkę', description: 'Zaznacz wysokość (górny brzeg umywalki zwykle ok. 85 cm). Wywierć otwory wiertłem do glazury bez udaru, wstaw kołki.', durationMin: 25 },
    { step: 3, title: 'Zamontuj baterię w umywalce', description: 'Przed zawieszeniem przykręć baterię do umywalki, podłącz wężyki. Łatwiej zrobić to „na ławce" niż nad postumentem.', tip: 'Nie dokręcaj plastikowych nakrętek na siłę.', durationMin: 20 },
    // source: https://www.leroymerlin.pl/produkty/lazienka/umywalki/postumenty-polpostumenty/
    { step: 4, title: 'Zamocuj i wypoziomuj umywalkę', description: 'Zamocuj umywalkę do ściany zgodnie z instrukcją producenta, dobierając mocowania do podłoża. Opcjonalny półpostument zamontuj dopiero po stabilnym zamocowaniu ceramiki i podłączeniu instalacji; nie zastępuje mocowań umywalki.', durationMin: 20 },
    { step: 5, title: 'Podłącz wężyki i syfon', description: 'Podłącz wężyki baterii do zaworów kątowych. Zamontuj syfon do odpływu i rury ściennej.', durationMin: 25 },
    { step: 6, title: 'Odkręć wodę, sprawdź szczelność, zasilikonuj', description: 'Powoli odkręć wodę, sprawdź każde połączenie. Uszczelnij styk umywalki ze ścianą silikonem sanitarnym.', durationMin: 20 },
  ],
  commonMistakes: [
    'Brak sprawdzenia szczelności pod pełnym ciśnieniem — wyciek po zabudowie',
    'Za mocne dokręcenie plastikowych nakrętek — pęknięcie',
    'Wiercenie w płytkach z udarem — rozłupana glazura',
    'Krzywy montaż — woda spływa na jedną stronę',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Żadne połączenie nie kapie pod pełnym ciśnieniem wody', critical: true },
    { id: 'q2', description: 'Umywalka jest wypoziomowana i stabilna' },
    { id: 'q3', description: 'Styk umywalki ze ścianą uszczelniony silikonem' },
  ],
  hireProfessionalRecommended: false,
  tags: ['biały montaż', 'umywalka', 'bateria', 'łazienka', 'hydraulika'],

  verifiedAt: '2026-08-24',
  verifiedSources: [
    {
      title:       'Montaż baterii umywalkowej krok po kroku',
      url:         'https://www.castorama.pl/montaz-baterii-umywalkowej-krok-po-kroku-ins-88251.html',
      domain:      'castorama.pl',
      consultedAt: '2026-08-24',
    },
  ],
};

// ─── Biały montaż: miska WC kompakt ───────────────────────────────────────────
// Job odpowiada stawce `labor-toilet-installation` (renovationJobId:
// 'toilet-installation') już obecnej w data/prices/labor.ts + JOB_LABOR_MAPPINGS —
// dotąd bez definicji joba. Katalog wycenia 1 miskę WC/tier (JOB_MATERIAL_MAPPINGS).

export const toiletInstallationJob: RenovationJob = {
  id: 'toilet-installation',
  slug: 'montaz-miski-wc-kompakt',
  categoryId: 'plumbing',
  name: 'Montaż miski WC kompakt (biały montaż)',
  shortDescription: 'Ustaw i podłącz kompakt WC — mocowanie do podłogi, spłuczka i uszczelnienie.',
  description: 'Biały montaż kompaktu WC: ustawienie miski na zestawie mocującym (śruby + kołki), podłączenie odpływu do rury kanalizacyjnej, doprowadzenie wody do spłuczki przez zawór kątowy i wężyk oraz uszczelnienie podstawy silikonem. Kluczowe: szczelny odpływ i stabilne mocowanie.',
  difficulty: 'medium',
  riskLevel: 'medium',
  estimatedDays: 1,
  estimatedMessLevel: 1,
  visibilityMode: 'safe_diy',
  coverIcon: 'droplet',
  warningRules: [
    { condition: 'always', message: 'PRZED montażem zakręć wodę. Po podłączeniu spłuczki sprawdź szczelność napełniania i spłukiwania.', level: 'warning' },
    { condition: 'always', message: 'Miskę mocuj do podłogi śrubami z zestawu i kołkami — luźny kompakt rozszczelnia odpływ i pęka.', level: 'warning' },
    { condition: 'always', message: 'Odpływ do kanalizacji łącz przez uszczelkę/mankiet — nieszczelne podejście to nieusuwalny zapach.', level: 'info' },
  ],
  measurementInputs: [
    { id: 'toiletCount', label: 'Liczba misek WC do montażu', unit: 'szt.', placeholder: '1', min: 1, max: 10 },
  ],
  materials: [
    {
      id: 'wc-compact',
      name: 'Kompakt WC (miska + spłuczka + deska)',
      brand: 'Cersanit Seno 3/5 l (referencja)',
      unit: 'szt.',
      formula: formulaBuilder.perItem('toiletCount'),
      pricePerUnit: 698,
      category: 'ceramika',
      notes: 'Bezkołnierzowy kompakt z deską wolnoopadającą i zestawem uszczelek/śrub w opakowaniu.',
    },
    {
      id: 'wc-mounting-set',
      name: 'Zestaw mocujący WC (śruby + kołki + podkładki)',
      brand: 'Tycner (referencja)',
      unit: 'szt.',
      formula: formulaBuilder.perItem('toiletCount'),
      pricePerUnit: 37,
      category: 'mocowania',
      notes: 'Śruby do mocowania miski do podłogi + uszczelka i podkładki. Kołki dobierz do materiału podłoża.',
    },
    {
      id: 'wc-angle-valve',
      name: 'Zawór kątowy z filtrem 1/2" × 3/8"',
      brand: 'Ferro (referencja)',
      unit: 'szt.',
      formula: formulaBuilder.perItem('toiletCount'),
      pricePerUnit: 35,
      category: 'armatura',
      notes: 'Odcięcie wody do spłuczki. 1 szt. na kompakt.',
    },
    {
      id: 'wc-flex-hose',
      name: 'Wężyk elastyczny do spłuczki 3/8"',
      brand: 'Invena (referencja)',
      unit: 'szt.',
      formula: formulaBuilder.perItem('toiletCount'),
      pricePerUnit: 37,
      category: 'armatura',
      notes: 'Łączy zawór kątowy z zaworem napełniającym spłuczki.',
    },
    {
      id: 'wc-silicone',
      name: 'Silikon sanitarny (uszczelnienie podstawy)',
      brand: 'Soudal 280 ml (referencja)',
      unit: 'kartusze',
      formula: formulaBuilder.perItem('toiletCount'),
      pricePerUnit: 20,
      category: 'uszczelnienie',
      notes: 'Uszczelnienie styku miski z podłogą po sprawdzeniu poziomu (zostaw z tyłu przerwę kontrolną).',
    },
  ],
  tools: [
    { id: 'adjustable-wrench-wc', name: 'Klucz nastawny', icon: 'tool', required: true },
    { id: 'drill-tile-wc', name: 'Wiertarka + wiertło do glazury (bez udaru)', icon: 'tool', required: true },
    { id: 'level-wc', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'pencil-wc', name: 'Ołówek i miarka', icon: 'edit-2', required: true },
    { id: 'caulk-gun-wc', name: 'Pistolet do silikonu', icon: 'tool', required: true },
    { id: 'bucket-wc', name: 'Wiadro i szmaty', icon: 'circle', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zakręć wodę i przymierz miskę', description: 'Zakręć wodę. Ustaw kompakt na docelowym miejscu, sprawdź spasowanie z odpływem. Zaznacz otwory mocujące.', durationMin: 20 },
    { step: 2, title: 'Wywierć otwory i osadź kołki', description: 'Wywierć otwory wiertłem do glazury bez udaru w zaznaczonych punktach, wstaw kołki z zestawu mocującego.', durationMin: 20 },
    { step: 3, title: 'Podłącz odpływ i ustaw miskę', description: 'Załóż mankiet/uszczelkę na odpływ, wsuń miskę na rurę kanalizacyjną, ustaw na kołkach. Wypoziomuj.', durationMin: 25 },
    { step: 4, title: 'Skręć miskę i zamontuj spłuczkę', description: 'Dokręć śruby mocujące (bez przeciążania ceramiki). Zmontuj spłuczkę z miską przez uszczelkę.', tip: 'Dokręcaj na przemian, równomiernie — inaczej pękną ucha ceramiki.', durationMin: 25 },
    { step: 5, title: 'Doprowadź wodę do spłuczki', description: 'Wkręć zawór kątowy, podłącz wężyk do zaworu napełniającego spłuczki. Odkręć wodę, sprawdź napełnianie.', durationMin: 20 },
    { step: 6, title: 'Sprawdź spłukiwanie i zasilikonuj podstawę', description: 'Spłucz kilka razy, sprawdź szczelność odpływu i spłuczki. Uszczelnij podstawę silikonem, zostawiając z tyłu przerwę kontrolną.', durationMin: 20 },
  ],
  commonMistakes: [
    'Przeciążenie śrub mocujących — pęknięte ucha ceramiki',
    'Nieszczelne podejście odpływu — uporczywy zapach z kanalizacji',
    'Silikon dookoła bez przerwy kontrolnej — nie widać ewentualnego przecieku',
    'Krzywe ustawienie — kompakt się buja i rozszczelnia',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Odpływ i spłuczka szczelne — brak wycieków po kilku spłukaniach', critical: true },
    { id: 'q2', description: 'Miska stabilnie przykręcona i wypoziomowana' },
    { id: 'q3', description: 'Podstawa uszczelniona silikonem z przerwą kontrolną z tyłu' },
  ],
  hireProfessionalRecommended: false,
  tags: ['biały montaż', 'wc', 'kompakt', 'toaleta', 'łazienka', 'hydraulika'],

  verifiedAt: '2026-08-24',
  verifiedSources: [
    {
      title:       'Kompakt WC Cersanit Seno bezkołnierzowy 3/5 l z deską wolnoopadającą',
      url:         'https://www.castorama.pl/kompakt-wc-cersanit-seno-bezkolnierzowy-3-5-l-z-deska-wolnoopadajaca/5902115720833_CAPL.prd',
      domain:      'castorama.pl',
      consultedAt: '2026-08-24',
    },
  ],
};
