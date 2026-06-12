// Ekran "Odkryj" (app/(tabs)/explore.tsx).
const pl = {
  'exploreScreen.title': 'Odkryj prace remontowe',
  'exploreScreen.subtitle': 'Wybierz kategorię żeby zobaczyć szczegóły',
  'exploreScreen.searchPlaceholder': 'Szukaj rodzaju pracy...',
  'exploreScreen.searchA11y': 'Wyszukaj rodzaj pracy remontowej',
  'exploreScreen.clearSearchA11y': 'Wyczyść wyszukiwanie',
  'exploreScreen.empty.title': 'Brak wyników dla "{query}"',
  'exploreScreen.empty.description': 'Spróbuj innej frazy',
} as const;

type K = keyof typeof pl;

const en: Record<K, string> = {
  'exploreScreen.title': 'Explore renovation work',
  'exploreScreen.subtitle': 'Choose a category to see the details',
  'exploreScreen.searchPlaceholder': 'Search for a type of work...',
  'exploreScreen.searchA11y': 'Search for a type of renovation work',
  'exploreScreen.clearSearchA11y': 'Clear search',
  'exploreScreen.empty.title': 'No results for "{query}"',
  'exploreScreen.empty.description': 'Try a different phrase',
};

export const explore = { pl, en };
