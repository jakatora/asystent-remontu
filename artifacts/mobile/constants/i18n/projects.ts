// Ekran listy projektów (app/(tabs)/projects.tsx).
const pl = {
  'projectsList.title': 'Twoje projekty',

  'projectsList.filter.all': 'Wszystkie',
  'projectsList.filter.planning': 'Planowanie',
  'projectsList.filter.inProgress': 'W trakcie',
  'projectsList.filter.completed': 'Ukończone',
  'projectsList.filterA11y': 'Filtruj: {label}',

  'projectsList.projectWord.one': 'projekt',
  'projectsList.projectWord.few': 'projekty',
  'projectsList.projectWord.many': 'projektów',

  'projectsList.empty.title': 'Brak projektów',
  'projectsList.empty.titleFiltered': 'Brak projektów w tej kategorii',
  'projectsList.empty.description': 'Zacznij od nowego projektu remontu',
  'projectsList.empty.action': 'Utwórz pierwszy projekt',
} as const;

type K = keyof typeof pl;

const en: Record<K, string> = {
  'projectsList.title': 'Your projects',

  'projectsList.filter.all': 'All',
  'projectsList.filter.planning': 'Planning',
  'projectsList.filter.inProgress': 'In progress',
  'projectsList.filter.completed': 'Completed',
  'projectsList.filterA11y': 'Filter: {label}',

  'projectsList.projectWord.one': 'project',
  'projectsList.projectWord.few': 'projects',
  'projectsList.projectWord.many': 'projects',

  'projectsList.empty.title': 'No projects',
  'projectsList.empty.titleFiltered': 'No projects in this category',
  'projectsList.empty.description': 'Start with a new renovation project',
  'projectsList.empty.action': 'Create your first project',
};

export const projects = { pl, en };
