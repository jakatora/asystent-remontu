import { RenovationJob } from '@/types/domain';

export const minorPlumbingJob: RenovationJob = {
  id: 'minor-plumbing',
  categoryId: 'plumbing',
  name: 'Wymiana kranu lub uszczelek',
  description: 'Proste naprawy hydrauliczne — wymiana kranu, uszczelek, syfonu.',
  difficulty: 'easy',
  riskLevel: 'medium',
  estimatedDays: 1,
  coverIcon: 'droplet',
  warningRules: [
    {
      condition: 'always',
      message: 'PRZED ROZPOCZĘCIEM: Zakręć wodę przy zaworze pod zlewem lub przy głównym zawodzie w mieszkaniu.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Jeśli nie wiesz gdzie jest zawór odcinający wodę — zapytaj zarządcę budynku lub sąsiada przed pracą.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Miej pod ręką wiadro i ręczniki — po odkręceniu rur wycieka woda.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'faucetCount',
      label: 'Liczba kranów do wymiany',
      unit: 'szt.',
      placeholder: '1',
      min: 1,
      max: 10,
    },
  ],
  materials: [
    {
      id: 'faucet',
      name: 'Nowy kran (podaj model przy zakupie)',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 150,
      notes: 'Przed zakupem sfotografuj stary kran i podejścia wodne — sprzedawca dobierze odpowiedni.',
    },
    {
      id: 'sealing-tape',
      name: 'Taśma teflonowa (do uszczelnienia gwintów)',
      unit: 'rolka',
      formulaKey: 'constant',
      pricePerUnit: 4,
    },
    {
      id: 'washers',
      name: 'Uszczelki i podkładki (zestaw)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 10,
    },
  ],
  tools: [
    { id: 'adjustable-wrench', name: 'Klucz nastawny', icon: 'tool', required: true },
    { id: 'basin-wrench', name: 'Klucz do montażu kranów (opcjonalnie)', icon: 'tool', required: false },
    { id: 'bucket', name: 'Wiadro', icon: 'circle', required: true },
    { id: 'cloth', name: 'Ręczniki / szmaty', icon: 'square', required: true },
    { id: 'flashlight', name: 'Latarka', icon: 'sun', required: false },
  ],
  instructions: [
    { step: 1, title: 'Zakręć wodę', description: 'Znajdź i zakręć zawór odcinający wodę pod zlewem lub w głównej instalacji. Odkręć kran żeby wypuścić resztę wody.', durationMin: 5, warning: 'NIE pomijaj tego kroku — zalanie może zniszczyć podłogę i powodować szkody u sąsiada!' },
    { step: 2, title: 'Umieść wiadro i szmaty', description: 'Pod zlewem postaw wiadro i połóż szmaty. Nawet po zakręceniu wody zostaje trochę płynu w rurach.', durationMin: 5 },
    { step: 3, title: 'Odkręć stary kran', description: 'Kluczem odkręć nakrętki mocujące kran od spodu. Odłącz węże doprowadzające wodę.', durationMin: 20 },
    { step: 4, title: 'Zamontuj nowy kran', description: 'Podłącz węże wg instrukcji producenta. Nawiń taśmę teflonową na gwinty dla szczelności. Dokręć nakrętki mocujące.', tip: 'Nie dokręcaj na siłę — możesz uszkodzić gwint.', durationMin: 30 },
    { step: 5, title: 'Odkręć wodę i sprawdź', description: 'Powoli odkręć zawór. Sprawdź czy nie ma przecieków przy połączeniach. Poczekaj kilka minut.', durationMin: 10 },
  ],
  commonMistakes: [
    'Niezakręcenie wody przed pracą — katastrofa wodna',
    'Brak taśmy teflonowej na gwintach — wycieki',
    'Za mocne dokręcenie plastikowych nakrętek — pęknięcie',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Brak jakichkolwiek przecieków przy połączeniach' },
    { id: 'q2', description: 'Kran działa płynnie — zimna i ciepła woda' },
    { id: 'q3', description: 'Kran jest stabilnie zamocowany, nie kiwają się' },
  ],
  hireProfessionalRecommended: false,
};

export const electricalOverviewJob: RenovationJob = {
  id: 'electrical-overview',
  categoryId: 'electrical',
  name: 'Wymiana gniazdka lub wyłącznika',
  description: 'Wymiana standardowego gniazdka lub włącznika światła.',
  difficulty: 'medium',
  riskLevel: 'high',
  estimatedDays: 1,
  coverIcon: 'zap',
  warningRules: [
    {
      condition: 'always',
      message: 'BEZPIECZEŃSTWO PRĄDU: Zawsze wyłącz bezpiecznik dla danego pomieszczenia PRZED dotknięciem instalacji. Sprawdź napięcie woltomierzem.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Pracuj tylko przy wyłączonym zasilaniu. Wywieś kartkę na tablicy bezpieczników "NIE WŁĄCZAĆ".',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Jeśli nie wiesz co robisz — ZADZWOŃ DO ELEKTRYKA. Prąd może zabić.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'W łazienkach i kuchniach przy wodzie — obowiązkowe gniazdka z IP44 (wodoszczelne). Nie stosuj zwykłych gniazdek.',
      level: 'warning',
    },
  ],
  measurementInputs: [
    {
      id: 'socketCount',
      label: 'Liczba gniazdek/włączników do wymiany',
      unit: 'szt.',
      placeholder: '1',
      min: 1,
      max: 20,
    },
  ],
  materials: [
    {
      id: 'socket',
      name: 'Nowe gniazdko lub wyłącznik',
      unit: 'szt.',
      formulaKey: 'sockets',
      pricePerUnit: 20,
      notes: 'Dopasuj do obecnej ramki. Możesz wymienić tylko wkład gniazdka.',
    },
  ],
  tools: [
    { id: 'screwdriver-flat', name: 'Wkrętak płaski', icon: 'minus', required: true },
    { id: 'screwdriver-cross', name: 'Wkrętak krzyżakowy', icon: 'plus', required: true },
    { id: 'multimeter', name: 'Woltomierz / tester napięcia', icon: 'zap', required: true, notes: 'DO SPRAWDZENIA CZY PRĄD JEST WYŁĄCZONY' },
    { id: 'pliers', name: 'Szczypce', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'WYŁĄCZ BEZPIECZNIK', description: 'Idź do tablicy bezpieczników. Wyłącz bezpiecznik dla pomieszczenia. Sprawdź WOLTOMIERZEM przy gniazdku czy napięcie wynosi 0V.', durationMin: 5, warning: 'To nie opcja — to warunek konieczny. Bez tego grozi śmierć.' },
    { step: 2, title: 'Wywieś ostrzeżenie', description: 'Na tablicy bezpieczników wywieś kartkę "NIE WŁĄCZAĆ — PRACA ELEKTRYCZNA".', durationMin: 2 },
    { step: 3, title: 'Zdejmij starą ramkę i wkład', description: 'Wkrętakiem zdejmij ramkę. Odkręć śruby mocujące gniazdko w puszce. Wyciągnij gniazdko.', durationMin: 10 },
    { step: 4, title: 'Sfotografuj przewody', description: 'Zanim odłączysz cokolwiek — sfotografuj jak przewody są podłączone. Przewód niebieski = neutralny, brązowy = fazowy, żółto-zielony = uziemienie.', tip: 'Zdjęcie to twoja mapa przy montażu nowego gniazdka.', durationMin: 5 },
    { step: 5, title: 'Podłącz nowe gniazdko', description: 'Podłącz przewody do nowego gniazdka tak samo jak były w starym. Mocno zaciśnij śruby.', durationMin: 15 },
    { step: 6, title: 'Zamontuj i sprawdź', description: 'Wstaw gniazdko do puszki, przykręć. Założ ramkę. Wróć do tablicy i włącz bezpiecznik. Sprawdź gniazdko testerem lub wtyczką.', durationMin: 10 },
  ],
  commonMistakes: [
    'Praca bez wyłączenia prądu — ryzyko śmierci',
    'Zamiana przewodów fazowego i neutralnego — urządzenie może nie działać lub się spalić',
    'Poluzowane zaciski — przegrzewanie i pożar gniazdka',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Gniazdko działa poprawnie' },
    { id: 'q2', description: 'Ramka jest równo zamontowana' },
    { id: 'q3', description: 'Brak luźnych przewodów w puszce' },
  ],
  hireProfessionalRecommended: true,
  hireProfessionalReason: 'Elektryka jest niebezpieczna. Jeśli nie masz doświadczenia — zadzwoń do elektryka. Koszt wizyty jest mały w porównaniu z ryzykiem.',
};

export const gasInstallationJob: RenovationJob = {
  id: 'gas-installation',
  categoryId: 'high-risk',
  name: 'Instalacja gazowa',
  description: 'Instalacja i modyfikacja rur gazowych — tylko uprawniony gazownik.',
  difficulty: 'hard',
  riskLevel: 'high',
  estimatedDays: 1,
  coverIcon: 'alert-triangle',
  warningRules: [
    {
      condition: 'always',
      message: 'UWAGA: Wszelkie prace przy instalacji gazowej są NIELEGALNE bez uprawnień SEP kategoria G lub gazowych uprawnień budowlanych.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Nieszczelna instalacja gazowa powoduje wybuchy i pożary. Rocznie w Polsce kilkadziesiąt osób ginie z tego powodu.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Jeśli czujesz gaz w mieszkaniu: NIE włączaj światła, NIE używaj telefonu wewnątrz, otwórz okna i wyjdź. Zadzwoń na 112 lub do gazowni.',
      level: 'danger',
    },
  ],
  measurementInputs: [],
  materials: [
    {
      id: 'gas-info',
      name: 'Protokół odbioru od gazownika (wymagany)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 0,
      notes: 'Po pracach gazowych bezwzględnie wymagaj protokołu odbioru z pieczęcią i podpisem uprawnionego. Bez niego ubezpieczyciel nie wypłaci odszkodowania.',
    },
  ],
  tools: [],
  instructions: [
    {
      step: 1,
      title: 'Zadzwoń do uprawnionego instalatora gazowego',
      description: 'Szukaj firmy z uprawnieniami do instalacji gazowych (certyfikat SEP G2 lub G3). Poproś o numer uprawnień przed podpisaniem umowy.',
      durationMin: 30,
      warning: 'Nie zlecaj prac osobom bez formalnych uprawnień — to nielegalne i śmiertelnie niebezpieczne.',
    },
    {
      step: 2,
      title: 'Przygotuj informacje do przekazania fachowcowi',
      description: 'Zanotuj: rodzaj gazu (ziemny z sieci / butan propan), lokalizację zaworu głównego gazu, planowany rodzaj pracy (nowe przyłącze, przedłużenie, zmiana urządzenia).',
      durationMin: 15,
    },
    {
      step: 3,
      title: 'Sprawdź oznaki nieszczelności przed i po',
      description: 'Zapach gazu, syczenie przy rurach, martwe rośliny w pobliżu. Zgłoś to fachowcowi. Po pracach on sprawdzi szczelność wykrywaczem gazu — masz prawo to wymagać.',
      durationMin: 10,
      tip: 'Możesz sprawdzić połączenia pianą mydlaną (bez płomienia!) — pęcherzyki = nieszczelność. Ale to tylko wstępna kontrola, nie zastępuje odbioru.',
    },
    {
      step: 4,
      title: 'Zażądaj protokołu odbioru',
      description: 'Po zakończeniu prac poproś o pisemny protokół odbioru z podpisem i pieczęcią uprawnionego instalatora. Przechowuj go przez całe życie instalacji.',
      durationMin: 10,
    },
  ],
  commonMistakes: [
    'Zlecanie prac bez uprawnień — nielegalne i śmiertelnie niebezpieczne',
    'Brak protokołu odbioru — instalacja "na czarno" unieważnia ubezpieczenie',
    'Samodzielne zaciskanie końcówek gazowych — niedopuszczalne',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Posiadam protokół odbioru z podpisem uprawnionego instalatora' },
    { id: 'q2', description: 'Znam lokalizację głównego zaworu gazu i umiem go zakręcić' },
    { id: 'q3', description: 'Wiem jak zachować się w razie wycieku gazu' },
  ],
  hireProfessionalRecommended: true,
  hireProfessionalReason: 'Praca przy gazie wymaga uprawnień. Nie istnieje alternatywa DIY — to warunek prawny i kwestia życia.',
  tags: ['gaz', 'instalacja', 'gazownik', 'niebezpieczne', 'uprawnienia'],
};

export const structuralDemolitionJob: RenovationJob = {
  id: 'structural-demolition',
  categoryId: 'high-risk',
  name: 'Wyburzanie ścian nośnych',
  description: 'Usunięcie lub modyfikacja ściany nośnej — wymaga projektu i nadzoru konstruktora.',
  difficulty: 'hard',
  riskLevel: 'high',
  estimatedDays: 3,
  coverIcon: 'alert-triangle',
  warningRules: [
    {
      condition: 'always',
      message: 'Wyburzenie ściany nośnej bez projektu budowlanego jest NIELEGALNE i może doprowadzić do zawalenia się budynku.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Nigdy nie zakładaj że ściana jest lub nie jest nośna — nawet cienkie ściany mogą podpierać strop. Zawsze sprawdź z konstruktorem.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'W blokach i kamienicach prace konstrukcyjne wymagają zgody spółdzielni lub wspólnoty mieszkaniowej.',
      level: 'warning',
    },
  ],
  measurementInputs: [],
  materials: [
    {
      id: 'structural-beam',
      name: 'Belka nadprożowa lub stalowy dwuteownik (wg projektu)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 800,
      notes: 'Dobór profilu i wymiarów wyłącznie przez uprawnionego konstruktora. Zły dobór = katastrofa budowlana.',
    },
  ],
  tools: [],
  instructions: [
    {
      step: 1,
      title: 'Sprawdź czy ściana jest nośna',
      description: 'Sposób DIY na orientację: ściany nośne zazwyczaj biegną prostopadle do belek stropowych i są grubsze (min. 15–20 cm). Ale to tylko orientacja — zawsze potwierdź z konstruktorem.',
      durationMin: 5,
      warning: 'Każda ocena "na oko" może być błędna. Konsekwencje błędu: zawalenie stropu.',
    },
    {
      step: 2,
      title: 'Zamów projekt od uprawnionego konstruktora',
      description: 'Szukaj konstruktora z uprawnieniami budowlanymi (sprawdź w PIIB - Polska Izba Inżynierów Budownictwa). Konstruktor oceni ścianę, obliczy obciążenia i zaprojektuje nadproże.',
      durationMin: 30,
      tip: 'Koszt projektu: 500–2000 zł. To inwestycja, która ratuje życie i oszczędza dziesiątki tysięcy na naprawach.',
    },
    {
      step: 3,
      title: 'Zgłoś lub uzyskaj pozwolenie na budowę',
      description: 'Modyfikacje ścian nośnych wymagają często zgłoszenia lub pozwolenia na budowę w urzędzie gminy. Konstruktor powie Ci co jest potrzebne w Twoim przypadku.',
      durationMin: 60,
    },
    {
      step: 4,
      title: 'Zatrudnij ekipę budowlaną do wykonania',
      description: 'Wyburzanie ścian nośnych wykonaj z profesjonalną ekipą. Najpierw montaż podpór tymczasowych, potem wyburzenie, montaż belki nadprożowej, odbudowa.',
      durationMin: 30,
    },
  ],
  commonMistakes: [
    'Wyburzenie "na oko" bez projektu — ryzyko zawalenia',
    'Pominięcie tymczasowych podpór — strop osuwa się podczas pracy',
    'Brak zgłoszenia w urzędzie — nielegalna przebudowa, problemy przy sprzedaży',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Posiadam projekt od uprawnionego konstruktora' },
    { id: 'q2', description: 'Prace zostały formalnie zgłoszone lub mam pozwolenie' },
    { id: 'q3', description: 'Belka nadprożowa jest zamontowana zgodnie z projektem' },
  ],
  hireProfessionalRecommended: true,
  hireProfessionalReason: 'To prace wymagające projektu budowlanego i uprawnień. Nie ma opcji DIY — ryzyko śmierci i odpowiedzialności prawnej.',
  tags: ['ściana nośna', 'wyburzenie', 'konstruktor', 'nadproże', 'niebezpieczne'],
};

export const mainElectricalJob: RenovationJob = {
  id: 'main-electrical-panel',
  categoryId: 'high-risk',
  name: 'Tablica elektryczna i główna instalacja',
  description: 'Wymiana tablicy rozdzielczej, prowadzenie nowych obwodów — tylko uprawniony elektryk.',
  difficulty: 'hard',
  riskLevel: 'high',
  estimatedDays: 2,
  coverIcon: 'zap',
  warningRules: [
    {
      condition: 'always',
      message: 'Prace przy tablicy rozdzielczej i układanie nowych obwodów wymagają uprawnień elektrycznych E (eksploatacja) lub D (dozór). Samodzielne wykonanie jest nielegalne.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Błędy w tablicy elektrycznej powodują pożary i porażenia prądem. W Polsce co roku dochodzi do setek wypadków elektrycznych.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Tablica musi mieć wyłączniki różnicowoprądowe (RCD) w każdym obwodzie — wymóg normy PN-HD 60364.',
      level: 'warning',
    },
  ],
  measurementInputs: [],
  materials: [
    {
      id: 'electrical-protocol',
      name: 'Protokół odbioru instalacji elektrycznej',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 0,
      notes: 'Po każdej modyfikacji instalacji elektrycznej elektryk wystawia protokół pomiarów. Zachowaj go — jest wymagany przy sprzedaży mieszkania.',
    },
  ],
  tools: [],
  instructions: [
    {
      step: 1,
      title: 'Zidentyfikuj co chcesz zmienić i zadzwoń do elektryka',
      description: 'Zanotuj czego potrzebujesz: nowe obwody (ile, gdzie), zmiana bezpieczników, wymiana tablicy, instalacja gniazdek w nowych miejscach. Elektrykowi łatwiej wycenić mając konkretny opis.',
      durationMin: 20,
    },
    {
      step: 2,
      title: 'Sprawdź uprawnienia elektryka',
      description: 'Elektryk powinien mieć uprawnienia SEP grupy 1 (E lub D do 1 kV). Masz prawo zapytać o numer świadectwa. Możesz zweryfikować w Stowarzyszeniu Elektryków Polskich.',
      durationMin: 10,
      tip: 'Nie bój się pytać. Uczciwy elektryczny bez problemu poda numer świadectwa kwalifikacyjnego.',
    },
    {
      step: 3,
      title: 'Informacje do przygotowania',
      description: 'Zanotuj: typ licznika (1-fazowy / 3-fazowy), główny bezpiecznik (ile amperów), ile gniazdek/obwodów masz dziś, co chcesz dodać lub zmienić.',
      durationMin: 15,
    },
    {
      step: 4,
      title: 'Wymagaj protokołu pomiarów',
      description: 'Po zakończeniu prac elektryk musi wykonać pomiary instalacji i wystawić protokół. Bez niego nie powinieneś dopuścić do odbioru i płatności końcowej.',
      durationMin: 5,
    },
  ],
  commonMistakes: [
    'Zlecanie bez uprawnień SEP — nielegalne, problemy przy sprzedaży i ubezpieczeniu',
    'Brak RCD (wyłączników różnicowoprądowych) — niezgodność z normami',
    'Brak protokołu pomiarów — instalacja nie ma certyfikatu bezpieczeństwa',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Posiadam protokół pomiarów instalacji elektrycznej' },
    { id: 'q2', description: 'Każdy obwód ma zabezpieczenie nadprądowe i różnicowoprądowe (RCD)' },
    { id: 'q3', description: 'Elektryka była wykonana przez osobę z uprawnieniami SEP' },
  ],
  hireProfessionalRecommended: true,
  hireProfessionalReason: 'Tablica elektryczna i instalacja to praca dla uprawnionego elektryka. Protokół pomiarów jest wymagany prawnie.',
  tags: ['elektryka', 'tablica', 'instalacja', 'SEP', 'niebezpieczne'],
};

export const roofRepairJob: RenovationJob = {
  id: 'roof-repair',
  categoryId: 'high-risk',
  name: 'Naprawa dachu',
  description: 'Naprawa pokrycia dachowego, obróbek i rynien — praca na wysokości, ryzyko upadku.',
  difficulty: 'hard',
  riskLevel: 'high',
  estimatedDays: 2,
  coverIcon: 'alert-triangle',
  warningRules: [
    {
      condition: 'always',
      message: 'Praca na dachu bez zabezpieczeń antyspadkowych jest jedną z najczęstszych przyczyn śmiertelnych wypadków podczas remontów.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Nigdy nie pracuj na dachu przy wilgotnej lub oblodzonej pokrywie, podczas wiatru powyżej 5 m/s lub przy złej pogodzie.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Dach z azbestem (szarobeżowe faliste płyty) NIE może być naprawiany samodzielnie — wymaga specjalistycznej utylizacji.',
      level: 'danger',
    },
  ],
  measurementInputs: [],
  materials: [
    {
      id: 'fall-arrest',
      name: 'Uprząż i lina asekuracyjna (jeśli praca samodzielna)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 300,
      notes: 'Minimalne zabezpieczenie przy samodzielnej pracy na dachu. Punkt kotwienia musi wytrzymać min. 10 kN.',
    },
    {
      id: 'roof-bitumen',
      name: 'Bitumiczna masa uszczelniająca (do drobnych napraw)',
      unit: 'kg',
      formulaKey: 'constant',
      pricePerUnit: 40,
      notes: 'Do naprawy drobnych pęknięć w papy lub obróbkach blacharskich.',
    },
  ],
  tools: [],
  instructions: [
    {
      step: 1,
      title: 'Oceń zakres z ziemi lub z okna',
      description: 'Przez lornetkę lub z okna poddasza oceń stan dachu przed wejściem. Identyfikuj: pęknięte dachówki, cofnięte blachy, niezabezpieczone obróbki, uszkodzone rynny.',
      durationMin: 30,
      tip: 'Wiele napraw może wykonać dekarz bez wchodzenia na cały dach — zapytaj o możliwość oceny z drabiny przy ścianie.',
    },
    {
      step: 2,
      title: 'Wezwij dekarza do oceny i naprawy',
      description: 'Przy poważnych uszkodzeniach zawsze wezwij doświadczonego dekarza. On ma sprzęt zabezpieczający i doświadczenie w pracy na wysokości.',
      durationMin: 10,
      warning: 'Upadek z dachu 2-piętrowego domu = upadek z ok. 7–8 m. Szanse na przeżycie bez poważnych obrażeń są małe.',
    },
    {
      step: 3,
      title: 'Jeśli decydujesz się sam — bezwzględnie użyj uprzęży',
      description: 'Załóż uprząż i przymocuj linę do solidnego punktu kotwienia (np. stalowy hak wkręcony w krokiew). Pracuj z pomocnikiem asekurującym linę z dołu.',
      durationMin: 20,
    },
    {
      step: 4,
      title: 'Czerwone flagi — natychmiast zadzwoń do fachowca',
      description: 'Ugięta lub falująca konstrukcja dachu, ślady wilgoci i pleśni na poddaszu, pęknięcia wzdłuż kalenicy, odpadające tynki na sufitach. To sygnały poważnych problemów konstrukcyjnych.',
      durationMin: 5,
    },
  ],
  commonMistakes: [
    'Wchodzenie na dach bez uprzęży — najczęstsza przyczyna śmierci przy remoncie',
    'Praca przy złej pogodzie — gwałtowny podmuch może zepchnąć z dachu',
    'Ignorowanie oznak wilgoci na poddaszu — problem rośnie i niszczy konstrukcję',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Dach nie przecieka po naprawie — sprawdzono przy deszczu' },
    { id: 'q2', description: 'Brak oznak wilgoci na poddaszu i sufitach' },
    { id: 'q3', description: 'Obróbki blacharski i rynny są szczelne' },
  ],
  hireProfessionalRecommended: true,
  hireProfessionalReason: 'Praca na dachu to praca na wysokości. Wymaga doświadczenia, sprzętu i odwagi. Dekarz ma to wszystko.',
  tags: ['dach', 'dekarz', 'wysokość', 'naprawa', 'niebezpieczne'],
};

export const chimneyWorkJob: RenovationJob = {
  id: 'chimney-work',
  categoryId: 'high-risk',
  name: 'Prace kominowe',
  description: 'Czyszczenie, naprawa i inspekcja komina — prace wymagające kominiarza.',
  difficulty: 'hard',
  riskLevel: 'high',
  estimatedDays: 1,
  coverIcon: 'alert-triangle',
  warningRules: [
    {
      condition: 'always',
      message: 'Zapchany lub nieszczelny komin powoduje zatrucie tlenkiem węgla (czad) — bezbarwny, bezwonny gaz zabijający w czasie snu.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Instalacja lub modyfikacja wkładu kominowego wymaga protokołu od kominiarza — bez niego ubezpieczyciel nie wypłaci w razie pożaru.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Czyszczenie komina należy przeprowadzać min. raz w roku (przy piecu na drewno — częściej). To wymóg prawny i warunek ubezpieczenia.',
      level: 'warning',
    },
  ],
  measurementInputs: [],
  materials: [
    {
      id: 'co-detector',
      name: 'Czujnik tlenku węgla (czadu)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 120,
      notes: 'OBOWIĄZKOWY przy piecu lub kotle gazowym / na paliwa stałe. Montuj na wysokości ok. 150–160 cm. Sprawdzaj co roku.',
    },
  ],
  tools: [],
  instructions: [
    {
      step: 1,
      title: 'Zainstaluj czujnik czadu TERAZ',
      description: 'Jeśli masz piec, kocioł, kominek lub kuchenkę gazową — zainstaluj czujnik tlenku węgla. Rocznie w Polsce kilkadziesiąt osób ginie z powodu czadu, setki trafiają do szpitala.',
      durationMin: 15,
      warning: 'Czad jest bezwonny — nie poczujesz go zanim nie będzie za późno.',
    },
    {
      step: 2,
      title: 'Wezwij kominiarza do czyszczenia i inspekcji',
      description: 'Kominiarz oczyści komin, sprawdzi ciąg, szczelność i stan wkładu. Wyda protokół. Szukaj kominiarza z uprawnieniami (Cech Kominiarzy lub Stowarzyszenie Kominiarzy Polskich).',
      durationMin: 10,
    },
    {
      step: 3,
      title: 'Sygnały alarmowe — natychmiast wezwij kominiarza',
      description: 'Dym cofający się do pomieszczenia, płomień w kotle "strzela", zapach spalenizny bez widocznego źródła, sadza przy szczelinach wyczystki, zawilgocona ściana przy kominie.',
      durationMin: 5,
      tip: 'Przy podejrzeniu zatrucia czadem — natychmiast wyjdź z budynku i zadzwoń na 112.',
    },
    {
      step: 4,
      title: 'Informacje dla kominiarza',
      description: 'Zanotuj: rodzaj paliwa (gaz, drewno, pellet, węgiel), kiedy ostatnio czyszczono, czy zauważono problemy z ciągiem lub dymem.',
      durationMin: 5,
    },
  ],
  commonMistakes: [
    'Brak czujnika czadu — ciche, śmiertelne zagrożenie',
    'Zaniedbanie corocznego czyszczenia — sadza i nagar mogą się zapalić (pożar komina)',
    'Samodzielna modyfikacja wkładu kominowego — brak protokołu = brak ubezpieczenia',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Posiadam działający czujnik tlenku węgla' },
    { id: 'q2', description: 'Komin był czyszczony w ciągu ostatnich 12 miesięcy' },
    { id: 'q3', description: 'Posiadam protokół od kominiarza' },
  ],
  hireProfessionalRecommended: true,
  hireProfessionalReason: 'Komin czyści i naprawia kominiarz. Czujnik czadu chroniq Cię na co dzień. Nie negocjuj z tlenkiem węgla.',
  tags: ['komin', 'kominiarz', 'czad', 'piec', 'bezpieczeństwo'],
};

export const highRiskJob: RenovationJob = {
  id: 'high-risk-overview',
  categoryId: 'high-risk',
  name: 'Prace wysokiego ryzyka',
  description: 'Instalacja gazowa, elektryczna skrzynka, konstrukcja — tylko fachowiec.',
  difficulty: 'hard',
  riskLevel: 'high',
  estimatedDays: 1,
  coverIcon: 'alert-triangle',
  warningRules: [
    {
      condition: 'always',
      message: 'Te prace mogą prowadzić do śmierci, pożaru lub zawalenia się budynku. NIE wykonuj ich samodzielnie bez odpowiednich uprawnień.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Instalacja gazowa: wymaga uprawnień gazowych. Wykonanie bez uprawnień jest nielegalne.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Główna tablica elektryczna, podłączenia do sieci: tylko uprawniony elektryk.',
      level: 'danger',
    },
    {
      condition: 'always',
      message: 'Wyburzanie ścian nośnych: wymaga projektu budowlanego i nadzoru konstruktora.',
      level: 'danger',
    },
  ],
  measurementInputs: [],
  materials: [],
  tools: [],
  instructions: [
    {
      step: 1,
      title: 'Zadzwoń do fachowca',
      description: 'Przy pracach gazowych, głównej tablicy elektrycznej lub ścianach nośnych — zadzwoń do uprawnionego specjalisty.',
      durationMin: 5,
      warning: 'To nie jest przesada. To wymóg bezpieczeństwa i prawo budowlane.',
    },
    {
      step: 2,
      title: 'Sprawdź uprawnienia wykonawcy',
      description: 'Uprawnienia gazowe SEP/G, uprawnienia elektryczne E lub D, wpis do CEIDG. Poproś o kopię przed podpisaniem umowy.',
      durationMin: 10,
    },
    {
      step: 3,
      title: 'Zażądaj dokumentacji',
      description: 'Po wykonaniu prac gazowych i elektrycznych — poproś o protokół odbioru i dokumentację powykonawczą.',
      tip: 'Bez dokumentacji ubezpieczyciel może odmówić wypłaty w przypadku szkody.',
      durationMin: 5,
    },
  ],
  commonMistakes: [
    'Samodzielna instalacja gazu — katastrofa',
    'Modyfikacja głównej tablicy bez uprawnień — pożar',
    'Wyburzanie ściany bez sprawdzenia czy jest nośna',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Mam protokół odbioru od uprawnionego fachowca' },
    { id: 'q2', description: 'Sprawdziłem uprawnienia wykonawcy' },
  ],
  hireProfessionalRecommended: true,
  hireProfessionalReason: 'Te prace są objęte wymogami prawnymi i mogą być wykonywane tylko przez uprawnione osoby.',
};
