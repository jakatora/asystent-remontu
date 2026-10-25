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
import { shoppingRepo } from '@/db/repositories/shopping.repo';
import type { ShoppingItem } from '@/types/domain';
import { buildRenovationBasket, MAX_BASKET_PROJECTS, parseBasketSelection, RENOVATION_BASKET_KEY } from '@/features/pricing/renovationBasket';

export default function RenovationBasketScreen() {
  const { projects, selectedQualityTier, selectedRegion, refreshProjects } = useApp();
  const { language } = useLanguage();
  const pl = language === 'pl';
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [items, setItems] = useState<Record<string, ShoppingItem[]>>({});
  const [itemsReady, setItemsReady] = useState(false);
  const [itemsFailed, setItemsFailed] = useState(false);
  const writes = useRef(Promise.resolve());
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
    void Promise.all(selectedProjects.map(async project => [project.id, await shoppingRepo.findByProject(project.id)] as const))
      .then(entries => { if (active) { setItems(Object.fromEntries(entries)); setItemsReady(true); } })
      .catch(() => { if (active) setItemsFailed(true); });
    return () => { active = false; };
  }, [selectedProjects]));
  const basket = useMemo(() => buildRenovationBasket(projects, selected, selectedQualityTier === 'custom' ? 'standard' : selectedQualityTier, items), [projects, selected, selectedQualityTier, items]);
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
      {selectedProjects.length > 0 && <View style={{ padding: 14, borderRadius: 14, backgroundColor: Colors.surface, gap: 6 }}>
        <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Porównanie dotyczy materiałów z obmiarów. Pomijamy pozycje oznaczone w Zakupach jako „Mam” lub „Kupione”. Narzędzia i pozycje dopisane ręcznie pozostają poza tym zestawem.' : 'Comparison covers measured material requirements. Items marked Owned or Purchased are excluded. Tools and manually added items remain outside this basket.'}</Txt>
        {itemsReady && basket.excludedMaterials > 0 && <Txt>{pl ? `Pomijamy już posiadane lub kupione pozycje: ${basket.excludedMaterials}.` : `Already owned or purchased items excluded: ${basket.excludedMaterials}.`}</Txt>}
        {itemsReady && basket.manualItems > 0 && <Txt style={{ color: Colors.warning }}>{pl ? `Dodatkowo sprawdź pozycje dopisane ręcznie: ${basket.manualItems}. Nie są wliczone w sumę.` : `Also check manually added items: ${basket.manualItems}. They are not included in the total.`}</Txt>}
      </View>}
      {selectedProjects.length > 0 && !itemsReady && !itemsFailed && <ActivityIndicator color={Colors.primary} />}
      {itemsFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie odczytano list zakupów. Otwórz koszyk ponownie, aby poprawnie odjąć kupione materiały.' : 'Shopping lists could not be read. Reopen the basket to correctly exclude purchased materials.'}</Txt>}
      {basket.missingCalculations > 0 && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Uzupełnij obmiary zaznaczonych prac lub usuń je z wyboru. Wycena całego zestawu wymaga wszystkich obmiarów.' : 'Complete measurements for selected works or deselect them. The complete basket needs all measurements.'}</Txt>}
      {loaded && itemsReady && selectedProjects.length > 0 && basket.missingCalculations === 0 && (basket.stages.some(stage => stage.materials.length > 0)
        ? <CostEstimateTab projectId="renovation-basket" stages={basket.stages} qualityTier={selectedQualityTier} region={selectedRegion} />
        : <Txt w="semibold">{pl ? 'Wszystkie materiały z wybranych obmiarów masz już lub są kupione.' : 'All measured materials for selected works are already owned or purchased.'}</Txt>)}
    </ScrollView>
  </>;
}
