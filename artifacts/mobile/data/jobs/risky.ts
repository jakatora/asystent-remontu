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
