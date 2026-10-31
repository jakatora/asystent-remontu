import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { normalizeDeliveryPostalCode } from '@/features/pricing/deliveryInput';
import type { DeliverySettings } from '../../../../lib/pricing-service/src/delivery';

/** Remains mounted when a quote is loading or fails. Draft edits hide old totals. */
export function DeliverySettingsForm({ settings, onApply, onPendingChange }: {
  settings: DeliverySettings;
  onApply: (settings: DeliverySettings) => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => language === 'pl' ? pl : en;
  const [postalCode, setPostalCode] = useState(settings.postalCode ?? '');
  const [comparisonOptionsOpen, setComparisonOptionsOpen] = useState(false);
  const mode = settings.mode, allowSeparateOrders = settings.allowSeparateOrders ?? true;
  const destination = normalizeDeliveryPostalCode(postalCode);
  useEffect(() => { setPostalCode(settings.postalCode ?? ''); }, [settings.postalCode]);
  const apply = (next: DeliverySettings) => onApply({ ...next, allowSeparateOrders: next.allowSeparateOrders ?? allowSeparateOrders });
  const commitDestination = () => {
    if (mode !== 'shipping') return;
    if (destination && (destination !== settings.postalCode || settings.method === 'manual')) apply({ mode, method: 'automatic', postalCode: destination });
    else if (!destination && settings.postalCode) apply({ mode, method: 'automatic' });
    else onPendingChange(false);
  };
  useEffect(() => {
    if (mode !== 'shipping' || !destination || (destination === settings.postalCode && settings.method !== 'manual')) return;
    const timer = setTimeout(() => onApply({ mode: 'shipping', method: 'automatic', postalCode: destination, allowSeparateOrders }), 650);
    return () => clearTimeout(timer);
  }, [destination, mode, settings.postalCode, settings.method, allowSeparateOrders, onApply]);
  return <View style={{ padding: 14, gap: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface }}>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {(['shipping', 'pickup'] as const).map(value => <Pressable key={value} nativeID={`delivery-mode-${value}`} accessibilityRole="radio" aria-checked={mode === value} accessibilityState={{ checked: mode === value }} onPress={() => {
        apply({ mode: value, method: 'automatic', ...(destination ? { postalCode: destination } : {}) });
      }} style={{ flex: 1, minHeight: 48, padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: value === mode ? Colors.primaryBg : Colors.surfaceAlt }}>
        <Txt w="semibold">{value === 'shipping' ? tr('Dostawa do domu', 'Home delivery') : tr('Własny odbiór', 'Self collection')}</Txt>
      </Pressable>)}
    </View>
    {mode === 'pickup' && <View style={{ padding: 12, borderRadius: 10, backgroundColor: Colors.warningBg }}>
      <Txt style={{ fontSize: 14, lineHeight: 21 }}>{tr('Porównujemy ceny materiałów bez dostawy. Dostępność wszystkich opakowań w konkretnym oddziale oraz koszt dojazdu nie są sprawdzone. Potwierdź możliwość odbioru w sklepie przed wyjazdem.', 'We compare material prices without delivery. Availability of every pack at a particular branch and travel costs have not been checked. Confirm collection with the store before travelling.')}</Txt>
    </View>}
    {mode === 'shipping' && <>
      <Txt w="semibold">{tr('Twój kod pocztowy', 'Your postcode')}</Txt>
      <TextInput accessibilityLabel={tr('Kod pocztowy dostawy', 'Delivery postcode')} placeholder="00-000" value={postalCode} keyboardType="number-pad" maxLength={6} onChangeText={value => {
        const digits = value.replace(/\D/g, '').slice(0, 5), next = digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
        setPostalCode(next);
        onPendingChange((normalizeDeliveryPostalCode(next) ?? '') !== (settings.postalCode ?? ''));
      }} onBlur={event => {
        // source: https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/relatedTarget
        const focus = event as unknown as { relatedTarget?: { id?: string }; nativeEvent?: { relatedTarget?: { id?: string } } };
        if (Platform.OS === 'web' && ['delivery-mode-shipping', 'delivery-mode-pickup', 'delivery-orders-separate', 'delivery-orders-single'].includes(focus.relatedTarget?.id ?? focus.nativeEvent?.relatedTarget?.id ?? '')) return;
        commitDestination();
      }} onSubmitEditing={commitDestination} style={{ minHeight: 50, fontSize: 18, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, color: Colors.text }} />
      <Txt style={{ fontSize: 13, lineHeight: 19, color: Colors.textSecondary }}>{tr('Wpisz 5 cyfr. Automatycznie sprawdzimy koszyki sklepów i doliczymy dostawę całego zamówienia.', 'Enter 5 digits. We will automatically check store baskets and add delivery for the whole order.')}</Txt>
      <Pressable accessibilityRole="button" aria-expanded={comparisonOptionsOpen} accessibilityState={{ expanded: comparisonOptionsOpen }} onPress={() => setComparisonOptionsOpen(value => !value)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name={comparisonOptionsOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.primary} />
        <Txt w="semibold" style={{ flex: 1, color: Colors.primary }}>{tr('Sposób porównania', 'Comparison options')}</Txt>
        <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{allowSeparateOrders ? tr('najniższa cena', 'lowest price') : tr('1 zamówienie/sklep', '1 order/store')}</Txt>
      </Pressable>
      {comparisonOptionsOpen && <View style={{ gap: 6 }}>
        {[true, false].map(value => <Pressable key={String(value)} nativeID={value ? 'delivery-orders-separate' : 'delivery-orders-single'} accessibilityRole="radio" aria-checked={allowSeparateOrders === value} accessibilityState={{ checked: allowSeparateOrders === value }} onPress={() => apply({ mode, method: 'automatic', ...(destination ? { postalCode: destination } : {}), allowSeparateOrders: value })} style={{ minHeight: 48, padding: 10, borderRadius: 10, backgroundColor: allowSeparateOrders === value ? Colors.primaryBg : Colors.surfaceAlt }}>
          <Txt w="semibold">{value ? tr('Najtaniej, także osobne zamówienia', 'Lowest cost, including separate orders') : tr('Jedno zamówienie w każdym sklepie', 'One order per store')}</Txt>
        </Pressable>)}
        <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{tr('Osobne zamówienia mogą obniżyć koszt dostawy. W szczegółach pokażemy dokładnie, co zamówić oddzielnie.', 'Separate orders may lower delivery costs. The details show exactly which products to order separately.')}</Txt>
      </View>}
    </>}
  </View>;
}
