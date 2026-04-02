export interface MilestoneDefinition {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly sortOrder: number;
  readonly relatedStages: readonly string[];
}

export const DEFAULT_MILESTONES: readonly MilestoneDefinition[] = [
  {
    key: 'formal-path-ready',
    label: 'Sciezka formalna gotowa',
    description: 'Pozwolenie na budowe prawomocne lub zgloszenie zlozone.',
    sortOrder: 1,
    relatedStages: ['design-and-permits'],
  },
  {
    key: 'before-start-ready',
    label: 'Gotowosc do rozpoczecia budowy',
    description: 'Zawiadomienie zlozone, kierownik wyznaczony, plac gotowy.',
    sortOrder: 2,
    relatedStages: ['site-preparation'],
  },
  {
    key: 'foundations-accepted',
    label: 'Fundamenty odebrane',
    description: 'Fundamenty wykonane i odebrane przez kierownika budowy.',
    sortOrder: 3,
    relatedStages: ['foundation'],
  },
  {
    key: 'shell-closed',
    label: 'Stan surowy zamkniety',
    description: 'Sciany, strop i dach wykonane — bryla budynku zamknieta.',
    sortOrder: 4,
    relatedStages: ['structural-walls', 'roof'],
  },
  {
    key: 'building-enclosed',
    label: 'Budynek zamkniety',
    description: 'Okna i drzwi zamontowane — budynek zabezpieczony przed pogoda.',
    sortOrder: 5,
    relatedStages: ['windows-doors'],
  },
  {
    key: 'installations-complete',
    label: 'Instalacje wykonane',
    description: 'Wszystkie instalacje wewnetrzne wykonane i odebrane.',
    sortOrder: 6,
    relatedStages: ['installations'],
  },
  {
    key: 'energy-planning-confirmed',
    label: 'Planowanie energetyczne potwierdzone',
    description: 'Strategia izolacji, ogrzewania i wentylacji zatwierdzona.',
    sortOrder: 7,
    relatedStages: ['insulation-energy'],
  },
  {
    key: 'interior-finish-ready',
    label: 'Wnetrza gotowe',
    description: 'Wykonczenie wnetrz zakonczone, bialy montaz kompletny.',
    sortOrder: 8,
    relatedStages: ['interior-finishing'],
  },
  {
    key: 'completion-ready',
    label: 'Gotowosc do odbioru',
    description: 'Wszystkie odbiory techniczne wykonane, dokumentacja kompletna.',
    sortOrder: 9,
    relatedStages: ['final-inspections'],
  },
];

export function getMilestoneByKey(key: string): MilestoneDefinition | undefined {
  return DEFAULT_MILESTONES.find((m) => m.key === key);
}
