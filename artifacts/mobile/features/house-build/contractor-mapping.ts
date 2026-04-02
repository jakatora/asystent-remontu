import type {
  StageContractorMappingExtended,
  ContractorHiringQuestion,
  StageProfessionalGuidance,
  StageRequestPreset,
  ContractorSpecialtyAlias,
} from '@/types/house-build';

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

const STAGE_SPECIALTY_ALIASES: Record<string, readonly ContractorSpecialtyAlias[]> = {
  'site-preparation': [
    { specialtyKey: 'earthworks', label: 'Prace ziemne i niwelacja', categoryIds: [] },
    { specialtyKey: 'geodesy', label: 'Geodeta / specjalista geodezyjny', categoryIds: [] },
  ],
  'foundation': [
    { specialtyKey: 'structural', label: 'Roboty konstrukcyjne', categoryIds: [] },
    { specialtyKey: 'foundation', label: 'Fundamenty', categoryIds: [] },
    { specialtyKey: 'waterproofing', label: 'Hydroizolacja', categoryIds: ['waterproofing'] },
  ],
  'structural-walls': [
    { specialtyKey: 'masonry', label: 'Murarstwo', categoryIds: [] },
    { specialtyKey: 'structural', label: 'Roboty konstrukcyjne', categoryIds: [] },
  ],
  'roof': [
    { specialtyKey: 'roofing', label: 'Dekarz / ciesla', categoryIds: [] },
  ],
  'windows-doors': [
    { specialtyKey: 'window-installation', label: 'Montaz okien', categoryIds: ['windows'] },
    { specialtyKey: 'door-installation', label: 'Montaz drzwi', categoryIds: ['doors'] },
  ],
  'installations': [
    { specialtyKey: 'electrician', label: 'Elektryk', categoryIds: [] },
    { specialtyKey: 'plumber', label: 'Hydraulik', categoryIds: [] },
    { specialtyKey: 'heating', label: 'Instalator CO', categoryIds: [] },
    { specialtyKey: 'ventilation', label: 'Wentylacja', categoryIds: [] },
    { specialtyKey: 'gas', label: 'Instalator gazu', categoryIds: [] },
  ],
  'insulation-energy': [
    { specialtyKey: 'insulation', label: 'Izolacja termiczna', categoryIds: [] },
    { specialtyKey: 'energy-audit', label: 'Audyt energetyczny', categoryIds: [] },
  ],
  'exterior-finishing': [
    { specialtyKey: 'facade', label: 'Elewacja', categoryIds: [] },
    { specialtyKey: 'insulation-team', label: 'Docieplenie', categoryIds: [] },
  ],
  'interior-finishing': [
    { specialtyKey: 'finishing', label: 'Prace wykonczeniowe', categoryIds: ['paint', 'skim-coat', 'wall-repair'] },
    { specialtyKey: 'tiling', label: 'Glazurnictwo', categoryIds: ['wall-tiles', 'floor-tiles'] },
    { specialtyKey: 'painting', label: 'Malowanie', categoryIds: ['paint'] },
    { specialtyKey: 'flooring', label: 'Podlogi', categoryIds: ['laminate', 'vinyl', 'floor-prep'] },
  ],
  'landscaping': [
    { specialtyKey: 'landscaping', label: 'Zagospodarowanie terenu', categoryIds: [] },
    { specialtyKey: 'fencing', label: 'Ogrodzenia', categoryIds: [] },
  ],
};

const STAGE_REQUEST_PRESETS: Record<string, StageRequestPreset> = {
  'site-preparation': {
    stageKey: 'site-preparation',
    templateText: 'Szukam wykonawcy prac ziemnych / geodety do przygotowania terenu pod budowe domu jednorodzinnego. Chce omowic zakres, harmonogram i gotowoscie do nastepnego etapu.',
    workCategory: 'Przygotowanie terenu',
    summaryPrefix: 'Przygotowanie terenu — budowa domu',
  },
  'foundation': {
    stageKey: 'foundation',
    templateText: 'Szukam wykonawcy robot fundamentowych do budowy domu jednorodzinnego. Chce omowic zakres, harmonogram, koordynacje hydroizolacji i gotowoscie do nastepnego etapu.',
    workCategory: 'Fundamenty',
    summaryPrefix: 'Fundamenty — budowa domu',
  },
  'structural-walls': {
    stageKey: 'structural-walls',
    templateText: 'Szukam ekipy do robot murowych / konstrukcyjnych przy budowie domu jednorodzinnego. Chce potwierdzic znajomosc systemu budowlanego, harmonogram i gotowoscie do przekazania nastepnego etapu.',
    workCategory: 'Sciany konstrukcyjne',
    summaryPrefix: 'Sciany konstrukcyjne — budowa domu',
  },
  'roof': {
    stageKey: 'roof',
    templateText: 'Szukam dekarza / ciesli do budowy domu jednorodzinnego. Chce omowic zakres konstrukcji i pokrycia dachu, harmonogram oraz kluczowe detale systemowe.',
    workCategory: 'Dach',
    summaryPrefix: 'Dach — budowa domu',
  },
  'windows-doors': {
    stageKey: 'windows-doors',
    templateText: 'Szukam firmy do montazu okien i drzwi zewnetrznych w budowanym domu jednorodzinnym. Interesuje mnie zakres, termin i gwarancja montazu.',
    workCategory: 'Okna i drzwi',
    summaryPrefix: 'Okna i drzwi — budowa domu',
  },
  'installations': {
    stageKey: 'installations',
    templateText: 'Szukam instalatora / wykonawcy instalacji wewnetrznych (elektryka, hydrauliki, ogrzewania, wentylacji) w budowanym domu jednorodzinnym. Chce omowic zakres, koordynacje tras i harmonogram.',
    workCategory: 'Instalacje wewnetrzne',
    summaryPrefix: 'Instalacje — budowa domu',
  },
  'insulation-energy': {
    stageKey: 'insulation-energy',
    templateText: 'Szukam wykonawcy izolacji termicznej i/lub audytu energetycznego do budowy domu jednorodzinnego. Interesuje mnie zakres, dobor materialow i harmonogram.',
    workCategory: 'Izolacja',
    summaryPrefix: 'Izolacja — budowa domu',
  },
  'exterior-finishing': {
    stageKey: 'exterior-finishing',
    templateText: 'Szukam ekipy do elewacji i docieplenia budowanego domu jednorodzinnego. Chce omowic zakres, system, harmonogram i gwarancje.',
    workCategory: 'Elewacja',
    summaryPrefix: 'Elewacja — budowa domu',
  },
  'interior-finishing': {
    stageKey: 'interior-finishing',
    templateText: 'Szukam ekipy wykonczeniowej do budowanego domu jednorodzinnego. Interesuje mnie zakres prac (gladzic, malowanie, plytki, podlogi), harmonogram i koordynacja.',
    workCategory: 'Wykonczenie wnetrz',
    summaryPrefix: 'Wykonczenie wnetrz — budowa domu',
  },
  'landscaping': {
    stageKey: 'landscaping',
    templateText: 'Szukam wykonawcy do zagospodarowania terenu przy budowanym domu jednorodzinnym. Interesuje mnie zakres (ogrodzenie, nawierzchnia, zieleni), harmonogram i wycena.',
    workCategory: 'Zagospodarowanie terenu',
    summaryPrefix: 'Teren — budowa domu',
  },
};

export const CONTRACTOR_HIRING_QUESTIONS: readonly ContractorHiringQuestion[] = [
  { stageKey: '*', question: 'Czy mial Pan/Pani doswiadczenie z tym typem domu / systemu?', priority: 'high' },
  { stageKey: '*', question: 'Co dokladnie wchodzi w zakres Panstwa pracy?', priority: 'high' },
  { stageKey: '*', question: 'Co NIE jest wliczone w zakres?', priority: 'high' },
  { stageKey: '*', question: 'Kiedy mozna rozpoczac prace?', priority: 'normal' },
  { stageKey: '*', question: 'Ile orientacyjnie potrwa ten etap?', priority: 'normal' },
  { stageKey: '*', question: 'Kto koordynuje przekazanie do nastepnego etapu?', priority: 'normal' },
  { stageKey: '*', question: 'Czy materialy sa wliczone w cene, czy po stronie inwestora?', priority: 'high' },
  { stageKey: '*', question: 'Czego potrzebujecie od inwestora przed rozpoczeciem prac?', priority: 'normal' },
  { stageKey: 'foundation', question: 'Jaki system hydroizolacji Pan/Pani stosuje?', priority: 'high' },
  { stageKey: 'foundation', question: 'Czy sprawdzili Panstwo warunki gruntowo-wodne na dzialce?', priority: 'high' },
  { stageKey: 'structural-walls', question: 'Z jakim systemem murowym majecie Panstwo najwiecej doswiadczenia?', priority: 'high' },
  { stageKey: 'roof', question: 'Czy wykonujecie Panstwo zarowno konstrukcje, jak i pokrycie dachu?', priority: 'high' },
  { stageKey: 'roof', question: 'Jak zabezpieczacie budynek przed opadami w trakcie prac?', priority: 'normal' },
  { stageKey: 'installations', question: 'Czy koordynujecie Panstwo trasy z innymi instalatorami?', priority: 'high' },
  { stageKey: 'installations', question: 'Czy wykonujecie protokoly i pomiary po zakonczeniu?', priority: 'normal' },
  { stageKey: 'insulation-energy', question: 'Jaki system izolacji rekomendujecie dla tego typu budynku?', priority: 'high' },
  { stageKey: 'exterior-finishing', question: 'Czy udzielacie gwarancji na elewacje? Na ile lat?', priority: 'high' },
  { stageKey: 'interior-finishing', question: 'Czy wykonujecie prace kompleksowo czy tylko wybrany zakres?', priority: 'normal' },
];

export function getHiringQuestionsForStage(stageKey: string): ContractorHiringQuestion[] {
  return CONTRACTOR_HIRING_QUESTIONS.filter(
    (q) => q.stageKey === '*' || q.stageKey === stageKey
  );
}

const STAGE_PROFESSIONAL_GUIDANCE: Record<string, StageProfessionalGuidance> = {
  'site-preparation': {
    stageKey: 'site-preparation',
    commonRoles: ['Geodeta', 'Operator koparki', 'Kierownik budowy'],
    whenToStartLooking: 'Po uzyskaniu pozwolenia na budowe, 2-4 tygodnie przed planowanym rozpoczeciem.',
    whenToCollectOffers: 'Minimum 2 oferty, najlepiej z rekomendacji.',
    whatToConfirm: 'Dostep do dzialki, termin rozpoczecia, zakres niwelacji.',
  },
  'foundation': {
    stageKey: 'foundation',
    commonRoles: ['Ekipa fundamentowa', 'Specjalista hydroizolacji', 'Kierownik budowy'],
    whenToStartLooking: 'Zaraz po zakonczeniu przygotowania terenu.',
    whenToCollectOffers: '2-3 oferty, porownaj zakres i system hydroizolacji.',
    whatToConfirm: 'Warunki gruntowe, system fundamentow z projektu, dostep do wody/pradu na budowie.',
  },
  'structural-walls': {
    stageKey: 'structural-walls',
    commonRoles: ['Ekipa murarska', 'Kierownik budowy', 'Inzynier konstruktor'],
    whenToStartLooking: 'Na etapie fundamentow — ekipy murarskie maja dlugie terminy.',
    whenToCollectOffers: '2-3 oferty, sprawdz doswiadczenie z wybranym systemem.',
    whatToConfirm: 'System murowy z projektu, tolerancje wykonania, nadproza i wience.',
  },
  'roof': {
    stageKey: 'roof',
    commonRoles: ['Dekarz', 'Ciesla', 'Kierownik budowy'],
    whenToStartLooking: 'Na etapie scian konstrukcyjnych.',
    whenToCollectOffers: '2-3 oferty — konstrukcja i pokrycie moga byc osobno lub lacznie.',
    whatToConfirm: 'System warstw dachowych, termin, zabezpieczenie budynku podczas prac.',
  },
  'windows-doors': {
    stageKey: 'windows-doors',
    commonRoles: ['Firma okienna', 'Monter drzwi'],
    whenToStartLooking: 'Na etapie dachu — zamowienie okien trwa 4-8 tygodni.',
    whenToCollectOffers: '2-3 oferty od producentow, sprawdz parametry termiczne.',
    whatToConfirm: 'Parametry Uw, system montazu (cieplego), gwarancja.',
  },
  'installations': {
    stageKey: 'installations',
    commonRoles: ['Elektryk', 'Hydraulik', 'Instalator CO', 'Wentylacja', 'Instalator gazu'],
    whenToStartLooking: 'Na etapie stanu surowego zamknietego.',
    whenToCollectOffers: 'Osobne oferty na kazda instalacje lub od generalnego instalatora.',
    whatToConfirm: 'Koordynacja tras miedzy instalacjami, protokoly, pozwolenia UDT jesli potrzeba.',
  },
  'insulation-energy': {
    stageKey: 'insulation-energy',
    commonRoles: ['Ekipa ociepleniowa', 'Audytor energetyczny'],
    whenToStartLooking: 'Po zamknieciu stanu surowego.',
    whenToCollectOffers: '2-3 oferty, porownaj system i grubosc izolacji.',
    whatToConfirm: 'Czy system spelnia wymagania WT 2021, jak rozwiazane sa mostki termiczne.',
  },
  'exterior-finishing': {
    stageKey: 'exterior-finishing',
    commonRoles: ['Elewacjonista', 'Tynkarz'],
    whenToStartLooking: 'Po zakonczeniu izolacji i instalacji zewnetrznych.',
    whenToCollectOffers: '2-3 oferty, sprawdz referencje i gwarancje.',
    whatToConfirm: 'System tynkarski, kolor, detale architektoniczne, termin.',
  },
  'interior-finishing': {
    stageKey: 'interior-finishing',
    commonRoles: ['Ekipa wykonczeniowa', 'Glazurnik', 'Malarz', 'Podlogowiec'],
    whenToStartLooking: 'Po zakonczeniu instalacji, minimum 4-6 tygodni na schniecie.',
    whenToCollectOffers: 'Mozna zatrudnic kompleksowo lub czesciami.',
    whatToConfirm: 'Kolejnosc prac, koordynacja z innymi ekipami, materialy.',
  },
  'landscaping': {
    stageKey: 'landscaping',
    commonRoles: ['Brukarze', 'Ogrodnicy', 'Firma ogrodzeniowa'],
    whenToStartLooking: 'Po zakonczeniu elewacji i przelaczenia mediow.',
    whenToCollectOffers: '2-3 oferty na ogrodzenie, nawierzchnie i zieleni.',
    whatToConfirm: 'Trasy mediow podziemnych, typ gruntu, uzbrojenie terenu.',
  },
};

export function getRequestPresetForStage(stageKey: string): StageRequestPreset | undefined {
  return STAGE_REQUEST_PRESETS[stageKey];
}

export function getProfessionalGuidanceForStage(stageKey: string): StageProfessionalGuidance | undefined {
  return STAGE_PROFESSIONAL_GUIDANCE[stageKey];
}

export function getExtendedMappingForStage(stageKey: string): StageContractorMappingExtended | undefined {
  const basic = getContractorMappingForStage(stageKey);
  if (!basic) return undefined;
  const preset = STAGE_REQUEST_PRESETS[stageKey];
  if (!preset) return undefined;
  const guidance = STAGE_PROFESSIONAL_GUIDANCE[stageKey];
  if (!guidance) return undefined;
  return {
    stageKey: basic.stageKey,
    specialties: basic.specialties,
    label: basic.label,
    aliases: STAGE_SPECIALTY_ALIASES[stageKey] ?? [],
    requestPreset: preset,
    hiringQuestions: getHiringQuestionsForStage(stageKey),
    professionalGuidance: guidance,
  };
}

export function getAllExtendedMappings(): StageContractorMappingExtended[] {
  return STAGE_CONTRACTOR_MAPPINGS
    .map((m) => getExtendedMappingForStage(m.stageKey))
    .filter((m): m is StageContractorMappingExtended => !!m);
}
