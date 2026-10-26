import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { getProductPhoto, PRODUCT_PHOTOS } from '@/data/products/photos';
import { normalizeProductName } from '../../../../lib/db/src/repositories/helpers';
import { generateId } from '@/shared/lib/id';
import { extraMaterial, EXTRA_UNITS, MAX_BASKET_EXTRAS, parseExtraQuantity, type BasketExtra } from '@/features/pricing/basketExtras';
import { ProductImage } from './ProductImage';

export function BasketExtrasSection({ items, onChange, ready, error, onRetry }: {
  items: readonly BasketExtra[]; onChange: (items: BasketExtra[]) => void; ready: boolean; error: boolean; onRetry: () => void;
}) {
  const { language } = useLanguage(), pl = language === 'pl';
  const [expanded, setExpanded] = useState(false), [search, setSearch] = useState('');
  const [custom, setCustom] = useState(false), [name, setName] = useState(''), [unit, setUnit] = useState<typeof EXTRA_UNITS[number]>('szt');
  const [referenceId, setReferenceId] = useState<string | null>(null), [quantity, setQuantity] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const ref = MATERIAL_PRICES.find(ref => ref.id === referenceId);
  const demand = parseExtraQuantity(quantity);
  const validName = name.trim().length > 0 && name.trim().length <= 200 && !/[\u0000-\u001f]/.test(name);
  const query = normalizeProductName(search);
  const found = MATERIAL_PRICES.filter(ref => normalizeProductName(ref.productLabel).includes(query) || Boolean(query && PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id))?.ean?.includes(query)));
  const reset = () => { setExpanded(false); setEditingId(null); setReferenceId(null); setQuantity(''); setName(''); setSearch(''); };
  const edit = (item: BasketExtra) => {
    setEditingId(item.id); setExpanded(true); setQuantity(String(item.quantity)); setCustom(item.kind === 'custom');
    if (item.kind === 'catalogue') { setReferenceId(item.referenceId); setSearch(MATERIAL_PRICES.find(ref => ref.id === item.referenceId)!.productLabel); }
    else { setName(item.name); setUnit(item.unit); setReferenceId(null); setSearch(''); }
  };
  const add = () => {
    if (!ready || demand === null || (!editingId && items.length >= MAX_BASKET_EXTRAS)) return;
    if (custom && !validName) return;
    if (!custom && !ref) return;
    const id = editingId ?? generateId('extra');
    const row: BasketExtra = custom ? { id, kind: 'custom', name: name.trim(), unit, quantity: demand }
      : { id, kind: 'catalogue', referenceId: ref!.id, quantity: demand };
    onChange(editingId ? items.map(item => item.id === editingId ? row : item) : [...items, row]); reset();
  };
  const field = { minHeight: 48, fontSize: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, color: Colors.text };
  return <View style={{ padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Feather name="plus-circle" size={20} color={Colors.primary} /><Txt w="bold" style={{ flex: 1, fontSize: 18 }}>{pl ? 'Dodatkowe materiały' : 'Additional materials'}</Txt></View>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Dopisz to, czego nie obejmują obmiary. Ilości połączymy z materiałami z wybranych prac. Brak oferty pozostanie widoczny w wycenie.' : 'Add materials beyond the measurements. We combine their demand with your selected works. Missing offers remain visible in the quote.'}</Txt>
    {error && <><Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano dodatkowych materiałów. Pełna wycena jest wstrzymana, żeby nie pominąć zapisanych pozycji.' : 'Additional materials could not be read. The full quote is paused to avoid omitting saved items.'}</Txt><Button variant="outline" label={pl ? 'Odczytaj ponownie' : 'Read again'} onPress={onRetry} /></>}
    {items.map(item => {
      const material = extraMaterial(item).material;
      const reference = item.kind === 'catalogue' ? MATERIAL_PRICES.find(ref => ref.id === item.referenceId) : null;
      return <View key={item.id} style={{ gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {reference && <ProductImage uri={getProductPhoto(reference)} name={material.name} size={48} />}
          <View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{material.name}</Txt><Txt>{item.quantity.toLocaleString(pl ? 'pl-PL' : 'en-GB', { maximumFractionDigits: 6 })} {material.unit}</Txt></View>
          <Pressable accessibilityRole="button" accessibilityLabel={pl ? `Edytuj dodatkową pozycję ${material.name}` : `Edit additional item ${material.name}`} onPress={() => edit(item)} style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}><Feather name="edit-2" size={20} color={Colors.primary} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={pl ? `Usuń dodatkową pozycję ${material.name}` : `Remove additional item ${material.name}`} onPress={() => { onChange(items.filter(row => row.id !== item.id)); if (editingId === item.id) reset(); }} style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}><Feather name="trash-2" size={20} color={Colors.danger} /></Pressable>
        </View>
      </View>;
    })}
    {ready && !error && !expanded && <Button variant="outline" label={pl ? 'Dodaj materiał do wspólnego koszyka' : 'Add material to the common basket'} disabled={items.length >= MAX_BASKET_EXTRAS} onPress={() => { setEditingId(null); setCustom(false); setExpanded(true); }} />}
    {items.length >= MAX_BASKET_EXTRAS && <Txt>{pl ? 'Możesz dopisać do 50 dodatkowych pozycji.' : 'You can add up to 50 additional items.'}</Txt>}
    {expanded && ready && !error && <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>{[false, true].map(value => <Pressable key={String(value)} accessibilityRole="radio" accessibilityState={{ checked: custom === value }} onPress={() => { setCustom(value); setReferenceId(null); setQuantity(''); }} style={{ flex: 1, minHeight: 48, padding: 10, borderRadius: 10, backgroundColor: custom === value ? Colors.primaryBg : Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' }}><Txt w="semibold">{value ? (pl ? 'Własna pozycja' : 'Custom item') : (pl ? 'Z katalogu' : 'From catalogue')}</Txt></Pressable>)}</View>
      {custom ? <>
        <TextInput accessibilityLabel={pl ? 'Nazwa dodatkowego materiału' : 'Additional material name'} placeholder={pl ? 'Dokładna nazwa produktu' : 'Exact product name'} maxLength={200} value={name} onChangeText={setName} style={field} />
        <Txt>{pl ? 'Jednostka zapotrzebowania' : 'Demand unit'}</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{EXTRA_UNITS.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={value} accessibilityState={{ checked: unit === value }} onPress={() => setUnit(value)} style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: unit === value ? Colors.primaryBg : Colors.surfaceAlt }}><Txt>{value}</Txt></Pressable>)}</View>
      </> : <>
        <TextInput accessibilityLabel={pl ? 'Szukaj dodatkowego materiału w katalogu' : 'Search additional catalogue materials'} placeholder={pl ? 'Nazwa, marka lub EAN, np. Soudal' : 'Name, brand or EAN, e.g. Soudal'} value={search} onChangeText={value => { setSearch(value); setReferenceId(null); setQuantity(''); }} style={field} />
        <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Katalog zawiera również produkty bez potwierdzonej oferty. Cenę i dostawę sprawdzimy po dodaniu.' : 'The catalogue includes items without confirmed offers. We check price and delivery after adding.'}</Txt>
        {(query || referenceId ? found.slice(0, 8) : found.slice(0, 4)).map(product => <Pressable key={product.id} accessibilityRole="radio" accessibilityLabel={product.productLabel} accessibilityState={{ checked: referenceId === product.id }} onPress={() => { setReferenceId(product.id); setQuantity(String(product.packageSize)); }} style={{ minHeight: 72, padding: 10, flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 10, borderColor: referenceId === product.id ? Colors.primary : Colors.border, backgroundColor: referenceId === product.id ? Colors.primaryBg : Colors.surface }}><ProductImage uri={getProductPhoto(product)} name={product.productLabel} size={44} /><View style={{ flex: 1 }}><Txt w="medium">{product.productLabel}</Txt><Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{product.packageSize} {product.packageUnit} / {pl ? 'opakowanie' : 'pack'}</Txt></View></Pressable>)}
        {!found.length && <Txt>{pl ? 'Nie znaleziono. Wybierz „Własna pozycja”, aby wpisać materiał.' : 'No match. Choose Custom item to enter a material.'}</Txt>}
        {found.length > (query || referenceId ? 8 : 4) && <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? 'Wpisz bardziej szczegółową nazwę, aby zawęzić wyniki.' : 'Enter a more specific name to narrow the results.'}</Txt>}
      </>}
      {(custom || ref) && <>
        {ref && <Txt w="semibold">{pl ? 'Wybrano' : 'Selected'}: {ref.productLabel}</Txt>}
        <Txt>{pl ? 'Potrzebna ilość' : 'Required quantity'} ({custom ? unit : ref?.packageUnit})</Txt>
        <TextInput accessibilityLabel={pl ? 'Potrzebna ilość dodatkowego materiału' : 'Additional material quantity'} keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} maxLength={13} style={field} />
        {quantity && demand === null ? <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Wpisz ilość większą od zera, do 100 000 (maksymalnie 6 cyfr po przecinku).' : 'Enter a quantity above zero, up to 100,000 (at most 6 decimal places).'}</Txt> : null}
        <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Wpisz zapotrzebowanie w podanej jednostce. Liczbę pełnych opakowań dobierzemy po zsumowaniu całego remontu.' : 'Enter demand in the displayed unit. Full packs are calculated after combining the renovation.'}</Txt>
      </>}
      <Button label={editingId ? (pl ? 'Zapisz dodatkową pozycję' : 'Save additional item') : (pl ? 'Dodaj do porównania' : 'Add to comparison')} disabled={demand === null || (!custom && !ref) || (custom && !validName)} onPress={add} />
      <Button variant="ghost" label={pl ? 'Anuluj' : 'Cancel'} onPress={reset} />
    </View>}
  </View>;
}
