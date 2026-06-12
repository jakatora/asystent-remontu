// Ekran ustawień (app/(tabs)/settings.tsx).
const pl = {
  'settings.title': 'Ustawienia',
  'settings.section.data': 'Dane',
  'settings.section.sync': 'Synchronizacja',
  'settings.section.app': 'Aplikacja',
  'settings.section.helpLegal': 'Pomoc i prawne',
  'settings.section.safety': 'Bezpieczeństwo',
  'settings.section.account': 'Konto',
  'settings.section.language': 'Język',

  'settings.language.title': 'Język aplikacji',
  'settings.language.subtitle': 'Wybierz język interfejsu',

  'settings.projects.title': 'Moje projekty',
  'settings.projects.subtitle': '{count} {word} w pamięci urządzenia',
  'settings.offline.title': 'Dane offline',
  'settings.offline.subtitle': 'Wszystkie dane są na Twoim urządzeniu',
  'settings.offline.badge': 'Aktywne',

  'settings.cloud.title': 'Synchronizacja z chmurą',
  'settings.cloud.connected': 'Połączone z Supabase',
  'settings.cloud.unavailable': 'Niedostępne — brak konfiguracji',
  'settings.account.title': 'Konto użytkownika',
  'settings.account.subtitle': 'Zaloguj się aby synchronizować projekty',

  'settings.about.title': 'O aplikacji',
  'settings.about.subtitle': 'Wersja {version}',
  'settings.help.title': 'Jak korzystać z aplikacji',
  'settings.help.subtitle': 'Przewodnik po funkcjach',
  'settings.errors.title': 'Raportowanie błędów',
  'settings.errors.on': 'Sentry aktywne',
  'settings.errors.off': 'Wyłączone',

  'settings.support.title': 'Pomoc i wsparcie',
  'settings.support.subtitle': 'FAQ, poradniki, kontakt',
  'settings.privacy.title': 'Polityka prywatności',
  'settings.privacy.subtitle': 'Jak chronimy Twoje dane',
  'settings.terms.title': 'Regulamin',
  'settings.terms.subtitle': 'Warunki korzystania z aplikacji',
  'settings.contact.title': 'Kontakt',

  'settings.safety.title': 'Zasady bezpieczeństwa',
  'settings.safety.subtitle': 'Ważne informacje przed pracami',

  'settings.delete.title': 'Usuń wszystkie dane',
  'settings.delete.subtitle': 'Wyczyść wszystkie projekty i dane aplikacji',
  'settings.delete.confirmTitle': 'Usuń dane',
  'settings.delete.confirmBody':
    'Czy na pewno chcesz usunąć wszystkie projekty i dane aplikacji? Tej operacji nie można cofnąć.',
  'settings.delete.confirmCta': 'Usuń dane',
  'settings.delete.successBody': 'Wszystkie dane zostały usunięte.',
  'settings.delete.errorBody': 'Nie udało się usunąć danych. Spróbuj ponownie.',

  'settings.footer': '{appName} v{version} · Dane offline',

  'settings.alert.about':
    'Wersja {version}\n\nTwój przewodnik po remontach. Prowadzi krok po kroku, oblicza materiały i pomaga zaplanować każdy remont.\n\nDane przechowywane lokalnie na urządzeniu.',
  'settings.alert.help':
    '1. Wybierz kategorię pracy z listy\n2. Podaj wymiary pomieszczenia\n3. Aplikacja obliczy potrzebne materiały\n4. Skorzystaj z listy zakupów\n5. Śledź postęp projektu',
  'settings.alert.safety':
    '⚠️ Przed każdą pracą:\n\n• Przy elektryce — zawsze wyłącz bezpiecznik\n• Przy hydraulice — zakręć wodę\n• Przy gazie lub nośnych ścianach — zadzwoń do fachowca\n• Używaj okularów i rękawic ochronnych\n• Czytaj instrukcje produktów',
  'settings.alert.openLinkError': 'Nie udało się otworzyć linku.',

  'settings.projectWord.one': 'projekt zapisany',
  'settings.projectWord.few': 'projekty zapisane',
  'settings.projectWord.many': 'projektów zapisanych',
} as const;

type K = keyof typeof pl;

const en: Record<K, string> = {
  'settings.title': 'Settings',
  'settings.section.data': 'Data',
  'settings.section.sync': 'Sync',
  'settings.section.app': 'App',
  'settings.section.helpLegal': 'Help & legal',
  'settings.section.safety': 'Safety',
  'settings.section.account': 'Account',
  'settings.section.language': 'Language',

  'settings.language.title': 'App language',
  'settings.language.subtitle': 'Choose the interface language',

  'settings.projects.title': 'My projects',
  'settings.projects.subtitle': '{count} {word} on this device',
  'settings.offline.title': 'Offline data',
  'settings.offline.subtitle': 'All your data stays on your device',
  'settings.offline.badge': 'Active',

  'settings.cloud.title': 'Cloud sync',
  'settings.cloud.connected': 'Connected to Supabase',
  'settings.cloud.unavailable': 'Unavailable — not configured',
  'settings.account.title': 'User account',
  'settings.account.subtitle': 'Sign in to sync your projects',

  'settings.about.title': 'About the app',
  'settings.about.subtitle': 'Version {version}',
  'settings.help.title': 'How to use the app',
  'settings.help.subtitle': 'Feature guide',
  'settings.errors.title': 'Error reporting',
  'settings.errors.on': 'Sentry active',
  'settings.errors.off': 'Disabled',

  'settings.support.title': 'Help & support',
  'settings.support.subtitle': 'FAQ, guides, contact',
  'settings.privacy.title': 'Privacy policy',
  'settings.privacy.subtitle': 'How we protect your data',
  'settings.terms.title': 'Terms of service',
  'settings.terms.subtitle': 'App usage terms',
  'settings.contact.title': 'Contact',

  'settings.safety.title': 'Safety rules',
  'settings.safety.subtitle': 'Important info before you start',

  'settings.delete.title': 'Delete all data',
  'settings.delete.subtitle': 'Clear all projects and app data',
  'settings.delete.confirmTitle': 'Delete data',
  'settings.delete.confirmBody':
    'Are you sure you want to delete all projects and app data? This action cannot be undone.',
  'settings.delete.confirmCta': 'Delete data',
  'settings.delete.successBody': 'All data has been deleted.',
  'settings.delete.errorBody': 'Could not delete data. Please try again.',

  'settings.footer': '{appName} v{version} · Offline data',

  'settings.alert.about':
    'Version {version}\n\nYour renovation guide. It walks you through step by step, calculates materials and helps you plan every renovation.\n\nData is stored locally on your device.',
  'settings.alert.help':
    '1. Pick a work category from the list\n2. Enter the room dimensions\n3. The app calculates the materials you need\n4. Use the shopping list\n5. Track your project progress',
  'settings.alert.safety':
    '⚠️ Before every job:\n\n• For electrical work — always switch off the breaker\n• For plumbing — shut off the water\n• For gas or load-bearing walls — call a professional\n• Use safety glasses and gloves\n• Read the product instructions',
  'settings.alert.openLinkError': 'Could not open the link.',

  'settings.projectWord.one': 'project saved',
  'settings.projectWord.few': 'projects saved',
  'settings.projectWord.many': 'projects saved',
};

export const settings = { pl, en };
