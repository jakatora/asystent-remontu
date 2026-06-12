// ─── i18n — scalony słownik ───────────────────────────────────────────────────
// Każdy moduł trzyma własny plik (common.ts, settings.ts, ...) z parą { pl, en }.
// Tutaj wszystko jest scalane w jeden słownik i typowane.

import { common } from './common';
import { settings } from './settings';
import { onboarding } from './onboarding';
import { wizard } from './wizard';
import { home } from './home';
import { explore } from './explore';
import { projects } from './projects';
import { misc } from './misc';
import { contractor } from './contractor';
import { houseBuildA } from './house-build-a';
import { houseBuildB } from './house-build-b';
import { projectScreens } from './project';
import { components } from './components';

export type Language = 'pl' | 'en';

// English is hidden for now — Polish only. Re-add { code: 'en', ... } here to expose it again.
export const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski' },
];

const pl = {
  ...common.pl,
  ...settings.pl,
  ...onboarding.pl,
  ...wizard.pl,
  ...home.pl,
  ...explore.pl,
  ...projects.pl,
  ...misc.pl,
  ...contractor.pl,
  ...houseBuildA.pl,
  ...houseBuildB.pl,
  ...projectScreens.pl,
  ...components.pl,
};

const en = {
  ...common.en,
  ...settings.en,
  ...onboarding.en,
  ...wizard.en,
  ...home.en,
  ...explore.en,
  ...projects.en,
  ...misc.en,
  ...contractor.en,
  ...houseBuildA.en,
  ...houseBuildB.en,
  ...projectScreens.en,
  ...components.en,
};

export type TranslationKey = keyof typeof pl;

export const translations: Record<Language, Record<TranslationKey, string>> = {
  pl,
  en,
};
