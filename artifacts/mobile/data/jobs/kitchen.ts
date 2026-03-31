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
