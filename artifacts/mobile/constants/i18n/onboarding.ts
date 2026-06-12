// Ekran onboardingu (app/onboarding.tsx).
const pl = {
  'onboarding.skip': 'Pomiń',
  'onboarding.next': 'Dalej',
  'onboarding.start': 'Zacznij korzystać',

  'onboarding.slide1.title': 'Witaj w Remont Asystent',
  'onboarding.slide1.description':
    'Twój przewodnik po remontach.\nProwadzimy Cię krok po kroku — nawet jeśli nigdy nie robiłeś remontu.',
  'onboarding.slide2.title': 'Precyzyjne obliczenia',
  'onboarding.slide2.description':
    'Podaj wymiary pokoju — my obliczymy ile farby, paneli czy kleju potrzebujesz. Zero zgadywania, zero marnowania.',
  'onboarding.slide3.title': 'Gotowa lista zakupów',
  'onboarding.slide3.description':
    'Lista zakupów z cenami i ilościami. Odhaczaj produkty w sklepie — niczego nie zapomnisz.',
  'onboarding.slide4.title': 'Bezpieczeństwo',
  'onboarding.slide4.description':
    'Wyraźnie pokażemy co możesz zrobić sam, a kiedy lepiej wezwać fachowca. Twoje bezpieczeństwo jest najważniejsze.',
} as const;

type K = keyof typeof pl;

const en: Record<K, string> = {
  'onboarding.skip': 'Skip',
  'onboarding.next': 'Next',
  'onboarding.start': 'Get started',

  'onboarding.slide1.title': 'Welcome to Remont Asystent',
  'onboarding.slide1.description':
    'Your renovation guide.\nWe walk you through step by step — even if you have never renovated anything before.',
  'onboarding.slide2.title': 'Precise calculations',
  'onboarding.slide2.description':
    'Enter your room dimensions — we calculate how much paint, panels or adhesive you need. No guessing, no waste.',
  'onboarding.slide3.title': 'Ready-made shopping list',
  'onboarding.slide3.description':
    'A shopping list with prices and quantities. Check off products in the store — you won\'t forget a thing.',
  'onboarding.slide4.title': 'Safety',
  'onboarding.slide4.description':
    'We clearly show what you can do yourself and when it\'s better to call a professional. Your safety comes first.',
};

export const onboarding = { pl, en };
