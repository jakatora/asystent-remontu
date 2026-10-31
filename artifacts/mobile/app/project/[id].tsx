import { ProjectNavigation } from '@/components/project/ProjectNavigation';
import { parseDecimal } from '@/shared/lib/number';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getJobById } from '@/data/jobs';
import { computePricedBudget } from '@/features/pricing';
import { ProjectPurchaseSummary } from '@/components/project/ProjectPurchaseSummary';
import {makePortableProjectPhoto} from '@/features/storage/projectBackupFiles';
import type { PurchaseSnapshot } from '@/features/pricing/purchaseSummary';
import { requiresCurrentShoppingQuantity, shoppingQuantityAction } from '@/features/pricing/projectShoppingInput';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { STATUS_LABELS, PHOTO_TYPE_LABELS } from '@/utils/format';
import type { ShoppingItem, PhotoType, ChecklistItem } from '@/types/domain';
import type { PriceOverride, PricedBudgetEstimate } from '@/types/pricing';
import {
  OverviewTab,
  MaterialsTab,
  ToolsTab,
  GuideTab,
  ShoppingTab,
  CostEstimateTab,
  PhotosTab,
  PricingSummary,
  diyAssessment,
  getEffectivePrice,
  getEffectiveQuantity,
  buildShareText,
  TAB_LABEL_KEYS,
  CONTINGENCY_RATE,
} from '@/components/project';
import type { Tab } from '@/components/project';

function safeNavigateAway() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/(tabs)/projects');
  }
}

export default function ProjectDetailScreen() {
  const { id, fromWizard, tab: requestedTab } = useLocalSearchParams<{ id: string; fromWizard?: string; tab?: Tab }>();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const {
    projects,
    updateProject,
    removeProject,
    getProjectShoppingItems,
    generateAndAddShoppingItems,
    toggleItem,
    setItemOwned,
    updateItemPrice,
    updateItemQuantity,
    removeShoppingItem,
    getProjectPhotos,
    addPhoto,
    removePhoto,
    getProjectChecklist,
    generateChecklist,
    toggleChecklistItem,
    getChecklistProgress,
    getProjectActivities,
    logActivity,
    selectedRegion,
    selectedQualityTier,
    setSelectedQualityTier,
    getProjectOverrides,
    upsertOverride,
    resetOverride,
  } = useApp();

  const [tab, setTab] = useState<Tab>(requestedTab && ['overview', 'estimate', 'shopping', 'guide', 'materials', 'tools', 'budget', 'photos'].includes(requestedTab) ? requestedTab : 'overview');
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [shoppingLoadedProject, setShoppingLoadedProject] = useState<string | null>(null);
  const [lastPurchase, setLastPurchase] = useState<{ scope: string; snapshot: PurchaseSnapshot } | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');
  const [photos, setPhotos] = useState<import('@/types/domain').ProjectPhoto[]>([]);
  const [photoSaveFailed,setPhotoSaveFailed]=useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 0 });
  const [activities, setActivities] = useState<import('@/types/domain').ProjectActivity[]>([]);
  const [priceOverrides, setPriceOverrides] = useState<PriceOverride[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletedRef = useRef(false);

  const project = projects.find((p) => p.id === id);
  const job = project ? getJobById(project.jobId) : null;
  const purchaseScope = JSON.stringify([project?.id, project?.calculationResult, selectedQualityTier, selectedRegion, shoppingLoadedProject, shoppingItems]);
  const onPurchaseSnapshot = useCallback((snapshot: PurchaseSnapshot | null) => {
    setLastPurchase(snapshot ? { scope: purchaseScope, snapshot } : null);
  }, [purchaseScope]);

  const pricedBudget: PricedBudgetEstimate | null = useMemo(() => {
    if (!project?.calculationResult || !job) return null;
    try {
      return computePricedBudget({
        job,
        calc: project.calculationResult,
        regionCode: selectedRegion,
        qualityTier: selectedQualityTier,
        overrides: priceOverrides,
      });
    } catch (e) {
      console.warn('[Pricing] compute error:', e);
      return null;
    }
  }, [job, project?.calculationResult, selectedRegion, selectedQualityTier, priceOverrides]);

  useEffect(() => {
    if (!project && !deletedRef.current) {
      const timer = setTimeout(() => safeNavigateAway(), 100);
      return () => clearTimeout(timer);
    }
  }, [project]);

  const loadAll = useCallback(async () => {
    if (!id || deletedRef.current) return;
    try {
      const [items, ph, cl, prog, acts, ovr] = await Promise.all([
        getProjectShoppingItems(id),
        getProjectPhotos(id),
        getProjectChecklist(id),
        getChecklistProgress(id),
        getProjectActivities(id),
        getProjectOverrides(id),
      ]);
      if (deletedRef.current) return;
      setShoppingItems(items);
      setShoppingLoadedProject(id);
      setPhotos(ph);
      setChecklist(cl);
      setChecklistProgress(prog);
      setActivities(acts);
      setPriceOverrides(ovr);
    } catch (e) {
      if (!deletedRef.current) console.warn('[ProjectDetail] loadAll error:', e);
    }
  }, [id, getProjectShoppingItems, getProjectPhotos, getProjectChecklist, getChecklistProgress, getProjectActivities, getProjectOverrides]);

  useFocusEffect(useCallback(() => { setLastPurchase(null); loadAll(); }, [loadAll]));
  useEffect(() => { if (tab === 'shopping') void loadAll(); }, [tab, loadAll]);

  const handleGenerateShoppingList = async () => {
    if (!project?.calculationResult || !job) return;
    await generateAndAddShoppingItems(project.id, project.calculationResult, job);
    await loadAll();
    setTab('shopping');
  };

  const handleGenerateChecklist = async () => {
    if (!project || !job) return;
    await generateChecklist(project.id, job);
    await logActivity(project.id, 'checklist_completed', t('project.detail.activityChecklistGenerated'));
    await loadAll();
  };

  const handleToggleChecklist = async (item: ChecklistItem) => {
    await toggleChecklistItem(item.id, !item.completed);
    if (!item.completed && project) {
      await logActivity(project.id, 'checklist_completed', t('project.detail.activityChecklistDone', { title: item.title }));
    }
    await loadAll();
  };

  const handleStatusChange = async (status: 'planning' | 'in-progress' | 'completed') => {
    if (!project) return;
    await updateProject({ ...project, status });
    await logActivity(project.id, 'status_changed', t('project.detail.activityStatusChanged', { status: STATUS_LABELS[status] }));
    await loadAll();
  };

  const handleDelete = () => {
    if (isDeleting || !project) return;
    Alert.alert(
      t('project.detail.deleteTitle'),
      t('project.detail.deleteBody', { name: project.name }),
      [
        { text: t('project.detail.deleteCancel'), style: 'cancel' },
        {
          text: t('project.detail.deleteCta'),
          style: 'destructive',
          onPress: async () => {
            if (isDeleting) return;
            setIsDeleting(true);
            deletedRef.current = true;
            try {
              await removeProject(project.id);
              Alert.alert(t('project.detail.deleteSuccessTitle'), t('project.detail.deleteSuccessBody'));
              safeNavigateAway();
            } catch (e) {
              deletedRef.current = false;
              setIsDeleting(false);
              Alert.alert(t('project.detail.deleteErrorTitle'), t('project.detail.deleteErrorBody'));
            }
          },
        },
      ]
    );
  };

  const handleToggleOwned = async (item: ShoppingItem) => {
    if (!await confirmCurrentQuantity(item)) return;
    await setItemOwned(item.id, !item.owned);
    await loadAll();
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    if (!await confirmCurrentQuantity(item)) return;
    if (project && (requiresCurrentShoppingQuantity(project.jobId) || item.selectedRequirement) && !item.purchased) await setItemOwned(item.id, false);
    await toggleItem(item.id, !item.purchased);
    await loadAll();
  };

  const confirmCurrentQuantity = async (item: ShoppingItem): Promise<boolean> => {
    const action = shoppingQuantityAction(project?.jobId ?? '', item);
    if (!action.allowed) {
      Alert.alert(language === 'pl' ? 'Potwierdź ilość materiału' : 'Confirm the material quantity', language === 'pl' ? 'Uzupełnij obmiary albo ustaw własną ilość na pełne zapotrzebowanie przed oznaczeniem całej pozycji jako posiadanej lub kupionej.' : 'Complete measurements or set the custom quantity to the full requirement before marking this whole item as owned or purchased.');
      return false;
    }
    if (action.confirmQuantity !== undefined) await updateItemQuantity(item.id, action.confirmQuantity, { unit: item.unit, name: item.name });
    return true;
  };

  const handleStartEdit = (item: ShoppingItem) => {
    setEditingId(item.id);
    setEditPrice(String(getEffectivePrice(item)));
    setEditQty(String(getEffectiveQuantity(item)));
  };

  const handleSaveEdit = async (item: ShoppingItem) => {
    const newPrice = parseDecimal(editPrice);
    const newQty = parseDecimal(editQty);
    if (isFinite(newQty) && newQty > 0) await updateItemQuantity(item.id, newQty, item.selectedRequirement ? { name: item.name, unit: item.unit } : undefined);
    if (isFinite(newPrice) && newPrice >= 0) await updateItemPrice(item.id, newPrice);
    setEditingId(null);
    await loadAll();
  };

  const handleRemoveItem = (item: ShoppingItem) => {
    Alert.alert(t('project.detail.removeItemTitle'), t('project.detail.removeItemBody', { name: item.name }), [
      { text: t('project.detail.removeItemCancel'), style: 'cancel' },
      {
        text: t('project.detail.removeItemCta'),
        style: 'destructive',
        onPress: async () => { await removeShoppingItem(item.id); await loadAll(); },
      },
    ]);
  };

  const handleShare = async () => {
    if (!project) return;
    const materials = shoppingItems.filter((i) => i.itemType === 'material');
    const tools = shoppingItems.filter((i) => i.itemType === 'tool');
    const totalMat = materials.filter((i) => !i.owned).reduce((s, i) => s + getEffectivePrice(i), 0);
    const totalTool = tools.filter((i) => !i.owned).reduce((s, i) => s + getEffectivePrice(i), 0);
    const contingency = (totalMat + totalTool) * CONTINGENCY_RATE;
    const text = buildShareText(project.name, materials, tools, totalMat, totalTool, contingency, t);
    try {
      await Share.share({ message: text, title: t('project.detail.shareTitle', { name: project.name }) });
    } catch (_e) { /* ignore */ }
  };

  const handlePickPhoto = async (photoType: PhotoType) => {
    if (!project) return;
    setPhotoSaveFailed(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('project.detail.noPermissionTitle'), t('project.detail.galleryPermission'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      await addPhoto({ projectId: project.id, uri: await makePortableProjectPhoto(result.assets[0].uri), photoType });
      await loadAll();
    } catch (err) {
      setPhotoSaveFailed(true);
      console.error('[Photos] pick error:', err);
    }
  };

  const handleTakePhoto = async (photoType: PhotoType) => {
    if (!project) return;
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('project.detail.noPermissionTitle'), t('project.detail.cameraPermission'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      await addPhoto({ projectId: project.id, uri: result.assets[0].uri, photoType });
      await loadAll();
    } catch (err) {
      console.error('[Photos] camera error:', err);
    }
  };

  const handleDeletePhoto = (photo: import('@/types/domain').ProjectPhoto) => {
    Alert.alert(t('project.detail.deletePhotoTitle'), t('project.detail.deletePhotoBody'), [
      { text: t('project.detail.deletePhotoCancel'), style: 'cancel' },
      {
        text: t('project.detail.deletePhotoCta'),
        style: 'destructive',
        onPress: async () => { await removePhoto(photo.id); await loadAll(); },
      },
    ]);
  };

  const handleAddPhotoMenu = (photoType: PhotoType) => {
    // Native Alert menus are not rendered by React Native Web. Open the file
    // picker directly from the user's click; persist its bytes, not a blob URL.
    if(Platform.OS==='web'){void handlePickPhoto(photoType);return;}
    Alert.alert(t('project.detail.addPhotoTitle'), t('project.detail.addPhotoBody', { type: PHOTO_TYPE_LABELS[photoType] }), [
      { text: t('project.detail.addPhotoCamera'), onPress: () => handleTakePhoto(photoType) },
      { text: t('project.detail.addPhotoGallery'), onPress: () => handlePickPhoto(photoType) },
      { text: t('project.detail.addPhotoCancel'), style: 'cancel' },
    ]);
  };

  const handleOverrideLabor = async (laborId: string, pricePerUnit: number) => {
    if (!id) return;
    try {
      await upsertOverride(id, 'labor', laborId, pricePerUnit);
      await loadAll();
    } catch (e) {
      console.error('[Pricing] override labor error:', e);
      Alert.alert(t('project.detail.priceErrorTitle'), t('project.detail.laborPriceError'));
    }
  };

  const handleResetLabor = async (laborId: string) => {
    if (!id) return;
    try {
      await resetOverride(id, 'labor', laborId);
      await loadAll();
    } catch (e) {
      console.error('[Pricing] reset labor error:', e);
    }
  };

  const handleOverrideMaterial = async (materialId: string, pricePerPackage: number) => {
    if (!id) return;
    try {
      await upsertOverride(id, 'material', materialId, pricePerPackage);
      await loadAll();
    } catch (e) {
      console.error('[Pricing] override material error:', e);
      Alert.alert(t('project.detail.priceErrorTitle'), t('project.detail.materialPriceError'));
    }
  };

  const handleResetMaterial = async (materialId: string) => {
    if (!id) return;
    try {
      await resetOverride(id, 'material', materialId);
      await loadAll();
    } catch (e) {
      console.error('[Pricing] reset material error:', e);
    }
  };

  if (!project || !job) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerBackTitle: t('project.detail.headerBack'), headerStyle: { backgroundColor: Colors.background }, headerShadowVisible: false }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: 16 }}>
          <Feather name="folder" size={40} color={Colors.textMuted} />
          <Txt w="medium" style={{ fontSize: 16, color: Colors.textSecondary }}>
            {isDeleting ? t('project.detail.deleting') : t('project.detail.notFound')}
          </Txt>
          {!isDeleting && (
            <Button label={t('project.detail.backToList')} onPress={safeNavigateAway} variant="outline" />
          )}
        </View>
      </>
    );
  }

  const calc = project.calculationResult;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;
  const nonOwnedItems = shoppingItems.filter((i) => !i.owned);
  const purchasedCount = nonOwnedItems.filter((i) => i.purchased).length;
  const isFirstTime = fromWizard === '1' && !welcomeDismissed;
  const diy = diyAssessment(job.difficulty, job.hireProfessionalRecommended, t);
  const budget = calc && !calc.quantityIssues?.length && pricedBudget?.laborDetails.length ? {
    materialsMin: calc.totalCost,
    materialsMax: calc.totalCost,
    laborMin: pricedBudget.laborSubtotalMin,
    laborMax: pricedBudget.laborSubtotalMax,
    totalMin: calc.totalCost + pricedBudget.laborSubtotalMin,
    totalMax: calc.totalCost + pricedBudget.laborSubtotalMax,
    currency: 'PLN' as const,
  } : null;

  const data = {
    project,
    job,
    calc,
    shoppingItems,
    photos,
    checklist,
    checklistProgress,
    activities,
    budget,
    diy,
  };

  const actions = {
    loadAll,
    handleStatusChange,
    handleGenerateShoppingList,
    handleGenerateChecklist,
    handleToggleChecklist,
    handleTogglePurchased,
    handleToggleOwned,
    handleStartEdit,
    handleSaveEdit,
    handleRemoveItem,
    handleShare,
    handleAddPhotoMenu,
    handleDeletePhoto,
    setTab,
  };

  const editState = {
    editingId,
    editPrice,
    editQty,
    setEditingId,
    setEditPrice,
    setEditQty,
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: project.name,
          headerBackTitle: t('project.detail.headerBack'),
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12, marginRight: 4 }}>
              <TouchableOpacity
                accessibilityRole="button" accessibilityLabel={language === 'pl' ? 'Edytuj projekt i obmiary' : 'Edit project and measurements'}
                onPress={() => router.push({ pathname: '/project/[id]/edit', params: { id: project.id } })}
              >
                <Feather name="edit-3" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} disabled={isDeleting}>
                <Feather name="trash-2" size={20} color={isDeleting ? Colors.textMuted : Colors.danger} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ProjectNavigation selected={tab} onSelect={setTab} />

      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {['overview', 'shopping', 'budget'].includes(tab) && <View style={{marginBottom:16}}><ProjectPurchaseSummary snapshot={lastPurchase?.scope === purchaseScope ? lastPurchase.snapshot : null} onCompare={() => setTab('estimate')}/></View>}
        {project.jobId === 'sink-installation' && ['overview', 'shopping', 'estimate'].includes(tab) && <View style={{ marginBottom: 16, gap: 8, padding: 16, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface }}>
          <Txt w="semibold">{language === 'pl' ? 'Mocowania umywalki' : 'Basin fixings'}</Txt>
          <Txt style={{ color: Colors.textSecondary, lineHeight: 21 }}>{calc?.measurements.sinkFixingChoice === 1
            ? (language === 'pl' ? 'Wybrano Fischer WST 140 K: dwa mocowania na umywalkę. Cena w porównaniu obejmuje całe opakowania po 2 mocowania.' : 'Fischer WST 140 K selected: two fastening points per basin. Quotes use whole packs of two.')
            : calc?.measurements.sinkFixingChoice === 2 ? (language === 'pl' ? 'Zadeklarowano posiadanie dobranych mocowań do wszystkich umywalek.' : 'Suitable fixings for all basins are already owned.')
            : (language === 'pl' ? 'Dobierz mocowania do umywalki i nośnej ściany. Dopóki dobór nie jest potwierdzony, pełna cena zestawu pozostaje nieznana.' : 'Choose fixings for the basin and load-bearing wall. The full basket price remains unknown until their suitability is confirmed.')}</Txt>
          <Button label={language === 'pl' ? 'Zmień mocowania i liczbę umywalek' : 'Edit fixings and basin count'} variant="outline"
            onPress={() => router.push({ pathname: '/project/[id]/edit', params: { id: project.id } })}/>
        </View>}
        {tab === 'overview' && (
          <OverviewTab
            data={data}
            actions={actions}
            isFirstTime={isFirstTime}
            onDismissWelcome={() => setWelcomeDismissed(true)}
            purchasedCount={purchasedCount}
            nonOwnedCount={nonOwnedItems.length}
          />
        )}

        {tab === 'materials' && calc && (
          <MaterialsTab
            calc={calc}
            hasShoppingItems={shoppingItems.length > 0}
            onGenerateShoppingList={handleGenerateShoppingList}
          />
        )}

        {tab === 'tools' && (
          <ToolsTab job={job} diy={diy} />
        )}

        {tab === 'guide' && (
          <GuideTab
            job={job}
            checklist={checklist}
            checklistProgress={checklistProgress}
            onGenerateChecklist={handleGenerateChecklist}
            onToggleChecklist={handleToggleChecklist}
          />
        )}

        {tab === 'shopping' && (
          <ShoppingTab
            shoppingItems={shoppingItems}
            job={job}
            calc={calc}
            budget={budget}
            editState={editState}
            onGenerateShoppingList={handleGenerateShoppingList}
            onTogglePurchased={handleTogglePurchased}
            onToggleOwned={handleToggleOwned}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onRemoveItem={handleRemoveItem}
            onShare={handleShare}
          />
        )}

        {tab === 'estimate' && (
          <CostEstimateTab projectId={project.id} calc={calc} qualityTier={selectedQualityTier} region={selectedRegion} shoppingItems={shoppingItems} shoppingReady={shoppingLoadedProject === project.id} onPurchaseSnapshot={onPurchaseSnapshot}/>
        )}

        {tab === 'budget' && calc && pricedBudget && (
          <PricingSummary
            estimate={pricedBudget}
            jobId={job.id}
            qualityTier={selectedQualityTier}
            onSelectTier={setSelectedQualityTier}
            onOverrideLabor={handleOverrideLabor}
            onResetLabor={handleResetLabor}
            onOverrideMaterial={handleOverrideMaterial}
            onResetMaterial={handleResetMaterial}
          />
        )}

        {tab === 'budget' && !calc && (
          <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
            <Feather name="dollar-sign" size={32} color={Colors.textMuted} />
            <Txt w="medium" style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center' }}>
              {t('project.detail.budgetEmpty')}
            </Txt>
          </View>
        )}

        {tab === 'photos' && (
          <View style={{gap:12}}>
          {photoSaveFailed&&<Txt accessibilityRole="alert" style={{color:Colors.danger}}>{language==='pl'?'Nie udało się zapisać zdjęcia. Wybierz plik JPG, PNG lub WebP do 20 MB i spróbuj ponownie.':'The photo could not be saved. Choose a JPG, PNG or WebP file up to 20 MB and try again.'}</Txt>}
          <PhotosTab
            photos={photos}
            onAddPhotoMenu={handleAddPhotoMenu}
            onDeletePhoto={handleDeletePhoto}
          />
          </View>
        )}
      </ScrollView>
    </>
  );
}
