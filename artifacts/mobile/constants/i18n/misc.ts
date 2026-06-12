// Pozostałe ekrany root: app/+not-found.tsx, app/hire-pro.tsx.
const pl = {
  // +not-found.tsx
  'notFound.title': 'Nie znaleziono',
  'notFound.heading': 'Ta strona nie istnieje.',
  'notFound.link': 'Wróć do strony głównej',

  // hire-pro.tsx
  'hirePro.title': 'Zatrudnij fachowca',
  'hirePro.headerBack': 'Wróć',
  'hirePro.warningTitle': 'Ta praca wymaga fachowca',

  'hirePro.tip1.title': 'Jak znaleźć dobrego fachowca?',
  'hirePro.tip1.item1': 'Poproś znajomych i rodzinę o polecenie',
  'hirePro.tip1.item2': 'Sprawdź opinie w internecie (Google, Oferto)',
  'hirePro.tip1.item3': 'Zadzwoń do kilku firm i porównaj oferty',
  'hirePro.tip1.item4': 'Poproś o referencje od poprzednich klientów',

  'hirePro.tip2.title': 'Co sprawdzić przed zatrudnieniem?',
  'hirePro.tip2.item1': 'Poproś o pisemną wycenę z wyszczególnionymi kosztami',
  'hirePro.tip2.item2': 'Sprawdź uprawnienia (elektryka, gaz — wymagane prawem)',
  'hirePro.tip2.item3': 'Sprawdź wpis do działalności (CEIDG)',
  'hirePro.tip2.item4': 'Omów termin rozpoczęcia i zakończenia prac',
  'hirePro.tip2.item5': 'Zapytaj o gwarancję na wykonane prace',

  'hirePro.tip3.title': 'Podpisz umowę!',
  'hirePro.tip3.item1': 'Umowa powinna zawierać: zakres prac, termin, cenę',
  'hirePro.tip3.item2': 'Nie płać całości z góry — max 30% zaliczki',
  'hirePro.tip3.item3': 'Resztę płać po odbiorze i sprawdzeniu jakości',
  'hirePro.tip3.item4': 'Żądaj faktury lub rachunku',

  'hirePro.emergency.title': 'Nagłe przypadki',
  'hirePro.emergency.subtitle': 'Awaria gazu, zalanie, brak prądu',

  'hirePro.findCta': 'Znajdź fachowca w aplikacji',
  'hirePro.backCta': 'Wróć do projektu',
} as const;

type K = keyof typeof pl;

const en: Record<K, string> = {
  'notFound.title': 'Not found',
  'notFound.heading': 'This page does not exist.',
  'notFound.link': 'Go back to the home screen',

  'hirePro.title': 'Hire a professional',
  'hirePro.headerBack': 'Back',
  'hirePro.warningTitle': 'This job needs a professional',

  'hirePro.tip1.title': 'How to find a good professional?',
  'hirePro.tip1.item1': 'Ask friends and family for recommendations',
  'hirePro.tip1.item2': 'Check reviews online (Google, Oferto)',
  'hirePro.tip1.item3': 'Call a few companies and compare quotes',
  'hirePro.tip1.item4': 'Ask for references from previous clients',

  'hirePro.tip2.title': 'What to check before hiring?',
  'hirePro.tip2.item1': 'Ask for a written quote with itemised costs',
  'hirePro.tip2.item2': 'Check qualifications (electrical, gas — required by law)',
  'hirePro.tip2.item3': 'Check their business registration (CEIDG)',
  'hirePro.tip2.item4': 'Agree on the start and finish dates',
  'hirePro.tip2.item5': 'Ask about a warranty on the completed work',

  'hirePro.tip3.title': 'Sign a contract!',
  'hirePro.tip3.item1': 'The contract should include: scope of work, deadline, price',
  'hirePro.tip3.item2': "Don't pay the full amount upfront — max 30% deposit",
  'hirePro.tip3.item3': 'Pay the rest after handover and a quality check',
  'hirePro.tip3.item4': 'Demand an invoice or receipt',

  'hirePro.emergency.title': 'Emergencies',
  'hirePro.emergency.subtitle': 'Gas failure, flooding, power outage',

  'hirePro.findCta': 'Find a professional in the app',
  'hirePro.backCta': 'Back to the project',
};

export const misc = { pl, en };
