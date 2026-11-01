import React, { useId, useState } from 'react';
import { Linking, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { PRODUCT_PHOTOS, getProductPhoto } from '@/data/products/photos';
import { LAMINATE_PRODUCTS, type LaminateChoice } from '@/features/pricing/laminateChoice';
import { ProductImage } from './ProductImage';
import { RadioCard } from '@/components/ui/RadioCard';
import { useCatalogAvailability } from '@/features/pricing/useCatalogAvailability';
import { catalogueProductAvailability } from '@/features/pricing/catalogAvailability';

interface Props {
  references: typeof LAMINATE_PRODUCTS;
  choices: readonly LaminateChoice[];
  ready: boolean;
  readFailed: boolean;
  saveFailed: boolean;
  commonBasket: boolean;
  onChange: (choices: readonly LaminateChoice[]) => void;
  onRetry: () => void;
}

export function LaminateChoiceSection({ references, choices, ready, readFailed, saveFailed, commonBasket, onChange, onRetry }: Props) {
  const { language } = useLanguage();
  const pl = language === 'pl';
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const group = useId();
  const availability = useCatalogAvailability(references.length > 0 && ready && !readFailed);
  const offerStatus = (product: typeof LAMINATE_PRODUCTS[number]) => catalogueProductAvailability(product, availability.data);
  const offerLabel = (product: typeof LAMINATE_PRODUCTS[number]) => {
    const status = offerStatus(product);
    return status === null ? (pl ? 'Oferta niesprawdzona' : 'Offer not checked')
      : status.confirmed ? (pl ? `Potwierdzona oferta · ${status.stores.join(', ')}` : `Confirmed offer · ${status.stores.join(', ')}`)
      : (pl ? 'Brak potwierdzonej oferty w katalogu' : 'No confirmed catalogue offer');
  };
  const pack = (product: typeof LAMINATE_PRODUCTS[number]) => `${product.packageSize.toLocaleString(pl ? 'pl-PL' : 'en-GB', { maximumFractionDigits: 6 })} ${product.packageUnit === 'm2' ? 'm²' : product.packageUnit}`;
  if (!references.length) return null;
  return <View style={{ padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <Feather name="layers" size={20} color={Colors.primary} />
      <Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{pl ? 'Wybierz panele do porównania' : 'Choose the laminate flooring to compare'}</Txt>
    </View>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl
      ? 'Brakuje oferty wybranego modelu lub chcesz sprawdzić inny? Zachowamy potrzebne m², dobierzemy pełne paczki i ponownie sprawdzimy cały zestaw z dostawą.'
      : 'Missing an offer or considering another model? We keep the required m², recalculate full packs and check the complete basket including delivery.'}</Txt>
    {commonBasket && <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl
      ? 'Zmiana tutaj dotyczy wspólnego koszyka. Wybory zapisane w projektach pozostają zachowane.'
      : 'Changes here apply to the common basket. Choices saved in projects are retained.'}</Txt>}
    {readFailed && <>
      <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano wybranego modelu paneli. Wycena jest wstrzymana, aby nie policzyć innego produktu.' : 'The selected flooring could not be read. Pricing is paused to avoid quoting the wrong product.'}</Txt>
      <Button variant="outline" label={pl ? 'Odczytaj wybór paneli ponownie' : 'Read the flooring choice again'} onPress={onRetry} />
    </>}
    {ready && !readFailed && <>
      <Txt style={{ fontSize: 13, lineHeight: 19, color: Colors.textSecondary }}>{pl
        ? 'Oznaczenia dotyczą ofert materiałów. Koszt dostawy i pełną sumę sprawdzimy po zastosowaniu modelu dla Twojego kodu pocztowego.'
        : 'Labels describe material offers. Delivery and the full total are checked after applying the model for your postcode.'}</Txt>
      {availability.loading && <Txt accessibilityLiveRegion="polite" style={{ color: Colors.textSecondary }}>{pl ? 'Sprawdzamy oferty modeli paneli…' : 'Checking flooring model offers…'}</Txt>}
      {availability.error && <Txt accessibilityLiveRegion="polite" style={{ color: Colors.textSecondary }}>{pl
        ? 'Nie udało się sprawdzić ofert modeli. Zachowano wybór i pełną listę; niesprawdzona oferta nie oznacza niedostępności produktu.'
        : 'Model offers could not be checked. Your selection and all models are retained; an unchecked offer does not mean an unavailable product.'}</Txt>}
      {availability.expired && <Txt accessibilityLiveRegion="polite" style={{ color: Colors.textSecondary }}>{pl ? 'Informacja o ofertach modeli wygasła. Sprawdź ją ponownie.' : 'Model offer information expired. Check it again.'}</Txt>}
      {(availability.error || availability.expired) && <Button variant="outline"
        label={availability.retrySeconds > 0 ? (pl ? `Sprawdź oferty paneli za ${availability.retrySeconds} s` : `Check flooring offers in ${availability.retrySeconds} s`) : (pl ? 'Sprawdź oferty paneli ponownie' : 'Check flooring offers again')}
        disabled={availability.loading || availability.retrySeconds > 0} onPress={availability.retry} />}
    </>}
    {ready && references.map(reference => {
      const chosenId = choices.find(choice => choice.from === reference.id)?.to ?? reference.id;
      const chosen = LAMINATE_PRODUCTS.find(ref => ref.id === chosenId)!;
      const changed = chosenId !== reference.id;
      const expanded = editing === reference.id;
      return <View key={reference.id} style={{ gap: 10, paddingVertical: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <ProductImage uri={getProductPhoto(chosen)} name={chosen.productLabel} size={56} />
          <View style={{ flex: 1, gap: 4 }}>
            <Txt w="semibold">{chosen.productLabel}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pack(chosen)} / {pl ? 'paczka' : 'pack'}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{offerLabel(chosen)}</Txt>
          </View>
        </View>
        {offerStatus(chosen)?.confirmed === false && <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl
          ? `Inne modele z potwierdzoną ofertą: ${LAMINATE_PRODUCTS.filter(product => product.id !== chosenId && offerStatus(product)?.confirmed).length}. Zmień model, aby sprawdzić inny produkt i cały zestaw.`
          : `Other models with a confirmed offer: ${LAMINATE_PRODUCTS.filter(product => product.id !== chosenId && offerStatus(product)?.confirmed).length}. Change the model to check another product and the whole basket.`}</Txt>}
        {changed && <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? `Twój wybór zamiast: ${reference.productLabel}` : `Your choice instead of: ${reference.productLabel}`}</Txt>}
        {!expanded ? <Button variant="outline" label={pl ? 'Zmień model paneli' : 'Change the flooring model'} onPress={() => { setEditing(reference.id); setDraft(chosenId); }} /> : <>
          <Txt style={{ lineHeight: 20 }}>{pl
            ? 'To różne produkty. Sprawdź dekor, zamek, grubość i warunki montażu. Nie łącz różnych modeli w jednej podłodze. Cenę i dostępność sprawdzimy po zastosowaniu wyboru.'
            : 'These are different products. Check the decor, lock, thickness and installation requirements. Do not mix models in one floor. We check price and availability after applying your choice.'}</Txt>
          {LAMINATE_PRODUCTS.map(product => <View key={product.id} style={{ gap: 4 }}>
            <RadioCard label={pl ? `Porównaj panele ${product.productLabel}` : `Compare flooring ${product.productLabel}`}
              group={`${group}-${reference.id}`} value={product.id} checked={draft === product.id} disabled={false} onSelect={() => setDraft(product.id)}
              style={{ minHeight: 80, padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: draft === product.id ? Colors.primary : Colors.border, borderRadius: 12, backgroundColor: draft === product.id ? Colors.primaryBg : Colors.surface }}>
              <ProductImage uri={getProductPhoto(product)} name={product.productLabel} size={48} />
              <View style={{ flex: 1, gap: 4 }}>
                <Txt w="medium">{product.productLabel}</Txt>
                <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{pack(product)} / {pl ? 'paczka' : 'pack'} · EAN {PRODUCT_PHOTOS.find(photo => photo.ids.includes(product.id))?.ean}</Txt>
                <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{offerLabel(product)}</Txt>
                {product.id === reference.id && <Txt style={{ fontSize: 13 }}>{pl ? 'Produkt przed zmianą' : 'Product before this change'}</Txt>}
              </View>
              <Feather name={draft === product.id ? 'check-circle' : 'circle'} size={22} color={draft === product.id ? Colors.primary : Colors.textSecondary} />
            </RadioCard>
            {product.sourceUrl && <Button variant="ghost" label={pl ? `Sprawdź parametry — ${product.brand ?? product.storeName}` : `Check specifications — ${product.brand ?? product.storeName}`} onPress={() => { void Linking.openURL(product.sourceUrl!); }} />}
          </View>)}
          <Button label={pl ? 'Zastosuj model i przelicz zestaw' : 'Apply model and recalculate basket'} disabled={!draft} onPress={() => {
            if (!draft) return;
            const next = choices.filter(choice => choice.from !== reference.id);
            onChange(draft === reference.id ? next : [...next, { from: reference.id, to: draft }]);
            setEditing(null); setDraft(null);
          }} />
          <Button variant="ghost" label={pl ? 'Anuluj zmianę modelu' : 'Cancel model change'} onPress={() => { setEditing(null); setDraft(null); }} />
        </>}
        {changed && !expanded && <Button variant="ghost" label={pl ? 'Przywróć produkt przed zmianą' : 'Restore the previous product'} onPress={() => onChange(choices.filter(choice => choice.from !== reference.id))} />}
      </View>;
    })}
    {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru paneli. Bieżąca wycena go uwzględnia; po ponownym otwarciu sprawdź model.' : 'The flooring choice was not saved. It is included in this quote; check the model when reopening.'}</Txt>}
  </View>;
}
