import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Share,
  Image,
} from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { getJobById } from '@/data/jobs';
import type {
  ShoppingItem,
  ShoppingTier,
  ToolItem,
  ProjectPhoto,
  PhotoType,
  ChecklistItem,
  ProjectActivity,
} from '@/types/domain';
import { formatCurrency } from '@/utils/calculator';
import { timeAgo, ACTIVITY_ICONS, PHOTO_TYPE_LABELS, PHOTO_TYPE_COLORS, STATUS_LABELS, formatDuration } from '@/utils/format';
import { estimateBudget } from '@/features/calculator/budget';
import { WarningBanner } from '@/components/ui/WarningBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';

type Tab = 'overview' | 'materials' | 'tools' | 'guide' | 'shopping' | 'photos';

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Przegląd',
  materials: 'Materiały',
  tools: 'Narzędzia',
  guide: 'Instrukcja',
  shopping: 'Zakupy',
  photos: 'Zdjęcia',
};

const STATUS_COLORS = {
  planning:      { active: Colors.info,    bg: Colors.infoBg,    border: '#BFDBFE' },
  'in-progress': { active: Colors.warning, bg: Colors.warningBg, border: '#FDE68A' },
  completed:     { active: Colors.success, bg: Colors.successBg, border: '#BBF7D0' },
};

const TIER_META: Record<ShoppingTier, { label: string; color: string; bg: string }> = {
  economy:  { label: 'Eko',      color: '#059669', bg: '#ECFDF5' },
  standard: { label: 'Standard', color: Colors.info, bg: Colors.infoBg },
  premium:  { label: 'Premium',  color: '#7C3AED', bg: '#F5F3FF' },
};

const CONTINGENCY_RATE = 0.1;


function diyAssessment(difficulty: string, hirePro: boolean) {
  if (hirePro || difficulty === 'hard') {
    return {
      level: 'hire' as const,
      color: Colors.danger,
      bg: Colors.dangerBg,
      icon: 'alert-triangle',
      headline: 'Zdecydowanie zatrudnij fachowca',
      details: 'Ta praca wymaga specjalistycznej wiedzy i sprzętu. Błędy mogą być kosztowne lub niebezpieczne.',
    };
  }
  if (difficulty === 'medium') {
    return {
      level: 'moderate' as const,
      color: Colors.warning,
      bg: Colors.warningBg,
      icon: 'alert-circle',
      headline: 'Możliwe samodzielnie, ale wymaga uwagi',
      details: 'Możesz zrobić to sam, ale postępuj zgodnie z instrukcją krok po kroku. W razie wątpliwości skonsultuj się ze sprzedawcą w sklepie budowlanym.',
    };
  }
  return {
    level: 'easy' as const,
    color: Colors.success,
    bg: Colors.successBg,
    icon: 'check-circle',
    headline: 'Świetnie nadaje się do samodzielnego wykonania',
    details: 'Ta praca jest dostępna dla amatorów. Wystarczy dokładność i postępowanie zgodnie z naszą instrukcją.',
  };
}

function ToolCard({ tool }: { tool: ToolItem }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: tool.required ? Colors.primaryBg : Colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Feather
          name={(tool.icon as any) ?? 'tool'}
          size={18}
          color={tool.required ? Colors.primary : Colors.textSecondary}
        />
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
            {tool.name}
          </Txt>
          {!tool.required && (
            <View style={{ paddingHorizontal: 7, paddingVertical: 2, backgroundColor: Colors.surfaceAlt, borderRadius: 6 }}>
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>opcjonalne</Txt>
            </View>
          )}
          {tool.rentable && (
            <View style={{ paddingHorizontal: 7, paddingVertical: 2, backgroundColor: Colors.infoBg, borderRadius: 6 }}>
              <Txt style={{ fontSize: 11, color: Colors.info }}>do wynajęcia</Txt>
            </View>
          )}
        </View>

        {tool.notes && (
          <Txt style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 17 }}>
            {tool.notes}
          </Txt>
        )}

        {(tool.estimatedBuyCostPLN || tool.estimatedRentCostPLN) ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
            {tool.estimatedBuyCostPLN && (
              <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
                Kup: ~{formatCurrency(tool.estimatedBuyCostPLN)}
              </Txt>
            )}
            {tool.estimatedRentCostPLN && (
              <Txt style={{ fontSize: 12, color: Colors.info }}>
                Wynajmij: ~{formatCurrency(tool.estimatedRentCostPLN)}
              </Txt>
            )}
          </View>
        ) : null}

        {tool.safetyNote && (
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              backgroundColor: Colors.warningBg,
              borderRadius: 8,
              padding: 8,
              alignItems: 'flex-start',
              marginTop: 4,
            }}
          >
            <Feather name="alert-triangle" size={12} color={Colors.warning} style={{ marginTop: 1 }} />
            <Txt style={{ flex: 1, fontSize: 11, color: '#92400e', lineHeight: 15 }}>
              {tool.safetyNote}
            </Txt>
          </View>
        )}
      </View>
    </View>
  );
}

function TierBadge({ tier }: { tier: ShoppingTier }) {
  const meta = TIER_META[tier];
  return (
    <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: meta.bg, borderRadius: 6 }}>
      <Txt style={{ fontSize: 10, color: meta.color }} w="semibold">{meta.label}</Txt>
    </View>
  );
}

function SummaryRow({ icon, label, value, valueColor, bold }: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name={icon as any} size={16} color={Colors.textSecondary} />
        <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>{label}</Txt>
      </View>
      <Txt w={bold ? 'bold' : 'semibold'} style={{ fontSize: bold ? 16 : 14, color: valueColor ?? Colors.text }}>
        {value}
      </Txt>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.border }} />;
}

function getEffectivePrice(item: ShoppingItem): number {
  return item.customPrice ?? item.estimatedPrice;
}

function getEffectiveQuantity(item: ShoppingItem): number {
  return item.customQuantity ?? item.quantity;
}

function buildShareText(
  projectName: string,
  materials: ShoppingItem[],
  tools: ShoppingItem[],
  totalMaterials: number,
  totalTools: number,
  contingency: number
): string {
  let text = `Lista zakupów: ${projectName}\n\n`;
  if (materials.length > 0) {
    text += 'MATERIAŁY:\n';
    for (const item of materials) {
      const check = item.purchased ? '[x]' : (item.owned ? '[mam]' : '[ ]');
      const qty = getEffectiveQuantity(item);
      const price = getEffectivePrice(item);
      text += `${check} ${item.name} — ${qty.toFixed(1)} ${item.unit} — ${formatCurrency(price)}\n`;
    }
    text += `Razem materiały: ${formatCurrency(totalMaterials)}\n\n`;
  }
  if (tools.length > 0) {
    text += 'NARZĘDZIA:\n';
    for (const item of tools) {
      const check = item.purchased ? '[x]' : (item.owned ? '[mam]' : '[ ]');
      text += `${check} ${item.name} — ${formatCurrency(getEffectivePrice(item))}\n`;
    }
    text += `Razem narzędzia: ${formatCurrency(totalTools)}\n\n`;
  }
  const total = totalMaterials + totalTools;
  text += `SUMA: ${formatCurrency(total)}\n`;
  text += `Rezerwa (${Math.round(CONTINGENCY_RATE * 100)}%): ${formatCurrency(contingency)}\n`;
  text += `Łącznie z rezerwą: ${formatCurrency(total + contingency)}\n`;
  return text;
}


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
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 0 });
  const [activities, setActivities] = useState<ProjectActivity[]>([]);

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
    if (isFinite(newPrice) && newPrice >= 0) {
      await updateItemPrice(item.id, newPrice);
    }
    if (isFinite(newQty) && newQty > 0) {
      await updateItemQuantity(item.id, newQty);
    }
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
    const totalMat = materials.reduce((s, i) => s + (i.owned ? 0 : getEffectivePrice(i)), 0);
    const totalTool = tools.reduce((s, i) => s + (i.owned ? 0 : getEffectivePrice(i)), 0);
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
      await addPhoto({
        projectId: project!.id,
        uri: result.assets[0].uri,
        photoType,
      });
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
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      await addPhoto({
        projectId: project!.id,
        uri: result.assets[0].uri,
        photoType,
      });
      await loadAll();
    } catch (err) {
      console.error('[Photos] camera error:', err);
    }
  };

  const handleDeletePhoto = (photo: ProjectPhoto) => {
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

  const requiredTools = job.tools.filter((t) => t.required);
  const optionalTools = job.tools.filter((t) => !t.required);

  const diy = diyAssessment(job.difficulty, job.hireProfessionalRecommended);

  const proLaborMultiplier = 1.8;
  const proEstimate = calc ? calc.totalCost * (1 + proLaborMultiplier) : null;

  const materialItems = shoppingItems.filter((i) => i.itemType === 'material');
  const toolItems = shoppingItems.filter((i) => i.itemType === 'tool');
  const toBuyMaterials = materialItems.filter((i) => !i.owned);
  const toBuyTools = toolItems.filter((i) => !i.owned);
  const ownedItems = shoppingItems.filter((i) => i.owned);

  const totalMaterials = toBuyMaterials.reduce((s, i) => s + getEffectivePrice(i), 0);
  const totalTools = toBuyTools.reduce((s, i) => s + getEffectivePrice(i), 0);
  const totalAll = totalMaterials + totalTools;
  const contingency = totalAll * CONTINGENCY_RATE;
  const grandTotal = totalAll + contingency;

  const budget = calc ? estimateBudget(job, calc.totalCost) : null;

  const TABS: Tab[] = ['overview', 'materials', 'tools', 'guide', 'shopping', 'photos'];

  const roomArea = project.roomWidth && project.roomLength
    ? (project.roomWidth * project.roomLength).toFixed(1)
    : null;

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

        {/* ═══ OVERVIEW TAB ═══ */}
        {tab === 'overview' && (
          <View style={{ gap: 16 }}>
            {isFirstTime && (
              <View
                style={{
                  backgroundColor: Colors.primaryBg,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: Colors.primary + '50',
                  padding: 16,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: Colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="zap" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt w="bold" style={{ fontSize: 16, color: Colors.primary }}>
                      Twój projekt jest gotowy!
                    </Txt>
                    <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
                      Obliczyliśmy materiały, koszt i czas realizacji.
                    </Txt>
                  </View>
                </View>
                <Txt style={{ fontSize: 13, color: Colors.text, lineHeight: 19 }}>
                  Przejrzyj zakładki powyżej: <Txt w="semibold">Materiały</Txt> — co kupić,{' '}
                  <Txt w="semibold">Narzędzia</Txt> — czym pracować,{' '}
                  <Txt w="semibold">Instrukcja</Txt> — jak to zrobić krok po kroku.
                </Txt>
                <TouchableOpacity
                  onPress={() => setWelcomeDismissed(true)}
                  style={{ alignSelf: 'flex-end' }}
                >
                  <Txt style={{ fontSize: 13, color: Colors.primary }}>Zamknij</Txt>
                </TouchableOpacity>
              </View>
            )}

            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text }}>{project.name}</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                {job.name}
              </Txt>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['planning', 'in-progress', 'completed'] as const).map((s) => {
                const labels = { planning: 'Planowanie', 'in-progress': 'W trakcie', completed: 'Ukończony' };
                const cfg = STATUS_COLORS[s];
                const isActive = project.status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleStatusChange(s)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: isActive ? cfg.active : Colors.border,
                      backgroundColor: isActive ? cfg.bg : Colors.surface,
                    }}
                  >
                    <Txt
                      w="semibold"
                      style={{ fontSize: 12, color: isActive ? cfg.active : Colors.textSecondary }}
                    >
                      {labels[s]}
                    </Txt>
                  </TouchableOpacity>
                );
              })}
            </View>

            {(project.roomName || roomArea) && (
              <View
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 14,
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="home" size={16} color={Colors.info} />
                  <Txt w="bold" style={{ fontSize: 15, color: Colors.text }}>
                    {project.roomName || 'Pomieszczenie'}
                  </Txt>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {roomArea && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="grid" size={13} color={Colors.textMuted} />
                      <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{roomArea} m²</Txt>
                    </View>
                  )}
                  {project.roomWidth && project.roomLength && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="maximize-2" size={13} color={Colors.textMuted} />
                      <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>
                        {project.roomWidth} × {project.roomLength} m
                      </Txt>
                    </View>
                  )}
                  {project.roomHeight && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="arrow-up" size={13} color={Colors.textMuted} />
                      <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>
                        wys. {project.roomHeight} m
                      </Txt>
                    </View>
                  )}
                </View>
              </View>
            )}

            {checklistProgress.total > 0 && (
              <TouchableOpacity
                onPress={() => setTab('guide')}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 14,
                  gap: 8,
                }}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="check-square" size={16} color={Colors.success} />
                    <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>Postęp prac</Txt>
                  </View>
                  <Txt w="bold" style={{ fontSize: 14, color: Colors.success }}>
                    {checklistProgress.completed}/{checklistProgress.total}
                  </Txt>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: Colors.border, overflow: 'hidden' }}>
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: Colors.success,
                      width: `${checklistProgress.total > 0 ? (checklistProgress.completed / checklistProgress.total) * 100 : 0}%`,
                    }}
                  />
                </View>
              </TouchableOpacity>
            )}

            {calc && (
              <View
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  overflow: 'hidden',
                }}
              >
                <SummaryRow icon="tool" label="Materiały (samemu)" value={formatCurrency(calc.totalCost)} bold />
                {proEstimate && (
                  <>
                    <Divider />
                    <SummaryRow icon="users" label="Z fachowcem (szacunek)" value={`~${formatCurrency(proEstimate)}`} valueColor={Colors.textSecondary} />
                  </>
                )}
                <Divider />
                <SummaryRow
                  icon="clock"
                  label="Czas realizacji"
                  value={`${calc.totalDays} ${calc.totalDays === 1 ? 'dzień' : 'dni'}`}
                  bold
                />
                {shoppingItems.length > 0 && (
                  <>
                    <Divider />
                    <SummaryRow
                      icon="shopping-cart"
                      label="Zakupy"
                      value={`${purchasedCount}/${nonOwnedItems.length} kupionych`}
                      bold
                    />
                  </>
                )}
              </View>
            )}

            {calc?.warnings && calc.warnings.length > 0 && (
              <WarningBanner warnings={calc.warnings} />
            )}

            <View
              style={{
                backgroundColor: diy.bg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: diy.color + '40',
                padding: 14,
                gap: 8,
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              <Feather name={diy.icon as any} size={20} color={diy.color} style={{ marginTop: 1 }} />
              <View style={{ flex: 1, gap: 4 }}>
                <Txt w="bold" style={{ fontSize: 14, color: diy.color }}>
                  {diy.headline}
                </Txt>
                <Txt style={{ fontSize: 13, color: Colors.text, lineHeight: 18 }}>
                  {diy.details}
                </Txt>
              </View>
            </View>

            {job.hireProfessionalRecommended && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: Colors.dangerBg,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#FECACA',
                }}
                onPress={() => router.push({ pathname: '/hire-pro', params: { jobId: job.id } })}
                activeOpacity={0.8}
              >
                <Feather name="phone" size={18} color={Colors.danger} />
                <Txt w="medium" style={{ flex: 1, fontSize: 14, color: Colors.danger }}>
                  Jak znaleźć dobrego fachowca?
                </Txt>
                <Feather name="chevron-right" size={16} color={Colors.danger} />
              </TouchableOpacity>
            )}

            {project.notes && (
              <View
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 14,
                  gap: 6,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="message-square" size={14} color={Colors.textSecondary} />
                  <Txt w="semibold" style={{ fontSize: 13, color: Colors.textSecondary }}>Notatki</Txt>
                </View>
                <Txt style={{ fontSize: 14, color: Colors.text, lineHeight: 20 }}>{project.notes}</Txt>
              </View>
            )}

            {activities.length > 0 && (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="activity" size={14} color={Colors.textSecondary} />
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.textSecondary }}>
                    Ostatnia aktywność
                  </Txt>
                </View>
                {activities.slice(0, 5).map((a) => (
                  <View
                    key={a.id}
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      alignItems: 'center',
                      paddingVertical: 4,
                    }}
                  >
                    <Feather
                      name={(ACTIVITY_ICONS[a.actionType] ?? 'circle') as any}
                      size={14}
                      color={Colors.textMuted}
                    />
                    <View style={{ flex: 1 }}>
                      <Txt style={{ fontSize: 13, color: Colors.text }}>{a.description}</Txt>
                    </View>
                    <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{timeAgo(a.createdAt)}</Txt>
                  </View>
                ))}
              </View>
            )}

            <View style={{ gap: 10 }}>
              <Button
                label="Otwórz pełny opis pracy"
                variant="outline"
                onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
                fullWidth
              />
              {shoppingItems.length === 0 && calc && (
                <Button
                  label="Generuj listę zakupów"
                  onPress={handleGenerateShoppingList}
                  fullWidth
                  icon={<Feather name="shopping-cart" size={16} color="#fff" />}
                />
              )}
              {checklist.length === 0 && (
                <Button
                  label="Generuj listę zadań"
                  variant="outline"
                  onPress={handleGenerateChecklist}
                  fullWidth
                  icon={<Feather name="check-square" size={16} color={Colors.primary} />}
                />
              )}
            </View>
          </View>
        )}

        {/* ═══ MATERIALS TAB ═══ */}
        {tab === 'materials' && calc && (
          <View style={{ gap: 12 }}>
            <Txt w="bold" style={{ fontSize: 18, color: Colors.text, marginBottom: 4 }}>
              Lista materiałów
            </Txt>
            <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>
              Ilości uwzględniają 10% zapasu na straty i docięcia.
            </Txt>

            {calc.materials.map((m, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  gap: 10,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Txt w="medium" style={{ fontSize: 14, color: Colors.text }}>
                    {m.material.name}
                  </Txt>
                  {m.material.notes && (
                    <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                      {m.material.notes}
                    </Txt>
                  )}
                </View>
                <View style={{ alignItems: 'center', minWidth: 52 }}>
                  <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
                    {m.quantity.toFixed(m.quantity < 10 ? 1 : 0)}
                  </Txt>
                  <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
                    {m.material.unit}
                  </Txt>
                </View>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.primary, minWidth: 70, textAlign: 'right' }}>
                  {formatCurrency(m.cost)}
                </Txt>
              </View>
            ))}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: Colors.primaryBg,
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: Colors.primaryLight,
              }}
            >
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.primaryDark }}>
                Łączny koszt materiałów
              </Txt>
              <Txt w="bold" style={{ fontSize: 20, color: Colors.primary }}>
                {formatCurrency(calc.totalCost)}
              </Txt>
            </View>

            <Button
              label={shoppingItems.length > 0 ? 'Odśwież listę zakupów' : 'Generuj listę zakupów'}
              onPress={handleGenerateShoppingList}
              fullWidth
              icon={<Feather name="shopping-cart" size={16} color="#fff" />}
            />
          </View>
        )}

        {/* ═══ TOOLS TAB ═══ */}
        {tab === 'tools' && (
          <View style={{ gap: 16 }}>
            <View>
              <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
                Potrzebne narzędzia
              </Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                Upewnij się, że masz wszystkie obowiązkowe narzędzia przed rozpoczęciem.
              </Txt>
            </View>

            <View
              style={{
                backgroundColor: diy.bg,
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Feather name={diy.icon as any} size={18} color={diy.color} />
              <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: diy.color }}>
                {diy.headline}
              </Txt>
            </View>

            {requiredTools.length > 0 && (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary }} />
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
                    Obowiązkowe ({requiredTools.length})
                  </Txt>
                </View>
                {requiredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </View>
            )}

            {optionalTools.length > 0 && (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border }} />
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.textSecondary }}>
                    Opcjonalne ({optionalTools.length})
                  </Txt>
                </View>
                {optionalTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </View>
            )}

            {job.tools.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
                <Feather name="tool" size={32} color={Colors.textMuted} />
                <Txt w="semibold" style={{ fontSize: 16, color: Colors.textSecondary }}>
                  Brak specjalnych narzędzi
                </Txt>
                <Txt style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center' }}>
                  Ta praca nie wymaga specjalistycznego sprzętu.
                </Txt>
              </View>
            )}

            {job.tools.some((t) => t.rentable) && (
              <View
                style={{
                  backgroundColor: Colors.infoBg,
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <Feather name="info" size={16} color={Colors.info} style={{ marginTop: 1 }} />
                <Txt style={{ flex: 1, fontSize: 13, color: '#1e40af', lineHeight: 18 }}>
                  Narzędzia oznaczone "do wynajęcia" możesz wypożyczyć w sklepach budowlanych
                  (np. Leroy Merlin, Castorama). Często taniej niż kupno.
                </Txt>
              </View>
            )}
          </View>
        )}

        {/* ═══ GUIDE / CHECKLIST TAB ═══ */}
        {tab === 'guide' && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
                  {checklist.length > 0 ? 'Lista zadań' : 'Instrukcja krok po kroku'}
                </Txt>
                <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                  {checklist.length > 0
                    ? `${checklistProgress.completed} z ${checklistProgress.total} ukończonych`
                    : 'Wykonuj czynności w podanej kolejności.'}
                </Txt>
              </View>
              {checklist.length === 0 && (
                <TouchableOpacity
                  onPress={handleGenerateChecklist}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: Colors.primaryBg,
                    borderRadius: 10,
                  }}
                >
                  <Txt w="medium" style={{ fontSize: 12, color: Colors.primary }}>
                    Generuj listę
                  </Txt>
                </TouchableOpacity>
              )}
            </View>

            {checklist.length > 0 && (
              <View style={{ height: 6, borderRadius: 3, backgroundColor: Colors.border, overflow: 'hidden' }}>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: Colors.success,
                    width: `${checklistProgress.total > 0 ? (checklistProgress.completed / checklistProgress.total) * 100 : 0}%`,
                  }}
                />
              </View>
            )}

            {checklist.length > 0
              ? checklist.map((item) => {
                  const step = job.instructions.find((s) => s.step === item.stepIndex);
                  const dur = step ? formatDuration(step.durationMin) : null;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleToggleChecklist(item)}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: 'row',
                        gap: 12,
                        backgroundColor: item.completed ? Colors.successBg : Colors.surface,
                        borderRadius: 16,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: item.completed ? '#BBF7D0' : Colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          borderWidth: 2,
                          borderColor: item.completed ? Colors.success : Colors.border,
                          backgroundColor: item.completed ? Colors.success : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {item.completed ? (
                          <Feather name="check" size={14} color="#fff" />
                        ) : (
                          <Txt w="bold" style={{ fontSize: 12, color: Colors.textMuted }}>{item.stepIndex}</Txt>
                        )}
                      </View>

                      <View style={{ flex: 1, gap: 4 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <Txt
                            w="bold"
                            style={{
                              flex: 1,
                              fontSize: 15,
                              color: item.completed ? Colors.textSecondary : Colors.text,
                              textDecorationLine: item.completed ? 'line-through' : 'none',
                            }}
                          >
                            {item.title}
                          </Txt>
                          {dur && (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: Colors.surfaceAlt,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                              }}
                            >
                              <Feather name="clock" size={11} color={Colors.textMuted} />
                              <Txt w="medium" style={{ fontSize: 11, color: Colors.textMuted }}>~{dur}</Txt>
                            </View>
                          )}
                        </View>

                        {item.description && !item.completed && (
                          <Txt style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }}>
                            {item.description}
                          </Txt>
                        )}

                        {step?.tip && !item.completed && (
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 8,
                              backgroundColor: Colors.warningBg,
                              borderRadius: 10,
                              padding: 10,
                              alignItems: 'flex-start',
                            }}
                          >
                            <Feather name="zap" size={13} color={Colors.warning} style={{ marginTop: 1 }} />
                            <Txt style={{ flex: 1, fontSize: 13, lineHeight: 18, color: '#92400e' }}>
                              {step.tip}
                            </Txt>
                          </View>
                        )}

                        {step?.warning && !item.completed && (
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 8,
                              backgroundColor: Colors.dangerBg,
                              borderRadius: 10,
                              padding: 10,
                              alignItems: 'flex-start',
                            }}
                          >
                            <Feather name="alert-triangle" size={13} color={Colors.danger} style={{ marginTop: 1 }} />
                            <Txt style={{ flex: 1, fontSize: 13, lineHeight: 18, color: '#991b1b' }}>
                              {step.warning}
                            </Txt>
                          </View>
                        )}

                        {item.completed && item.completedAt && (
                          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
                            Ukończono {timeAgo(item.completedAt)}
                          </Txt>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              : job.instructions.map((step) => {
                  const dur = formatDuration(step.durationMin);
                  return (
                    <View
                      key={step.step}
                      style={{
                        flexDirection: 'row',
                        gap: 14,
                        backgroundColor: Colors.surface,
                        borderRadius: 16,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: Colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: Colors.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Txt w="bold" style={{ fontSize: 14, color: '#fff' }}>{step.step}</Txt>
                      </View>

                      <View style={{ flex: 1, gap: 6 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <Txt w="bold" style={{ flex: 1, fontSize: 15, color: Colors.text }}>
                            {step.title}
                          </Txt>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: Colors.surfaceAlt,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 8,
                            }}
                          >
                            <Feather name="clock" size={11} color={Colors.textMuted} />
                            <Txt w="medium" style={{ fontSize: 11, color: Colors.textMuted }}>~{dur}</Txt>
                          </View>
                        </View>

                        <Txt style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }}>
                          {step.description}
                        </Txt>

                        {step.tip && (
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 8,
                              backgroundColor: Colors.warningBg,
                              borderRadius: 10,
                              padding: 10,
                              alignItems: 'flex-start',
                            }}
                          >
                            <Feather name="zap" size={13} color={Colors.warning} style={{ marginTop: 1 }} />
                            <Txt style={{ flex: 1, fontSize: 13, lineHeight: 18, color: '#92400e' }}>
                              {step.tip}
                            </Txt>
                          </View>
                        )}

                        {step.warning && (
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 8,
                              backgroundColor: Colors.dangerBg,
                              borderRadius: 10,
                              padding: 10,
                              alignItems: 'flex-start',
                            }}
                          >
                            <Feather name="alert-triangle" size={13} color={Colors.danger} style={{ marginTop: 1 }} />
                            <Txt style={{ flex: 1, fontSize: 13, lineHeight: 18, color: '#991b1b' }}>
                              {step.warning}
                            </Txt>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
          </View>
        )}

        {/* ═══ SHOPPING TAB ═══ */}
        {tab === 'shopping' && (
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
                Lista zakupów
              </Txt>
              {shoppingItems.length > 0 && (
                <TouchableOpacity
                  onPress={handleShare}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: Colors.surfaceAlt,
                    borderRadius: 10,
                  }}
                >
                  <Feather name="share" size={14} color={Colors.textSecondary} />
                  <Txt w="medium" style={{ fontSize: 12, color: Colors.textSecondary }}>Udostępnij</Txt>
                </TouchableOpacity>
              )}
            </View>

            {shoppingItems.length === 0 ? (
              <View style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
                <Feather name="shopping-cart" size={40} color={Colors.textMuted} />
                <Txt w="semibold" style={{ fontSize: 18, color: Colors.textSecondary }}>
                  Brak listy zakupów
                </Txt>
                <Txt style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center', maxWidth: 260 }}>
                  Wygeneruj listę zakupów na podstawie obliczonych materiałów i narzędzi.
                </Txt>
                <Button
                  label="Generuj listę zakupów"
                  onPress={handleGenerateShoppingList}
                  icon={<Feather name="shopping-cart" size={16} color="#fff" />}
                />
              </View>
            ) : (
              <>
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>Kupione</Txt>
                    <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>
                      {purchasedCount} z {nonOwnedItems.length}
                    </Txt>
                  </View>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: Colors.success,
                        width: `${nonOwnedItems.length > 0 ? (purchasedCount / nonOwnedItems.length) * 100 : 100}%`,
                      }}
                    />
                  </View>
                </View>

                {toBuyMaterials.length > 0 && (
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Feather name="package" size={16} color={Colors.primary} />
                      <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
                        Materiały ({toBuyMaterials.length})
                      </Txt>
                    </View>
                    {toBuyMaterials.map((item) => (
                      <ShoppingItemCard
                        key={item.id}
                        item={item}
                        editing={editingId === item.id}
                        editPrice={editPrice}
                        editQty={editQty}
                        onEditPrice={setEditPrice}
                        onEditQty={setEditQty}
                        onTogglePurchased={() => handleTogglePurchased(item)}
                        onToggleOwned={() => handleToggleOwned(item)}
                        onStartEdit={() => handleStartEdit(item)}
                        onSaveEdit={() => handleSaveEdit(item)}
                        onCancelEdit={() => setEditingId(null)}
                        onRemove={() => handleRemoveItem(item)}
                      />
                    ))}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 6 }}>
                      <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>Materiały razem</Txt>
                      <Txt w="bold" style={{ fontSize: 15, color: Colors.text }}>{formatCurrency(totalMaterials)}</Txt>
                    </View>
                  </View>
                )}

                {toBuyTools.length > 0 && (
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Feather name="tool" size={16} color={Colors.info} />
                      <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
                        Narzędzia ({toBuyTools.length})
                      </Txt>
                    </View>
                    {toBuyTools.map((item) => (
                      <ShoppingItemCard
                        key={item.id}
                        item={item}
                        editing={editingId === item.id}
                        editPrice={editPrice}
                        editQty={editQty}
                        onEditPrice={setEditPrice}
                        onEditQty={setEditQty}
                        onTogglePurchased={() => handleTogglePurchased(item)}
                        onToggleOwned={() => handleToggleOwned(item)}
                        onStartEdit={() => handleStartEdit(item)}
                        onSaveEdit={() => handleSaveEdit(item)}
                        onCancelEdit={() => setEditingId(null)}
                        onRemove={() => handleRemoveItem(item)}
                      />
                    ))}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 6 }}>
                      <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>Narzędzia razem</Txt>
                      <Txt w="bold" style={{ fontSize: 15, color: Colors.info }}>{formatCurrency(totalTools)}</Txt>
                    </View>
                  </View>
                )}

                {ownedItems.length > 0 && (
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Feather name="home" size={16} color={Colors.success} />
                      <Txt w="semibold" style={{ fontSize: 15, color: Colors.textSecondary }}>
                        Mam już ({ownedItems.length})
                      </Txt>
                    </View>
                    {ownedItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          backgroundColor: Colors.successBg,
                          borderRadius: 12,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: '#BBF7D0',
                          opacity: 0.8,
                        }}
                        onPress={() => handleToggleOwned(item)}
                        activeOpacity={0.7}
                      >
                        <Feather name="check-circle" size={20} color={Colors.success} />
                        <View style={{ flex: 1 }}>
                          <Txt w="medium" style={{ fontSize: 14, color: Colors.textSecondary }}>{item.name}</Txt>
                          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>Dotknij, aby przywrócić do listy</Txt>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Feather name={item.itemType === 'tool' ? 'tool' : 'package'} size={12} color={Colors.textMuted} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    overflow: 'hidden',
                    marginTop: 4,
                  }}
                >
                  <View style={{ padding: 14, backgroundColor: Colors.primaryBg }}>
                    <Txt w="bold" style={{ fontSize: 15, color: Colors.primaryDark }}>Podsumowanie kosztów</Txt>
                  </View>
                  <SummaryRow icon="package" label="Materiały" value={formatCurrency(totalMaterials)} />
                  <Divider />
                  <SummaryRow icon="tool" label="Narzędzia" value={formatCurrency(totalTools)} valueColor={Colors.info} />
                  <Divider />
                  <SummaryRow
                    icon="shield"
                    label={`Rezerwa (${Math.round(CONTINGENCY_RATE * 100)}%)`}
                    value={`+${formatCurrency(contingency)}`}
                    valueColor={Colors.warning}
                  />
                  <Divider />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: Colors.primaryBg }}>
                    <Txt w="bold" style={{ fontSize: 16, color: Colors.primaryDark }}>Łącznie z rezerwą</Txt>
                    <Txt w="bold" style={{ fontSize: 20, color: Colors.primary }}>{formatCurrency(grandTotal)}</Txt>
                  </View>
                </View>

                {budget && (
                  <View
                    style={{
                      backgroundColor: Colors.surface,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      overflow: 'hidden',
                    }}
                  >
                    <View style={{ padding: 14, backgroundColor: Colors.infoBg }}>
                      <Txt w="bold" style={{ fontSize: 15, color: '#1e40af' }}>DIY vs Fachowiec</Txt>
                    </View>
                    <View style={{ padding: 14, gap: 10 }}>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: Colors.successBg,
                            borderRadius: 12,
                            padding: 12,
                            alignItems: 'center',
                            gap: 4,
                            borderWidth: 1,
                            borderColor: '#BBF7D0',
                          }}
                        >
                          <Feather name="user" size={20} color={Colors.success} />
                          <Txt w="semibold" style={{ fontSize: 12, color: Colors.success }}>Samodzielnie</Txt>
                          <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>{formatCurrency(grandTotal)}</Txt>
                          <Txt style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center' }}>materiały + narzędzia + rezerwa</Txt>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: Colors.warningBg,
                            borderRadius: 12,
                            padding: 12,
                            alignItems: 'center',
                            gap: 4,
                            borderWidth: 1,
                            borderColor: '#FDE68A',
                          }}
                        >
                          <Feather name="users" size={20} color={Colors.warning} />
                          <Txt w="semibold" style={{ fontSize: 12, color: Colors.warning }}>Z fachowcem</Txt>
                          <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
                            {formatCurrency(budget.totalMin)}–{formatCurrency(budget.totalMax)}
                          </Txt>
                          <Txt style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center' }}>materiały + robocizna</Txt>
                        </View>
                      </View>
                      {grandTotal < budget.totalMin && (
                        <View style={{ flexDirection: 'row', gap: 8, backgroundColor: Colors.successBg, borderRadius: 10, padding: 10, alignItems: 'flex-start' }}>
                          <Feather name="trending-down" size={14} color={Colors.success} style={{ marginTop: 1 }} />
                          <Txt style={{ flex: 1, fontSize: 13, color: '#065f46', lineHeight: 18 }}>
                            Oszczędzasz ok. {formatCurrency(budget.totalMin - grandTotal)} robiąc to samodzielnie!
                          </Txt>
                        </View>
                      )}
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', padding: 4 }}>
                        <Feather name="clock" size={14} color={Colors.textMuted} style={{ marginTop: 1 }} />
                        <Txt style={{ flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 17 }}>
                          Szacowany czas pracy samodzielnej: {calc?.totalDays ?? job.estimatedDays}{' '}
                          {(calc?.totalDays ?? job.estimatedDays) === 1 ? 'dzień' : 'dni'}
                        </Txt>
                      </View>
                    </View>
                  </View>
                )}

                <View style={{ gap: 10, marginTop: 4 }}>
                  <Button
                    label="Odśwież listę zakupów"
                    variant="outline"
                    onPress={handleGenerateShoppingList}
                    fullWidth
                  />
                </View>
              </>
            )}
          </View>
        )}

        {/* ═══ PHOTOS TAB ═══ */}
        {tab === 'photos' && (
          <View style={{ gap: 16 }}>
            <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
              Dokumentacja zdjęciowa
            </Txt>
            <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>
              Dodaj zdjęcia przed, w trakcie i po remoncie.
            </Txt>

            {(['before', 'during', 'after'] as PhotoType[]).map((type) => {
              const typePhotos = photos.filter((p) => p.photoType === type);
              const tc = PHOTO_TYPE_COLORS[type];
              return (
                <View key={type} style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: tc.bg, borderRadius: 8 }}>
                        <Txt w="semibold" style={{ fontSize: 13, color: tc.color }}>
                          {PHOTO_TYPE_LABELS[type]}
                        </Txt>
                      </View>
                      <Txt style={{ fontSize: 13, color: Colors.textMuted }}>
                        ({typePhotos.length})
                      </Txt>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddPhotoMenu(type)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        backgroundColor: Colors.surfaceAlt,
                        borderRadius: 8,
                      }}
                    >
                      <Feather name="plus" size={14} color={Colors.primary} />
                      <Txt w="medium" style={{ fontSize: 12, color: Colors.primary }}>Dodaj</Txt>
                    </TouchableOpacity>
                  </View>

                  {typePhotos.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 10 }}
                    >
                      {typePhotos.map((photo) => (
                        <TouchableOpacity
                          key={photo.id}
                          onLongPress={() => handleDeletePhoto(photo)}
                          activeOpacity={0.9}
                        >
                          <Image
                            source={{ uri: photo.uri }}
                            style={{
                              width: 140,
                              height: 140,
                              borderRadius: 12,
                              backgroundColor: Colors.surfaceAlt,
                            }}
                            resizeMode="cover"
                          />
                          <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 4 }}>
                            {timeAgo(photo.createdAt)}
                          </Txt>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View
                      style={{
                        backgroundColor: Colors.surfaceAlt,
                        borderRadius: 12,
                        padding: 20,
                        alignItems: 'center',
                        gap: 6,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        borderStyle: 'dashed',
                      }}
                    >
                      <Feather name="camera" size={24} color={Colors.textMuted} />
                      <Txt style={{ fontSize: 13, color: Colors.textMuted }}>
                        Brak zdjęć
                      </Txt>
                    </View>
                  )}
                </View>
              );
            })}

            {photos.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  backgroundColor: Colors.infoBg,
                  borderRadius: 10,
                  padding: 10,
                  alignItems: 'flex-start',
                }}
              >
                <Feather name="info" size={14} color={Colors.info} style={{ marginTop: 1 }} />
                <Txt style={{ flex: 1, fontSize: 12, color: '#1e40af', lineHeight: 17 }}>
                  Przytrzymaj zdjęcie, aby je usunąć.
                </Txt>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </>
  );
}

function ShoppingItemCard({
  item,
  editing,
  editPrice,
  editQty,
  onEditPrice,
  onEditQty,
  onTogglePurchased,
  onToggleOwned,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: {
  item: ShoppingItem;
  editing: boolean;
  editPrice: string;
  editQty: string;
  onEditPrice: (v: string) => void;
  onEditQty: (v: string) => void;
  onTogglePurchased: () => void;
  onToggleOwned: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}) {
  const effectivePrice = getEffectivePrice(item);
  const effectiveQty = getEffectiveQuantity(item);
  const isCustomized = item.customPrice !== undefined || item.customQuantity !== undefined;

  if (editing) {
    return (
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 14,
          padding: 14,
          borderWidth: 2,
          borderColor: Colors.primary,
          gap: 12,
        }}
      >
        <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{item.name}</Txt>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>Ilość ({item.unit})</Txt>
            <TextInput
              value={editQty}
              onChangeText={onEditQty}
              keyboardType="decimal-pad"
              style={{
                backgroundColor: Colors.surfaceAlt,
                borderRadius: 10,
                padding: 10,
                fontSize: 16,
                fontFamily: 'Inter_500Medium',
                color: Colors.text,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>Cena (PLN)</Txt>
            <TextInput
              value={editPrice}
              onChangeText={onEditPrice}
              keyboardType="decimal-pad"
              style={{
                backgroundColor: Colors.surfaceAlt,
                borderRadius: 10,
                padding: 10,
                fontSize: 16,
                fontFamily: 'Inter_500Medium',
                color: Colors.text,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={onSaveEdit}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' }}
          >
            <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>Zapisz</Txt>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCancelEdit}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.surfaceAlt, alignItems: 'center' }}
          >
            <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>Anuluj</Txt>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: item.purchased ? '#BBF7D0' : Colors.border,
        padding: 12,
        gap: 8,
        opacity: item.purchased ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={onTogglePurchased} activeOpacity={0.7}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: item.purchased ? Colors.success : Colors.border,
              backgroundColor: item.purchased ? Colors.success : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.purchased && <Feather name="check" size={15} color="#fff" />}
          </View>
        </TouchableOpacity>

        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Txt
              w="medium"
              style={{
                fontSize: 14,
                color: item.purchased ? Colors.textMuted : Colors.text,
                textDecorationLine: item.purchased ? 'line-through' : 'none',
              }}
            >
              {item.name}
            </Txt>
            <TierBadge tier={item.tier} />
            {isCustomized && (
              <View style={{ paddingHorizontal: 5, paddingVertical: 1, backgroundColor: Colors.warningBg, borderRadius: 4 }}>
                <Txt style={{ fontSize: 9, color: Colors.warning }} w="semibold">edytowane</Txt>
              </View>
            )}
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            {effectiveQty.toFixed(effectiveQty < 10 ? 1 : 0)} {item.unit}
          </Txt>
        </View>

        <Txt
          w="semibold"
          style={{ fontSize: 14, color: item.purchased ? Colors.textMuted : Colors.primary }}
        >
          {formatCurrency(effectivePrice)}
        </Txt>
      </View>

      {item.notes && (
        <Txt style={{ fontSize: 11, color: Colors.textMuted, paddingLeft: 38, lineHeight: 15 }}>
          {item.notes}
        </Txt>
      )}

      <View style={{ flexDirection: 'row', gap: 6, paddingLeft: 38 }}>
        <TouchableOpacity
          onPress={onStartEdit}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 5,
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 8,
          }}
        >
          <Feather name="edit-2" size={11} color={Colors.textSecondary} />
          <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>Edytuj</Txt>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleOwned}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 5,
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 8,
          }}
        >
          <Feather name="home" size={11} color={Colors.textSecondary} />
          <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>Mam to</Txt>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRemove}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 5,
            backgroundColor: Colors.dangerBg,
            borderRadius: 8,
          }}
        >
          <Feather name="x" size={11} color={Colors.danger} />
          <Txt style={{ fontSize: 11, color: Colors.danger }}>Usuń</Txt>
        </TouchableOpacity>
      </View>
    </View>
  );
}
