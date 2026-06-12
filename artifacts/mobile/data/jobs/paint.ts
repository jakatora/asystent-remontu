import type { RenovationJob } from '@/types/domain';
import { formulaBuilder } from '@/features/calculator/formula-builder';

// ─────────────────────────────────────────────────────────────────────────────
// PAINT WALLS — canonical reference job showcasing all engine fields.
// Every new job file should follow this structure.
// ─────────────────────────────────────────────────────────────────────────────

export const paintJob: RenovationJob = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id:          'paint-walls',
  slug:        'malowanie-scian',
  categoryId:  'paint',
  subcategory: 'interior',

  // ── Display ───────────────────────────────────────────────────────────────
  name:        'Malowanie ścian',
  shortDescription: 'Pomaluj ściany samodzielnie — krok po kroku, bez stresu.',
  description: 'Malowanie ścian to jedno z najprostszych remontowych zadań. Wymaga cierpliwości i dobrego przygotowania powierzchni, ale efekty cieszą oko przez lata.',
  beginnerFriendlyDescription:
    'Malowanie ścian to jak malowanie dużego arkusza papieru. Zaczynasz od gruntu (to jak podkład rysunkowy), potem nakładasz farbę warstwami. Najważniejsze: dobrze zabezpiecz podłogę i nie spiesz się między warstwami.',
  coverIcon: 'droplet',

  // ── Classification ────────────────────────────────────────────────────────
  difficulty:       'easy',
  riskLevel:        'low',
  visibilityMode:   'safe_diy',
  estimatedDays:    1,
  estimatedMessLevel: 2,

  // ── Safety ────────────────────────────────────────────────────────────────
  safetyEquipment: [
    { id: 'gloves',    name: 'Rękawice jednorazowe', icon: 'shield', required: false,
      notes: 'Chroni dłonie przed farbą — trudno zmywalną po wyschnięciu.' },
    { id: 'old-cloth', name: 'Stare ubranie', icon: 'user', required: true,
      notes: 'Farba jest trudna do wyprania. Załóż coś, czego nie szkoda poplamić.' },
  ],
  warningRules: [
    {
      condition: 'always',
      message: 'Otwórz okna — farba ma silny zapach. Wietrz pomieszczenie przez co najmniej 24 godziny.',
      level: 'info',
    },
    {
      condition: 'always',
      message: 'Zabezpiecz podłogę i meble folią malarską, żeby nie poplamić.',
      level: 'info',
    },
    {
      condition: 'beginner',
      message: 'Jako debiutant — zacznij od mniejszej ściany. Technika wałka przychodzi z praktyką.',
      level: 'info',
    },
    {
      condition: 'large-area',
      message: 'Przy dużych powierzchniach podziel pracę na sekcje i maluj jedną ścianę naraz — farba nie może zasychać na łączeniu.',
      level: 'warning',
    },
  ],

  // ── Measurement inputs ────────────────────────────────────────────────────
  measurementInputs: [
    {
      id:           'wallArea',
      label:        'Łączna powierzchnia ścian',
      unit:         'm²',
      inputType:    'area',
      placeholder:  'np. 40',
      min:          1,
      max:          500,
      hint:         'Zmierz każdą ścianę: długość × wysokość. Zsumuj wszystkie. Odejmij okna i drzwi (ok. 2 m² każde).',
    },
    {
      id:           'coats',
      label:        'Liczba warstw farby',
      unit:         'warstwy',
      inputType:    'count',
      placeholder:  '2',
      defaultValue: 2,
      min:          1,
      max:          3,
      hint:         'Zazwyczaj 2 warstwy wystarczą. Przy ciemnych kolorach lub na białej ścianie może być potrzebna 3.',
    },
    {
      id:           'coveragePerLiter',
      label:        'Wydajność farby (m²/litr)',
      unit:         'm²/litr',
      inputType:    'coverage',
      placeholder:  '10',
      defaultValue: 10,
      min:          6,
      max:          18,
      required:     false,
      hint:         'Podane na opakowaniu farby. Standardowo 10 m²/litr. Gęstsza farba może dawać 7–8 m²/litr.',
    },
  ],

  // ── Materials ─────────────────────────────────────────────────────────────
  // Paint uses inline formula from formulaBuilder for precise coverage per-liter calculation.
  // Primer and tape use registry keys (simpler, backward-compatible).
  materials: [
    {
      id:           'paint',
      name:         'Farba do ścian (zmywalna)',
      brand:        'Magnat Ceramic C45 5 L (referencja)',
      unit:         'litr',
      purchaseUnit: 'litr',
      // Inline formula: reads m.coveragePerLiter from user input
      formula:      formulaBuilder.coverage(10),
      wasteFactor:  1.05,
      roundingRule: 'ceil',
      packaging: {
        size:         5,
        label:        'puszka 5 L',
        purchaseUnit: 'puszka',
      },
      pricePerUnit: 25,
      category:     'farba',
      notes:        'Wybierz farbę zmywalną klasy A lub B. Do kuchni/łazienki — zmywalna łatwa. Referencyjny produkt: Magnat Ceramic C45 5L (biały).',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/farba-magnat-ceramic-c45-bialy-5-l/5903973153214_CAPL.prd',                  verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/farba-magnat-ceramic-bialy-5-l-45615171.html',                   verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/biale-farby-do-scian/farba-magnat-ceramic-biala-5-l/p/3136363',                   verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/farba-ceramiczna-bialy-c45-5-l-magnat',                                   verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:           'primer-paint',
      name:         'Grunt pod farbę',
      brand:        'Dragon Grunt głęboko penetrujący akrylowy 5 L (referencja)',
      unit:         'litr',
      purchaseUnit: 'litr',
      formulaKey:   'primer',
      wasteFactor:  1.0,
      roundingRule: 'ceil',
      packaging: {
        size:         5,
        label:        'pojemnik 5 L',
        purchaseUnit: 'pojemnik',
      },
      pricePerUnit: 18,
      category:     'grunt',
      optional:     true,
      notes:        'Wymagany na: nowych ścianach, naprawianych miejscach, ścianach po zeskrobaniu, pylących/kredujących/bardzo chłonnych podłożach. Na stabilnej, wcześniej malowanej ścianie NIE jest konieczny.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/grunt-g-boko-penetruj-cy-akrylowy-dragon-5l/5903649007612_CAPL.prd',                          verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/grunt-do-malowania-gleboko-penetrujacy-akrylowy-dragon-5-litrow-94230442.html',             verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/srodki-do-glebokiego-gruntowania/dragon-grunt-blauer-gleboko-penetrujacy-5l/p/7000094',                       verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/grunt-gleboko-penetrujacy-akrylowy-5-l-dragon',                                                       verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:           'painters-tape',
      name:         'Taśma malarska',
      brand:        'Tesa Taśma malarska Standard 25 mm × 50 m (51023) (referencja)',
      unit:         'rolka',
      formulaKey:   'tape',
      wasteFactor:  1.0,
      roundingRule: 'ceil',
      pricePerUnit: 8,
      category:     'akcesoria',
      notes:        'Do zabezpieczenia listew, okien i narożników. Zdejmuj gdy farba lekko wilgotna.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/ta-ma-papierowa-malarska-tesa-51023-25mm-50m-1-szt-/5903719436465_CAPL.prd',                verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/artykuly-gospodarcze/tasmy-folie-ochronne/tasmy-malarskie/tasma-malarska-blue-25-mm-x-50-m,p573830,l2047.html', verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/tasmy-klejace/tesa-tasma-malarska-standard-50-m-x-25-mm/p/4153656',                                           verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/tasma-malarska-maskujaca-standard-50m-25mm-bezowa-tesa',                                              verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:           'drop-cloth',
      name:         'Folia malarska (podłoga)',
      brand:        'Folia malarska 4 × 5 m LDPE/OPP (referencja: Topex / Dexter / LUX / GO/ON!)',
      unit:         'm²',
      formula:      formulaBuilder.fixed(1),
      roundingRule: 'ceil',
      packaging: {
        size:         1,
        label:        'rolka 4×5m (20 m²)',
        purchaseUnit: 'rolka',
      },
      pricePerUnit: 12,
      category:     'akcesoria',
      notes:        'Rozłóż na całej podłodze. Zbyt mała folia = więcej sprzątania.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/folia-ochronna-opp-cienka-4-x-5-m/5059340989747_CAPL.prd',                                              verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/folia-malarska-medium-4-x-3-m-dexter-82261733.html',                                         verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/zabezpieczenie-przed-malowaniem/lux-folia-malarska-przezroczysta-4-m-x-5-m/p/1397900',                        verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/folia-malarska-standard-4-x-5-m-go-on',                                                               verifiedAt: '2026-06-09' },
      ],
    },
  ],

  // ── Tools ─────────────────────────────────────────────────────────────────
  tools: [
    {
      id:                  'roller',
      name:                'Wałek malarski 18–22 cm',
      icon:                'edit-2',
      required:            true,
      estimatedBuyCostPLN: 25,
      notes:               'Wełna 10–12 mm do farb akrylowych/lateksowych. Szerokość 18 cm na typowe ściany. Referencja: Motive / LUX Basic / Hardy Maxprofi.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/wa-ek-motive-malarski-nylon-czerwony-pasek-18cm-w-os-12mm-1-szt/5905033135338_CAPL.prd', verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/zestaw-malarski-do-farb-emulsyjnych-walek-18-cm-zapas-kuweta-45878546.html',              verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/walki-malarskie/lux-walek-malarski-basic-180-mm-12-mm/p/2498491',                                          verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/walek-malarski-gelbfaden-18-cm-rdzen-48-mm-poliakryl-12-mm-rota',                                  verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:                  'brush',
      name:                'Pędzel 5 cm (narożniki)',
      icon:                'edit-3',
      required:            true,
      estimatedBuyCostPLN: 15,
      notes:               'Do narożników i krawędzi — wałek tam nie dochodzi. Płaski 50 mm. Referencja: Diall / Dexter / LUX Profi / NINJA.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/pedzel-plaski-diall-50-mm-id-1091492.html',                                                          verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/narzedzia-reczne/pedzle-walki-kuwety/pedzle/pedzel-plaski-uniwersalny-50-mm-dexter,p587218,l754.html', verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/pedzle/lux-pedzel-plaski-do-emalii-uniwersalny-profi-50-mm/p/5693205',                                     verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/pedzel-ninja-50-mm-angular',                                                                       verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:       'tray',
      name:     'Kuweta do farby',
      icon:     'square',
      required: true,
      estimatedBuyCostPLN: 8,
      notes:    'Plastikowa, dopasowana do szerokości wałka 18 cm. Referencja: FEINZ 32×34 cm / LUX 33×26 cm / HARDY 37×34 cm.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/kuweta-malarska-feinz-32x34-cm-big-do-wa-ka-25-cm-1-szt-/5907900015552_CAPL.prd', verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/kuweta-malarska-180-mm-czarna-dexter-82840998.html',                              verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/wiadra-i-kratki-do-odsaczania/lux-kuweta-malarska-33-x-26-cm-szara/p/7000110',                     verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/kuweta-malarska-37-x-34-cm-hardy',                                                          verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:                  'ladder',
      name:                'Drabina lub schodki',
      icon:                'chevrons-up',
      required:            true,
      rentable:            true,
      estimatedRentCostPLN: 30,
      estimatedBuyCostPLN:  150,
      notes:               'Wystarczy 4–5 stopniowa drabina aluminiowa. Referencja: Drabest 4-stop / Bayersystem 4-stop.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/drabina-aluminiowa-jednostronna-4-stopniowa-z-p-k-i-por-czami-drabest-150kg-1-szt/5904680990086_CAPL.prd', verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/drabina-aluminiowa-4-stopnie-1-stronna-45981124.html',                                                       verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/drabiny-domowe/bayersystem-drabina-aluminiowa-4-stopniowa-125-kg/p/6640700',                                                  verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/drabina-aluminiowa-4-stopniowa-125-kg-eco-drabest',                                                                   verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:       'foil',
      name:     'Folia ochronna na meble',
      icon:     'layers',
      required: true,
      estimatedBuyCostPLN: 10,
      notes:    'Cienka folia LDPE 4 × 5 m, jednorazowa. Referencja: Topex / Dexter / LUX / GO/ON!.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/folia-malarska-topex-ldpe-0-02-mm-4-x-5-m-1-szt/5902062121660_CAPL.prd',                          verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/narzedzia-reczne/pedzle-walki-kuwety/folie-ochronne/folia-malarska-4-x-5-m-dexter,p604098,l2048.html',     verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/zabezpieczenie-przed-malowaniem/lux-folia-malarska-przezroczysta-4-m-x-5-m/p/1397900',                              verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/folia-malarska-standard-4-x-5-m-go-on',                                                                     verifiedAt: '2026-06-09' },
      ],
    },
  ],

  // ── Preparation steps (new rich format) ───────────────────────────────────
  preparationSteps: [
    {
      step:        1,
      phase:       'preparation',
      title:       'Przygotuj pomieszczenie',
      description: 'Wynieś lub przykryj meble folią. Rozłóż folię ochronną na całej podłodze. Zamknij okna jeśli jest wietrznie — kurz psuje farbę.',
      tip:         'Im lepiej zabezpieczysz, tym mniej sprzątania później.',
      durationMin: 20,
      durationMaxMin: 40,
      checkpoints: [
        'Podłoga przykryta folią na całej powierzchni',
        'Meble przesunięte lub przykryte',
      ],
    },
    {
      step:             2,
      phase:            'preparation',
      title:            'Zabezpiecz krawędzie taśmą',
      description:      'Oklej taśmą malarską listwy przypodłogowe, ramy okien, drzwi, gniazdka i przełączniki. Mocuj dokładnie — krzywa taśma = krzywa linia.',
      tip:              'Dociśnij taśmę szpatułką lub paznokciami — farba nie powinna pod nią wnikać.',
      durationMin:      20,
      durationMaxMin:   40,
      requiresTool:     'tape',
      checkpoints: [
        'Wszystkie listwy zabezpieczone',
        'Gniazdka i włączniki zaklejone',
      ],
    },
    {
      step:             3,
      phase:            'preparation',
      title:            'Nanieś grunt (jeśli potrzebny)',
      description:      'Wałkiem nanieś jednolitą warstwę gruntu na całą ścianę. Zacznij od góry, idź w dół. Grunt musi całkowicie wyschnąć (2–4 h) przed farbą.',
      tip:              'Grunt jest wymagany na: nowych ścianach, po naprawach, po zeskrobaniu starej farby, na pylących lub bardzo chłonnych podłożach. Na stabilnej, wcześniej malowanej ścianie grunt NIE jest konieczny.',
      warning:          'Nie pomijaj gruntu na nowych ścianach, naprawianych miejscach lub przy dużej zmianie koloru.',
      durationMin:      45,
      durationMaxMin:   75,
      requiresTool:     'roller',
      requiresMaterial: 'primer-paint',
      checkpoints: [
        'Cała powierzchnia jednolicie pokryta gruntem',
        'Brak niepomalowanych plam',
      ],
    },
  ],

  // ── Main work steps (new rich format) ─────────────────────────────────────
  workSteps: [
    {
      step:             1,
      phase:            'work',
      title:            'Pierwsza warstwa farby',
      description:      'Pędzelkiem pomaluj narożniki i krawędzie (5 cm od krawędzi). Potem wałkiem maluj ruchami pionowymi i poziomymi, nakładając się na siebie 1/3 pasa. Zacznij od góry.',
      tip:              'Nie nakładaj za dużo farby na raz — cienka warstwa wysycha równomiernie i kryje lepiej.',
      durationMin:      60,
      durationMaxMin:   90,
      requiresTool:     'roller',
      requiresMaterial: 'paint',
      checkpoints: [
        'Narożniki pomalowane pędzlem przed wałkowaniem',
        'Brak widocznych smug i prześwitów',
      ],
    },
    {
      step:        2,
      phase:       'drying',
      title:       'Czekaj na wyschnięcie',
      description: 'Poczekaj minimum 4 godziny (lub tyle ile podaje producent). Nie przyspieszaj schnięcia dmuchawą — farba pęka.',
      warning:     'Nie skracaj czasu schnięcia — mokra farba pod mokrą tworzy smugi i zacieki.',
      durationMin: 240,
    },
    {
      step:             3,
      phase:            'work',
      title:            'Druga warstwa farby',
      description:      'Powtórz ten sam proces. Zwróć uwagę na miejsca, gdzie kolor jest nierówny. Maluj przy dobrym oświetleniu bocznym.',
      tip:              'Boczne oświetlenie (np. lampa stojąca) ujawni pominięte miejsca.',
      durationMin:      60,
      durationMaxMin:   90,
      requiresTool:     'roller',
      requiresMaterial: 'paint',
      checkpoints: [
        'Kolor jednolity — brak prześwitu koloru spod spodu',
        'Brak zacieków wzdłuż krawędzi',
      ],
    },
  ],

  // ── Legacy instructions (kept for backward compat with existing screens) ──
  instructions: [
    {
      step: 1, title: 'Przygotuj pomieszczenie',
      description: 'Wynieś lub przykryj meble folią. Rozłóż folię na podłodze. Zakryj taśmą malarską listwy, gniazdka, okna i drzwi.',
      tip: 'Im lepiej zabezpieczysz, tym mniej sprzątania później.', durationMin: 30,
    },
    {
      step: 2, title: 'Nanieś grunt (jeśli potrzebny)',
      description: 'Grunt jest wymagany na nowych ścianach, naprawianych miejscach, po zeskrobaniu, na pylących/chłonnych podłożach. Na stabilnej, wcześniej malowanej ścianie nie jest konieczny. Wałkiem nanieś jednolitą warstwę i poczekaj 2–4 godziny.',
      tip: 'Grunt pomaga farbie równomiernie wsiąkać i lepiej kryć.', durationMin: 60,
    },
    {
      step: 3, title: 'Pierwsza warstwa farby',
      description: 'Pędzelkiem pomaluj narożniki i krawędzie (ok. 5 cm). Potem wałkiem maluj ruchy pionowe i poziome. Zacznij od góry.',
      tip: 'Nie nakładaj za dużo farby na raz — cienka warstwa wysycha równomiernie.', durationMin: 90,
    },
    {
      step: 4, title: 'Czekaj na wyschnięcie',
      description: 'Poczekaj minimum 4 godziny przed nałożeniem kolejnej warstwy.',
      warning: 'Nie skracaj czasu schnięcia — mokra farba pod mokrą tworzy smugi.', durationMin: 240,
    },
    {
      step: 5, title: 'Druga warstwa farby',
      description: 'Powtórz ten sam proces co w kroku 3. Zwróć uwagę na miejsca, gdzie kolor jest nierówny.',
      tip: 'Maluj przy dobrym oświetleniu — boczne światło pokaże pominięte miejsca.', durationMin: 90,
    },
    {
      step: 6, title: 'Zdejmij taśmę i posprzątaj',
      description: 'Gdy farba jest jeszcze lekko wilgotna, powoli zdejmij taśmę malarską pod kątem 45°. Umyj narzędzia wodą.',
      tip: 'Zdejmowanie taśmy gdy farba jest całkowicie sucha może oderwać tynk.', durationMin: 30,
    },
  ],

  // ── Drying times ──────────────────────────────────────────────────────────
  dryingTimes: [
    {
      afterStep:   3,
      description: 'Grunt — czas schnięcia przed farbą',
      minHours:    2,
      maxHours:    4,
      conditions:  '20°C, normalna wentylacja',
    },
    {
      afterStep:   1,
      description: 'Pierwsza warstwa farby — przed drugą warstwą',
      minHours:    4,
      maxHours:    8,
      conditions:  'Im cieplej i bardziej przewiewnie, tym szybciej.',
    },
  ],

  // ── Cleanup steps ─────────────────────────────────────────────────────────
  cleanupSteps: [
    'Zdejmij taśmę malarską gdy farba jest lekko wilgotna (nie mokra) — pod kątem 45°.',
    'Umyj wałki i pędzle ciepłą wodą natychmiast po pracy — zaschnięta farba niszczy narzędzia.',
    'Złóż i wyrzuć folię ochronną. Sprawdź czy na podłodze nie ma plam.',
    'Umyj kuwetę. Zamknij szczelnie opakowanie farby — resztki można przechowywać rok.',
    'Wywietrz pomieszczenie przez minimum 24 godziny.',
  ],

  // ── Quality checklist ─────────────────────────────────────────────────────
  commonMistakes: [
    'Pominięcie gruntowania — farba się łuszczy lub wymaga więcej warstw',
    'Zbyt gruba warstwa farby — spływa i tworzy zacieki',
    'Malowanie na zawilgoconej ścianie — farba odpada po kilku tygodniach',
    'Niechronienie podłogi — plamy z farby są trudne do usunięcia',
    'Zdejmowanie taśmy gdy farba całkowicie wyschła — odrywa się z farbą',
    'Malowanie przy złym oświetleniu — pominięte miejsca widać dopiero po wyschnięciu',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Kolor jest jednolity — brak smug, prześwitów i plam', critical: true },
    { id: 'q2', description: 'Narożniki i krawędzie są czyste i proste' },
    { id: 'q3', description: 'Brak kapnięć i zacieków farby' },
    { id: 'q4', description: 'Listwy i podłoga nie są pobrudzone' },
    { id: 'q5', description: 'Kolor wygląda tak samo w świetle dziennym i sztucznym' },
  ],

  // ── Cost rules ────────────────────────────────────────────────────────────
  costRules: [
    {
      description:    'Malowanie ścian — praca fachowca',
      type:           'per_sqm',
      amountMin:      12,
      amountMax:      25,
      unit:           'PLN/m²',
      notes:          'Cena za 1 warstwę. Grunt i przygotowanie doliczane osobno.',
      isMaterialCost: false,
    },
    {
      description:    'Wynajem drabiny',
      type:           'fixed',
      amountMin:      20,
      amountMax:      40,
      unit:           'PLN/dzień',
      isMaterialCost: false,
    },
  ],

  // ── Professional ──────────────────────────────────────────────────────────
  hireProfessionalRecommended: false,

  // ── Metadata ─────────────────────────────────────────────────────────────
  tags: ['malowanie', 'ściany', 'farba', 'grunt', 'wałek', 'interior', 'łatwe'],

  // ── Content provenance (Phase 1+) ─────────────────────────────────────────
  verifiedAt: '2026-06-09',
  verifiedSources: [
    {
      title:       'Przed malowaniem ścian: gruntowanie ścian i przygotowanie podłoża',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-09',
    },
    {
      title:       'Jak krok po kroku poprawnie przygotować ściany do malowania (Murator Remontuje)',
      url:         'https://muratordom.pl/murator-remontuje/jak-krok-po-kroku-poprawnie-przygotowac-sciany-do-malowania-jakich-materialow-i-narzedzi-uzyc-do-wyrownania-powierzchni-wideo-murator-remontuje-aa-RvBv-GFB3-PiDQ.html',
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

// ─────────────────────────────────────────────────────────────────────────────
// PAINT CEILING
// ─────────────────────────────────────────────────────────────────────────────

export const paintCeilingJob: RenovationJob = {
  id:          'paint-ceiling',
  slug:        'malowanie-sufitu',
  categoryId:  'paint',
  subcategory: 'interior',

  name:             'Malowanie sufitu',
  shortDescription: 'Pomaluj sufit — najtrudniejsze z malarskich zadań, ale możliwe samodzielnie.',
  description:      'Malowanie sufitu to bardziej wymagające zadanie niż malowanie ścian — pracujesz z podniesioną głową, farba kapie, a wałek jest cięższy. Odpowiednie przygotowanie i technika sprawią, że efekt będzie profesjonalny.',
  beginnerFriendlyDescription:
    'Malowanie sufitu wygląda jak malowanie ściany, ale trzeba patrzeć do góry — to szybko męczy. Weź wałek z przedłużką żeby nie musieć ciągle wchodzić na drabinę. Kluczowe: maluj w pasach od okna.',
  coverIcon: 'arrow-up',

  difficulty:        'medium',
  riskLevel:         'low',
  visibilityMode:    'safe_diy',
  estimatedDays:     1,
  estimatedMessLevel: 3,

  safetyEquipment: [
    { id: 'goggles',   name: 'Okulary ochronne', icon: 'eye', required: true,
      notes: 'Farba kapie z sufitu — niezbędna ochrona oczu.' },
    { id: 'old-cloth', name: 'Stare ubranie + nakrycie głowy', icon: 'user', required: true,
      notes: 'Farba sufitowa kapie na głowę — przydaje się czapka.' },
  ],
  warningRules: [
    {
      condition: 'always',
      message: 'Praca z podniesioną głową jest wyczerpująca. Rób przerwy co 20–30 minut.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Upewnij się, że drabina jest stabilna przed wejściem — na mokrej podłodze pod folią ślizga się.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Załóż okulary ochronne — farba kapie.',
      level: 'warning',
    },
  ],

  measurementInputs: [
    {
      id: 'ceilingArea', label: 'Powierzchnia sufitu', unit: 'm²',
      inputType: 'area', placeholder: 'np. 16', min: 1, max: 200,
      hint: 'Zmierz długość × szerokość pokoju.',
    },
    {
      id: 'coats', label: 'Liczba warstw', unit: 'warstwy',
      inputType: 'count', placeholder: '2', defaultValue: 2, min: 1, max: 3,
    },
    {
      id: 'coveragePerLiter', label: 'Wydajność farby (m²/litr)', unit: 'm²/litr',
      inputType: 'coverage', placeholder: '10', defaultValue: 10, min: 6, max: 18,
      required: false, hint: 'Podane na opakowaniu. Farba sufitowa zwykle 8–10 m²/litr.',
    },
  ],

  materials: [
    {
      id:           'ceiling-paint',
      name:         'Farba do sufitów (biała, matowa)',
      brand:        'Magnat Ceramic C45 5 L lub Dekoral Akrylit Sufitowy 5 L (referencja)',
      unit:         'litr',
      formula:      formulaBuilder.coverage(10),
      wasteFactor:  1.05,
      roundingRule: 'ceil',
      packaging: { size: 5, label: 'puszka 5 L', purchaseUnit: 'puszka' },
      pricePerUnit: 22,
      category:     'farba',
      notes:        'Farba sufitowa jest gęstsza i mniej się leje podczas malowania.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/farba-magnat-ceramic-c45-bialy-5-l/5903973153214_CAPL.prd',                                             verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/farba-magnat-ceramic-bialy-5-l-45615171.html',                                              verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/biale-farby-do-scian/farba-magnat-ceramic-biala-5-l/p/3136363',                                              verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/farba-ceramiczna-bialy-c45-5-l-magnat',                                                              verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:           'primer-ceiling',
      name:         'Grunt pod farbę',
      brand:        'Dragon Grunt głęboko penetrujący akrylowy 5 L (referencja)',
      unit:         'litr',
      formulaKey:   'primer',
      wasteFactor:  1.0,
      roundingRule: 'ceil',
      packaging: { size: 5, label: 'pojemnik 5 L', purchaseUnit: 'pojemnik' },
      pricePerUnit: 18,
      category:     'grunt',
      optional:     true,
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/grunt-g-boko-penetruj-cy-akrylowy-dragon-5l/5903649007612_CAPL.prd',                       verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/grunt-do-malowania-gleboko-penetrujacy-akrylowy-dragon-5-litrow-94230442.html',            verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/srodki-do-glebokiego-gruntowania/dragon-grunt-blauer-gleboko-penetrujacy-5l/p/7000094',                      verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/grunt-gleboko-penetrujacy-akrylowy-5-l-dragon',                                                      verifiedAt: '2026-06-09' },
      ],
    },
  ],

  tools: [
    {
      id:                  'roller-ext',
      name:                'Wałek z przedłużką (teleskopową)',
      icon:                'edit-2',
      required:            true,
      notes:               'Umożliwia malowanie sufitu bez wchodzenia na drabinę co chwilę. Wałek 18 cm + drążek teleskopowy 1–2 m.',
      estimatedBuyCostPLN: 40,
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/wa-ek-motive-malarski-nylon-czerwony-pasek-18cm-w-os-12mm-1-szt/5905033135338_CAPL.prd', verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/zestaw-malarski-do-farb-emulsyjnych-walek-18-cm-zapas-kuweta-45878546.html',              verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/walki-malarskie/lux-walek-malarski-basic-180-mm-12-mm/p/2498491',                                          verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/walek-malarski-gelbfaden-18-cm-rdzen-48-mm-poliakryl-12-mm-rota',                                  verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:                  'ladder',
      name:                'Drabina',
      icon:                'chevrons-up',
      required:            true,
      rentable:            true,
      estimatedRentCostPLN: 30,
      notes:               'Wystarczy 4–5 stopniowa drabina aluminiowa. Referencja: Drabest / Bayersystem.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/drabina-aluminiowa-jednostronna-4-stopniowa-z-p-k-i-por-czami-drabest-150kg-1-szt/5904680990086_CAPL.prd', verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/produkty/drabina-aluminiowa-4-stopnie-1-stronna-45981124.html',                                                       verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/drabiny-domowe/bayersystem-drabina-aluminiowa-4-stopniowa-125-kg/p/6640700',                                                  verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/drabina-aluminiowa-4-stopniowa-125-kg-eco-drabest',                                                                   verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:                  'brush',
      name:                'Pędzel 5 cm',
      icon:                'edit-3',
      required:            true,
      estimatedBuyCostPLN: 15,
      notes:               'Płaski 50 mm do narożników sufit-ściana.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/pedzel-plaski-diall-50-mm-id-1091492.html',                                                          verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/narzedzia-reczne/pedzle-walki-kuwety/pedzle/pedzel-plaski-uniwersalny-50-mm-dexter,p587218,l754.html', verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/pedzle/lux-pedzel-plaski-do-emalii-uniwersalny-profi-50-mm/p/5693205',                                     verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/pedzel-ninja-50-mm-angular',                                                                       verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:       'foil',
      name:     'Folia ochronna (całą podłogę i meble!)',
      icon:     'layers',
      required: true,
      notes:    'Cienka folia LDPE 4 × 5 m. Sufit kapie mocno — koniecznie cała podłoga.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/folia-malarska-topex-ldpe-0-02-mm-4-x-5-m-1-szt/5902062121660_CAPL.prd',                          verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/narzedzia-reczne/pedzle-walki-kuwety/folie-ochronne/folia-malarska-4-x-5-m-dexter,p604098,l2048.html',     verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/zabezpieczenie-przed-malowaniem/lux-folia-malarska-przezroczysta-4-m-x-5-m/p/1397900',                              verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/folia-malarska-standard-4-x-5-m-go-on',                                                                     verifiedAt: '2026-06-09' },
      ],
    },
    {
      id:       'tape',
      name:     'Taśma malarska',
      icon:     'minus',
      required: true,
      notes:    'Tesa Standard 25 mm × 50 m — do styku sufit-ściana.',
      shopPrices: [
        { shop: 'castorama',   url: 'https://www.castorama.pl/departments/ta-ma-papierowa-malarska-tesa-51023-25mm-50m-1-szt-/5903719436465_CAPL.prd',                verifiedAt: '2026-06-09' },
        { shop: 'leroyMerlin', url: 'https://www.leroymerlin.pl/artykuly-gospodarcze/tasmy-folie-ochronne/tasmy-malarskie/tasma-malarska-blue-25-mm-x-50-m,p573830,l2047.html', verifiedAt: '2026-06-09' },
        { shop: 'obi',         url: 'https://www.obi.pl/tasmy-klejace/tesa-tasma-malarska-standard-50-m-x-25-mm/p/4153656',                                           verifiedAt: '2026-06-09' },
        { shop: 'bricomarche', url: 'https://www.bricomarche.pl/tasma-malarska-maskujaca-standard-50m-25mm-bezowa-tesa',                                              verifiedAt: '2026-06-09' },
      ],
    },
    { id: 'goggles', name: 'Okulary ochronne', icon: 'eye', required: true,
      safetyNote: 'Farba kapie z sufitu — niezbędne.' },
  ],

  preparationSteps: [
    {
      step: 1, phase: 'preparation', title: 'Zabezpiecz WSZYSTKO',
      description: 'Przykryj całą podłogę i meble. Farba sufitowa kapie znacznie mocniej niż ścienna. Oklej taśmą styk ściany z sufitem.',
      tip: 'Włącz lampę i sprawdź czy folia zakrywa każdy centymetr podłogi.',
      durationMin: 25, durationMaxMin: 40,
      checkpoints: ['Cała podłoga pod folią', 'Styk ściana-sufit zakleiany taśmą'],
    },
  ],

  workSteps: [
    {
      step: 1, phase: 'work', title: 'Nanieś grunt',
      description: 'Wałkiem z przedłużką nanieś grunt. Pracuj pasami równoległymi do okna.',
      durationMin: 45, durationMaxMin: 70,
      requiresTool: 'roller-ext', requiresMaterial: 'primer-ceiling',
    },
    {
      step: 2, phase: 'drying', title: 'Czekaj na wyschnięcie gruntu',
      description: 'Minimum 2–3 godziny. Nie maluj mokrego gruntu.',
      durationMin: 120,
    },
    {
      step: 3, phase: 'work', title: 'Maluj w pasach od okna',
      description: 'Zacznij od okna, maluj pasy równolegle do źródła światła. Najpierw pędzelkiem narożniki, potem wałkiem. To ukryje ewentualne nierówności.',
      tip: 'Rób przerwy — bolą plecy i szyja. To normalne.',
      durationMin: 75, durationMaxMin: 120,
      requiresTool: 'roller-ext', requiresMaterial: 'ceiling-paint',
    },
    {
      step: 4, phase: 'drying', title: 'Czekaj 4h, nanieś drugą warstwę',
      description: 'Po 4 godzinach nanieś drugą warstwę, tym razem prostopadle do pierwszej.',
      durationMin: 75, durationMaxMin: 120,
    },
  ],

  instructions: [
    { step: 1, title: 'Zabezpiecz pokój', description: 'Przykryj całą podłogę i meble. Farba sufitowa kapie mocniej niż ścienna.', durationMin: 30 },
    { step: 2, title: 'Nanieś grunt', description: 'Wałkiem z przedłużką nanieś grunt. Pracuj pasami, równomiernie.', durationMin: 60 },
    { step: 3, title: 'Maluj w pasach', description: 'Zacznij od okna, maluj pasy równolegle do źródła światła. To ukryje ewentualne nierówności.', tip: 'Rób przerwy — bolą plecy i szyja. To normalne.', durationMin: 90 },
    { step: 4, title: 'Poczekaj i nanieś drugą warstwę', description: 'Po 4 godzinach nanieś drugą warstwę, tym razem prostopadle do pierwszej.', durationMin: 90 },
  ],

  dryingTimes: [
    { afterStep: 1, description: 'Grunt przed farbą', minHours: 2, maxHours: 4, conditions: '20°C' },
    { afterStep: 3, description: 'Pierwsza warstwa farby', minHours: 4, maxHours: 8 },
  ],

  cleanupSteps: [
    'Zdejmij taśmę gdy farba jest lekko wilgotna — pod kątem 45°.',
    'Umyj narzędzia natychmiast po pracy.',
    'Sprawdź czy farba nie kapnęła na ściany — zetrzyj wilgotną szmatką.',
    'Wywietrz pomieszczenie minimum 24 godziny.',
  ],

  commonMistakes: [
    'Zbyt rzadka farba — kapie i nie kryje',
    'Malowanie pod słońce — trudno zobaczyć pominięte miejsca',
    'Brak okularów — farba w oczach jest bardzo nieprzyjemna',
    'Brak przerw — ból karku i gorsza jakość pracy',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Kolor jednolity — bez smug i prześwitów', critical: true },
    { id: 'q2', description: 'Brak kapnięć na ścianach i podłodze' },
    { id: 'q3', description: 'Narożniki sufit–ściana są czyste' },
  ],

  costRules: [
    {
      description: 'Malowanie sufitu — praca fachowca',
      type: 'per_sqm', amountMin: 18, amountMax: 35, unit: 'PLN/m²',
      notes: 'Droższe niż ściany ze względu na trudność pracy.',
    },
  ],

  hireProfessionalRecommended: false,
  tags: ['malowanie', 'sufit', 'farba', 'interior'],

  // ── Content provenance ────────────────────────────────────────────────────
  verifiedAt: '2026-06-09',
  verifiedSources: [
    {
      title:       'Jak pomalować sufit krok po kroku',
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
