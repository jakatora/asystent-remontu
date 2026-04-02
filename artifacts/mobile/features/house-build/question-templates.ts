import type { ProfessionalRole } from '@/types/house-build';

export interface QuestionTemplate {
  readonly questionText: string;
  readonly stageKey: string;
  readonly targetRole: ProfessionalRole | string;
  readonly priority: 'low' | 'normal' | 'high' | 'urgent';
}

export const QUESTION_TEMPLATES: readonly QuestionTemplate[] = [
  {
    questionText: 'Jaki system hydroizolacji jest zaplanowany i dlaczego?',
    stageKey: 'foundation',
    targetRole: 'structural-engineer',
    priority: 'high',
  },
  {
    questionText: 'Jakie warunki gruntowe najbardziej wplywaja na ten etap?',
    stageKey: 'foundation',
    targetRole: 'structural-engineer',
    priority: 'normal',
  },
  {
    questionText: 'Czy poziom wod gruntowych wymaga dodatkowych zabezpieczen?',
    stageKey: 'foundation',
    targetRole: 'structural-engineer',
    priority: 'high',
  },
  {
    questionText: 'Jaki system scian zostal wybrany i jakie sa kluczowe tolerancje wykonania?',
    stageKey: 'structural-walls',
    targetRole: 'general-contractor',
    priority: 'high',
  },
  {
    questionText: 'Czy sa wymagane dodatkowe wzmocnienia konstrukcyjne (nadproza, wience)?',
    stageKey: 'structural-walls',
    targetRole: 'structural-engineer',
    priority: 'normal',
  },
  {
    questionText: 'Jaki system warstw dachowych jest zaplanowany i jakie detale sa krytyczne?',
    stageKey: 'roof',
    targetRole: 'roofer',
    priority: 'high',
  },
  {
    questionText: 'Jak zabezpieczony jest budynek przed opadami w trakcie prac dachowych?',
    stageKey: 'roof',
    targetRole: 'roofer',
    priority: 'normal',
  },
  {
    questionText: 'Czy sa konflikty miedzy trasami instalacji elektrycznych, wodnych, grzewczych i wentylacyjnych?',
    stageKey: 'installations',
    targetRole: 'electrician',
    priority: 'high',
  },
  {
    questionText: 'Gdzie zaplanowane sa rozdzielnice i punkty przylaczy?',
    stageKey: 'installations',
    targetRole: 'electrician',
    priority: 'normal',
  },
  {
    questionText: 'Jaki system ogrzewania podlogowego jest wybrany i jak wplywa na wylewki?',
    stageKey: 'installations',
    targetRole: 'plumber',
    priority: 'normal',
  },
  {
    questionText: 'Jak wybrany system ogrzewania i wentylacji wplywa na wynik energetyczny budynku?',
    stageKey: 'insulation-energy',
    targetRole: 'energy-auditor',
    priority: 'high',
  },
  {
    questionText: 'Czy grubosci izolacji sa wystarczajace do spelnienia wymagan WT 2024?',
    stageKey: 'insulation-energy',
    targetRole: 'energy-auditor',
    priority: 'high',
  },
  {
    questionText: 'Jaki standard okien jest wybrany (Uw) i czy jest zgodny ze strategia energetyczna?',
    stageKey: 'windows-doors',
    targetRole: 'architect',
    priority: 'normal',
  },
  {
    questionText: 'Czy montaz okien bedzie w warstwie izolacji czy w murze?',
    stageKey: 'windows-doors',
    targetRole: 'general-contractor',
    priority: 'normal',
  },
  {
    questionText: 'Jaki system elewacji jest zaplanowany i jak lacza sie warstwy?',
    stageKey: 'exterior-finishing',
    targetRole: 'general-contractor',
    priority: 'normal',
  },
  {
    questionText: 'Jakie dokumenty sa jeszcze potrzebne przed zlozeniem zawiadomienia o zakonczeniu budowy?',
    stageKey: 'final-inspections',
    targetRole: 'building-inspector',
    priority: 'urgent',
  },
  {
    questionText: 'Czy inwentaryzacja geodezyjna powykonawcza jest juz wykonana?',
    stageKey: 'final-inspections',
    targetRole: 'geodesist',
    priority: 'high',
  },
  {
    questionText: 'Czy projekt architektoniczny uwzglednia wszystkie wymagania MPZP/WZ?',
    stageKey: 'design-and-permits',
    targetRole: 'architect',
    priority: 'high',
  },
];

export function getTemplatesForStage(stageKey: string): readonly QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter((t) => t.stageKey === stageKey);
}

export function getTemplatesForRole(role: string): readonly QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter((t) => t.targetRole === role);
}
