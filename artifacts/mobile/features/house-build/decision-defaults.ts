import type { DecisionCategory } from '@/types/house-build';

export interface DecisionTemplate {
  readonly title: string;
  readonly category: DecisionCategory;
  readonly stageKey: string | null;
  readonly sortOrder: number;
}

export const DEFAULT_DECISION_TEMPLATES: readonly DecisionTemplate[] = [
  {
    title: 'Technologia / system budowy domu',
    category: 'technology',
    stageKey: 'structural-walls',
    sortOrder: 1,
  },
  {
    title: 'System scian konstrukcyjnych',
    category: 'structure',
    stageKey: 'structural-walls',
    sortOrder: 2,
  },
  {
    title: 'System dachowy',
    category: 'structure',
    stageKey: 'roof',
    sortOrder: 3,
  },
  {
    title: 'Standard okien (Uw, pakiet szybowy)',
    category: 'energy',
    stageKey: 'windows-doors',
    sortOrder: 4,
  },
  {
    title: 'Koncepcja ogrzewania',
    category: 'energy',
    stageKey: 'installations',
    sortOrder: 5,
  },
  {
    title: 'Koncepcja wentylacji',
    category: 'energy',
    stageKey: 'installations',
    sortOrder: 6,
  },
  {
    title: 'Strategia izolacji',
    category: 'energy',
    stageKey: 'insulation-energy',
    sortOrder: 7,
  },
  {
    title: 'System elewacji',
    category: 'finishing',
    stageKey: 'exterior-finishing',
    sortOrder: 8,
  },
  {
    title: 'Podejscie do wyboru wykonawcow',
    category: 'management',
    stageKey: null,
    sortOrder: 9,
  },
  {
    title: 'Etapy wlasne vs zlecone wykonawcy',
    category: 'management',
    stageKey: null,
    sortOrder: 10,
  },
];

export function getDecisionTemplates(): readonly DecisionTemplate[] {
  return DEFAULT_DECISION_TEMPLATES;
}
