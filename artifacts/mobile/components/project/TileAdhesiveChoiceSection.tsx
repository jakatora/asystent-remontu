import React, { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { PRODUCT_PHOTOS, getProductPhoto } from '@/data/products/photos';
import { TILE_ADHESIVE_PRODUCTS, type TileAdhesiveChoice } from '@/features/pricing/tileAdhesiveChoice';
import { ProductImage } from './ProductImage';

interface Props {
  references: typeof TILE_ADHESIVE_PRODUCTS;
  choices: readonly TileAdhesiveChoice[];
  ready: boolean; readFailed: boolean; saveFailed: boolean; commonBasket: boolean;
  onChange: (choices: readonly TileAdhesiveChoice[]) => void;
  onRetry: () => void;
}

export function TileAdhesiveChoiceSection({ references, choices, ready, readFailed, saveFailed, commonBasket, onChange, onRetry }: Props) {
  const { language } = useLanguage(), pl = language === 'pl';
  const [editing, setEditing] = useState<string | null>(null), [draft, setDraft] = useState<string | null>(null);
  if (!references.length) return null;
  const packaging = (id: string) => id === 'mat-tile-adhesive-atlas-plus-standard-25kg'
    ? pl ? 'Opakowanie standardowe · 25 kg' : 'Standard pack · 25 kg'
    : pl ? 'Opakowanie promocyjne · 25 kg' : 'Promotional pack · 25 kg';

  return <View style={{ padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <Txt w="bold" style={{ fontSize: 18 }}>{pl ? 'Klej do płytek na podłodze' : 'Floor tile adhesive'}</Txt>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl
      ? 'Porównaj opakowania ATLAS PLUS. Zachowamy obliczoną ilość kg, a ceny worków i dostaw sprawdzimy ponownie dla całego zestawu.'
      : 'Compare ATLAS PLUS packs. We keep the calculated kg and recheck bag prices and deliveries for the complete basket.'}</Txt>
    {commonBasket && <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? 'Wybór tutaj dotyczy wspólnego koszyka. Nie nadpisuje wyborów w projektach.' : 'This choice applies to the common basket and does not overwrite project choices.'}</Txt>}
    {readFailed && <><Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano wyboru kleju. Wycena jest wstrzymana, aby nie policzyć innego opakowania.' : 'The adhesive choice could not be read. Pricing is paused to avoid quoting another pack.'}</Txt><Button variant="outline" label={pl ? 'Odczytaj wybór kleju ponownie' : 'Read adhesive choice again'} onPress={onRetry} /></>}
    {ready && references.map(reference => {
      const chosenId = choices.find(choice => choice.from === reference.id)?.to ?? reference.id;
      const chosen = TILE_ADHESIVE_PRODUCTS.find(product => product.id === chosenId)!;
      return <View key={reference.id} style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <ProductImage uri={getProductPhoto(chosen)} name={chosen.productLabel} size={56} />
          <View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{chosen.productLabel}</Txt><Txt style={{ color: Colors.textSecondary }}>{packaging(chosen.id)}</Txt></View>
        </View>
        {editing !== reference.id ? <>
          <Button variant="outline" label={pl ? 'Zmień opakowanie kleju' : 'Change adhesive pack'} onPress={() => { setEditing(reference.id); setDraft(chosenId); }} />
          {chosenId !== reference.id && <Button variant="ghost" label={pl ? 'Przywróć poprzednie opakowanie kleju' : 'Restore previous adhesive pack'} onPress={() => onChange(choices.filter(choice => choice.from !== reference.id))} />}
        </> : <>
          <Txt style={{ fontSize: 13, lineHeight: 19 }}>{pl ? 'To różne kody EAN tego samego kleju ATLAS PLUS. Wybór nie zmienia podłoża, metody układania ani zapasu. Nierówności i metoda kombinowana zwiększają zużycie — sprawdź obmiar i instrukcję producenta.' : 'These are different EANs for the same ATLAS PLUS adhesive. This choice does not change the substrate, installation method or allowance. Uneven surfaces and combined application increase consumption; check quantities and manufacturer instructions.'}</Txt>
          {TILE_ADHESIVE_PRODUCTS.map(product => <View key={product.id} style={{ gap: 4 }}>
            <Pressable accessibilityRole="radio" accessibilityLabel={pl ? `Wybierz klej: ${product.productLabel}` : `Choose adhesive: ${product.productLabel}`} aria-checked={draft === product.id} accessibilityState={{ checked: draft === product.id }} onPress={() => setDraft(product.id)} style={{ minHeight: 88, padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: draft === product.id ? Colors.primary : Colors.border, borderRadius: 12, backgroundColor: draft === product.id ? Colors.primaryBg : Colors.surface }}>
              <ProductImage uri={getProductPhoto(product)} name={product.productLabel} size={48} />
              <View style={{ flex: 1, gap: 4 }}><Txt w="medium">{product.productLabel}</Txt><Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{packaging(product.id)} · EAN {PRODUCT_PHOTOS.find(photo => photo.ids.includes(product.id))?.ean}</Txt></View>
              <Feather name={draft === product.id ? 'check-circle' : 'circle'} size={22} color={draft === product.id ? Colors.primary : Colors.textSecondary} />
            </Pressable>
            {product.sourceUrl && <Button variant="ghost" label={pl ? `Sprawdź opakowanie — ${product.storeName}` : `Check pack — ${product.storeName}`} onPress={() => { void Linking.openURL(product.sourceUrl!); }} />}
          </View>)}
          <Button label={pl ? 'Zastosuj klej i przelicz zestaw' : 'Apply adhesive and recalculate basket'} disabled={!draft} onPress={() => {
            if (!draft) return;
            const next = choices.filter(choice => choice.from !== reference.id);
            onChange(draft === reference.id ? next : [...next, { from: reference.id, to: draft }]);
            setEditing(null); setDraft(null);
          }} />
          <Button variant="ghost" label={pl ? 'Anuluj zmianę kleju' : 'Cancel adhesive change'} onPress={() => { setEditing(null); setDraft(null); }} />
        </>}
      </View>;
    })}
    {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru kleju. Bieżąca wycena go uwzględnia; po otwarciu sprawdź opakowanie.' : 'The adhesive choice was not saved. It is in the current quote; check the pack when reopening.'}</Txt>}
  </View>;
}
