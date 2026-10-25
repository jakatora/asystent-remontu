import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import { normalizeDeliveryPostalCode } from '@/features/pricing/deliveryInput';
import { ProductImage } from './ProductImage';
import { PriceChangeBadge } from './PriceChangeNotice';
import type { DeliveryComparison, DeliverySettings } from '../../../../lib/pricing-service/src/delivery';

export function DeliveryComparisonSection({ comparison, settings, onApply }: {
  comparison: DeliveryComparison; settings: DeliverySettings;
  onApply: (settings: DeliverySettings) => void;
}) {
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => language === 'pl' ? pl : en;
  const [mode, setMode] = useState(settings.mode);
  const [postalCode, setPostalCode] = useState(settings.postalCode ?? '');
  const [details, setDetails] = useState(false);
  const destination = normalizeDeliveryPostalCode(postalCode);
  useEffect(() => {
    if (mode !== 'shipping' || !destination || (destination === settings.postalCode && settings.method !== 'manual')) return;
    const timer = setTimeout(() => onApply({ mode: 'shipping', method: 'automatic', postalCode: destination }), 650);
    return () => clearTimeout(timer);
  }, [destination, mode, settings.postalCode, settings.method, onApply]);
  const current = mode === comparison.mode && (mode === 'pickup' || destination === comparison.postalCode);
  const best = current ? comparison.best : null;
  useEffect(() => {
    const expiries = best?.stores.flatMap(store => store.quote ? [Date.parse(store.quote.expiresAt)] : []) ?? [];
    if (!expiries.length) return;
    const timer = setTimeout(() => onApply({ mode, method: 'automatic', ...(destination ? { postalCode: destination } : {}) }), Math.max(0, Math.min(...expiries) - Date.now() + 100));
    return () => clearTimeout(timer);
  }, [best, mode, destination, onApply]);
  const reason = (code: string) => ({
    integration_unavailable: tr('Sklep nie udostępnia jeszcze automatycznej wyceny.', 'Automatic quoting is not available yet.'),
    branch_and_address_required: tr('Sklep wymaga wyboru oddziału i pełnego adresu.', 'This store requires a branch and full address.'),
    retailer_access_required: tr('Automatyczny odczyt kalkulatora sklepu jest niedostępny. Potrzebna integracja ze sklepem.', 'The store calculator cannot be read automatically. A store integration is required.'),
    retailer_checkout_unconfirmed: tr('Nie udało się potwierdzić zakupu w tym sklepie.', 'Purchasing from this store could not be confirmed.'),
    address_required: tr('Sklep wymaga pełnego adresu dla tego transportu.', 'This transport requires a full address.'),
    price_changed: tr('Cena produktu zmieniła się w koszyku sklepu.', 'The product price has changed in the store basket.'),
    product_unavailable: tr('Nie potwierdzono dostępności produktu.', 'Product availability could not be confirmed.'),
    insufficient_stock: tr('Sklep nie ma wystarczającej liczby sztuk do tego zamówienia.', 'The store does not have enough units for this order.'),
    no_home_delivery: tr('Brak potwierdzonej dostawy kurierskiej.', 'No confirmed home courier delivery.'),
    quote_busy: tr('Wycena zajęta. Spróbuj ponownie za chwilę.', 'Quoting is busy. Please retry shortly.'),
  }[code] ?? tr('Nie udało się pobrać wyceny koszyka.', 'The basket quote could not be retrieved.'));
  return <View style={{ gap: 14 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Feather name="truck" size={20} color={Colors.primary} />
      <Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{tr('Cały zestaw z dostawą', 'Complete basket with delivery')}</Txt>
    </View>
    <View style={{ padding: 14, gap: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['shipping', 'pickup'] as const).map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: mode === value }} onPress={() => {
          setMode(value); onApply({ mode: value, method: 'automatic', ...(destination ? { postalCode: destination } : {}) });
        }} style={{ flex: 1, minHeight: 48, padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: value === mode ? Colors.primaryBg : Colors.surfaceAlt }}>
          <Txt w="semibold">{value === 'shipping' ? tr('Dostawa do domu', 'Home delivery') : tr('Własny odbiór', 'Self collection')}</Txt>
        </Pressable>)}
      </View>
      {mode === 'shipping' && <>
        <Txt w="semibold">{tr('Twój kod pocztowy', 'Your postcode')}</Txt>
        <TextInput accessibilityLabel={tr('Kod pocztowy dostawy', 'Delivery postcode')} placeholder="00-000" value={postalCode} keyboardType="number-pad" maxLength={6} onChangeText={value => {
          const digits = value.replace(/\D/g, '').slice(0,5);
          setPostalCode(digits.length > 2 ? `${digits.slice(0,2)}-${digits.slice(2)}` : digits);
        }} style={{ minHeight: 50, fontSize: 18, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, color: Colors.text }} />
        <Txt style={{ fontSize: 13, lineHeight: 19, color: Colors.textSecondary }}>{tr('Wpisz 5 cyfr. Automatycznie sprawdzimy koszyki sklepów i doliczymy dostawę całego zamówienia.', 'Enter 5 digits. We will automatically check store baskets and add delivery for the whole order.')}</Txt>
      </>}
    </View>
    {comparison.status === 'partial' && <Txt accessibilityRole="alert" style={{ color: Colors.danger, lineHeight: 21 }}>{tr(`Brakuje ofert dla ${comparison.missingProductCount} pozycji. Nie można jeszcze wycenić całego zestawu.`, `Offers are missing for ${comparison.missingProductCount} items. The full basket cannot be priced yet.`)}</Txt>}
    {current && comparison.status === 'limit_exceeded' && <Txt>{tr('Ten zestaw przekracza zakres porównania. Podziel zakupy na mniejsze zestawy.', 'This basket exceeds the comparison limit. Split it into smaller purchases.')}</Txt>}
    {current && comparison.searchLimited && <View style={{ padding: 12, borderRadius: 12, backgroundColor: Colors.warningBg }}><Txt accessibilityRole="alert" style={{ lineHeight: 20 }}>{tr(`Duży remont: sprawdzono wybrane pełne zestawy. Wyceny z dostawą: ${comparison.comparedBasketCount ?? 0}. Inne kombinacje mogą być tańsze.`, `Large renovation: selected complete baskets were checked. Baskets quoted with delivery: ${comparison.comparedBasketCount ?? 0}. Other combinations may cost less.`)}</Txt></View>}
    {best && <View style={{ backgroundColor: Colors.primaryBg, padding: 18, borderRadius: 16, gap: 10 }}>
      <Txt w="bold" style={{ fontSize: 16 }}>{mode === 'pickup' ? tr('Najtańszy zestaw do odbioru', 'Lowest basket for self collection') : tr('Najtańszy zestaw z wycenioną dostawą', 'Lowest basket with quoted delivery')}</Txt>
      {comparison.postalCode && <Txt style={{ color: Colors.textSecondary }}>{tr('Dostawa do', 'Delivery to')}: {comparison.postalCode}</Txt>}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Txt>{tr('Materiały', 'Materials')}</Txt><Txt w="semibold">{formatGrosze(best.materialsGrosze)}</Txt></View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Txt>{tr('Dostawa', 'Delivery')}</Txt><Txt w="semibold">{formatGrosze(best.deliveryGrosze!)}</Txt></View>
      <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, gap: 4 }}><Txt>{tr('Łączny koszt', 'Total cost')}</Txt><Txt w="bold" style={{ fontSize: 30, color: Colors.primaryDark }}>{formatGrosze(best.totalGrosze!)}</Txt></View>
      <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{mode === 'pickup'
        ? tr('Do sumy nie doliczamy dojazdu. Potwierdź dostępność w wybranych placówkach.', 'Travel is excluded. Confirm availability at the chosen branches.')
        : tr('Ceny brutto z koszyków sklepów, przy płatności z góry. Przy każdej dostawie podajemy, czy wycena dotyczy Twojego kodu, czy taryfy krajowej. Dostępność pełnego adresu potwierdzisz przy zakupie.', 'Gross store basket prices with prepayment. Each delivery shows whether the quote is for your postcode or a national tariff. Confirm full address availability when purchasing.')}</Txt>
      {mode === 'shipping' && comparison.missingDeliveryStores.length > 0 && <Txt style={{ fontSize: 12, lineHeight: 18 }}>{tr(`Porównano dostępne wyceny. Pozostałe sklepy bez wyceny: ${comparison.missingDeliveryStores.length}. Ich oferta może być tańsza.`, `Available quotes compared. Stores without delivery quotes: ${comparison.missingDeliveryStores.length}. They may have a cheaper offer.`)}</Txt>}
      {mode === 'shipping' && Boolean(comparison.partiallyQuotedStores?.length) && <Txt style={{fontSize:12,lineHeight:18}}>{tr('Nie wszystkie inne kombinacje koszyków udało się potwierdzić. Mogą wpłynąć na najniższą cenę.', 'Some other basket combinations could not be confirmed and may affect the lowest total.')}</Txt>}
    </View>}
    {current && destination && !best && comparison.status === 'needs_delivery_costs' && <Txt accessibilityRole="alert">{tr('Brak pełnej wyceny dostawy dla tego zestawu. Poniżej sprawdzisz, które sklepy wymagają potwierdzenia.', 'No complete delivery quote is available for this basket. See below which stores need confirmation.')}</Txt>}
    {best?.stores.map(store => <View key={store.store} style={{ padding: 14, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 12 }}>
      <Txt w="bold" style={{ fontSize: 16 }}>{store.store} · {formatGrosze(store.totalGrosze!)}</Txt>
      <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{tr('Materiały', 'Materials')}: {formatGrosze(store.materialsGrosze)} · {tr('Dostawa', 'Delivery')}: {formatGrosze(store.deliveryGrosze!)}</Txt>
      {store.quote && <View style={{ gap: 4 }}>
        <Txt style={{ color: Colors.primary, fontSize: 13 }}>{store.quote.carrier} · {store.quote.payment}</Txt>
        <Txt style={{ color: Colors.textSecondary, fontSize: 12 }}>{tr('Sprawdzono', 'Checked')}: {new Date(store.quote.checkedAt).toLocaleString(language === 'pl' ? 'pl-PL' : 'en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone:'Europe/Warsaw' })} · {store.quote.destinationScope==='postal_code' ? tr(`wycena dla ${store.quote.postalCode}`, `quote for ${store.quote.postalCode}`) : tr('taryfa Polska', 'Poland tariff')}</Txt>
        {store.quote.dispatchFrom && <Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr('Wysyłka z', 'Dispatched from')}: {store.quote.dispatchFrom}</Txt>}
      </View>}
      {store.lines.map(line => <View key={line.product.id} style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><ProductImage uri={line.product.imageUrl ?? undefined} name={line.product.name} size={56} /><Txt w="medium" style={{ flex: 1, fontSize: 14 }}>{line.product.name}</Txt></View>
        {line.packages.map(pack => <View key={pack.offerId} style={{ gap: 2 }}>
          <Txt>{pack.count} × {pack.packageSize} {line.unit} · {formatGrosze(pack.lineCostGrosze)}</Txt>
          <PriceChangeBadge offerId={pack.offerId} />
          {pack.url && <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(pack.url!)} style={{ minHeight: 44, justifyContent: 'center' }}><Txt w="semibold" style={{ color: Colors.primary }}>{tr('Sprawdź produkt w sklepie ↗', 'View product in store ↗')}</Txt></Pressable>}
        </View>)}
      </View>)}
    </View>)}
    {current && mode === 'shipping' && comparison.unavailableStores?.length ? <>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: details }} onPress={() => setDetails(value => !value)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Feather name={details ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.primary} /><Txt style={{ color: Colors.primary, flex: 1 }}>{tr('Sklepy wymagające potwierdzenia dostawy', 'Stores needing delivery confirmation')}</Txt></Pressable>
      {details && comparison.unavailableStores.map(store => <View key={store.store} style={{ gap: 4 }}>
        <Txt w="semibold">{store.store}{store.partial?tr(' · inne koszyki',' · other baskets'):''}</Txt><Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{reason(store.reason)}</Txt>
        {comparison.policies.find(p => p.store === store.store)?.sourceUrl && <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(comparison.policies.find(p => p.store === store.store)!.sourceUrl!)} style={{ minHeight: 44, justifyContent: 'center' }}><Txt style={{ color: Colors.primary }}>{tr('Warunki sklepu ↗', 'Store terms ↗')}</Txt></Pressable>}
      </View>)}
    </> : null}
    {current && best && comparison.alternatives.length > 0 && <View style={{ gap: 8 }}>
      <Txt w="semibold">{tr('Inne wycenione zestawy', 'Other quoted baskets')}</Txt>
      {comparison.alternatives.slice(0,2).map((basket,index) => <View key={index} style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, gap: 6 }}><Txt>{basket.stores.map(store => store.store).join(' + ')}</Txt><Txt w="semibold">{formatGrosze(basket.totalGrosze!)} · +{formatGrosze(basket.totalGrosze! - best.totalGrosze!)}</Txt></View>)}
    </View>}
    {current && destination && <Button variant="outline" label={tr('Sprawdź dostawy ponownie', 'Check deliveries again')} onPress={() => onApply({ mode, method: 'automatic', postalCode: destination })} />}
    {best && <Txt style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 18 }}>{tr('Porównanie potrzebnych opakowań materiałów, bez dokupowania nadmiaru dla rabatów. Narzędzia i robocizna są liczone osobno.', 'Comparison of required material packs, without buying extras for discounts. Tools and labour are separate.')}</Txt>}
  </View>;
}
