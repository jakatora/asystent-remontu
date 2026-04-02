import type { ProfessionalRoleRequirement, SourceMetadata, WarningCategory, WarningLevel, ProfessionalRole } from '@/types/house-build';

export const BUILD_STAGE_KEYS = [
  'land-purchase',
  'design-and-permits',
  'site-preparation',
  'foundation',
  'structural-walls',
  'roof',
  'windows-doors',
  'installations',
  'insulation-energy',
  'exterior-finishing',
  'interior-finishing',
  'landscaping',
  'final-inspections',
] as const;

export type BuildStageKey = typeof BUILD_STAGE_KEYS[number];

const PB_SOURCE: SourceMetadata = {
  sourceLabel: 'Prawo budowlane (Dz.U. 2024 poz. 725 t.j.)',
  sourceType: 'official',
  lastReviewedDate: '2025-01-15',
  classification: 'official',
};

const TECH_SOURCE: SourceMetadata = {
  sourceLabel: 'Wytyczne techniczne i praktyka budowlana',
  sourceType: 'technical',
  lastReviewedDate: '2025-01-15',
  classification: 'technical',
};

const APP_SOURCE: SourceMetadata = {
  sourceLabel: 'Asystent Remontu — podsumowanie dla inwestora',
  sourceType: 'community',
  lastReviewedDate: '2025-01-15',
  classification: 'technical',
  notes: 'Informacje orientacyjne. Szczególy potwierdz z projektem, systemem i urzedem.',
};

export interface StageCompletionCriterion {
  readonly title: string;
  readonly isRequired: boolean;
}

export interface BeforeNextStageCheck {
  readonly title: string;
  readonly severity: 'required' | 'recommended';
}

export interface StageProfessionalLabel {
  readonly role: ProfessionalRole;
  readonly label: string;
  readonly isRequired: boolean;
}

export interface BuildStageDefinition {
  readonly key: BuildStageKey;
  readonly name: string;
  readonly description: string;
  readonly whyItMatters: string;
  readonly order: number;
  readonly estimatedWeeks: number | null;
  readonly requiredProfessionals: readonly ProfessionalRole[];
  readonly professionalLabels: readonly StageProfessionalLabel[];
  readonly icon: string;
  readonly defaultChecklist: readonly { title: string; priority: 'low' | 'normal' | 'high' | 'critical'; requiresProfessional: boolean; warningCategory?: WarningCategory }[];
  readonly warnings: readonly { title: string; description: string; warningCategory: WarningCategory; warningLevel: WarningLevel }[];
  readonly defaultDocuments: readonly { name: string; description: string; isRequired: boolean }[];
  readonly investorNotes: readonly string[];
  readonly completionCriteria: readonly StageCompletionCriterion[];
  readonly beforeNextStage: readonly BeforeNextStageCheck[];
  readonly source: SourceMetadata;
}

export const BUILD_STAGES: readonly BuildStageDefinition[] = [
  {
    key: 'land-purchase',
    name: 'Zakup dzialki',
    description: 'Wybor i zakup dzialki budowlanej, weryfikacja MPZP, badanie gruntu.',
    whyItMatters: 'Dzialka to fundament calej inwestycji. Jej parametry, stan prawny i warunki gruntowe wplywaja na koszty, mozliwosci projektowe i czas budowy.',
    order: 1,
    estimatedWeeks: 4,
    requiredProfessionals: ['geodesist'],
    professionalLabels: [
      { role: 'geodesist', label: 'Geodeta', isRequired: true },
      { role: 'architect', label: 'Architekt (konsultacja)', isRequired: false },
    ],
    icon: 'map-pin',
    defaultChecklist: [
      { title: 'Sprawdz MPZP lub uzyskaj WZ', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Zamow badanie geotechniczne gruntu', priority: 'high', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Sprawdz dostep do mediow', priority: 'high', requiresProfessional: false },
      { title: 'Sprawdz KW i stan prawny dzialki', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Wykonaj pomiar geodezyjny', priority: 'high', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Sprawdz dostep drogowy do dzialki', priority: 'high', requiresProfessional: false },
    ],
    warnings: [
      { title: 'Wymaga weryfikacji prawnej', description: 'Sprawdz ksiege wieczysta, obciazenia hipoteczne i plan zagospodarowania przestrzennego przed zakupem.', warningCategory: 'formal-legal', warningLevel: 'warning' },
    ],
    defaultDocuments: [
      { name: 'Wypis i wyrys z MPZP', description: 'Miejscowy Plan Zagospodarowania Przestrzennego lub decyzja WZ', isRequired: true },
      { name: 'Badanie geotechniczne', description: 'Opinia geotechniczna gruntu', isRequired: true },
      { name: 'Mapa do celow projektowych', description: 'Aktualna mapa zasadnicza od geodety', isRequired: true },
      { name: 'Akt notarialny zakupu', description: 'Umowa kupna dzialki', isRequired: true },
    ],
    investorNotes: [
      'Badanie geotechniczne gruntu moze ujawnic problemy wplywajace na koszty fundamentów.',
      'Dostep do mediow (prad, woda, kanalizacja, gaz) warto sprawdzic przed zakupem — brak mediow oznacza dodatkowe koszty i czas.',
    ],
    completionCriteria: [
      { title: 'Dzialka zakupiona z czystym stanem prawnym', isRequired: true },
      { title: 'MPZP lub WZ potwierdza mozliwosc zabudowy', isRequired: true },
      { title: 'Badanie geotechniczne wykonane', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Upewnij sie, ze znasz warunki zabudowy', severity: 'required' },
      { title: 'Sprawdz, czy wyniki badania gruntu nie wymagaja zmian w projekcie', severity: 'recommended' },
    ],
    source: PB_SOURCE,
  },
  {
    key: 'design-and-permits',
    name: 'Projekt i pozwolenia',
    description: 'Wybor projektu domu, adaptacja, uzyskanie pozwolenia na budowe.',
    whyItMatters: 'Projekt budowlany jest podstawa calej budowy. Okresla wymiary, konstrukcje, instalacje i wyglad domu. Bez pozwolenia nie mozna legalnie rozpoczac budowy.',
    order: 2,
    estimatedWeeks: 12,
    requiredProfessionals: ['architect', 'structural-engineer'],
    professionalLabels: [
      { role: 'architect', label: 'Architekt', isRequired: true },
      { role: 'structural-engineer', label: 'Konstruktor', isRequired: true },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'file-text',
    defaultChecklist: [
      { title: 'Wybierz projekt domu (gotowy lub indywidualny)', priority: 'critical', requiresProfessional: false },
      { title: 'Zlec adaptacje projektu do dzialki', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Zloz wniosek o pozwolenie na budowe', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Uzyskaj warunki przylaczeniowe mediow', priority: 'high', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Wyznacz kierownika budowy', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Sprawdz uprawnienia projektanta i kierownika', priority: 'high', requiresProfessional: false, warningCategory: 'formal-legal' },
    ],
    warnings: [
      { title: 'Wymaga uprawnionego architekta', description: 'Adaptacja projektu musi byc wykonana przez architekta z uprawnieniami budowlanymi.', warningCategory: 'professional-required', warningLevel: 'danger' },
      { title: 'Dokumentacja projektowa ma priorytet', description: 'Wszystkie decyzje konstrukcyjne i instalacyjne musza wynikac z zatwierdzonego projektu budowlanego.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
    ],
    defaultDocuments: [
      { name: 'Projekt budowlany', description: 'Kompletny projekt budowlany zatwierdzony przez architekta', isRequired: true },
      { name: 'Pozwolenie na budowe', description: 'Prawomocna decyzja o pozwoleniu na budowe', isRequired: true },
      { name: 'Dziennik budowy', description: 'Zarejestrowany dziennik budowy (EDB)', isRequired: true },
      { name: 'Warunki przylaczeniowe', description: 'Warunki przylaczenia mediow (prad, woda, gaz, kanalizacja)', isRequired: true },
    ],
    investorNotes: [
      'Dokumentacja projektowa ma priorytet nad wszelkimi ogólnymi poradami — Twoj dom buduje sie wedlug projektu, nie wedlug ogólnych zasad.',
      'Jesli wybierasz projekt gotowy, pamietaj ze wymaga on adaptacji do Twojej dzialki i warunków lokalnych.',
    ],
    completionCriteria: [
      { title: 'Projekt budowlany zatwierdzony i adaptowany', isRequired: true },
      { title: 'Pozwolenie na budowe prawomocne', isRequired: true },
      { title: 'Kierownik budowy wyznaczony', isRequired: true },
      { title: 'Dziennik budowy (EDB) zalozony', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Pozwolenie musi byc prawomocne przed rozpoczeciem robót', severity: 'required' },
      { title: 'Zawiadomienie o rozpoczeciu robót musi byc zlozone min. 7 dni wczesniej', severity: 'required' },
    ],
    source: PB_SOURCE,
  },
  {
    key: 'site-preparation',
    name: 'Przygotowanie terenu',
    description: 'Wytyczenie budynku, ogrodzenie placu budowy, organizacja zaplecza.',
    whyItMatters: 'Dobre przygotowanie terenu zapobiega opoznieniom i problemom na pózniejszych etapach. Wytyczenie geodezyjne zapewnia poprawne usytuowanie budynku na dzialce.',
    order: 3,
    estimatedWeeks: 2,
    requiredProfessionals: ['geodesist', 'general-contractor'],
    professionalLabels: [
      { role: 'geodesist', label: 'Geodeta', isRequired: true },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'flag',
    defaultChecklist: [
      { title: 'Pozycja budynku na dzialce przygotowana do wytyczenia', priority: 'high', requiresProfessional: false },
      { title: 'Wytyczenie budynku przez geodete', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Niwelacja i przygotowanie terenu', priority: 'high', requiresProfessional: false },
      { title: 'Ogrodzenie i oznaczenie placu budowy', priority: 'high', requiresProfessional: false },
      { title: 'Przylacze tymczasowe (prad, woda)', priority: 'high', requiresProfessional: false },
      { title: 'Zorganizuj zaplecze socjalne', priority: 'normal', requiresProfessional: false },
      { title: 'Sprawdz dostep dla materialow i sprzetu', priority: 'high', requiresProfessional: false },
      { title: 'Zloz zawiadomienie o rozpoczeciu budowy', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
    ],
    warnings: [
      { title: 'Zawiadomienie wymagane przed rozpoczeciem', description: 'Nie rozpoczynaj robót budowlanych bez zlozenia zawiadomienia o rozpoczeciu budowy (min. 7 dni wczesniej).', warningCategory: 'formal-legal', warningLevel: 'danger' },
    ],
    defaultDocuments: [
      { name: 'Protokol wytyczenia', description: 'Protokol geodezyjnego wytyczenia budynku na dzialce', isRequired: true },
      { name: 'Zawiadomienie o rozpoczeciu budowy', description: 'Potwierdzenie zlozenia zawiadomienia do PINB', isRequired: true },
    ],
    investorNotes: [
      'Wytyczenie geodezyjne musi byc wykonane przed rozpoczeciem fundamentów.',
      'Dostep do placu budowy dla ciezkich pojazdów (betonomieszarka, dzwig) warto zaplanowac z wyprzedzeniem.',
      'Tymczasowe przylacza pradu i wody sa niezbedne do pracy ekipy budowlanej.',
    ],
    completionCriteria: [
      { title: 'Budynek wytyczony geodezyjnie', isRequired: true },
      { title: 'Plac budowy ogrodzony i oznaczony', isRequired: true },
      { title: 'Zawiadomienie o rozpoczeciu budowy zlozone', isRequired: true },
      { title: 'Dostep do pradu i wody na budowie', isRequired: false },
    ],
    beforeNextStage: [
      { title: 'Geodeta potwierdzil wytyczenie budynku', severity: 'required' },
      { title: 'Minal wymagany termin od zlozenia zawiadomienia', severity: 'required' },
      { title: 'Teren przygotowany do wykopów', severity: 'recommended' },
    ],
    source: PB_SOURCE,
  },
  {
    key: 'foundation',
    name: 'Fundamenty i hydroizolacja',
    description: 'Wykopy, zbrojenie, betonowanie fundamentów, hydroizolacja podwalinowa.',
    whyItMatters: 'Fundamenty przenosa obciazenia calego budynku na grunt. Bledy na tym etapie sa bardzo trudne i kosztowne do naprawienia pózniej. Hydroizolacja chroni budynek przed wilgocia gruntowa.',
    order: 4,
    estimatedWeeks: 4,
    requiredProfessionals: ['structural-engineer', 'general-contractor'],
    professionalLabels: [
      { role: 'structural-engineer', label: 'Konstruktor (nadzór)', isRequired: true },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
      { role: 'geodesist', label: 'Geodeta (kontrola)', isRequired: false },
    ],
    icon: 'layers',
    defaultChecklist: [
      { title: 'Weryfikacja gotowosci wykopu wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Kontrola warunków gruntowych vs projekt', priority: 'critical', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Zbrojenie wg projektu konstrukcyjnego', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Betonowanie wg klasy betonu z projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Pielegnacja betonu (czas schnięcia)', priority: 'high', requiresProfessional: false },
      { title: 'Dobór systemu hydroizolacji wg warunków gruntowych', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Wykonanie hydroizolacji fundamentów', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Wpis kierownika budowy do dziennika', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Zasypka dopiero po weryfikacji i kontroli', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
    ],
    warnings: [
      { title: 'Prace konstrukcyjne — nie DIY', description: 'Fundamenty to element konstrukcyjny. Wykonanie musi byc zgodne z projektem i nadzorowane przez kierownika budowy.', warningCategory: 'not-diy', warningLevel: 'danger' },
      { title: 'Projekt i dokumentacja systemu maja priorytet', description: 'Wymiary, zbrojenie, klasa betonu i system hydroizolacji musza scisle odpowiadac projektowi i dokumentacji technicznej wybranego systemu.', warningCategory: 'technical-documentation', warningLevel: 'danger' },
      { title: 'Bledy fundamentowe sa kosztowne', description: 'Naprawa bledow fundamentowych po zakonczeniu budowy moze byc wielokrotnie drozsza niz poprawne wykonanie.', warningCategory: 'not-diy', warningLevel: 'danger' },
      { title: 'Hydroizolacja zalezy od warunków', description: 'Wybór systemu hydroizolacji powinien uwzgledniac warunki gruntowo-wodne, projektowe i wymagania systemu. Nie ma jednego uniwersalnego rozwiazania.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
    ],
    defaultDocuments: [
      { name: 'Protokol odbioru fundamentów', description: 'Wpis kierownika budowy potwierdzajacy zgodnosc z projektem', isRequired: true },
    ],
    investorNotes: [
      'Fundamenty musza byc wykonane scisle wg projektu konstrukcyjnego — nie wedlug ogólnych poradników.',
      'Wybór hydroizolacji zalezy od warunków gruntowo-wodnych i projektu. Nie stosuj rozwiazania "uniwersalnego" bez weryfikacji.',
      'Nie zasypuj fundamentów przed odbiorem przez kierownika budowy.',
      'Dokumentacja techniczna wybranego systemu i produktów ma priorytet nad ogólnymi zasadami.',
    ],
    completionCriteria: [
      { title: 'Fundamenty wykonane i odebrane przez kierownika', isRequired: true },
      { title: 'Hydroizolacja wykonana wg projektu', isRequired: true },
      { title: 'Wpis w dzienniku budowy', isRequired: true },
      { title: 'Zasypka po weryfikacji', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Kierownik budowy potwierdzil odbiór fundamentów', severity: 'required' },
      { title: 'Hydroizolacja zakonczona i zweryfikowana', severity: 'required' },
      { title: 'Zasypka nie przed odbiorem', severity: 'required' },
      { title: 'Beton osiagnal wymagana wytrzymalosc', severity: 'required' },
    ],
    source: TECH_SOURCE,
  },
  {
    key: 'structural-walls',
    name: 'Sciany konstrukcyjne i strop',
    description: 'Budowa scian nosnych, nadprozy, wienców, stropu — zgodnie z projektem i wybranym systemem.',
    whyItMatters: 'Sciany konstrukcyjne i strop tworza szkielet budynku. Precyzja geometryczna na tym etapie wplywa na calosc budowy — od dachu po wykonczenie.',
    order: 5,
    estimatedWeeks: 8,
    requiredProfessionals: ['structural-engineer', 'general-contractor'],
    professionalLabels: [
      { role: 'structural-engineer', label: 'Konstruktor (nadzór)', isRequired: true },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'grid',
    defaultChecklist: [
      { title: 'Potwierdz wybrany system/technologie scian', priority: 'critical', requiresProfessional: false },
      { title: 'Sprawdz znajomosc systemu przez ekipe', priority: 'high', requiresProfessional: false },
      { title: 'Pierwsze warstwy — kontrola geometrii i poziomu', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Murowanie scian nosnych wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Otwory okienne i drzwiowe wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Nadproza i wienze wg projektu konstrukcyjnego', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Strop wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Kontrola pionu i poziomu w trakcie prac', priority: 'high', requiresProfessional: true },
      { title: 'Zabezpieczenie nieukonczonej konstrukcji (pogoda)', priority: 'high', requiresProfessional: false },
    ],
    warnings: [
      { title: 'Prace konstrukcyjne — wymaga projektu', description: 'Sciany nosne, stropy i wienze musza byc wykonane scisle wg projektu konstrukcyjnego pod nadzorem kierownika.', warningCategory: 'not-diy', warningLevel: 'danger' },
      { title: 'Dokumentacja systemu sciennego ma priorytet', description: 'Zasady murowania, spoinowania i laczenia zaleza od wybranej technologii (ceramika, beton komórkowy, silka itp.). Stosuj sie do DTR wybranego systemu.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
      { title: 'Geometria pierwszych warstw jest krytyczna', description: 'Bledy w pionie i poziomie na poczatku narastaja z kazdym rzadem. Pierwsza warstwa musi byc idealna.', warningCategory: 'not-diy', warningLevel: 'warning' },
    ],
    defaultDocuments: [
      { name: 'Protokol odbioru scian/stropu', description: 'Wpis kierownika budowy o zakonczeniu etapu stan surowy', isRequired: true },
    ],
    investorNotes: [
      'Nie traktuj murowania scian jako uniwersalnego przepisu — zasady zaleza od wybranego systemu/technologii.',
      'Ekipa budowlana powinna znac wybrany system scienny i miec doswiadczenie w jego stosowaniu.',
      'Etapowy odbiór przez kierownika budowy jest kluczowy — nie czekaj do konca.',
      'Zabezpiecz nieukonczona konstrukcje przed deszczem i mrozem.',
    ],
    completionCriteria: [
      { title: 'Sciany nosne i dzialowe wg projektu', isRequired: true },
      { title: 'Strop wykonany i odebrany', isRequired: true },
      { title: 'Odbiór etapu przez kierownika budowy', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Kierownik potwierdzil zgodnosc konstrukcji z projektem', severity: 'required' },
      { title: 'Strop osiagnal wymagana wytrzymalosc (jesli zelbetowy)', severity: 'required' },
      { title: 'Konstrukcja zabezpieczona przed pogoda', severity: 'recommended' },
    ],
    source: TECH_SOURCE,
  },
  {
    key: 'roof',
    name: 'Dach — konstrukcja i pokrycie',
    description: 'Konstrukcja wiezby dachowej, warstwy izolacyjne, pokrycie, obrobki blacharskie, orynnowanie.',
    whyItMatters: 'Dach chroni budynek przed warunkami atmosferycznymi i jest kluczowy dla trwalosci calej konstrukcji. Wentylacja poddasza i szczelnosc pokrycia wplywaja na komfort i koszty eksploatacji.',
    order: 6,
    estimatedWeeks: 4,
    requiredProfessionals: ['roofer', 'structural-engineer'],
    professionalLabels: [
      { role: 'roofer', label: 'Dekarz / ekipa dachowa', isRequired: true },
      { role: 'structural-engineer', label: 'Konstruktor (nadzór wiezby)', isRequired: true },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'home',
    defaultChecklist: [
      { title: 'Weryfikacja projektowego rozwiazania dachu', priority: 'critical', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Montaz wiezby dachowej wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Weryfikacja koncepcji wentylacji dachu', priority: 'high', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Montaz membrany/folii wstepnego krycia', priority: 'high', requiresProfessional: true },
      { title: 'Polozenie pokrycia dachowego', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Obrobki blacharskie i kominy', priority: 'high', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Montaz orynnowania', priority: 'high', requiresProfessional: true },
      { title: 'Planowanie ochrony przed pogoda w trakcie prac', priority: 'high', requiresProfessional: false },
    ],
    warnings: [
      { title: 'Praca na wysokosci — bezpieczenstwo', description: 'Montaz dachu to praca na wysokosci wymagajaca ekipy z doswiadczeniem i zabezpieczeniami BHP.', warningCategory: 'safety', warningLevel: 'danger' },
      { title: 'Dokumentacja systemu dachowego ma priorytet', description: 'Szczególy ukladania pokrycia, wentylacji i obrobek zaleza od wybranego systemu. Nie stosuj uniwersalnych zasad bez DTR.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
      { title: 'Wentylacja dachu nie moze byc zgadywana', description: 'Koncepcja wentylacji poddasza i pokrycia musi wynikac z projektu i systemu — bledy prowadza do zawilgocenia i degradacji.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
    ],
    defaultDocuments: [
      { name: 'Protokol odbioru dachu', description: 'Wpis kierownika budowy o zakonczeniu prac dachowych', isRequired: true },
    ],
    investorNotes: [
      'Dach to nie uniwersalny przepis — szczególy montazu pokrycia i obrobek zaleza od wybranego produktu/systemu.',
      'Weryfikuj koncepcje wentylacji poddasza z projektantem i dekarzem.',
      'Zamknij dach przed sezonem jesienno-zimowym jesli to mozliwe.',
      'Dokumentacja techniczna wybranego systemu pokrycia ma priorytet.',
    ],
    completionCriteria: [
      { title: 'Konstrukcja dachu wykonana i odebrana', isRequired: true },
      { title: 'Pokrycie polzone i szczelne', isRequired: true },
      { title: 'Obrobki blacharskie i orynnowanie zamontowane', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Dach zamkniety i szczelny', severity: 'required' },
      { title: 'Kierownik budowy potwierdzil odbiór', severity: 'required' },
      { title: 'Przygotowano otwory na okna dachowe (jesli dotyczy)', severity: 'recommended' },
    ],
    source: TECH_SOURCE,
  },
  {
    key: 'windows-doors',
    name: 'Okna i drzwi zewnetrzne',
    description: 'Montaz okien, drzwi zewnetrznych i bramy garazowej — zamkniecie bryly budynku.',
    whyItMatters: 'Okna i drzwi zamykaja bryle budynku, chroniac przed pogoda i umozliwiajac kontynuacje prac wewnetrznych. Poprawny montaz wplywa na szczelnosc, izolacyjnosc i trwalosc.',
    order: 7,
    estimatedWeeks: 2,
    requiredProfessionals: [],
    professionalLabels: [
      { role: 'general-contractor', label: 'Monter okien (specjalista)', isRequired: true },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'square',
    defaultChecklist: [
      { title: 'Sprawdz gotowosc otworow (mur/dach)', priority: 'critical', requiresProfessional: true },
      { title: 'Zamówienie okien wg projektu i parametrów energetycznych', priority: 'high', requiresProfessional: false },
      { title: 'Weryfikacja metody montazu z dokumentacja systemu', priority: 'high', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Montaz okien z uszczelnieniem i izolacja', priority: 'critical', requiresProfessional: true },
      { title: 'Montaz drzwi zewnetrznych', priority: 'high', requiresProfessional: true },
      { title: 'Montaz bramy garazowej (jesli dotyczy)', priority: 'normal', requiresProfessional: true },
      { title: 'Sprawdz ciaglosc izolacji termicznej przy oknach', priority: 'high', requiresProfessional: true, warningCategory: 'technical-documentation' },
    ],
    warnings: [
      { title: 'Metoda montazu zalezy od systemu', description: 'Sposób montazu okien (w scianie, w warstwie izolacji, itp.) musi byc zgodny z projektem i dokumentacja systemu okiennego.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
    ],
    defaultDocuments: [],
    investorNotes: [
      'Parametry energetyczne okien (U, g) powinny odpowiadac celom energetycznym budynku.',
      'Montaz okien to nie tylko "wstawienie" — szczelnosc i izolacja w strefie montazu sa krytyczne.',
      'Dokladna metode montazu potwierdz z dokumentacja systemu okiennego i projektem.',
    ],
    completionCriteria: [
      { title: 'Wszystkie okna i drzwi zamontowane', isRequired: true },
      { title: 'Budynek zamkniety — bryla szczelna', isRequired: true },
      { title: 'Ciaglosc izolacji termicznej w strefie montazu', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Budynek zamkniety i zabezpieczony przed pogoda', severity: 'required' },
      { title: 'Montaz okien i drzwi zweryfikowany', severity: 'recommended' },
    ],
    source: TECH_SOURCE,
  },
  {
    key: 'installations',
    name: 'Instalacje wewnetrzne',
    description: 'Instalacje elektryczne, wodno-kanalizacyjne, grzewcze, wentylacyjne, gazowe.',
    whyItMatters: 'Instalacje to "uklad nerwowy" domu. Koordynacja miedzy systemami zapobiega konfliktom i pozniejszym przeróbkom. Po zakryciu instalacji naprawy sa trudne i kosztowne.',
    order: 8,
    estimatedWeeks: 6,
    requiredProfessionals: ['electrician', 'plumber', 'gas-installer'],
    professionalLabels: [
      { role: 'electrician', label: 'Elektryk z uprawnieniami', isRequired: true },
      { role: 'plumber', label: 'Hydraulik', isRequired: true },
      { role: 'gas-installer', label: 'Instalator gazowy (jesli gaz)', isRequired: false },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'zap',
    defaultChecklist: [
      { title: 'Plan tras instalacji — koordynacja systemów', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Sprawdz brak konfliktów miedzy trasami', priority: 'high', requiresProfessional: true },
      { title: 'Instalacja elektryczna wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Instalacja wodno-kanalizacyjna wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Instalacja gazowa (jesli dotyczy)', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Instalacja grzewcza (CO) wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Wentylacja mechaniczna / rekuperacja', priority: 'high', requiresProfessional: true },
      { title: 'Protokoly prób instalacji przed zakryciem', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Dokumentacja fotograficzna tras (przed zakryciem)', priority: 'high', requiresProfessional: false },
    ],
    warnings: [
      { title: 'Instalacje wymagaja uprawnien', description: 'Instalacje elektryczne, gazowe i wod-kan musza byc wykonane przez osoby z odpowiednimi uprawnieniami. Wymagane sa protokoly.', warningCategory: 'professional-required', warningLevel: 'danger' },
      { title: 'Instalacja gazowa — wymog prawny', description: 'Instalacja gazowa moze byc wykonywana wylacznie przez osoby z uprawnieniami gazowymi (UDT). Wymaga odbioru i protokolu.', warningCategory: 'not-diy', warningLevel: 'danger' },
      { title: 'Nie zakrywaj instalacji bez prób', description: 'Przed zasypaniem/zamurowaniem instalacji wykonaj próby szczelnosci i pomiary — pózniejszy dostep bedzie trudny.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
    ],
    defaultDocuments: [
      { name: 'Protokol instalacji elektrycznej', description: 'Pomiary i protokol od elektryka z uprawnieniami', isRequired: true },
      { name: 'Protokol szczelnosci instalacji gazowej', description: 'Wymagany dla odbioru gazowego', isRequired: false },
      { name: 'Protokol instalacji wod-kan', description: 'Protokol proby szczelnosci', isRequired: true },
    ],
    investorNotes: [
      'NIE podawaj instrukcji instalacyjnych — instalacje musza byc wykonane przez fachowców z uprawnieniami.',
      'Koordynuj trasy instalacji miedzy systemami — kolizje sa czesta przyczyna opoznien.',
      'Wykonaj dokumentacje fotograficzna tras instalacji PRZED ich zakryciem (tynki, wylewki).',
      'Odbiory instalacji wykonaj PRZED zakryciem — pózniejsze naprawy sa kosztowne.',
    ],
    completionCriteria: [
      { title: 'Wszystkie instalacje wykonane wg projektu', isRequired: true },
      { title: 'Próby szczelnosci i pomiary wykonane', isRequired: true },
      { title: 'Protokoly odbiorcze uzyskane', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Wszystkie próby instalacyjne wykonane i potwierdzone', severity: 'required' },
      { title: 'Dokumentacja fotograficzna tras wykonana', severity: 'recommended' },
      { title: 'Nie zakrywaj instalacji bez odbioru', severity: 'required' },
    ],
    source: PB_SOURCE,
  },
  {
    key: 'insulation-energy',
    name: 'Izolacja, szczelnosc i standard energetyczny',
    description: 'Planowanie i wykonanie izolacji termicznej, kontrola ciaglосci powloki cieplnej, standard energetyczny budynku.',
    whyItMatters: 'Izolacja i szczelnosc to kluczowe elementy komfortu i kosztów eksploatacji domu. Dom powinien byc planowany jako jednolita powloka cieplna — bez przerw, mostków i nieszczelnosci.',
    order: 9,
    estimatedWeeks: 4,
    requiredProfessionals: [],
    professionalLabels: [
      { role: 'architect', label: 'Projektant (weryfikacja detali)', isRequired: true },
      { role: 'energy-auditor', label: 'Audytor energetyczny', isRequired: false },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'thermometer',
    defaultChecklist: [
      { title: 'Weryfikacja planu izolacji scian wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Weryfikacja planu izolacji dachu/poddasza', priority: 'critical', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Weryfikacja planu izolacji podlogi/plyty', priority: 'critical', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Kontrola ciaglосci izolacji przy oknach/drzwiach', priority: 'high', requiresProfessional: true },
      { title: 'Kontrola detali — mostki cieplne przy przejsciach', priority: 'high', requiresProfessional: true },
      { title: 'Weryfikacja koncepcji wentylacji i ogrzewania', priority: 'high', requiresProfessional: true },
      { title: 'Grubosc i system izolacji wg obliczen/projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Uzupelnienie arkusza planowania energetycznego', priority: 'normal', requiresProfessional: false },
    ],
    warnings: [
      { title: 'Standard energetyczny to element planowania', description: 'Izolacja i cele energetyczne powinny byc czescia projektu od poczatku — nie sa opcjonalnym dodatkiem na koncu.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
      { title: 'Grubosc i system izolacji — nie zgaduj', description: 'Wybór systemu i grubosci izolacji musi wynikac z obliczen i wymagania projektu. Nie kopiuj rozwiazania od sasiada.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
      { title: 'Mostki cieplne — detale maja znaczenie', description: 'Ciaglоsc izolacji przy oknach, stropach, balkonach i fundamentach wymaga swiadomych detali — kazda przerwa to strata ciepla.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
    ],
    defaultDocuments: [
      { name: 'Projekt izolacji / detale cieplne', description: 'Projekt lub specyfikacja systemu izolacji z detalami', isRequired: true },
    ],
    investorNotes: [
      'Dom to jednolita powloka cieplna — sciany, dach, podloga, okna i przejscia musza tworzyc ciagla izolacje.',
      'Cele energetyczne (EP, U scian/dachu/podlogi) powinny byc okreslone na etapie projektu.',
      'Grubosc izolacji i wybór systemu musza wynikac z obliczen i projektu — nie z ogólnych porad.',
      'Decyzje dotyczace izolacji, wentylacji i ogrzewania sa ze soba powiazane — planuj je razem.',
      'Dokumentacja techniczna wybranego systemu izolacji ma priorytet nad ogólnymi zasadami.',
    ],
    completionCriteria: [
      { title: 'Izolacja scian wykonana wg systemu', isRequired: true },
      { title: 'Izolacja dachu/poddasza kompletna', isRequired: true },
      { title: 'Ciaglоsc powloki cieplnej zweryfikowana', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Izolacja kompletna i ciagla', severity: 'required' },
      { title: 'Detale termiczne (okna, stropy, fundamenty) zweryfikowane', severity: 'required' },
      { title: 'Koncepcja wentylacji/ogrzewania potwierdzona', severity: 'recommended' },
    ],
    source: TECH_SOURCE,
  },
  {
    key: 'exterior-finishing',
    name: 'Elewacja i wykonczenie zewnetrzne',
    description: 'System elewacyjny, tynk/oblicowka, parapety zewnetrzne, tarasy, podjazdy.',
    whyItMatters: 'Elewacja chroni izolacje i strukture budynku przed pogoda. Poprawne wykonanie wymaga odpowiedniej temperatury, wilgotnosci i zgodnosci z systemem.',
    order: 10,
    estimatedWeeks: 6,
    requiredProfessionals: [],
    professionalLabels: [
      { role: 'general-contractor', label: 'Ekipa elewacyjna', isRequired: true },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'sun',
    defaultChecklist: [
      { title: 'Sprawdz gotowosc podloza pod elewacje', priority: 'critical', requiresProfessional: true },
      { title: 'Weryfikacja warunków pogodowych do prac', priority: 'high', requiresProfessional: false },
      { title: 'Docieplenie scian (ETICS / system wg projektu)', priority: 'high', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Weryfikacja zgodnosci izolacji z systemem elewacji', priority: 'high', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Tynk elewacyjny lub oblicowka', priority: 'high', requiresProfessional: true },
      { title: 'Obrobki blacharskie i parapety zewnetrzne', priority: 'normal', requiresProfessional: true },
      { title: 'Taras / schody zewnetrzne (jesli dotyczy)', priority: 'normal', requiresProfessional: false },
      { title: 'Podjazd i chodniki', priority: 'low', requiresProfessional: false },
    ],
    warnings: [
      { title: 'System elewacyjny ma wlasne zasady', description: 'Zasady stosowania tynku, kleju, siatki i izolacji zaleza od wybranego systemu elewacyjnego. Nie mieszaj produktów róznych systemów.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
      { title: 'Warunki pogodowe maja znaczenie', description: 'Prace elewacyjne wymagaja odpowiedniej temperatury i wilgotnosci. Nie wykonuj ich w mroz lub deszcz.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
    ],
    defaultDocuments: [],
    investorNotes: [
      'System elewacyjny (ETICS) to nie "styropian + klej + tynk" — to zdefiniowany system z wlasnymi zasadami stosowania.',
      'Nie mieszaj produktów róznych producentów w jednym systemie bez potwierdzenia kompatybilnosci.',
      'Sprawdz warunki pogodowe przed rozpoczeciem prac elewacyjnych.',
      'Dokumentacja techniczna systemu elewacyjnego ma priorytet.',
    ],
    completionCriteria: [
      { title: 'Elewacja wykonana i zakonczona', isRequired: true },
      { title: 'Obrobki blacharskie i parapety zamontowane', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Elewacja ukonczona i zweryfikowana', severity: 'required' },
      { title: 'Nie rozpoczynaj wykonczenia wewnetrznego jesli elewacja nieszczelna', severity: 'recommended' },
    ],
    source: TECH_SOURCE,
  },
  {
    key: 'interior-finishing',
    name: 'Wykonczenie wnetrz',
    description: 'Tynki, wylewki, podlogi, malowanie, lazienki, kuchnia, drzwi wewnetrzne.',
    whyItMatters: 'Wykonczenie wnetrz to ostatni etap przed wprowadzeniem sie. Kolejnosc prac i gotowоsc podlozy (schnięcie, wilgotnosc) wplywaja na jakosc i trwalosc.',
    order: 11,
    estimatedWeeks: 10,
    requiredProfessionals: [],
    professionalLabels: [
      { role: 'interior-designer', label: 'Projektant wnetrz (opcjonalnie)', isRequired: false },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'edit-3',
    defaultChecklist: [
      { title: 'Sprawdz gotowosc podlozy (schnięcie tynków, wylewek)', priority: 'critical', requiresProfessional: false },
      { title: 'Tynki wewnetrzne', priority: 'high', requiresProfessional: false },
      { title: 'Wylewki podlogowe', priority: 'high', requiresProfessional: false },
      { title: 'Czas schnięcia przed kolejnymi warstwami', priority: 'high', requiresProfessional: false },
      { title: 'Gladzie i malowanie', priority: 'normal', requiresProfessional: false },
      { title: 'Ukladanie podlog', priority: 'normal', requiresProfessional: false },
      { title: 'Plytki w lazienkach i kuchni', priority: 'normal', requiresProfessional: false },
      { title: 'Hydroizolacja podlog w lazienkach', priority: 'high', requiresProfessional: false },
      { title: 'Bialy montaz (umywalki, WC, wanna)', priority: 'normal', requiresProfessional: false },
      { title: 'Montaz drzwi wewnetrznych', priority: 'normal', requiresProfessional: false },
    ],
    warnings: [
      { title: 'Nie spiesz sie z koncowka', description: 'Wykonczenie wewnetrzne nie powinno sie zaczynac jesli wczesniejsze prace mokre (tynki, wylewki) nie sa dostatecznie suche.', warningCategory: 'technical-documentation', warningLevel: 'warning' },
      { title: 'Kolejnosc prac ma znaczenie', description: 'Ogólna kolejnosc: tynki, wylewki (schnięcie), glazura/plytki, gladzie/malowanie, podlogi, bialy montaz, drzwi.', warningCategory: 'technical-documentation', warningLevel: 'info' },
    ],
    defaultDocuments: [],
    investorNotes: [
      'Prace mokre (tynki, wylewki) wymagaja czasu schnięcia — nie ukladaj podlog na mokrym podlozu.',
      'Kolejnosc: tynki → wylewki → schnięcie → glazura → gladzie/malowanie → podlogi → bialy montaz → drzwi.',
      'Nie rozpoczynaj wykonczenia jesli instalacje nie sa odebrane i zakryte.',
      'Sprawdz wilgotnosc podlozy przed ukladaniem podlog — producent podlog okresla dopuszczalna wilgotnosc.',
    ],
    completionCriteria: [
      { title: 'Wszystkie pomieszczenia wykonczyone', isRequired: true },
      { title: 'Lazienki i kuchnia kompletne', isRequired: true },
      { title: 'Drzwi wewnetrzne zamontowane', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Wykonczenie wnetrz zakonczone', severity: 'required' },
      { title: 'Bialy montaz kompletny', severity: 'recommended' },
    ],
    source: APP_SOURCE,
  },
  {
    key: 'landscaping',
    name: 'Zagospodarowanie terenu',
    description: 'Ogrodzenie, zielen, oswietlenie zewnetrzne, mala architektura.',
    whyItMatters: 'Zagospodarowanie terenu konczy inwestycje wizualnie i funkcjonalnie. Ogrodzenie i dojazd to czesto wymagania formalne.',
    order: 12,
    estimatedWeeks: 4,
    requiredProfessionals: [],
    professionalLabels: [],
    icon: 'compass',
    defaultChecklist: [
      { title: 'Ogrodzenie dzialki', priority: 'normal', requiresProfessional: false },
      { title: 'Oswietlenie zewnetrzne', priority: 'low', requiresProfessional: false },
      { title: 'Trawnik i nasadzenia', priority: 'low', requiresProfessional: false },
    ],
    warnings: [],
    defaultDocuments: [],
    investorNotes: [],
    completionCriteria: [
      { title: 'Teren zagospodarowany', isRequired: false },
      { title: 'Ogrodzenie zamontowane', isRequired: false },
    ],
    beforeNextStage: [
      { title: 'Teren gotowy do odbioru koncowego', severity: 'recommended' },
    ],
    source: APP_SOURCE,
  },
  {
    key: 'final-inspections',
    name: 'Gotowosc do odbioru i zakonczenie',
    description: 'Odbiory techniczne, dokumentacja, snagging, zakonczenie budowy i przejscie do modulu formalnego.',
    whyItMatters: 'To ostatni etap przed formalnym zakonczeniem budowy. Kompletna dokumentacja, odbiory i usuwanie usterek warunkuja mozliwosc legalnego uzytkowania budynku.',
    order: 13,
    estimatedWeeks: 4,
    requiredProfessionals: ['building-inspector', 'chimney-sweep', 'energy-auditor'],
    professionalLabels: [
      { role: 'building-inspector', label: 'Inspektor nadzoru budowlanego', isRequired: false },
      { role: 'chimney-sweep', label: 'Kominiarz', isRequired: true },
      { role: 'energy-auditor', label: 'Audytor energetyczny', isRequired: true },
      { role: 'geodesist', label: 'Geodeta (pomiar powykonawczy)', isRequired: true },
      { role: 'general-contractor', label: 'Kierownik budowy', isRequired: true },
    ],
    icon: 'check-circle',
    defaultChecklist: [
      { title: 'Przeglad listy zaleglosci (snagging)', priority: 'high', requiresProfessional: false },
      { title: 'Geodezyjny pomiar powykonawczy', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Odbiór kominiarski', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Swiadectwo energetyczne', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Protokoly instalacyjne skompletowane', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Oswiadczenie kierownika budowy', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Zamkniecie dziennika budowy (EDB)', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Zawiadomienie o zakonczeniu budowy', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Pozwolenie na uzytkowanie (jesli wymagane)', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
    ],
    warnings: [
      { title: 'Wymaga formalnych odbioru', description: 'Zakonczenie budowy wymaga odbioru kominiarskiego, swiadectwa energetycznego, pomiaru powykonawczego i zawiadomienia PINB.', warningCategory: 'formal-legal', warningLevel: 'warning' },
      { title: 'Dokumentacja musi byc kompletna', description: 'Przed zlozeniem zawiadomienia skompletuj: dziennik budowy, protokoly, oswiadczenia, pomiary.', warningCategory: 'formal-legal', warningLevel: 'warning' },
    ],
    defaultDocuments: [
      { name: 'Pomiar powykonawczy', description: 'Geodezyjny pomiar powykonawczy budynku', isRequired: true },
      { name: 'Protokol kominiarski', description: 'Odbiór przewodow kominowych i wentylacyjnych', isRequired: true },
      { name: 'Swiadectwo energetyczne', description: 'Swiadectwo charakterystyki energetycznej budynku', isRequired: true },
      { name: 'Zawiadomienie o zakonczeniu budowy', description: 'Potwierdzenie zlozenia zawiadomienia w PINB', isRequired: true },
    ],
    investorNotes: [
      'Przed zlozeniem zawiadomienia o zakonczeniu budowy upewnij sie, ze CALA dokumentacja jest kompletna.',
      'Listа zaleglosci (snagging) — przeglad budynku pod katem usterek przed formalnym odbiorem.',
      'Gotowosc do zakonczenia budowy — przejdz do sekcji "Zakonczenie budowy" w module formalnym.',
    ],
    completionCriteria: [
      { title: 'Wszystkie odbiory techniczne wykonane', isRequired: true },
      { title: 'Dokumentacja skompletowana', isRequired: true },
      { title: 'Zawiadomienie o zakonczeniu budowy zlozone', isRequired: true },
    ],
    beforeNextStage: [
      { title: 'Budowa formalnie zakonczona', severity: 'required' },
      { title: 'Uplynal termin na sprzeciw PINB (14 dni)', severity: 'required' },
    ],
    source: PB_SOURCE,
  },
];

export const PROFESSIONAL_ROLES: readonly ProfessionalRoleRequirement[] = [
  { role: 'architect', label: 'Architekt', description: 'Projektowanie i adaptacja projektu budowlanego', whenNeeded: 'Etap projektowania', isRequired: true },
  { role: 'structural-engineer', label: 'Konstruktor', description: 'Obliczenia i projekt konstrukcji', whenNeeded: 'Projekt i fundamenty', isRequired: true },
  { role: 'geodesist', label: 'Geodeta', description: 'Pomiary, wytyczenie, pomiar powykonawczy', whenNeeded: 'Przed budowa i po zakonczeniu', isRequired: true },
  { role: 'electrician', label: 'Elektryk', description: 'Instalacja elektryczna i protokoly', whenNeeded: 'Etap instalacji', isRequired: true },
  { role: 'plumber', label: 'Hydraulik', description: 'Instalacja wodno-kanalizacyjna i CO', whenNeeded: 'Etap instalacji', isRequired: true },
  { role: 'gas-installer', label: 'Instalator gazowy', description: 'Instalacja gazowa i protokoly', whenNeeded: 'Etap instalacji (jesli gaz)', isRequired: false },
  { role: 'roofer', label: 'Dekarz', description: 'Konstrukcja i pokrycie dachu', whenNeeded: 'Etap dachu', isRequired: true },
  { role: 'general-contractor', label: 'Generalny wykonawca / Kierownik budowy', description: 'Koordynacja calej budowy, nadzór', whenNeeded: 'Caly okres budowy', isRequired: true },
  { role: 'building-inspector', label: 'Inspektor nadzoru inwestorskiego', description: 'Kontrola jakosci i zgodnosci z projektem w imieniu inwestora', whenNeeded: 'Opcjonalnie — caly okres budowy', isRequired: false },
  { role: 'interior-designer', label: 'Projektant wnetrz', description: 'Projekt wykonczenia wnetrz', whenNeeded: 'Przed wykonczeniem', isRequired: false },
  { role: 'chimney-sweep', label: 'Kominiarz', description: 'Odbiór przewodow kominowych', whenNeeded: 'Przed odbiorem budynku', isRequired: true },
  { role: 'energy-auditor', label: 'Audytor energetyczny', description: 'Swiadectwo charakterystyki energetycznej', whenNeeded: 'Przed odbiorem budynku', isRequired: true },
];

export function getStageByKey(key: string): BuildStageDefinition | undefined {
  return BUILD_STAGES.find((s) => s.key === key);
}

export function getStageProgress(completedItems: number, totalItems: number): number {
  if (totalItems === 0) return 0;
  return Math.round((completedItems / totalItems) * 100);
}

export const GLOBAL_BUILD_NOTES: readonly string[] = [
  'Dokumentacja projektowa ma priorytet nad ogólnymi poradami.',
  'Dokumentacja techniczna wybranego systemu/produktu ma priorytet nad uniwersalnymi zasadami.',
  'Prace konstrukcyjne i instalacyjne wymagaja odpowiednich kwalifikacji zawodowych.',
  'Decyzje energetyczne i izolacyjne planuj wczesnie — nie na koncu.',
  'Nie przechodz do nastepnego etapu bez weryfikacji biezacego.',
];
