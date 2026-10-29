import React, { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { getProductPhoto } from '@/data/products/photos';
import { TILE_PRODUCTS, type TileChoice, type TileRequirement } from '@/features/pricing/tileChoice';
import { ProductImage } from './ProductImage';

interface Props {
  references: readonly TileRequirement[]; choices: readonly TileChoice[];
  ready: boolean; readFailed: boolean; saveFailed: boolean; commonBasket: boolean;
  onChange: (choices: readonly TileChoice[]) => void; onRetry: () => void;
}
export function TileChoiceSection({ references, choices, ready, readFailed, saveFailed, commonBasket, onChange, onRetry }: Props) {
  const { language } = useLanguage(), pl = language === 'pl';
  const [editing, setEditing] = useState<string | null>(null), [draft, setDraft] = useState<string | null>(null);
  if (!references.length) return null;
  return <View style={{ padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Feather name="grid" size={20} color={Colors.primary} /><Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{pl ? 'Wybierz płytki do porównania' : 'Choose tiles to compare'}</Txt></View>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Pokazujemy modele do właściwej powierzchni. Zachowamy potrzebne m² z zapasem z obmiarów, a pełne paczki dobierzemy dla całego remontu.' : 'Models are filtered by surface. We keep the required m² including your cutting allowance and calculate full packs for the renovation.'}</Txt>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Po zmianie płytek przeliczymy obecne na liście klej, fugę i krzyżyki według nowego formatu oraz szerokości spoiny. W kuchni zachowamy biały klej ATLAS PLUS BIAŁY i epoksydową fugę Mapei Easy Design 100 (3 kg); w pozostałych pracach — zestaw ATLAS PLUS i ceramiczną fugę ATLAS 001. Nierówności i metoda kombinowana zwiększają zużycie kleju. Sprawdź też zgodność posiadanych materiałów, profili i hydroizolacji.' : 'Changing tiles recalculates the listed adhesive, grout and spacers for the new size and joint width. The kitchen keeps white ATLAS PLUS BIAŁY adhesive and Mapei Easy Design 100 epoxy grout (3 kg); other work uses ATLAS PLUS and ATLAS 001 ceramic grout. Uneven surfaces and combined application need more adhesive. Also check owned materials, trims and waterproofing.'}</Txt>
    {commonBasket && <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? 'Wybór tutaj dotyczy koszyka. Nie nadpisuje zapisanych projektów. Dodatkowa pozycja samych płytek nie dodaje automatycznie chemii budowlanej.' : 'This choice applies to the basket and does not overwrite projects. An extra tile-only item does not automatically add adhesive or grout.'}</Txt>}
    {readFailed && <><Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano wyboru płytek. Wycena jest wstrzymana, aby nie policzyć innego modelu.' : 'The tile choice could not be read. Pricing is paused to avoid quoting another model.'}</Txt><Button variant="outline" label={pl ? 'Odczytaj wybór płytek ponownie' : 'Read tile choice again'} onPress={onRetry} /></>}
    {ready && references.map(({ product: reference, use }) => {
      const key = use + ':' + reference.id, match = (row: TileChoice) => row.from === reference.id && row.use === use;
      const chosenId = choices.find(match)?.to ?? reference.id, chosen = TILE_PRODUCTS.find(p => p.id === chosenId)!;
      const changed = chosenId !== reference.id;
      return <View key={key} style={{ gap: 10, paddingVertical: 8 }}>
        <Txt w="semibold">{pl ? use === 'floor' ? 'Płytki na podłogę' : 'Płytki na ścianę' : use === 'floor' ? 'Floor tiles' : 'Wall tiles'}</Txt>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><ProductImage uri={getProductPhoto(chosen)} name={chosen.productLabel} size={56} /><View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{chosen.productLabel}</Txt><Txt style={{ color: Colors.textSecondary }}>{chosen.widthCm} × {chosen.heightCm} cm · {chosen.depthMm} mm · {chosen.packageSize.toLocaleString(pl ? 'pl-PL' : 'en-GB')} m² / {pl ? 'paczka' : 'pack'}</Txt></View></View>
        {chosen.minJointMm!==undefined&&<Txt style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{pl?`Producent zaleca wewnątrz spoinę od ${chosen.minJointMm.toLocaleString('pl-PL')} mm. Szerokość spoiny zmienisz w obmiarach projektu; aplikacja nie powiększa jej samoczynnie.`:`The manufacturer recommends indoor joints of at least ${chosen.minJointMm} mm. Change joint width in the project measurements; the app does not enlarge it automatically.`}</Txt>}
        {changed && <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? `Twój wybór zamiast: ${reference.productLabel}` : `Your choice instead of: ${reference.productLabel}`}</Txt>}
        {editing !== key ? <>
          <Button variant="outline" label={pl ? `Zmień płytki — ${use === 'floor' ? 'podłoga' : 'ściana'}` : `Change tiles — ${use}`} onPress={() => { setEditing(key); setDraft(chosenId); }} />
          {changed && <Button variant="ghost" label={pl ? `Przywróć płytki — ${use === 'floor' ? 'podłoga' : 'ściana'}` : `Restore tiles — ${use}`} onPress={() => onChange(choices.filter(row => !match(row)))} />}
        </> : <>
          {TILE_PRODUCTS.filter(product => product.uses.includes(use)).map(product => <View key={product.id} style={{ gap: 4 }}>
            <Pressable accessibilityRole="radio" accessibilityLabel={pl ? `Wybierz płytki na ${use === 'floor' ? 'podłogę' : 'ścianę'}: ${product.productLabel}` : `Choose ${use} tiles: ${product.productLabel}`} aria-checked={draft === product.id} accessibilityState={{ checked: draft === product.id }} onPress={() => setDraft(product.id)} style={{ minHeight: 88, padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: draft === product.id ? Colors.primary : Colors.border, borderRadius: 12, backgroundColor: draft === product.id ? Colors.primaryBg : Colors.surface }}>
              <ProductImage uri={getProductPhoto(product)} name={product.productLabel} size={48} /><View style={{ flex: 1, gap: 4 }}><Txt w="medium">{product.productLabel}</Txt><Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{product.widthCm} × {product.heightCm} cm · {product.depthMm} mm · {product.packageSize} m² / {pl ? 'paczka' : 'pack'} · EAN {product.ean}</Txt>{product.id === 'mat-tile-wall-tamara-white-25x40' && <Txt style={{ fontSize: 13 }}>{pl ? 'Biała, błyszcząca, gładka. Tylko na ściany wewnętrzne.' : 'White, glossy and smooth. Interior walls only.'}</Txt>}</View><Feather name={draft === product.id ? 'check-circle' : 'circle'} size={22} color={draft === product.id ? Colors.primary : Colors.textSecondary} />
            </Pressable>
            {product.sourceUrl && <Button variant="ghost" label={pl ? `Sprawdź parametry — ${product.productLabel}` : `Check specifications — ${product.productLabel}`} onPress={() => { void Linking.openURL(product.sourceUrl!); }} />}
          </View>)}
          <Button label={pl ? 'Zastosuj płytki i przelicz zestaw' : 'Apply tiles and recalculate materials'} disabled={!draft} onPress={() => { if (!draft) return; const next = choices.filter(row => !match(row)); onChange(draft === reference.id ? next : [...next, { from: reference.id, to: draft, use }]); setEditing(null); setDraft(null); }} />
          <Button variant="ghost" label={pl ? 'Anuluj zmianę płytek' : 'Cancel tile change'} onPress={() => { setEditing(null); setDraft(null); }} />
        </>}
      </View>;
    })}
    {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru płytek. Bieżąca wycena go uwzględnia; po otwarciu sprawdź model.' : 'The tile choice was not saved. It is in the current quote; check the model when reopening.'}</Txt>}
  </View>;
}
