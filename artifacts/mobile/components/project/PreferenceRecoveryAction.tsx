import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
export interface PreferenceRecoveryProps {
  recoveryKey: string; recovering: boolean; recoveryFailed: boolean; recovered: boolean;
  onRecover: () => Promise<boolean>;
}
export function PreferenceRecoveryAction({ readFailed, recovering, recoveryFailed, recovered, onRecover, kind }: PreferenceRecoveryProps & { readFailed: boolean; kind: 'stock' | 'packages' }) {
  const { language } = useLanguage(), pl = language === 'pl', stock = kind === 'stock';
  const [confirming, setConfirming] = useState(false);
  if (!readFailed && !recovered) return null;
  return <View style={{ gap: 10 }}>
    {recovered && <Txt accessibilityLiveRegion="polite" style={{ color: Colors.textSecondary, lineHeight: 21 }}>{pl
      ? stock ? 'Zachowano kopię błędnego zapisu. Wpisz posiadane ilości ponownie; do tego czasu wycena obejmuje pełne zapotrzebowanie. Kopia jest dołączana do eksportu remontu.' : 'Zachowano kopię błędnego zapisu. Przywrócono wybrane opakowania. Automatyczny dobór możesz włączyć ponownie. Kopia jest dołączana do eksportu remontu.'
      : stock ? 'A copy of the damaged record was preserved. Re-enter your stock; pricing uses the full requirement until then. The copy is included in renovation exports.' : 'A copy of the damaged record was preserved. Selected pack sizes were restored. You can enable automatic sizing again. The copy is included in renovation exports.'}</Txt>}
    {readFailed && (!confirming ? <Button variant="ghost" label={pl ? stock ? 'Ustaw zapas od nowa' : 'Przywróć wybór opakowań' : stock ? 'Set stock again' : 'Restore selected pack sizes'} disabled={recovering} onPress={() => setConfirming(true)} /> : <>
      <Txt style={{ lineHeight: 21 }}>{pl
        ? stock ? 'Najpierw zachowamy kopię błędnego zapisu tego zapasu. Następnie ustawimy zapas na pusty. Posiadane ilości trzeba będzie wpisać ponownie. Obmiary i pozostałe ustawienia projektu zostają zachowane.' : 'Najpierw zachowamy kopię błędnego zapisu tej rodziny opakowań. Następnie wrócimy do wybranych pojemności. Obmiary, zapasy i pozostałe ustawienia zostają zachowane.'
        : stock ? 'We first preserve a copy of this damaged stock record, then set stock to empty. You will need to re-enter available quantities. Measurements and other project settings are preserved.' : 'We first preserve a copy of this family’s damaged record, then restore selected sizes. Measurements, stock and other settings are preserved.'}</Txt>
      <Button variant="outline" label={pl ? stock ? 'Zachowaj kopię i przywróć pusty zapas' : 'Zachowaj kopię i przywróć opakowania' : stock ? 'Keep a copy and restore empty stock' : 'Keep a copy and restore pack sizes'} loading={recovering} onPress={() => { void onRecover().then(ok => { if (ok) setConfirming(false); }); }} />
      <Button variant="ghost" label={pl ? 'Anuluj przywracanie' : 'Cancel recovery'} disabled={recovering} onPress={() => setConfirming(false)} />
    </>)}
    {readFailed && recoveryFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger, lineHeight: 21 }}>{pl ? 'Nie potwierdzono przywrócenia ustawienia. Wycena pozostaje wstrzymana. Spróbuj ponownie odczytać zapis. Jeśli pamięć urządzenia jest pełna, zwolnij miejsce.' : 'Recovery could not be confirmed. Pricing remains paused. Try reading the setting again. If device storage is full, free some space.'}</Txt>}
  </View>;
}
