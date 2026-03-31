import type { RenovationJob } from '@/types/domain';

// ─── Shelf mounting ───────────────────────────────────────────────────────────

export const shelfMountingJob: RenovationJob = {
  id: 'shelf-mounting',
  categoryId: 'fixtures',
  name: 'Montaż półek',
  description: 'Zamontuj półki na ścianie — od lekkich do cięższych regałów.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'align-left',
  warningRules: [
    {
      condition: 'always',
      message: 'Przed wierceniem sprawdź, czy w ścianie nie biegną rury lub kable — użyj detektora instalacji.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Dobierz kołki do materiału ściany (cegła, beton, gazobeton, gips-karton mają różne kołki).',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'shelfCount',
      label: 'Liczba półek',
      unit: 'szt.',
      placeholder: '3',
      min: 1,
      max: 30,
    },
    {
      id: 'shelfLength',
      label: 'Długość pojedynczej półki',
      unit: 'cm',
      placeholder: 'np. 80',
      min: 10,
      max: 400,
      hint: 'Dla wielu półek podaj długość najdłuższej.',
    },
  ],
  materials: [
    {
      id: 'shelf-brackets',
      name: 'Wsporniki do półek',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 8,
      wasteFactor: 2,
      notes: 'Minimum 2 wsporniki na półkę. Co 50–60 cm przy dłuższych półkach.',
    },
    {
      id: 'wall-plugs',
      name: 'Kołki rozporowe (do ściany)',
      unit: 'szt.',
      formulaKey: 'sockets',
      pricePerUnit: 0.6,
      wasteFactor: 4,
      notes: 'Do cegły/betonu: kołek 8mm. Do GK: kołek motylkowy lub gipsowy.',
    },
    {
      id: 'screws-shelf',
      name: 'Wkręty do wsporników',
      unit: 'szt.',
      formulaKey: 'sockets',
      pricePerUnit: 0.3,
      wasteFactor: 4,
    },
  ],
  tools: [
    { id: 'drill', name: 'Wiertarka z udarem', icon: 'tool', required: true },
    { id: 'level', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'pencil', name: 'Ołówek i miarka', icon: 'edit-2', required: true },
    { id: 'detector', name: 'Detektor instalacji (przed wierceniem)', icon: 'radio', required: false, rentable: true, notes: 'Chroni przed przecięciem kabla lub rury' },
    { id: 'screwdriver', name: 'Wkrętarka lub wkrętak', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zaplanuj układ i zaznacz otwory', description: 'Zaznacz na ścianie pozycję wsporników. Użyj poziomicy, by były w jednej linii. Odstęp między wspornikami max 60 cm.', durationMin: 20 },
    { step: 2, title: 'Sprawdź ścianę detektorem', description: 'Przed wierceniem przesuń detektor po ścianie. Zaznacz miejsca z kablami lub rurami i omijaj je.', durationMin: 10, warning: 'Wiercenie w kabel elektryczny grozi porażeniem.' },
    { step: 3, title: 'Wywierć otwory i wstaw kołki', description: 'Wierć wiertłem odpowiednim do materiału (do betonu: SDS lub udarowe). Wstaw kołki rozporowe do otworów.', durationMin: 20 },
    { step: 4, title: 'Przykręć wsporniki i półkę', description: 'Przykręć wsporniki wkrętami. Połóż półkę i przykręć od spodu lub przybij gwoździami tapicerskimi.', durationMin: 20 },
    { step: 5, title: 'Sprawdź poziom i nośność', description: 'Sprawdź poziomicą. Lekko pociągnij — połączenie nie powinno się ruszać. Przy cięższych ładunkach przetestuj obciążenie stopniowo.', durationMin: 5 },
  ],
  commonMistakes: [
    'Brak sprawdzenia instalacji — wiercenie w kabel',
    'Złe kołki do materiału ściany — półka odpada',
    'Wsporniki nie są w poziomie — rzeczy zsuwają się z półki',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Półka jest pozioma' },
    { id: 'q2', description: 'Wsporniki są solidnie przykręcone, nie ruszają się' },
    { id: 'q3', description: 'Brak rys ani uszkodzeń ściany wokół kołków' },
  ],
  hireProfessionalRecommended: false,
  tags: ['półka', 'montaż', 'wiercenie', 'wspornik'],
};

// ─── Curtain rod mounting ─────────────────────────────────────────────────────

export const curtainRodJob: RenovationJob = {
  id: 'curtain-rod',
  categoryId: 'fixtures',
  name: 'Montaż karniszy i rolet',
  description: 'Zamontuj karnisz okienny, rolety lub żaluzje.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'minus',
  warningRules: [
    {
      condition: 'always',
      message: 'Sprawdź detektor przed wierceniem w ościeżnicy lub ścianie nad oknem.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'windowCount',
      label: 'Liczba okien / karniszy',
      unit: 'szt.',
      placeholder: '2',
      min: 1,
      max: 20,
    },
  ],
  materials: [
    {
      id: 'curtain-rod-mat',
      name: 'Karnisz lub prowadnica rolety',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 60,
      notes: 'Karnisz powinien być szerszy od okna o 15–20 cm z każdej strony.',
    },
    {
      id: 'wall-plugs-rod',
      name: 'Kołki rozporowe',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 0.6,
      wasteFactor: 6,
    },
    {
      id: 'screws-rod',
      name: 'Wkręty do uchwytów',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 0.3,
      wasteFactor: 6,
    },
  ],
  tools: [
    { id: 'drill-rod', name: 'Wiertarka', icon: 'tool', required: true },
    { id: 'level-rod', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'tape-measure', name: 'Miarka', icon: 'minus', required: true },
    { id: 'screwdriver-rod', name: 'Wkrętarka lub wkrętak', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zaplanuj pozycję karniszy', description: 'Karnisz montuj 10–15 cm ponad oknem i 15–20 cm szerzej z każdej strony. Zaznacz pozycje uchwytów ołówkiem.', durationMin: 15 },
    { step: 2, title: 'Sprawdź poziom i wywierć otwory', description: 'Poziomicą sprawdź czy uchwyty są na tej samej wysokości. Wywierć otwory i wstaw kołki.', durationMin: 15 },
    { step: 3, title: 'Przykręć uchwyty i zamontuj karnisz', description: 'Przykręć uchwyty. Nałóż zasłony na karnisz, wsadź go w uchwyty i zablokuj.', durationMin: 15 },
  ],
  commonMistakes: [
    'Uchwyty nie są w poziomie — zasłony opadają na jedną stronę',
    'Karnisz za krótki — nie zakrywa całego okna',
    'Słabe kołki w ścianie z gazobetonu — karnisz odpada',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Karnisz jest poziomy' },
    { id: 'q2', description: 'Zasłony swobodnie się przesuwają' },
    { id: 'q3', description: 'Uchwyty są stabilne, nie ruszają się' },
  ],
  hireProfessionalRecommended: false,
  tags: ['karnisz', 'roleta', 'żaluzja', 'okno', 'zasłony'],
};

// ─── Bathroom accessories ─────────────────────────────────────────────────────

export const bathroomAccessoriesJob: RenovationJob = {
  id: 'bathroom-accessories',
  categoryId: 'fixtures',
  name: 'Akcesoria łazienkowe',
  description: 'Zamontuj uchwyty, wieszaki, uchwyt na papier, mydlniczki i inne akcesoria łazienkowe.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'anchor',
  warningRules: [
    {
      condition: 'always',
      message: 'Na ścianach z płytkami: używaj wiertła do glazury — zwykłe wiertło rozkruszy płytkę.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Dla akcesoriów samoprzylepnych (bez wiercenia): ściana musi być sucha i odtłuszczona alkoholem.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'accessoryCount',
      label: 'Liczba akcesoriów do zamontowania',
      unit: 'szt.',
      placeholder: '5',
      min: 1,
      max: 30,
    },
  ],
  materials: [
    {
      id: 'drill-bits-tile',
      name: 'Wiertło do glazury',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 15,
      notes: 'Wiertło diamentowe lub węglikowe do płytek ceramicznych.',
    },
    {
      id: 'tile-plugs',
      name: 'Kołki do płytek ceramicznych',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 1.5,
      wasteFactor: 2,
      notes: 'Specjalne kołki do materiałów pustakowych i płytek.',
    },
    {
      id: 'silicone-accs',
      name: 'Silikon bezbarwny (uszczelnienie)',
      unit: 'kartusze',
      formulaKey: 'constant',
      pricePerUnit: 18,
    },
  ],
  tools: [
    { id: 'drill-tile', name: 'Wiertarka (bez udaru na płytkach!)', icon: 'tool', required: true, notes: 'Udar niszczy płytki — wyłącz go przy ceramice' },
    { id: 'masking-tape-acc', name: 'Taśma maskująca', icon: 'minus', required: true, notes: 'Przyklejona na płytkę zapobiega ześlizgnięciu wiertła' },
    { id: 'level-acc', name: 'Poziomica lub pion', icon: 'minus', required: true },
    { id: 'screwdriver-acc', name: 'Wkrętarka lub wkrętak', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'Zaznacz pozycje na ścianie', description: 'Zaznacz ołówkiem przez element montażowy. Przy płytkach: przyklejaj taśmę maskującą w miejscu wiercenia — zapobiega ześlizgnięciu wiertła.', durationMin: 15 },
    { step: 2, title: 'Wywierć otwory', description: 'Na płytkach: wiertło do glazury, bez funkcji udaru, wolne obroty, lekki nacisk. W fugie jest łatwiej — zacznij od fugi jeśli to możliwe.', durationMin: 20 },
    { step: 3, title: 'Wstaw kołki i przykręć', description: 'Wstaw kołki rozporowe. Przykręć elementy montażowe. Nie dokręcaj za mocno na płytkach.', durationMin: 15 },
    { step: 4, title: 'Uszczelnij silikonem', description: 'Obwód mocowania przy płytce uszczelnij bezbarwnym silikonem — zapobiega wnikaniu wody za płytkę.', durationMin: 10 },
  ],
  commonMistakes: [
    'Użycie funkcji udaru na płytkach — pęknięcie płytki',
    'Brak taśmy maskującej — wiertło ześlizguje się i rysuje płytkę',
    'Brak silikonu — wilgoć niszczy ścianę za płytkami',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Akcesoria są stabilnie zamontowane, nie ruszają się' },
    { id: 'q2', description: 'Płytki nie mają rys ani pęknięć wokół otworów' },
    { id: 'q3', description: 'Silikon uszczelnił wszystkie szczeliny' },
  ],
  hireProfessionalRecommended: false,
  tags: ['łazienka', 'akcesoria', 'wieszak', 'uchwyt', 'montaż'],
};

// ─── Mirror installation ──────────────────────────────────────────────────────

export const mirrorInstallJob: RenovationJob = {
  id: 'mirror-install',
  categoryId: 'fixtures',
  name: 'Montaż lustra',
  description: 'Zamontuj lustro na ścianie — wkrętami lub klejem do luster.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'square',
  warningRules: [
    {
      condition: 'always',
      message: 'Duże lustra są ciężkie — używaj wyłącznie dedykowanych kołków i haczyków z potwierdzonym udźwigiem większym niż waga lustra.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Do mocowania klejem używaj wyłącznie kleju do luster — zwykły silikon niszczy powłokę srebrną lustra.',
      level: 'danger',
    },
  ],
  measurementInputs: [
    {
      id: 'mirrorWeight',
      label: 'Szacunkowa waga lustra',
      unit: 'kg',
      placeholder: 'np. 5',
      min: 0.5,
      max: 80,
      hint: 'Odczytaj z opakowania lub zmierz wagą bagażową.',
    },
  ],
  materials: [
    {
      id: 'mirror-clips',
      name: 'Klamry do luster (chromowane)',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 4,
      wasteFactor: 4,
      notes: 'Minimum 4 klamry na lustro (narożne). Sprawdź udźwig.',
    },
    {
      id: 'mirror-glue',
      name: 'Klej do luster (nie silikon!)',
      unit: 'tuba',
      formulaKey: 'constant',
      pricePerUnit: 25,
      notes: 'Klej z certyfikatem "mirror safe" — nie niszczy powłoki.',
    },
    {
      id: 'wall-plugs-mirror',
      name: 'Kołki rozporowe',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 0.8,
      wasteFactor: 6,
    },
  ],
  tools: [
    { id: 'drill-mirror', name: 'Wiertarka', icon: 'tool', required: true },
    { id: 'level-mirror', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'caulk-gun-mirror', name: 'Pistolet do kleju (jeśli montaż klejem)', icon: 'tool', required: false },
    { id: 'suction-cup', name: 'Przyssawki do przenoszenia lustra', icon: 'circle', required: false, notes: 'Ułatwiają bezpieczne trzymanie dużych luster' },
  ],
  instructions: [
    { step: 1, title: 'Zaplanuj pozycję i zaznacz', description: 'Zaznacz środek lustra na ścianie. Wyznacz poziomą i pionową oś. Zaznacz pozycje klamer lub haczyków.', durationMin: 15 },
    { step: 2, title: 'Zamontuj punkty mocowania', description: 'Wywierć otwory, wstaw kołki, przykręć klamry lub haczyki. Sprawdź poziomicą.', durationMin: 20 },
    { step: 3, title: 'Zawieś lub przyklejaj lustro', description: 'Na klamry: zawieś lustro, zablokuj dolne klamry. Na klej: nałóż klej do luster zygzakiem na tylną stronę, przyciśnij do ściany i podepnij na czas schnięcia (24h).', durationMin: 20, warning: 'Montaż klejem jest nieodwracalny — upewnij się, że pozycja jest dobra.' },
    { step: 4, title: 'Sprawdź stabilność', description: 'Delikatnie sprawdź czy lustro nie rusza się. Przy montażu klejem poczekaj 24–48h przed pełnym obciążeniem.', durationMin: 5 },
  ],
  commonMistakes: [
    'Użycie zwykłego silikonu zamiast kleju do luster — srebrzenie odpada od tyłu',
    'Za słabe punkty mocowania — lustro spada',
    'Brak poziomicy — lustro wisi krzywo',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Lustro wisi poziomo i pionowo' },
    { id: 'q2', description: 'Mocowanie jest stabilne, lustro nie rusza się' },
    { id: 'q3', description: 'Brak rys i uszkodzeń' },
  ],
  hireProfessionalRecommended: false,
  tags: ['lustro', 'montaż', 'łazienka', 'dekoracja'],
};

// ─── Furniture assembly ───────────────────────────────────────────────────────

export const furnitureAssemblyJob: RenovationJob = {
  id: 'furniture-assembly',
  categoryId: 'fixtures',
  name: 'Montaż mebli z paczki',
  description: 'Złóż meble z zestawu — szafki, komody, szafy z systemów modułowych.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'box',
  warningRules: [
    {
      condition: 'always',
      message: 'Szafy i wysokie meble przymocuj do ściany — możliwe przewrócenie i poważne obrażenia.',
      level: 'warning',
    },
    {
      condition: 'always',
      message: 'Sprawdź kompletność paczek przed montażem — zgubione elementy mogą opóźnić pracę o kilka dni.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'furnitureCount',
      label: 'Liczba elementów do złożenia',
      unit: 'szt.',
      placeholder: '2',
      min: 1,
      max: 20,
    },
  ],
  materials: [
    {
      id: 'wall-anchor-furniture',
      name: 'Kołki do mocowania do ściany',
      unit: 'szt.',
      formulaKey: 'constant',
      pricePerUnit: 0.8,
      wasteFactor: 4,
      notes: 'Do każdej szafy i wysokiego mebla stojącego.',
    },
  ],
  tools: [
    { id: 'allen-key', name: 'Klucze imbusowe (często w zestawie)', icon: 'tool', required: true },
    { id: 'hammer-furn', name: 'Młotek gumowy', icon: 'tool', required: false },
    { id: 'screwdriver-furn', name: 'Wkrętarka (przyspiesza pracę)', icon: 'tool', required: false, notes: 'Uważaj na moment — wkrętarki mogą rozkruszyć płytę wiórową' },
    { id: 'level-furn', name: 'Poziomica', icon: 'minus', required: true },
    { id: 'drill-furn', name: 'Wiertarka (do mocowania do ściany)', icon: 'tool', required: true },
  ],
  instructions: [
    { step: 1, title: 'Sprawdź kompletność paczki', description: 'Policz wszystkie elementy i akcesoria wg listy w instrukcji. Stwórz „stację montażową" — wyłóż elementy na podłodze.', durationMin: 20 },
    { step: 2, title: 'Czytaj instrukcję krok po kroku', description: 'Postępuj ściśle wg numerowanych kroków. Nie pomijaj żadnego — cofanie się jest trudne i czasochłonne.', durationMin: 10 },
    { step: 3, title: 'Montuj na dywanie lub kartonie', description: 'Przed postawieniem montuj elementy na podłodze (ochrona przed rysowaniem). Dociągaj śruby dopiero po złożeniu całości.', durationMin: 120 },
    { step: 4, title: 'Ustaw i wypoziomuj', description: 'Postaw mebel. Wypoziomuj nogami regulowanymi lub podkładkami. Sprawdź poziomicą czy jest pionowy.', durationMin: 15 },
    { step: 5, title: 'Przymocuj do ściany', description: 'Przy szafach i wysokich meblach: wywierć otwory w ścianie, wstaw kołki, przykręć metalowe uchwyty montażowe z zestawu.', durationMin: 20, warning: 'Nieprzymocowana szafa może spaść na dziecko.' },
  ],
  commonMistakes: [
    'Pomijanie mocowania do ściany — meble mogą się wywrócić',
    'Zbyt mocne dokręcanie śrub — niszczy kołki meblowe',
    'Montaż tylnej ścianki na końcu zamiast we właściwym kroku — trzeba rozkręcać',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Mebel jest poziomy i pionowy' },
    { id: 'q2', description: 'Drzwiczki/szuflady otwierają się i zamykają bez oporów' },
    { id: 'q3', description: 'Mebel jest przymocowany do ściany (jeśli dotyczy)' },
  ],
  hireProfessionalRecommended: false,
  tags: ['meble', 'montaż', 'szafa', 'komoda', 'ikea'],
};

// ─── Picture / decoration hanging ────────────────────────────────────────────

export const pictureHangingJob: RenovationJob = {
  id: 'picture-hanging',
  categoryId: 'fixtures',
  name: 'Wieszanie obrazów i dekoracji',
  description: 'Powieś obrazy, zegary, dekoracje ścienne — bez pęknięć płytek i krzywych ram.',
  difficulty: 'easy',
  riskLevel: 'low',
  estimatedDays: 1,
  coverIcon: 'image',
  warningRules: [
    {
      condition: 'always',
      message: 'Do ciężkich obrazów (powyżej 5 kg) używaj haczyków z kołkami rozporowymi, nie samych wbijanych ćwieków.',
      level: 'info',
    },
  ],
  measurementInputs: [
    {
      id: 'pictureCount',
      label: 'Liczba elementów do zawieszenia',
      unit: 'szt.',
      placeholder: '3',
      min: 1,
      max: 50,
    },
  ],
  materials: [
    {
      id: 'picture-hooks',
      name: 'Haczyki do obrazów (różne rozmiary)',
      unit: 'szt.',
      formulaKey: 'faucets',
      pricePerUnit: 2,
      wasteFactor: 1.2,
      notes: 'Dobierz udźwig do wagi obrazu z zapasem 2×.',
    },
    {
      id: 'command-strips',
      name: 'Paski samoprzylepne Command (do lekkich)',
      unit: 'opak.',
      formulaKey: 'constant',
      pricePerUnit: 25,
      notes: 'Do lekkich dekoracji (do 3–5 kg) bez wiercenia.',
    },
  ],
  tools: [
    { id: 'level-pic', name: 'Poziomica lub aplikacja w telefonie', icon: 'minus', required: true },
    { id: 'tape-measure-pic', name: 'Miarka', icon: 'minus', required: true },
    { id: 'pencil-pic', name: 'Ołówek', icon: 'edit-2', required: true },
    { id: 'hammer-pic', name: 'Młotek (do haczyków wbijanych)', icon: 'tool', required: false },
    { id: 'drill-pic', name: 'Wiertarka (do ciężkich obrazów)', icon: 'tool', required: false },
  ],
  instructions: [
    { step: 1, title: 'Zaplanuj kompozycję', description: 'Zrób próbę na podłodze — rozłóż wszystkie elementy i dobierz układ. Zrób zdjęcie przed zawieszeniem.', durationMin: 15 },
    { step: 2, title: 'Zaznacz pozycje haczyków', description: 'Zaznacz ołówkiem środek ciężkości każdego obrazu. Zmierz odległość do haczyka od góry ramy. Zaznacz na ścianie.', durationMin: 15 },
    { step: 3, title: 'Montuj haczyki', description: 'Do lekkich: wbij haczyk lub naklejaj pasek Command. Do ciężkich: wywierć otwór, wstaw kołek, przykręć haczyk.', durationMin: 20 },
    { step: 4, title: 'Zawieś i wypoziomuj', description: 'Zawieś obraz. Poziomicą (lub aplikacją) sprawdź czy jest prosto. Koryguj lekkim przesunięciem.', durationMin: 15 },
  ],
  commonMistakes: [
    'Wbijanie ćwieków do ciężkich obrazów — wypadają po kilku miesiącach',
    'Brak sprawdzenia poziomu — obraz wisi krzywo',
    'Za wysoko — obrazy powinny być na poziomie wzroku (~155 cm środek)',
  ],
  qualityChecklist: [
    { id: 'q1', description: 'Obraz jest poziomy' },
    { id: 'q2', description: 'Haczyk jest stabilny, wystarczający dla wagi obrazu' },
    { id: 'q3', description: 'Kompozycja wygląda jak zaplanowana' },
  ],
  hireProfessionalRecommended: false,
  tags: ['obraz', 'dekoracja', 'ściana', 'haczyk', 'wieszanie'],
};
