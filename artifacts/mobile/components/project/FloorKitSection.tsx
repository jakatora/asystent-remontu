import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { getProductPhoto } from '@/data/products/photos';
import { estimateProject, formatGrosze, type SerializedProject } from '@/features/pricing/pricingApi';
import { deliveredFloorKit, type FloorKitCandidate } from '@/features/pricing/floorKits';
import type { DeliverySettings } from '../../../../lib/pricing-service/src/delivery';
import { ProductImage } from './ProductImage';

interface Props {
  candidates: readonly FloorKitCandidate[];
  scope: string;
  ready: boolean;
  settings: DeliverySettings;
  onSettings: (settings: DeliverySettings) => void;
  onApply: (candidate: FloorKitCandidate) => void;
}
type Result = { id: string; data: SerializedProject | null };

export function FloorKitSection({ candidates, scope, ready, settings, onSettings, onApply }: Props) {
  const { language } = useLanguage(), pl = language === 'pl';
  const [open, setOpen] = useState(false), [checking, setChecking] = useState(false);
  const [postcode, setPostcode] = useState(settings.postalCode ?? '');
  const [result, setResult] = useState<{ scope: string; rows: Result[] } | null>(null);
  const [, tick] = useState(0);
  const version = useRef(0), busy = useRef(false), mounted = useRef(true), editingPostal = useRef(false), currentScope = useRef(scope);
  currentScope.current = scope;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; version.current++; }; }, []);
  useEffect(() => { version.current++; setResult(null); }, [scope]);
  useEffect(() => { if (!editingPostal.current) setPostcode(settings.postalCode ?? ''); }, [settings.postalCode]);
  const rows = result?.scope === scope ? result.rows : [];
  const summaries = rows.map(row => row.data && deliveredFloorKit(row.data, settings)).filter(Boolean);
  const earliest = summaries.length ? Math.min(...summaries.map(summary => summary!.expiresAt)) : null;
  useEffect(() => {
    if (!earliest) return;
    const timer = setTimeout(() => tick(value => value + 1), Math.max(1, earliest - Date.now() + 10));
    return () => clearTimeout(timer);
  }, [earliest]);
  if (!candidates.length || settings.mode !== 'shipping') return null;

  const check = async () => {
    if (!ready || busy.current || !/^\d{2}-\d{3}$/.test(settings.postalCode ?? '')) return;
    const request = ++version.current, requestedScope = scope;
    busy.current = true; setChecking(true); setResult(null); setOpen(true);
    try {
      // Two independent alternatives, never one combined order of both kits.
      const results = await Promise.all(candidates.map(async candidate => {
        try { return { id: candidate.id, data: await estimateProject(candidate.stages, { delivery: settings }) }; }
        catch { return { id: candidate.id, data: null }; }
      }));
      if (mounted.current && request === version.current && currentScope.current === requestedScope) setResult({ scope: requestedScope, rows: results });
    } finally {
      busy.current = false;
      if (mounted.current) setChecking(false);
    }
  };
  return <View style={{ padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <Txt w="bold" style={{ fontSize: 19 }}>{pl ? 'Porównaj gotowe zestawy płytek' : 'Compare ready tile kits'}</Txt>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 21 }}>{pl
      ? 'Zobacz pełny koszt materiałów do Twoich wymiarów: płytki Ennis, standardowy klej ATLAS PLUS, fuga, krzyżyki i grunt. Uwzględnimy Twoją listę zakupów oraz dostawy. Zastosujemy zestaw dopiero po Twoim wyborze.'
      : 'See the material cost for your measurements: Ennis tiles, standard ATLAS PLUS adhesive, grout, spacers and primer. Your shopping list and deliveries are included. A kit is applied only when you choose it.'}</Txt>
    {!open && <Button variant="outline" label={pl ? 'Pokaż zestawy i ceny z dostawą' : 'Show kits and delivered prices'} onPress={() => setOpen(true)} />}
    {open && <>
      <Txt w="semibold">{pl ? 'Kod pocztowy dostawy' : 'Delivery postcode'}</Txt>
      <TextInput accessibilityLabel={pl ? 'Kod pocztowy dla gotowych zestawów' : 'Postcode for ready kits'} placeholder="00-000" keyboardType="number-pad" maxLength={6} value={postcode} editable={ready} onFocus={() => { editingPostal.current = true; }} onBlur={() => { editingPostal.current = false; }} onChangeText={value => {
        const digits = value.replace(/\D/g, '').slice(0, 5), formatted = digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
        setPostcode(formatted);
        if (digits.length === 5) onSettings({ ...settings, mode: 'shipping', method: 'automatic', postalCode: formatted });
        else if (settings.postalCode) onSettings({ ...settings, postalCode: undefined });
      }} style={{ minHeight: 48, padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, color: Colors.text, backgroundColor: Colors.background }} />
      <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pl ? 'Przed porównaniem możesz też zmienić poniżej sposób dostawy i zgodę na osobne zamówienia.' : 'You can also change delivery mode and separate-order preference below before comparing.'}</Txt>
      <Button label={checking ? (pl ? 'Sprawdzamy pełne koszyki…' : 'Checking complete baskets…') : (pl ? 'Porównaj dwa zestawy dla mojego kodu' : 'Compare two kits for my postcode')} disabled={!ready || checking || !/^\d{2}-\d{3}$/.test(settings.postalCode ?? '')} onPress={() => void check()} />
      {checking && <ActivityIndicator color={Colors.primary} accessibilityLabel={pl ? 'Sprawdzamy ceny i dostawy zestawów' : 'Checking kit prices and deliveries'} />}
      {!checking && rows.length > 0 && <Txt style={{ fontSize: 13, lineHeight: 19, color: Colors.textSecondary }}>{pl ? 'Ceny obejmują pozostałe materiały i potwierdzone dostawy. Porównujemy znalezione koszyki; pozostałe sklepy mogą wymagać potwierdzenia. Narzędzia i robocizna są osobno.' : 'Prices include remaining materials and confirmed deliveries. We compare found baskets; other stores may need confirmation. Tools and labour are separate.'}</Txt>}
      {candidates.map(candidate => {
        const row = rows.find(row => row.id === candidate.id), summary = row?.data && deliveredFloorKit(row.data, settings);
        const stale = Boolean(row && !summary && row.data?.deliveryComparison?.best);
        return <View key={candidate.id} style={{ gap: 10, padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><ProductImage uri={getProductPhoto(candidate.product)} name={candidate.product.productLabel} size={72} /><View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{candidate.product.productLabel}</Txt><Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Paczka' : 'Pack'} {candidate.product.packageSize.toLocaleString(pl ? 'pl-PL' : 'en-GB')} m² · ATLAS PLUS 25 kg</Txt></View></View>
          {summary ? <>
            <Txt w="bold" style={{ fontSize: 24, color: Colors.primary }}>{formatGrosze(summary.totalGrosze)}</Txt>
            <Txt>{pl ? 'Materiały' : 'Materials'}: {formatGrosze(summary.materialsGrosze)} · {pl ? 'dostawy' : 'deliveries'}: {formatGrosze(summary.deliveryGrosze)}</Txt>
            <Txt style={{ fontSize: 13, lineHeight: 19 }}>{summary.stores.join(' · ')}. {pl ? `Liczba osobnych zamówień: ${summary.orders}.` : `Separate orders: ${summary.orders}.`}</Txt>
            <Button label={pl ? 'Wybieram ten zestaw' : 'Choose this kit'} onPress={() => {
              if (result?.scope === currentScope.current && row?.data && deliveredFloorKit(row.data, settings)) { setOpen(false); onApply(candidate); }
            }} />
          </> : row ? <Txt accessibilityRole="alert" style={{ color: Colors.textSecondary, lineHeight: 20 }}>{stale
            ? pl ? 'Wycena jest nieaktualna. Porównaj zestawy ponownie przed wyborem.' : 'This quote is no longer current. Compare kits again before choosing.'
            : pl ? 'Nie potwierdzono pełnego kosztu tego zestawu. Sprawdź obmiary, kod lub dobierz produkty poniżej.' : 'The complete cost of this kit could not be confirmed. Check measurements or postcode, or choose products below.'}</Txt>
            : <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Pełną cenę sprawdzimy po wpisaniu kodu i porównaniu zestawów.' : 'We check the complete price after you enter a postcode and compare kits.'}</Txt>}
        </View>;
      })}
      <Button variant="ghost" label={pl ? 'Ukryj gotowe zestawy' : 'Hide ready kits'} onPress={() => setOpen(false)} />
    </>}
  </View>;
}
