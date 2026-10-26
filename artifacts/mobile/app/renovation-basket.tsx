import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { CostEstimateTab } from '@/components/project/CostEstimateTab';
import { QualityTierSelector } from '@/components/project/QualityTierSelector';
import { BasketExtrasSection } from '@/components/project/BasketExtrasSection';
import { BASKET_EXTRAS_KEY, parseBasketExtras, withBasketExtras, type BasketExtra } from '@/features/pricing/basketExtras';
import { shoppingRepo } from '@/db/repositories/shopping.repo';
import type { ShoppingItem } from '@/types/domain';
import { buildRenovationBasket, MAX_BASKET_PROJECTS, parseBasketSelection, RENOVATION_BASKET_KEY } from '@/features/pricing/renovationBasket';
import { DOOR_SELECTION_PREFIX, parseDoorSelection, type DoorSelection } from '@/features/pricing/doorSelection';
import { LAMINATE_CHOICE_PREFIX, parseLaminateChoices, type LaminateChoice } from '@/features/pricing/laminateChoice';
import { FOIL_CHOICE_PREFIX, parseFoilChoices, type FoilChoice } from '@/features/pricing/foilChoice';
import { WASHBASIN_CHOICE_PREFIX, parseWashbasinChoices, type WashbasinChoice } from '@/features/pricing/washbasinChoice';
import { TILE_CHOICE_PREFIX, parseTileChoices, type TileChoice } from '@/features/pricing/tileChoice';

export default function RenovationBasketScreen() {
  const { projects, selectedQualityTier, setSelectedQualityTier, selectedRegion, refreshProjects } = useApp();
  const { language } = useLanguage();
  const pl = language === 'pl';
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [items, setItems] = useState<Record<string, ShoppingItem[]>>({});
  const [doors, setDoors] = useState<Record<string, DoorSelection | null>>({});
  const [laminates, setLaminates] = useState<Record<string, LaminateChoice[]>>({});
  const [foils, setFoils] = useState<Record<string, FoilChoice[]>>({});
  const [washbasins, setWashbasins] = useState<Record<string, WashbasinChoice[]>>({});
  const [tiles, setTiles] = useState<Record<string, TileChoice[]>>({});
  const [itemsReady, setItemsReady] = useState(false);
  const [itemsFailed, setItemsFailed] = useState(false);
  const writes = useRef(Promise.resolve());
  const extrasWrites = useRef(Promise.resolve());
  const [extras, setExtras] = useState<BasketExtra[]>([]), [extrasReady, setExtrasReady] = useState(false);
  const [extrasReadFailed, setExtrasReadFailed] = useState(false), [extrasSaveFailed, setExtrasSaveFailed] = useState(false), [extrasRetry, setExtrasRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setExtrasReady(false); setExtrasReadFailed(false);
    void extrasWrites.current.then(() => AsyncStorage.getItem(BASKET_EXTRAS_KEY)).then(raw => {
      const saved = parseBasketExtras(raw);
      if (active) { setExtras(saved); setExtrasReady(true); }
    }).catch(() => { if (active) setExtrasReadFailed(true); });
    return () => { active = false; };
  }, [extrasRetry]);
  const updateExtras = (next: BasketExtra[]) => {
    const serialized = JSON.stringify({ version: 1, items: next });
    const validated = parseBasketExtras(serialized);
    setExtras(validated); setExtrasSaveFailed(false);
    extrasWrites.current = extrasWrites.current.catch(() => {}).then(() => AsyncStorage.setItem(BASKET_EXTRAS_KEY, serialized)).catch(() => setExtrasSaveFailed(true));
  };
  useFocusEffect(React.useCallback(() => { void refreshProjects(); }, [refreshProjects]));
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(RENOVATION_BASKET_KEY).then(raw => { if (active) setSelected(parseBasketSelection(raw)); })
      .catch(() => { if (active) setSaveFailed(true); }).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);
  const selectedProjects = useMemo(() => projects.filter(project => selected.includes(project.id)), [projects, selected]);
  // Refresh after returning from a project's Shopping tab as well as selection changes.
  useFocusEffect(React.useCallback(() => {
    let active = true;
    setItemsReady(false); setItemsFailed(false);
    void Promise.all(selectedProjects.map(async project => {
      const [shopping, rawDoor, rawLaminate, rawFoil, rawWashbasin, rawTile] = await Promise.all([shoppingRepo.findByProject(project.id), project.calculationResult?.jobId === 'interior-doors' ? AsyncStorage.getItem(DOOR_SELECTION_PREFIX + project.id) : Promise.resolve(null), AsyncStorage.getItem(LAMINATE_CHOICE_PREFIX + project.id), AsyncStorage.getItem(FOIL_CHOICE_PREFIX + project.id), AsyncStorage.getItem(WASHBASIN_CHOICE_PREFIX + project.id), AsyncStorage.getItem(TILE_CHOICE_PREFIX + project.id)]);
      return { id: project.id, shopping, door: project.calculationResult ? parseDoorSelection(rawDoor, project.calculationResult) : null, laminate: parseLaminateChoices(rawLaminate), foil: parseFoilChoices(rawFoil), washbasin: parseWashbasinChoices(rawWashbasin), tile: parseTileChoices(rawTile) };
    }))
      .then(entries => { if (active) { setItems(Object.fromEntries(entries.map(entry => [entry.id, entry.shopping]))); setDoors(Object.fromEntries(entries.map(entry => [entry.id, entry.door]))); setLaminates(Object.fromEntries(entries.map(entry => [entry.id, entry.laminate]))); setFoils(Object.fromEntries(entries.map(entry => [entry.id, entry.foil]))); setWashbasins(Object.fromEntries(entries.map(entry => [entry.id, entry.washbasin]))); setTiles(Object.fromEntries(entries.map(entry => [entry.id, entry.tile]))); setItemsReady(true); } })
      .catch(() => { if (active) setItemsFailed(true); });
    return () => { active = false; };
  }, [selectedProjects]));
  const basket = useMemo(() => buildRenovationBasket(projects, selected, selectedQualityTier === 'custom' ? 'standard' : selectedQualityTier, items, doors, laminates, foils, washbasins, tiles), [projects, selected, selectedQualityTier, items, doors, laminates, foils, washbasins, tiles]);
  const stages = useMemo(() => withBasketExtras(basket.stages, extras), [basket.stages, extras]);
  const hasBasket = selectedProjects.length > 0 || extras.length > 0;
  const toggle = (id: string) => {
    const current = selected.filter(key => projects.some(project => project.id === key));
    const next = current.includes(id) ? current.filter(key => key !== id) : [...current, id];
    if (next.length > MAX_BASKET_PROJECTS) return;
    setSelected(next); setItemsReady(false); setSaveFailed(false);
    writes.current = writes.current.catch(() => {}).then(() => AsyncStorage.setItem(RENOVATION_BASKET_KEY, JSON.stringify({ version: 1, projectIds: next })))
      .catch(() => setSaveFailed(true));
  };
  return <>
    <Stack.Screen options={{ headerShown: true, title: pl ? 'Koszyk całego remontu' : 'Whole renovation basket', headerBackTitle: pl ? 'Projekty' : 'Projects', headerStyle: { backgroundColor: Colors.background }, headerShadowVisible: false }} />
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Txt w="bold" style={{ fontSize: 24 }}>{pl ? 'Kup razem do całego remontu' : 'Buy together for your renovation'}</Txt>
        <Txt style={{ color: Colors.textSecondary, lineHeight: 22 }}>{pl ? 'Wybierz prace i pomieszczenia. Zsumujemy potrzebne materiały, dobierzemy opakowania raz i porównamy cały zestaw z dostawami.' : 'Choose works and rooms. We combine material requirements, round to packs once and compare the complete basket including deliveries.'}</Txt>
      </View>
      {!loaded ? <ActivityIndicator color={Colors.primary} /> : <View style={{ gap: 8 }}>
        <Txt w="semibold">{pl ? `Wybrane prace: ${selectedProjects.length}` : `Selected works: ${selectedProjects.length}`}</Txt>
        {!projects.length && <Txt>{pl ? 'Najpierw utwórz projekt z obmiarami.' : 'Create a project with measurements first.'}</Txt>}
        {projects.map(project => {
          const checked = selected.includes(project.id);
          const disabled = !checked && selectedProjects.length >= MAX_BASKET_PROJECTS;
          return <Pressable key={project.id} accessibilityRole="checkbox" accessibilityLabel={project.name} accessibilityState={{ checked, disabled }} disabled={disabled}
            onPress={() => toggle(project.id)} style={({ pressed }) => ({ minHeight: 64, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: checked ? Colors.primary : Colors.border, backgroundColor: checked ? Colors.primaryBg : Colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 })}>
            <Feather name={checked ? 'check-square' : 'square'} size={22} color={checked ? Colors.primary : Colors.textSecondary} />
            <View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{project.name}</Txt><Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{[project.roomName, project.jobName].filter(Boolean).join(' · ')}</Txt>
              {!project.calculationResult && <Txt style={{ color: Colors.danger }}>{pl ? 'Brakuje obmiarów do wyceny' : 'Measurements required for pricing'}</Txt>}
            </View>
          </Pressable>;
        })}
        {selectedProjects.length >= MAX_BASKET_PROJECTS && <Txt>{pl ? 'Jeden koszyk obejmuje do 20 prac.' : 'One basket supports up to 20 works.'}</Txt>}
      </View>}
      {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru prac. Wybierz je ponownie przy następnym otwarciu.' : 'Your selection could not be saved. Select the works again next time.'}</Txt>}
      <BasketExtrasSection items={extras} onChange={updateExtras} ready={extrasReady} error={extrasReadFailed} onRetry={() => setExtrasRetry(value => value + 1)} />
      {extrasSaveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano dodatkowych materiałów. Bieżąca wycena je uwzględnia, ale po ponownym otwarciu sprawdź listę.' : 'Additional materials were not saved. They are in the current quote, but check the list when reopening.'}</Txt>}
      {selectedProjects.length > 0 && <View style={{ gap: 8 }}>
        <QualityTierSelector selected={selectedQualityTier === 'custom' ? 'standard' : selectedQualityTier} onSelect={setSelectedQualityTier} includeCustom={false} />
        <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Poziom wybiera warianty produktów do porównania. Możesz zmienić go i sprawdzić cenę całego zestawu.' : 'The level selects product variants for comparison. Change it to compare the complete basket price.'}</Txt>
      </View>}
      {selectedProjects.length > 0 && <View style={{ padding: 14, borderRadius: 14, backgroundColor: Colors.surface, gap: 6 }}>
        <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Łączymy materiały z obmiarów, dopisane w Zakupach i dodane tutaj. Pomijamy pozycje oznaczone w Zakupach jako „Mam” lub „Kupione”. Narzędzia są liczone osobno.' : 'We combine measured materials, items added in Shopping and materials added here. Items marked Owned or Purchased are excluded. Tools are separate.'}</Txt>
        {itemsReady && basket.excludedMaterials > 0 && <Txt>{pl ? `Pomijamy już posiadane lub kupione pozycje: ${basket.excludedMaterials}.` : `Already owned or purchased items excluded: ${basket.excludedMaterials}.`}</Txt>}
        {itemsReady && basket.manualItems > 0 && <Txt>{pl ? `Uwzględniamy pozycje dopisane w Zakupach: ${basket.manualItems}. Brak ceny lub ilości będzie widoczny w wycenie.` : `Items added in Shopping included: ${basket.manualItems}. Missing prices or quantities remain visible in the quote.`}</Txt>}
        {itemsReady && basket.manualItems > 0 && <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Ceny wpisane ręcznie w Zakupach nie są ofertą sklepu. Tutaj porównujemy potwierdzone ceny i dostawy.' : 'Prices typed in Shopping are not retailer offers. Here we compare confirmed retailer prices and deliveries.'}</Txt>}
      </View>}
      {selectedProjects.length > 0 && !itemsReady && !itemsFailed && <ActivityIndicator color={Colors.primary} />}
      {itemsFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano zakupów lub wyboru produktów. Otwórz koszyk ponownie, aby uwzględnić wybrane i posiadane materiały.' : 'Shopping lists or product choices could not be read. Reopen the basket to include your selected and owned materials.'}</Txt>}
      {basket.missingCalculations > 0 && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Uzupełnij obmiary zaznaczonych prac lub usuń je z wyboru. Wycena całego zestawu wymaga wszystkich obmiarów.' : 'Complete measurements for selected works or deselect them. The complete basket needs all measurements.'}</Txt>}
      {loaded && itemsReady && extrasReady && hasBasket && basket.missingCalculations === 0 && (stages.some(stage => stage.materials.length > 0)
        ? <CostEstimateTab projectId="renovation-basket" stages={stages} qualityTier={selectedQualityTier} region={selectedRegion} />
        : <Txt w="semibold">{pl ? 'Wszystkie materiały z wybranych obmiarów masz już lub są kupione.' : 'All measured materials for selected works are already owned or purchased.'}</Txt>)}
    </ScrollView>
  </>;
}
