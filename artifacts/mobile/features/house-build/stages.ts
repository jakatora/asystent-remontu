import type { BuildStage, ProfessionalRoleRequirement, ConstructionRiskNotice } from '@/types/house-build';

export const BUILD_STAGE_KEYS = [
  'land-purchase',
  'design-and-permits',
  'site-preparation',
  'foundation',
  'structural-walls',
  'roof',
  'windows-doors',
  'installations',
  'interior-finishing',
  'exterior-finishing',
  'landscaping',
  'final-inspections',
] as const;

export type BuildStageKey = typeof BUILD_STAGE_KEYS[number];

export interface BuildStageDefinition {
  readonly key: BuildStageKey;
  readonly name: string;
  readonly description: string;
  readonly order: number;
  readonly estimatedWeeks: number | null;
  readonly requiredProfessionals: readonly string[];
  readonly icon: string;
  readonly defaultChecklist: readonly { title: string; priority: 'low' | 'normal' | 'high' | 'critical'; requiresProfessional: boolean; warningCategory?: string }[];
  readonly warnings: readonly { title: string; description: string; warningCategory: string; warningLevel: string }[];
  readonly defaultDocuments: readonly { name: string; description: string; isRequired: boolean }[];
}

export const BUILD_STAGES: readonly BuildStageDefinition[] = [
  {
    key: 'land-purchase',
    name: 'Zakup dzialki',
    description: 'Wybor i zakup dzialki budowlanej, weryfikacja MPZP, badanie gruntu.',
    order: 1,
    estimatedWeeks: 4,
    requiredProfessionals: ['geodesist'],
    icon: 'map-pin',
    defaultChecklist: [
      { title: 'Sprawdz MPZP lub uzyskaj WZ', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Zamow badanie geotechniczne gruntu', priority: 'high', requiresProfessional: true, warningCategory: 'technical-documentation' },
      { title: 'Sprawdz dostep do mediow', priority: 'high', requiresProfessional: false },
      { title: 'Sprawdz KW i stan prawny dzialki', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Wykonaj pomiar geodezyjny', priority: 'high', requiresProfessional: true, warningCategory: 'professional-required' },
    ],
    warnings: [
      {
        title: 'Wymaga weryfikacji prawnej',
        description: 'Sprawdz ksiege wieczysta, obciazenia hipoteczne i plan zagospodarowania przestrzennego przed zakupem.',
        warningCategory: 'formal-legal',
        warningLevel: 'warning',
      },
    ],
    defaultDocuments: [
      { name: 'Wypis i wyrys z MPZP', description: 'Miejscowy Plan Zagospodarowania Przestrzennego lub decyzja WZ', isRequired: true },
      { name: 'Badanie geotechniczne', description: 'Opinia geotechniczna gruntu', isRequired: true },
      { name: 'Mapa do celow projektowych', description: 'Aktualna mapa zasadnicza od geodety', isRequired: true },
      { name: 'Akt notarialny zakupu', description: 'Umowa kupna dzialki', isRequired: true },
    ],
  },
  {
    key: 'design-and-permits',
    name: 'Projekt i pozwolenia',
    description: 'Wybor projektu domu, adaptacja, uzyskanie pozwolenia na budowe.',
    order: 2,
    estimatedWeeks: 12,
    requiredProfessionals: ['architect', 'structural-engineer'],
    icon: 'file-text',
    defaultChecklist: [
      { title: 'Wybierz projekt domu (gotowy lub indywidualny)', priority: 'critical', requiresProfessional: false },
      { title: 'Zlec adaptacje projektu do dzialki', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Zloz wniosek o pozwolenie na budowe', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Uzyskaj warunki przylaczeniowe mediow', priority: 'high', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Wyznacz kierownika budowy', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
    ],
    warnings: [
      {
        title: 'Wymaga uprawnionego architekta',
        description: 'Adaptacja projektu musi byc wykonana przez architekta z uprawnieniami budowlanymi.',
        warningCategory: 'professional-required',
        warningLevel: 'danger',
      },
      {
        title: 'Dokumentacja projektowa ma priorytet',
        description: 'Wszystkie decyzje konstrukcyjne i instalacyjne musza wynikac z zatwierdzonego projektu budowlanego.',
        warningCategory: 'technical-documentation',
        warningLevel: 'warning',
      },
    ],
    defaultDocuments: [
      { name: 'Projekt budowlany', description: 'Kompletny projekt budowlany zatwierdzony przez architekta', isRequired: true },
      { name: 'Pozwolenie na budowe', description: 'Prawomocna decyzja o pozwoleniu na budowe', isRequired: true },
      { name: 'Dziennik budowy', description: 'Zarejestrowany dziennik budowy', isRequired: true },
      { name: 'Warunki przylaczeniowe', description: 'Warunki przylaczenia mediow (prad, woda, gaz, kanalizacja)', isRequired: true },
    ],
  },
  {
    key: 'site-preparation',
    name: 'Przygotowanie terenu',
    description: 'Wytyczenie budynku, ogrodzenie placu budowy, organizacja zaplecza.',
    order: 3,
    estimatedWeeks: 2,
    requiredProfessionals: ['geodesist', 'general-contractor'],
    icon: 'flag',
    defaultChecklist: [
      { title: 'Wytyczenie budynku przez geodete', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Ogrodzenie i oznaczenie placu budowy', priority: 'high', requiresProfessional: false },
      { title: 'Przylacze tymczasowe (prad, woda)', priority: 'high', requiresProfessional: false },
      { title: 'Zorganizuj zaplecze socjalne', priority: 'normal', requiresProfessional: false },
      { title: 'Zloz zawiadomienie o rozpoczeciu budowy', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
    ],
    warnings: [],
    defaultDocuments: [
      { name: 'Protokol wytyczenia', description: 'Protokol geodezyjnego wytyczenia budynku', isRequired: true },
      { name: 'Zawiadomienie o rozpoczeciu budowy', description: 'Potwierdzenie zlozenia zawiadomienia', isRequired: true },
    ],
  },
  {
    key: 'foundation',
    name: 'Fundamenty',
    description: 'Wykopy, zbrojenie, betonowanie fundamentow. Hydroizolacja.',
    order: 4,
    estimatedWeeks: 4,
    requiredProfessionals: ['structural-engineer', 'general-contractor'],
    icon: 'layers',
    defaultChecklist: [
      { title: 'Wykonaj wykopy zgodnie z projektem', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Wykonaj zbrojenie fundamentow', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Zalej beton — zgodnie z projektem', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Wykonaj hydroizolacje fundamentow', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Wpis kierownika budowy do dziennika', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
    ],
    warnings: [
      {
        title: 'Prace konstrukcyjne — nie DIY',
        description: 'Fundamenty to element konstrukcyjny. Wykonanie musi byc zgodne z projektem i nadzorowane przez kierownika budowy.',
        warningCategory: 'not-diy',
        warningLevel: 'danger',
      },
      {
        title: 'Projekt i dokumentacja techniczna maja priorytet',
        description: 'Wymiary, zbrojenie i klasa betonu musza scisle odpowiadac projektowi konstrukcyjnemu.',
        warningCategory: 'technical-documentation',
        warningLevel: 'danger',
      },
    ],
    defaultDocuments: [
      { name: 'Protokol odbioru fundamentow', description: 'Wpis kierownika budowy potwierdzajacy zgodnosc z projektem', isRequired: true },
    ],
  },
  {
    key: 'structural-walls',
    name: 'Sciany konstrukcyjne',
    description: 'Murowanie scian nosnych, stropu, wienców.',
    order: 5,
    estimatedWeeks: 8,
    requiredProfessionals: ['structural-engineer', 'general-contractor'],
    icon: 'grid',
    defaultChecklist: [
      { title: 'Murowanie scian nosnych wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Wykonanie wiencow i nadprozy', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Wykonanie stropu', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Kontrola pionu i poziomu', priority: 'high', requiresProfessional: true },
    ],
    warnings: [
      {
        title: 'Prace konstrukcyjne — wymaga projektu',
        description: 'Sciany nosne, stropy i wienze musza byc wykonane scisle wg projektu konstrukcyjnego pod nadzorem kierownika.',
        warningCategory: 'not-diy',
        warningLevel: 'danger',
      },
    ],
    defaultDocuments: [],
  },
  {
    key: 'roof',
    name: 'Dach',
    description: 'Konstrukcja wiezby dachowej, pokrycie, orynnowanie.',
    order: 6,
    estimatedWeeks: 4,
    requiredProfessionals: ['roofer', 'structural-engineer'],
    icon: 'home',
    defaultChecklist: [
      { title: 'Montaz wiezby dachowej wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Montaz folii dachowej', priority: 'high', requiresProfessional: true },
      { title: 'Polozenie pokrycia dachowego', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Montaz orynnowania', priority: 'high', requiresProfessional: true },
      { title: 'Obrobki blacharskie i kominy', priority: 'high', requiresProfessional: true, warningCategory: 'professional-required' },
    ],
    warnings: [
      {
        title: 'Praca na wysokosci — bezpieczenstwo',
        description: 'Montaz dachu to praca na wysokosci wymagajaca ekipy z doswiadczeniem i zabezpieczeniami BHP.',
        warningCategory: 'safety',
        warningLevel: 'danger',
      },
    ],
    defaultDocuments: [],
  },
  {
    key: 'windows-doors',
    name: 'Okna i drzwi',
    description: 'Montaz okien, drzwi zewnetrznych, bram garazowych.',
    order: 7,
    estimatedWeeks: 2,
    requiredProfessionals: [],
    icon: 'square',
    defaultChecklist: [
      { title: 'Zamowienie okien wg projektu', priority: 'high', requiresProfessional: false },
      { title: 'Montaz okien z uszczelnieniem', priority: 'high', requiresProfessional: true },
      { title: 'Montaz drzwi zewnetrznych', priority: 'high', requiresProfessional: true },
      { title: 'Montaz bramy garazowej (jesli dotyczy)', priority: 'normal', requiresProfessional: true },
    ],
    warnings: [],
    defaultDocuments: [],
  },
  {
    key: 'installations',
    name: 'Instalacje',
    description: 'Instalacje elektryczne, wodno-kanalizacyjne, gazowe, grzewcze, wentylacyjne.',
    order: 8,
    estimatedWeeks: 6,
    requiredProfessionals: ['electrician', 'plumber', 'gas-installer'],
    icon: 'zap',
    defaultChecklist: [
      { title: 'Instalacja elektryczna wg projektu', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Instalacja wodno-kanalizacyjna', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Instalacja gazowa (jesli dotyczy)', priority: 'critical', requiresProfessional: true, warningCategory: 'not-diy' },
      { title: 'Instalacja grzewcza (CO)', priority: 'critical', requiresProfessional: true, warningCategory: 'professional-required' },
      { title: 'Wentylacja mechaniczna/rekuperacja', priority: 'high', requiresProfessional: true },
      { title: 'Protokoly prób instalacji', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
    ],
    warnings: [
      {
        title: 'Instalacje wymagaja uprawnien',
        description: 'Instalacje elektryczne, gazowe i wod-kan musza byc wykonane przez osoby z odpowiednimi uprawnieniami. Wymagane protokoly.',
        warningCategory: 'professional-required',
        warningLevel: 'danger',
      },
      {
        title: 'Instalacja gazowa — wymog prawny',
        description: 'Instalacja gazowa moze byc wykonywana wylacznie przez osoby z uprawnieniami gazowymi. Wymaga odbioru przez inspektora.',
        warningCategory: 'not-diy',
        warningLevel: 'danger',
      },
    ],
    defaultDocuments: [
      { name: 'Protokol instalacji elektrycznej', description: 'Pomiary i protokol od elektryka z uprawnieniami', isRequired: true },
      { name: 'Protokol szczelnosci instalacji gazowej', description: 'Wymagany dla odbioru gazowego', isRequired: false },
      { name: 'Protokol instalacji wod-kan', description: 'Protokol proby szczelnosci', isRequired: true },
    ],
  },
  {
    key: 'interior-finishing',
    name: 'Wykonczenie wnetrz',
    description: 'Tynki, wylewki, podlogi, malowanie, lazienki, kuchnia.',
    order: 9,
    estimatedWeeks: 10,
    requiredProfessionals: [],
    icon: 'edit-3',
    defaultChecklist: [
      { title: 'Tynki wewnetrzne', priority: 'high', requiresProfessional: false },
      { title: 'Wylewki podlogowe', priority: 'high', requiresProfessional: false },
      { title: 'Gladzie i malowanie', priority: 'normal', requiresProfessional: false },
      { title: 'Ukladanie podlog', priority: 'normal', requiresProfessional: false },
      { title: 'Plytki w lazienkach i kuchni', priority: 'normal', requiresProfessional: false },
      { title: 'Bialy montaz (umywalki, WC, wanna)', priority: 'normal', requiresProfessional: false },
      { title: 'Montaz drzwi wewnetrznych', priority: 'normal', requiresProfessional: false },
    ],
    warnings: [],
    defaultDocuments: [],
  },
  {
    key: 'exterior-finishing',
    name: 'Wykonczenie zewnetrzne',
    description: 'Elewacja, docieplenie, tarasy, podjazdy.',
    order: 10,
    estimatedWeeks: 6,
    requiredProfessionals: [],
    icon: 'sun',
    defaultChecklist: [
      { title: 'Docieplenie scian (ETICS / styropian / welna)', priority: 'high', requiresProfessional: false },
      { title: 'Tynk elewacyjny lub oblicowka', priority: 'high', requiresProfessional: false },
      { title: 'Obrobki blacharskie i parapety zewnetrzne', priority: 'normal', requiresProfessional: false },
      { title: 'Taras / schody zewnetrzne', priority: 'normal', requiresProfessional: false },
      { title: 'Podjazd i chodniki', priority: 'low', requiresProfessional: false },
    ],
    warnings: [],
    defaultDocuments: [],
  },
  {
    key: 'landscaping',
    name: 'Zagospodarowanie terenu',
    description: 'Ogrodzenie, zielen, osietlenie zewnetrzne.',
    order: 11,
    estimatedWeeks: 4,
    requiredProfessionals: [],
    icon: 'compass',
    defaultChecklist: [
      { title: 'Ogrodzenie dzialki', priority: 'normal', requiresProfessional: false },
      { title: 'Oswietlenie zewnetrzne', priority: 'low', requiresProfessional: false },
      { title: 'Trawnik i nasadzenia', priority: 'low', requiresProfessional: false },
    ],
    warnings: [],
    defaultDocuments: [],
  },
  {
    key: 'final-inspections',
    name: 'Odbiory i zakonczenie',
    description: 'Odbiory techniczne, zawiadomienie o zakonczeniu budowy, pozwolenie na uzytkowanie.',
    order: 12,
    estimatedWeeks: 4,
    requiredProfessionals: ['building-inspector', 'chimney-sweep', 'energy-auditor'],
    icon: 'check-circle',
    defaultChecklist: [
      { title: 'Geodezyjny pomiar powykonawczy', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Odbiór kominiarski', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Swiadectwo energetyczne', priority: 'critical', requiresProfessional: true, warningCategory: 'formal-legal' },
      { title: 'Zawiadomienie o zakonczeniu budowy', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
      { title: 'Pozwolenie na uzytkowanie (jesli wymagane)', priority: 'critical', requiresProfessional: false, warningCategory: 'formal-legal' },
    ],
    warnings: [
      {
        title: 'Wymaga formalnych odbirow',
        description: 'Zakonczenie budowy wymaga odbioru kominiarskiego, swiadectwa energetycznego i zawiadomienia nadzoru budowlanego.',
        warningCategory: 'formal-legal',
        warningLevel: 'warning',
      },
    ],
    defaultDocuments: [
      { name: 'Pomiar powykonawczy', description: 'Geodezyjny pomiar powykonawczy budynku', isRequired: true },
      { name: 'Protokol kominiarski', description: 'Odbiór przewodow kominowych i wentylacyjnych', isRequired: true },
      { name: 'Swiadectwo energetyczne', description: 'Swiadectwo charakterystyki energetycznej budynku', isRequired: true },
      { name: 'Zawiadomienie o zakonczeniu budowy', description: 'Potwierdzenie zlozenia zawiadomienia w PINB', isRequired: true },
    ],
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
  { role: 'general-contractor', label: 'Generalny wykonawca', description: 'Koordynacja calej budowy', whenNeeded: 'Caly okres budowy', isRequired: false },
  { role: 'building-inspector', label: 'Inspektor nadzoru', description: 'Kontrola jakosci i zgodnosci z projektem', whenNeeded: 'Caly okres budowy', isRequired: false },
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
