import React, { useState } from 'react';
import { View, Pressable, TextInput, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import { parseDeliveryCosts, normalizeDeliveryPostalCode } from '@/features/pricing/deliveryInput';
import { ProductImage } from './ProductImage';
import type { DeliveryComparison, DeliverySettings } from '../../../../lib/pricing-service/src/delivery';

export function DeliveryComparisonSection({ comparison, settings, onApply }: {
  comparison: DeliveryComparison; settings: DeliverySettings;
  onApply: (settings: DeliverySettings) => void;
}) {
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => language === 'pl' ? pl : en;
  const [editing, setEditing] = useState(!comparison.best && settings.mode === 'shipping');
  const [mode, setMode] = useState(settings.mode);
  const [postalCode, setPostalCode] = useState(settings.postalCode ?? '');
  const [postalInvalid, setPostalInvalid] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(comparison.policies.map(policy => {
    const fee = settings.costsGrosze?.[policy.store];
    return [policy.store, fee === undefined ? '' : (fee / 100).toFixed(2).replace('.', ',')];
  })));
  const [invalid, setInvalid] = useState<string | null>(null);
  const best = comparison.best;
  const basket = best ?? comparison.lowerBound;
  const title = comparison.status === 'compared'
    ? tr('Najtańszy zestaw według podanych kosztów', 'Lowest basket total for your delivery costs')
    : tr('Najtańszy policzony zestaw', 'Lowest fully costed basket');
  const partial = comparison.status === 'partial';
  return <View style={{ gap: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Feather name="truck" size={20} color={Colors.primary} />
      <Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{tr('Cały zestaw i dostawa', 'Complete basket and delivery')}</Txt>
    </View>
    {partial && <Txt accessibilityRole="alert" style={{ color: Colors.danger, lineHeight: 21 }}>{tr(
      `Dla ${comparison.missingProductCount} pozycji brakuje oferty. Pełnej ceny zestawu nie można jeszcze porównać.`,
      `Offers are missing for ${comparison.missingProductCount} items. The full basket cannot be compared yet.`,
    )}</Txt>}
    {comparison.status === 'limit_exceeded' && <Txt>{tr('Lista przekracza zakres pełnego porównania. Podziel ją na mniejsze zakupy.', 'This list exceeds the full comparison limit. Split it into smaller purchases.')}</Txt>}
    {basket && <View style={{ backgroundColor: best ? Colors.primaryBg : Colors.warningBg, padding: 16, borderRadius: 16, gap: 8 }}>
      <Txt w="bold" style={{ fontSize: 15 }}>{best ? title : tr('Uzupełnij koszty dostaw, aby porównać całość', 'Add delivery costs to compare the full total')}</Txt>
      {comparison.postalCode && <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{tr('Kod dostawy', 'Delivery postcode')}: {comparison.postalCode}</Txt>}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <Txt>{tr('Produkty', 'Products')}</Txt><Txt w="semibold">{formatGrosze(basket.materialsGrosze)}</Txt>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <Txt>{tr('Dostawa', 'Delivery')}</Txt><Txt w="semibold" style={{ flexShrink: 1 }}>{basket.deliveryGrosze === null ? tr('Do potwierdzenia', 'To be confirmed') : formatGrosze(basket.deliveryGrosze)}</Txt>
      </View>
      {best && <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, gap: 4 }}>
        <Txt>{tr('Razem: produkty i podane dostawy', 'Total: products and entered delivery fees')}</Txt>
        <Txt w="bold" style={{ fontSize: 26, color: Colors.primaryDark }}>{formatGrosze(best.totalGrosze!)}</Txt>
      </View>}
      {comparison.status === 'needs_delivery_costs' && <Txt style={{ fontSize: 12, lineHeight: 18 }}>{tr(
        'Część dostaw nie ma potwierdzonej ceny. Dopóki jej nie podasz, inny zestaw może okazać się tańszy.',
        'Some delivery prices are unknown. Another basket may be cheaper until you add those costs.',
      )}</Txt>}
      <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{tr(
        settings.mode === 'pickup' ? 'Odbiór we własnym zakresie. Dojazd jest poza sumą; potwierdź dostępność w wybranych placówkach.' : 'Dostawa liczona raz za całe zamówienie z każdego sklepu. Kwoty podane przez Ciebie; sprawdź je ponownie w koszykach sklepów po zmianie zestawu.',
        settings.mode === 'pickup' ? 'Self collection. Travel is excluded; confirm availability at the selected branches.' : 'Delivery is charged once per store order. These are your entered fees; recheck them in store baskets after changing the items.',
      )}</Txt>
    </View>}
    <Pressable onPress={() => setEditing(value => !value)} accessibilityRole="button" style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Feather name={editing ? 'chevron-up' : 'settings'} size={18} color={Colors.primary} />
      <Txt w="semibold" style={{ color: Colors.primary }}>{tr('Ustaw dostawę lub własny odbiór', 'Set delivery or self collection')}</Txt>
    </Pressable>
    {editing && <View style={{ padding: 14, gap: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.surface }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['shipping', 'pickup'] as const).map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: mode === value }} onPress={() => setMode(value)} style={{ flex: 1, minHeight: 48, padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: value === mode ? Colors.primaryBg : Colors.surfaceAlt }}>
          <Txt w="semibold">{value === 'shipping' ? tr('Dostawa do domu', 'Home delivery') : tr('Własny odbiór', 'Self collection')}</Txt>
        </Pressable>)}
      </View>
      {mode === 'shipping' && <>
        <Txt w="semibold">{tr('Kod pocztowy dostawy', 'Delivery postcode')}</Txt>
        <TextInput accessibilityLabel={tr('Kod pocztowy dostawy', 'Delivery postcode')} placeholder="00-000" value={postalCode} keyboardType="number-pad" maxLength={6} onChangeText={value => {
          setPostalCode(value); setPostalInvalid(false);
          // A fee quoted for another destination must be explicitly checked again.
          if (normalizeDeliveryPostalCode(value) !== settings.postalCode) setDraft({});
        }} style={{ minHeight: 48, borderWidth: 1, borderColor: postalInvalid ? Colors.danger : Colors.border, borderRadius: 10, paddingHorizontal: 12, color: Colors.text }} />
        <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{tr('Podaj cenę brutto dostawy do całego zamówienia na swój adres. Znajdziesz ją w koszyku sklepu. Puste pole oznacza brak wyceny; wpisz 0 tylko dla potwierdzonej bezpłatnej dostawy. Stawki „od” są wskazówką. Zmiana kodu usuwa poprzednie koszty dostawy.', 'Enter gross delivery cost for the whole store order to your address, as quoted in the store basket. Blank means unknown; enter 0 only for confirmed free delivery. “From” rates are guidance. Changing the postcode clears previous delivery costs.')}</Txt>
        {comparison.policies.map(policy => <View key={policy.store} style={{ gap: 6 }}>
          <Txt w="semibold">{policy.store}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput accessibilityLabel={tr(`Koszt dostawy — ${policy.store}`, `Delivery cost — ${policy.store}`)} placeholder={tr('Do potwierdzenia', 'To be confirmed')} value={draft[policy.store] ?? ''} onChangeText={value => { setDraft(previous => ({ ...previous, [policy.store]: value })); setInvalid(null); }} keyboardType="decimal-pad" maxLength={10} style={{ flex: 1, minHeight: 48, borderWidth: 1, borderColor: invalid === policy.store ? Colors.danger : Colors.border, borderRadius: 10, paddingHorizontal: 12, color: Colors.text }} />
            <Txt>PLN</Txt>
          </View>
          {policy.sourceUrl && <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(policy.sourceUrl!)} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Txt style={{ color: Colors.primary, fontSize: 12 }}>{policy.minimumGrosze === null ? tr('Sprawdź warunki dostawy ↗', 'Check delivery terms ↗') : tr(`Kurier od ${formatGrosze(policy.minimumGrosze)} · warunki ↗`, `Courier from ${formatGrosze(policy.minimumGrosze)} · terms ↗`)}</Txt>
          </Pressable>}
        </View>)}
      </>}
      {invalid && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{tr(`${invalid}: wpisz kwotę od 0 do 100 000 zł, najwyżej 2 cyfry po przecinku.`, `${invalid}: enter 0–100,000 PLN with at most 2 decimal places.`)}</Txt>}
      {postalInvalid && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{tr('Podaj kod pocztowy dostawy w formacie 00-000.', 'Enter a delivery postcode in the format 00-000.')}</Txt>}
      <Button label={tr('Przelicz cały zestaw', 'Recalculate the full basket')} onPress={() => {
        const destination = normalizeDeliveryPostalCode(postalCode);
        if (mode === 'shipping' && !destination) { setPostalInvalid(true); return; }
        const parsed = parseDeliveryCosts(draft);
        if (mode === 'shipping' && !parsed.ok) { setInvalid(parsed.store); return; }
        onApply({ mode, ...(destination ? { postalCode: destination } : {}), costsGrosze: parsed.ok ? parsed.costsGrosze : settings.costsGrosze });
      }} />
    </View>}
    {best && best.stores.map(store => <View key={store.store} style={{ padding: 14, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 12 }}>
      <Txt w="bold" style={{ fontSize: 16 }}>{store.store} · {formatGrosze(store.totalGrosze!)}</Txt>
      <Txt style={{ color: Colors.textSecondary, fontSize: 12 }}>{tr('Produkty', 'Products')}: {formatGrosze(store.materialsGrosze)} · {tr('Dostawa', 'Delivery')}: {formatGrosze(store.deliveryGrosze!)}</Txt>
      {store.lines.map(line => <View key={line.product.id} style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ProductImage uri={line.product.imageUrl ?? undefined} name={line.product.name} size={56} />
          <Txt w="medium" style={{ flex: 1, fontSize: 14 }}>{line.product.name}</Txt>
        </View>
        {line.packages.map(pack => <View key={pack.offerId} style={{ gap: 2 }}>
          <Txt>{pack.count} × {pack.packageSize} {line.unit} · {formatGrosze(pack.lineCostGrosze)}</Txt>
          {pack.url && <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(pack.url!)} style={{ minHeight: 44, justifyContent: 'center' }}><Txt w="semibold" style={{ color: Colors.primary }}>{tr('Sprawdź produkt w sklepie ↗', 'View product in store ↗')}</Txt></Pressable>}
        </View>)}
      </View>)}
    </View>)}
  </View>;
}
