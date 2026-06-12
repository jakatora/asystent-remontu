import type { RenovationJob } from '@/types/domain';
import { SHARED_SHOP_PRICES } from '@/data/prices/shared-shop-prices';

// ─── Interior door painting ───────────────────────────────────────────────────

export const doorPaintingJob: RenovationJob = {
  id: 'door-painting',
  categoryId: 'doors',
  name: 'Malowanie drzwi wewnętrznych',
  description: 'Odśwież stare drzwi nową warstwą farby — tania alternatywa do wymiany.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'droplet',
  warningRules: [
    {
      condition: 'always',
      message: 'Zdejmij klamki i zawiasy lub dokładnie je zakryj taśmą maskującą — farba na okuciach wygląda nieestetycznie.',
      level: 'info',
    },
    {
      condition: 'always',
      message: 'Stare drzwi z PCV lub okleiną nie maluj zwykłą farbą — użyj farby do PCW lub lakieru podkładowego.',
      level: 'warning',
    },
  ],
  measurementInputs: [
    {
      id: 'doorCount',
      label: 'Liczba skrzydeł drzwiowych',
      unit: 'szt.',
      placeholder: '2',
      min: 1,
      max: 20,
    },
  ],
  materials: [
    {
      id: 'door-primer',
      name: 'Grunt pod drewno lub PCV',
      brand: 'Dragon Grunt głęboko penetrujący akrylowy 5 L (referencja)',
      unit: 'litr',
      formulaKey: 'constant',
      pricePerUnit: 20,
      notes: '1 litr wystarczy na 4–6 drzwi. Niezbędny na gładkich powierzchniach.',
      shopPrices: SHARED_SHOP_PRICES.primerDragon5L,
    },
    {
      id: 'door-paint',
      name: 'Farba do drewna (emalia, satynowa lub mat)',
      unit: 'litr',
      formulaKey: 'faucets',
      pricePerUnit: 40,
      wasteFactor: 0.5,
      notes: 'Ok. 0,3–0,4 L na jedno skrzydło (2 warstwy). Emalia satynowa jest najbardziej trwała.',
    },
    {
      id: 'sandpaper-door',
      name: 'Papier ścierny 120 i 240',
      unit: 'arkusz',
      formulaKey: 'sandpaper',
      pricePerUnit: 2,
    },
    {
      id: 'masking-tape-door',
      name: 'Taśma maskująca',
      brand: 'Tesa Taśma malarska Standard 25 mm × 50 m (referencja)',
      unit: 'rolka',
      formulaKey: 'constant',
      pricePerUnit: 8,
      shopPrices: SHARED_SHOP_PRICES.paintersTape25mm,
    },
  ],
  tools: [
    { id: 'brush-door', name: 'Pędzel 5 cm (do listew i wklęsłości)', icon: 'edit-2', required: true, shopPrices: SHARED_SHOP_PRICES.brush50mm },
    { id: 'mini-roller', name: 'Mini wałek gąbkowy (do płaskich powierzchni)', icon: 'tool', required: true },
    { id: 'sanding-block', name: 'Klocek szlifierski', icon: 'square', required: true },
    { id: 'tack-cloth', name: 'Ściereczka antystatyczna (do usuwania pyłu)', icon: 'square', required: false },
  ],
  instructions: [
    { step: 1, title: 'Zdejmij okucia i zamaskuj', description: 'Zdejmij klamki, szyldy, zawiasy jeśli możliwe. Naklejaj taśmę maskującą na ościeżnicę, podłogę i elementy nie do malowania.', durationMin: 20 },
    { step: 2, title: 'Szlifuj starą powierzchnię', description: 'Papierem 120 zmatuj całą powierzchnię. Przy starej, łuszczącej się farbie — zszlifuj do drewna. Papierm 240 wygładź na końcu. Zetrzyj pył ściereczką.', durationMin: 45 },
    { step: 3, title: 'Nanieś grunt', description: 'Cienkią warstwą gruntu pokryj całą powierzchnię. Wysuszyć 2–4h. Lekko przeszlifuj papierem 240, zetrzyj pył.', durationMin: 30 },
    { step: 4, title: 'Maluj wałkiem i pędzlem', description: 'Zacznij od wklęsłych listew (pędzel), potem płaskie powierzchnie (wałek). Cienkie warstwy — 2–3 razy. Między warstwami 2–4h schnięcia.', tip: 'Maluj w kierunku słojów drewna. Cienkie warstwy nie ściekają.', durationMin: 90 },
    { step: 5, title: 'Zamontuj okucia i zdejmij taśmę', description: 'Po wyschnięciu ostatniej warstwy (min. 24h) zdejmij taśmy, przykręć klamki i okucia.', durationMin: 20 },
  ],
  commonMistakes: [
    'Brak gruntowania — farba łuszczy się po kilku miesiącach',
    'Zbyt gruba warstwa — farba ścieka i tworzy zacieki',
    'Malowanie na pylistej powierzchni — grudki i nierówności',
    'Zdejmowanie taśmy za późno — farba się łamie przy krawędziach',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Farba jest równomiernie nałożona bez zacieków' },
    { id: 'q2', description: 'Krawędzie są ostre i czyste' },
    { id: 'q3', description: 'Okucia działają poprawnie po montażu' },
  ],
  hireProfessionalRecommended: false,
  tags: ['drzwi', 'malowanie', 'odświeżenie', 'emalia', 'farba'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Malowanie drzwi wewnętrznych — instrukcja',
      url:         'https://www.castorama.pl/pomaluj-sciany-jak-profesjonalista-malowanie-krok-po-kroku-ins-1119211.html',
      domain:      'castorama.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Door handle and lock replacement ────────────────────────────────────────

export const doorHandleReplaceJob: RenovationJob = {
  id: 'door-handle-replace',
  categoryId: 'doors',
  name: 'Wymiana klamki lub zamka',
  description: 'Wymień zużytą klamkę, szyld lub wkładkę zamka drzwiowego.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'key',
  warningRules: [
    {
      condition: 'always',
      message: 'Przed zakupem wkładki zamka zmierz starą — długość od środka (tuleja) do obu końców, np. 30/10. Źle dobrana nie zadziała.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'handleCount',
      label: 'Liczba klamek/zamków do wymiany',
      unit: 'szt.',
      placeholder: '1',
      min: 1,
      max: 20,
    },
  ],
  materials: [
    {
      id: 'door-handle',
      name: 'Nowa klamka z szyldem (komplet)',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 80,
      notes: 'Zrób zdjęcie starej klamki i rozstaw osi (zazwyczaj 72 mm). Pokaż sprzedawcy.',
    },
    {
      id: 'lock-cylinder',
      name: 'Wkładka zamka (jeśli wymiana zamka)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 60,
      notes: 'Zmierz rozmiar starej wkładki przed zakupem.',
    },
  ],
  tools: [
    { id: 'screwdriver-handle', name: 'Wkrętaki płaski i krzyżakowy', icon: 'tool', required: true },
    { id: 'allen-handle', name: 'Klucz imbusowy (do ukrytych śrub)', icon: 'tool', required: false, notes: 'Wiele klamek ma ukrytą śrubę imbusową po bocznej stronie szyldu' },
    { id: 'tape-measure-handle', name: 'Miarka (do mierzenia wkładki)', icon: 'minus', required: false },
  ],
  instructions: [
    { step: 1, title: 'Zdejmij starą klamkę', description: 'Poszukaj śruby bocznej (imbusowej) lub podnieś plastikową osłonkę by dostać do śrub. Odkręć i zdejmij szyldy i klamki.', durationMin: 10 },
    { step: 2, title: 'Sprawdź wymiary i kup nową', description: 'Zmierz rozstaw osi śrub (standard: 72 mm), rozmiar wkładki zamka. Zrób zdjęcie i pokaż w sklepie.', durationMin: 5 },
    { step: 3, title: 'Zamontuj nową klamkę', description: 'Wstaw mechanizm w otwór, przykręć boczne śruby, nałóż szyldy z obu stron, przykręć śruby lub zatrzaśnij.', durationMin: 15 },
    { step: 4, title: 'Sprawdź działanie', description: 'Sprawdź czy klamka opuszcza się płynnie i wraca do pozycji. Zamknij i otwórz drzwi z kluczem kilkakrotnie.', durationMin: 5 },
  ],
  commonMistakes: [
    'Zły rozmiar wkładki — nie pasuje do drzwi',
    'Pominięcie ukrytej śruby imbusowej — szarpanie za klamkę niszczy mechanizm',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Klamka opuszcza się płynnie i sprężynuje z powrotem' },
    { id: 'q2', description: 'Zamek otwiera i zamyka się kluczem bez problemów' },
    { id: 'q3', description: 'Szyld jest równo i szczelnie przy drzwiach' },
  ],
  hireProfessionalRecommended: false,
  tags: ['drzwi', 'klamka', 'zamek', 'wkładka', 'wymiana'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Wymiana klamki i wkładki — krok po kroku',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Door / window seal replacement ──────────────────────────────────────────

export const doorSealReplaceJob: RenovationJob = {
  id: 'door-seal-replace',
  categoryId: 'windows',
  name: 'Wymiana uszczelek drzwi i okien',
  description: 'Wymień zużyte uszczelki — eliminuje przeciągi, hałas i wilgoć.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'wind',
  warningRules: [
    {
      condition: 'always',
      message: 'Dobierz uszczelkę do profilu okna/drzwi — jest wiele przekrojów (P, D, E, Q). Stara uszczelka jest wzorem do doboru.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'sealPerimeter',
      label: 'Łączny obwód do uszczelnienia',
      unit: 'mb',
      placeholder: 'np. 20',
      min: 1,
      max: 200,
      hint: 'Zmierz obwód każdego okna/drzwi i zsumuj. Dodaj 20% zapasu.',
    },
  ],
  materials: [
    {
      id: 'door-seal-mat',
      name: 'Uszczelka gumowa samoprzylepna',
      unit: 'mb',
      formulaKey: 'skirting',
      pricePerUnit: 3,
      wasteFactor: 1.2,
      notes: 'Kup kilka typów przekrojów i dobierz na miejscu — sklep hydrauliczny lub OBI.',
    },
    {
      id: 'cleaner-seal',
      name: 'Alkohol izopropylowy (do czyszczenia rowka)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 8,
    },
  ],
  tools: [
    { id: 'scissors-seal', name: 'Nożyczki lub nóż', icon: 'scissors', required: true },
    { id: 'cloth-seal', name: 'Ściereczka do czyszczenia', icon: 'square', required: true },
  ],
  instructions: [
    { step: 1, title: 'Usuń starą uszczelkę', description: 'Wyciągnij starą uszczelkę z rowka w ramie lub odklej samoprzylepną. Zachowaj kawałek jako wzór do sklepu.', durationMin: 20 },
    { step: 2, title: 'Wyczyść rowek alkoholem', description: 'Zetrzyj resztki starego kleju i brud alkoholem izopropylowym. Poczekaj aż wyschnie.', durationMin: 15 },
    { step: 3, title: 'Wciśnij lub naklej nową uszczelkę', description: 'Uszczelki wpustowe: wciśnij w rowek (bez kleju). Samoprzylepne: odklej folię i naklej po zewnętrznej krawędzi skrzydła.', tip: 'Zaczynaj od narożnika i idź dookoła bez naciągania uszczelki.', durationMin: 30 },
    { step: 4, title: 'Sprawdź szczelność', description: 'Zamknij okno/drzwi i sprawdź czy uszczelka jest ściśnięta równomiernie. Przy silnym wietrze sprawdź czy nie ma przeciągów.', durationMin: 10 },
  ],
  commonMistakes: [
    'Naciąganie uszczelki podczas naklejania — odkleją się w narożnikach',
    'Zły profil uszczelki — nie pasuje do rowka',
    'Naklejanie na brudną powierzchnię — uszczelka odpada',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Brak przeciągów przy zamkniętym oknie/drzwiach' },
    { id: 'q2', description: 'Uszczelka jest równomiernie dookoła ramy' },
    { id: 'q3', description: 'Okno/drzwi zamykają się bez nadmiernego oporu' },
  ],
  hireProfessionalRecommended: false,
  tags: ['uszczelka', 'okno', 'drzwi', 'przeciąg', 'izolacja'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Wymiana uszczelek w oknach i drzwiach',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Toilet seat replacement ──────────────────────────────────────────────────

export const toiletSeatReplaceJob: RenovationJob = {
  id: 'toilet-seat-replace',
  categoryId: 'plumbing',
  name: 'Wymiana deski sedesowej',
  description: 'Szybka wymiana deski sedesowej — bez hydraulika, kilka minut roboty.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'circle',
  warningRules: [
    {
      condition: 'always',
      message: 'Przed zakupem zmierz rozstaw śrub mocujących na misie (standardowo 15–18 cm) i kształt misy (okrągła / podłużna).',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'seatCount',
      label: 'Liczba desek do wymiany',
      unit: 'szt.',
      placeholder: '1',
      min: 1,
      max: 10,
    },
  ],
  materials: [
    {
      id: 'toilet-seat-mat',
      name: 'Nowa deska sedesowa',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 80,
      notes: 'Zmierz rozstaw śrub (ok. 15–18 cm) i kształt misy. Standardowe deski pasują do większości mis.',
    },
  ],
  tools: [
    { id: 'screwdriver-seat', name: 'Wkrętaki lub klucz do nakrętek', icon: 'tool', required: true },
    { id: 'adjustable-wrench-seat', name: 'Klucz nastawny (do plastikowych nakrętek)', icon: 'tool', required: false },
  ],
  instructions: [
    { step: 1, title: 'Zdejmij starą deskę', description: 'Unieś plastikowe osłony nad misą przy zawiasach — odsłonią się nakrętki. Odkręć wkrętakiem lub kluczem. Zdejmij deskę i śruby.', durationMin: 10 },
    { step: 2, title: 'Zamontuj nową deskę', description: 'Wstaw śruby w otwory w misie od góry. Nałóż gumowe uszczelki, podkładki i dokręć nakrętki od spodu — ręcznie, nie za mocno.', durationMin: 10 },
    { step: 3, title: 'Wyreguluj pozycję i sprawdź', description: 'Ustaw deskę centralnie, dokręć nakrętki. Otwórz i zamknij kilkakrotnie — powinna płynnie opadać (deski wolnoopadające) lub nie skrzypieć.', durationMin: 5 },
  ],
  commonMistakes: [
    'Zły rozmiar — deska jest za wąska lub za krótka',
    'Za mocne dokręcenie plastikowych nakrętek — pęknięcie',
    'Brak gumowych podkładek — deska się rusza',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Deska jest stabilna i nie rusza się bocznie' },
    { id: 'q2', description: 'Zawiasy działają płynnie' },
    { id: 'q3', description: 'Deska jest wyśrodkowana na misie' },
  ],
  hireProfessionalRecommended: false,
  tags: ['toaleta', 'deska', 'sedes', 'wymiana', 'łazienka'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Wymiana deski sedesowej',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Sink trap replacement ────────────────────────────────────────────────────

export const sinkTrapReplaceJob: RenovationJob = {
  id: 'sink-trap-replace',
  categoryId: 'plumbing',
  name: 'Wymiana syfonu (sif. zlewozmywaka / umywalki)',
  description: 'Wymień zatkany lub nieszczelny syfon pod zlewem lub umywalką.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'droplet',
  warningRules: [
    {
      condition: 'always',
      message: 'Postaw wiadro pod syfonem przed odkręceniem — zawsze wycieka woda stojąca w syfonie.',
      level: 'warning',
    },
  ],
  measurementInputs: [
    {
      id: 'trapCount',
      label: 'Liczba syfonów do wymiany',
      unit: 'szt.',
      placeholder: '1',
      min: 1,
      max: 10,
    },
  ],
  materials: [
    {
      id: 'sink-trap-mat',
      name: 'Nowy syfon (butelkowy lub rurowy)',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 30,
      notes: 'Zrób zdjęcie starego syfonu. Standard: odpływ umywalki Ø32mm, zlewozmywak Ø40mm.',
    },
    {
      id: 'teflon-trap',
      name: 'Taśma teflonowa (do gwintów)',
      unit: 'rolka',
      formulaKey: 'constant',
      pricePerUnit: 4,
    },
  ],
  tools: [
    { id: 'bucket-trap', name: 'Wiadro', icon: 'circle', required: true },
    { id: 'cloth-trap', name: 'Szmaty / ręczniki', icon: 'square', required: true },
    { id: 'pliers-trap', name: 'Szczypce (do twardych nakrętek)', icon: 'tool', required: false },
  ],
  instructions: [
    { step: 1, title: 'Postaw wiadro i odkręć stary syfon', description: 'Pod syfonem postaw wiadro. Odkręć ręcznie lub szczypcami nakrętki łączące części syfonu. Wyjmij syfon — wyleje się woda.', durationMin: 10 },
    { step: 2, title: 'Oczyść końcówki rur', description: 'Oczyść gwinty przy odpływie zlewu i przy rurze ściennej. Usuń resztki starej uszczelki.', durationMin: 5 },
    { step: 3, title: 'Zamontuj nowy syfon', description: 'Złóż nowy syfon wg instrukcji (gumowe uszczelki są w zestawie). Przykręć do odpływu i rury ściennej. Nie dokręcaj za mocno — plastik się tłucze.', durationMin: 15 },
    { step: 4, title: 'Sprawdź szczelność', description: 'Odkręć wodę i puść przez chwilę. Sprawdź każde połączenie czy nie kapie. Poczekaj minutę i sprawdź ponownie.', durationMin: 5 },
  ],
  commonMistakes: [
    'Brak wiadra — mokra szafka pod zlewem',
    'Za mocne dokręcenie plastikowych nakrętek — pęknięcie',
    'Brak uszczelki gumowej — natychmiastowy przeciek',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Żadne połączenie nie kapie pod pełnym przepływem wody' },
    { id: 'q2', description: 'Syfon jest stabilnie zamocowany' },
    { id: 'q3', description: 'Woda odpływa swobodnie' },
  ],
  hireProfessionalRecommended: false,
  tags: ['syfon', 'zlew', 'umywalka', 'hydraulika', 'wymiana'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Wymiana syfonu — instrukcja',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Drain unblocking ─────────────────────────────────────────────────────────

export const drainUnblockJob: RenovationJob = {
  id: 'drain-unblock',
  categoryId: 'plumbing',
  name: 'Udrożnienie odpływu',
  description: 'Usuń zatkanie zlewozmywaka, umywalki, prysznica lub wanny bez wzywania hydraulika.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'loader',
  warningRules: [
    {
      condition: 'always',
      message: 'Nie mieszaj chemicznych środków do udrożniania — mogą reagować i produkować toksyczne gazy.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Jeśli zatkanie dotyczy kilku odpływów jednocześnie — problem może być w pionach lub kolumnie. Zgłoś do zarządcy budynku.',
      level: 'warning',
    },
  ],
  measurementInputs: [],
  materials: [
    {
      id: 'drain-cleaner',
      name: 'Środek do udrożniania odpływów (żelowy)',
      unit: 'butelka',
      formulaKey: 'constant',
      pricePerUnit: 15,
      notes: 'Np. Krect Żel lub odpowiednik. Do włosów — preparaty enzymatyczne działają bezpieczniej.',
    },
    {
      id: 'rubber-plunger',
      name: 'Przepychacz gumowy (tłok)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 20,
    },
  ],
  tools: [
    { id: 'plunger-drain', name: 'Przepychacz (tłok)', icon: 'circle', required: true },
    { id: 'drain-snake', name: 'Sprężyna do udrożniania (węgorz)', icon: 'tool', required: false, notes: 'Przy twardszych zatkaciach — dostępna w sklepach' },
    { id: 'rubber-gloves', name: 'Gumowe rękawice', icon: 'shield', required: true },
  ],
  instructions: [
    { step: 1, title: 'Spróbuj przepychaczem', description: 'Napełnij zlew do połowy wodą. Przyłóż przepychacz szczelnie na odpływ. Energicznie pompuj 10–15 razy, potem gwałtownie unieś.', durationMin: 10, tip: 'W zlewie z przelewem — zakryj przelew mokrą szmatą dla lepszego ciśnienia.' },
    { step: 2, title: 'Wyczyść syfon ręcznie', description: 'Jeśli nie pomaga — odkręć syfon (wiadro pod spód), wyciągnij zatkanie ręcznie. Często tam jest problem.', durationMin: 15 },
    { step: 3, title: 'Użyj środka chemicznego', description: 'Wlej środek żelowy wg instrukcji (zazwyczaj odczekaj 15–30 minut lub całą noc). Przepłucz dużą ilością gorącej wody.', warning: 'Używaj rękawic. Nie mieszaj z innymi środkami.', durationMin: 30 },
    { step: 4, title: 'Sprawdź odpływ', description: 'Puść wodę i sprawdź czy odpływa normalnie. W razie potrzeby powtórz zabieg.', durationMin: 5 },
  ],
  commonMistakes: [
    'Mieszanie różnych środków chemicznych — ryzyko poparzenia i oparów',
    'Ignorowanie zatkanego syfonu — najprostsze rozwiązanie często pomijane',
    'Kilka zatkaniai jednocześnie — to problem zbiorczy, nie domowy',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Woda odpływa swobodnie bez cofania się' },
    { id: 'q2', description: 'Brak nieprzyjemnych zapachów z odpływu' },
  ],
  hireProfessionalRecommended: false,
  tags: ['odpływ', 'zatkanie', 'hydraulika', 'udrożnienie', 'zlew'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Udrażnianie zatkanego odpływu',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Light fixture / bulb replacement ────────────────────────────────────────

export const lightFixtureJob: RenovationJob = {
  id: 'light-fixture-replace',
  categoryId: 'electrical',
  name: 'Wymiana oprawy oświetleniowej',
  description: 'Wymień starą lampę sufitową lub kinkiet na nową — prosta wymiana elektryczna.',
  difficulty: 'easy',
  riskLevel: 'medium',
  estimatedDays: 1,
  coverIcon: 'sun',
  warningRules: [
    {
      condition: 'always',
      message: 'ZAWSZE wyłącz bezpiecznik dla pomieszczenia PRZED dotknięciem przewodów. Sprawdź napięcie woltomierzem.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Sprawdzenie wyłącznikiem na ścianie NIE wystarczy — bezpiecznik w tablicy musi być wyłączony.',
      level: 'danger',
    },
  ],
  measurementInputs: [
    {
      id: 'fixtureCount',
      label: 'Liczba opraw do wymiany',
      unit: 'szt.',
      placeholder: '1',
      min: 1,
      max: 20,
    },
  ],
  materials: [
    {
      id: 'light-fixture-mat',
      name: 'Nowa oprawa oświetleniowa',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 120,
      notes: 'Sprawdź typ źródła światła (E27, GU10, LED panel) i moc oprawy.',
    },
    {
      id: 'wire-connectors',
      name: 'Złączki elektryczne (wagO lub śrubowe)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 1,
      wasteFactor: 5,
      notes: 'Jeśli stare złączki są zużyte lub niesprawne — wymień.',
    },
  ],
  tools: [
    { id: 'multimeter-fix', name: 'Woltomierz / tester napięcia', icon: 'zap', required: true, notes: 'Konieczne do sprawdzenia czy prąd jest wyłączony' },
    { id: 'screwdriver-fix', name: 'Wkrętaki', icon: 'tool', required: true },
    { id: 'ladder-fix', name: 'Drabina lub krzesło', icon: 'chevrons-up', required: true },
    { id: 'pliers-fix', name: 'Szczypce do zdejmowania izolacji', icon: 'tool', required: false },
  ],
  instructions: [
    { step: 1, title: 'WYŁĄCZ BEZPIECZNIK', description: 'Idź do tablicy i wyłącz bezpiecznik dla pomieszczenia. Sprawdź WOLTOMIERZEM czy napięcie w puszce wynosi 0V.', durationMin: 5, warning: 'BEZ TEGO GROZI ŚMIERĆ. Nie pomijaj tego kroku.' },
    { step: 2, title: 'Zdejmij starą oprawę', description: 'Odkręć śruby lub odkręć pierścień. Wyciągnij oprawę. Sfotografuj podłączenie przewodów.', durationMin: 10 },
    { step: 3, title: 'Odłącz przewody', description: 'Odkręć lub wyciągnij przewody ze złączek. Zapamiętaj kolory: niebieski = neutralny (N), brązowy = fazowy (L), żółto-zielony = uziemienie (PE).', durationMin: 10 },
    { step: 4, title: 'Podłącz nową oprawę', description: 'Podłącz przewody wg zdjęcia i oznaczeń producenta. Mocno zaciśnij złączki. Przyłóż oprawę do sufitu i przykręć.', durationMin: 15 },
    { step: 5, title: 'Włącz bezpiecznik i sprawdź', description: 'Wróć do tablicy, włącz bezpiecznik. Sprawdź czy lampa działa i czy nie ma iskrzenia ani nieprzyjemnego zapachu.', durationMin: 5 },
  ],
  commonMistakes: [
    'Praca bez wyłączenia bezpiecznika — ryzyko śmierci',
    'Zamiana fazy z neutralnym — lampa może działać ale jest niebezpieczna',
    'Luźne złączki — przegrzewanie i pożar',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Lampa świeci po włączeniu' },
    { id: 'q2', description: 'Oprawa jest stabilnie zawieszona' },
    { id: 'q3', description: 'Brak szumu, iskrzenia ani zapachu spalenizny' },
  ],
  hireProfessionalRecommended: false,
  hireProfessionalReason: 'Jeśli nie jesteś pewien czy prąd jest wyłączony lub jak podłączyć przewody — zadzwoń do elektryka.',
  tags: ['lampa', 'oprawa', 'oświetlenie', 'elektryka', 'wymiana'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Wymiana lampy sufitowej — instrukcja bezpieczeństwa',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Socket / switch frame replacement ───────────────────────────────────────

export const socketFrameReplaceJob: RenovationJob = {
  id: 'socket-frame-replace',
  categoryId: 'electrical',
  name: 'Wymiana ramki gniazdka lub włącznika',
  description: 'Wymień tylko plastikową ramkę gniazdka lub wyłącznika — bez zmiany elektryki.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'square',
  warningRules: [
    {
      condition: 'always',
      message: 'Wymiana samej ramki (obudowy) NIE wymaga wyłączania prądu — nie dotykasz przewodów. Ale ostrożność zawsze wskazana.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'frameCount',
      label: 'Liczba ramek do wymiany',
      unit: 'szt.',
      placeholder: '5',
      min: 1,
      max: 50,
    },
  ],
  materials: [
    {
      id: 'socket-frames',
      name: 'Ramki do gniazdek / włączników (komplet)',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 8,
      notes: 'Sprawdź serię i producenta — ramki są często seryjne (np. Ospel Sonata, Schneider). Kup z jednej serii dla estetyki.',
    },
  ],
  tools: [
    { id: 'screwdriver-frame', name: 'Wkrętak płaski (do dźwigni zwalniającej)', icon: 'minus', required: true },
    { id: 'screwdriver-cross-frame', name: 'Wkrętak krzyżakowy', icon: 'plus', required: false },
  ],
  instructions: [
    { step: 1, title: 'Zdejmij starą ramkę', description: 'Wiele ramek ma zatrzaski — wkrętakiem płaskim lub palcem unieś krawędź i odczep. Inne mają śrubki — odkręć. Wkład gniazdka zostaje na miejscu.', durationMin: 5 },
    { step: 2, title: 'Nałóż nową ramkę', description: 'Nałóż nową ramkę na wkład gniazdka. Zatrzaśnij lub przykręć śrubki. Upewnij się że leży równo przy ścianie.', durationMin: 5 },
    { step: 3, title: 'Powtórz dla kolejnych', description: 'Przejdź przez wszystkie gniazdka i włączniki w pomieszczeniu. Jeden pokój to zazwyczaj 15–30 minut roboty.', durationMin: 30 },
  ],
  commonMistakes: [
    'Kupno ramek z innej serii — nie pasują do wkładów',
    'Siłowe zdejmowanie — pęknięcie ramki lub wkładu',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Ramki leżą równo przy ścianie, bez szczelin' },
    { id: 'q2', description: 'Gniazdka i włączniki działają poprawnie' },
    { id: 'q3', description: 'Wszystkie ramki są z jednej serii kolorystycznej' },
  ],
  hireProfessionalRecommended: false,
  tags: ['ramka', 'gniazdko', 'włącznik', 'elektryka', 'wymiana'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Wymiana ramek gniazdek i włączników',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};

// ─── Silicone refresh / re-caulking ──────────────────────────────────────────

export const siliconeRefreshJob: RenovationJob = {
  id: 'silicone-refresh',
  categoryId: 'silicone',
  name: 'Odświeżenie silikonu (re-silikonowanie)',
  description: 'Usuń stary, czarny silikon i nałóż świeży — przywróci łazience świeży wygląd.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'edit-3',
  warningRules: [
    {
      condition: 'always',
      message: 'Stary silikon musi być CAŁKOWICIE usunięty — nowy silikon nie przylega do starego.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Nałożony silikon musi schnąć min. 24h bez kontaktu z wodą.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'siliconeLength',
      label: 'Łączna długość fug silikonowych',
      unit: 'mb',
      placeholder: 'np. 8',
      min: 0.5,
      max: 100,
      hint: 'Zmierz: obwód brodzika/wanny + połączenia ścian z podłogą.',
    },
  ],
  materials: [
    {
      id: 'silicone-remover',
      name: 'Środek do usuwania silikonu',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 20,
      notes: 'Np. Pattex Sili-Remover. Nakłada się i czeka 30–60 minut.',
    },
    {
      id: 'fresh-silicone',
      name: 'Silikon sanitarny antygrzybiczny',
      brand: 'Soudal Silikon sanitarny biały 280 ml (referencja)',
      unit: 'kartusze',
      formulaKey: 'silicone',
      pricePerUnit: 22,
      notes: 'Jeden kartusze na ok. 8 mb spoiny. Wybierz kolor pasujący do fugi.',
      shopPrices: SHARED_SHOP_PRICES.siliconeSanitary280ml,
    },
    {
      id: 'masking-tape-sil',
      name: 'Taśma maskująca (do prostych krawędzi)',
      brand: 'Tesa Taśma malarska Standard 25 mm × 50 m (referencja)',
      unit: 'rolka',
      formulaKey: 'constant',
      pricePerUnit: 8,
      notes: 'Naklejona po obu stronach fugi da idealne proste krawędzie.',
      shopPrices: SHARED_SHOP_PRICES.paintersTape25mm,
    },
  ],
  tools: [
    { id: 'silicone-tool', name: 'Narzędzie do usuwania silikonu', icon: 'scissors', required: true, notes: 'Plastikowe lub metalowe — w zestawie ze środkiem lub osobno' },
    { id: 'caulk-gun-sil', name: 'Pistolet do silikonu', icon: 'tool', required: true },
    { id: 'spatula-sil', name: 'Szpachla silikonowa lub palec zwilżony wodą z płynem', icon: 'minus', required: true },
  ],
  instructions: [
    { step: 1, title: 'Nanieś środek do usuwania silikonu', description: 'Nałóż środek na stary silikon. Poczekaj 30–60 minut wg instrukcji. Silikon zmieni konsystencję i łatwiej się odklei.', durationMin: 60 },
    { step: 2, title: 'Usuń stary silikon', description: 'Narzędziem lub paznokciem wyciągnij zmiękczony silikon. Oczyść resztki szpachlą. Przetrzyj alkoholem izopropylowym do czysta.', durationMin: 30 },
    { step: 3, title: 'Naklejaj taśmę maskującą', description: 'Po obu stronach fugi naklejaj taśmę maskującą — zostaw tylko szczelinę szerokości fugi. Taśma da proste, czyste krawędzie.', durationMin: 15 },
    { step: 4, title: 'Nanieś nowy silikon', description: 'Pistoletem nanieś silikon ciągłą linią pod kątem 45°. Natychmiast wygładź wilgotnym palcem lub szpachlą. Zdejmij taśmę PRZED wysychaniem silikonu.', tip: 'Zdejmij taśmę od razu po wygładzeniu, nie czekaj — klej taśmy trafi w silikon.', durationMin: 30 },
    { step: 5, title: 'Schnie 24h — nie moczyć', description: 'Pozostaw silikon do całkowitego wyschnięcia (min. 24h). W tym czasie nie używaj prysznica ani wanny.', durationMin: 5 },
  ],
  commonMistakes: [
    'Nakładanie nowego silikonu na stary — odpada w ciągu kilku miesięcy',
    'Brak taśmy maskującej — nierowne, krzywe krawędzie',
    'Zdejmowanie taśmy po wyschnięciu — silikon się rozrywa',
    'Kontakt z wodą przed wyschnięciem — silikon nie wiąże',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Fuga silikonowa jest równa i gładka' },
    { id: 'q2', description: 'Krawędzie są proste bez rozmazań' },
    { id: 'q3', description: 'Brak szpar ani pęcherzy w silikonie' },
  ],
  hireProfessionalRecommended: false,
  tags: ['silikon', 'fuga', 'łazienka', 'odświeżenie', 'uszczelnienie'],

  verifiedAt: '2026-06-10',
  verifiedSources: [
    {
      title:       'Wymiana silikonu w łazience',
      url:         'https://muratordom.pl/wnetrza/prace-wykonczeniowe/przed-malowaniem-scian-gruntowanie-scian-przygotowanie-podloza-aa-pJxT-ScvS-WMKm.html',
      domain:      'muratordom.pl',
      consultedAt: '2026-06-10',
    },
  ],
};
