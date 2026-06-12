// Wspólne klucze: pasek zakładek + ogólne etykiety używane w wielu miejscach.
const pl = {
  // Tab bar
  'tabs.start': 'Start',
  'tabs.explore': 'Odkryj',
  'tabs.projects': 'Projekty',
  'tabs.settings': 'Ustawienia',

  // Generic
  'common.loading': 'Przygotowuję dane...',
  'common.ok': 'OK',
  'common.cancel': 'Anuluj',
  'common.understood': 'Rozumiem',
  'common.error': 'Błąd',
  'common.done': 'Gotowe',
  'common.save': 'Zapisz',
  'common.delete': 'Usuń',
  'common.edit': 'Edytuj',
  'common.add': 'Dodaj',
  'common.close': 'Zamknij',
  'common.back': 'Wstecz',
  'common.next': 'Dalej',
  'common.continue': 'Kontynuuj',
  'common.retry': 'Spróbuj ponownie',
  'common.confirm': 'Potwierdź',
  'common.yes': 'Tak',
  'common.no': 'Nie',
  'common.search': 'Szukaj',
  'common.all': 'Wszystkie',
  'common.none': 'Brak',
  'common.loadingShort': 'Ładowanie...',
} as const;

type K = keyof typeof pl;

const en: Record<K, string> = {
  // Tab bar
  'tabs.start': 'Home',
  'tabs.explore': 'Explore',
  'tabs.projects': 'Projects',
  'tabs.settings': 'Settings',

  // Generic
  'common.loading': 'Preparing data...',
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.understood': 'Got it',
  'common.error': 'Error',
  'common.done': 'Done',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.continue': 'Continue',
  'common.retry': 'Try again',
  'common.confirm': 'Confirm',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.search': 'Search',
  'common.all': 'All',
  'common.none': 'None',
  'common.loadingShort': 'Loading...',
};

export const common = { pl, en };
