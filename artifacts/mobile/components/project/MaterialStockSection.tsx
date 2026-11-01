import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatPackageSize } from '@/features/pricing/packageDisplay';
import { materialStockKey, parseMaterialStockQuantity, type MaterialStockEntry, type MaterialStockRequirement } from '@/features/pricing/materialStock';

interface Props {
  requirements: readonly MaterialStockRequirement[]; entries: readonly MaterialStockEntry[];
  ready: boolean; readFailed: boolean; saveFailed: boolean; saving: boolean;
  onChange: (entries: readonly MaterialStockEntry[]) => Promise<boolean>; onRetry: () => void;
}
export function MaterialStockSection({ requirements, entries, ready, readFailed, saveFailed, saving, onChange, onRetry }: Props) {
  const { language } = useLanguage(), pl = language === 'pl', tr = (a: string, b: string) => pl ? a : b;
  const [open, setOpen] = useState(false), [editing, setEditing] = useState<string | null>(null), [draft, setDraft] = useState(''), [error, setError] = useState(false);
  if (ready && !requirements.length && !entries.length) return null;
  const quantity = (n: number, unit: string) => `${formatPackageSize(n, language)} ${unit}`;
  const save = async (requirement: MaterialStockRequirement) => {
    const n = parseMaterialStockQuantity(draft, requirement.unit);
    if (n === null) { setError(true); return; }
    setError(false);
    const next = entries.filter(entry => materialStockKey(entry) !== materialStockKey(requirement));
    if (n > 0) next.push({ materialId: requirement.materialId, ean: requirement.ean, name: requirement.name, unit: requirement.unit, quantity: n });
    if (await onChange(next)) setEditing(null);
  };
  const other = entries.filter(entry => !requirements.some(row => materialStockKey(row) === materialStockKey(entry)));
  return <View style={{ padding: 14, gap: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.surface }}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} aria-expanded={open} onPress={() => setOpen(value => !value)} style={{ minHeight: 48, justifyContent: 'center' }}>
      <Txt w="semibold" style={{ color: Colors.primary }}>{tr('Mam część materiałów', 'I already have some materials')}{entries.length ? ` (${entries.length})` : ''}</Txt>
    </Pressable>
    <Txt style={{ color: Colors.textSecondary, fontSize: 13, lineHeight: 20 }}>{tr('Podaj użyteczną ilość przeznaczoną do tego projektu. Kupimy tylko brakującą część. Rozdziel zapas między projekty — każdą ilość wpisz raz.', 'Enter the usable quantity allocated to this project. Only the remainder will be priced. Allocate stock across projects and enter each quantity once.')}</Txt>
    {readFailed && <><Txt accessibilityRole="alert">{tr('Nie odczytano zapasu. Porównanie jest wstrzymane.', 'Stock could not be read. The comparison is paused.')}</Txt><Button variant="outline" label={tr('Odczytaj zapas ponownie', 'Read stock again')} onPress={onRetry} /></>}
    {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{tr('Nie zapisano nowej ilości. Wycena nadal uwzględnia ostatni zapisany zapas. Spróbuj zapisać ponownie.', 'The new quantity was not saved. Pricing still uses the last saved stock. Try saving again.')}</Txt>}
    {open && ready && <>
      <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{tr('Wpisuj kg, litry, ml lub całe sztuki tego samego produktu. Np. jeden worek 30 kg = 30 kg. Zmiana produktu nie przenosi zapasu. Pełne oznaczenia „Mam” i „Kupione” mają pierwszeństwo.', 'Enter kg, litres, ml or whole pieces of the same product. For example, one 30 kg bag = 30 kg. Stock does not transfer to another product. Whole-item Owned and Purchased marks take priority.')}</Txt>
      {requirements.map(requirement => {
        const key = materialStockKey(requirement), saved = entries.find(entry => materialStockKey(entry) === key)?.quantity ?? 0;
        return <View key={key} style={{ gap: 8, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 }}>
          <Txt w="semibold">{requirement.name}</Txt>
          <Txt style={{ fontSize: 13 }}>{tr('Potrzeba łącznie: ', 'Total needed: ')}{quantity(requirement.requiredQuantity, requirement.unit)}{tr(' · zapisany zapas: ', ' · saved stock: ')}{quantity(saved, requirement.unit)}</Txt>
          {editing !== key ? <Button variant="outline" size="sm" label={tr(`Ustaw zapas: ${requirement.name}`, `Set stock: ${requirement.name}`)} disabled={saving} onPress={() => { setEditing(key); setDraft(String(saved)); setError(false); }} /> : <>
            <TextInput accessibilityLabel={tr(`Posiadana ilość: ${requirement.name}`, `Available quantity: ${requirement.name}`)} value={draft} onChangeText={value => { setDraft(value); setError(false); }} keyboardType="decimal-pad" editable={!saving} style={{ minHeight: 48, padding: 12, borderWidth: 1, borderColor: error ? Colors.danger : Colors.border, borderRadius: 10, fontSize: 16, color: Colors.text }} />
            <Txt style={{ fontSize: 13 }}>{tr('Jednostka: ', 'Unit: ')}{requirement.unit}{tr('. Wpisz 0, aby usunąć zapis zapasu.', '. Enter 0 to remove this stock entry.')}</Txt>
            {error && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{tr(`Podaj liczbę od 0 do 100000 ${requirement.unit}${requirement.unit === 'szt' ? ', w całych sztukach' : ''}.`, `Enter a number from 0 to 100000 ${requirement.unit}${requirement.unit === 'szt' ? ', in whole pieces' : ''}.`)}</Txt>}
            <Button label={tr('Zapisz zapas', 'Save stock')} loading={saving} onPress={() => void save(requirement)} />
            <Button variant="ghost" label={tr('Anuluj zmianę zapasu', 'Cancel stock edit')} disabled={saving} onPress={() => setEditing(null)} />
          </>}
        </View>;
      })}
      {other.length > 0 && <Txt w="semibold">{tr('Zapisane dla innych produktów lub pozycji już oznaczonych jako posiadane', 'Saved for other products or items already marked as owned')}</Txt>}
      {other.map(entry => <View key={materialStockKey(entry)} style={{ gap: 6 }}><Txt>{entry.name}: {quantity(entry.quantity, entry.unit)}</Txt><Button variant="ghost" size="sm" disabled={saving} label={tr(`Usuń zapis zapasu: ${entry.name}`, `Remove stock entry: ${entry.name}`)} onPress={() => void onChange(entries.filter(row => materialStockKey(row) !== materialStockKey(entry)))} /></View>)}
    </>}
  </View>;
}
