import type { ApplicabilityState, SourceMetadata } from '@/types/house-build';

export interface CompletionItemDefinition {
  readonly itemKey: string;
  readonly title: string;
  readonly description: string;
  readonly defaultApplicability: ApplicabilityState;
  readonly sortOrder: number;
  readonly source: SourceMetadata;
}

const PB_SOURCE: SourceMetadata = {
  sourceLabel: 'Prawo budowlane (Dz.U. 2024 poz. 725 t.j.)',
  sourceType: 'official',
  lastReviewedDate: '2025-01-15',
  classification: 'official',
};

export const COMPLETION_PACKAGE_ITEMS: readonly CompletionItemDefinition[] = [
  {
    itemKey: 'completion-notice-ready',
    title: 'Gotowosc zawiadomienia o zakonczeniu budowy',
    description: 'PB-16 lub PB-16a wypelnione i gotowe do zlozenia w PINB.',
    defaultApplicability: 'likely-required',
    sortOrder: 1,
    source: PB_SOURCE,
  },
  {
    itemKey: 'occupancy-permit-ready',
    title: 'Gotowosc wniosku o pozwolenie na uzytkowanie',
    description: 'PB-17 przygotowany, jesli wymagany w Twoim przypadku.',
    defaultApplicability: 'maybe-required',
    sortOrder: 2,
    source: PB_SOURCE,
  },
  {
    itemKey: 'energy-certificate-status',
    title: 'Swiadectwo charakterystyki energetycznej',
    description: 'Swiadectwo wymagane przy zakonczeniu lub uzytkowanie. Nowe budynki z reguly wymagaja. Pewne domy do 70 m2 na wlasne potrzeby moga byc wyjatkiem.',
    defaultApplicability: 'likely-required',
    sortOrder: 3,
    source: {
      sourceLabel: 'Ustawa o charakterystyce energetycznej budynkow',
      sourceType: 'official',
      lastReviewedDate: '2025-01-15',
      classification: 'official',
    },
  },
  {
    itemKey: 'geodetic-completion',
    title: 'Inwentaryzacja geodezyjna powykonawcza',
    description: 'Pomiar geodezyjny budynku po zakonczeniu budowy. Niezbedny do zawiadomienia/odbioru.',
    defaultApplicability: 'required',
    sortOrder: 4,
    source: PB_SOURCE,
  },
  {
    itemKey: 'construction-log-status',
    title: 'Dziennik budowy — kompletnosc',
    description: 'Dziennik budowy (papierowy lub elektroniczny) z kompletnymi wpisami, w tym zamknieciem.',
    defaultApplicability: 'required',
    sortOrder: 5,
    source: PB_SOURCE,
  },
  {
    itemKey: 'declarations-ready',
    title: 'Oswiadczenia kierownika budowy',
    description: 'Oswiadczenie kierownika o zgodnosci z projektem i warunkami pozwolenia/zgloszenia.',
    defaultApplicability: 'required',
    sortOrder: 6,
    source: PB_SOURCE,
  },
  {
    itemKey: 'installation-protocols',
    title: 'Protokoly odbioru instalacji',
    description: 'Protokoly odbioru instalacji elektrycznej, gazowej, wentylacyjnej, kominowej itp.',
    defaultApplicability: 'likely-required',
    sortOrder: 7,
    source: PB_SOURCE,
  },
  {
    itemKey: 'chimney-protocol',
    title: 'Protokol kominiarski',
    description: 'Opinia kominiarska potwierdzajaca poprawnosc kanalów spalinowych, dymowych i wentylacyjnych.',
    defaultApplicability: 'likely-required',
    sortOrder: 8,
    source: PB_SOURCE,
  },
  {
    itemKey: 'project-changes-doc',
    title: 'Dokumentacja zmian istotnych/nieistotnych',
    description: 'Jesli wprowadzono zmiany w projekcie — kwalifikacja i dokumentacja zmian.',
    defaultApplicability: 'maybe-required',
    sortOrder: 9,
    source: PB_SOURCE,
  },
  {
    itemKey: 'missing-items-review',
    title: 'Przeglad brakujacych elementow',
    description: 'Koncowy przeglad: czy wszystkie wymagane dokumenty, protokoly i oswiadczenia sa kompletne.',
    defaultApplicability: 'required',
    sortOrder: 10,
    source: PB_SOURCE,
  },
];

export function getCompletionItemByKey(key: string): CompletionItemDefinition | undefined {
  return COMPLETION_PACKAGE_ITEMS.find((i) => i.itemKey === key);
}
