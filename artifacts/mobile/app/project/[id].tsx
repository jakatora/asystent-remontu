import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getJobById } from '@/data/jobs';
import { estimateBudget } from '@/features/calculator/budget';
import { computePricedBudget } from '@/features/pricing';
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
  const { id, fromWizard } = useLocalSearchParams<{ id: string; fromWizard?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
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

  const [tab, setTab] = useState<Tab>('overview');
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');
  const [photos, setPhotos] = useState<import('@/types/domain').ProjectPhoto[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 0 });
  const [activities, setActivities] = useState<import('@/types/domain').ProjectActivity[]>([]);
  const [priceOverrides, setPriceOverrides] = useState<PriceOverride[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletedRef = useRef(false);

  const project = projects.find((p) => p.id === id);
  const job = project ? getJobById(project.jobId) : null;

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
      setPhotos(ph);
      setChecklist(cl);
      setChecklistProgress(prog);
      setActivities(acts);
      setPriceOverrides(ovr);
    } catch (e) {
      if (!deletedRef.current) console.warn('[ProjectDetail] loadAll error:', e);
    }
  }, [id, getProjectShoppingItems, getProjectPhotos, getProjectChecklist, getChecklistProgress, getProjectActivities, getProjectOverrides]);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

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
    await setItemOwned(item.id, !item.owned);
    await loadAll();
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    await toggleItem(item.id, !item.purchased);
    await loadAll();
  };

  const handleStartEdit = (item: ShoppingItem) => {
    setEditingId(item.id);
    setEditPrice(String(getEffectivePrice(item)));
    setEditQty(String(getEffectiveQuantity(item)));
  };

  const handleSaveEdit = async (item: ShoppingItem) => {
    const newPrice = parseFloat(editPrice);
    const newQty = parseFloat(editQty);
    if (isFinite(newPrice) && newPrice >= 0) await updateItemPrice(item.id, newPrice);
    if (isFinite(newQty) && newQty > 0) await updateItemQuantity(item.id, newQty);
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
      await addPhoto({ projectId: project.id, uri: result.assets[0].uri, photoType });
      await loadAll();
    } catch (err) {
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
  const budget = calc ? estimateBudget(job, calc.totalCost) : null;

  const TABS: Tab[] = ['overview', 'materials', 'tools', 'guide', 'shopping', 'budget', 'photos'];

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

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        {TABS.map((tabId) => (
          <TouchableOpacity
            key={tabId}
            onPress={() => setTab(tabId)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: tab === tabId ? Colors.primary : 'transparent',
            }}
          >
            <Txt
              w={tab === tabId ? 'bold' : 'medium'}
              style={{
                fontSize: 10,
                color: tab === tabId ? Colors.primary : Colors.textMuted,
                textAlign: 'center',
              }}
            >
              {t(TAB_LABEL_KEYS[tabId])}
              {tabId === 'shopping' && shoppingItems.length > 0 ? ` (${shoppingItems.length})` : ''}
              {tabId === 'photos' && photos.length > 0 ? ` (${photos.length})` : ''}
            </Txt>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
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
          <PhotosTab
            photos={photos}
            onAddPhotoMenu={handleAddPhotoMenu}
            onDeletePhoto={handleDeletePhoto}
          />
        )}
      </ScrollView>
    </>
  );
}
