import React, { useEffect, useState } from 'react';
import { View, Pressable, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import { normalizeDeliveryPostalCode } from '@/features/pricing/deliveryInput';
import { pendingDeliveryPlan, deliveryRefreshDelay } from '@/features/pricing/pendingDeliveryPlan';
import {availableStoreBasket} from '@/features/pricing/availableStoreBasket';
import { ProductImage } from './ProductImage';
import { PriceVerificationNotice } from './PriceVerificationNotice';
import { getProductPhoto } from '@/data/products/photos';
import { PriceChangeBadge } from './PriceChangeNotice';
import { PurchaseListActions } from './PurchaseListActions';
import { displayProductName } from '@/features/pricing/productDisplay';
import {formatPackageSize,formatPackageUnit,formatPurchase} from '@/features/pricing/packageDisplay';
import {unconfirmedDeliveryCoverage,deliveryRateLimitMessage} from '@/features/pricing/deliveryCoverage';
import {confirmedBasketOptions,confirmedDeliveredBasket,deliveredBasketKey,type BasketChoice} from '@/features/pricing/basketOptions';
import {BasketOptionsSection} from './BasketOptionsSection';
import {PendingDeliverySummary} from './PendingDeliverySummary';
import type { DeliveryComparison, DeliverySettings } from '../../../../lib/pricing-service/src/delivery';

export function DeliveryComparisonSection({ comparison, missingItemCount, settings, selectedStore, onApply,choice,onChoice,choosingDisabled=false, includesToolPurchases=false }: {
  comparison: DeliveryComparison; settings: DeliverySettings;
  selectedStore?: string | null;
  missingItemCount?: number;
  onApply: (settings: DeliverySettings) => void;
  choice:BasketChoice;onChoice:(choice:BasketChoice)=>void;choosingDisabled?:boolean;includesToolPurchases?:boolean;
}) {
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => language === 'pl' ? pl : en;
  const whereToBuy = (count: number) => tr(
    `Gdzie kupić produkty (${count} ${count === 1 ? 'sklep' : count < 5 ? 'sklepy' : 'sklepów'})`,
    `Where to buy (${count} ${count === 1 ? 'store' : 'stores'})`,
  );
  const mode = settings.mode, destination = normalizeDeliveryPostalCode(settings.postalCode ?? '');
  const allowSeparateOrders = settings.allowSeparateOrders ?? true;
  const apply = (next: DeliverySettings) => onApply({ ...next, allowSeparateOrders: next.allowSeparateOrders ?? allowSeparateOrders });
  const [details, setDetails] = useState(false);
  const [openProducts, setOpenProducts] = useState<Record<string, boolean>>({});
  const [openAlternatives, setOpenAlternatives] = useState<Record<string, boolean>>({});
  const [showAllAlternatives, setShowAllAlternatives] = useState(false);
  const current = mode === comparison.mode && (mode === 'pickup' || destination === comparison.postalCode && allowSeparateOrders === (comparison.allowSeparateOrders ?? false));
  const now = Date.now();
  const lowest = current && (mode === 'pickup' || destination !== null && confirmedDeliveredBasket(comparison.best, destination, now))
    ? comparison.best
    : null;
  const quoteNeedsConfirmation = current && mode === 'shipping' && Boolean(comparison.best) && !lowest;
  const options=confirmedBasketOptions(comparison,settings,selectedStore,now);
  const singleSelected=choice==='single_store'&&Boolean(options?.singleStore)&&!options?.alreadySingleStore;
  const extraSelected=choice==='extra_packages'&&Boolean(options?.extraPackages);
  const fewerSelected=choice==='fewer_stores'&&Boolean(options?.fewerStores);
  const best = current ? extraSelected?options!.extraPackages!.basket:fewerSelected?options!.fewerStores!.basket:singleSelected?options!.singleStore:lowest : null;
  const otherBaskets=((singleSelected||extraSelected||fewerSelected)&&lowest?[lowest,...comparison.alternatives]:comparison.alternatives)
    .filter(basket => mode === 'pickup' || destination !== null && confirmedDeliveredBasket(basket, destination, now))
    .filter(basket => !best || deliveredBasketKey(basket) !== deliveredBasketKey(best));
  const selectedTotalLabel = singleSelected
    ? tr('Kwota dotyczy wybranego wariantu z jednego sklepu.', 'This total is for the selected one-store option.')
    : fewerSelected
      ? tr('Kwota dotyczy wybranego wariantu z mniejszą liczbą sklepów.', 'This total is for the selected option with fewer stores.')
      : extraSelected
        ? tr('Kwota dotyczy wybranego wariantu z dodatkowymi opakowaniami.', 'This total is for the selected option with extra packs.')
        : selectedStore
          ? tr('To najtańszy z potwierdzonych koszyków w wybranym sklepie.', 'This is the lowest confirmed basket at the selected store.')
          : tr('To najtańszy z potwierdzonych koszyków.', 'This is the lowest confirmed basket.');
  const coverageWarning=unconfirmedDeliveryCoverage(comparison,current,selectedStore);
  const incompleteCompetition = Boolean(coverageWarning);
  const unquotedStoreNames = coverageWarning?.stores??[];
  const deliveryDetails = new Map((comparison.unavailableStores ?? []).map(item => [item.store, item]));
  const storesNeedingConfirmation = [...new Set([
    ...deliveryDetails.keys(),
    ...(comparison.partiallyQuotedStores ?? []),
    ...comparison.missingDeliveryStores,
  ])];
  const unquotedStoreLabel = unquotedStoreNames.length <= 2 ? unquotedStoreNames.join(', ') : tr(`${unquotedStoreNames.length} ${unquotedStoreNames.length < 5 ? 'sklepy' : 'sklepów'}`, `${unquotedStoreNames.length} stores`);
  const postcodeQuotedStores = best?.stores.filter(store => store.quote?.destinationScope === 'postal_code').length ?? 0;
  const nationallyQuotedStores = best?.stores.filter(store => store.quote?.destinationScope === 'PL').length ?? 0;
  const purchaseOrders = best?.stores.reduce((count, store) => count + Math.max(1, store.quote?.orders?.length ?? 1), 0) ?? 0;
  const available = availableStoreBasket(comparison,current,selectedStore);
  const pendingPlan = pendingDeliveryPlan(comparison, current);
  const displayedBasket = best ?? available ?? pendingPlan;
  useEffect(() => {
    const delay = deliveryRefreshDelay(comparison, current);
    if (delay === null) return;
    const timer = setTimeout(() => apply({ mode, method: 'automatic', ...(destination ? { postalCode: destination } : {}) }), delay);
    return () => clearTimeout(timer);
  }, [comparison, current, mode, destination, allowSeparateOrders, onApply]);
  const reason = (code: string) => ({
    integration_unavailable: tr('Sklep nie udostępnia jeszcze automatycznej wyceny.', 'Automatic quoting is not available yet.'),
    retailer_transport_quote_required: tr('Sklep wycenia transport indywidualnie. Koszt materiałów nie obejmuje tej opłaty.', 'The store quotes transport individually. The material cost excludes this fee.'),
    branch_and_address_required: tr('Sklep wymaga wyboru oddziału i pełnego adresu.', 'This store requires a branch and full address.'),
    retailer_access_required: tr('Automatyczny odczyt kalkulatora sklepu jest niedostępny. Potrzebna integracja ze sklepem.', 'The store calculator cannot be read automatically. A store integration is required.'),
    retailer_checkout_unconfirmed: tr('Nie udało się potwierdzić zakupu w tym sklepie.', 'Purchasing from this store could not be confirmed.'),
    address_required: tr('Sklep wymaga pełnego adresu dla tego transportu.', 'This transport requires a full address.'),
    customer_details_required: tr('Sklep wymaga danych klienta przed wyborem dostawy. Sam kod pocztowy nie wystarcza do potwierdzenia kosztu.', 'The store requires customer details before delivery selection. A postcode alone cannot confirm the cost.'),
    price_changed: tr('Cena produktu zmieniła się w koszyku sklepu.', 'The product price has changed in the store basket.'),
    retailer_rate_limited: deliveryRateLimitMessage(language),
    product_unavailable: tr('Nie potwierdzono dostępności produktu.', 'Product availability could not be confirmed.'),
    requires_separate_dispatch: tr('Produkty są dostępne w różnych oddziałach sklepu. Włącz osobne zamówienia, aby sprawdzić koszt każdej dostawy.', 'Products are available from different store branches. Enable separate orders to check every delivery charge.'),
    insufficient_stock: tr('Sklep nie ma wystarczającej liczby sztuk do tego zamówienia.', 'The store does not have enough units for this order.'),
    purchase_rules_changed: tr('Sklep zmienił minimalną ilość zakupu. Oferta wymaga ponownego sprawdzenia.', 'The minimum order quantity changed. This offer needs to be checked again.'),
    no_home_delivery: tr('Brak potwierdzonej dostawy kurierskiej.', 'No confirmed home courier delivery.'),
    quote_busy: tr('Wycena zajęta. Spróbuj ponownie za chwilę.', 'Quoting is busy. Please retry shortly.'),
    quote_limit: tr('Limit sprawdzanych koszyków został osiągnięty. Wynik obejmuje tylko potwierdzone warianty.', 'The basket quote limit was reached. The result covers only confirmed options.'),
    quote_timeout: tr('Nie zdążyliśmy potwierdzić dostawy tego wariantu. Sprawdź dostawy ponownie.', 'Delivery for this option could not be confirmed in time. Retry delivery quotes.'),
    invalid_quote: tr('Sklep zwrócił niezgodną wycenę. Ten wariant pominięto do ponownego sprawdzenia.', 'The store returned an inconsistent quote. This option was excluded until it can be checked again.'),
    quote_expired: tr('Wycena dostawy wygasła podczas sprawdzania sklepów. Sprawdź dostawy ponownie.', 'This delivery quote expired while checking the stores. Check deliveries again.'),
    quote_unavailable: tr('Nie udało się teraz pobrać wyceny sklepu. Koszt dostawy pozostaje nieznany. Spróbuj później lub sprawdź dostawę bezpośrednio w sklepie.', 'The store quote could not be retrieved right now. Delivery cost remains unknown. Try later or check delivery directly at the store.'),
    retailer_connection_unavailable: tr('Sklep chwilowo nie odpowiada. Koszt dostawy pozostaje nieznany. Spróbuj ponownie za chwilę lub sprawdź dostawę bezpośrednio w sklepie.', 'The store is temporarily unreachable. Delivery cost remains unknown. Try again shortly or check delivery directly with the store.'),
  }[code] ?? tr('Nie udało się pobrać wyceny koszyka.', 'The basket quote could not be retrieved.'));
  return <View style={{ gap: 14 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Feather name={mode === 'pickup' ? 'shopping-bag' : 'truck'} size={20} color={Colors.primary} />
      <Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{selectedStore ? tr(`Koszyk: ${selectedStore}`, `Basket: ${selectedStore}`) : mode === 'pickup' ? tr('Ceny materiałów do odbioru', 'Material prices for collection') : tr('Porównanie cen z dostawą', 'Price comparison with delivery')}</Txt>
    </View>
    {!selectedStore && <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>
      {mode === 'pickup'
        ? tr('Porównujemy potwierdzone ceny produktów w sklepach uwzględnionych w aplikacji. Dostępność w konkretnym punkcie sprawdź przed odbiorem.', 'We compare confirmed product prices from stores covered by the app. Check availability at the chosen location before collecting.')
        : tr('Porównujemy sklepy uwzględnione w aplikacji. Pełny koszt zestawu pokazujemy, gdy mamy potwierdzone ceny wszystkich potrzebnych produktów i ich dostawy.', 'We compare stores covered by the app. We show a full basket total when prices and delivery are confirmed for all required products.')}
    </Txt>}
    {comparison.status === 'partial' && <Txt accessibilityRole="alert" style={{ color: Colors.danger, lineHeight: 21 }}>{tr(`Brakuje wyceny produktów: ${missingItemCount ?? comparison.missingProductCount}. Nie można jeszcze wycenić całego zestawu.`, `Products without a price: ${missingItemCount ?? comparison.missingProductCount}. The full basket cannot be priced yet.`)}</Txt>}
    {available && <View style={{backgroundColor:Colors.warningBg,padding:18,borderRadius:16,gap:10}}>
      <Txt w="bold" style={{fontSize:16}}>{tr(`Dostępna część zakupów: ${selectedStore}`, `Available part of the purchase: ${selectedStore}`)}</Txt>
      <Txt style={{lineHeight:21}}>{tr(`Produkty objęte wyceną: ${comparison.availablePart!.productCount}. Brakujące pozycje kupisz osobno; ich koszt nie jest w tej kwocie.`, `Products covered by this quote: ${comparison.availablePart!.productCount}. Missing items require a separate purchase; their cost is excluded.`)}</Txt>
      <View style={{flexDirection:'row',justifyContent:'space-between',gap:12}}><Txt>{tr('Produkty z tej części', 'Products in this part')}</Txt><Txt w="semibold">{formatGrosze(available.materialsGrosze)}</Txt></View>
      <View style={{flexDirection:'row',justifyContent:'space-between',gap:12}}><Txt>{tr('Dostawa tej części', 'Delivery for this part')}</Txt><Txt w="semibold">{formatGrosze(available.deliveryGrosze!)}</Txt></View>
      <View style={{borderTopWidth:1,borderTopColor:Colors.border,paddingTop:10,gap:4}}><Txt>{tr('Razem za dostępną część', 'Total for the available part')}</Txt><Txt w="bold" style={{fontSize:28}}>{formatGrosze(available.totalGrosze!)}</Txt></View>
      <Txt accessibilityRole="alert" style={{fontSize:13,lineHeight:20}}>{tr('To niepełny koszyk remontu. Kwota obejmuje wskazane opakowania i ich dostawę przy płatności z góry. Pozostałe materiały, ich transport, narzędzia i robociznę sprawdź osobno. Podstawę i termin wyceny dostawy znajdziesz poniżej.', 'This renovation basket is incomplete. The amount covers these packs and their prepaid delivery. Check the remaining materials, their transport, tools and labour separately. The delivery basis and quote time are shown below.')}</Txt>
    </View>}
    {current&&selectedStore&&comparison.availablePart?.store===selectedStore&&!available&&<Txt accessibilityRole="alert" style={{lineHeight:21,color:Colors.textSecondary}}>{tr('Dostawa dostępnej części:', 'Delivery for the available part:')} {reason(comparison.availablePart.unavailableReason??'quote_expired')}</Txt>}
    {current && comparison.status === 'limit_exceeded' && <Txt>{tr('Ten zestaw przekracza zakres porównania. Podziel zakupy na mniejsze zestawy.', 'This basket exceeds the comparison limit. Split it into smaller purchases.')}</Txt>}
    {current && comparison.searchLimited && !pendingPlan && <View style={{ padding: 12, borderRadius: 12, backgroundColor: Colors.warningBg }}><Txt accessibilityRole="alert" style={{ lineHeight: 20 }}>{tr(`Sprawdzono wybrane pełne zestawy. Wyceny z dostawą: ${comparison.comparedBasketCount ?? 0}. Inne podziały zakupów mogą być tańsze.`, `Selected complete baskets were checked. Baskets quoted with delivery: ${comparison.comparedBasketCount ?? 0}. Other purchase allocations may cost less.`)}</Txt></View>}
    {options&&<BasketOptionsSection options={options} choice={extraSelected?'extra_packages':fewerSelected?'fewer_stores':singleSelected?'single_store':'lowest'} onChange={onChoice} disabled={choosingDisabled}/>}
    {best && <View style={{ backgroundColor: Colors.primaryBg, padding: 18, borderRadius: 16, gap: 10 }}>
      <Txt w="bold" style={{ fontSize: 16 }}>{fewerSelected?tr('Wybrany wariant: mniej sklepów','Selected option: fewer stores'):extraSelected?tr('Wybrany wariant: dodatkowe opakowania','Selected option: extra packs'):singleSelected?tr(`Wybrany wariant: jeden sklep — ${best.stores[0].store}`,`Selected option: one store — ${best.stores[0].store}`):options?.extraPackages?tr('Standardowy zestaw z dostawą','Standard basket including delivery'):selectedStore ? (mode === 'pickup' ? tr(`Produkty: ${selectedStore}`, `Products: ${selectedStore}`) : tr(`Zestaw z dostawą: ${selectedStore}`, `Basket with delivery: ${selectedStore}`)) : mode === 'pickup' ? tr('Najniższa cena produktów w porównaniu', 'Lowest product price in this comparison') : tr('Najtańszy potwierdzony zestaw z dostawą', 'Lowest confirmed basket with delivery')}</Txt>
      {comparison.postalCode && <Txt style={{ color: Colors.textSecondary }}>{tr('Podany kod pocztowy', 'Entered postcode')}: {comparison.postalCode}</Txt>}
      {mode === 'shipping' && <View style={{ padding: 10, borderRadius: 10, backgroundColor: Colors.surface, gap: 4 }}>
        {postcodeQuotedStores > 0 && <Txt style={{fontSize:13,lineHeight:19}}>{tr(`Dostawa dla Twojego kodu: ${postcodeQuotedStores} ${postcodeQuotedStores === 1 ? 'sklep' : 'sklepy'}.`, `Delivery quoted for your postcode: ${postcodeQuotedStores} ${postcodeQuotedStores === 1 ? 'store' : 'stores'}.`)}</Txt>}
        {nationallyQuotedStores > 0 && <Txt style={{fontSize:13,lineHeight:19}}>{tr(`Wycena krajowa: ${nationallyQuotedStores} ${nationallyQuotedStores === 1 ? 'sklep' : 'sklepy'}. To stawka dla Polski, bez osobnej wyceny dla Twojego kodu.`, `Nationwide quote: ${nationallyQuotedStores} ${nationallyQuotedStores === 1 ? 'store' : 'stores'}. This is a Poland-wide rate, without a separate quote for your postcode.`)}</Txt>}
      </View>}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Txt>{tr('Produkty', 'Products')}</Txt><Txt w="semibold">{formatGrosze(best.materialsGrosze)}</Txt></View>
      {mode === 'shipping' && <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Txt>{tr('Dostawa', 'Delivery')}</Txt><Txt w="semibold">{formatGrosze(best.deliveryGrosze!)}</Txt></View>}
      <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, gap: 4 }}><Txt>{mode === 'pickup' ? tr('Suma materiałów', 'Material total') : tr('Łączny koszt', 'Total cost')}</Txt><Txt w="bold" style={{ fontSize: 30, color: Colors.primaryDark }}>{formatGrosze(best.totalGrosze!)}</Txt></View>
      {incompleteCompetition && <View accessibilityRole="alert" style={{ padding: 12, borderRadius: 12, backgroundColor: Colors.warningBg, gap: 8 }}>
        <Txt w="bold" style={{ fontSize: 15 }}>{tr('Porównanie niepełne', 'Comparison incomplete')}</Txt>
        <Txt style={{ fontSize: 14, lineHeight: 21 }}>{tr(
          `${selectedTotalLabel} ${unquotedStoreNames.length ? `Nie udało się wycenić innych koszyków: ${unquotedStoreLabel}.` : 'Nie udało się wycenić wszystkich pozostałych koszyków.'} Inny zestaw może być tańszy.`,
          `${selectedTotalLabel} ${unquotedStoreNames.length ? `Other baskets could not be quoted: ${unquotedStoreLabel}.` : 'Not every other basket could be quoted.'} Another basket may cost less.`,
        )}</Txt>
        {!!coverageWarning?.rateLimitedStores.length&&<Txt style={{fontSize:14,lineHeight:21}}>{coverageWarning.rateLimitedStores.join(', ')}: {deliveryRateLimitMessage(language)}</Txt>}
        <Button variant="outline" label={tr('Sprawdź dostawy ponownie', 'Retry delivery quotes')} onPress={() => apply({ mode, method: 'automatic', ...(destination ? { postalCode: destination } : {}) })} />
      </View>}
      {mode === 'shipping' && best.stores.length > 1 && <View style={{ padding: 14, gap: 10, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Feather name="shopping-bag" size={18} color={Colors.primary} />
          <Txt w="bold" style={{ fontSize: 16, flex: 1 }}>{tr(`Plan zakupów: ${best.stores.length} ${best.stores.length < 5 ? 'sklepy' : 'sklepów'}, ${purchaseOrders} ${purchaseOrders === 1 ? 'zamówienie' : purchaseOrders < 5 ? 'zamówienia' : 'zamówień'}`, `Purchase plan: ${best.stores.length} stores, ${purchaseOrders} orders`)}</Txt>
        </View>
        <Txt style={{ color: Colors.textSecondary, fontSize: 14, lineHeight: 21 }}>{tr('Każdy sklep rozlicza swoje produkty i dostawę. Pełną listę opakowań oraz dostępne linki do ofert znajdziesz w kartach poniżej.', 'Each store charges for its own products and delivery. Full pack lists and available product links are in the cards below.')}</Txt>
        {best.stores.map((store, index) => <View key={store.store} style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: 5 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <Txt w="semibold" style={{ fontSize: 15, flex: 1 }}>{index + 1}. {store.store}</Txt>
            <Txt w="bold" style={{ fontSize: 15 }}>{store.totalGrosze === null ? tr('Do potwierdzenia', 'Pending') : formatGrosze(store.totalGrosze)}</Txt>
          </View>
          <Txt style={{ color: Colors.textSecondary, fontSize: 14, lineHeight: 20 }}>{tr('Dostawa', 'Delivery')}: {store.deliveryGrosze === null ? tr('do potwierdzenia', 'pending') : formatGrosze(store.deliveryGrosze)}{(store.quote?.orders?.length ?? 0) > 1 ? tr(` · ${store.quote!.orders!.length} osobne zamówienia`, ` · ${store.quote!.orders!.length} separate orders`) : ''}</Txt>
          <Txt style={{ fontSize: 14, lineHeight: 20 }}>{store.lines.slice(0, 2).map(line => displayProductName(line.product)).join(' · ')}{store.lines.length > 2 ? tr(` · +${store.lines.length - 2} pozostałych produktów`, ` · +${store.lines.length - 2} more products`) : ''}</Txt>
        </View>)}
      </View>}
      <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{mode === 'pickup'
        ? tr('Cena materiałów może pochodzić z kilku sklepów. Koszt dojazdu i dostępność do odbioru potwierdź w każdym z nich.', 'Material prices may come from several stores. Confirm travel costs and collection availability with each store.')
        : tr('Ceny brutto produktów i dostaw przy płatności z góry. Przy każdej dostawie pokazujemy podstawę: koszyk dla Twojego kodu lub aktualną taryfę krajową sklepu. Dostępność pełnego adresu potwierdzisz przy zakupie.', 'Gross product and delivery prices with prepayment. Each delivery shows its basis: a basket for your postcode or the current national store tariff. Confirm full address availability when purchasing.')}</Txt>
      {mode === 'shipping' && !incompleteCompetition && comparison.missingDeliveryStores.length > 0 && <Txt style={{ fontSize: 12, lineHeight: 18 }}>{tr(`Wynik obejmuje potwierdzone koszyki. Pozostałe sklepy (${comparison.missingDeliveryStores.length}) mają niepotwierdzoną dostawę lub nie pokrywają potrzebnej ilości. Szczegóły sprawdzisz poniżej.`, `The result covers confirmed baskets. Other stores (${comparison.missingDeliveryStores.length}) have unconfirmed delivery or cannot cover the required quantity. See the details below.`)}</Txt>}
    </View>}
    {quoteNeedsConfirmation && <View style={{ gap: 8 }}>
      <Txt accessibilityRole="alert">{tr('Wycena dostawy wymaga ponownego potwierdzenia. Łączny koszt pokażemy po sprawdzeniu dostawy.', 'The delivery quote needs to be confirmed again. We will show the total after checking delivery.')}</Txt>
      <Button variant="outline" label={tr('Sprawdź dostawy ponownie', 'Retry delivery quotes')} onPress={() => apply({ mode, method: 'automatic', ...(destination ? { postalCode: destination } : {}) })} />
    </View>}
    {current && mode === 'shipping' && destination && !best && comparison.status === 'needs_delivery_costs' && <Txt accessibilityRole="alert">{tr('Brak pełnej wyceny dostawy dla tego zestawu. Poniżej sprawdzisz, które sklepy wymagają potwierdzenia.', 'No complete delivery quote is available for this basket. See below which stores need confirmation.')}</Txt>}
    {pendingPlan && <PendingDeliverySummary plan={pendingPlan} basis={comparison.purchasePlanBasis} />}
    {displayedBasket && <PurchaseListActions key={deliveredBasketKey(displayedBasket)} input={{ basket: displayedBasket, mode, postalCode: destination, partial: Boolean(available), includesToolPurchases, limited: incompleteCompetition || comparison.searchLimited,...(extraSelected&&lowest?{extraPackageBaseline:lowest}:{}) }} />}
    {current && comparison.stockLimits?.map(limit => <View key={`${limit.store}:${limit.offerId}`} accessibilityRole="alert" style={{padding:12,gap:4,borderRadius:10,backgroundColor:Colors.warningBg}}>
      <Txt w="semibold">{limit.productName}</Txt>
      <Txt style={{fontSize:13,lineHeight:19}}>{tr(`${limit.store}: dostępne ${limit.maxPackages} z ${limit.requestedPackages} sprawdzanych opakowań. Uwzględniono limit przy doborze zestawu.`, `${limit.store}: ${limit.maxPackages} of ${limit.requestedPackages} requested packs available. The limit is included in basket selection.`)}</Txt>
      <Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr(`Wysyłka z: ${limit.dispatchFrom}, kod ${limit.postalCode}. Stan przy sprawdzeniu, bez rezerwacji.`, `Dispatch: ${limit.dispatchFrom}, postcode ${limit.postalCode}. Stock when checked, without a reservation.`)}</Txt>
    </View>)}
    {best && <Txt w="semibold">{mode === 'pickup' ? tr('Sprawdź odbiór w sklepach', 'Check collection at stores') : whereToBuy(best.stores.length)}</Txt>}
    {pendingPlan && <Txt w="semibold">{whereToBuy(pendingPlan.stores.length)}</Txt>}
    {displayedBasket?.stores.map((store, storeIndex) => {
      const packs = store.lines.flatMap(line => line.packages.map(pack => ({ line, pack })));
      const expanded = openProducts[store.store] ?? Boolean(best && displayedBasket.stores.length <= 2 && store.lines.length <= 3);
      const verifiedPacks = packs.filter(({pack}) => pack.verification);
      return <View key={store.store} style={{ padding: 14, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 12 }}>
      <Txt w="bold" style={{ fontSize: 16 }}>{best && best.stores.length > 1 ? `${storeIndex + 1}. ` : ''}{store.store} · {store.totalGrosze === null ? tr(`materiały ${formatGrosze(store.materialsGrosze)}`, `materials ${formatGrosze(store.materialsGrosze)}`) : formatGrosze(store.totalGrosze)}</Txt>
      <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{tr('Produkty', 'Products')}: {formatGrosze(store.materialsGrosze)}{mode === 'shipping' ? ` · ${tr('Dostawa', 'Delivery')}: ${store.deliveryGrosze === null ? tr('do potwierdzenia', 'pending') : formatGrosze(store.deliveryGrosze)}` : ''}</Txt>
      {store.quote?.cartPricing && <View style={{gap:4}}>
        <Txt style={{color:Colors.primary,fontSize:14}}>{tr('Rabat sklepu na ten koszyk','Store discount for this basket')}: −{formatGrosze(store.quote.cartPricing.discountGrosze)}</Txt>
        <Txt style={{color:Colors.textSecondary,fontSize:12,lineHeight:18}}>{tr('Cena produktów przed rabatem','Product price before discount')}: {formatGrosze(store.quote.cartPricing.baseMaterialsGrosze)}. {tr('Rabat jest już uwzględniony w sumie i cenach pozycji. Dotyczy tej zawartości koszyka.','The discount is included in the total and item prices. It applies to this basket contents.')}</Txt>
      </View>}
      {!!store.quote?.materialsRoundingGrosze && <Txt style={{color:Colors.textSecondary,fontSize:13}}>{store.store==='eTak'?tr('Zaokrąglenie VAT pozycji w koszyku sklepu','VAT rounding of lines in the store cart'):tr('Rozliczenie ceny za m² w koszyku sklepu', 'Per-m² rounding in the store cart')}: {store.quote.materialsRoundingGrosze>0?'+':''}{formatGrosze(store.quote.materialsRoundingGrosze)}. {tr('Uwzględnione w materiałach.', 'Included in materials.')}</Txt>}
      {pendingPlan && store.deliveryGrosze === null && <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{reason(comparison.unavailableStores?.find(item => item.store === store.store)?.reason ?? 'quote_unavailable')}</Txt>}
      {store.quote && <View style={{ gap: 4 }}>
        <Txt style={{ color: Colors.primary, fontSize: 13 }}>{store.quote.carrier} · {store.quote.payment}</Txt>
        <Txt style={{ color: Colors.textSecondary, fontSize: 12 }}>{tr('Sprawdzono', 'Checked')}: {new Date(store.quote.checkedAt).toLocaleString(language === 'pl' ? 'pl-PL' : 'en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone:'Europe/Warsaw' })} · {store.quote.destinationScope==='postal_code' ? tr(`wycena dla ${store.quote.postalCode}`, `quote for ${store.quote.postalCode}`) : tr('taryfa Polska', 'Poland tariff')}</Txt>
        {store.quote.basis==='retailer_tariff_national' && <Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr('Dostawa obliczona według aktualnej taryfy sklepu dla całego zamówienia.', 'Delivery calculated from the current store tariff for the complete order.')}</Txt>}
        {store.quote.dispatchFrom && <Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr('Wysyłka z', 'Dispatched from')}: {store.quote.dispatchFrom}</Txt>}
        {store.quote.orders && <View accessibilityRole="alert" style={{gap:10,padding:12,borderRadius:10,backgroundColor:Colors.warningBg}}>
          <Txt w="bold">{tr(`Ta cena wymaga ${store.quote.orders.length} osobnych zamówień w ${store.store}`, `This price requires ${store.quote.orders.length} separate orders at ${store.store}`)}</Txt>
          {store.quote.singleOrderTotalGrosze !== undefined ? <Txt style={{fontSize:13}}>{tr('Razem przy jednym zamówieniu','Total for one combined order')}: {formatGrosze(store.quote.singleOrderTotalGrosze)}. {tr('Łączna oszczędność','Total saving')}: {formatGrosze(store.quote.singleOrderTotalGrosze-store.totalGrosze!)}.</Txt> : store.quote.singleOrderCostGrosze !== undefined && <Txt style={{fontSize:13}}>{tr('Dostawa jednego wspólnego zamówienia', 'Delivery for one combined order')}: {formatGrosze(store.quote.singleOrderCostGrosze)}. {tr('Oszczędność na dostawie', 'Delivery saving')}: {formatGrosze(store.quote.singleOrderCostGrosze-store.quote.costGrosze)}.</Txt>}
          {store.quote.orders.map((part,index)=><View key={index} style={{gap:4}}>
            <Txt w="semibold">{tr('Zamówienie', 'Order')} {index+1} · {tr('materiały', 'materials')} {formatGrosze(part.materialsGrosze)} · {tr('dostawa', 'delivery')} {formatGrosze(part.quote.costGrosze)}</Txt>
            <Txt style={{fontSize:12,color:Colors.textSecondary}}>{part.quote.carrier} · {part.quote.payment}</Txt>
            {part.quote.dispatchFrom && <Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr('Wysyłka z', 'Dispatched from')}: {part.quote.dispatchFrom}</Txt>}
            {part.lines.map(line=><Txt key={line.product.id} style={{fontSize:13,lineHeight:19}}>{line.product.name}: {line.packages.map(p=>formatPurchase(p,line.unit,language)).join(' + ')}</Txt>)}
          </View>)}
          <Txt style={{fontSize:12,lineHeight:18}}>{store.quote.ordersReason==='separate_dispatch'
            ? tr('Produkty są w różnych oddziałach. Złóż wskazane powyżej zamówienia; każda dostawa została sprawdzona oddzielnie.', 'Products are stocked at different branches. Place the orders listed above; each delivery was checked independently.')
            : tr('Nie łącz tych pozycji w jeden koszyk sklepu — sklep może naliczyć wtedy droższy transport. Każde zamówienie ma osobno sprawdzoną dostawę.', 'Keep these as separate merchant orders; combining them may trigger a higher shipping fee. Delivery was checked separately for every order.')}</Txt>
        </View>}
      </View>}
      {pendingPlan && !expanded && verifiedPacks.length > 0 && <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{tr(`${verifiedPacks.length} ofert sprawdzono ręcznie. Najwcześniejsze potwierdzenie wygasa:`, `${verifiedPacks.length} offers were checked manually. Earliest verification expires:`)} {new Date(Math.min(...verifiedPacks.map(({pack}) => Date.parse(pack.verification!.expiresAt)))).toLocaleString(language === 'pl' ? 'pl-PL' : 'en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })}. {tr('Szczegóły rozwiniesz przy produktach.', 'Expand the products for details.')}</Txt>}
      {(!pendingPlan || expanded) && verifiedPacks.map(({line,pack}) => <PriceVerificationNotice key={`verification:${line.product.id}:${pack.offerId}`} verification={pack.verification} store={`${store.store} · ${displayProductName(line.product)}`} />)}
      {packs.filter(({pack}) => (pack.minimumPackages ?? 1) > 1 || (pack.purchaseMultiple ?? 1) > 1).map(({line,pack}) => <View key={`rules:${line.product.id}:${pack.offerId}`} accessibilityRole="alert" style={{ gap: 4, padding: 10, borderRadius: 10, backgroundColor: Colors.warningBg }}>
        <Txt w="semibold" style={{fontSize:13}}>{displayProductName(line.product)}</Txt>
        {(pack.minimumPackages ?? 1) > 1 && <Txt style={{fontSize:13}}>{tr(`Minimalny zakup: ${pack.minimumPackages} opakowań (${formatPackageSize(pack.minimumPackages! * pack.packageSize,language)} ${formatPackageUnit(line.unit)}). Kwota uwzględnia to minimum.`, `Minimum purchase: ${pack.minimumPackages} packs (${formatPackageSize(pack.minimumPackages! * pack.packageSize,language)} ${formatPackageUnit(line.unit)}). The cost includes this minimum.`)}</Txt>}
        {(pack.purchaseMultiple ?? 1) > 1 && <Txt style={{fontSize:13}}>{tr(`Zakup w partiach po ${pack.purchaseMultiple} opakowań (${formatPackageSize(pack.purchaseMultiple! * pack.packageSize,language)} ${formatPackageUnit(line.unit)}). Wycenę policzono z tym ograniczeniem.`, `Purchase in lots of ${pack.purchaseMultiple} packs (${formatPackageSize(pack.purchaseMultiple! * pack.packageSize,language)} ${formatPackageUnit(line.unit)}). The quote follows this rule.`)}</Txt>}
      </View>)}
      {packs.map(({line,pack}) => <PriceChangeBadge key={`change:${line.product.id}:${pack.offerId}`} productName={displayProductName(line.product)} basketPack={pack} />)}
      <Pressable accessibilityRole="button" aria-expanded={expanded} accessibilityState={{expanded}} onPress={() => setOpenProducts(previous => ({...previous,[store.store]:!expanded}))} style={{ minHeight:48, flexDirection:'row', alignItems:'center', gap:8 }}>
        <Feather name={expanded?'chevron-up':'chevron-down'} size={18} color={Colors.primary} />
        <Txt w="semibold" style={{flex:1,color:Colors.primary}}>{tr(`${expanded?'Ukryj':'Pokaż'} produkty: ${store.store} (${store.lines.length})`, `${expanded?'Hide':'Show'} products: ${store.store} (${store.lines.length})`)}</Txt>
      </Pressable>
      {expanded && store.lines.map(line => <View key={line.product.id} style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><ProductImage uri={getProductPhoto(line.product)} name={displayProductName(line.product)} size={56} /><Txt w="medium" style={{ flex: 1, fontSize: 14 }}>{displayProductName(line.product)}</Txt></View>
        {line.packages.map((pack,packIndex) => <View key={`${pack.offerId}:${packIndex}`} style={{ gap: 2 }}>
          <Txt>{formatPurchase(pack,line.unit,language)} · {formatGrosze(pack.lineCostGrosze)}</Txt>
          {pack.cutRoll?.cutLengthsMm&&<Txt style={{fontSize:12,lineHeight:18,color:Colors.textSecondary}}>{tr('Po dostawie podziel ten odcinek według planów pomieszczeń: ','After delivery, cut this piece to the room plans: ')}{pack.cutRoll.cutLengthsMm.map(n=>formatPackageSize(n/1000,language)+' m').join(' + ')}. {tr('Docinka przy ścianach jest już uwzględniona.','Wall trimming is already included.')}</Txt>}
          {pack.maxPackages!==undefined&&<Txt style={{fontSize:12,color:Colors.textSecondary}}>{tr(`Zapas przy sprawdzeniu: ${pack.maxPackages} op. Nie jest to rezerwacja.`,`Stock when checked: ${pack.maxPackages} packs. This is not a reservation.`)}</Txt>}
          {pack.url && <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(pack.url!)} style={{ minHeight: 44, justifyContent: 'center' }}><Txt w="semibold" style={{ color: Colors.primary }}>{tr('Sprawdź produkt w sklepie ↗', 'View product in store ↗')}</Txt></Pressable>}
        </View>)}
      </View>)}
    </View>;})}
    {current && mode === 'shipping' && storesNeedingConfirmation.length ? <>
      <Pressable accessibilityRole="button" accessibilityLabel={tr('Sklepy wymagające potwierdzenia dostawy', 'Stores needing delivery confirmation')} aria-expanded={details} accessibilityState={{ expanded: details }} onPress={() => setDetails(value => !value)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Feather name={details ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.primary} /><Txt style={{ color: Colors.primary, flex: 1 }}>{tr('Sklepy wymagające potwierdzenia dostawy', 'Stores needing delivery confirmation')}</Txt></Pressable>
      {details && storesNeedingConfirmation.map(store => {
        const detail = deliveryDetails.get(store);
        const partial = detail?.partial || comparison.partiallyQuotedStores?.includes(store);
        const sourceUrl = comparison.policies.find(policy => policy.store === store)?.sourceUrl;
        return <View key={store} style={{ gap: 4 }}>
          <Txt w="semibold">{store}{partial ? tr(' · inne koszyki', ' · other baskets') : ''}</Txt>
          <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{detail
            ? reason(detail.reason)
            : tr('Nie potwierdzono pełnej wyceny dla potrzebnych produktów i ilości.', 'A complete quote for the required products and quantities was not confirmed.')}</Txt>
          {sourceUrl && <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(sourceUrl)} style={{ minHeight: 44, justifyContent: 'center' }}><Txt style={{ color: Colors.primary }}>{tr('Warunki sklepu ↗', 'Store terms ↗')}</Txt></Pressable>}
        </View>;
      })}
    </> : null}
    {current && best && otherBaskets.length > 0 && <View style={{ gap: 8 }}>
      <Txt w="semibold">{tr('Inne wycenione zestawy', 'Other quoted baskets')}</Txt>
      {(showAllAlternatives ? otherBaskets : otherBaskets.slice(0, 2)).map((basket,index) => {
        const key = `${index}:${basket.stores.map(store => store.store).join('|')}:${basket.totalGrosze}`;
        const expanded = openAlternatives[key] ?? false;
        const productCount = basket.stores.reduce((count, store) => count + store.lines.length, 0);
        return <View key={key} style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, gap: 8, backgroundColor: Colors.surface }}>
          <Txt w="semibold" style={{fontSize:15}}>{basket.stores.map(store => store.store).join(' + ')}</Txt>
          <Txt w="bold" style={{fontSize:18}}>{formatGrosze(basket.totalGrosze!)} <Txt style={{fontSize:13,color:Colors.textSecondary}}>· +{formatGrosze(basket.totalGrosze! - lowest!.totalGrosze!)} {tr('względem najniższej potwierdzonej kwoty','versus the lowest confirmed total')}</Txt></Txt>
          <Txt style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{tr('Produkty','Products')}: {formatGrosze(basket.materialsGrosze)}{mode === 'shipping' ? ` · ${tr('Dostawa','Delivery')}: ${formatGrosze(basket.deliveryGrosze!)}` : ''}</Txt>
          {basket.stores.some(store=>store.quote?.cartPricing)&&<Txt style={{fontSize:13,color:Colors.primary}}>{tr('Rabat koszyka, już wliczony','Basket discount, already included')}: −{formatGrosze(basket.stores.reduce((sum,store)=>sum+(store.quote?.cartPricing?.discountGrosze??0),0))}</Txt>}
          <Pressable accessibilityRole="button" aria-expanded={expanded} accessibilityState={{expanded}} onPress={() => setOpenAlternatives(previous => ({...previous,[key]:!expanded}))} style={{minHeight:48,flexDirection:'row',alignItems:'center',gap:8}}>
            <Feather name={expanded?'chevron-up':'chevron-down'} size={18} color={Colors.primary}/>
            <Txt w="semibold" style={{flex:1,color:Colors.primary}}>{mode === 'pickup' ? expanded ? tr('Ukryj produkty', 'Hide products') : tr(`Zobacz ${productCount} ${productCount===1?'produkt':productCount<5?'produkty':'produktów'}`, `View ${productCount} products`) : expanded?tr('Ukryj produkty i dostawę','Hide products and delivery'):tr(`Zobacz ${productCount} ${productCount===1?'produkt':productCount<5?'produkty':'produktów'} i dostawę`,`View ${productCount} products and delivery`)}</Txt>
          </Pressable>
          {expanded && basket.stores.map(store => <View key={store.store} style={{gap:10,paddingTop:8,borderTopWidth:1,borderTopColor:Colors.border}}>
            <Txt w="bold">{store.store} · {formatGrosze(store.totalGrosze!)}</Txt>
            {mode === 'shipping' && <Txt style={{fontSize:13,color:Colors.textSecondary}}>{tr('Dostawa','Delivery')}: {formatGrosze(store.deliveryGrosze!)}{store.quote ? ` · ${store.quote.carrier}` : ''}</Txt>}
            {(store.quote?.orders?.length ?? 0) > 1 && <View accessibilityRole="alert" style={{gap:6,padding:10,borderRadius:10,backgroundColor:Colors.warningBg}}>
              <Txt w="semibold" style={{fontSize:13}}>{tr(`Złóż ${store.quote!.orders!.length} osobne zamówienia w tym sklepie:`, `Place ${store.quote!.orders!.length} separate orders at this store:`)}</Txt>
              {store.quote!.orders!.map((part,partIndex) => <Txt key={partIndex} style={{fontSize:13,lineHeight:19}}>{tr('Zamówienie','Order')} {partIndex+1}: {part.lines.map(line=>`${displayProductName(line.product)} (${line.packages.map(pack=>formatPurchase(pack,line.unit,language)).join(' + ')})`).join(', ')}. {tr('Dostawa','Delivery')}: {formatGrosze(part.quote.costGrosze)}.{part.quote.dispatchFrom && ` ${tr('Wysyłka z', 'Dispatched from')}: ${part.quote.dispatchFrom}.`}</Txt>)}
            </View>}
            {store.lines.map(line => <View key={line.product.id} style={{gap:4}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:10}}><ProductImage uri={getProductPhoto(line.product)} name={displayProductName(line.product)} size={48}/><Txt w="medium" style={{flex:1,fontSize:14,lineHeight:20}}>{displayProductName(line.product)}</Txt></View>
              {line.packages.map((pack,packIndex) => <View key={`${pack.offerId}:${packIndex}`} style={{paddingLeft:58,gap:2}}>
                <Txt style={{fontSize:13}}>{formatPurchase(pack,line.unit,language)} · {formatGrosze(pack.lineCostGrosze)}</Txt>
                <PriceChangeBadge basketPack={pack} />
                {pack.url && <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(pack.url!)} style={{minHeight:44,justifyContent:'center'}}><Txt w="semibold" style={{color:Colors.primary,fontSize:13}}>{tr('Sprawdź w sklepie ↗','View in store ↗')}</Txt></Pressable>}
              </View>)}
            </View>)}
          </View>)}
        </View>;
      })}
      {!showAllAlternatives && otherBaskets.length > 2 && <Button variant="outline" label={tr(`Pokaż pozostałe zestawy (${otherBaskets.length - 2})`, `Show other baskets (${otherBaskets.length - 2})`)} onPress={() => setShowAllAlternatives(true)} />}
    </View>}
    {current && mode === 'shipping' && destination && !incompleteCompetition && !quoteNeedsConfirmation && <Button variant="outline" label={tr('Sprawdź dostawy ponownie', 'Check deliveries again')} onPress={() => apply({ mode, method: 'automatic', postalCode: destination })} />}
    {best && <Txt style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 18 }}>{includesToolPurchases
      ? tr('Porównanie obejmuje wycenione produkty, w tym widoczne narzędzia do kupienia. Wypożyczenie, robocizna i opcjonalne rabaty są osobno.', 'The comparison covers quoted products, including any tools listed for purchase. Rentals, labour and optional discounts are separate.')
      : tr('Porównanie potrzebnych opakowań materiałów, bez dokupowania nadmiaru dla rabatów. Kwoty nie obejmują opcjonalnych kodów promocyjnych i rabatów lojalnościowych. Narzędzia i robocizna są liczone osobno.', 'Comparison of required material packs, without buying extras for discounts. Amounts exclude optional coupon codes and loyalty discounts. Tools and labour are separate.')}</Txt>}
  </View>;
}
