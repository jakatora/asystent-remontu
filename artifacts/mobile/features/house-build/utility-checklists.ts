import type { UtilityType, SourceMetadata } from '@/types/house-build';

export interface UtilityChecklistDefinition {
  readonly itemKey: string;
  readonly title: string;
  readonly sortOrder: number;
}

export interface UtilityGuidance {
  readonly utilityType: UtilityType;
  readonly title: string;
  readonly description: string;
  readonly tips: readonly string[];
  readonly checklist: readonly UtilityChecklistDefinition[];
  readonly source: SourceMetadata;
}

const GENERAL_SOURCE: SourceMetadata = {
  sourceLabel: 'Ogolne wytyczne planowania przylacza',
  sourceType: 'technical',
  lastReviewedDate: '2025-01-15',
  classification: 'technical',
};

export const UTILITY_GUIDANCE: Record<UtilityType, UtilityGuidance> = {
  electricity: {
    utilityType: 'electricity',
    title: 'Przylacze elektryczne',
    description: 'Planowanie przylacza do sieci elektroenergetycznej.',
    tips: [
      'Sprawdz, czy przylacze sieciowe jest potrzebne dla budowanego domu.',
      'Proces zwykle zaczyna sie od zlozenia wniosku o warunki przylaczenia do operatora.',
      'Przygotuj tytul prawny lub prawo do dysponowania dzialka/nieruchomoscia.',
      'Moc przylaczeniowa powinna byc zaplanowana w oparciu o projekt domu i przewidywane jednoczesne obciazenia.',
      'Warunki przylaczenia moga miec ograniczony termin waznosci — nie traktuj ich jako bezterminowych.',
      'Rozroznij miedzy docelowym zasilaniem domu a tymczasowym zasilaniem placu budowy.',
      'Zweryfikuj wymagania u lokalnego operatora sieci dystrybucyjnej.',
    ],
    checklist: [
      { itemKey: 'elec-operator-identified', title: 'Operator/dostawca wybrany', sortOrder: 1 },
      { itemKey: 'elec-power-planned', title: 'Moc przylaczeniowa zaplanowana', sortOrder: 2 },
      { itemKey: 'elec-application-prepared', title: 'Wniosek przygotowany', sortOrder: 3 },
      { itemKey: 'elec-conditions-received', title: 'Warunki przylaczenia otrzymane', sortOrder: 4 },
      { itemKey: 'elec-agreement-status', title: 'Umowa przylaczeniowa — status', sortOrder: 5 },
      { itemKey: 'elec-implementation', title: 'Realizacja przylaczenia', sortOrder: 6 },
      { itemKey: 'elec-temp-supply', title: 'Zasilanie tymczasowe placu budowy', sortOrder: 7 },
      { itemKey: 'elec-target-contract', title: 'Umowa docelowa na dostawe pradu', sortOrder: 8 },
    ],
    source: GENERAL_SOURCE,
  },
  water: {
    utilityType: 'water',
    title: 'Przylacze wodociagowe',
    description: 'Planowanie przylacza do sieci wodociagowej.',
    tips: [
      'Zweryfikuj, czy publiczna siec wodociagowa jest dostepna w Twojej lokalizacji.',
      'Warunki przylaczenia sa zwykle wymagane od lokalnego przedsiebiorstwa wodociagowego.',
      'Czesto potrzebny jest plan lub szkic sytuacyjny z trasa przylacza wzgledem istniejacych sieci.',
      'Terminy i dokladne wymagania zaleza od lokalnego przedsiebiorstwa wodociagowego.',
      'Rozważ, czy potrzebujesz tymczasowego zrodla wody na czas budowy.',
    ],
    checklist: [
      { itemKey: 'water-utility-identified', title: 'Przedsiebiorstwo wodociagowe zidentyfikowane', sortOrder: 1 },
      { itemKey: 'water-application-prepared', title: 'Wniosek przygotowany', sortOrder: 2 },
      { itemKey: 'water-site-plan', title: 'Szkic/plan sytuacyjny przygotowany', sortOrder: 3 },
      { itemKey: 'water-conditions-received', title: 'Warunki przylaczenia otrzymane', sortOrder: 4 },
      { itemKey: 'water-route-decision', title: 'Decyzja o trasie przylacza', sortOrder: 5 },
      { itemKey: 'water-implementation', title: 'Realizacja przylaczenia', sortOrder: 6 },
      { itemKey: 'water-acceptance', title: 'Odbiór/przekazanie', sortOrder: 7 },
    ],
    source: GENERAL_SOURCE,
  },
  sewage: {
    utilityType: 'sewage',
    title: 'Przylacze kanalizacyjne',
    description: 'Planowanie przylacza do sieci kanalizacyjnej.',
    tips: [
      'Zweryfikuj, czy publiczna siec kanalizacyjna jest dostepna w lokalizacji.',
      'Jesli siec kanalizacyjna nie jest dostepna, rozważ rozwiazania alternatywne (szambo, przydomowa oczyszczalnia).',
      'Warunki i wymagania lokalne maja kluczowe znaczenie.',
      'Proces moze byc zbliżony do przylacza wodociagowego u tego samego operatora.',
    ],
    checklist: [
      { itemKey: 'sewer-utility-identified', title: 'Przedsiebiorstwo kanalizacyjne zidentyfikowane', sortOrder: 1 },
      { itemKey: 'sewer-network-available', title: 'Dostepnosc sieci zweryfikowana', sortOrder: 2 },
      { itemKey: 'sewer-application-prepared', title: 'Wniosek przygotowany', sortOrder: 3 },
      { itemKey: 'sewer-conditions-received', title: 'Warunki przylaczenia otrzymane', sortOrder: 4 },
      { itemKey: 'sewer-route-decision', title: 'Decyzja o trasie', sortOrder: 5 },
      { itemKey: 'sewer-implementation', title: 'Realizacja przylaczenia', sortOrder: 6 },
      { itemKey: 'sewer-acceptance', title: 'Odbiór/przekazanie', sortOrder: 7 },
    ],
    source: GENERAL_SOURCE,
  },
  gas: {
    utilityType: 'gas',
    title: 'Przylacze gazowe',
    description: 'Planowanie przylacza do sieci gazowej.',
    tips: [
      'Nie zakladaj, ze gaz jest zawsze potrzebny — zalezy od koncepcji ogrzewania i gotowania.',
      'Jesli gaz jest planowany, warunki przylaczenia i proces sa zwykle wymagane od operatora gazowego.',
      'Terminy i realizacja zaleza od zasad lokalnego operatora oraz warunków techniczno-ekonomicznych.',
      'Okresl, czy gaz jest planowany do ogrzewania, gotowania, czy obu.',
    ],
    checklist: [
      { itemKey: 'gas-planned', title: 'Gaz zaplanowany (tak/nie)', sortOrder: 1 },
      { itemKey: 'gas-operator-identified', title: 'Operator gazowy zidentyfikowany', sortOrder: 2 },
      { itemKey: 'gas-application-prepared', title: 'Wniosek przygotowany', sortOrder: 3 },
      { itemKey: 'gas-conditions-received', title: 'Warunki przylaczenia otrzymane', sortOrder: 4 },
      { itemKey: 'gas-agreement-status', title: 'Umowa — status', sortOrder: 5 },
      { itemKey: 'gas-installation-timing', title: 'Termin realizacji instalacji', sortOrder: 6 },
      { itemKey: 'gas-readiness', title: 'Gotowosc przylacza', sortOrder: 7 },
    ],
    source: GENERAL_SOURCE,
  },
  telecom: {
    utilityType: 'telecom',
    title: 'Internet / telekomunikacja',
    description: 'Planowanie przylacza telekomunikacyjnego i internetu.',
    tips: [
      'Sprawdz dostepnosc uslug na stronie internet.gov.pl (UKE) — mozesz zobaczyc operatorow i planowane inwestycje.',
      'Rozroznij miedzy: dostepne / prawdopodobnie dostepne / planowane polaczenie.',
      'Pomysl o planowaniu trasy telekomunikacyjnej podczas budowy.',
      'Przygotowanie mikrorury/kanalizacji od granicy dzialki do budynku ulatwi pozniejsze podlaczenie.',
      'Wczesne zaplanowanie punktu wejscia telekomunikacyjnego oszczedza czas i koszty.',
    ],
    checklist: [
      { itemKey: 'telecom-availability-checked', title: 'Dostepnosc sprawdzona', sortOrder: 1 },
      { itemKey: 'telecom-providers-identified', title: 'Dostawcy zidentyfikowani', sortOrder: 2 },
      { itemKey: 'telecom-route-prepared', title: 'Trasa/mikrorura przygotowana', sortOrder: 3 },
      { itemKey: 'telecom-entry-point', title: 'Punkt wejscia telekomunikacyjny zaplanowany', sortOrder: 4 },
      { itemKey: 'telecom-provider-selected', title: 'Dostawca/umowa wybrana', sortOrder: 5 },
      { itemKey: 'telecom-installation-timing', title: 'Termin instalacji', sortOrder: 6 },
    ],
    source: GENERAL_SOURCE,
  },
  heating: {
    utilityType: 'heating',
    title: 'Ogrzewanie',
    description: 'Planowanie zrodla ciepla i systemu grzewczego.',
    tips: [
      'Koncepcja ogrzewania powinna byc skoordynowana z przylaczem gazowym, elektrycznym i izolacja.',
      'Rozważ pompe ciepla, kociol gazowy, pelet, lub inne zrodlo.',
      'Zweryfikuj, czy wybrany system spelnia wymagania WT 2024.',
    ],
    checklist: [
      { itemKey: 'heat-concept-decided', title: 'Koncepcja ogrzewania zdecydowana', sortOrder: 1 },
      { itemKey: 'heat-source-selected', title: 'Zrodlo ciepla wybrane', sortOrder: 2 },
      { itemKey: 'heat-distribution-planned', title: 'System dystrybucji zaplanowany', sortOrder: 3 },
      { itemKey: 'heat-coordination', title: 'Koordynacja z przylaczami', sortOrder: 4 },
    ],
    source: GENERAL_SOURCE,
  },
};

export function getUtilityGuidance(type: UtilityType): UtilityGuidance {
  return UTILITY_GUIDANCE[type];
}

export const ALTERNATIVE_DEFINITIONS = [
  { utilityType: 'water' as UtilityType, title: 'Studnia glebinowa / ujecie wlasne', description: 'Gdy publiczna siec wodociagowa nie jest dostepna. Wymagane pozwolenie wodnoprawne lub zgloszenie.' },
  { utilityType: 'sewage' as UtilityType, title: 'Szambo / zbiornik bezodplywowy', description: 'Tymczasowe lub docelowe rozwiazanie przy braku kanalizacji.' },
  { utilityType: 'sewage' as UtilityType, title: 'Przydomowa oczyszczalnia sciekow', description: 'Alternatywa przy braku kanalizacji. Wymaga zgloszenia lub pozwolenia.' },
  { utilityType: 'gas' as UtilityType, title: 'Ogrzewanie alternatywne (pompa ciepla, pelet)', description: 'Gdy gaz nie jest dostepny lub nie jest planowany.' },
  { utilityType: 'telecom' as UtilityType, title: 'Internet mobilny / bezprzewodowy', description: 'Gdy siec stacjonarna nie jest dostepna. Rozwiazanie tymczasowe lub docelowe.' },
] as const;
