import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { getJobById } from '@/data/jobs';
import { estimateBudget } from '@/features/calculator/budget';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { STATUS_LABELS, PHOTO_TYPE_LABELS } from '@/utils/format';
import type { ShoppingItem, PhotoType, ChecklistItem } from '@/types/domain';
import {
  OverviewTab,
  MaterialsTab,
  ToolsTab,
  GuideTab,
  ShoppingTab,
  PhotosTab,
  diyAssessment,
  getEffectivePrice,
  getEffectiveQuantity,
  buildShareText,
  TAB_LABELS,
  CONTINGENCY_RATE,
} from '@/components/project';
import type { Tab } from '@/components/project';

export default function ProjectDetailScreen() {
  const { id, fromWizard } = useLocalSearchParams<{ id: string; fromWizard?: string }>();
  const insets = useSafeAreaInsets();
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

  const project = projects.find((p) => p.id === id);
  const job = project ? getJobById(project.jobId) : null;

  const loadAll = useCallback(async () => {
    if (!id) return;
    const [items, ph, cl, prog, acts] = await Promise.all([
      getProjectShoppingItems(id),
      getProjectPhotos(id),
      getProjectChecklist(id),
      getChecklistProgress(id),
      getProjectActivities(id),
    ]);
    setShoppingItems(items);
    setPhotos(ph);
    setChecklist(cl);
    setChecklistProgress(prog);
    setActivities(acts);
  }, [id, getProjectShoppingItems, getProjectPhotos, getProjectChecklist, getChecklistProgress, getProjectActivities]);

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
    await logActivity(project.id, 'checklist_completed', 'Wygenerowano listę zadań');
    await loadAll();
  };

  const handleToggleChecklist = async (item: ChecklistItem) => {
    await toggleChecklistItem(item.id, !item.completed);
    if (!item.completed) {
      await logActivity(project!.id, 'checklist_completed', `Ukończono: ${item.title}`);
    }
    await loadAll();
  };

  const handleStatusChange = async (status: 'planning' | 'in-progress' | 'completed') => {
    if (!project) return;
    await updateProject({ ...project, status });
    await logActivity(project.id, 'status_changed', `Status zmieniony na: ${STATUS_LABELS[status]}`);
    await loadAll();
  };

  const handleDelete = () => {
    Alert.alert(
      'Usuń projekt',
      `Usunąć projekt "${project?.name}"? Tej operacji nie można cofnąć.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => { await removeProject(id!); router.back(); },
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
    Alert.alert('Usuń', `Usunąć "${item.name}" z listy?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
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
    const text = buildShareText(project.name, materials, tools, totalMat, totalTool, contingency);
    try {
      await Share.share({ message: text, title: `Lista zakupów: ${project.name}` });
    } catch (_e) { /* ignore */ }
  };

  const handlePickPhoto = async (photoType: PhotoType) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Brak uprawnień', 'Zezwól na dostęp do galerii w ustawieniach.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      await addPhoto({ projectId: project!.id, uri: result.assets[0].uri, photoType });
      await loadAll();
    } catch (err) {
      console.error('[Photos] pick error:', err);
    }
  };

  const handleTakePhoto = async (photoType: PhotoType) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Brak uprawnień', 'Zezwól na dostęp do kamery w ustawieniach.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      await addPhoto({ projectId: project!.id, uri: result.assets[0].uri, photoType });
      await loadAll();
    } catch (err) {
      console.error('[Photos] camera error:', err);
    }
  };

  const handleDeletePhoto = (photo: import('@/types/domain').ProjectPhoto) => {
    Alert.alert('Usuń zdjęcie', 'Na pewno usunąć to zdjęcie?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => { await removePhoto(photo.id); await loadAll(); },
      },
    ]);
  };

  const handleAddPhotoMenu = (photoType: PhotoType) => {
    Alert.alert('Dodaj zdjęcie', `Zdjęcie: ${PHOTO_TYPE_LABELS[photoType]}`, [
      { text: 'Aparat', onPress: () => handleTakePhoto(photoType) },
      { text: 'Galeria', onPress: () => handlePickPhoto(photoType) },
      { text: 'Anuluj', style: 'cancel' },
    ]);
  };

  if (!project || !job) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: 16 }}>
        <Txt w="medium" style={{ fontSize: 16, color: Colors.textSecondary }}>
          Projekt nie znaleziony
        </Txt>
        <Button label="Wróć" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const calc = project.calculationResult;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;
  const nonOwnedItems = shoppingItems.filter((i) => !i.owned);
  const purchasedCount = nonOwnedItems.filter((i) => i.purchased).length;
  const isFirstTime = fromWizard === '1' && !welcomeDismissed;
  const diy = diyAssessment(job.difficulty, job.hireProfessionalRecommended);
  const budget = calc ? estimateBudget(job, calc.totalCost) : null;

  const TABS: Tab[] = ['overview', 'materials', 'tools', 'guide', 'shopping', 'photos'];

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
          headerBackTitle: 'Wróć',
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
              <TouchableOpacity onPress={handleDelete}>
                <Feather name="trash-2" size={20} color={Colors.danger} />
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
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: tab === t ? Colors.primary : 'transparent',
            }}
          >
            <Txt
              w={tab === t ? 'bold' : 'medium'}
              style={{
                fontSize: 10,
                color: tab === t ? Colors.primary : Colors.textMuted,
                textAlign: 'center',
              }}
            >
              {TAB_LABELS[t]}
              {t === 'shopping' && shoppingItems.length > 0 ? ` (${shoppingItems.length})` : ''}
              {t === 'photos' && photos.length > 0 ? ` (${photos.length})` : ''}
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
