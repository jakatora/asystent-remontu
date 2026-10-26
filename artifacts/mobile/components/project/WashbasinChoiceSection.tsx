import React, { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { PRODUCT_PHOTOS, getProductPhoto } from '@/data/products/photos';
import { WASHBASIN_PRODUCTS, type WashbasinChoice } from '@/features/pricing/washbasinChoice';
import { ProductImage } from './ProductImage';

interface Props {
  references: typeof WASHBASIN_PRODUCTS; choices: readonly WashbasinChoice[];
  ready: boolean; readFailed: boolean; saveFailed: boolean; commonBasket: boolean;
  onChange: (choices: readonly WashbasinChoice[]) => void; onRetry: () => void;
}

export function WashbasinChoiceSection({ references, choices, ready, readFailed, saveFailed, commonBasket, onChange, onRetry }: Props) {
  const { language } = useLanguage(), pl = language === 'pl';
  const [editing, setEditing] = useState<string | null>(null), [draft, setDraft] = useState<string | null>(null);
  if (!references.length) return null;
  return <View style={{ padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Feather name="droplet" size={20} color={Colors.primary} /><Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{pl ? 'Wybierz umywalkę' : 'Choose the washbasin'}</Txt></View>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Wybierz konkretny model. Zachowamy liczbę umywalek z obmiarów i ponownie sprawdzimy cenę materiałów oraz dostawy zestawu.' : 'Choose the model. We keep the basin count from your measurements and check the materials and delivery again.'}</Txt>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'To różne modele. Sprawdź miejsce, rozstaw mocowań, odpływ i zgodność półpostumentu. Bateria, syfon i mocowania nie są w cenie samej umywalki. Mocowania i półpostument wymagają osobnego doboru i mogą zwiększyć koszt remontu.' : 'These are different models. Check space, fixing centres, waste and pedestal compatibility. The basin price excludes the tap, trap and fixings. Fixings and a pedestal need separate selection and may increase the renovation cost.'}</Txt>
    {commonBasket && <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? 'Wybór tutaj dotyczy wspólnego koszyka. Nie nadpisuje modeli wybranych w projektach.' : 'This choice applies to the common basket and does not overwrite project choices.'}</Txt>}
    {readFailed && <><Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano wyboru umywalki. Wycena jest wstrzymana, aby nie policzyć innego modelu.' : 'The basin choice could not be read. Pricing is paused to avoid quoting another model.'}</Txt><Button variant="outline" label={pl ? 'Odczytaj wybór umywalki ponownie' : 'Read basin choice again'} onPress={onRetry} /></>}
    {ready && references.map(reference => {
      const chosenId = choices.find(choice => choice.from === reference.id)?.to ?? reference.id;
      const chosen = WASHBASIN_PRODUCTS.find(product => product.id === chosenId)!;
      const changed = chosenId !== reference.id;
      return <View key={reference.id} style={{ gap: 10, paddingVertical: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><ProductImage uri={getProductPhoto(chosen)} name={chosen.productLabel} size={56} /><View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{chosen.productLabel}</Txt><Txt style={{ color: Colors.textSecondary }}>{pl ? 'Cena obejmuje 1 umywalkę' : 'Price is for 1 basin'}</Txt></View></View>
        {changed && <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? `Twój wybór zamiast: ${reference.productLabel}` : `Your choice instead of: ${reference.productLabel}`}</Txt>}
        {editing !== reference.id ? <>
          <Button variant="outline" label={pl ? 'Zmień umywalkę do porównania' : 'Change the basin to compare'} onPress={() => { setEditing(reference.id); setDraft(chosenId); }} />
          {changed && <Button variant="ghost" label={pl ? 'Przywróć poprzednią umywalkę' : 'Restore the previous basin'} onPress={() => onChange(choices.filter(choice => choice.from !== reference.id))} />}
        </> : <>
          {WASHBASIN_PRODUCTS.map(product => <View key={product.id} style={{ gap: 4 }}>
            <Pressable accessibilityRole="radio" accessibilityLabel={pl ? `Wybierz umywalkę: ${product.productLabel}` : `Choose basin: ${product.productLabel}`} accessibilityState={{ checked: draft === product.id }} onPress={() => setDraft(product.id)} style={{ minHeight: 88, padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: draft === product.id ? Colors.primary : Colors.border, borderRadius: 12, backgroundColor: draft === product.id ? Colors.primaryBg : Colors.surface }}>
              <ProductImage uri={getProductPhoto(product)} name={product.productLabel} size={48} /><View style={{ flex: 1, gap: 4 }}><Txt w="medium">{product.productLabel}</Txt><Txt style={{ fontSize: 13, color: Colors.textSecondary }}>EAN {PRODUCT_PHOTOS.find(photo => photo.ids.includes(product.id))?.ean}</Txt>{product.id === 'mat-washbasin-cersanit-atlantic-new-50' && <Txt style={{ fontSize: 13 }}>{pl ? '505 × 400 mm · otwór na baterię i przelew · u producenta: Ovida K36-031' : '505 × 400 mm · tap hole and overflow · manufacturer model: Ovida K36-031'}</Txt>}</View><Feather name={draft === product.id ? 'check-circle' : 'circle'} size={22} color={draft === product.id ? Colors.primary : Colors.textSecondary} />
            </Pressable>
            {product.sourceUrl && <Button variant="ghost" label={pl ? `Sprawdź parametry — ${product.productLabel}` : `Check specifications — ${product.productLabel}`} onPress={() => { void Linking.openURL(product.sourceUrl!); }} />}
          </View>)}
          <Button label={pl ? 'Zastosuj umywalkę i przelicz zestaw' : 'Apply basin and recalculate basket'} disabled={!draft} onPress={() => { if (!draft) return; const next = choices.filter(choice => choice.from !== reference.id); onChange(draft === reference.id ? next : [...next, { from: reference.id, to: draft }]); setEditing(null); setDraft(null); }} />
          <Button variant="ghost" label={pl ? 'Anuluj zmianę umywalki' : 'Cancel basin change'} onPress={() => { setEditing(null); setDraft(null); }} />
        </>}
      </View>;
    })}
    {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru umywalki. Bieżąca wycena go uwzględnia; po ponownym otwarciu sprawdź model.' : 'The basin choice was not saved. It is in the current quote; check the model when reopening.'}</Txt>}
  </View>;
}
