import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';
import { getDb } from '@/db/client';
import { useLanguage } from '@/context/LanguageContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';

export function ProjectLoadError({ onRetry, reload = false }: { onRetry: () => void; reload?: boolean }) {
  const { language } = useLanguage(), pl = language === 'pl';
  const hint = Platform.OS === 'web'
    ? pl ? 'Spróbuj ponownie. Jeśli aplikacja jest otwarta w innej karcie, wróć do niej i odśwież podgląd.' : 'Try again. If the app is open in another tab, return to it and refresh the view.'
    : pl ? 'Spróbuj ponownie. Jeśli problem się powtarza, zamknij i uruchom aplikację ponownie.' : 'Try again. If the problem persists, close and reopen the app.';
  return <View style={{ flex: 1, padding: 24, gap: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
    <Txt w="bold" accessibilityRole="header">{pl ? 'Nie udało się wczytać projektów' : 'Projects could not be loaded'}</Txt>
    <Txt style={{ textAlign: 'center', lineHeight: 22 }}>{hint}</Txt>
    <Button label={pl ? reload ? 'Odśwież kartę' : 'Spróbuj ponownie' : reload ? 'Refresh tab' : 'Try again'} onPress={onRetry} />
  </View>;
}

/** Do not mount providers with an unavailable DB: they must not mistake a
 * failed read for a new user with no projects and redirect to onboarding. */
export function DatabaseGate({ children }: PropsWithChildren) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(Platform.OS === 'web' ? 'loading' : 'ready');
  const { language } = useLanguage(), pl = language === 'pl';
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let active = true;
    void getDb().then(() => { if (active) setState('ready'); }, () => { if (active) setState('error'); });
    return () => { active = false; };
  }, []);
  if (state === 'ready') return children;
  if (state === 'error') return <ProjectLoadError reload onRetry={() => { if (Platform.OS === 'web') window.location.reload(); }} />;
  return <View style={{ flex: 1, padding: 24, gap: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
    <LoadingState message={pl ? 'Wczytuję Twoje projekty…' : 'Loading your projects…'} />
  </View>;
}
