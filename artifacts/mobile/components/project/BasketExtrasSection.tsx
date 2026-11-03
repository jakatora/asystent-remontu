import React, { useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { getProductPhoto } from '@/data/products/photos';
import { generateId } from '@/shared/lib/id';
import { extraMaterial, extraPackageFamily, EXTRA_UNITS, MAX_BASKET_EXTRAS, parseExtraQuantity, searchBasketExtraReferences, type BasketExtra } from '@/features/pricing/basketExtras';
import { ProductImage } from './ProductImage';
import {useCatalogAvailability} from '@/features/pricing/useCatalogAvailability';
import {catalogueProductAvailability,catalogueRefreshIdentity,filterCatalogueByAvailability,isCatalogAvailabilityFresh} from '@/features/pricing/catalogAvailability';
import {CatalogRefreshPrices} from './CatalogRefreshPrices';

export function BasketExtrasSection({ items, onChange, ready, error, onRetry }: {
  items: readonly BasketExtra[]; onChange: (items: BasketExtra[]) => void; ready: boolean; error: boolean; onRetry: () => void;
}) {
  const { language } = useLanguage(), pl = language === 'pl';
  const [expanded, setExpanded] = useState(false), [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
  const [custom, setCustom] = useState(false), [name, setName] = useState(''), [unit, setUnit] = useState<typeof EXTRA_UNITS[number]>('szt');
  const [referenceId, setReferenceId] = useState<string | null>(null), [quantity, setQuantity] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [automaticPackages,setAutomaticPackages]=useState(false);
  const [onlyConfirmed,setOnlyConfirmed] = useState(false);
  const availability = useCatalogAvailability(expanded && !custom && ready && !error);
  const hasAvailability = isCatalogAvailabilityFresh(availability.data);
  const confirmedFilter = onlyConfirmed && hasAvailability;
  const ref = MATERIAL_PRICES.find(ref => ref.id === referenceId);
  const packageFamily=ref?extraPackageFamily(ref):undefined;
  const refreshIdentity=ref?catalogueRefreshIdentity(ref):null;
  const productRefresh=refreshIdentity&&availability.productResult?.key===JSON.stringify(refreshIdentity)?availability.productResult:null;
  const productRetrySeconds=productRefresh?availability.productRetrySeconds:0;
  const demand = parseExtraQuantity(quantity);
  const validName = name.trim().length > 0 && name.trim().length <= 200 && !/[\u0000-\u001f]/.test(name);
  const searchMatches = searchBasketExtraReferences(search);
  const found = filterCatalogueByAvailability(searchMatches,availability.data,onlyConfirmed);
  const reset = () => { setExpanded(false); setEditingId(null); setReferenceId(null); setQuantity(''); setName(''); setSearch(''); setVisibleCount(8); setAutomaticPackages(false); };
  const edit = (item: BasketExtra) => {
    setEditingId(item.id); setExpanded(true); setQuantity(String(item.quantity)); setCustom(item.kind === 'custom');
    setAutomaticPackages(item.kind==='catalogue'&&Boolean(item.packageFamily));
    if (item.kind === 'catalogue') { setReferenceId(item.referenceId); setSearch(MATERIAL_PRICES.find(ref => ref.id === item.referenceId)!.productLabel); }
    else { setName(item.name); setUnit(item.unit); setReferenceId(null); setSearch(''); }
  };
  const add = () => {
    if (!ready || demand === null || (!editingId && items.length >= MAX_BASKET_EXTRAS)) return;
    if (custom && !validName) return;
    if (!custom && !ref) return;
    const id = editingId ?? generateId('extra');
    const row: BasketExtra = custom ? { id, kind: 'custom', name: name.trim(), unit, quantity: demand }
      : { id, kind: 'catalogue', referenceId: ref!.id, quantity: demand, ...(automaticPackages&&packageFamily?{packageFamily:packageFamily.key}:{}) };
    onChange(editingId ? items.map(item => item.id === editingId ? row : item) : [...items, row]); reset();
  };
  const field = { minHeight: 48, fontSize: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, color: Colors.text };
  const compact = ready && !error && !expanded && items.length === 0;
  return <View style={compact ? undefined : { padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
    {!compact && <>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Feather name="plus-circle" size={20} color={Colors.primary} /><Txt w="bold" style={{ flex: 1, fontSize: 18 }}>{pl ? 'Dodatkowe materiały' : 'Additional materials'}</Txt></View>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Dopisz to, czego nie obejmują obmiary. Ilości połączymy z materiałami z wybranych prac. Brak oferty pozostanie widoczny w wycenie.' : 'Add materials beyond the measurements. We combine their demand with your selected works. Missing offers remain visible in the quote.'}</Txt>
    </>}
    {error && <><Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano dodatkowych materiałów. Pełna wycena jest wstrzymana, żeby nie pominąć zapisanych pozycji.' : 'Additional materials could not be read. The full quote is paused to avoid omitting saved items.'}</Txt><Button variant="outline" label={pl ? 'Odczytaj ponownie' : 'Read again'} onPress={onRetry} /></>}
    {items.map(item => {
      const material = extraMaterial(item).material;
      const reference = item.kind === 'catalogue' ? MATERIAL_PRICES.find(ref => ref.id === item.referenceId) : null;
      return <View key={item.id} style={{ gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {reference && <ProductImage uri={getProductPhoto(reference)} name={material.name} size={48} />}
          <View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{material.name}</Txt><Txt>{item.quantity.toLocaleString(pl ? 'pl-PL' : 'en-GB', { maximumFractionDigits: 6 })} {material.unit}</Txt></View>
        </View>
        <View style={{flexDirection:'row',justifyContent:'flex-end',gap:8}}>
          <Pressable accessibilityRole="button" accessibilityLabel={pl ? `Edytuj dodatkową pozycję ${material.name}` : `Edit additional item ${material.name}`} onPress={() => edit(item)} style={{ minWidth: 86, minHeight: 48, flexDirection:'row',gap:6,alignItems: 'center', justifyContent: 'center' }}><Feather name="edit-2" size={18} color={Colors.primary} /><Txt style={{color:Colors.primary}}>{pl?'Edytuj':'Edit'}</Txt></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={pl ? `Usuń dodatkową pozycję ${material.name}` : `Remove additional item ${material.name}`} onPress={() => { onChange(items.filter(row => row.id !== item.id)); if (editingId === item.id) reset(); }} style={{ minWidth: 86, minHeight: 48, flexDirection:'row',gap:6,alignItems: 'center', justifyContent: 'center' }}><Feather name="trash-2" size={18} color={Colors.danger} /><Txt style={{color:Colors.danger}}>{pl?'Usuń':'Remove'}</Txt></Pressable>
        </View>
      </View>;
    })}
    {ready && !error && !expanded && <Button variant="outline" label={pl ? 'Dodaj produkt do koszyka' : 'Add a product to the basket'} disabled={items.length >= MAX_BASKET_EXTRAS} onPress={() => { setEditingId(null); setCustom(false); setExpanded(true); }} />}
    {items.length >= MAX_BASKET_EXTRAS && <Txt>{pl ? 'Możesz dopisać do 50 dodatkowych pozycji.' : 'You can add up to 50 additional items.'}</Txt>}
    {expanded && ready && !error && <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>{[false, true].map(value => <Pressable key={String(value)} accessibilityRole="radio" aria-checked={custom === value} accessibilityState={{ checked: custom === value }} onPress={() => { setCustom(value); setReferenceId(null); setQuantity(''); setAutomaticPackages(false); }} style={{ flex: 1, minHeight: 48, padding: 10, borderRadius: 10, backgroundColor: custom === value ? Colors.primaryBg : Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' }}><Txt w="semibold">{value ? (pl ? 'Własna pozycja' : 'Custom item') : (pl ? 'Z katalogu' : 'From catalogue')}</Txt></Pressable>)}</View>
      {custom ? <>
        <TextInput accessibilityLabel={pl ? 'Nazwa dodatkowego materiału' : 'Additional material name'} placeholder={pl ? 'Dokładna nazwa produktu' : 'Exact product name'} maxLength={200} value={name} onChangeText={setName} style={field} />
        <Txt>{pl ? 'Jednostka zapotrzebowania' : 'Demand unit'}</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{EXTRA_UNITS.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={value} aria-checked={unit === value} accessibilityState={{ checked: unit === value }} onPress={() => setUnit(value)} style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: unit === value ? Colors.primaryBg : Colors.surfaceAlt }}><Txt>{value}</Txt></Pressable>)}</View>
      </> : <>
        <Txt w="semibold">{pl ? 'Znajdź produkt w katalogu' : 'Find a catalogue product'}</Txt>
        <TextInput accessibilityLabel={pl ? 'Szukaj dodatkowego materiału w katalogu' : 'Search additional catalogue materials'} placeholder={pl ? 'Nazwa, marka lub EAN, np. Soudal' : 'Name, brand or EAN, e.g. Soudal'} autoCapitalize="none" autoCorrect={false} value={search} onChangeText={value => { setSearch(value); setReferenceId(null); setQuantity(''); setVisibleCount(8); setAutomaticPackages(false); }} style={field} />
        <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Oznaczenia dotyczą potwierdzonych cen wybranego opakowania. Dostawę, zapas dla potrzebnej ilości i cenę całego zestawu sprawdzimy po dodaniu.' : 'Labels refer to confirmed prices for the exact pack. Delivery, stock for your required quantity and the whole basket price are checked after adding.'}</Txt>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{[false,true].map(value => <Pressable key={String(value)} accessibilityRole="radio" accessibilityState={{checked:confirmedFilter===value,disabled:value&&!hasAvailability}} aria-checked={confirmedFilter===value} disabled={value&&!hasAvailability} onPress={()=>{setOnlyConfirmed(value);setVisibleCount(8);}} style={{minHeight:48,padding:12,borderRadius:10,justifyContent:'center',backgroundColor:confirmedFilter===value?Colors.primaryBg:Colors.surfaceAlt,opacity:value&&!hasAvailability?0.55:1}}><Txt w="semibold">{value?(pl?'Z potwierdzoną ceną':'With confirmed price'):(pl?'Wszystkie produkty':'All products')}</Txt></Pressable>)}</View>
        {availability.loading && <Txt accessibilityLiveRegion="polite" style={{color:Colors.textSecondary}}>{pl?'Sprawdzamy informacje o ofertach…':'Checking offer information…'}</Txt>}
        {availability.error && <Txt accessibilityLiveRegion="polite" style={{color:Colors.textSecondary}}>{pl?'Nie udało się sprawdzić ofert. Pokazujemy cały katalog; brak oznaczenia nie oznacza niedostępności produktu.':'Offer information could not be checked. Showing the full catalogue; an unknown status does not mean the product is unavailable.'}</Txt>}
        {availability.expired && <Txt accessibilityLiveRegion="polite" style={{color:Colors.textSecondary}}>{pl?'Informacja o ofertach wygasła. Pokazujemy cały katalog. Odśwież informacje, aby ponownie użyć filtra.':'Offer information expired. Showing the full catalogue. Refresh to use the filter again.'}</Txt>}
        {(availability.error||availability.expired) && <Button variant="outline" label={availability.retrySeconds>0?(pl?`Sprawdź oferty za ${availability.retrySeconds} s`:`Check offers in ${availability.retrySeconds} s`):(pl?'Sprawdź oferty ponownie':'Check offers again')} disabled={availability.loading||availability.retrySeconds>0} onPress={availability.retry}/>}
        {!search.trim() && <Txt style={{ color: Colors.textSecondary }}>{pl ? 'Wpisz nazwę, markę lub kod EAN. Słowa możesz podać w dowolnej kolejności.' : 'Enter a name, brand or EAN. Words can be in any order.'}</Txt>}
        {search.trim() && found.length > 0 && <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{confirmedFilter?(pl?`Z potwierdzoną ceną: ${found.length} z ${searchMatches.length}`:`With confirmed price: ${found.length} of ${searchMatches.length}`):(pl ? `Wyniki: ${found.length}` : `Results: ${found.length}`)}</Txt>}
        {found.slice(0, visibleCount).map(product => {
          const status=catalogueProductAvailability(product,availability.data);
          const checkedAt = status?.lastCheckedAt && new Date(status.lastCheckedAt).toLocaleString(
            pl ? 'pl-PL' : 'en-GB',
            { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' },
          );
          return <Pressable key={product.id} accessibilityRole="radio" accessibilityLabel={product.productLabel} aria-checked={referenceId === product.id} accessibilityState={{ checked: referenceId === product.id }} onPress={() => { setReferenceId(product.id); setQuantity(String(product.packageSize)); setAutomaticPackages(false); }} style={{ minHeight: 72, padding: 10, flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 10, borderColor: referenceId === product.id ? Colors.primary : Colors.border, backgroundColor: referenceId === product.id ? Colors.primaryBg : Colors.surface }}><ProductImage uri={getProductPhoto(product)} name={product.productLabel} size={44} /><View style={{ flex: 1,gap:4 }}><Txt w="medium">{product.productLabel}</Txt><Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{product.packageSize} {product.packageUnit} / {pl ? 'opakowanie' : 'pack'}</Txt><Txt style={{fontSize:13,color:Colors.textSecondary}}>{status===null?(pl?'Oferta niesprawdzona':'Offer not checked'):status.lastCheckedAt?(pl?`Zapisane oferty · sklepy: ${status.stores.length} · ostatni odczyt: ${checkedAt}`:`Saved offers · shops: ${status.stores.length} · latest reading: ${checkedAt}`):(pl?'Brak potwierdzonej oferty':'No confirmed offer')}</Txt></View></Pressable>;
        })}
        {search.trim() && !found.length && <Txt>{confirmedFilter&&searchMatches.length?(pl?'Brak potwierdzonej ceny dla tych wyników. Wybierz „Wszystkie produkty”, aby je zobaczyć.':'No confirmed price for these matches. Choose All products to see them.'):(pl ? 'Nie znaleziono. Sprawdź nazwę lub wybierz „Własna pozycja”, aby wpisać materiał.' : 'No match. Check the name or choose Custom item to enter a material.')}</Txt>}
        {found.length > visibleCount && <Button variant="outline" label={pl ? `Pokaż kolejne (${Math.min(8, found.length - visibleCount)})` : `Show more (${Math.min(8, found.length - visibleCount)})`} onPress={() => setVisibleCount(count => count + 8)} />}
      </>}
      {(custom || ref) && <>
        {ref && <Txt w="semibold">{pl ? 'Wybrano' : 'Selected'}: {ref.productLabel}</Txt>}
        {ref&&packageFamily&&<View style={{gap:8}}>
          <Txt w="semibold">{pl?'Dobór opakowań':'Package sizes'}</Txt>
          {[false,true].map(value=><Pressable key={String(value)} accessibilityRole="radio" aria-checked={automaticPackages===value} accessibilityState={{checked:automaticPackages===value}} onPress={()=>setAutomaticPackages(value)} {...(Platform.OS==='web'?{onKeyDown:(event:React.KeyboardEvent)=>{if(event.key===' '||event.key==='Spacebar'){event.preventDefault();setAutomaticPackages(value);}}}:{})} style={{minHeight:48,padding:12,borderWidth:1,borderColor:automaticPackages===value?Colors.primary:Colors.border,borderRadius:10,justifyContent:'center',backgroundColor:automaticPackages===value?Colors.primaryBg:Colors.surface}}>
            <Txt w="semibold">{value?(pl?'Dobierz dostępne opakowania':'Compare available package sizes'):(pl?`Wybrane opakowanie: ${ref.packageSize.toLocaleString('pl-PL')} ${ref.packageUnit}`:`Selected pack: ${ref.packageSize} ${ref.packageUnit}`)}</Txt>
          </Pressable>)}
          <Txt style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{automaticPackages?(pl?'Zachowamy potrzebną ilość. Porównamy pełne opakowania tego samego modelu wraz z dostawą. Rozmiary bez potwierdzonej oferty pominiemy.':'Your required quantity stays unchanged. We compare full packs of the same model including delivery, using confirmed offers only.'):(pl?'Porównamy sklepy dla wybranego rozmiaru opakowania.':'We compare shops for the selected package size.')}</Txt>
        </View>}
        {ref&&refreshIdentity&&<>
          {automaticPackages&&packageFamily&&<Txt style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{pl?'Odświeżenie poniżej dotyczy wybranego opakowania. Pozostałe rozmiary sprawdzimy w porównaniu koszyka.':'The refresh below is for the selected pack. Other sizes are checked in the basket comparison.'}</Txt>}
          {!productRefresh?.unreviewed&&<Button variant="outline" label={availability.refreshing?(pl?'Sprawdzamy aktualną cenę…':'Checking the current price…'):productRetrySeconds>0?(pl?`Sprawdź cenę za ${productRetrySeconds} s`:`Check price in ${productRetrySeconds} s`):(pl?'Sprawdź aktualną cenę produktu':'Check current product price')} disabled={availability.refreshing||productRetrySeconds>0} onPress={()=>{void availability.refreshProduct(refreshIdentity);}}/>}
          {productRefresh&&<Txt accessibilityLiveRegion="polite" style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{productRefresh.unreviewed
            ? (pl ? 'Dla tego modelu nie ma jeszcze źródła aktualnej ceny w aplikacji.' : 'The app does not yet have a current price source for this model.')
            : productRefresh.result?.refresh.confirmedOfferIds.length?(pl?`Potwierdzone oferty: ${productRefresh.result.refresh.confirmedOfferIds.length}. ${productRefresh.result.refresh.status==='recent'?'Ceny sprawdzono przed chwilą. ':''}Dostawę i zapas dla potrzebnej ilości sprawdzimy po dodaniu do koszyka.`:`Confirmed offers: ${productRefresh.result.refresh.confirmedOfferIds.length}. Delivery and stock for your required quantity are checked after adding.`):(pl?'Nie udało się potwierdzić nowej ceny. Możesz dodać produkt i sprawdzić go ponownie w koszyku.':'A new price could not be confirmed. You can add the product and check again in the basket.')}</Txt>}
          {productRefresh?.result?.offers&&<CatalogRefreshPrices offers={productRefresh.result.offers}/>}
        </>}
        {ref?.materialType==='wire' && <Txt style={{color:Colors.textSecondary,fontSize:13,lineHeight:19}}>{pl?'Przekrój, rodzaj i długość przewodu dobierz zgodnie z projektem instalacji. Porównujemy ceny wybranego wariantu.':'Choose the cable type, cross-section and length according to the installation design. We compare prices for the selected variant.'}</Txt>}
        {ref?.id==='mat-pex-pipe-tycner-16x2'&&<Txt style={{color:Colors.textSecondary,fontSize:13,lineHeight:19}}>{pl?'Porównujemy zakup rury w pełnych metrach. Podane zapotrzebowanie pozostaje bez zmian; pokażemy ilość do kupienia i nadwyżkę.':'We compare whole-metre purchases. Your required length stays unchanged; the purchase quantity and surplus are shown.'}</Txt>}
        <Txt>{pl ? 'Potrzebna ilość' : 'Required quantity'} ({custom ? unit : ref?.packageUnit})</Txt>
        <TextInput accessibilityLabel={pl ? 'Potrzebna ilość dodatkowego materiału' : 'Additional material quantity'} keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} maxLength={13} style={field} />
        {quantity && demand === null ? <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Wpisz ilość większą od zera, do 100 000 (maksymalnie 6 cyfr po przecinku).' : 'Enter a quantity above zero, up to 100,000 (at most 6 decimal places).'}</Txt> : null}
        <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Wpisz zapotrzebowanie w podanej jednostce. Liczbę pełnych opakowań dobierzemy po zsumowaniu całego remontu.' : 'Enter demand in the displayed unit. Full packs are calculated after combining the renovation.'}</Txt>
      </>}
      <Button label={editingId ? (pl ? 'Zapisz dodatkową pozycję' : 'Save additional item') : (pl ? 'Dodaj do porównania' : 'Add to comparison')} disabled={demand === null || (!custom && !ref) || (custom && !validName)} onPress={add} />
      <Button variant="ghost" label={pl ? 'Anuluj' : 'Cancel'} onPress={reset} />
    </View>}
  </View>;
}
