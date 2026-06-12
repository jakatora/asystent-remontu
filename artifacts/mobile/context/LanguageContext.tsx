import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  translations,
  type Language,
  type TranslationKey,
} from '@/constants/translations';

const STORAGE_KEY = 'app.language';
const DEFAULT_LANGUAGE: Language = 'pl';

type TranslateParams = Record<string, string | number>;

interface LanguageContextValue {
  readonly language: Language;
  readonly isReady: boolean;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match
  );
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        // English is currently hidden — if the user had it stored from a prior version,
        // fall back to Polish so the UI stays in the only language we ship.
        if (mounted && stored === 'pl') {
          setLanguageState('pl');
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams): string => {
      const table = translations[language] ?? translations[DEFAULT_LANGUAGE];
      const template = table[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;
      return interpolate(template, params);
    },
    [language]
  );

  const value: LanguageContextValue = {
    language,
    isReady,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
