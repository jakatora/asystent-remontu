import React, { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { CalculationResult } from '@/types/domain';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { getProductPhoto } from '@/data/products/photos';
import { ProductImage } from './ProductImage';
import { DOOR_LEAVES, makeDoorSelection, type DoorLeafChoice, type DoorSelection } from '@/features/pricing/doorSelection';

export function DoorSelectionSection({ calc, selection, ready, readFailed, saveFailed, onChange }: {
  calc: CalculationResult; selection: DoorSelection | null; ready: boolean; readFailed: boolean; saveFailed: boolean; onChange: (value: DoorSelection) => void;
}) {
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => language === 'pl' ? pl : en;
  const [expanded, setExpanded] = useState(false);
  const setLeaf = (leaf: DoorLeafChoice) => onChange(makeDoorSelection(calc, leaf, selection?.frameOwned ?? false, selection?.handleOwned ?? false));
  const selectedLeaf = DOOR_LEAVES.find(leaf => leaf.id === selection?.leaf);
  const choose = (label: string, checked: boolean, action: () => void, extra?: React.ReactNode) => <Pressable
    accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked, disabled: !ready }} disabled={!ready} onPress={action}
    style={({ pressed }) => ({ minHeight: 48, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: checked ? Colors.primary : Colors.border, backgroundColor: checked ? Colors.primaryBg : Colors.surface, opacity: pressed ? 0.75 : 1, flexDirection: 'row', alignItems: 'center', gap: 10 })}>
    <Feather name={checked ? 'check-circle' : 'circle'} size={20} color={checked ? Colors.primary : Colors.textSecondary} />{extra}<Txt style={{ flex: 1, lineHeight: 21 }}>{label}</Txt>
  </Pressable>;
  return <View style={{ padding: 14, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 10 }}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Feather name="sliders" size={20} color={Colors.primary} /><View style={{ flex: 1, gap: 4 }}>
        <Txt w="semibold">{tr('Dobierz drzwi do wyceny', 'Choose the door components')}</Txt>
        <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{selection ? [selection.leaf === 'owned' ? tr('Skrzydło: mam', 'Leaf: owned') : selectedLeaf ? (language === 'pl' ? selectedLeaf.label : selectedLeaf.labelEn) : tr('Skrzydło: do wyboru', 'Leaf: choose a model'), selection.frameOwned ? tr('Ościeżnica: mam', 'Frame: owned') : tr('Ościeżnica: do dobrania', 'Frame: needs matching')].join(' · ') : tr('Wybierz skrzydło i zaznacz, czy masz pasującą ościeżnicę.', 'Choose a leaf and say whether you own a matching frame.')}</Txt>
      </View><Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
    </Pressable>
    {expanded && <View style={{ gap: 10 }}>
      <Txt style={{ color: Colors.textSecondary, lineHeight: 21 }}>{tr('Dobierz rozmiar i stronę do obmiarów oraz instrukcji producenta. Skrzydło, ościeżnicę i klamkę liczymy osobno. Pianka i próg pozostają na liście. Po zmianie obmiarów dobierz części ponownie.', 'Match the size and opening direction to your measurements and the manufacturer instructions. Leaf, frame and handle are priced separately. Foam and threshold stay on the list. Choose the parts again after changing measurements.')}</Txt>
      <Txt w="semibold">{tr('Skrzydło', 'Door leaf')}</Txt>
      {choose(tr('Dobiorę inny model — zostaw do wyceny', 'Choose another model — keep unpriced'), selection?.leaf === null, () => setLeaf(null))}
      {DOOR_LEAVES.map(leaf => { const ref = MATERIAL_PRICES.find(ref => ref.id === leaf.id)!; return <View key={leaf.id} style={{ gap: 6 }}>
        {choose(language === 'pl' ? leaf.label : leaf.labelEn, selection?.leaf === leaf.id, () => setLeaf(leaf.id), <ProductImage uri={getProductPhoto(ref)} name={ref.productLabel} size={48} />)}
        {leaf.id === 'mat-door-leaf-opp-archi-full-80-left' && <Txt style={{ paddingHorizontal: 12, fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{tr('Inny model niż starsze Archi: 2035 × 844 × 39,5 mm. Bez wentylacji, bez możliwości przycięcia. Zawiasy w zestawie; ościeżnica, klamka i mocowania osobno. Sprawdź zgodność przed wyborem.', 'A different model from the older Archi: 2035 × 844 × 39.5 mm. No ventilation; cannot be trimmed. Hinges included; frame, handle and fixings separate. Check compatibility before choosing.')}</Txt>}
        <Pressable accessibilityRole="link" onPress={() => { if (ref.sourceUrl) void Linking.openURL(ref.sourceUrl); }} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}><Txt style={{ color: Colors.primary, fontSize: 13 }}>{tr('Sprawdź wymiary i zestaw w sklepie ↗', 'Check dimensions and included parts in the shop ↗')}</Txt></Pressable>
      </View>; })}
      {choose(tr('Mam już pasujące skrzydło', 'I already own a matching leaf'), selection?.leaf === 'owned', () => setLeaf('owned'))}
      <Txt w="semibold">{tr('Kompletna ościeżnica', 'Complete door frame')}</Txt>
      {choose(tr('Potrzebuję ościeżnicy — dobiorę zgodny komplet', 'I need a frame — keep a matching set unpriced'), selection?.frameOwned === false, () => onChange(makeDoorSelection(calc, selection?.leaf ?? null, false, selection?.handleOwned ?? false)))}
      {choose(tr('Mam kompletną ościeżnicę pasującą do tego skrzydła', 'I own a complete frame matching this leaf'), selection?.frameOwned === true, () => onChange(makeDoorSelection(calc, selection?.leaf ?? null, true, selection?.handleOwned ?? false)))}
      {!selection?.frameOwned && <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{tr('Karta bazy PerfectDoor nie potwierdza pełnego kompletu ościeżnicy. Pozostawiamy go do dobrania, aby wycena obejmowała wszystkie potrzebne elementy.', 'The PerfectDoor base card does not confirm a complete frame assembly. It stays unpriced until matched, so the quote includes all the required parts.')}</Txt>}
      <Txt w="semibold">{tr('Klamka z szyldami', 'Handle and escutcheons')}</Txt>
      {choose(tr('Potrzebuję klamki — zostaw do dobrania', 'I need a handle — keep it unpriced'), selection?.handleOwned === false, () => onChange(makeDoorSelection(calc, selection?.leaf ?? null, selection?.frameOwned ?? false, false)))}
      {choose(tr('Mam klamkę z szyldami pasującą do zamka i drzwi', 'I own a handle and escutcheons matching the lock and door'), selection?.handleOwned === true, () => onChange(makeDoorSelection(calc, selection?.leaf ?? null, selection?.frameOwned ?? false, true)))}
    </View>}
    {readFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{tr('Nie odczytano doboru drzwi. Wybierz części ponownie.', 'Door choices could not be loaded. Select the parts again.')}</Txt>}
    {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{tr('Nie zapisano doboru drzwi. Wspólny koszyk może go nie uwzględnić; spróbuj wybrać ponownie.', 'Door choices were not saved. The whole renovation basket may not use them; try selecting again.')}</Txt>}
  </View>;
}
