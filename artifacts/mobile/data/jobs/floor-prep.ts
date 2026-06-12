import type { RenovationJob } from '@/types/domain';
import { SHARED_SHOP_PRICES } from '@/data/prices/shared-shop-prices';

// ─── Self-leveling compound ────────────────────────────────────────────────────

export const selfLevelingJob: RenovationJob = {
  id: 'self-leveling',
  categoryId: 'floor-prep',
  name: 'Wylewka samopoziomująca',
  description: 'Wyrównaj nierówną podłogę masą samopoziomującą — idealna baza pod płytki, panele lub wykładzinę.',
  difficulty: 'medium',
  riskLevel: 'low',
  estimatedDays: 2,
  coverIcon: 'layers',
  warningRules: [
    {
      condition: 'always',
      message: 'Masa samopoziomująca musi być wylana szybko i sprawnie — twardnieje w 20–30 minut. Pracuj z pomocnikiem.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Podłoże musi być odkurzone, zagruntowane i suche. Wszelkie ubytki i pęknięcia zaszpachluj przed wylaniem.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Sprawdź nośność podłoża — masa samopoziomująca waży ok. 1,5 kg/m² na 1 mm grubości.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'floorArea',
      label: 'Powierzchnia podłogi',
      unit: 'm²',
      placeholder: 'np. 20',
      min: 1,
      max: 500,
      hint: 'Długość × szerokość pomieszczenia.',
    },
    {
      id: 'levelingThickness',
      label: 'Grubość wylewki (mm)',
      unit: 'mm',
      placeholder: 'np. 5',
      min: 1,
      max: 30,
      hint: 'Zmierz największy ubytek pionowy poziomicą — to minimalna grubość. Standardowo 3–10 mm.',
    },
  ],
  materials: [
    {
      id: 'leveling-compound',
      name: 'Masa samopoziomująca (np. Ceresit CN 68)',
      unit: 'kg',
      formulaKey: 'byThickness',
      pricePerUnit: 1.8,
      wasteFactor: 1.1,
      notes: 'Zużycie: ok. 1,6 kg/m²/mm. Np. 10 m² × 5mm = 80 kg = 4 worki po 20 kg.',
    },
    {
      id: 'primer-leveling',
      name: 'Grunt do podłoży (głęboko penetrujący)',
      brand: 'Dragon Grunt głęboko penetrujący akrylowy 5 L (referencja)',
      unit: 'litr',
      formulaKey: 'primer',
      pricePerUnit: 12,
      notes: 'Konieczny — bez gruntu masa się odkleja od podłoża. Na chłonne podłoża (beton komórkowy) grunty 2 razy.',
      shopPrices: SHARED_SHOP_PRICES.primerDragon5L,
    },
    {
      id: 'expansion-tape',
      name: 'Taśma dylatacyjna przy ścianach',
      unit: 'mb',
      formulaKey: 'skirting',
      pricePerUnit: 2,
      notes: 'Przyklejona przy podstawie ścian — zapobiega pękaniu masy przy ruchu budynku.',
    },
  ],
  tools: [
    { id: 'mixer-paddle', name: 'Mieszadło elektryczne lub wiertarka z mieszadłem', icon: 'settings', required: true, notes: 'Masa musi być dokładnie wymieszana bez grudek' },
    { id: 'bucket-level', name: 'Wiadra 20L (min. 2 szt.)', icon: 'circle', required: true },
    { id: 'spiked-roller', name: 'Wałek kolczasty (do odpowietrzenia)', icon: 'tool', required: true, notes: 'Walcuj masę zaraz po wylaniu — usuwa pęcherze powietrza' },
    { id: 'laser-floor', name: 'Poziomica laserowa (do oceny równości)', icon: 'minus', required: false, notes: 'Pomaga ocenić ile masy potrzebujesz gdzie' },
    { id: 'squeegee', name: 'Rakiel zębaty lub ściągaczka', icon: 'minus', required: false },
  ],
  instructions: [
    { step: 1, title: 'Przygotuj podłoże', description: 'Odkurz i zetrzyj pył. Zasklep duże pęknięcia i ubytki zaprawą naprawczą. Przyklejaj taśmę dylatacyjną przy ścianach.', durationMin: 60 },
    { step: 2, title: 'Zagruntuj', description: 'Nanieś grunt pędzlem lub wałkiem na całą powierzchnię. Odczekaj czas schnięcia (min. 30–60 minut). Na bardzo chłonne podłoże nałóż 2 warstwy.', durationMin: 60 },
    { step: 3, title: 'Przygotuj masę i wylewaj', description: 'Wymieszaj masę z wodą wg proporcji na worku (mieszadłem elektrycznym). Wylej i rozprowadź rakielem. Pracuj szybko — ok. 20 minut do stwardnienia.', warning: 'Temperatura pracy: +5°C do +25°C. Poniżej masy nie wiążą.', durationMin: 60 },
    { step: 4, title: 'Odpowietrzaj wałkiem', description: 'Natychmiast po wylaniu przewalcuj wałkiem kolczastym — usuwa pęcherze powietrza. Przejedź całą powierzchnię w obu kierunkach.', durationMin: 20 },
    { step: 5, title: 'Czas schnięcia', description: 'Masa twardnieje w ciągu 1–2h. Do chodzenia można po 4–6h. Do układania podłogi: 24h (panele) lub 72h (płytki).', durationMin: 5 },
  ],
  commonMistakes: [
    'Brak gruntowania — masa odkleja się od podłogi',
    'Za rzadka masa — niejednorodna grubość',
    'Wylanie zbyt małej ilości naraz — widoczne granice między porcjami',
    'Praca w zbyt niskiej temperaturze — masa nie wiąże',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Powierzchnia jest gładka i równa (sprawdź długą łatą)' },
    { id: 'q2', description: 'Brak pęcherzy i pęknięć po wyschnięciu' },
    { id: 'q3', description: 'Masa dobrze przyległa do podłoża (brak pustych miejsc przy stukaniu)' },
  ],
  hireProfessionalRecommended: false,
  tags: ['wylewka', 'samopoziomująca', 'podłoga', 'wyrównanie', 'przygotowanie'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Wylewka samopoziomująca — instrukcja',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Epoxy floor coating ──────────────────────────────────────────────────────

export const epoxFloorJob: RenovationJob = {
  id: 'epoxy-floor',
  categoryId: 'floor-prep',
  name: 'Farba epoksydowa na podłogę',
  description: 'Pomaluj betonową podłogę farbą epoksydową — idealna do garażu, piwnicy, warsztatu.',
  difficulty: 'medium',
  riskLevel: 'low',
  estimatedDays: 2,
  coverIcon: 'square',
  warningRules: [
    {
      condition: 'always',
      message: 'Zapewnij wentylację — opary farby epoksydowej są szkodliwe. Pracuj przy otwartych oknach lub drzwiach.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Beton musi być suchy (wilgotność <4%) i odtłuszczony. Nowa posadzka betonowa musi wyschnąć min. 28 dni.',
      level: 'warning',
    },
  ],
  measurementInputs: [
    {
      id: 'floorArea',
      label: 'Powierzchnia podłogi',
      unit: 'm²',
      placeholder: 'np. 30',
      min: 1,
      max: 1000,
      hint: 'Długość × szerokość.',
    },
  ],
  materials: [
    {
      id: 'epoxy-paint',
      name: 'Farba epoksydowa dwuskładnikowa',
      unit: 'zestaw',
      formulaKey: 'paint',
      pricePerUnit: 80,
      notes: 'Zużycie ok. 0,2–0,3 kg/m² na warstwę. 2 warstwy standardowo. Mieszaj tuż przed użyciem.',
    },
    {
      id: 'epoxy-primer',
      name: 'Grunt epoksydowy',
      unit: 'litr',
      formulaKey: 'primer',
      pricePerUnit: 30,
      notes: 'Konieczny na nowy beton lub porous podłoże.',
    },
    {
      id: 'degreaser',
      name: 'Odtłuszczacz do betonu',
      unit: 'litr',
      formulaKey: 'constant',
      pricePerUnit: 25,
      notes: 'Tłuszcze i oleje uniemożliwiają przyleganie farby. Niezbędne w garażu.',
    },
    {
      id: 'decorative-chips',
      name: 'Kolorowe płatki dekoracyjne (opcjonalnie)',
      unit: 'kg',
      formulaKey: 'constant',
      pricePerUnit: 30,
      notes: 'Posypane na mokrą farbę — efekt dekoracyjny i antypoślizgowy.',
    },
  ],
  tools: [
    { id: 'grinder-epoxy', name: 'Szlifierka do betonu lub granowanie (przygotowanie)', icon: 'settings', required: false, rentable: true, notes: 'Do matowania i otwarcia porów betonu — znacznie lepsze przyleganie' },
    { id: 'roller-epoxy', name: 'Wałek z krótkim włosiem 6mm', icon: 'tool', required: true },
    { id: 'respirator-epoxy', name: 'Maska z filtrem organicznym', icon: 'shield', required: true },
    { id: 'gloves-epoxy', name: 'Rękawice nitrylowe', icon: 'shield', required: true },
    { id: 'mixer-epoxy', name: 'Mieszadło do farby', icon: 'settings', required: true },
  ],
  instructions: [
    { step: 1, title: 'Przygotuj podłoże', description: 'Odtłuść podłogę środkiem chemicznym. Wypełnij ubytki i pęknięcia zaprawą. Opcjonalnie — szlifuj beton szlifierką kątową z tarczą diamentową dla lepszego przylegania.', durationMin: 120 },
    { step: 2, title: 'Zagruntuj', description: 'Nałóż grunt epoksydowy wałkiem lub pędzlem. Wniknie w beton i stworzy podkład. Czas schnięcia: 4–8h.', durationMin: 60 },
    { step: 3, title: 'Wymieszaj farbę i nanieś pierwszą warstwę', description: 'Wymieszaj składniki A i B wg proporcji producenta — czas pracy ok. 30–60 minut po wymieszaniu. Nałóż wałkiem cienką, równomierną warstwę.', warning: 'Wymieszanej farby nie dasz rady przechować — mieszaj tylko tyle ile zdążysz zużyć.', durationMin: 120 },
    { step: 4, title: 'Posyp płatkami (opcjonalnie) i wysusz', description: 'Na mokrą farbę posyp płatkami dekoracyjnymi. Pierwsza warstwa: 12–24h schnięcia. Nie chodź po podłodze.', durationMin: 5 },
    { step: 5, title: 'Nanieś drugą warstwę', description: 'Drugą warstwę nanieś po wyschnięciu pierwszej. Daje twardość i pełną ochronę. Po wyschnięciu (24h) podłoga jest gotowa do użytku.', durationMin: 120 },
  ],
  commonMistakes: [
    'Malowanie na tłustym betonie — farba odpryskuje po kilku miesiącach',
    'Zbyt gruba warstwa — pęcherze i nierówna powierzchnia',
    'Brak wentylacji — zawroty głowy i uszkodzenie zdrowia',
    'Malowanie przy za niskiej temperaturze — farba nie polimeryzuje',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Farba jest równomiernie nałożona bez plam' },
    { id: 'q2', description: 'Brak łuszczenia ani odspajania po wyschnięciu' },
    { id: 'q3', description: 'Powierzchnia jest twarda i odporna na ścieranie' },
  ],
  hireProfessionalRecommended: false,
  tags: ['epoksyd', 'podłoga', 'garaż', 'beton', 'farba', 'piwnica'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Farba epoksydowa do garażu — przewodnik',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Parquet sanding / refinishing ───────────────────────────────────────────

export const parquetSandingJob: RenovationJob = {
  id: 'parquet-sanding',
  categoryId: 'floor-prep',
  name: 'Cyklinowanie i lakierowanie parkietu',
  description: 'Odnów stary drewniany parkiet lub deski — cyklinowanie przywraca piękno naturalnego drewna.',
  difficulty: 'hard',
  riskLevel: 'medium',
  estimatedDays: 3,
  coverIcon: 'grid',
  warningRules: [
    {
      condition: 'always',
      message: 'Cyklinowanie generuje DUŻO pyłu drzewnego. Używaj maski P2/P3, okularów i szczelnie zamknij drzwi do innych pomieszczeń.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Lakiery i oleje na bazie rozpuszczalnika są łatwopalne. Zapewnij wentylację i nie pal w pobliżu.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Parkiet można cyklinować max. 3–4 razy przez całe życie — przy każdym cyklinowaniu traci ok. 1–1,5 mm. Zbyt cienki parkiet można przebić do podłoża.',
      level: 'warning',
    },
  ],
  measurementInputs: [
    {
      id: 'floorArea',
      label: 'Powierzchnia parkietu',
      unit: 'm²',
      placeholder: 'np. 25',
      min: 2,
      max: 500,
      hint: 'Długość × szerokość pomieszczenia.',
    },
  ],
  materials: [
    {
      id: 'sandpaper-parquet',
      name: 'Papier ścierny do cykliniarki (80, 120)',
      unit: 'zestaw',
      formulaKey: 'paint',
      pricePerUnit: 15,
      notes: 'Zazwyczaj w zestawie z wypożyczeniem cykliniarki. Ok. 2–4 papiery na 20 m².',
    },
    {
      id: 'floor-lacquer',
      name: 'Lakier do parkietu (wodorozcieńczalny)',
      unit: 'litr',
      formulaKey: 'paint',
      wasteFactor: 0.12,
      pricePerUnit: 45,
      notes: 'Zużycie ok. 0,1–0,15 L/m² na warstwę. 3 warstwy = 0,3–0,45 L/m². Wodorozcieńczalny jest mniej trujący.',
    },
    {
      id: 'filler-parquet',
      name: 'Szpachlówka do drewna (wypełnienie szczelin)',
      unit: 'kg',
      formulaKey: 'constant',
      pricePerUnit: 40,
      notes: 'Miesza się z pyłem z cyklinowania — dokładnie pasuje kolorem.',
    },
  ],
  tools: [
    { id: 'floor-sander', name: 'Cykliniarka bębnowa', icon: 'settings', required: true, rentable: true, notes: 'Wypożycz z wypożyczalni sprzętu. Koszt ok. 150–250 zł/dzień.' },
    { id: 'edge-sander', name: 'Szlifierka krawędziowa (do przy ścian)', icon: 'tool', required: true, rentable: true },
    { id: 'respirator-parquet', name: 'Maska przeciwpyłowa P2', icon: 'shield', required: true },
    { id: 'roller-floor', name: 'Wałek do lakieru 10 cm', icon: 'tool', required: true },
    { id: 'vacuum-parquet', name: 'Odkurzacz przemysłowy', icon: 'tool', required: true, notes: 'Do zebrania pyłu po każdym etapie cyklinowania' },
  ],
  instructions: [
    { step: 1, title: 'Przygotuj pomieszczenie', description: 'Opróżnij pomieszczenie. Wbij wszystkie gwoździe poniżej powierzchni (inaczej zniszczą papier). Sprawdź czy parkiet nadaje się do cyklinowania (grubość min. 8 mm).', durationMin: 60 },
    { step: 2, title: 'Pierwsze cyklinowanie (zgrubne)', description: 'Cykliniarką z papierem 40–60 idź pod kątem 45° do słojów drewna. Zdejmiesz starą powłokę i nierówności. Krawędzie — szlifierką krawędziową.', warning: 'Cykliniarka jest bardzo agresywna — nie zatrzymuj jej na jednym miejscu.', durationMin: 180 },
    { step: 3, title: 'Odkurz i wypełnij szczeliny', description: 'Dokładnie odkurz. Wymieszaj szpachlówkę z pyłem z cyklinowania. Wypełnij szczeliny między klepkami. Wyschnięcie: 2–4h.', durationMin: 120 },
    { step: 4, title: 'Drugie i trzecie cyklinowanie', description: 'Cyklinuj papierem 80, potem 120 — wzdłuż słojów. Każdy etap odkurz dokładnie. Po papierze 120 powierzchnia powinna być gładka.', durationMin: 180 },
    { step: 5, title: 'Nałóż lakier (3 warstwy)', description: 'Wałkiem nanieś cienką warstwę lakieru. Schnięcie 2–4h. Lekko przeszlifuj papierem 220. Zetrzyj pył. Powtórz 3 razy. Po ostatniej warstwie — 24–48h przed użyciem.', durationMin: 360 },
  ],
  commonMistakes: [
    'Cyklinowanie zbyt grubym papierem — rowki w drewnie',
    'Brak odkurzania między etapami — grudki w lakierze',
    'Za gruba warstwa lakieru — zacieki i nierówności',
    'Użytkowanie za wcześnie — odciski i rysy w świeżym lakierze',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Powierzchnia jest gładka bez rys po cyklinowaniu' },
    { id: 'q2', description: 'Lakier jest równomiernie nałożony bez zacieków' },
    { id: 'q3', description: 'Brak widocznych szczelin między klepkami' },
  ],
  hireProfessionalRecommended: true,
  hireProfessionalReason: 'Cyklinowanie wymaga wprawy — błędy są nieodwracalne. Dla pierwszego razu rozważ fachowca lub zacznij od mniej eksponowanego pomieszczenia.',
  tags: ['parkiet', 'cyklinowanie', 'lakierowanie', 'drewno', 'podłoga', 'renowacja'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Cyklinowanie parkietu krok po kroku',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};
