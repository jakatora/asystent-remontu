import type { ConstructionRiskNotice, WarningCategory, WarningLevel } from '@/types/house-build';

export interface BuildWarningDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly warningCategory: WarningCategory;
  readonly warningLevel: WarningLevel;
  readonly stageKeys: readonly string[];
}

export const BUILD_WARNINGS: readonly BuildWarningDefinition[] = [
  {
    id: 'bw-formal-permits',
    title: 'Wymaga pozwolenia na budowe',
    description: 'Budowa domu jednorodzinnego wymaga uzyskania prawomocnego pozwolenia na budowe lub zgloszenia budowy z projektem.',
    warningCategory: 'formal-legal',
    warningLevel: 'danger',
    stageKeys: ['design-and-permits', 'site-preparation'],
  },
  {
    id: 'bw-kierownik',
    title: 'Kierownik budowy jest obowiazkowy',
    description: 'Zgodnie z Prawem budowlanym, budowa domu wymaga wyznaczenia kierownika budowy z uprawnieniami.',
    warningCategory: 'formal-legal',
    warningLevel: 'danger',
    stageKeys: ['design-and-permits', 'foundation', 'structural-walls', 'roof'],
  },
  {
    id: 'bw-structural-not-diy',
    title: 'Prace konstrukcyjne — nie wykonuj samodzielnie',
    description: 'Fundamenty, sciany nosne, stropy i dach to elementy konstrukcyjne. Ich wykonanie musi byc zgodne z projektem i nadzorowane przez kierownika budowy.',
    warningCategory: 'not-diy',
    warningLevel: 'danger',
    stageKeys: ['foundation', 'structural-walls', 'roof'],
  },
  {
    id: 'bw-installations-licensed',
    title: 'Instalacje wymagaja uprawnien',
    description: 'Instalacje elektryczne, gazowe i wodno-kanalizacyjne musza byc wykonane przez osoby z odpowiednimi uprawnieniami. Wymagane sa protokoly odbiorcze.',
    warningCategory: 'professional-required',
    warningLevel: 'danger',
    stageKeys: ['installations'],
  },
  {
    id: 'bw-gas-legal',
    title: 'Gaz — surowy wymog prawny',
    description: 'Instalacja gazowa moze byc wykonywana wylacznie przez osoby z uprawnieniami gazowymi (UDT). Wymaga odbioru i protokolu.',
    warningCategory: 'not-diy',
    warningLevel: 'danger',
    stageKeys: ['installations'],
  },
  {
    id: 'bw-project-priority',
    title: 'Projekt i dokumentacja techniczna maja priorytet',
    description: 'Wszelkie prace budowlane musza byc wykonywane zgodnie z zatwierdzonym projektem budowlanym. Zmiany wymagaja zgody projektanta.',
    warningCategory: 'technical-documentation',
    warningLevel: 'warning',
    stageKeys: ['foundation', 'structural-walls', 'roof', 'installations', 'insulation-energy'],
  },
  {
    id: 'bw-height-safety',
    title: 'Praca na wysokosci',
    description: 'Montaz dachu, wiezby dachowej i prace na rusztowaniach wymagaja doswiadczenia i zabezpieczen BHP.',
    warningCategory: 'safety',
    warningLevel: 'danger',
    stageKeys: ['roof', 'exterior-finishing', 'insulation-energy'],
  },
  {
    id: 'bw-final-inspections',
    title: 'Formalne odbiory sa wymagane',
    description: 'Przed zamieszkaniem wymagane sa: odbiór kominiarski, swiadectwo energetyczne, pomiar powykonawczy i zawiadomienie PINB.',
    warningCategory: 'formal-legal',
    warningLevel: 'warning',
    stageKeys: ['final-inspections'],
  },
];

export function getWarningsForStage(stageKey: string): BuildWarningDefinition[] {
  return BUILD_WARNINGS.filter((w) => w.stageKeys.includes(stageKey));
}
