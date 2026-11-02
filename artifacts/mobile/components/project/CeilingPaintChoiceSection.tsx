import React from 'react';
import { Linking, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { getProductPhoto } from '@/data/products/photos';
import { CEILING_PAINT_PRODUCTS, CEILING_PAINT_TARGET, type CeilingPaintChoice } from '@/features/pricing/ceilingPaintChoice';
import type { MaterialPriceReference } from '@/types/pricing';
import { ProductImage } from './ProductImage';
import { PreferenceRecoveryAction, type PreferenceRecoveryProps } from './PreferenceRecoveryAction';

interface Props extends PreferenceRecoveryProps {
  references: readonly MaterialPriceReference[]; choices: readonly CeilingPaintChoice[];
  ready: boolean; readFailed: boolean; saveFailed: boolean; saving: boolean; commonBasket: boolean;
  onChange: (choices: readonly CeilingPaintChoice[]) => Promise<boolean>; onRetry: () => void;
}
export function CeilingPaintChoiceSection({ references, choices, ready, readFailed, saveFailed, saving, commonBasket, onChange, onRetry, ...recovery }: Props) {
  const { language } = useLanguage(), pl = language === 'pl';
  if (!references.length && !readFailed && !recovery.recovered) return null;
  const target = CEILING_PAINT_PRODUCTS.find(ref => ref.id === CEILING_PAINT_TARGET)!;
  return <View style={{ padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <Txt w="bold" style={{ fontSize: 18 }}>{pl ? 'Farba do sufitu' : 'Ceiling paint'}</Txt>
    <Txt style={{ lineHeight: 21, color: Colors.textSecondary }}>{pl ? 'Brak oferty wybranej farby? Możesz wybrać białą, matową Śnieżkę EKO Plus do wnętrz. Po wyborze sprawdzimy ceny i dostawy całego zestawu.' : 'No offer for your paint? You can choose white matt Śnieżka EKO Plus for interiors. We will recheck prices and deliveries for the whole basket.'}</Txt>
    <Txt style={{ lineHeight: 21, color: Colors.textSecondary }}>{pl ? 'Zachowamy obliczone litry, liczbę warstw i wydajność z obmiarów. Sprawdź wydajność na swoim podłożu; w razie potrzeby zmień obmiary. Pełne wiadra zaokrąglimy we wspólnym koszyku.' : 'We retain the calculated litres, coats and coverage from your measurements. Check coverage on your substrate and adjust measurements if needed. Full buckets are rounded in the common basket.'}</Txt>
    {commonBasket && <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? 'Wybór dotyczy wspólnego koszyka. W projektach zachowamy zapisane farby.' : 'This choice applies to the common basket. Saved project paints are preserved.'}</Txt>}
    {readFailed && <><Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano wyboru farby. Wycena jest wstrzymana.' : 'The paint choice could not be read. Pricing is paused.'}</Txt><Button variant="outline" label={pl ? 'Odczytaj wybór farby ponownie' : 'Read paint choice again'} disabled={recovery.recovering} onPress={onRetry} /></>}
    <PreferenceRecoveryAction key={recovery.recoveryKey} {...recovery} readFailed={readFailed} kind="products" />
    {ready && references.map(ref => {
      const selected = choices.some(choice => choice.from === ref.id);
      return <View key={ref.id} style={{ gap: 10 }}>
        <Txt>{pl ? 'Zapisana farba: ' : 'Saved paint: '}{ref.productLabel}</Txt>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><ProductImage uri={getProductPhoto(target)} name={target.productLabel} /><View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{target.productLabel}</Txt><Txt style={{ color: Colors.textSecondary }}>10 l · {pl ? 'biała, matowa' : 'white, matt'}</Txt></View></View>
        {selected && <Txt accessibilityLiveRegion="polite" style={{ color: Colors.primary }}>{pl ? 'Wybrano Śnieżkę EKO Plus. Ceny i dostawy dotyczą tej farby.' : 'Śnieżka EKO Plus selected. Prices and deliveries refer to this paint.'}</Txt>}
        <Button variant={selected ? 'ghost' : 'outline'} disabled={saving} label={pl ? selected ? `Przywróć farbę: ${ref.productLabel}` : 'Wybierz Śnieżkę EKO Plus i przelicz zestaw' : selected ? `Restore paint: ${ref.productLabel}` : 'Choose Śnieżka EKO Plus and recalculate basket'} onPress={() => { void onChange(selected ? choices.filter(choice => choice.from !== ref.id) : [...choices.filter(choice => choice.from !== ref.id), { from: ref.id, to: target.id }]); }} />
      </View>;
    })}
    <Button variant="ghost" label={pl ? 'Sprawdź zastosowanie i wydajność u producenta' : 'Check manufacturer application and coverage'} onPress={() => { void Linking.openURL('https://www.sniezka.pl/produkt/sniezka-eko-plus'); }} />
    {saving && <Txt accessibilityLiveRegion="polite">{pl ? 'Zapisuję wybór farby…' : 'Saving paint choice…'}</Txt>}
    {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru. Zachowano poprzednią farbę. Spróbuj ponownie.' : 'The choice was not saved. The previous paint is preserved. Try again.'}</Txt>}
  </View>;
}
