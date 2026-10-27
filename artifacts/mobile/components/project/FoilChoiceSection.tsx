import React, { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { PRODUCT_PHOTOS, getProductPhoto } from '@/data/products/photos';
import { FOIL_PRODUCTS, type FoilChoice } from '@/features/pricing/foilChoice';
import { ProductImage } from './ProductImage';

interface Props {
  references: typeof FOIL_PRODUCTS;
  choices: readonly FoilChoice[];
  ready: boolean; readFailed: boolean; saveFailed: boolean; commonBasket: boolean;
  onChange: (choices: readonly FoilChoice[]) => void;
  onRetry: () => void;
}

function FoilParameters({ id, pl }: { id: string; pl: boolean }) {
  // source: https://parotec.pl/product-pol-18078-Folia-paroizolacyjna-zolta-CONPAR-0-2-mm-T30.html
  // source: https://ebardo.pl/pl/p/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2/534
  const text = id === 'mat-vapor-foil-conkret-conpar-100m2'
    ? pl ? '2 × 50 m · 0,20 mm z tolerancją ±30%' : '2 × 50 m · 0.20 mm with ±30% tolerance'
    : id === 'mat-vapor-foil-conkret-ecovil-p-100m2'
      ? pl ? '2 × 50 m · 0,20 mm z tolerancją ±50%. Sprawdź wymaganą barierę w instrukcji podłogi i podkładu.' : '2 × 50 m · 0.20 mm with ±50% tolerance. Check the barrier required by your floor and underlay instructions.'
      : null;
  return text ? <Txt style={{ fontSize: 13, lineHeight: 19 }}>{text}</Txt> : null;
}

export function FoilChoiceSection({ references, choices, ready, readFailed, saveFailed, commonBasket, onChange, onRetry }: Props) {
  const { language } = useLanguage(), pl = language === 'pl';
  const [editing, setEditing] = useState<string | null>(null), [draft, setDraft] = useState<string | null>(null);
  if (!references.length) return null;
  return <View style={{ padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Feather name="shield" size={20} color={Colors.primary} /><Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{pl ? 'Wybierz folię paroizolacyjną' : 'Choose the vapour barrier'}</Txt></View>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Wybierz konkretny produkt do swojej podłogi. Zachowamy potrzebne m² i sprawdzimy koszt pełnych rolek oraz dostawy całego zestawu.' : 'Choose the product for your floor. We keep the required m² and check full rolls and delivery of the complete basket.'}</Txt>
    {commonBasket && <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? 'Wybór tutaj dotyczy wspólnego koszyka. Nie nadpisuje wyborów w projektach.' : 'This choice applies to the common basket and does not overwrite project choices.'}</Txt>}
    {readFailed && <><Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano wyboru folii. Wycena jest wstrzymana, aby nie policzyć innego produktu.' : 'The foil choice could not be read. Pricing is paused to avoid quoting another product.'}</Txt><Button variant="outline" label={pl ? 'Odczytaj wybór folii ponownie' : 'Read the foil choice again'} onPress={onRetry} /></>}
    {ready && references.map(reference => {
      const chosenId = choices.find(choice => choice.from === reference.id)?.to ?? reference.id;
      const chosen = FOIL_PRODUCTS.find(product => product.id === chosenId)!;
      const changed = chosenId !== reference.id;
      return <View key={reference.id} style={{ gap: 10, paddingVertical: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><ProductImage uri={getProductPhoto(chosen)} name={chosen.productLabel} size={56} /><View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{chosen.productLabel}</Txt><Txt style={{ color: Colors.textSecondary }}>{chosen.packageSize.toLocaleString(pl ? 'pl-PL' : 'en-GB')} m² / {pl ? 'rolka' : 'roll'}</Txt></View></View>
        {changed && <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? `Twój wybór zamiast: ${reference.productLabel}` : `Your choice instead of: ${reference.productLabel}`}</Txt>}
        <FoilParameters id={chosen.id} pl={pl} />
        {editing !== reference.id ? <>
          <Button variant="outline" label={pl ? 'Zmień folię do porównania' : 'Change the foil to compare'} onPress={() => { setEditing(reference.id); setDraft(chosenId); }} />
          {changed && <Button variant="ghost" label={pl ? 'Przywróć poprzednią folię' : 'Restore the previous foil'} onPress={() => onChange(choices.filter(choice => choice.from !== reference.id))} />}
        </> : <>
          <Txt style={{ lineHeight: 20 }}>{pl ? 'Produkty różnią się grubością, tolerancją i wielkością rolki. Dobierz folię do instrukcji podłogi i podkładu. Folia paroizolacyjna nie zastępuje paroprzepuszczalnej membrany dachowej.' : 'Products differ in thickness, tolerance and roll size. Follow your floor and underlay instructions. A vapour barrier does not replace a breathable roof membrane.'}</Txt>
          {FOIL_PRODUCTS.map(product => <View key={product.id} style={{ gap: 4 }}>
            <Pressable accessibilityRole="radio" accessibilityLabel={pl ? `Wybierz folię: ${product.productLabel}` : `Choose foil: ${product.productLabel}`} accessibilityState={{ checked: draft === product.id }} onPress={() => setDraft(product.id)} style={{ minHeight: 88, padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: draft === product.id ? Colors.primary : Colors.border, borderRadius: 12, backgroundColor: draft === product.id ? Colors.primaryBg : Colors.surface }}>
              <ProductImage uri={getProductPhoto(product)} name={product.productLabel} size={48} /><View style={{ flex: 1, gap: 4 }}><Txt w="medium">{product.productLabel}</Txt><Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{product.packageSize} m² / {pl ? 'rolka' : 'roll'} · EAN {PRODUCT_PHOTOS.find(photo => photo.ids.includes(product.id))?.ean}</Txt><FoilParameters id={product.id} pl={pl} /></View><Feather name={draft === product.id ? 'check-circle' : 'circle'} size={22} color={draft === product.id ? Colors.primary : Colors.textSecondary} />
            </Pressable>
            {product.sourceUrl && <Button variant="ghost" label={pl ? `Sprawdź parametry folii — ${product.brand}` : `Check foil specifications — ${product.brand}`} onPress={() => { void Linking.openURL(product.sourceUrl!); }} />}
          </View>)}
          <Button label={pl ? 'Zastosuj folię i przelicz zestaw' : 'Apply foil and recalculate basket'} disabled={!draft} onPress={() => { if (!draft) return; const next = choices.filter(choice => choice.from !== reference.id); onChange(draft === reference.id ? next : [...next, { from: reference.id, to: draft }]); setEditing(null); setDraft(null); }} />
          <Button variant="ghost" label={pl ? 'Anuluj zmianę folii' : 'Cancel foil change'} onPress={() => { setEditing(null); setDraft(null); }} />
        </>}
      </View>;
    })}
    {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru folii. Bieżąca wycena go uwzględnia; po ponownym otwarciu sprawdź produkt.' : 'The foil choice was not saved. It is in the current quote; check the product when reopening.'}</Txt>}
  </View>;
}
