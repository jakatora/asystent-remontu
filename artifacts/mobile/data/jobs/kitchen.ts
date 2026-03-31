import type { RenovationJob } from '@/types/domain';

// ─── Backsplash tiles ─────────────────────────────────────────────────────────

export const backsplashTilesJob: RenovationJob = {
  id: 'kitchen-backsplash',
  categoryId: 'kitchen-tiles',
  name: 'Płytki kuchenne (backsplash)',
  description: 'Ułóż dekoracyjne płytki na ścianie za blatem kuchennym.',
  difficulty: 'medium',
  riskLevel: 'low',
  estimatedDays: 2,
  coverIcon: 'grid',
  warningRules: [
    {
      condition: 'always',
      message: 'Wyłącz gniazdka elektryczne w okolicy robót — pracujesz blisko instalacji.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Dokładnie odmierz i wytnij płytki wokół gniazdek i przełączników.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'wallArea',
      label: 'Powierzchnia ściany backsplash',
      unit: 'm²',
      placeholder: 'np. 3',
      min: 0.5,
      max: 30,
      hint: 'Szerokość blatu × wysokość od blatu do szafek (zazwyczaj 0,5–0,6 m).',
    },
  ],
  materials: [
    {
      id: 'backsplash-tiles',
      name: 'Płytki kuchenne (metro / dekor)',
      unit: 'm²',
      formulaKey: 'tiles',
      pricePerUnit: 80,
      wasteFactor: 1.15,
      notes: 'Dolicz 15% zapas na docinanie i ewentualne pęknięcia.',
    },
    {
      id: 'tile-adhesive',
      name: 'Klej do płytek (biały, szybkoschnący)',
      unit: 'kg',
      formulaKey: 'tileAdhesive',
      pricePerUnit: 2.5,
      notes: 'Biały klej jest zalecany, by nie przebarwiał jasnych płytek.',
    },
    {
      id: 'grout-kitchen',
      name: 'Fuga epoksydowa (odporna na tłuszcz)',
      unit: 'kg',
      formulaKey: 'grout',
      pricePerUnit: 30,
      notes: 'Fuga epoksydowa jest łatwiejsza do czyszczenia w kuchni.',
    },
    {
      id: 'silicone-kitchen',
      name: 'Silikon sanitarny (krawędź blatu)',
      unit: 'kartusze',
      formulaKey: 'silicone',
      pricePerUnit: 22,
      notes: '1 kartusze na ok. 8 mb spoiny — uszczelnia styk blatu ze ścianą.',
    },
    {
      id: 'tile-crosses-kitchen',
      name: 'Krzyżyki dystansowe 2mm',
      unit: 'szt',
      formulaKey: 'crosses',
      pricePerUnit: 0.05,
    },

  ],
  tools: [
    { id: 'tile-cutter', name: 'Przecinarka do glazury', icon: 'scissors', required: true, rentable: true, notes: 'Elektryczna znacznie przyspiesza pracę' },
    { id: 'notched-trowel', name: 'Paca zębata 6mm', icon: 'tool', required: true },
    { id: 'rubber-mallet', name: 'Młotek gumowy', icon: 'box', required: true },
    { id: 'level', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'sponge', name: 'Gąbka do fugowania', icon: 'droplet', required: true },
    { id: 'caulk-gun', name: 'Pistolet do silikonu', icon: 'tool', required: true },
  ],
  instructions: [
    {
      step: 1,
      title: 'Przygotuj ścianę',
      description: 'Oczyść ścianę z tłuszczu i brudu. Stara farba powinna być matowa i dobrze przylegać. Wyrównaj nierówności. Zaznacz poziome linie prowadnice.',
      tip: 'Blat kuchenny zazwyczaj nie jest idealnie poziomy — wyznacz poziomą linię startową.',
      durationMin: 30,
    },
    {
      step: 2,
      title: 'Nanieś klej i układaj płytki',
      description: 'Pacą zębatą nanieś klej na powierzchnię ściany. Układaj płytki od dołu do góry, wkładając krzyżyki dystansowe. Stukaj gumowym młotkiem.',
      tip: 'Zacznij od środka blatu i idź w obie strony — efektowniej wygląda kiedy cięte płytki są po bokach.',
      durationMin: 180,
    },
    {
      step: 3,
      title: 'Odczekaj 24h i fuguj',
      description: 'Po wyschnięciu kleju (min. 24h) usuń krzyżyki. Nałóż fugę na całość, ukośnymi ruchami pakując ją w szczeliny. Usuń nadmiar wilgotną gąbką.',
      warning: 'Przed fugowaniem sprawdź, czy klej jest całkowicie suchy.',
      durationMin: 90,
    },
    {
      step: 4,
      title: 'Silikonuj krawędzie',
      description: 'Krawędź między blatem a płytkami uszczelnij silikonem sanitarnym. Wyrównaj mokry silikon palcem lub szpachlą silikonową.',
      tip: 'Silikon jest elastyczny — nie pęka przy ruchach blatu. Fuga tu by pękała.',
      durationMin: 30,
    },
  ],
  commonMistakes: [
    'Pomijanie szczeliny silikonowej przy blacie — fuga tu pęka',
    'Układanie płytek bez sprawdzania poziomicy co kilka rzędów',
    'Za mało kleju — płytka odpadnie po kilku miesiącach',
    'Fugowanie zbyt szybko po ułożeniu — klej musi wyschnąć',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Fuga jest równomiernie wypełniona, bez dziur' },
    { id: 'q2', description: 'Płytki są poziome i pionowe' },
    { id: 'q3', description: 'Krawędź blatu jest uszczelniona silikonem' },
    { id: 'q4', description: 'Brak pęknięć w płytkach po ułożeniu' },
  ],
  hireProfessionalRecommended: false,
  tags: ['kuchnia', 'płytki', 'glazura', 'backsplash', 'ściana'],
};

// ─── Kitchen countertop installation ─────────────────────────────────────────

export const countertopInstallJob: RenovationJob = {
  id: 'kitchen-countertop',
  categoryId: 'kitchen-tiles',
  name: 'Montaż blatu kuchennego',
  description: 'Zamontuj nowy blat laminowany lub z konglomeratu na szafkach kuchennych.',
  difficulty: 'medium',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'layout',
  warningRules: [
    {
      condition: 'always',
      message: 'Przy cięciu blatu używaj okularów ochronnych — drobne odpryski są niebezpieczne.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Wyłącz wodę przed podłączeniem zlewu.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'linearMeters',
      label: 'Długość blatu',
      unit: 'm',
      placeholder: 'np. 3.6',
      min: 0.5,
      max: 20,
      hint: 'Zmierz całkowitą długość blatów. Blaty mają standardową szerokość 60 cm.',
    },
  ],
  materials: [
    {
      id: 'countertop',
      name: 'Blat kuchenny laminowany (60cm)',
      unit: 'm.b.',
      formulaKey: 'linearMeters',
      pricePerUnit: 120,
      wasteFactor: 1.1,
      notes: 'Standardowa szerokość 60 cm, grubość 28–38 mm.',
    },
    {
      id: 'countertop-silicone',
      name: 'Silikon sanitarny (uszczelnienie)',
      unit: 'kartusze',
      formulaKey: 'silicone',
      pricePerUnit: 22,
    },
    {
      id: 'countertop-screws',
      name: 'Śruby i uchwyty montażowe',
      unit: 'zestaw',
      formulaKey: 'constant',
      pricePerUnit: 45,
    },
  ],
  tools: [
    { id: 'jigsaw', name: 'Wyrzynarka (z tarczą do laminatu)', icon: 'tool', required: true, rentable: true },
    { id: 'drill', name: 'Wiertarka', icon: 'tool', required: true },
    { id: 'level', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'caulk-gun', name: 'Pistolet do silikonu', icon: 'tool', required: true },
  ],
  instructions: [
    {
      step: 1,
      title: 'Zmierz i przytnij blat',
      description: 'Zmierz długość i zaznacz linię cięcia. Tną wyrzynarką od spodu — zmniejsza odpryski na górnej powierzchni.',
      durationMin: 60,
    },
    {
      step: 2,
      title: 'Wykonaj wycięcie pod zlew',
      description: 'Nanieś kontur zlewu (zwykle dołączony jest szablon), wywiercaj otwory narożne, wytnij wyrzynarką.',
      tip: 'Poproś kogoś o podtrzymanie wycinkanego fragmentu — inaczej odpryśnie i zarysuje blat.',
      durationMin: 45,
    },
    {
      step: 3,
      title: 'Połącz segmenty i zamontuj',
      description: 'Połącz segmenty blatów łącznikami śrubowymi. Posmaruj spód silikone i przymocuj do szafek wkrętami przez tylną listwę.',
      durationMin: 60,
    },
    {
      step: 4,
      title: 'Uszczelnij krawędzie',
      description: 'Silikonem uszczelnij styk blatu ze ścianą i wokół zlewu. Wygładź palcem.',
      durationMin: 20,
    },
  ],
  commonMistakes: [
    'Cięcie od góry — blat się łuszczy',
    'Brak uszczelnienia wokół zlewu — woda niszczy płytę wiórową',
    'Nierówny montaż bez poziomicy',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Blat jest idealnie poziomy' },
    { id: 'q2', description: 'Wszystkie krawędzie są uszczelnione silikonem' },
    { id: 'q3', description: 'Zlew dobrze siedzi, bez szczelin' },
  ],
  hireProfessionalRecommended: false,
  tags: ['kuchnia', 'blat', 'zlew', 'montaż'],
};

// ─── Kitchen cabinet door painting ───────────────────────────────────────────

export const kitchenCabinetPaintJob: RenovationJob = {
  id: 'kitchen-cabinet-paint',
  categoryId: 'kitchen-tiles',
  name: 'Malowanie frontów szafek kuchennych',
  description: 'Odśwież kuchnię malując fronty szafek — tania alternatywa do nowej kuchni.',
  difficulty: 'medium',
  riskLevel: 'low',
  estimatedDays: 2,
  coverIcon: 'droplet',
  warningRules: [
    {
      condition: 'always',
      message: 'Na MDF i okleinach syntetycznych używaj specjalnego gruntu do trudnych powierzchni — bez niego farba odpadnie.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Zdejmij fronty z zawiasów — malowanie na miejscu daje gorszy efekt i jest znacznie wolniejsze.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'doorCount',
      label: 'Liczba frontów szafek',
      unit: 'szt.',
      placeholder: 'np. 12',
      min: 1,
      max: 100,
    },
  ],
  materials: [
    {
      id: 'cabinet-primer',
      name: 'Grunt do trudnych powierzchni (np. Zinsser BIN)',
      unit: 'litr',
      formulaKey: 'constant',
      pricePerUnit: 60,
      notes: '1 litr wystarczy na ok. 8–10 frontów. Kluczowy dla przyczepności farby na MDF.',
    },
    {
      id: 'cabinet-paint',
      name: 'Farba do szafek kuchennych (emalia satynowa)',
      unit: 'litr',
      formulaKey: 'faucets',
      wasteFactor: 0.15,
      pricePerUnit: 55,
      notes: 'Ok. 0,12–0,15 L/front na warstwę (2 warstwy). Emalia satynowa lub półmat jest standardem.',
    },
    {
      id: 'sandpaper-cabinet',
      name: 'Papier ścierny 180 i 320',
      unit: 'arkusz',
      formulaKey: 'sandpaper',
      pricePerUnit: 2,
    },
    {
      id: 'degreaser-cabinet',
      name: 'Odtłuszczacz (np. Acetone lub Prep&Clean)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 15,
      notes: 'Kuchenne fronty są tłuste od gotowania — odtłuszczanie jest kluczowe.',
    },
  ],
  tools: [
    { id: 'foam-roller', name: 'Wałek piankowy 4mm', icon: 'tool', required: true, notes: 'Daje gładką powierzchnię bez śladów włosia' },
    { id: 'brush-cabinet', name: 'Pędzel syntetyczny 2,5 cm (do krawędzi)', icon: 'edit-2', required: true },
    { id: 'sawhorses', name: 'Kozły malarskie lub stół (do malowania poziomo)', icon: 'tool', required: false, notes: 'Malowanie poziomo eliminuje zacieki' },
    { id: 'screwdriver-cabinet', name: 'Wkrętak (do zdjęcia uchwytów i zawiasów)', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zdejmij fronty i uchwyty', description: 'Odkręć uchwyty. Zdejmij fronty odkręcając zawiasy. Opisz naklejką gdzie który front wisi — przy montażu będzie łatwiej.', durationMin: 30 },
    { step: 2, title: 'Odtłuść i szlifuj', description: 'Przetrzyj każdy front odtłuszczaczem. Papierem 180 lekko zmatuj powierzchnię. Zetrzyj pył wilgotną szmatką.', durationMin: 60 },
    { step: 3, title: 'Nanieś grunt', description: 'Wałkiem nanieś cienką warstwę gruntu do trudnych powierzchni. Wysuszyć 1–2h. Lekko przeszlifuj papierem 320. Zetrzyj pył.', durationMin: 120 },
    { step: 4, title: 'Maluj 2–3 warstwy', description: 'Wałkiem piankowym nanieś cienką warstwę farby. Poczekaj 2–4h. Przeszlifuj 320. Nałóż drugą warstwę. Przy trzeciej warstwie nie szlifujesz.', tip: 'Cienkie warstwy + suszenie dają gładszy efekt niż gruba warstwa.', durationMin: 240 },
    { step: 5, title: 'Zamontuj z powrotem', description: 'Po całkowitym wyschnięciu (24h) zamontuj fronty z powrotem wg opisów. Przykręć uchwyty.', durationMin: 45 },
  ],
  commonMistakes: [
    'Brak odtłuszczenia — farba odpadnie w ciągu roku',
    'Zły grunt — na MDF i okleinach bez właściwego gruntu farba się łupi',
    'Za gruba warstwa jednorazowo — zacieki i łamanie farby',
    'Malowanie na miejscu (bez zdejmowania) — trudny dostęp i zacieki na innych szafkach',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Farba jest równomiernie nałożona bez zacieków' },
    { id: 'q2', description: 'Fronty są zamontowane równo, zawiasy wyregulowane' },
    { id: 'q3', description: 'Uchwyty są prostopadłe i na jednakowej wysokości' },
  ],
  hireProfessionalRecommended: false,
  tags: ['kuchnia', 'szafki', 'malowanie', 'fronty', 'odświeżenie'],
};

// ─── Kitchen cabinet hardware replacement ─────────────────────────────────────

export const kitchenHardwareJob: RenovationJob = {
  id: 'kitchen-hardware',
  categoryId: 'kitchen-tiles',
  name: 'Wymiana uchwytów i gałek szafek',
  description: 'Odśwież kuchnię wymieniając uchwyty — szybka zmiana stylu bez dużych kosztów.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'tool',
  warningRules: [
    {
      condition: 'always',
      message: 'Przed zakupem zmierz rozstaw otworów w uchwycie (zazwyczaj 96 mm lub 128 mm). Nowy uchwyt musi pasować do istniejących otworów.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'handleCount',
      label: 'Liczba uchwytów / gałek do wymiany',
      unit: 'szt.',
      placeholder: 'np. 15',
      min: 1,
      max: 100,
    },
  ],
  materials: [
    {
      id: 'cabinet-handles',
      name: 'Nowe uchwyty lub gałki',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 15,
      notes: 'Sprawdź rozstaw otworów (96 lub 128 mm). Zrób zdjęcie starego uchwytu z podziałką.',
    },
    {
      id: 'longer-screws',
      name: 'Dłuższe śruby (jeśli nowe uchwyty grubsze)',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 0.5,
      notes: 'Często uchwyty różnią się grubością — śruby w zestawie mogą nie pasować.',
    },
  ],
  tools: [
    { id: 'screwdriver-hard', name: 'Wkrętarka lub wkrętak krzyżakowy', icon: 'tool', required: true },
    { id: 'tape-measure-hard', name: 'Miarka (do sprawdzenia rozstawu)', icon: 'minus', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zmierz rozstaw i kup uchwyty', description: 'Zmierz odległość między środkami otworów na jednej szafce. Standard: 96 mm lub 128 mm. Kup uchwyty z pasującym rozstawem.', durationMin: 10 },
    { step: 2, title: 'Odkręć stare uchwyty', description: 'Od wewnętrznej strony frontu odkręć śruby trzymające uchwyt. Zrób to dla wszystkich szafek.', durationMin: 20 },
    { step: 3, title: 'Przykręć nowe uchwyty', description: 'Wstaw nową śrubę z zewnątrz przez otwór, od środka przykręć nakrętkę lub gwint uchwytu. Dokręć wkrętakiem. Nie za mocno na MDF.', durationMin: 20 },
    { step: 4, title: 'Sprawdź wyrównanie', description: 'Sprawdź czy wszystkie uchwyty są na tej samej wysokości i wyśrodkowane. Przy nierównościach — koryguj pozycję.', durationMin: 10 },
  ],
  commonMistakes: [
    'Zły rozstaw otworów — nowe uchwyty nie pasują',
    'Za mocne dokręcenie na MDF — zniszczenie gwintu',
    'Uchwyty na różnych wysokościach — wymagaj szablonu',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Wszystkie uchwyty są na tej samej wysokości' },
    { id: 'q2', description: 'Uchwyty są mocno przykręcone, nie ruszają się' },
    { id: 'q3', description: 'Styl uchwytów pasuje do całej kuchni' },
  ],
  hireProfessionalRecommended: false,
  tags: ['kuchnia', 'uchwyty', 'gałki', 'szafki', 'wymiana'],
};

// ─── Kitchen hood installation ────────────────────────────────────────────────

export const kitchenHoodJob: RenovationJob = {
  id: 'kitchen-hood',
  categoryId: 'kitchen-tiles',
  name: 'Montaż okapu kuchennego',
  description: 'Zamontuj okap podszafkowy lub ścienny — eliminuje zapachy i para z gotowania.',
  difficulty: 'medium',
  riskLevel: 'medium',
  estimatedDays: 1,
  coverIcon: 'wind',
  warningRules: [
    {
      condition: 'always',
      message: 'Przed podłączeniem elektrycznym wyłącz bezpiecznik. Sprawdź woltomierzem.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Okap wyciągowy podłączony do wentylacji grawitacyjnej może ją zablokować — skonsultuj z administratorem lub sprawdź typ kanału.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Okap recyrkulacyjny (bez przewodu) jest łatwiejszy w montażu i nie wymaga podłączenia do wentylacji.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'hoodWidth',
      label: 'Szerokość okapu',
      unit: 'cm',
      placeholder: 'np. 60',
      min: 30,
      max: 120,
      hint: 'Okap powinien być min. tej samej szerokości co płyta grzejna.',
    },
  ],
  materials: [
    {
      id: 'range-hood',
      name: 'Okap kuchenny (podszafkowy lub ścienny)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 600,
      notes: 'Recyrkulacyjny — bez przewodu, wbudowane filtry węglowe. Wyciągowy — wymaga przewodu do wentylacji.',
    },
    {
      id: 'duct-pipe',
      name: 'Rura wentylacyjna Ø125 lub Ø150 (przy okap. wyciągowym)',
      unit: 'mb',
      formulaKey: 'constant',
      pricePerUnit: 15,
      notes: 'Okrągła lub prostokątna — zależy od modelu okapu.',
    },
    {
      id: 'wall-plugs-hood',
      name: 'Kołki rozporowe (mocowanie do ściany/szafki)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 0.8,
      wasteFactor: 6,
    },
  ],
  tools: [
    { id: 'drill-hood', name: 'Wiertarka z udarem', icon: 'tool', required: true },
    { id: 'hole-saw', name: 'Otwornica do ściany (jeśli okap wyciągowy)', icon: 'tool', required: false, rentable: true },
    { id: 'level-hood', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'multimeter-hood', name: 'Woltomierz (do sprawdzenia instalacji)', icon: 'zap', required: true },
    { id: 'screwdriver-hood', name: 'Wkrętarka', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'Wyłącz prąd i zaplanuj pozycję', description: 'Wyłącz bezpiecznik! Okap montuj 65–75 cm nad powierzchnią gotowania. Zaznacz pozycję uchwytów poziomicą.', durationMin: 20 },
    { step: 2, title: 'Wywierć otwory i zamontuj wsporniki', description: 'Wywierć otwory pod kołki. Zamontuj wsporniki lub haczyki mocujące okapu wg instrukcji producenta.', durationMin: 30 },
    { step: 3, title: 'Podłącz przewód wentylacyjny (jeśli wyciągowy)', description: 'Wykonaj otwór w ścianie lub szafce. Podłącz rurę wentylacyjną do okapu. Uszczelnij połączenia taśmą aluminiową.', durationMin: 60 },
    { step: 4, title: 'Podłącz elektrykę', description: 'Podłącz przewód zasilający okapu do instalacji — do puszki podtynkowej nad szafkami. Zachowaj kolory: L-brązowy, N-niebieski, PE-żółtozielony.', warning: 'Prąd musi być WYŁĄCZONY. Sprawdź woltomierzem.', durationMin: 30 },
    { step: 5, title: 'Zamontuj okap i sprawdź', description: 'Zawieś okap na wspornikach. Włącz prąd. Sprawdź wszystkie prędkości wentylatora i oświetlenie.', durationMin: 20 },
  ],
  commonMistakes: [
    'Za nisko zamontowany okap — za gorąco, grozi pożarem',
    'Okap wyciągowy podłączony do kanału grawitacyjnego — blokuje wentylację innych lokali',
    'Praca elektryczna przy włączonym prądzie',
    'Brak uszczelnienia rury — hałas i wycieki powietrza',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Okap jest poziomo zamontowany' },
    { id: 'q2', description: 'Wszystkie prędkości i oświetlenie działają' },
    { id: 'q3', description: 'Wentylacja wyciąga powietrze (sprawdź kartką papieru)' },
  ],
  hireProfessionalRecommended: false,
  hireProfessionalReason: 'Przy okap. wyciągowym z nowym przewodem przez ścianę — rozważ pomoc elektryka i ewentualnie murarza.',
  tags: ['okap', 'kuchnia', 'wentylacja', 'montaż', 'elektryka'],
};
