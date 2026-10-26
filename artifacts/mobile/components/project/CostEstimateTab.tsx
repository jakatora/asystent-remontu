import { ProductImage } from './ProductImage';
import { getProductPhoto } from '@/data/products/photos';
import { DeliveryComparisonSection } from './DeliveryComparisonSection';
import { StoreChoiceSection } from './StoreChoiceSection';
import { DoorSelectionSection } from './DoorSelectionSection';
import { router } from 'expo-router';
import { useDoorSelection } from '@/features/pricing/useDoorSelection';
import { collectStoreChoices, estimateHonoursStore, parsePreferredStore, storeMapSearchUrl, type StoreChoices } from '@/features/pricing/storeChoice';
import { unpricedReference } from '@/features/pricing/unpricedReference';
import { isMissingOffer, unresolvedReasonKey } from '@/features/pricing/unresolvedReason';
import { PriceChangeNotice, PriceChangeBadge, PriceChangesProvider } from './PriceChangeNotice';
import { collectSeenPrices, comparePriceSnapshots, mergePriceSnapshots, parsePriceSnapshot, emptyPriceSnapshot, type PriceChange } from '@/features/pricing/priceChanges';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DeliverySettings } from '../../../../lib/pricing-service/src/delivery';
// Zakładka „Wycena": read-only prezentacja wyceny etapu i całego remontu z
// backendu cen (features/pricing/pricingApi). Bierze REALNY wynik lokalnego
// kalkulatora (engine.calculate) dla etapu, wysyła do POST /pricing/project i
// pokazuje: materiały z najtańszą ofertą (cena + sklep + „najtańsza"), sumę
// etapu, sumę remontu oraz osobno pozycje nierozpoznane (brak ceny w katalogu).
//
// Nic nie liczy po stronie klienta — kwoty (w groszach) i „najtańsza oferta"
// pochodzą z API; tu jest tylko formatowanie na PLN i układ. Nie dotyka formuł,
// ID jobów ani danych kalkulatora.
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Pressable, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { CalculationResult } from '@/types/domain';
import type { QualityTier } from '@/types/pricing';
import {
  estimateProject,
  fetchPriceHistory,
  toPricingStageInput,
  formatGrosze,
  isPricingApiConfigured,
  ApiError,
  type SerializedProject,
  type SerializedStage,
  type SerializedLine,
  type SerializedPackage,
  type SerializedProductOffer,
  type SerializedConsolidatedLine,
  type SerializedStoreComparison,
  type SerializedStoreBasket,
  type SerializedHistoryPoint,
  type PriceHistoryResponse,
  type PricingStageInput,
} from '@/features/pricing';

interface CostEstimateTabProps {
  projectId?: string;
  calc?: CalculationResult;
  stages?: readonly PricingStageInput[];
  qualityTier?: QualityTier;
  region?: string;
}

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: SerializedProject; priceChanges:PriceChange[]; hasPriceBaseline:boolean };

export function CostEstimateTab({ calc, stages, projectId, qualityTier = 'standard', region }: CostEstimateTabProps) {
  const { t, language } = useLanguage();
  const doorChoice = useDoorSelection(stages ? undefined : projectId, calc);
  const [state, setState] = useState<LoadState>({ status: 'idle' });
  const [delivery, setDelivery] = useState<DeliverySettings>({ mode: 'shipping' });
  const deliveryRef = useRef(delivery);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [storeChoices, setStoreChoices] = useState<(StoreChoices & { scope: string }) | null>(null);
  const storeChoicesRef = useRef<(StoreChoices & { scope: string }) | null>(null);
  const [loadedScope, setLoadedScope] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [priceSaveFailed,setPriceSaveFailed]=useState(false);
  const priceSnapshot=useRef(emptyPriceSnapshot());
  const priceWrites=useRef(Promise.resolve());
  const preferenceWrites = useRef(Promise.resolve());
  const requestVersion = useRef(0);
  // A previous delivery quote must not silently follow changed measurements,
  // product tier, region, or a different user's local project.
  const scope = JSON.stringify([projectId, stages ?? calc, qualityTier, region, doorChoice.selection, doorChoice.ready]);
  const hasInput = stages ? stages.length > 0 : Boolean(calc);
  // Previous manually entered fees must never become automatic quotes.
  const storageKey = `remont.delivery.v2:${projectId ?? 'preview'}`;
  const priceStorageKey = `remont.price-seen.v1:${projectId ?? 'preview'}`;
  useEffect(() => {
    let active = true;
    void Promise.all([preferenceWrites.current, priceWrites.current]).then(() => Promise.all([AsyncStorage.getItem(storageKey),AsyncStorage.getItem(priceStorageKey)])).then(([raw,prices]) => {
      let settings: DeliverySettings = { mode: 'shipping' };
      let preferredStore: string | null = null;
      try {
        const saved = raw ? JSON.parse(raw) : null;
        preferredStore = parsePreferredStore(saved?.store);
        if (['shipping', 'pickup'].includes(saved?.settings?.mode)) settings = {
          mode: saved.settings.mode, method: 'automatic',
          ...(/^\d{2}-\d{3}$/.test(saved.settings.postalCode ?? '') ? { postalCode: saved.settings.postalCode } : {}),
        };
      } catch { /* A corrupt local preference cannot supply a shipping fee. */ }
      if (active) { priceSnapshot.current=parsePriceSnapshot(prices); deliveryRef.current=settings; setDelivery(settings); setSelectedStore(preferredStore); setLoadedScope(scope); }
    }).catch(() => { if (active) { priceSnapshot.current=emptyPriceSnapshot(); deliveryRef.current={ mode:'shipping' }; setDelivery(deliveryRef.current); setSelectedStore(null); setLoadedScope(scope); } });
    return () => { active = false; };
  }, [storageKey, priceStorageKey, scope]);

  const fetchEstimate = useCallback(async (refreshPrices = false) => {
    if (!hasInput || loadedScope !== scope || !doorChoice.ready) return;
    const version = ++requestVersion.current;
    setState({ status: 'loading' });
    try {
      const input = stages ?? [toPricingStageInput(calc!, qualityTier === 'custom' ? 'standard' : qualityTier, doorChoice.selection)];
      const rememberChoices = (data: SerializedProject) => {
        const choices = { ...collectStoreChoices(data), scope };
        storeChoicesRef.current = choices; setStoreChoices(choices);
      };
      // Keep the unfiltered comparison available while the user explores one
      // store. A saved preference must not erase the alternatives on reopening.
      if (selectedStore && (storeChoicesRef.current?.scope !== scope || refreshPrices)) {
        const all = await estimateProject(input, { region, delivery: { mode: 'pickup' }, refreshPrices });
        if (version !== requestVersion.current) return;
        rememberChoices(all);
      }
      const data = await estimateProject(input, { region, delivery, ...(selectedStore ? { store: selectedStore } : {}), refreshPrices: refreshPrices && !selectedStore });
      if (selectedStore && !estimateHonoursStore(data, selectedStore)) throw Error('store_selection_not_confirmed');
      if (version === requestVersion.current) {
        if (!selectedStore) rememberChoices(data);
        const current=collectSeenPrices(data), previous=priceSnapshot.current;
        const priceChanges=comparePriceSnapshots(previous,current);
        const hasPriceBaseline=Object.keys(current.offers).some(key=>Boolean(previous.offers[key]));
        priceSnapshot.current=mergePriceSnapshots(previous,current);
        const saved=JSON.stringify(priceSnapshot.current);
        setPriceSaveFailed(false);
        priceWrites.current=priceWrites.current.catch(()=>{}).then(()=>AsyncStorage.setItem(priceStorageKey,saved)).catch(()=>{ if (version===requestVersion.current) setPriceSaveFailed(true); });
        setState({ status: 'success', data, priceChanges, hasPriceBaseline });
      }
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'store_selection_not_confirmed'
          ? (language === 'pl' ? 'Nie potwierdzono koszyka w wybranym sklepie. Odśwież wycenę lub wybierz inny sklep.' : 'The selected store basket could not be confirmed. Refresh the quote or choose another store.')
          : err instanceof ApiError
          ? t('cmp.CostEstimate.errorHttp', { status: err.status })
          : t('cmp.CostEstimate.errorNetwork');
      if (version === requestVersion.current) setState({ status: 'error', message });
    }
  }, [calc, stages, hasInput, qualityTier, region, t, language, delivery, selectedStore, loadedScope, scope, priceStorageKey, doorChoice.ready, doorChoice.selection]);

  useEffect(() => {
    if (hasInput && isPricingApiConfigured) void fetchEstimate();
    return () => { requestVersion.current++; };
  }, [hasInput, fetchEstimate]);

  if (!hasInput) {
    return <InfoState icon="dollar-sign" text={t('cmp.CostEstimate.noCalc')} />;
  }

  if (!isPricingApiConfigured) {
    return <InfoState icon="wifi-off" text={t('upgrade.compare.noApi')} />;
  }

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="tag" size={18} color={Colors.primary} />
        <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
          {t('upgrade.compare.title')}
        </Txt>
      </View>

      {doorChoice.enabled && calc && <DoorSelectionSection calc={calc} {...doorChoice} />}
      {projectId && calc?.jobId === 'eps-insulation-bso' && <Button label={language === 'pl' ? 'Uzupełnij obmiary ocieplenia' : 'Update insulation measurements'} variant="outline" onPress={() => router.push({ pathname: '/project/[id]/edit', params: { id: projectId } })} fullWidth />}

      {storeChoices?.scope === scope && loadedScope === scope && <StoreChoiceSection choices={storeChoices} selectedStore={selectedStore} postalCode={delivery.postalCode} onSelect={store => {
        if (store === selectedStore) return;
        requestVersion.current++; setState({ status: 'loading' }); setSelectedStore(store); setSaveFailed(false);
        const saved = JSON.stringify({ scope, settings: deliveryRef.current, store });
        preferenceWrites.current = preferenceWrites.current.catch(() => {}).then(() => AsyncStorage.setItem(storageKey, saved)).catch(() => setSaveFailed(true));
      }} />}

      {(state.status === 'loading' || loadedScope !== scope || !doorChoice.ready) && (
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 40 }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>
            {delivery.postalCode && delivery.mode === 'shipping' ? (language === 'pl' ? 'Sprawdzamy koszyki sklepów i koszty dostawy…' : 'Checking store baskets and delivery costs…') : t('cmp.CostEstimate.loading')}
          </Txt>
        </View>
      )}

      {state.status === 'error' && (
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
          <Feather name="alert-triangle" size={36} color={Colors.danger} />
          <Txt w="semibold" style={{ fontSize: 16, color: Colors.text, textAlign: 'center' }}>
            {t('cmp.CostEstimate.errorTitle')}
          </Txt>
          <Txt style={{ fontSize: 13, color: Colors.textMuted, textAlign: 'center', maxWidth: 280 }}>
            {state.message}
          </Txt>
          <Button label={t('cmp.CostEstimate.retry')} onPress={() => void fetchEstimate(true)} variant="outline" />
        </View>
      )}

      {state.status === 'success' && loadedScope === scope && (
        <PriceChangesProvider changes={state.priceChanges}><EstimateResult data={state.data} selectedStore={selectedStore} priceChanges={state.priceChanges} hasPriceBaseline={state.hasPriceBaseline} onRefresh={() => void fetchEstimate(true)} delivery={delivery} onDeliveryChange={settings => {
          requestVersion.current++;
          deliveryRef.current=settings;
          setState({ status: 'loading' }); setDelivery(settings); setSaveFailed(false);
          preferenceWrites.current = preferenceWrites.current.catch(() => {}).then(() => AsyncStorage.setItem(storageKey, JSON.stringify({ scope, settings, store: selectedStore }))).catch(() => setSaveFailed(true));
        }} /></PriceChangesProvider>
      )}
      {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{language === 'pl' ? 'Nie zapisano wyboru sklepu lub dostawy. Sprawdź ustawienia po ponownym otwarciu projektu.' : 'The store or delivery preference could not be saved. Check the settings when reopening the project.'}</Txt>}
      {priceSaveFailed && <Txt accessibilityRole="alert" style={{color:Colors.textSecondary}}>{language==='pl'?'Nie zapisano cen do porównania przy następnym otwarciu projektu.':'Prices could not be saved for comparison when reopening the project.'}</Txt>}
    </View>
  );
}

function EstimateResult({
  data,
  selectedStore,
  priceChanges,
  hasPriceBaseline,
  onRefresh,
  delivery,
  onDeliveryChange,
}: {
  data: SerializedProject;
  selectedStore: string | null;
  priceChanges:PriceChange[];
  hasPriceBaseline:boolean;
  onRefresh: () => void;
  delivery: DeliverySettings;
  onDeliveryChange: (settings: DeliverySettings) => void;
}) {
  const { t, language } = useLanguage();
  const tr = (pl: string, en: string) => language === 'pl' ? pl : en;
  const lines = data.stages.flatMap(stage => stage.lines);
  const resolved = lines.filter((l) => l.resolved);
  const unresolved = lines.filter((l) => !l.resolved);
  const missingPickupOffer = delivery.mode === 'pickup' && unresolved.some(line => isMissingOffer(line.reason));
  const pickupConfirmationStores = data.coverage?.pickupConfirmationStores?.filter(store => store === selectedStore || resolved.some(line => line.offers?.some(offer => offer.store === store))) ?? [];
  const pickupUnavailableStores = data.coverage?.pickupUnavailableStores?.filter(store => store === selectedStore || resolved.some(line => line.offers?.some(offer => offer.store === store))) ?? [];
  const hasDoorParts = data.stages.some(stage => stage.jobId === 'interior-doors') || lines.some(line => ['door-leaf', 'door-frame'].includes(line.product?.category ?? line.query.category ?? ''));
  const hasLeftCredis = lines.some(line => (line.product?.ean ?? line.query.ean) === '5900378219590');
  const consolidated = data.consolidated;

  const consolidatedLines = consolidated?.lines ?? [];
  const savingsGrosze = consolidated?.savingsGrosze ?? 0;
  const storeComparison = data.storeComparison;
  const checkedDates = (data.coverage?.sources ?? [])
    .filter(source => source.active !== false && source.checkedAt)
    .map(source => source.checkedAt!).sort();
  const firstChecked = formatHistoryDate(checkedDates[0] ?? '');
  const lastChecked = formatHistoryDate(checkedDates[checkedDates.length - 1] ?? '');
  const checkedRange = firstChecked === lastChecked ? firstChecked : firstChecked + ' – ' + lastChecked;

  if (lines.length === 0) {
    return <InfoState icon="package" text={t('cmp.CostEstimate.empty')} />;
  }

  return (
    <>
      {data.coverage && data.coverage.offers > 0 && (
        <View style={{ padding: 14, borderRadius: 12, backgroundColor: Colors.surface, gap: 6 }}>
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{selectedStore ? tr(`Oferty wybranego sklepu: ${selectedStore}. Ceny internetowe.`, `Selected store offers: ${selectedStore}. Online prices.`) : t('upgrade.compare.coverage', { stores: data.coverage.stores.join(', ') })}</Txt>
          <Txt style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{t('upgrade.compare.checked', { date: checkedRange })}</Txt>
        </View>
      )}
      {unresolved.length > 0 && (
        <View style={{ padding: 16, borderRadius: 16, backgroundColor: Colors.warningBg, gap:8 }} accessibilityRole="alert">
          {missingPickupOffer ? <>
            <Txt w="semibold">{tr('Brak potwierdzonej oferty odbioru', 'No confirmed collection offer')}</Txt>
            <Txt style={{fontSize:13,lineHeight:19}}>{tr('Dla części produktów z katalogu ofert nie mamy potwierdzonego zakupu z odbiorem własnym. Sprawdź dostawę do domu lub wybierz inny sklep. Pełny koszt zestawu nie jest jeszcze dostępny.', 'Some products in the offers catalogue have no confirmed purchase with self collection. Check home delivery or choose another store. The full basket cost is not yet available.')}</Txt>
            <Button variant="outline" label={tr('Porównaj z dostawą do domu', 'Compare with home delivery')} onPress={()=>onDeliveryChange({...delivery,mode:'shipping'})} fullWidth />
          </> : <Txt style={{ fontSize: 14, lineHeight: 21, color: Colors.text }}>{selectedStore ? tr(`W wybranym sklepie nie potwierdzono ofert dla ${unresolved.length} pozycji z poszczególnych prac. Pełny koszt zestawu nie jest jeszcze dostępny.`, `Offers for ${unresolved.length} items across the selected jobs could not be confirmed in this store. The full basket cost is not yet available.`) : t('upgrade.compare.partial', { count: unresolved.length })}</Txt>}
        </View>
      )}
      {pickupConfirmationStores.map(store => <View key={store} accessibilityRole="alert" style={{ padding: 14, borderRadius: 12, backgroundColor: Colors.warningBg, gap: 6 }}>
        <Txt w="semibold">{tr(`${store}: odbiór po uzgodnieniu`, `${store}: collection by arrangement`)}</Txt>
        <Txt style={{ fontSize: 13, lineHeight: 19 }}>{tr('Sklep potwierdza miejsce i termin odbioru indywidualnie. Jego ceny pokazujemy przy dostawie, ale nie uwzględniamy ich w rankingu własnego odbioru. Koszt transportu również wymaga wyceny sklepu.', 'The store confirms the collection location and date individually. Its prices are shown for home delivery but excluded from the collection ranking. Transport also requires a store quote.')}</Txt>
      </View>)}
      {pickupUnavailableStores.map(store => <View key={store} accessibilityRole="alert" style={{ padding:14,borderRadius:12,backgroundColor:Colors.warningBg,gap:6 }}>
        <Txt w="semibold">{tr(`${store}: wyłącznie dostawa`, `${store}: delivery only`)}</Txt>
        <Txt style={{fontSize:13,lineHeight:19}}>{tr('Dla tych produktów sklep nie oferuje odbioru własnego. Uwzględniamy je przy dostawie do domu, a pomijamy w rankingu odbioru.', 'The store does not offer self collection for these products. We include them for home delivery and exclude them from the collection ranking.')}</Txt>
        {store==='Kronosfera'&&<Button variant="outline" label={tr('Sprawdź warunki dostawy i odbioru', 'Check delivery and collection terms')} onPress={()=>void Linking.openURL('https://kronosfera.pl/dostawa')} />}
      </View>)}
      {(selectedStore === 'Folnet' || resolved.some(line => line.offers?.some(offer => offer.store === 'Folnet'))) && <View style={{ padding: 14, borderRadius: 12, backgroundColor: Colors.primaryBg, gap: 6 }}>
        <Txt w="semibold">{tr('Folnet: odbiór zamówienia internetowego', 'Folnet: collect an online order')}</Txt>
        <Txt style={{ fontSize: 13, lineHeight: 19 }}>{tr('Sklep nie prowadzi sprzedaży stacjonarnej. Odbiór dopiero po zamówieniu online i potwierdzeniu gotowości e-mailem: ul. Stefana Batorego 97, Batorowo, pon.–pt. 7:00–20:00. To adres magazynu odbiorów.', 'There is no walk-in sales service. Collect only after ordering online and receiving the ready-for-collection email: ul. Stefana Batorego 97, Batorowo, Mon–Fri 07:00–20:00. This is the collection warehouse.')}</Txt>
        <Button label={tr('Sprawdź zasady odbioru', 'Check collection terms')} variant="outline" onPress={() => Linking.openURL('https://folnet.pl/Odbior-osobisty-ccms-pol-30.html')} />
      </View>}
      <PriceChangeNotice changes={priceChanges} refresh={data.priceRefresh} hasBaseline={hasPriceBaseline} />
      {hasDoorParts && <View accessibilityRole="alert" style={{ padding: 16, borderRadius: 16, backgroundColor: Colors.warningBg, gap: 6 }}>
        <Txt w="semibold">{tr('Dobierz zgodny zestaw drzwi', 'Match the door components')}</Txt>
        <Txt style={{ fontSize: 14, lineHeight: 21, color: Colors.text }}>{tr('Przed zakupem sprawdź rozmiar, stronę otwierania, przylgę, zawiasy i zakres regulacji ościeżnicy. Pozycje referencyjne w wycenie wymagają dopasowania do siebie.', 'Before buying, check the size, opening direction, rebate, hinges and frame adjustment range. Reference items in the quote need to be matched to each other.')}</Txt>
        {hasLeftCredis && <Txt style={{ fontSize: 14, lineHeight: 21, color: Colors.text }}>{tr('Credis w tej wycenie to lewe białe skrzydło w rozmiarze 80, bez ościeżnicy i klamki. Nie łącz go z prawą ościeżnicą.', 'The Credis in this quote is a white, left-hand size-80 leaf without a frame or handle. Do not combine it with a right-hand frame.')}</Txt>}
      </View>}
      {data.deliveryComparison && <DeliveryComparisonSection comparison={data.deliveryComparison} settings={delivery} selectedStore={selectedStore} onApply={onDeliveryChange} />}
      {!data.deliveryComparison && storeComparison && <WhereToBuySection cmp={storeComparison} unresolvedCount={unresolved.length} showScope={!data.coverage} />}

      {/* „Kupując łącznie oszczędzasz X zł" — zysk z jednorazowego zaokrąglenia
          do opakowań na całym remoncie (liczy backend, tu tylko formatujemy). */}
      {savingsGrosze > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 12,
            backgroundColor: Colors.successBg,
            borderWidth: 1,
            borderColor: Colors.success,
          }}
        >
          <Feather name="trending-down" size={18} color={Colors.success} />
          <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: Colors.success }}>
            {t('cmp.CostEstimate.savings', { amount: formatGrosze(savingsGrosze) })}
          </Txt>
        </View>
      )}


      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
        {t('upgrade.compare.materialsOnly')}
      </Txt>

      {/* Skonsolidowana lista zakupowa całego remontu (kup raz, opak. łącznie) */}
      {consolidatedLines.length > 0 && !data.deliveryComparison?.best && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="shopping-cart" size={16} color={Colors.primary} />
            <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
              {t('upgrade.compare.pricedProducts')} ({consolidatedLines.length})
            </Txt>
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            {t('cmp.CostEstimate.consolidatedHint')}
          </Txt>
          {consolidatedLines.map((line, idx) => (
            <ConsolidatedLineCard key={`c-${line.product.id}-${idx}`} line={line} offers={resolved.find(item => item.product?.id === line.product.id)?.offers} />
          ))}
        </View>
      )}

      {/* Materiały z najtańszą ofertą */}
      {resolved.length > 0 && consolidatedLines.length === 0 && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="package" size={16} color={Colors.primary} />
            <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
              {t('cmp.CostEstimate.materialsTitle')} ({resolved.length})
            </Txt>
          </View>
          {resolved.map((line, idx) => (
            <ResolvedLineCard key={`${line.product?.id ?? 'r'}-${idx}`} line={line} />
          ))}
        </View>
      )}

      {/* Nierozpoznane — pokazane osobno, NIE wliczone do sumy */}
      {unresolved.length > 0 && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="help-circle" size={16} color={Colors.warning} />
            <Txt w="semibold" style={{ fontSize: 15, color: Colors.warning }}>
              {selectedStore ? tr(`Pozycje bez wyceny w tym sklepie (${unresolved.length})`, `Items without a price in this store (${unresolved.length})`) : t('cmp.CostEstimate.unresolvedTitle', { count: unresolved.length })}
            </Txt>
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            {selectedStore ? tr('Nie wliczono ich do sumy. Zmień sklep lub wybierz „Najtańszy zestaw”, aby sprawdzić pozostałe oferty.', 'These items are excluded from the total. Change store or select “Lowest basket” to check other offers.') : t('cmp.CostEstimate.unresolvedHint')}
          </Txt>
          {unresolved.map((line, idx) => (
            <UnresolvedLineCard key={`u-${idx}`} line={line} selectedStore={selectedStore} postalCode={delivery.postalCode} pickup={delivery.mode==='pickup'} />
          ))}
        </View>
      )}

      <Button
        label={t('cmp.CostEstimate.refresh')}
        onPress={onRefresh}
        variant="outline"
        fullWidth
      />
    </>
  );
}

function ResolvedLineCard({ line }: { line: SerializedLine }) {
  const { t } = useLanguage();
  const offer = line.cheapestOffer;
  const product = line.product;
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        gap: 6,
      }}
    >
      <ProductImage uri={getProductPhoto(product ?? {})} name={product?.name ?? ""} size={64} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Txt w="semibold" style={{ flex: 1, fontSize: 14, color: Colors.text }}>
          {product?.name ?? line.query.normalizedName ?? '—'}
        </Txt>
        <Txt w="bold" style={{ fontSize: 14, color: Colors.text }}>
          {formatGrosze(line.lineCostGrosze)}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {offer && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="shopping-bag" size={12} color={Colors.textMuted} />
            <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{offer.store}</Txt>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor: Colors.successBg,
            borderRadius: 6,
          }}
        >
          <Feather name="award" size={11} color={Colors.success} />
          <Txt w="medium" style={{ fontSize: 11, color: Colors.success }}>
            {t('cmp.CostEstimate.cheapest')}
          </Txt>
        </View>
      </View>
      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
        {t('cmp.CostEstimate.lineDetail', {
          qty: formatQuantity(line.quantity),
          unit: line.unit ?? '',
          unitPrice: offer ? formatGrosze(offer.unitPriceGrosze) : '—',
          packages: line.packagesNeeded ?? 0,
        })}
      </Txt>
      {line.packages && line.packages.length > 1 && (
        <PackageBreakdown
          packages={line.packages}
          unit={line.unit}
          totalGrosze={line.packagesTotalGrosze ?? line.lineCostGrosze}
          savingsGrosze={line.packagesSavingsGrosze ?? 0}
        />
      )}
      {product?.id && (
        <PriceHistoryPanel
          productId={product.id}
          ean={product.ean}
          gtin={product.gtin}
        />
      )}
      {line.offers && line.offers.length > 1 && (
        <OfferComparisonList offers={line.offers} preferredOfferId={line.packages && line.packages.length > 1 ? null : line.cheapestOffer?.offerId} />
      )}
    </View>
  );
}

/**
 * Rozbicie pozycji na konkretne opakowania (optymalny dobór wielkości):
 * „2× 10 l + 1× 5 l = 219,90 zł". Pokazywane tylko gdy materiał ma kilka wielkości
 * opakowań (kombinacja tańsza niż jeden rozmiar × sufit). Nic nie liczy — kwoty
 * (grosze) i sztuki pochodzą z backendu, tu tylko formatowanie na PLN i sklejenie
 * napisu. Gdy jest oszczędność vs wycena naiwna — pokazuje ją badge'em.
 */
function PackageBreakdown({
  packages,
  unit,
  totalGrosze,
  savingsGrosze,
}: {
  packages: SerializedPackage[];
  unit: string | null;
  totalGrosze: number;
  savingsGrosze: number;
}) {
  const { t, language } = useLanguage();
  const combo = packages
    .map((p) => `${p.count}× ${formatQuantity(p.packageSize)} ${unit ?? ''}`.trim())
    .join(' + ');

  return (
    <View
      style={{
        gap: 4,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Feather name="box" size={12} color={Colors.primary} />
        <Txt w="medium" style={{ flex: 1, fontSize: 12, color: Colors.text }}>
          {t('cmp.CostEstimate.packageBreakdown', {
            combo,
            total: formatGrosze(totalGrosze),
          })}
        </Txt>
      </View>
      {savingsGrosze > 0 && (
        <View style={{ flexDirection: 'row' }}>
          <Badge
            icon="trending-down"
            text={t('cmp.CostEstimate.packageSaving', { amount: formatGrosze(savingsGrosze) })}
            color={Colors.success}
            bg={Colors.successBg}
          />
        </View>
      )}
      {packages.filter(pack => (pack.minimumPackages ?? 1) > 1).map((pack, index) => <Txt key={`minimum-${pack.store}-${index}`} style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{language === 'pl' ? `${pack.store}: minimalny zakup ${pack.minimumPackages} op. Kwota uwzględnia to minimum.` : `${pack.store}: minimum purchase of ${pack.minimumPackages} packs. The cost includes this minimum.`}</Txt>)}
      {packages.filter(pack => (pack.purchaseMultiple ?? 1) > 1).map((pack, index) => <Txt key={`${pack.store}-${index}`} style={{ fontSize: 12, lineHeight: 18, color: Colors.textSecondary }}>{language === 'pl' ? `${pack.store}: zakup w partiach po ${pack.purchaseMultiple} op. Kwota uwzględnia całą wymaganą partię.` : `${pack.store}: order lots of ${pack.purchaseMultiple} packs. The cost includes the complete required lot.`}</Txt>)}
    </View>
  );
}

/**
 * Rozwijalne porównanie WSZYSTKICH ofert danego produktu (Sklep A/B/C + najtańszy).
 * Oferty przychodzą z backendu POSORTOWANE od najtańszej (pierwsza z ceną = najtańsza),
 * więc UI NIC nie liczy ani nie sortuje: formatuje grosze na PLN, oznacza najtańszą
 * badge'em, pokazuje cenę regularną (przekreśloną) tylko gdy realnie wyższa od
 * aktualnej, cenę za jednostkę, dostępność i link do produktu. Zwinięte domyślnie.
 */
function OfferComparisonList({ offers, preferredOfferId }: { offers: SerializedProductOffer[]; preferredOfferId?: string | null }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  // Prefer the backend's choice for the required quantity, not the cheapest can.
  const cheapestOfferId = preferredOfferId === undefined ? offers.find((o) => o.priceGrosze !== null)?.offerId : preferredOfferId;

  return (
    <View style={{ gap: 6 }}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2, minHeight: 44 }}
        accessibilityRole="button"
      >
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={Colors.primary}
        />
        <Txt w="medium" style={{ fontSize: 12, color: Colors.primary }}>
          {expanded
            ? t('cmp.CostEstimate.hideOffers')
            : t('cmp.CostEstimate.compareOffers', { count: offers.length })}
        </Txt>
      </Pressable>

      {expanded && (
        <View
          style={{
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {offers.map((offer, idx) => (
            <OfferRow
              key={offer.offerId}
              offer={offer}
              isCheapest={offer.offerId === cheapestOfferId}
              isFirst={idx === 0}
            />
          ))}
        </View>
      )}
    </View>
  );
}

/** Jeden wiersz oferty: sklep + badge „najtańsza", cena aktualna/regularna, zł/jedn., dostępność, link. */
function OfferRow({
  offer,
  isCheapest,
  isFirst,
}: {
  offer: SerializedProductOffer;
  isCheapest: boolean;
  isFirst: boolean;
}) {
  const { t, language } = useLanguage();
  const hasPromo =
    offer.regularPriceGrosze !== null &&
    offer.priceGrosze !== null &&
    offer.regularPriceGrosze > offer.priceGrosze;

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 4,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: Colors.border,
        backgroundColor: isCheapest ? Colors.successBg : Colors.surface,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          <Feather name="shopping-bag" size={12} color={Colors.textMuted} />
          <Txt w="medium" style={{ fontSize: 13, color: Colors.text }}>
            {offer.store}
          </Txt>
          {isCheapest && (
            <Badge
              icon="award"
              text={t('cmp.CostEstimate.cheapest')}
              color={Colors.success}
              bg={Colors.surface}
            />
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {hasPromo && (
            <Txt
              style={{
                fontSize: 12,
                color: Colors.textMuted,
                textDecorationLine: 'line-through',
              }}
            >
              {formatGrosze(offer.regularPriceGrosze)}
            </Txt>
          )}
          <Txt w="bold" style={{ fontSize: 14, color: hasPromo ? Colors.danger : Colors.text }}>
            {offer.priceGrosze !== null ? formatGrosze(offer.priceGrosze) : '—'}
          </Txt>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {(offer.minimumPackages ?? 1) > 1 && <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{language === 'pl' ? `Minimalny zakup: ${offer.minimumPackages} op.` : `Minimum purchase: ${offer.minimumPackages} packs`}</Txt>}
        {(offer.purchaseMultiple ?? 1) > 1 && <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{language === 'pl' ? `Zakup w partiach po ${offer.purchaseMultiple} op.` : `Order lots of ${offer.purchaseMultiple} packs`}</Txt>}
        {offer.pricePerUnitGrosze !== null && (
          <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>
            {t('cmp.CostEstimate.perUnit', {
              price: formatGrosze(offer.pricePerUnitGrosze),
              unit: offer.unit ?? '',
            })}
          </Txt>
        )}
        {offer.availability && (
          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
            {availabilityLabel(offer.availability, t)}
          </Txt>
        )}
        {offer.url && (
          <Pressable
            onPress={() => {
              if (offer.url) void Linking.openURL(offer.url).catch(() => {});
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
            accessibilityRole="link"
          >
            <Feather name="external-link" size={11} color={Colors.primary} />
            <Txt w="medium" style={{ fontSize: 11, color: Colors.primary }}>
              {t('cmp.CostEstimate.openProduct')}
            </Txt>
          </Pressable>
        )}
      </View>

      <PriceChangeBadge offerId={offer.offerId} />
      {offer.fetchedAt && (
        <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
          {t('cmp.CostEstimate.offerFreshness', {
            date: formatHistoryDate(offer.fetchedAt),
            source: offer.source?.startsWith('retailer-page-') ? t('upgrade.compare.storePage') : offer.source ?? offer.store,
          })}
        </Txt>
      )}
    </View>
  );
}

/** Mapuje surową dostępność ze sklepu na etykietę; nieznane wartości pokazuje 1:1. */
function availabilityLabel(
  raw: string,
  t: (key: any, params?: Record<string, string | number>) => string,
): string {
  const key = raw.trim().toLowerCase();
  if (key === 'in_stock' || key === 'instock') return t('cmp.CostEstimate.availability.in_stock');
  if (key === 'out_of_stock' || key === 'outofstock')
    return t('cmp.CostEstimate.availability.out_of_stock');
  return raw;
}

/**
 * Sekcja „Gdzie kupić": porównanie sklepów dla całego remontu. Pokazuje najtańszy
 * pojedynczy sklep na całość (albo notę, gdy żaden nie ma kompletu), koszt całości
 * w każdym sklepie z pokryciem, koszyk optymalny (najtaniej per produkt) z
 * rozbiciem po sklepach oraz baner „w jednym sklepie: +X". Nic nie liczy — kwoty
 * (grosze) pochodzą z backendu, tu tylko formatowanie na PLN.
 */
function WhereToBuySection({ cmp, unresolvedCount, showScope = true }: { cmp: SerializedStoreComparison; unresolvedCount: number; showScope?: boolean }) {
  const { t } = useLanguage();
  if (cmp.productCount === 0 || cmp.stores.length === 0) return null;

  const full = unresolvedCount === 0 ? cmp.cheapestFullStore : null;
  const extra = cmp.singleStoreExtraGrosze;

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="map-pin" size={16} color={Colors.primary} />
        <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
          {t('cmp.CostEstimate.whereToBuyTitle')}
        </Txt>
      </View>
      {showScope && <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
        {t('upgrade.compare.scope')}
      </Txt>}

      {/* Koszyk optymalny (najtaniej per produkt) + rozbicie po sklepach */}
      <View
        style={{
          backgroundColor: Colors.primaryBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 12,
          gap: 4,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: Colors.primaryDark }}>
            {t('upgrade.compare.manyStores')}
          </Txt>
          <Txt w="bold" style={{ fontSize: 16, color: Colors.primary }}>
            {formatGrosze(cmp.optimalBasketGrosze)}
          </Txt>
        </View>
        <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
          {t('cmp.CostEstimate.optimalBasketHint')}
        </Txt>
        {cmp.optimalByStore.map((s) => (
          <Txt key={s.store} style={{ fontSize: 12, color: Colors.textSecondary }}>
            {t('cmp.CostEstimate.optimalStoreLine', {
              store: s.store,
              amount: formatGrosze(s.totalGrosze),
              count: s.itemCount,
            })}
          </Txt>
        ))}
      </View>

      {/* Najtańszy sklep na całość (pełne pokrycie) albo nota, gdy brak kompletu */}
      {full ? (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 12,
            gap: 4,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>
                {t('upgrade.compare.oneStore')}
              </Txt>
              <Txt w="bold" style={{ fontSize: 15, color: Colors.text }}>
                {full.store}
              </Txt>
            </View>
            <Txt w="bold" style={{ fontSize: 18, color: Colors.primary }}>
              {formatGrosze(full.totalGrosze)}
            </Txt>
          </View>
        </View>
      ) : unresolvedCount === 0 ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 12,
            backgroundColor: Colors.warningBg,
            borderWidth: 1,
            borderColor: '#FDE68A',
          }}
        >
          <Feather name="info" size={16} color={Colors.warning} />
          <Txt style={{ flex: 1, fontSize: 12, color: Colors.text }}>
            {t(unresolvedCount > 0 ? 'upgrade.compare.incompleteStores' : 'cmp.CostEstimate.noFullStore')}
          </Txt>
        </View>
      ) : null}

      {/* Koszt całości w każdym sklepie (rosnąco) + pokrycie */}
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.border,
          overflow: 'hidden',
        }}
      >
        <View style={{ padding: 10, paddingBottom: 6 }}>
          <Txt w="medium" style={{ fontSize: 12, color: Colors.textSecondary }}>
            {t('upgrade.compare.storeTotals')}
          </Txt>
        </View>
        {[...cmp.stores].sort((a, b) => a.missingCount - b.missingCount || a.totalGrosze - b.totalGrosze).map((s) => (
          <StoreBasketRow key={s.store} basket={s} productCount={cmp.productCount + unresolvedCount} />
        ))}
      </View>

      {/* Baner: ile więcej kosztuje kupno wszystkiego w jednym sklepie */}
      {full && extra !== null && extra > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 12,
            backgroundColor: Colors.surfaceAlt,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Feather name="trending-up" size={18} color={Colors.textSecondary} />
          <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: Colors.text }}>
            {t('upgrade.compare.saving', { amount: formatGrosze(extra) })}
          </Txt>
        </View>
      )}
      {full && extra !== null && extra <= 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 12,
            backgroundColor: Colors.successBg,
            borderWidth: 1,
            borderColor: Colors.success,
          }}
        >
          <Feather name="check-circle" size={18} color={Colors.success} />
          <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: Colors.success }}>
            {t('cmp.CostEstimate.singleStoreNoExtra', { store: full.store })}
          </Txt>
        </View>
      )}
    </View>
  );
}

/** Wiersz „koszt całości w jednym sklepie": nazwa + kwota + pokrycie (pokrywa X/Y). */
function StoreBasketRow({
  basket,
  productCount,
}: {
  basket: SerializedStoreBasket;
  productCount: number;
}) {
  const { t } = useLanguage();
  const full = basket.coveredCount === productCount;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Txt w="medium" style={{ fontSize: 13, color: Colors.text }}>
          {basket.store}
        </Txt>
        <Txt
          style={{
            fontSize: 11,
            color: full ? Colors.textMuted : Colors.warning,
          }}
        >
          {t('cmp.CostEstimate.storeCoverage', {
            covered: basket.coveredCount,
            total: productCount,
          })}
        </Txt>
      </View>
      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
        {formatGrosze(basket.totalGrosze)}
      </Txt>
    </View>
  );
}

/**
 * Karta skonsolidowanej pozycji zakupowej: produkt zebrany ze wszystkich etapów.
 * Pokazuje łączną ilość natywną, liczbę opakowań (policzoną RAZ na sumie), sklep,
 * koszt skonsolidowany oraz — gdy dodatnia — oszczędność vs suma per-etap. Nic nie
 * liczy: kwoty (grosze) i ilości pochodzą z backendu, tu tylko formatowanie.
 */
function ConsolidatedLineCard({ line, offers }: { line: SerializedConsolidatedLine; offers?: SerializedProductOffer[] }) {
  const { t } = useLanguage();
  const offer = line.cheapestOffer;
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        gap: 6,
      }}
    >
      <ProductImage uri={getProductPhoto(line.product ?? {})} name={line.product?.name ?? ""} size={64} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Txt w="semibold" style={{ flex: 1, fontSize: 14, color: Colors.text }}>{line.product.name}</Txt>
        <Txt w="bold" style={{ fontSize: 14, color: Colors.text }}>{formatGrosze(line.lineCostGrosze)}</Txt>
      </View>
      {line.packages && <PackageBreakdown packages={line.packages} unit={line.unit} totalGrosze={line.lineCostGrosze} savingsGrosze={line.savingsGrosze} />}
      {line.packages?.map((entry, index) => entry.url?.startsWith('https://') ? (
        <Pressable key={`${entry.store}-${index}`} onPress={() => { void Linking.openURL(entry.url!).catch(() => {}); }} accessibilityRole="link" style={{ minHeight: 44, justifyContent: 'center', paddingVertical: 10 }}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.primaryDark }}>{entry.store} · {t('upgrade.compare.open')}</Txt>
        </Pressable>
      ) : null)}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {offer && !line.packages && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="shopping-bag" size={12} color={Colors.textMuted} />
            <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{offer.store}</Txt>
          </View>
        )}
        {line.savingsGrosze > 0 && (
          <Badge
            icon="trending-down"
            text={t('cmp.CostEstimate.savedBadge', { amount: formatGrosze(line.savingsGrosze) })}
            color={Colors.success}
            bg={Colors.successBg}
          />
        )}
      </View>
      {!line.packages && (
        <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
          {t('cmp.CostEstimate.consolidatedLineDetail', {
            qty: formatQuantity(line.totalQuantity),
            unit: line.unit ?? '',
            packages: line.packagesNeeded,
            unitPrice: offer ? formatGrosze(offer.unitPriceGrosze) : '—',
          })}
        </Txt>
      )}
      {offers && offers.length > 1 && <OfferComparisonList offers={offers} preferredOfferId={line.packages && line.packages.length > 1 ? null : line.cheapestOffer?.offerId} />}
      <PriceHistoryPanel productId={line.product.id} ean={line.product.ean} gtin={line.product.gtin} />
    </View>
  );
}

/**
 * Rozwijalny panel „Historia ceny" produktu (warstwa odczytu /pricing/history).
 * Zwinięty pokazuje szybkie badge'y (najniższa / ostatnia zmiana / „prawdziwa
 * promocja"); po tapnięciu rozwija: sparkline z punktów cenowych (rysowany
 * z danych, View-owe słupki — bez plików graficznych), podsumowanie
 * (najniższa/średnia/aktualna/zmiana%) oraz listę punktów cenowych z datą pobrania
 * (malejąco po dacie). Read-only: sam pobiera pełną historię (grosze) i tylko ją
 * formatuje — NIC nie liczy (statystyki i kwoty przychodzą z backendu). Brak
 * historii (404/null) => nic nie renderuje. Błędy sieci przełykamy po cichu, żeby
 * nie psuć głównej wyceny.
 */
function PriceHistoryPanel({
  productId,
  ean,
  gtin,
}: {
  productId: string;
  ean: string | null;
  gtin: string | null;
}) {
  const { t } = useLanguage();
  const [data, setData] = useState<PriceHistoryResponse | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchPriceHistory({ productId, ean, gtin });
        // Demo history must not manufacture a promotion badge for a real offer.
        const hasUnverifiedHistory = res?.history.some(point => !point.source || /seed|fixture|mock|demo|reference/i.test(point.source));
        if (!cancelled) setData(hasUnverifiedHistory ? null : res);
      } catch {
        if (!cancelled) setData(null); // awaria historii nie blokuje wyceny
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, ean, gtin]);

  if (!data || data.stats.count === 0) return null;

  const stats = data.stats;
  const hasChange = stats.changePct !== null && stats.changePct !== 0;
  const wentUp = (stats.changePct ?? 0) > 0;

  // Tylko punkty z ceną efektywną. API zwraca je chronologicznie (najstarsze
  // pierwsze) — tak też rysujemy sparkline (lewa→prawa = starsze→nowsze).
  const chronological = data.history.filter(
    (p): p is SerializedHistoryPoint & { effectiveGrosze: number } =>
      p.effectiveGrosze !== null,
  );
  // Lista malejąco po dacie (najnowsze najpierw) — wymóg zadania.
  const newestFirst = [...chronological].sort((a, b) =>
    a.fetchedAt < b.fetchedAt ? 1 : a.fetchedAt > b.fetchedAt ? -1 : 0,
  );

  return (
    <View style={{ gap: 6 }}>
      {/* Nagłówek: toggle + szybkie badge'y (widoczne również po zwinięciu). */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingVertical: 2 }}
        accessibilityRole="button"
      >
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={Colors.primary}
        />
        <Txt w="medium" style={{ fontSize: 12, color: Colors.primary }}>
          {expanded
            ? t('cmp.CostEstimate.priceHistoryHide')
            : t('cmp.CostEstimate.priceHistory', { count: stats.count })}
        </Txt>
        {stats.isRealPromo && (
          <Badge
            icon="tag"
            text={t('cmp.CostEstimate.realPromo')}
            color={Colors.success}
            bg={Colors.successBg}
          />
        )}
        {stats.lowest !== null && (
          <Badge
            icon="trending-down"
            text={t('cmp.CostEstimate.lowest', { price: formatGrosze(stats.lowest) })}
            color={Colors.textSecondary}
            bg={Colors.surfaceAlt}
          />
        )}
        {hasChange && (
          <Badge
            icon={wentUp ? 'arrow-up-right' : 'arrow-down-right'}
            text={`${wentUp ? '+' : ''}${stats.changePct}%`}
            color={wentUp ? Colors.danger : Colors.success}
            bg={wentUp ? Colors.dangerBg : Colors.successBg}
          />
        )}
      </Pressable>

      {expanded && (
        <View
          style={{
            gap: 10,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          }}
        >
          {/* Sparkline z punktów cenowych (>=2 punkty, żeby był sens rysować). */}
          {chronological.length > 1 && <PriceSparkline points={chronological} />}

          {/* Podsumowanie: najniższa / średnia / aktualna / zmiana% */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <StatCell label={t('cmp.CostEstimate.statLowest')} value={formatGrosze(stats.lowest)} />
            <StatCell label={t('cmp.CostEstimate.statAverage')} value={formatGrosze(stats.average)} />
            <StatCell label={t('cmp.CostEstimate.statCurrent')} value={formatGrosze(stats.current)} />
            <StatCell
              label={t('cmp.CostEstimate.statChange')}
              value={hasChange ? `${wentUp ? '+' : ''}${stats.changePct}%` : '—'}
              color={hasChange ? (wentUp ? Colors.danger : Colors.success) : Colors.text}
            />
          </View>

          {/* Lista punktów cenowych: data pobrania + kwota (malejąco po dacie). */}
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            {newestFirst.map((point, idx) => (
              <PriceHistoryRow
                key={`${point.fetchedAt}-${point.store}-${idx}`}
                point={point}
                isFirst={idx === 0}
                isLowest={stats.lowest !== null && point.effectiveGrosze === stats.lowest}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Prosty sparkline słupkowy rysowany WYŁĄCZNIE z danych (View-owe słupki, bez
 * plików graficznych ani bibliotek wykresów). Wysokość słupka proporcjonalna do
 * ceny efektywnej punktu; ostatni słupek (najnowsza cena) wyróżniony. Nic nie
 * liczy poza skalowaniem pikseli do wysokości — kwoty pochodzą z backendu.
 */
function PriceSparkline({
  points,
}: {
  points: Array<SerializedHistoryPoint & { effectiveGrosze: number }>;
}) {
  const values = points.map((p) => p.effectiveGrosze);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const H = 44;
  const MIN_BAR = 4;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: H }}>
      {points.map((p, i) => {
        const h = range === 0 ? H : MIN_BAR + ((p.effectiveGrosze - min) / range) * (H - MIN_BAR);
        const isLast = i === points.length - 1;
        return (
          <View
            key={`${p.fetchedAt}-${i}`}
            style={{
              flex: 1,
              height: h,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              backgroundColor: isLast ? Colors.primary : Colors.primaryBg,
            }}
          />
        );
      })}
    </View>
  );
}

/** Komórka podsumowania statystyki: etykieta u góry, wartość (grosze→PLN) pod nią. */
function StatCell({
  label,
  value,
  color = Colors.text,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: '46%',
        backgroundColor: Colors.surfaceAlt,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 2,
      }}
    >
      <Txt style={{ fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase' }}>
        {label}
      </Txt>
      <Txt w="bold" style={{ fontSize: 14, color }}>
        {value}
      </Txt>
    </View>
  );
}

/** Jeden wiersz historii ceny: data pobrania + sklep, po prawej kwota efektywna. */
function PriceHistoryRow({
  point,
  isFirst,
  isLowest,
}: {
  point: SerializedHistoryPoint & { effectiveGrosze: number };
  isFirst: boolean;
  isLowest: boolean;
}) {
  const { t } = useLanguage();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: Colors.border,
        backgroundColor: isLowest ? Colors.successBg : Colors.surface,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Txt w="medium" style={{ fontSize: 12, color: Colors.text }}>
          {formatHistoryDate(point.fetchedAt)}
        </Txt>
        <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{point.store}</Txt>
      </View>
      {isLowest && (
        <Badge
          icon="trending-down"
          text={t('cmp.CostEstimate.statLowest')}
          color={Colors.success}
          bg={Colors.surface}
        />
      )}
      <Txt w="bold" style={{ fontSize: 13, color: Colors.text }}>
        {formatGrosze(point.effectiveGrosze)}
      </Txt>
    </View>
  );
}

/** Mała pigułka: ikona Feather + tekst, na tle. */
function Badge({
  icon,
  text,
  color,
  bg,
}: {
  icon: string;
  text: string;
  color: string;
  bg: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: bg,
        borderRadius: 6,
      }}
    >
      <Feather name={icon as any} size={11} color={color} />
      <Txt w="medium" style={{ fontSize: 11, color }}>
        {text}
      </Txt>
    </View>
  );
}

function UnresolvedLineCard({ line, selectedStore, postalCode, pickup }: { line: SerializedLine; selectedStore?: string | null; postalCode?: string; pickup?:boolean }) {
  const { t, language } = useLanguage();
  const ref = unpricedReference(line), pl = language === 'pl';
  const [linkFailed, setLinkFailed] = useState(false);
  const mapUrl = ref && postalCode ? storeMapSearchUrl(ref.store, postalCode) : null;
  const open = (url: string) => { setLinkFailed(false); void Linking.openURL(url).catch(() => setLinkFailed(true)); };
  return (
    <View
      style={{
        backgroundColor: Colors.warningBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FDE68A',
        padding: 12,
        gap: 4,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        {ref && <ProductImage uri={ref.imageUrl} name={ref.name} size={56} />}
        <View style={{ flex: 1, gap: 5 }}>
          <Txt w="medium" style={{ fontSize: 14, color: Colors.text }}>{ref?.name ?? line.query.normalizedName ?? line.query.ean ?? line.query.gtin ?? '—'}</Txt>
          {ref?.ean && <Txt selectable style={{ fontSize: 12, color: Colors.textSecondary }}>EAN: {ref.ean}</Txt>}
        </View>
      </View>
      <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>
        {pickup && isMissingOffer(line.reason) ? (pl ? 'Brak potwierdzonej oferty odbioru własnego dla tego produktu.' : 'No confirmed self-collection offer for this product.') : selectedStore && !['empty_query','no-query'].includes(line.reason ?? '') ? (pl ? 'Brak potwierdzonej oferty w wybranym sklepie.' : 'No confirmed offer in the selected store.') : t(unresolvedReasonKey(line.reason))}
      </Txt>
      {ref && <>
        <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 19 }}>{pl ? 'Nie doliczamy tej pozycji do sumy. W sklepie sprawdzisz aktualną cenę, zapas i możliwość odbioru.' : 'This item is excluded from the total. Check its current price, stock and collection options at the shop.'}</Txt>
        <Button variant="outline" label={pl ? `Sprawdź produkt — ${ref.store}` : `Check product — ${ref.store}`} onPress={() => open(ref.url)} fullWidth />
        {mapUrl && <>
          <Button variant="outline" label={pl ? `Wyszukaj placówkę ${ref.store} dla ${postalCode}` : `Find ${ref.store} near ${postalCode}`} onPress={() => open(mapUrl)} fullWidth />
          <Txt style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 18 }}>{pl ? 'Mapy wyszukają placówki i punkty odbioru. Cenę i dostępność potwierdź w wybranej placówce.' : 'Maps searches for stores and collection points. Confirm prices and availability with the selected branch.'}</Txt>
        </>}
        {linkFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie udało się otworzyć strony. Spróbuj ponownie.' : 'The page could not be opened. Please try again.'}</Txt>}
      </>}
    </View>
  );
}

function InfoState({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 40 }}>
      <Feather name={icon as any} size={36} color={Colors.textMuted} />
      <Txt
        w="medium"
        style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280 }}
      >
        {text}
      </Txt>
    </View>
  );
}

/** Ilość: przycina zbędne zera (12.00 → 12, 2.50 → 2.5). Tylko prezentacja. */
function formatQuantity(qty: number): string {
  if (!isFinite(qty)) return '0';
  return Number.isInteger(qty) ? String(qty) : String(Number(qty.toFixed(2)));
}

/**
 * ISO 8601 → „DD.MM.YYYY" (format neutralny językowo, jednoznaczny w PL i EN).
 * Wejście nieparsowalne zwraca surowe (fail-safe, żeby nie wywalić listy).
 */
function formatHistoryDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}
