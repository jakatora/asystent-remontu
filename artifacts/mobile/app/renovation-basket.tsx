import {type CeilingPaintChoice} from '@/features/pricing/ceilingPaintChoice';
import {readCeilingPaintChoices} from '@/features/pricing/ceilingPaintStorage';
import type {MapegumProductChoice} from '@/features/pricing/mapegumProductChoice';
import {readMapegumProductChoices} from '@/features/pricing/mapegumProductStorage';
import type {CeresitPackageChoice} from '@/features/pricing/ceresitPackageChoice';
import {readCeresitPackageChoices} from '@/features/pricing/ceresitPackageStorage';
import type {PrimerPackageChoice} from '@/features/pricing/primerPackageChoice';
import type {MapegumPackageChoice} from '@/features/pricing/mapegumPackageChoice';
import {readMapegumPackageChoices} from '@/features/pricing/mapegumPackageStorage';
import {readPrimerPackageChoices} from '@/features/pricing/primerPackageStorage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Stack, useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { CostEstimateTab } from '@/components/project/CostEstimateTab';
import { QualityTierSelector } from '@/components/project/QualityTierSelector';
import { BasketExtrasSection } from '@/components/project/BasketExtrasSection';
import { BasketToolsSection } from '@/components/project/BasketToolsSection';
import { BASKET_EXTRAS_KEY, parseBasketExtras, withBasketExtras, type BasketExtra } from '@/features/pricing/basketExtras';
import { BASKET_TOOL_PREFIX, basketToolPurchases, collectBasketTools, parseBasketToolChoice, type BasketToolChoice } from '@/features/pricing/basketTools';
import { shoppingRepo } from '@/db/repositories/shopping.repo';
import type { ShoppingItem } from '@/types/domain';
import { buildRenovationBasket, MAX_BASKET_PROJECTS, measuredBasketProjectIds, parseBasketSelection, RENOVATION_BASKET_KEY } from '@/features/pricing/renovationBasket';
import { DOOR_SELECTION_PREFIX, parseDoorSelection, type DoorSelection } from '@/features/pricing/doorSelection';
import { LAMINATE_CHOICE_PREFIX, parseLaminateChoices, type LaminateChoice } from '@/features/pricing/laminateChoice';
import { FOIL_CHOICE_PREFIX, parseFoilChoices, type FoilChoice } from '@/features/pricing/foilChoice';
import { WASHBASIN_CHOICE_PREFIX, parseWashbasinChoices, type WashbasinChoice } from '@/features/pricing/washbasinChoice';
import { TILE_CHOICE_PREFIX, parseTileChoices, type TileChoice } from '@/features/pricing/tileChoice';
import { TILE_ADHESIVE_CHOICE_PREFIX, parseTileAdhesiveChoices, type TileAdhesiveChoice } from '@/features/pricing/tileAdhesiveChoice';
import type { MaterialStockEntry } from '@/features/pricing/materialStock';
import { readMaterialStock } from '@/features/pricing/materialStockStorage';

export default function RenovationBasketScreen() {
  const { projects, selectedQualityTier, setSelectedQualityTier, selectedRegion, refreshProjects } = useApp();
  const { language } = useLanguage();
  const pl = language === 'pl';
  const [selected, setSelected] = useState<string[]>([]);
  const [projectsExpanded, setProjectsExpanded] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [items, setItems] = useState<Record<string, ShoppingItem[]>>({});
  const [doors, setDoors] = useState<Record<string, DoorSelection | null>>({});
  const [laminates, setLaminates] = useState<Record<string, LaminateChoice[]>>({});
  const [foils, setFoils] = useState<Record<string, FoilChoice[]>>({});
  const [washbasins, setWashbasins] = useState<Record<string, WashbasinChoice[]>>({});
  const [tiles, setTiles] = useState<Record<string, TileChoice[]>>({});
  const [tileAdhesives, setTileAdhesives] = useState<Record<string, TileAdhesiveChoice[]>>({});
  const [materialStock, setMaterialStock] = useState<Record<string, MaterialStockEntry[]>>({});
  const [primerPackages,setPrimerPackages]=useState<Record<string,PrimerPackageChoice[]>>({});
  const [mapegumPackages,setMapegumPackages]=useState<Record<string,MapegumPackageChoice[]>>({});
  const [mapegumProducts,setMapegumProducts]=useState<Record<string,MapegumProductChoice[]>>({});
  const [ceresitPackages,setCeresitPackages]=useState<Record<string,CeresitPackageChoice[]>>({});
  const [ceilingPaint,setCeilingPaint]=useState<Record<string,CeilingPaintChoice[]>>({});
  const [itemsReady, setItemsReady] = useState(false);
  const [itemsFailed, setItemsFailed] = useState(false);
  const [failedProjects,setFailedProjects]=useState<string[]>([]),[itemsRetry,setItemsRetry]=useState(0);
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
  const tools = useMemo(() => collectBasketTools(selectedProjects), [selectedProjects]);
  const [toolChoices, setToolChoices] = useState<Partial<Record<string, BasketToolChoice>>>({});
  const [loadedTools, setLoadedTools] = useState<typeof tools | null>(null);
  const [toolReadError, setToolReadError] = useState(false);
  const [toolSaveError, setToolSaveError] = useState(false);
  const [toolSaving, setToolSaving] = useState(false);
  const [toolRetry, setToolRetry] = useState(0);
  const toolWrite = useRef<Promise<void> | null>(null);
  useFocusEffect(React.useCallback(() => {
    let active = true;
    setLoadedTools(null);
    setToolReadError(false);
    void Promise.resolve(toolWrite.current)
      .then(() => tools.length ? AsyncStorage.multiGet(tools.map(tool => BASKET_TOOL_PREFIX + tool.key)) : [])
      .then(rows => {
        const saved = Object.fromEntries(rows.map(([key, value]) => [key.slice(BASKET_TOOL_PREFIX.length), parseBasketToolChoice(value)]));
        if (active) { setToolChoices(saved); setLoadedTools(tools); }
      }).catch(() => { if (active) setToolReadError(true); });
    return () => { active = false; };
  }, [tools, toolRetry]));
  const saveToolChoice = (key: string, choice: BasketToolChoice | undefined) => {
    if (toolWrite.current) return;
    const storageKey = BASKET_TOOL_PREFIX + key;
    setToolSaving(true);
    setToolSaveError(false);
    const write = choice ? AsyncStorage.setItem(storageKey, choice) : AsyncStorage.removeItem(storageKey);
    toolWrite.current = write.then(() => setToolChoices(current => ({ ...current, [key]: choice })))
      .catch(() => setToolSaveError(true))
      .finally(() => { toolWrite.current = null; setToolSaving(false); });
  };
  const toolsReady = !tools.length || loadedTools === tools;
  const toolPurchases = useMemo(() => basketToolPurchases(tools, toolChoices), [tools, toolChoices]);
  const pendingTools = tools.filter(tool => tool.required && !toolChoices[tool.key]).length;
  const unpricedTools = tools.filter(tool => toolChoices[tool.key] === 'buy' && !tool.product?.identity.ean);
  const rentedTools = tools.filter(tool => toolChoices[tool.key] === 'rent');
  const measuredProjectIds = useMemo(() => measuredBasketProjectIds(projects), [projects]);
  const measuredProjectCount = projects.filter(project => Boolean(project.calculationResult)).length;
  const showProjects = projectsExpanded ?? (selectedProjects.length === 0 && extras.length === 0);
  // Refresh after returning from a project's Shopping tab as well as selection changes.
  useFocusEffect(React.useCallback(() => {
    let active = true;
    setItemsReady(false); setItemsFailed(false);setFailedProjects([]);
    void Promise.allSettled(selectedProjects.map(async project => {
      const [shopping, rawDoor, rawLaminate, rawFoil, rawWashbasin, rawTile, rawTileAdhesive] = await Promise.all([shoppingRepo.findByProject(project.id), project.calculationResult?.jobId === 'interior-doors' ? AsyncStorage.getItem(DOOR_SELECTION_PREFIX + project.id) : Promise.resolve(null), AsyncStorage.getItem(LAMINATE_CHOICE_PREFIX + project.id), AsyncStorage.getItem(FOIL_CHOICE_PREFIX + project.id), AsyncStorage.getItem(WASHBASIN_CHOICE_PREFIX + project.id), AsyncStorage.getItem(TILE_CHOICE_PREFIX + project.id), AsyncStorage.getItem(TILE_ADHESIVE_CHOICE_PREFIX + project.id)]);
      const [stock,primerPackages,mapegumPackages,mapegumProducts,ceresitPackages,ceilingPaint]=await Promise.all([readMaterialStock(AsyncStorage,project.id),readPrimerPackageChoices(AsyncStorage,project.id),readMapegumPackageChoices(AsyncStorage,project.id),readMapegumProductChoices(AsyncStorage,project.id),readCeresitPackageChoices(AsyncStorage,project.id),readCeilingPaintChoices(AsyncStorage,project.id)]);
      return { id: project.id, shopping, door: project.calculationResult ? parseDoorSelection(rawDoor, project.calculationResult) : null, laminate: parseLaminateChoices(rawLaminate), foil: parseFoilChoices(rawFoil), washbasin: parseWashbasinChoices(rawWashbasin), tile: parseTileChoices(rawTile), tileAdhesive: parseTileAdhesiveChoices(rawTileAdhesive), stock, primerPackages,mapegumPackages,mapegumProducts,ceresitPackages,ceilingPaint };
    }))
      .then(results => { if (active) { const failed=results.flatMap((result,index)=>result.status==='rejected'?[selectedProjects[index].id]:[]);setFailedProjects(failed);if(failed.length){setItemsFailed(true);return;}const entries=results.flatMap(result=>result.status==='fulfilled'?[result.value]:[]);setItems(Object.fromEntries(entries.map(entry => [entry.id, entry.shopping]))); setDoors(Object.fromEntries(entries.map(entry => [entry.id, entry.door]))); setLaminates(Object.fromEntries(entries.map(entry => [entry.id, entry.laminate]))); setFoils(Object.fromEntries(entries.map(entry => [entry.id, entry.foil]))); setWashbasins(Object.fromEntries(entries.map(entry => [entry.id, entry.washbasin]))); setTiles(Object.fromEntries(entries.map(entry => [entry.id, entry.tile]))); setTileAdhesives(Object.fromEntries(entries.map(entry => [entry.id, entry.tileAdhesive]))); setMaterialStock(Object.fromEntries(entries.map(entry => [entry.id, entry.stock]))); setPrimerPackages(Object.fromEntries(entries.map(entry=>[entry.id,entry.primerPackages]))); setMapegumPackages(Object.fromEntries(entries.map(entry=>[entry.id,entry.mapegumPackages]))); setMapegumProducts(Object.fromEntries(entries.map(entry=>[entry.id,entry.mapegumProducts]))); setCeresitPackages(Object.fromEntries(entries.map(entry=>[entry.id,entry.ceresitPackages]))); setCeilingPaint(Object.fromEntries(entries.map(entry=>[entry.id,entry.ceilingPaint]))); setItemsReady(true); } })
      .catch(() => { if (active) setItemsFailed(true); });
    return () => { active = false; };
  }, [selectedProjects,itemsRetry]));
  const basket = useMemo(() => buildRenovationBasket(projects, selected, selectedQualityTier === 'custom' ? 'standard' : selectedQualityTier, items, doors, laminates, foils, washbasins, tiles, tileAdhesives, materialStock, primerPackages,mapegumPackages,mapegumProducts,ceresitPackages,ceilingPaint), [projects, selected, selectedQualityTier, items, doors, laminates, foils, washbasins, tiles, tileAdhesives, materialStock, primerPackages,mapegumPackages,mapegumProducts,ceresitPackages,ceilingPaint]);
  const stages = useMemo(() => withBasketExtras(basket.selectionStages, extras, toolPurchases), [basket.selectionStages, extras, toolPurchases]);
  const hasBasket = selectedProjects.length > 0 || extras.length > 0;
  const saveSelection = (next: string[]) => {
    if (next.length > MAX_BASKET_PROJECTS) return;
    setSelected(next); setItemsReady(false); setSaveFailed(false);
    writes.current = writes.current.catch(() => {}).then(() => AsyncStorage.setItem(RENOVATION_BASKET_KEY, JSON.stringify({ version: 1, projectIds: next })))
      .catch(() => setSaveFailed(true));
  };
  const toggle = (id: string) => {
    const current = selected.filter(key => projects.some(project => project.id === key));
    saveSelection(current.includes(id) ? current.filter(key => key !== id) : [...current, id]);
  };
  return <>
    <Stack.Screen options={{ headerShown: true, title: pl ? 'Koszyk całego remontu' : 'Whole renovation basket', headerBackTitle: pl ? 'Projekty' : 'Projects', headerStyle: { backgroundColor: Colors.background }, headerShadowVisible: false }} />
    <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Txt w="bold" style={{ fontSize: 24 }}>{pl ? 'Kup razem do całego remontu' : 'Buy together for your renovation'}</Txt>
        <Txt style={{ color: Colors.textSecondary, lineHeight: 22 }}>{pl ? 'Wybierz prace i pomieszczenia. Zsumujemy potrzebne materiały, dobierzemy opakowania raz i porównamy cały zestaw z dostawami.' : 'Choose works and rooms. We combine material requirements, round to packs once and compare the complete basket including deliveries.'}</Txt>
      </View>
      {!loaded ? <ActivityIndicator color={Colors.primary} /> : <View style={{ gap: 8, padding:14, borderRadius:16, borderWidth:1, borderColor:Colors.border, backgroundColor:Colors.surface }}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
          <Txt w="semibold" accessibilityLabel={pl?`Wybrane prace: ${selectedProjects.length}`:`Selected works: ${selectedProjects.length}`} style={{flex:1,fontSize:14,lineHeight:20}}>{pl ? `Prace: ${selectedProjects.length}` : `Works: ${selectedProjects.length}`}</Txt>
          {projects.length > 0 && <Pressable accessibilityRole="button" aria-expanded={showProjects} accessibilityState={{expanded:showProjects}} onPress={()=>setProjectsExpanded(!showProjects)} style={{minHeight:48,paddingHorizontal:8,flexDirection:'row',alignItems:'center',gap:6}}>
            <Txt w="semibold" style={{color:Colors.primary}}>{pl ? showProjects?'Ukryj wybór prac':'Zmień wybór prac' : showProjects?'Hide work selection':'Change work selection'}</Txt>
            <Feather name={showProjects?'chevron-up':'chevron-down'} size={18} color={Colors.primary}/>
          </Pressable>}
        </View>
        {!showProjects && selectedProjects.slice(0,3).map(project=><Txt key={project.id} numberOfLines={1} style={{fontSize:13,lineHeight:19,color:Colors.textSecondary}}>{[project.roomName,project.name].filter(Boolean).join(' · ')}</Txt>)}
        {!showProjects && selectedProjects.length > 3 && <Txt style={{fontSize:13,color:Colors.textSecondary}}>{pl?`Pozostałe wybrane prace: ${selectedProjects.length-3}.`:`Other selected works: ${selectedProjects.length-3}.`}</Txt>}
        {!projects.length && <Txt>{pl ? 'Dodaj produkty z katalogu poniżej lub utwórz projekt z obmiarami.' : 'Add catalogue products below or create a project with measurements.'}</Txt>}
        {showProjects && measuredProjectCount > 0 && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Button variant="outline" size="sm" label={pl ? `Wybierz prace z obmiarami (${Math.min(measuredProjectCount, MAX_BASKET_PROJECTS)})` : `Select measured works (${Math.min(measuredProjectCount, MAX_BASKET_PROJECTS)})`} onPress={() => saveSelection(measuredProjectIds)} />
          {selectedProjects.length > 0 && <Button variant="ghost" size="sm" label={pl ? 'Wyczyść wybór' : 'Clear selection'} onPress={() => saveSelection([])} />}
        </View>}
        {showProjects && measuredProjectCount > MAX_BASKET_PROJECTS && <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? `Koszyk obejmuje maksymalnie ${MAX_BASKET_PROJECTS} prac. Wybór zbiorczy zaznaczy pierwsze ${MAX_BASKET_PROJECTS}; pozostałe możesz wybrać ręcznie zamiast nich.` : `A basket supports up to ${MAX_BASKET_PROJECTS} works. Bulk selection picks the first ${MAX_BASKET_PROJECTS}; you can replace them manually.`}</Txt>}
        {showProjects && projects.map(project => {
          const checked = selected.includes(project.id);
          const disabled = !checked && selectedProjects.length >= MAX_BASKET_PROJECTS;
          return <Pressable key={project.id} accessibilityRole="checkbox" accessibilityLabel={project.name} aria-checked={checked} aria-disabled={disabled} accessibilityState={{ checked, disabled }} disabled={disabled}
            onPress={() => {setProjectsExpanded(true);toggle(project.id);}} style={({ pressed }) => ({ minHeight: 64, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: checked ? Colors.primary : Colors.border, backgroundColor: checked ? Colors.primaryBg : Colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 })}>
            <Feather name={checked ? 'check-square' : 'square'} size={22} color={checked ? Colors.primary : Colors.textSecondary} />
            <View style={{ flex: 1, gap: 4 }}><Txt w="semibold">{project.name}</Txt><Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{[project.roomName, project.jobName].filter(Boolean).join(' · ')}</Txt>
              {!project.calculationResult && <Txt style={{ color: Colors.danger }}>{pl ? 'Brakuje obmiarów do wyceny' : 'Measurements required for pricing'}</Txt>}
            </View>
          </Pressable>;
        })}
        {selectedProjects.length >= MAX_BASKET_PROJECTS && <Txt>{pl ? `Jeden koszyk obejmuje do ${MAX_BASKET_PROJECTS} prac.` : `One basket supports up to ${MAX_BASKET_PROJECTS} works.`}</Txt>}
      </View>}
      {saveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru prac. Wybierz je ponownie przy następnym otwarciu.' : 'Your selection could not be saved. Select the works again next time.'}</Txt>}
      <BasketExtrasSection items={extras} onChange={updateExtras} ready={extrasReady} error={extrasReadFailed} onRetry={() => setExtrasRetry(value => value + 1)} />
      {extrasSaveFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano dodatkowych materiałów. Bieżąca wycena je uwzględnia, ale po ponownym otwarciu sprawdź listę.' : 'Additional materials were not saved. They are in the current quote, but check the list when reopening.'}</Txt>}
      {selectedProjects.length > 0 && <View style={{ gap: 8 }}>
        <QualityTierSelector selected={selectedQualityTier === 'custom' ? 'standard' : selectedQualityTier} onSelect={setSelectedQualityTier} includeCustom={false} />
        <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Poziom wybiera warianty produktów do porównania. Możesz zmienić go i sprawdzić cenę całego zestawu.' : 'The level selects product variants for comparison. Change it to compare the complete basket price.'}</Txt>
      </View>}
      {selectedProjects.length > 0 && <View style={{ padding: 14, borderRadius: 14, backgroundColor: Colors.surface, gap: 6 }}>
        <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>{pl ? 'Łączymy materiały z obmiarów, dopisane w Zakupach i dodane tutaj. Pomijamy pozycje oznaczone w Zakupach jako „Mam” lub „Kupione”.' : 'We combine measured materials, items added in Shopping and materials added here. Items marked Owned or Purchased are excluded.'}</Txt>
        {itemsReady && basket.manualItems > 0 && <Txt>{pl ? `Uwzględniamy pozycje dopisane w Zakupach: ${basket.manualItems}. Brak ceny lub ilości będzie widoczny w wycenie.` : `Items added in Shopping included: ${basket.manualItems}. Missing prices or quantities remain visible in the quote.`}</Txt>}
        {itemsReady && basket.manualItems > 0 && <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{pl ? 'Ceny wpisane ręcznie w Zakupach nie są ofertą sklepu. Tutaj porównujemy potwierdzone ceny i dostawy.' : 'Prices typed in Shopping are not retailer offers. Here we compare confirmed retailer prices and deliveries.'}</Txt>}
      </View>}
      {toolsReady && <BasketToolsSection tools={tools} choices={toolChoices} saving={toolSaving} onChoice={saveToolChoice} />}
      {toolsReady && pendingTools > 0 && <Txt style={{ color: Colors.textSecondary }}>
        {pl ? `Wymagane narzędzia bez decyzji (${pendingTools}) są poza bieżącą wyceną.` : `Required tools without a decision (${pendingTools}) are outside the current quote.`}
      </Txt>}
      {!toolsReady && !toolReadError && <ActivityIndicator color={Colors.primary} />}
      {toolReadError && <View style={{ gap: 8 }}>
        <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie udało się odczytać wyboru narzędzi. Wycena czeka na ponowny odczyt.' : 'Tool choices could not be read. The quote is paused until they reload.'}</Txt>
        <Button variant="outline" label={pl ? 'Ponów odczyt narzędzi' : 'Reload tool choices'} onPress={() => setToolRetry(value => value + 1)} />
      </View>}
      {toolSaveError && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Nie zapisano wyboru narzędzia. Spróbuj ponownie.' : 'The tool choice was not saved. Try again.'}</Txt>}
      {selectedProjects.length > 0 && !itemsReady && !itemsFailed && <ActivityIndicator color={Colors.primary} />}
      {itemsFailed && <View style={{gap:12,padding:16,borderRadius:16,backgroundColor:Colors.warningBg}}>
        <Txt accessibilityRole="alert" style={{color:Colors.danger}}>{pl?'Nie odczytano zakupów lub ustawień wybranych prac. Wycena całego koszyka jest wstrzymana.':'Shopping lists or settings for selected works could not be read. Whole-basket pricing is paused.'}</Txt>
        <Button variant="outline" label={pl?'Ponów odczyt projektów':'Read projects again'} onPress={()=>setItemsRetry(n=>n+1)}/>
        {selectedProjects.filter(project=>failedProjects.includes(project.id)).map(project=><View key={project.id} style={{gap:8}}>
          <Txt w="semibold">{[project.roomName,project.name].filter(Boolean).join(' · ')}</Txt>
          <Txt style={{lineHeight:21}}>{pl?'Otwórz wycenę tej pracy. Znajdziesz tam ustawienie wymagające ponownego odczytu lub przywrócenia. Możesz też odznaczyć tę pracę w wyborze koszyka.':'Open this work’s estimate to find the setting that needs reading again or recovery. You can also deselect this work from the basket.'}</Txt>
          <Button variant="outline" label={pl?`Otwórz wycenę: ${project.name}`:`Open estimate: ${project.name}`} onPress={()=>router.push({pathname:'/project/[id]',params:{id:project.id,tab:'estimate'}})}/>
        </View>)}
      </View>}
      {basket.missingCalculations > 0 && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{pl ? 'Uzupełnij obmiary zaznaczonych prac lub usuń je z wyboru. Wycena całego zestawu wymaga wszystkich obmiarów.' : 'Complete measurements for selected works or deselect them. The complete basket needs all measurements.'}</Txt>}
      {itemsReady && basket.measurementReviews.map(review => <View key={review.projectId} style={{ padding: 16, gap: 10, borderRadius: 16, backgroundColor: Colors.warningBg }}>
        <Txt w="semibold">{pl ? 'Uzupełnij ilości przed zakupem' : 'Confirm quantities before buying'}</Txt>
        <Txt>{review.projectName}</Txt>
        <Txt style={{ color: Colors.textSecondary }}>{review.materials.join(', ')}</Txt>
        <Txt>{pl ? 'Otwórz obmiary, sprawdź ilości i zapisz przeliczenie. Te materiały pozostają na liście, ale nie mają jeszcze pełnej wyceny.' : 'Open measurements, check quantities and save the recalculation. These materials stay on your list but are not fully quoted yet.'}</Txt>
        <Button label={pl ? `Uzupełnij obmiary: ${review.projectName}` : `Complete measurements: ${review.projectName}`} variant="outline" size="sm"
          onPress={() => router.push({ pathname: '/project/[id]/edit', params: { id: review.projectId } })} />
      </View>)}
      {toolsReady && (unpricedTools.length > 0 || rentedTools.length > 0) && <View style={{ padding: 14, gap: 6, borderRadius: 14, backgroundColor: Colors.warningBg }}>
        <Txt w="semibold" accessibilityRole="header">{pl ? 'Zakres wyceny sklepów' : 'Store quote scope'}</Txt>
        {unpricedTools.length > 0 && <View style={{ gap: 4 }}>
          <Txt>{pl ? `Zakupy narzędzi poza wyceną z powodu braku modelu: ${unpricedTools.length}.` : `Tool purchases outside this quote without an exact model: ${unpricedTools.length}.`}</Txt>
          {unpricedTools.map(tool => <Txt key={tool.key} style={{ color: Colors.textSecondary }}>{tool.name}</Txt>)}
        </View>}
        {rentedTools.length > 0 && <View style={{ gap: 4 }}>
          <Txt>{pl ? `Narzędzia do wypożyczenia, rozliczane osobno: ${rentedTools.length}.` : `Tools to rent, priced separately: ${rentedTools.length}.`}</Txt>
          {rentedTools.map(tool => <Txt key={tool.key} style={{ color: Colors.textSecondary }}>{tool.name}</Txt>)}
        </View>}
      </View>}
      {loaded && itemsReady && extrasReady && toolsReady && hasBasket && basket.missingCalculations === 0 && (stages.some(stage => stage.materials.length > 0)
        ? <CostEstimateTab projectId="renovation-basket" stages={stages} shoppingContexts={basket.shoppingContexts} qualityTier={selectedQualityTier} region={selectedRegion} includesToolPurchases={toolPurchases.length > 0} />
        : <Txt w="semibold">{pl ? 'Brak materiałów i narzędzi do wyceny w sklepach.' : 'There are no materials or tools to quote in stores.'}</Txt>)}
    </ScrollView>
  </>;
}
