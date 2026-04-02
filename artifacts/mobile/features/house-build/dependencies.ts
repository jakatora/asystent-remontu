import type { BuildStageKey } from './stages';

export interface StageDependency {
  readonly stageKey: BuildStageKey;
  readonly dependsOn: readonly BuildStageKey[];
  readonly softDependencies: readonly BuildStageKey[];
  readonly warningIfBefore: readonly { stage: BuildStageKey; message: string }[];
}

export const STAGE_DEPENDENCIES: readonly StageDependency[] = [
  {
    stageKey: 'land-purchase',
    dependsOn: [],
    softDependencies: [],
    warningIfBefore: [],
  },
  {
    stageKey: 'design-and-permits',
    dependsOn: ['land-purchase'],
    softDependencies: [],
    warningIfBefore: [],
  },
  {
    stageKey: 'site-preparation',
    dependsOn: ['design-and-permits'],
    softDependencies: ['land-purchase'],
    warningIfBefore: [],
  },
  {
    stageKey: 'foundation',
    dependsOn: ['site-preparation'],
    softDependencies: ['design-and-permits'],
    warningIfBefore: [],
  },
  {
    stageKey: 'structural-walls',
    dependsOn: ['foundation'],
    softDependencies: [],
    warningIfBefore: [],
  },
  {
    stageKey: 'roof',
    dependsOn: ['structural-walls'],
    softDependencies: [],
    warningIfBefore: [
      { stage: 'foundation', message: 'Dach nie powinien byc planowany przed zakonczeniem scian konstrukcyjnych.' },
    ],
  },
  {
    stageKey: 'windows-doors',
    dependsOn: ['structural-walls'],
    softDependencies: ['roof'],
    warningIfBefore: [
      { stage: 'structural-walls', message: 'Okna i drzwi wymagaja gotowych otworow w scianach.' },
      { stage: 'roof', message: 'Montaz okien zalecany po zamknieciu dachu.' },
    ],
  },
  {
    stageKey: 'installations',
    dependsOn: ['structural-walls'],
    softDependencies: ['roof', 'windows-doors'],
    warningIfBefore: [
      { stage: 'structural-walls', message: 'Instalacje wymagaja gotowej konstrukcji scian.' },
      { stage: 'site-preparation', message: 'Wnioski o przylacza mediow (prad, woda, gaz) powinny byc zlozone przed rozpoczeciem instalacji.' },
    ],
  },
  {
    stageKey: 'insulation-energy',
    dependsOn: ['structural-walls'],
    softDependencies: ['roof', 'windows-doors', 'installations'],
    warningIfBefore: [
      { stage: 'installations', message: 'Izolacja powinna byc planowana po trasach instalacji.' },
    ],
  },
  {
    stageKey: 'exterior-finishing',
    dependsOn: ['structural-walls'],
    softDependencies: ['insulation-energy', 'windows-doors'],
    warningIfBefore: [
      { stage: 'insulation-energy', message: 'Elewacja powinna byc wykonywana po zakonczeniu izolacji.' },
    ],
  },
  {
    stageKey: 'interior-finishing',
    dependsOn: ['installations'],
    softDependencies: ['insulation-energy', 'windows-doors'],
    warningIfBefore: [
      { stage: 'installations', message: 'Wykonczenie wnetrz nie powinno zaczynac sie przed odbiorem instalacji.' },
      { stage: 'windows-doors', message: 'Wykonczenie wymaga zamknietej bryly budynku (okna/drzwi).' },
    ],
  },
  {
    stageKey: 'landscaping',
    dependsOn: [],
    softDependencies: ['exterior-finishing'],
    warningIfBefore: [],
  },
  {
    stageKey: 'final-inspections',
    dependsOn: ['installations', 'interior-finishing'],
    softDependencies: ['exterior-finishing', 'landscaping'],
    warningIfBefore: [
      { stage: 'interior-finishing', message: 'Odbiory wymagaja zakonczenia prac wykonczeniowych.' },
      { stage: 'installations', message: 'Wszystkie przylacza mediow powinny byc podlaczone i odebrane przed odbiorem koncowym.' },
    ],
  },
];

export function getDependenciesForStage(stageKey: string): StageDependency | undefined {
  return STAGE_DEPENDENCIES.find((d) => d.stageKey === stageKey);
}

export function getBlockingStages(stageKey: string, completedStages: readonly string[]): string[] {
  const dep = getDependenciesForStage(stageKey);
  if (!dep) return [];
  return dep.dependsOn.filter((s) => !completedStages.includes(s));
}

export function getDependencyWarnings(stageKey: string, currentOrder: readonly string[]): string[] {
  const dep = getDependenciesForStage(stageKey);
  if (!dep) return [];
  const stageIdx = currentOrder.indexOf(stageKey);
  if (stageIdx === -1) return [];
  const warnings: string[] = [];
  for (const w of dep.warningIfBefore) {
    const depIdx = currentOrder.indexOf(w.stage);
    if (depIdx === -1 || depIdx > stageIdx) {
      warnings.push(w.message);
    }
  }
  return warnings;
}

export function isStageBlocked(stageKey: string, completedStages: readonly string[]): boolean {
  return getBlockingStages(stageKey, completedStages).length > 0;
}
