import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput, Linking, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import { normalizeDeliveryPostalCode } from '@/features/pricing/deliveryInput';
import { pendingDeliveryPlan } from '@/features/pricing/pendingDeliveryPlan';
import { ProductImage } from './ProductImage';
import { PriceVerificationNotice } from './PriceVerificationNotice';
import { getProductPhoto } from '@/data/products/photos';
import { PriceChangeBadge } from './PriceChangeNotice';
import type { DeliveryComparison, DeliverySettings } from '../../../../lib/pricing-service/src/delivery';

export function DeliveryComparisonSection({ comparison, missingItemCount, settings, selectedStore, onApply }: {
  comparison: DeliveryComparison; settings: DeliverySettings;
  selectedStore?: string | null;
  missingItemCount?: number;
  onApply: (settings: DeliverySettings) => void;
}) {
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => language === 'pl' ? pl : en;
  const [mode, setMode] = useState(settings.mode);
  const [postalCode, setPostalCode] = useState(settings.postalCode ?? '');
  const allowSeparateOrders = settings.allowSeparateOrders ?? true;
  const apply = (next: DeliverySettings) => onApply({ ...next, allowSeparateOrders: next.allowSeparateOrders ?? allowSeparateOrders });
  const [details, setDetails] = useState(false);
  const [openProducts, setOpenProducts] = useState<Record<string, boolean>>({});
  const destination = normalizeDeliveryPostalCode(postalCode);
  const commitDestination = () => {
    // Clearing or leaving an incomplete postcode must also forget the saved
    // destination. Blur commits it without interrupting each typed digit.
    if (mode !== 'shipping') return;
    if (destination && (destination !== settings.postalCode || settings.method === 'manual')) apply({ mode: 'shipping', method: 'automatic', postalCode: destination });
    else if (!destination && settings.postalCode) apply({ mode: 'shipping', method: 'automatic' });
  };
  useEffect(() => {
    if (mode !== 'shipping' || !destination || (destination === settings.postalCode && settings.method !== 'manual')) return;
    const timer = setTimeout(() => apply({ mode: 'shipping', method: 'automatic', postalCode: destination }), 650);
    return () => clearTimeout(timer);
  }, [destination, mode, settings.postalCode, settings.method, allowSeparateOrders, onApply]);
  const current = mode === comparison.mode && (mode === 'pickup' || destination === comparison.postalCode && allowSeparateOrders === (comparison.allowSeparateOrders ?? false));
  const best = current ? comparison.best : null;
  const pendingPlan = pendingDeliveryPlan(comparison, current);
  const displayedBasket = best ?? pendingPlan;
  const pendingStores = pendingPlan?.stores.filter(store => store.deliveryGrosze === null) ?? [];
  useEffect(() => {
    const expiries = displayedBasket?.stores.flatMap(store => store.quote ? [Date.parse(store.quote.expiresAt)] : []) ?? [];
    if (!expiries.length) return;
    const timer = setTimeout(() => apply({ mode, method: 'automatic', ...(destination ? { postalCode: destination } : {}) }), Math.max(0, Math.min(...expiries) - Date.now() + 100));
    return () => clearTimeout(timer);
  }, [displayedBasket, mode, destination, allowSeparateOrders, onApply]);
  const reason = (code: string) => ({
    integration_unavailable: tr('Sklep nie udostępnia jeszcze automatycznej wyceny.', 'Automatic quoting is not available yet.'),
    retailer_transport_quote_required: tr('Sklep wycenia transport indywidualnie. Koszt materiałów nie obejmuje tej opłaty.', 'The store quotes transport individually. The material cost excludes this fee.'),
    branch_and_address_required: tr('Sklep wymaga wyboru oddziału i pełnego adresu.', 'This store requires a branch and full address.'),
    retailer_access_required: tr('Automatyczny odczyt kalkulatora sklepu jest niedostępny. Potrzebna integracja ze sklepem.', 'The store calculator cannot be read automatically. A store integration is required.'),
    retailer_checkout_unconfirmed: tr('Nie udało się potwierdzić zakupu w tym sklepie.', 'Purchasing from this store could not be confirmed.'),
    address_required: tr('Sklep wymaga pełnego adresu dla tego transportu.', 'This transport requires a full address.'),
    customer_details_required: tr('Sklep wymaga danych klienta przed wyborem dostawy. Sam kod pocztowy nie wystarcza do potwierdzenia kosztu.', 'The store requires customer details before delivery selection. A postcode alone cannot confirm the cost.'),
    price_changed: tr('Cena produktu zmieniła się w koszyku sklepu.', 'The product price has changed in the store basket.'),
    product_unavailable: tr('Nie potwierdzono dostępności produktu.', 'Product availability could not be confirmed.'),
    insufficient_stock: tr('Sklep nie ma wystarczającej liczby sztuk do tego zamówienia.', 'The store does not have enough units for this order.'),
    purchase_rules_changed: tr('Sklep zmienił minimalną ilość zakupu. Oferta wymaga ponownego sprawdzenia.', 'The minimum order quantity changed. This offer needs to be checked again.'),
    no_home_delivery: tr('Brak potwierdzonej dostawy kurierskiej.', 'No confirmed home courier delivery.'),
    quote_busy: tr('Wycena zajęta. Spróbuj ponownie za chwilę.', 'Quoting is busy. Please retry shortly.'),
  }[code] ?? tr('Nie udało się pobrać wyceny koszyka.', 'The basket quote could not be retrieved.'));
  return <View style={{ gap: 14 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Feather name="truck" size={20} color={Colors.primary} />
      <Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{selectedStore ? tr(`Koszyk: ${selectedStore}`, `Basket: ${selectedStore}`) : tr('Cały zestaw z dostawą', 'Complete basket with delivery')}</Txt>
    </View>
    <View style={{ padding: 14, gap: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['shipping', 'pickup'] as const).map(value => <Pressable key={value} nativeID={`delivery-mode-${value}`} accessibilityRole="radio" aria-checked={mode === value} accessibilityState={{ checked: mode === value }} onPress={() => {
          setMode(value); apply({ mode: value, method: 'automatic', ...(destination ? { postalCode: destination } : {}) });
        }} style={{ flex: 1, minHeight: 48, padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: value === mode ? Colors.primaryBg : Colors.surfaceAlt }}>
          <Txt w="semibold">{value === 'shipping' ? tr('Dostawa do domu', 'Home delivery') : tr('Własny odbiór', 'Self collection')}</Txt>
        </Pressable>)}
      </View>
      {mode === 'shipping' && <>
        <View style={{gap:6}}>
          {[true,false].map(value=><Pressable key={String(value)} nativeID={value?'delivery-orders-separate':'delivery-orders-single'} accessibilityRole="radio" aria-checked={allowSeparateOrders===value} accessibilityState={{checked:allowSeparateOrders===value}} onPress={()=>apply({mode:'shipping',method:'automatic',...(destination?{postalCode:destination}:{}),allowSeparateOrders:value})} style={{minHeight:48,padding:10,borderRadius:10,backgroundColor:allowSeparateOrders===value?Colors.primaryBg:Colors.surfaceAlt}}>
            <Txt w="semibold">{value?tr('Najtaniej, także osobne zamówienia','Lowest cost, including separate orders'):tr('Jedno zamówienie w każdym sklepie','One order per store')}</Txt>
          </Pressable>)}
        </View>
        <Txt w="semibold">{tr('Twój kod pocztowy', 'Your postcode')}</Txt>
        <TextInput accessibilityLabel={tr('Kod pocztowy dostawy', 'Delivery postcode')} placeholder="00-000" value={postalCode} keyboardType="number-pad" maxLength={6} onChangeText={value => {
          const digits = value.replace(/\D/g, '').slice(0,5);
          setPostalCode(digits.length > 2 ? `${digits.slice(0,2)}-${digits.slice(2)}` : digits);
        }} onBlur={event => {
          // On web, blur precedes the mode radio's press. Committing here can
          // unmount that radio while fetching and discard the user's click.
          // Its own press commits both the mode and current destination.
          // source: https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/relatedTarget
          const focus = event as unknown as { relatedTarget?: { id?: string }; nativeEvent?: { relatedTarget?: { id?: string } } };
          if (Platform.OS === 'web' && ['delivery-mode-shipping', 'delivery-mode-pickup', 'delivery-orders-separate', 'delivery-orders-single'].includes(focus.relatedTarget?.id ?? focus.nativeEvent?.relatedTarget?.id ?? '')) return;
          commitDestination();
        }} onSubmitEditing={commitDestination} style={{ minHeight: 50, fontSize: 18, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, color: Colors.text }} />
        <Txt style={{ fontSize: 13, lineHeight: 19, color: Colors.textSecondary }}>{tr('Wpisz 5 cyfr. Automatycznie sprawdzimy koszyki sklepów i doliczymy dostawę całego zamówienia.', 'Enter 5 digits. We will automatically check store baskets and add delivery for the whole order.')}</Txt>
      </>}
    </View>
    {comparison.status === 'partial' && <Txt accessibilityRole="alert" style={{ color: Colors.danger, lineHeight: 21 }}>{tr(`Brakuje wyceny produktów: ${missingItemCount ?? comparison.missingProductCount}. Nie można jeszcze wycenić całego zestawu.`, `Products without a price: ${missingItemCount ?? comparison.missingProductCount}. The full basket cannot be priced yet.`)}</Txt>}
    {current && comparison.status === 'limit_exceeded' && <Txt>{tr('Ten zestaw przekracza zakres porównania. Podziel zakupy na mniejsze zestawy.', 'This basket exceeds the comparison limit. Split it into smaller purchases.')}</Txt>}
    {current && comparison.searchLimited && <View style={{ padding: 12, borderRadius: 12, backgroundColor: Colors.warningBg }}><Txt accessibilityRole="alert" style={{ lineHeight: 20 }}>{tr(`Duży remont: sprawdzono wybrane pełne zestawy. Wyceny z dostawą: ${comparison.comparedBasketCount ?? 0}. Inne kombinacje mogą być tańsze.`, `Large renovation: selected complete baskets were checked. Baskets quoted with delivery: ${comparison.comparedBasketCount ?? 0}. Other combinations may cost less.`)}</Txt></View>}
    {best && <View style={{ backgroundColor: Colors.primaryBg, padding: 18, borderRadius: 16, gap: 10 }}>
      <Txt w="bold" style={{ fontSize: 16 }}>{selectedStore ? (mode === 'pickup' ? tr(`Materiały: ${selectedStore} — bez dostawy`, `Materials: ${selectedStore} — excluding delivery`) : tr(`Zestaw z dostawą: ${selectedStore}`, `Basket with delivery: ${selectedStore}`)) : mode === 'pickup' ? tr('Najtańszy zestaw do odbioru', 'Lowest basket for self collection') : tr('Najtańszy zestaw z wycenioną dostawą', 'Lowest basket with quoted delivery')}</Txt>
      {comparison.postalCode && <Txt style={{ color: Colors.textSecondary }}>{tr('Dostawa do', 'Delivery to')}: {comparison.postalCode}</Txt>}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Txt>{tr('Materiały', 'Materials')}</Txt><Txt w="semibold">{formatGrosze(best.materialsGrosze)}</Txt></View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Txt>{tr('Dostawa', 'Delivery')}</Txt><Txt w="semibold">{formatGrosze(best.deliveryGrosze!)}</Txt></View>
      <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, gap: 4 }}><Txt>{tr('Łączny koszt', 'Total cost')}</Txt><Txt w="bold" style={{ fontSize: 30, color: Colors.primaryDark }}>{formatGrosze(best.totalGrosze!)}</Txt></View>
      <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{mode === 'pickup'
        ? tr('Do sumy nie doliczamy dojazdu. Potwierdź dostępność w wybranych placówkach.', 'Travel is excluded. Confirm availability at the chosen branches.')
        : tr('Ceny brutto produktów i dostaw przy płatności z góry. Przy każdej dostawie pokazujemy podstawę: koszyk dla Twojego kodu lub aktualną taryfę krajową sklepu. Dostępność pełnego adresu potwierdzisz przy zakupie.', 'Gross product and delivery prices with prepayment. Each delivery shows its basis: a basket for your postcode or the current national store tariff. Confirm full address availability when purchasing.')}</Txt>
      {mode === 'shipping' && comparison.missingDeliveryStores.length > 0 && <Txt style={{ fontSize: 12, lineHeight: 18 }}>{tr(`Porównano dostępne wyceny. Pozostałe sklepy bez wyceny: ${comparison.missingDeliveryStores.length}. Ich oferta może być tańsza.`, `Available quotes compared. Stores without delivery quotes: ${comparison.missingDeliveryStores.length}. They may have a cheaper offer.`)}</Txt>}
      {mode === 'shipping' && Boolean(comparison.partiallyQuotedStores?.length) && <Txt style={{fontSize:12,lineHeight:18}}>{tr('Nie wszystkie inne kombinacje koszyków udało się potwierdzić. Mogą wpłynąć na najniższą cenę.', 'Some other basket combinations could not be confirmed and may affect the lowest total.')}</Txt>}
    </View>}
    {current && destination && !best && comparison.status === 'needs_delivery_costs' && <Txt accessibilityRole="alert">{tr('Brak pełnej wyceny dostawy dla tego zestawu. Poniżej sprawdzisz, które sklepy wymagają potwierdzenia.', 'No complete delivery quote is available for this basket. See below which stores need confirmation.')}</Txt>}
    {pendingPlan && <View style={{ padding: 18, gap: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
      <Txt w="bold" style={{ fontSize: 18 }}>{tr('Plan zakupów — dostawy do potwierdzenia', 'Purchase plan — delivery pending')}</Txt>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Txt style={{ flex: 1 }}>{tr('Materiały w tym planie', 'Materials in this plan')}</Txt><Txt w="bold">{formatGrosze(pendingPlan.materialsGrosze)}</Txt></View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Txt style={{ flex: 1 }}>{tr(`Potwierdzone dostawy (${pendingPlan.stores.length - pendingStores.length} z ${pendingPlan.stores.length})`, `Confirmed delivery charges (${pendingPlan.stores.length - pendingStores.length} of ${pendingPlan.stores.length})`)}</Txt><Txt w="semibold">{formatGrosze(pendingPlan.stores.reduce((sum, store) => sum + (store.deliveryGrosze ?? 0), 0))}</Txt></View>
      <Txt w="semibold" style={{ lineHeight: 22 }}>{tr('Dostawa do potwierdzenia', 'Delivery to confirm')}: {pendingStores.map(store => store.store).join(', ')}.</Txt>
      <Txt style={{ lineHeight: 21, color: Colors.textSecondary }}>{tr('Poniżej znajdziesz wszystkie potrzebne opakowania i ceny materiałów w każdym sklepie. Pełny koszt i najtańszy zestaw z dostawą poznamy po potwierdzeniu brakujących opłat.', 'All required packs and each store’s material prices are listed below. The full total and lowest delivered basket depend on the missing delivery quotes.')}</Txt>
    </View>}
    {current && comparison.stockLimits?.map(limit => <View key={`${limit.store}:${limit.offerId}`} accessibilityRole="alert" style={{padding:12,gap:4,borderRadius:10,backgroundColor:Colors.warningBg}}>
      <Txt w="semibold">{limit.productName}</Txt>
      <Txt style={{fontSize:13,lineHeight:19}}>{tr(`${limit.store}: dostępne ${limit.maxPackages} z ${limit.requestedPackages} sprawdzanych opakowań. Uwzględniono limit przy doborze zestawu.`, `${limit.store}: ${limit.maxPackages} of ${limit.requestedPackages} requested packs available. The limit is included in basket selection.`)}</Txt>
      <Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr(`Wysyłka z: ${limit.dispatchFrom}, kod ${limit.postalCode}. Stan przy sprawdzeniu, bez rezerwacji.`, `Dispatch: ${limit.dispatchFrom}, postcode ${limit.postalCode}. Stock when checked, without a reservation.`)}</Txt>
    </View>)}
    {best && <Txt w="semibold">{tr(`Podział zakupów między sklepy (${best.stores.length})`, `Purchases by store (${best.stores.length})`)}</Txt>}
    {pendingPlan && <Txt w="semibold">{tr(`Materiały do kupienia w sklepach (${pendingPlan.stores.length})`, `Materials to buy by store (${pendingPlan.stores.length})`)}</Txt>}
    {displayedBasket?.stores.map(store => {
      const packs = store.lines.flatMap(line => line.packages.map(pack => ({ line, pack })));
      const expanded = Boolean(openProducts[store.store]);
      const verifiedPacks = packs.filter(({pack}) => pack.verification);
      return <View key={store.store} style={{ padding: 14, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 12 }}>
      <Txt w="bold" style={{ fontSize: 16 }}>{store.store} · {store.totalGrosze === null ? tr(`materiały ${formatGrosze(store.materialsGrosze)}`, `materials ${formatGrosze(store.materialsGrosze)}`) : formatGrosze(store.totalGrosze)}</Txt>
      <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{tr('Materiały', 'Materials')}: {formatGrosze(store.materialsGrosze)} · {tr('Dostawa', 'Delivery')}: {store.deliveryGrosze === null ? tr('do potwierdzenia', 'pending') : formatGrosze(store.deliveryGrosze)}</Txt>
      {pendingPlan && store.deliveryGrosze === null && <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{reason(comparison.unavailableStores?.find(item => item.store === store.store)?.reason ?? 'quote_unavailable')}</Txt>}
      {store.quote && <View style={{ gap: 4 }}>
        <Txt style={{ color: Colors.primary, fontSize: 13 }}>{store.quote.carrier} · {store.quote.payment}</Txt>
        <Txt style={{ color: Colors.textSecondary, fontSize: 12 }}>{tr('Sprawdzono', 'Checked')}: {new Date(store.quote.checkedAt).toLocaleString(language === 'pl' ? 'pl-PL' : 'en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone:'Europe/Warsaw' })} · {store.quote.destinationScope==='postal_code' ? tr(`wycena dla ${store.quote.postalCode}`, `quote for ${store.quote.postalCode}`) : tr('taryfa Polska', 'Poland tariff')}</Txt>
        {store.quote.basis==='retailer_tariff_national' && <Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr('Dostawa obliczona według aktualnej taryfy sklepu dla całego zamówienia.', 'Delivery calculated from the current store tariff for the complete order.')}</Txt>}
        {store.quote.dispatchFrom && <Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr('Wysyłka z', 'Dispatched from')}: {store.quote.dispatchFrom}</Txt>}
        {store.quote.orders && <View accessibilityRole="alert" style={{gap:10,padding:12,borderRadius:10,backgroundColor:Colors.warningBg}}>
          <Txt w="bold">{tr(`Ta cena wymaga ${store.quote.orders.length} osobnych zamówień w ${store.store}`, `This price requires ${store.quote.orders.length} separate orders at ${store.store}`)}</Txt>
          {store.quote.singleOrderCostGrosze !== undefined && <Txt style={{fontSize:13}}>{tr('Dostawa jednego wspólnego zamówienia', 'Delivery for one combined order')}: {formatGrosze(store.quote.singleOrderCostGrosze)}. {tr('Oszczędność na dostawie', 'Delivery saving')}: {formatGrosze(store.quote.singleOrderCostGrosze-store.quote.costGrosze)}.</Txt>}
          {store.quote.orders.map((part,index)=><View key={index} style={{gap:4}}>
            <Txt w="semibold">{tr('Zamówienie', 'Order')} {index+1} · {tr('materiały', 'materials')} {formatGrosze(part.materialsGrosze)} · {tr('dostawa', 'delivery')} {formatGrosze(part.quote.costGrosze)}</Txt>
            <Txt style={{fontSize:12,color:Colors.textSecondary}}>{part.quote.carrier} · {part.quote.payment}</Txt>
            {part.lines.map(line=><Txt key={line.product.id} style={{fontSize:13,lineHeight:19}}>{line.product.name}: {line.packages.map(p=>`${p.count} × ${p.packageSize} ${line.unit??''}`).join(' + ')}</Txt>)}
          </View>)}
          <Txt style={{fontSize:12,lineHeight:18}}>{tr('Nie łącz tych pozycji w jeden koszyk sklepu — sklep może naliczyć wtedy droższy transport. Każde zamówienie ma osobno sprawdzoną dostawę.', 'Keep these as separate merchant orders; combining them may trigger a higher shipping fee. Delivery was checked separately for every order.')}</Txt>
        </View>}
      </View>}
      {pendingPlan && !expanded && verifiedPacks.length > 0 && <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{tr(`${verifiedPacks.length} ofert sprawdzono ręcznie. Najwcześniejsze potwierdzenie wygasa:`, `${verifiedPacks.length} offers were checked manually. Earliest verification expires:`)} {new Date(Math.min(...verifiedPacks.map(({pack}) => Date.parse(pack.verification!.expiresAt)))).toLocaleString(language === 'pl' ? 'pl-PL' : 'en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })}. {tr('Szczegóły rozwiniesz przy produktach.', 'Expand the products for details.')}</Txt>}
      {(!pendingPlan || expanded) && verifiedPacks.map(({line,pack}) => <PriceVerificationNotice key={`verification:${line.product.id}:${pack.offerId}`} verification={pack.verification} store={`${store.store} · ${line.product.name}`} />)}
      {packs.filter(({pack}) => (pack.minimumPackages ?? 1) > 1 || (pack.purchaseMultiple ?? 1) > 1).map(({line,pack}) => <View key={`rules:${line.product.id}:${pack.offerId}`} accessibilityRole="alert" style={{ gap: 4, padding: 10, borderRadius: 10, backgroundColor: Colors.warningBg }}>
        <Txt w="semibold" style={{fontSize:13}}>{line.product.name}</Txt>
        {(pack.minimumPackages ?? 1) > 1 && <Txt style={{fontSize:13}}>{tr(`Minimalny zakup: ${pack.minimumPackages} opakowań (${pack.minimumPackages! * pack.packageSize} ${line.unit}). Kwota uwzględnia to minimum.`, `Minimum purchase: ${pack.minimumPackages} packs (${pack.minimumPackages! * pack.packageSize} ${line.unit}). The cost includes this minimum.`)}</Txt>}
        {(pack.purchaseMultiple ?? 1) > 1 && <Txt style={{fontSize:13}}>{tr(`Zakup w partiach po ${pack.purchaseMultiple} opakowań (${pack.purchaseMultiple! * pack.packageSize} ${line.unit}). Wycenę policzono z tym ograniczeniem.`, `Purchase in lots of ${pack.purchaseMultiple} packs (${pack.purchaseMultiple! * pack.packageSize} ${line.unit}). The quote follows this rule.`)}</Txt>}
      </View>)}
      {packs.map(({line,pack}) => <PriceChangeBadge key={`change:${line.product.id}:${pack.offerId}`} offerId={pack.offerId} productName={line.product.name} />)}
      <Pressable accessibilityRole="button" aria-expanded={expanded} accessibilityState={{expanded}} onPress={() => setOpenProducts(previous => ({...previous,[store.store]:!expanded}))} style={{ minHeight:48, flexDirection:'row', alignItems:'center', gap:8 }}>
        <Feather name={expanded?'chevron-up':'chevron-down'} size={18} color={Colors.primary} />
        <Txt w="semibold" style={{flex:1,color:Colors.primary}}>{tr(`${expanded?'Ukryj':'Pokaż'} produkty: ${store.store} (${store.lines.length})`, `${expanded?'Hide':'Show'} products: ${store.store} (${store.lines.length})`)}</Txt>
      </Pressable>
      {expanded && store.lines.map(line => <View key={line.product.id} style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><ProductImage uri={getProductPhoto(line.product)} name={line.product.name} size={56} /><Txt w="medium" style={{ flex: 1, fontSize: 14 }}>{line.product.name}</Txt></View>
        {line.packages.map(pack => <View key={pack.offerId} style={{ gap: 2 }}>
          <Txt>{pack.count} × {pack.packageSize} {line.unit} · {formatGrosze(pack.lineCostGrosze)}</Txt>
          {pack.maxPackages!==undefined&&<Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr(`Zapas przy sprawdzeniu: ${pack.maxPackages} op. Nie jest to rezerwacja.`,`Stock when checked: ${pack.maxPackages} packs. This is not a reservation.`)}</Txt>}
          {pack.url && <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(pack.url!)} style={{ minHeight: 44, justifyContent: 'center' }}><Txt w="semibold" style={{ color: Colors.primary }}>{tr('Sprawdź produkt w sklepie ↗', 'View product in store ↗')}</Txt></Pressable>}
        </View>)}
      </View>)}
    </View>;})}
    {current && mode === 'shipping' && comparison.unavailableStores?.length ? <>
      <Pressable accessibilityRole="button" aria-expanded={details} accessibilityState={{ expanded: details }} onPress={() => setDetails(value => !value)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Feather name={details ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.primary} /><Txt style={{ color: Colors.primary, flex: 1 }}>{tr('Sklepy wymagające potwierdzenia dostawy', 'Stores needing delivery confirmation')}</Txt></Pressable>
      {details && comparison.unavailableStores.map(store => <View key={store.store} style={{ gap: 4 }}>
        <Txt w="semibold">{store.store}{store.partial?tr(' · inne koszyki',' · other baskets'):''}</Txt><Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{reason(store.reason)}</Txt>
        {comparison.policies.find(p => p.store === store.store)?.sourceUrl && <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(comparison.policies.find(p => p.store === store.store)!.sourceUrl!)} style={{ minHeight: 44, justifyContent: 'center' }}><Txt style={{ color: Colors.primary }}>{tr('Warunki sklepu ↗', 'Store terms ↗')}</Txt></Pressable>}
      </View>)}
    </> : null}
    {current && best && comparison.alternatives.length > 0 && <View style={{ gap: 8 }}>
      <Txt w="semibold">{tr('Inne wycenione zestawy', 'Other quoted baskets')}</Txt>
      {comparison.alternatives.slice(0,2).map((basket,index) => <View key={index} style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, gap: 6 }}><Txt>{basket.stores.map(store => store.store).join(' + ')}</Txt><Txt w="semibold">{formatGrosze(basket.totalGrosze!)} · +{formatGrosze(basket.totalGrosze! - best.totalGrosze!)}</Txt></View>)}
    </View>}
    {current && destination && <Button variant="outline" label={tr('Sprawdź dostawy ponownie', 'Check deliveries again')} onPress={() => apply({ mode, method: 'automatic', postalCode: destination })} />}
    {best && <Txt style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 18 }}>{tr('Porównanie potrzebnych opakowań materiałów, bez dokupowania nadmiaru dla rabatów. Narzędzia i robocizna są liczone osobno.', 'Comparison of required material packs, without buying extras for discounts. Tools and labour are separate.')}</Txt>}
  </View>;
}
