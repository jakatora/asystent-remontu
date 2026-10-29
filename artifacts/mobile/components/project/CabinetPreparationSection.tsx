import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, TextInput, View, useWindowDimensions } from 'react-native';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { getProductPhoto } from '@/data/products/photos';
import type { CalculationResult, ShoppingItem } from '@/types/domain';
import type { MaterialCategory } from '@/types/pricing';
import { estimateProject, formatGrosze, type SerializedProject } from '@/features/pricing/pricingApi';
import { cabinetPreparationKits, deliveredCabinetPreparation, projectWithCabinetPreparation, type CabinetPreparationKit } from '@/features/pricing/cabinetPreparationKits';
import { deliveredKitRecheckAt } from '@/features/pricing/deliveredKit';
import type { DeliverySettings } from '../../../../lib/pricing-service/src/delivery';
import { ProductImage } from './ProductImage';

interface Props {
  projectId: string;
  calc: CalculationResult;
  items: readonly ShoppingItem[];
  tier: MaterialCategory;
  region?: string;
  store: string | null;
  settings: DeliverySettings;
  ready: boolean;
  onSettings: (settings: DeliverySettings) => void;
}
type Row = { preparation: number; data: SerializedProject | null };

export function CabinetPreparationSection({ projectId, calc, items, tier, region, store, settings, ready, onSettings }: Props) {
  const { projects, updateProject, logActivity } = useApp(), { language } = useLanguage(), pl = language === 'pl';
  const { width } = useWindowDimensions();
  const kits = useMemo(() => cabinetPreparationKits(calc, projectId, items, tier), [calc, projectId, items, tier]);
  const scope = JSON.stringify([projectId, calc, items, tier, region, store, settings, ready]);
  const [open, setOpen] = useState(false), [checking, setChecking] = useState(false), [saving, setSaving] = useState(false);
  const [postcode, setPostcode] = useState(settings.postalCode ?? '');
  const [result, setResult] = useState<{ scope: string; rows: Row[] } | null>(null);
  const [message, setMessage] = useState<string | null>(null), [, tick] = useState(0);
  const version = useRef(0), busy = useRef(false), savingRef = useRef(false), mounted = useRef(true), editingPostal = useRef(false);
  const current = useRef({ scope, projects }); current.current = { scope, projects };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; version.current++; }; }, []);
  useEffect(() => { version.current++; setResult(null); }, [scope]);
  useEffect(() => { setMessage(null); setOpen(false); }, [projectId]);
  useEffect(() => { if (!editingPostal.current) setPostcode(settings.postalCode ?? ''); }, [settings.postalCode]);
  const rows = result?.scope === scope ? result.rows : [];
  const summaries = kits.map(kit => {
    const data = rows.find(row => row.preparation === kit.preparation)?.data;
    return data ? deliveredCabinetPreparation(kit, data, settings, store) : null;
  });
  const validPrices = summaries.filter(Boolean), bestPrice = validPrices.length ? Math.min(...validPrices.map(row => row!.totalGrosze)) : null;
  const highestPrice = validPrices.length === 2 ? Math.max(...validPrices.map(row => row!.totalGrosze)) : null;
  const boundaries = [...validPrices.map(row => row!.expiresAt + 10), ...rows.flatMap(row => row.data ? [deliveredKitRecheckAt(row.data)] : [])].filter((n): n is number => n !== null);
  const expiry = boundaries.length ? Math.min(...boundaries) : null;
  useEffect(() => {
    if (!expiry) return;
    const timer = setTimeout(() => tick(n => n + 1), Math.max(1, expiry - Date.now()));
    return () => clearTimeout(timer);
  }, [expiry]);
  if (!kits.length) return null;

  const check = async () => {
    if (!ready || busy.current || savingRef.current || settings.mode !== 'shipping' || !/^\d{2}-\d{3}$/.test(settings.postalCode ?? '')) return;
    const request = ++version.current, requestedScope = scope;
    busy.current = true; setChecking(true); setResult(null); setMessage(null);
    try {
      const checked = await Promise.all(kits.map(async kit => {
        try { return { preparation: kit.preparation, data: await estimateProject(kit.stages, { region, delivery: settings, ...(store ? { store } : {}) }) }; }
        catch { return { preparation: kit.preparation, data: null }; }
      }));
      if (mounted.current && request === version.current && requestedScope === current.current.scope) setResult({ scope: requestedScope, rows: checked });
    } finally { busy.current = false; if (mounted.current) setChecking(false); }
  };
  const choose = async (kit: CabinetPreparationKit) => {
    const row = rows.find(row => row.preparation === kit.preparation);
    if (savingRef.current || !ready || current.current.scope !== result?.scope || !row?.data || !deliveredCabinetPreparation(kit, row.data, settings, store)) return;
    const project = current.current.projects.find(p => p.id === projectId), next = project && projectWithCabinetPreparation(project, kit);
    if (!next) { setMessage(pl ? 'Projekt zmienił się od wyceny. Porównaj warianty ponownie.' : 'The project changed after this quote. Compare options again.'); setResult(null); return; }
    savingRef.current = true; setSaving(true); setMessage(null);
    try {
      await updateProject(next);
      if (mounted.current) { setOpen(false); setResult(null); setMessage(pl ? `Wybrano ${kit.product.brand} 500 ml. Zapisano wybór w projekcie i wspólnym koszyku.` : `Selected ${kit.product.brand} 500 ml. Saved to the project and renovation basket.`); }
      try { await logActivity(projectId, 'edited', pl ? `Wybrano środek do przygotowania frontów: ${kit.product.brand} 500 ml` : `Selected cabinet preparation: ${kit.product.brand} 500 ml`); } catch { /* Choice was already read back; never replay the save for an activity failure. */ }
    } catch {
      if (mounted.current) setMessage(pl ? 'Nie udało się potwierdzić zapisu. Sprawdź zapisany projekt przed kolejną próbą.' : 'The save could not be confirmed. Check the saved project before trying again.');
    } finally { savingRef.current = false; if (mounted.current) setSaving(false); }
  };
  return <View style={{ gap: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface }}>
    <Txt w="bold" style={{ fontSize: 19 }}>{pl ? 'Porównaj środki i koszt całego zestawu' : 'Compare preparation and complete kit cost'}</Txt>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 21 }}>{pl
      ? 'Te same fronty, farba i potrzebne ilości; porównamy Anser oraz Chem-Rozlew 500 ml wraz z dostawami wszystkich pozostałych materiałów. Odpowiedni detergent jest już posiadany zgodnie z Twoim wyborem w obmiarach.'
      : 'The same cabinets, paint and required quantities; compare Anser and Chem-Rozlew 500 ml including delivery of all remaining materials. Your measurements already confirm that you own the appropriate detergent.'}</Txt>
    {message && <Txt accessibilityRole="alert" style={{ lineHeight: 21 }}>{message}</Txt>}
    {settings.mode !== 'shipping' ? <Txt style={{ color: Colors.textSecondary }}>{pl ? 'Aby sprawdzić warianty z dostawą, wybierz poniżej „Dostawa do domu”. Odbiór w sklepie wymaga potwierdzenia ceny i stanu.' : 'Choose home delivery below to compare delivered options. Store collection needs price and stock confirmation.'}</Txt>
      : !open ? <Button variant="outline" label={pl ? 'Porównaj dwa warianty z dostawą' : 'Compare two delivered options'} disabled={!ready || saving} onPress={() => setOpen(true)} />
        : <>
          <Txt w="semibold">{pl ? 'Kod pocztowy dostawy' : 'Delivery postcode'}</Txt>
          <TextInput accessibilityLabel={pl ? 'Kod pocztowy porównania środków do frontów' : 'Postcode for cabinet preparation comparison'} placeholder="00-000" keyboardType="number-pad" maxLength={6} value={postcode} editable={ready && !saving} onFocus={() => { editingPostal.current = true; }} onBlur={() => { editingPostal.current = false; }} onChangeText={value => {
            const digits = value.replace(/\D/g, '').slice(0, 5), formatted = digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
            setPostcode(formatted); onSettings({ ...settings, method: 'automatic', postalCode: digits.length === 5 ? formatted : undefined });
          }} style={{ minHeight: 48, padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, color: Colors.text, backgroundColor: Colors.background }} />
          <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{store ? (pl ? `Porównanie tylko w sklepie: ${store}.` : `Comparing only in ${store}.`) : (pl ? 'Porównamy koszyki dostępnych sklepów. Wyboru dokonasz po sprawdzeniu cen.' : 'We compare available store baskets. Choose after checking the prices.')} {pl ? 'Zachowamy wybrane poniżej zasady osobnych zamówień oraz oznaczenia „Mam” i „Kupione”.' : 'Your separate-order preference and owned/purchased items are respected.'}</Txt>
          <Button label={pl ? 'Sprawdź ceny obu pełnych zestawów' : 'Check both complete kit prices'} disabled={!ready || checking || saving || !/^\d{2}-\d{3}$/.test(settings.postalCode ?? '')} onPress={() => void check()} />
          {checking && <ActivityIndicator color={Colors.primary} accessibilityLabel={pl ? 'Sprawdzamy pełne zestawy i dostawy' : 'Checking complete kits and deliveries'} />}
          <View style={{ flexDirection: width >= 800 ? 'row' : 'column', gap: 12 }}>
            {kits.map((kit, index) => {
              const summary = summaries[index], row = rows.find(r => r.preparation === kit.preparation), cheapest = validPrices.length === 2 && summary?.totalGrosze === bestPrice && highestPrice! > bestPrice!;
              return <View key={kit.preparation} style={{ flex: width >= 800 ? 1 : undefined, minWidth: 0, gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: cheapest ? Colors.primary : Colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><ProductImage uri={getProductPhoto(kit.product)} name={kit.product.productLabel} size={64} /><View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{kit.product.productLabel}</Txt><Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{kit.calculation.measurements.cabinetSolventBottles} × 500 ml{calc.measurements.cabinetPreparation === kit.preparation ? (pl ? ' · obecny wybór' : ' · current choice') : ''}</Txt></View></View>
                {summary ? <>
                  {cheapest && <Txt w="semibold" style={{ color: Colors.primary }}>{pl ? 'Tańszy z dwóch porównanych wariantów' : 'Cheaper of the two compared options'}</Txt>}
                  <Txt w="bold" style={{ fontSize: 26, color: Colors.primary }}>{formatGrosze(summary.totalGrosze)}</Txt>
                  <Txt>{pl ? 'Materiały' : 'Materials'}: {formatGrosze(summary.materialsGrosze)} · {pl ? 'dostawy' : 'deliveries'}: {formatGrosze(summary.deliveryGrosze)}</Txt>
                  {cheapest && <Txt>{pl ? 'Oszczędzasz' : 'Save'} {formatGrosze(highestPrice! - summary.totalGrosze)} {pl ? 'na całym zestawie względem drugiego wariantu.' : 'on the complete kit versus the other option.'}</Txt>}
                  <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{summary.stores.join(' · ')}. {pl ? 'Osobne zamówienia' : 'Separate orders'}: {summary.orders}.</Txt>
                  <Button label={pl ? `Wybieram ${kit.product.brand} i zapisuję` : `Choose ${kit.product.brand} and save`} disabled={!ready || saving || checking || calc.measurements.cabinetPreparation === kit.preparation} onPress={() => void choose(kit)} />
                </> : <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{row ? (pl ? 'Nie potwierdzono aktualnego pełnego kosztu. Sprawdź kod, obmiary lub wybór sklepu i porównaj ponownie.' : 'A current complete cost could not be confirmed. Check postcode, measurements or store and compare again.') : (pl ? 'Sprawdź cenę pełnego zestawu z dostawami.' : 'Check the complete kit price including deliveries.')}</Txt>}
              </View>;
            })}
          </View>
          <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{pl ? 'Kwoty brutto dotyczą pozostałych materiałów, bez narzędzi i robocizny. Różnica wynika z wyboru produktu i dostaw, nie ze zmiany ceny tego samego produktu. Wyceny mają ograniczony czas ważności.' : 'Gross totals cover remaining materials, excluding tools and labour. The difference comes from product and delivery choices, not a price change of the same item. Quotes expire.'}</Txt>
          <Button variant="ghost" label={pl ? 'Ukryj porównanie środków' : 'Hide preparation comparison'} disabled={saving} onPress={() => setOpen(false)} />
        </>}
  </View>;
}
