import React, { useEffect, useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import { rankStoreChoices, storeMapSearchUrl, supportsStoreMapSearch, storeLocatorUrl, type StoreChoices } from '@/features/pricing/storeChoice';

export function StoreChoiceSection({ choices, selectedStore, postalCode, onSelect }: {
  choices: StoreChoices; selectedStore: string | null; postalCode?: string; onSelect: (store: string | null) => void;
}) {
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => language === 'pl' ? pl : en;
  const [expanded, setExpanded] = useState(false), [search, setSearch] = useState(''), [showAll, setShowAll] = useState(false);
  const [location, setLocation] = useState(postalCode ?? ''), [mapFailed, setMapFailed] = useState(false);
  useEffect(() => { setLocation(postalCode ?? ''); }, [postalCode]);
  const rows = rankStoreChoices(choices, search), allRows = rankStoreChoices(choices);
  const selected = allRows.find(row => row.store === selectedStore);
  const mapUrl = selectedStore ? storeMapSearchUrl(selectedStore, location) : null;
  const locatorUrl = selectedStore ? storeLocatorUrl(selectedStore) : null;
  return <View style={{ padding: 16, gap: 14, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Feather name="shopping-bag" size={20} color={Colors.primary} /><Txt w="bold" style={{ fontSize: 18, flex: 1 }}>{tr('Wybierz, gdzie kupisz', 'Choose where to buy')}</Txt></View>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 21 }}>{tr('Porównaj zestaw w jednym sklepie i wyszukaj placówkę lub punkt odbioru w swojej okolicy.', 'Compare your basket in one store and find a branch or collection point nearby.')}</Txt>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Pressable accessibilityRole="radio" accessibilityState={{ checked: !selectedStore }} onPress={() => { onSelect(null); setExpanded(false); }} style={({ pressed }) => ({ flex: 1, minHeight: 48, padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: !selectedStore ? Colors.primaryBg : Colors.surfaceAlt, opacity: pressed ? 0.7 : 1 })}><Txt w="semibold" style={{ textAlign: 'center' }}>{tr('Najtańszy zestaw', 'Lowest basket')}</Txt></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={({ pressed }) => ({ flex: 1, minHeight: 48, padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: selectedStore ? Colors.primaryBg : Colors.surfaceAlt, opacity: pressed ? 0.7 : 1 })}><Txt w="semibold" style={{ textAlign: 'center' }}>{selectedStore ? tr('Zmień sklep', 'Change store') : tr('Porównaj sklepy', 'Compare stores')}</Txt></Pressable>
    </View>
    {selectedStore && <View style={{ padding: 12, gap: 5, borderRadius: 12, backgroundColor: Colors.primaryBg }}>
      <Txt w="bold" style={{ fontSize: 17 }}>{tr('Wybrany sklep', 'Selected store')}: {selectedStore}</Txt>
      {selected?.coveredCount ? <><Txt w="semibold">{formatGrosze(selected.totalGrosze)} · {tr('materiały bez dostawy', 'materials excluding delivery')}</Txt><Txt style={{ lineHeight: 20 }}>{tr(`Oferty dla ${selected.coveredCount} z ${choices.comparison.productCount} rozpoznanych produktów.`, `Offers for ${selected.coveredCount} of ${choices.comparison.productCount} identified products.`)}</Txt></> : <Txt>{tr('Brak potwierdzonych ofert tego zestawu w sklepie.', 'No confirmed offers for this basket in this store.')}</Txt>}
      {Boolean(selected?.coveredCount) && Boolean(selected?.missingCount || choices.unresolvedCount) && <Txt style={{ lineHeight: 20 }}>{tr('To koszt dostępnej części materiałów. Pełną sumę pokażemy po potwierdzeniu brakujących pozycji.', 'This covers only the available materials. A full total requires the missing items to be confirmed.')}</Txt>}
    </View>}
    {expanded && <View style={{ gap: 10 }}>
      <TextInput accessibilityLabel={tr('Szukaj sklepu', 'Search stores')} placeholder={tr('Nazwa sklepu, np. Castorama', 'Store name, e.g. Castorama')} value={search} onChangeText={value => { setSearch(value); setShowAll(false); }} style={{ minHeight: 48, fontSize: 16, borderColor: Colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, color: Colors.text }} />
      <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{tr('Ceny materiałów z ofert internetowych, bez dostawy.', 'Material prices from online offers, excluding delivery.')}</Txt>
      {choices.unresolvedCount > 0 && <Txt accessibilityRole="alert" style={{ lineHeight: 20 }}>{tr(`Dodatkowo ${choices.unresolvedCount} pozycji nie ma jeszcze ceny w katalogu.`, `${choices.unresolvedCount} additional items do not yet have a catalogue price.`)}</Txt>}
      {(showAll || search ? rows : rows.slice(0, 6)).map(row => {
        const complete = row.coveredCount > 0 && row.missingCount === 0 && choices.unresolvedCount === 0;
        return <Pressable key={row.store} accessibilityRole="radio" accessibilityLabel={tr(`Wybierz sklep ${row.store}`, `Select store ${row.store}`)} accessibilityState={{ checked: selectedStore === row.store }} onPress={() => { onSelect(row.store); setExpanded(false); }} style={({ pressed }) => ({ minHeight: 80, padding: 12, gap: 5, borderWidth: 1, borderColor: selectedStore === row.store ? Colors.primary : Colors.border, borderRadius: 12, backgroundColor: selectedStore === row.store ? Colors.primaryBg : Colors.surface, opacity: pressed ? 0.7 : 1 })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><Txt w="bold" style={{ fontSize: 16 }}>{row.store}</Txt><Txt w="semibold">{row.coveredCount > 0 ? formatGrosze(row.totalGrosze) : '—'}</Txt></View>
          <Txt style={{ color: Colors.textSecondary, lineHeight: 19 }}>{complete ? tr('Cały zestaw materiałów', 'All basket materials') : row.coveredCount > 0 ? tr(`Część zestawu: ${row.coveredCount} z ${choices.comparison.productCount} rozpoznanych produktów`, `Partial basket: ${row.coveredCount} of ${choices.comparison.productCount} identified products`) : tr('Brak cen dla wybranych produktów', 'No prices for the selected products')}</Txt>
        </Pressable>;
      })}
      {!rows.length && <Txt>{tr('Nie znaleziono sklepu o tej nazwie.', 'No store matches that name.')}</Txt>}
      {!showAll && !search && rows.length > 6 && <Button variant="outline" label={tr(`Pokaż pozostałe sklepy (${rows.length - 6})`, `Show other stores (${rows.length - 6})`)} onPress={() => setShowAll(true)} />}
    </View>}
    {selectedStore && supportsStoreMapSearch(selectedStore) && <View style={{ gap: 9, paddingTop: 4 }}>
      <Txt w="semibold">{selectedStore === 'Folnet' ? tr('Magazyn odbiorów w Batorowie', 'Collection warehouse in Batorowo') : tr('Zakupy w Twojej okolicy', 'Shopping near you')}</Txt>
      {selectedStore !== 'Folnet' && <TextInput accessibilityLabel={tr('Kod pocztowy lub miasto dla wyszukania sklepu', 'Postcode or town to find a store')} placeholder={tr('Kod pocztowy lub miasto', 'Postcode or town')} value={location} maxLength={80} onChangeText={value => { setLocation(value); setMapFailed(false); }} style={{ minHeight: 48, fontSize: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, color: Colors.text }} />}
      <Button variant="outline" label={selectedStore === 'Folnet' ? tr('Pokaż magazyn odbiorów w Mapach', 'Show collection warehouse in Maps') : tr('Wyszukaj sklep lub punkt odbioru w Mapach', 'Find a store or collection point in Maps')} disabled={!mapUrl} onPress={() => { if (mapUrl) void Linking.openURL(mapUrl).catch(() => setMapFailed(true)); }} />
      {locatorUrl && <Button variant="outline" label={tr(`Oficjalna lista sklepów ${selectedStore}`, `Official ${selectedStore} store directory`)} onPress={() => void Linking.openURL(locatorUrl).catch(() => setMapFailed(true))} />}
      {mapFailed && <Txt accessibilityRole="alert">{tr('Nie udało się otworzyć mapy. Spróbuj ponownie.', 'The map could not be opened. Try again.')}</Txt>}
      <Txt style={{ color: Colors.textSecondary, fontSize: 13, lineHeight: 19 }}>{selectedStore === 'Folnet' ? tr('Odbiór zamówienia online po potwierdzeniu gotowości: ul. Stefana Batorego 97, Batorowo. Dojazd nie jest wliczony.', 'Collect an online order after readiness confirmation: Stefana Batorego 97, Batorowo. Travel is excluded.') : tr('Mapa wyszuka placówki. Cenę, zapas i możliwość odbioru potwierdź w wybranym oddziale; mogą różnić się od oferty internetowej. Dojazd nie jest wliczony.', 'Maps searches for branches. Confirm prices, stock and collection with the branch; they may differ from online offers. Travel is excluded.')}</Txt>
    </View>}
    {selectedStore && !supportsStoreMapSearch(selectedStore) && <Txt style={{ color: Colors.textSecondary, fontSize: 13, lineHeight: 19 }}>{tr('Adres i możliwość odbioru sprawdź bezpośrednio w sklepie, korzystając z linku przy produkcie. Nie mamy potwierdzonej listy jego placówek.', 'Check the collection address and availability directly with the retailer using the product link. We do not have a confirmed branch directory.')}</Txt>}
  </View>;
}
