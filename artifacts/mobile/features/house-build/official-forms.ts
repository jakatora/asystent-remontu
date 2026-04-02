import type { SourceMetadata, ApplicabilityState } from '@/types/house-build';

export interface OfficialFormDefinition {
  readonly formKey: string;
  readonly title: string;
  readonly explanation: string;
  readonly processPhase: string;
  readonly defaultApplicability: ApplicabilityState;
  readonly officialLink: string;
  readonly sortOrder: number;
  readonly source: SourceMetadata;
}

const PB_SOURCE: SourceMetadata = {
  sourceLabel: 'Prawo budowlane (Dz.U. 2024 poz. 725 t.j.)',
  sourceType: 'official',
  lastReviewedDate: '2025-01-15',
  classification: 'official',
};

export const OFFICIAL_FORM_DEFINITIONS: readonly OfficialFormDefinition[] = [
  {
    formKey: 'pb-12',
    title: 'PB-12 Zawiadomienie o zamierzonym terminie rozpoczecia robót budowlanych',
    explanation: 'Skladasz przed rozpoczeciem budowy. Wymagane przy pozwoleniu na budowe i niektorych zgloszeniach z projektem.',
    processPhase: 'Przed rozpoczeciem budowy',
    defaultApplicability: 'likely-required',
    officialLink: 'https://www.gunb.gov.pl/',
    sortOrder: 1,
    source: PB_SOURCE,
  },
  {
    formKey: 'pb-16',
    title: 'PB-16 Zawiadomienie o zakonczeniu budowy',
    explanation: 'Skladasz po zakonczeniu budowy, gdy nie jest wymagane pozwolenie na uzytkowanie. Dotyczy wielu domów jednorodzinnych.',
    processPhase: 'Po zakonczeniu budowy',
    defaultApplicability: 'likely-required',
    officialLink: 'https://www.gunb.gov.pl/',
    sortOrder: 2,
    source: PB_SOURCE,
  },
  {
    formKey: 'pb-16a',
    title: 'PB-16a Zawiadomienie o zakonczeniu budowy domu jednorodzinnego',
    explanation: 'Uproszczona wersja PB-16 dla domów jednorodzinnych. Sprawdz, czy Twoja budowa sie kwalifikuje.',
    processPhase: 'Po zakonczeniu budowy',
    defaultApplicability: 'maybe-required',
    officialLink: 'https://www.gunb.gov.pl/',
    sortOrder: 3,
    source: PB_SOURCE,
  },
  {
    formKey: 'pb-17',
    title: 'PB-17 Wniosek o pozwolenie na uzytkowanie',
    explanation: 'Wymagane, gdy budynek wymaga pozwolenia na uzytkowanie (np. budynek wielorodzinny, uzytkowanie czesciowe).',
    processPhase: 'Po zakonczeniu budowy',
    defaultApplicability: 'maybe-required',
    officialLink: 'https://www.gunb.gov.pl/',
    sortOrder: 4,
    source: PB_SOURCE,
  },
  {
    formKey: 'pb-17a',
    title: 'PB-17a Wniosek o pozwolenie na uzytkowanie przed zakonczeniem wszystkich robót',
    explanation: 'Gdy chcesz uzyskac pozwolenie na uzytkowanie czesci budynku przed zakonczeniem calej budowy.',
    processPhase: 'W trakcie budowy (uzytkowanie czesciowe)',
    defaultApplicability: 'maybe-required',
    officialLink: 'https://www.gunb.gov.pl/',
    sortOrder: 5,
    source: PB_SOURCE,
  },
  {
    formKey: 'property-declaration',
    title: 'Oswiadczenie o prawie do dysponowania nieruchomoscia na cele budowlane',
    explanation: 'Niezbedne przy skladaniu wniosku o pozwolenie na budowe lub zgloszenia. Potwierdzasz prawo do dzialki.',
    processPhase: 'Przed uzyskaniem pozwolenia/zgloszenia',
    defaultApplicability: 'required',
    officialLink: '',
    sortOrder: 6,
    source: PB_SOURCE,
  },
  {
    formKey: 'edb-setup',
    title: 'Elektroniczny Dziennik Budowy — zalozenie i konfiguracja',
    explanation: 'Dziennik budowy prowadzony elektronicznie w systemie GUNB. Wymagany od 2023 r. dla nowych budów.',
    processPhase: 'Przed rozpoczeciem budowy',
    defaultApplicability: 'likely-required',
    officialLink: 'https://e-budownictwo.gunb.gov.pl/',
    sortOrder: 7,
    source: PB_SOURCE,
  },
  {
    formKey: 'energy-certificate',
    title: 'Swiadectwo charakterystyki energetycznej',
    explanation: 'Wymagane przy zakonczeniu budowy lub uzytkowanie. Nowe budynki z reguty wymagaja swiadectwa. Pewne domy do 70 m2 na wlasne potrzeby moga byc wyjatem.',
    processPhase: 'Przed zakonczeniem / uzytkowanie',
    defaultApplicability: 'likely-required',
    officialLink: 'https://www.gov.pl/',
    sortOrder: 8,
    source: {
      sourceLabel: 'Ustawa o charakterystyce energetycznej budynkow',
      sourceType: 'official',
      lastReviewedDate: '2025-01-15',
      classification: 'official',
    },
  },
];

export function getOfficialFormByKey(key: string): OfficialFormDefinition | undefined {
  return OFFICIAL_FORM_DEFINITIONS.find((f) => f.formKey === key);
}
