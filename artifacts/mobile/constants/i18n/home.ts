// Ekran startowy (app/(tabs)/index.tsx).
const pl = {
  'home.subtitle': 'Czym dziś się zajmiemy?',
  'home.newProjectA11y': 'Nowy projekt',

  'home.stat.projects': 'Projekty',
  'home.stat.inProgress': 'W trakcie',
  'home.stat.completed': 'Ukończone',

  'home.continue.label': 'Kontynuuj: {name}',
  'home.continue.a11y': 'Kontynuuj projekt {name}',

  'home.quickStart.title': 'Nowy projekt remontu',
  'home.quickStart.subtitle': 'Wybierz rodzaj pracy i zacznij',
  'home.quickStart.a11y': 'Rozpocznij nowy projekt remontu',

  'home.section.recentActivity': 'Ostatnia aktywność',
  'home.activity.a11y': '{description}',
  'home.activity.a11yWithProject': '{description}, projekt {project}',

  'home.section.yourProjects': 'Twoje projekty',
  'home.yourProjects.all': 'Wszystkie',
  'home.empty.title': 'Brak projektów',
  'home.empty.description': 'Naciśnij + aby dodać pierwszy projekt remontu',

  'home.action.findPro': 'Znajdź fachowca',
  'home.action.myRequests': 'Moje zapytania',
  'home.action.iAmPro': 'Jestem fachowcem',
  'home.action.plans': 'Plany i Widoczność',
  'home.action.adminPlans': 'Admin planów',

  'home.houseBuild.title': 'Budowa domu',
  'home.houseBuild.subtitle': 'Asystent inwestora — od działki po odbiór',
  'home.houseBuild.a11y': 'Budowa domu — asystent inwestora',

  'home.section.workTypes': 'Rodzaje prac',
  'home.workTypes.all': 'Wszystkie',

  // Nowe (Phase 1.2b — home redesign)
  'home.hero.title': 'Wybierz rodzaj remontu',
  'home.hero.subtitle': 'Poznaj krok po kroku jak zrobić to samemu — albo znajdź sprawdzonego fachowca.',
  'home.section.browse': 'Przeglądaj remonty',
  'home.section.fastTools': 'Szybkie narzędzia',
} as const;

type K = keyof typeof pl;

const en: Record<K, string> = {
  'home.subtitle': 'What shall we work on today?',
  'home.newProjectA11y': 'New project',

  'home.stat.projects': 'Projects',
  'home.stat.inProgress': 'In progress',
  'home.stat.completed': 'Completed',

  'home.continue.label': 'Continue: {name}',
  'home.continue.a11y': 'Continue project {name}',

  'home.quickStart.title': 'New renovation project',
  'home.quickStart.subtitle': 'Pick a type of work and get started',
  'home.quickStart.a11y': 'Start a new renovation project',

  'home.section.recentActivity': 'Recent activity',
  'home.activity.a11y': '{description}',
  'home.activity.a11yWithProject': '{description}, project {project}',

  'home.section.yourProjects': 'Your projects',
  'home.yourProjects.all': 'All',
  'home.empty.title': 'No projects',
  'home.empty.description': 'Tap + to add your first renovation project',

  'home.action.findPro': 'Find a professional',
  'home.action.myRequests': 'My requests',
  'home.action.iAmPro': "I'm a professional",
  'home.action.plans': 'Plans & visibility',
  'home.action.adminPlans': 'Admin plans',

  'home.houseBuild.title': 'House building',
  'home.houseBuild.subtitle': "Investor's assistant — from plot to handover",
  'home.houseBuild.a11y': "House building — investor's assistant",

  'home.section.workTypes': 'Types of work',
  'home.workTypes.all': 'All',

  'home.hero.title': 'Choose your renovation',
  'home.hero.subtitle': 'See step by step how to do it yourself — or find a trusted professional.',
  'home.section.browse': 'Browse renovations',
  'home.section.fastTools': 'Quick tools',
};

export const home = { pl, en };
