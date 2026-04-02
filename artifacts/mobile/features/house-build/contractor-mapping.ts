export interface StageContractorMapping {
  readonly stageKey: string;
  readonly specialties: readonly string[];
  readonly label: string;
}

export const STAGE_CONTRACTOR_MAPPINGS: readonly StageContractorMapping[] = [
  {
    stageKey: 'site-preparation',
    specialties: ['earthworks', 'geodesy'],
    label: 'Prace ziemne / geodezja',
  },
  {
    stageKey: 'foundation',
    specialties: ['structural', 'foundation', 'waterproofing'],
    label: 'Fundamenty i hydroizolacja',
  },
  {
    stageKey: 'structural-walls',
    specialties: ['masonry', 'structural'],
    label: 'Roboty murowe / konstrukcyjne',
  },
  {
    stageKey: 'roof',
    specialties: ['roofing'],
    label: 'Dekarstwo',
  },
  {
    stageKey: 'windows-doors',
    specialties: ['window-installation', 'door-installation'],
    label: 'Montaz okien i drzwi',
  },
  {
    stageKey: 'installations',
    specialties: ['electrician', 'plumber', 'heating', 'ventilation', 'gas'],
    label: 'Elektryk / hydraulik / ogrzewanie / wentylacja',
  },
  {
    stageKey: 'insulation-energy',
    specialties: ['insulation', 'energy-audit'],
    label: 'Izolacja i audyt energetyczny',
  },
  {
    stageKey: 'exterior-finishing',
    specialties: ['facade', 'insulation-team'],
    label: 'Elewacja i docieplenie',
  },
  {
    stageKey: 'interior-finishing',
    specialties: ['finishing', 'tiling', 'painting', 'flooring'],
    label: 'Wykonczenie wnetrz',
  },
  {
    stageKey: 'landscaping',
    specialties: ['landscaping', 'fencing'],
    label: 'Zagospodarowanie terenu',
  },
];

export function getContractorMappingForStage(stageKey: string): StageContractorMapping | undefined {
  return STAGE_CONTRACTOR_MAPPINGS.find((m) => m.stageKey === stageKey);
}
