import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { getProductPhoto } from '@/data/products/photos';
import { FLUSH_BOX_PRODUCTS, FLUSH_BOX_SINGLE, FLUSH_BOX_TEN } from '@/features/pricing/flushBoxChoice';
import type { ProductChoice } from '@/features/pricing/productChoice';
import { ProductImage } from './ProductImage';

export function FlushBoxChoiceSection({ visible, choices, ready, readFailed, saveFailed, onChange, onRetry }: {
  visible: boolean; choices: readonly ProductChoice[]; ready: boolean; readFailed: boolean; saveFailed: boolean;
  onChange: (choices: readonly ProductChoice[]) => void; onRetry: () => void;
}) {
  const { language } = useLanguage(), pl = language === 'pl';
  if (!visible) return null;
  const single = choices.some(c => c.from === FLUSH_BOX_TEN && c.to === FLUSH_BOX_SINGLE);
  const selected = FLUSH_BOX_PRODUCTS.find(ref => ref.id === (single ? FLUSH_BOX_SINGLE : FLUSH_BOX_TEN))!;
  return <View style={{ padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Feather name="box" size={20} color={Colors.primary} /><Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{pl ? 'Opakowanie puszek PRO' : 'PRO box packaging'}</Txt></View>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 21 }}>{pl ? 'Możesz porównać zakup puszek PRO na sztuki zamiast pakietu 10 sztuk. Zachowamy potrzebną liczbę puszek i sprawdzimy cenę całego zestawu z dostawą.' : 'Compare buying individual PRO boxes instead of ten-packs. We keep the required box count and check the full basket with delivery.'}</Txt>
    <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Dotyczy puszki głębokiej PRO z wkrętami do ścian murowanych (0285-01 / 0285-01L). Puszka LUX i pierścienie dystansowe są osobnymi produktami. Wybór dotyczy wspólnego koszyka; projekty pozostają bez zmian.' : 'For deep PRO boxes with screws for masonry walls (0285-01 / 0285-01L). LUX boxes and spacer rings are separate products. This choice applies to the common basket and leaves project selections unchanged.'}</Txt>
    {readFailed ? <><Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano wyboru opakowania puszek. Wycena jest wstrzymana, aby zachować właściwy produkt.' : 'The box packaging choice could not be read. Pricing is paused to preserve the right product.'}</Txt><Button variant="outline" label={pl ? 'Odczytaj opakowanie puszek ponownie' : 'Read box packaging again'} onPress={onRetry} /></> : !ready ? <Txt>{pl ? 'Odczytujemy wybór opakowania puszek…' : 'Reading the box packaging choice…'}</Txt> : <>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><ProductImage uri={getProductPhoto(selected)} name={selected.productLabel} size={56} /><View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{pl ? (single ? 'Do porównania: sprzedaż na sztuki' : 'Do porównania: pakiet 10 sztuk') : (single ? 'Comparing: individual pieces' : 'Comparing: ten-packs')}</Txt><Txt style={{ fontSize: 13, color: Colors.textSecondary }}>EAN {single ? '5901752632141' : '5901752637337'}</Txt></View></View>
      <Button variant="outline" label={pl ? (single ? 'Przywróć pakiet 10 puszek' : 'Porównaj puszki sprzedawane na sztuki') : (single ? 'Restore ten-packs' : 'Compare individually sold boxes')} onPress={() => onChange(single ? [] : [{ from: FLUSH_BOX_TEN, to: FLUSH_BOX_SINGLE }])} />
    </>}
    {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru opakowania. Bieżąca wycena go uwzględnia; po ponownym otwarciu sprawdź wybór.' : 'The packaging choice was not saved. It is used in this quote; check it when reopening.'}</Txt>}
  </View>;
}
