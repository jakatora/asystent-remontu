import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { getJobById } from '@/data/jobs';
import { ShoppingItem } from '@/types/renovation';
import { formatCurrency } from '@/utils/calculator';
import { WarningBanner } from '@/components/ui/WarningBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type Tab = 'overview' | 'materials' | 'guide' | 'shopping';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { projects, updateProject, removeProject, getProjectShoppingItems, addShoppingItem, toggleItem, removeShoppingItem } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  const project = projects.find((p) => p.id === id);
  const job = project ? getJobById(project.jobId) : null;

  const loadShopping = useCallback(async () => {
    if (!id) return;
    const items = await getProjectShoppingItems(id);
    setShoppingItems(items);
  }, [id, getProjectShoppingItems]);

  useFocusEffect(useCallback(() => { loadShopping(); }, [loadShopping]));

  const handleGenerateShoppingList = async () => {
    if (!project?.calculationResult) return;
    for (const m of project.calculationResult.materials) {
      await addShoppingItem({
        projectId: project.id,
        materialId: m.material.id,
        name: m.material.name,
        quantity: m.quantity,
        unit: m.material.unit,
        estimatedPrice: m.cost,
        purchased: false,
        createdAt: new Date().toISOString(),
      });
    }
    await loadShopping();
    setTab('shopping');
  };

  const handleStatusChange = async (status: 'planning' | 'in-progress' | 'completed') => {
    if (!project) return;
    await updateProject({ ...project, status });
  };

  const handleDelete = () => {
    Alert.alert('Usuń projekt', `Usunąć projekt "${project?.name}"? Tej operacji nie można cofnąć.`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          await removeProject(id!);
          router.back();
        },
      },
    ]);
  };

  if (!project || !job) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Projekt nie znaleziony</Text>
        <Button label="Wróć" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const calc = project.calculationResult;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 16;
  const purchasedCount = shoppingItems.filter((i) => i.purchased).length;

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
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: 4 }}>
              <Feather name="trash-2" size={20} color={Colors.danger} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['overview', 'materials', 'guide', 'shopping'] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = { overview: 'Przegląd', materials: 'Materiały', guide: 'Instrukcja', shopping: 'Zakupy' };
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{labels[t]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPadding, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Tab */}
        {tab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={styles.projectHeader}>
              <Text style={styles.projectTitle}>{project.name}</Text>
              <Text style={styles.jobName}>{job.name}</Text>
            </View>

            {/* Status */}
            <View style={styles.statusRow}>
              {(['planning', 'in-progress', 'completed'] as const).map((s) => {
                const labels = { planning: 'Planowanie', 'in-progress': 'W trakcie', completed: 'Ukończony' };
                const colors = { planning: Colors.info, 'in-progress': Colors.warning, completed: Colors.success };
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, project.status === s && { backgroundColor: colors[s], borderColor: colors[s] }]}
                    onPress={() => handleStatusChange(s)}
                  >
                    <Text style={[styles.statusBtnText, project.status === s && { color: Colors.white }]}>{labels[s]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {calc && (
              <View style={styles.costCard}>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Szacowany koszt materiałów</Text>
                  <Text style={styles.costValue}>{formatCurrency(calc.totalCost)}</Text>
                </View>
                <View style={styles.costDivider} />
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Czas realizacji</Text>
                  <Text style={styles.costValue}>{calc.totalDays} {calc.totalDays === 1 ? 'dzień' : 'dni'}</Text>
                </View>
                {shoppingItems.length > 0 && (
                  <>
                    <View style={styles.costDivider} />
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Zakupy</Text>
                      <Text style={styles.costValue}>{purchasedCount}/{shoppingItems.length} kupionych</Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {calc?.warnings && calc.warnings.length > 0 && (
              <WarningBanner warnings={calc.warnings} />
            )}

            {job.hireProfessionalRecommended && (
              <TouchableOpacity
                style={styles.hireBanner}
                onPress={() => router.push({ pathname: '/hire-pro', params: { jobId: job.id } })}
                activeOpacity={0.8}
              >
                <Feather name="phone" size={18} color={Colors.danger} />
                <Text style={styles.hireText}>Rozważ zatrudnienie fachowca</Text>
                <Feather name="chevron-right" size={16} color={Colors.danger} />
              </TouchableOpacity>
            )}

            <Button
              label="Otwórz pełny opis pracy"
              variant="outline"
              onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
              fullWidth
            />
          </View>
        )}

        {/* Materials Tab */}
        {tab === 'materials' && calc && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Lista materiałów</Text>
            {calc.materials.map((m, i) => (
              <View key={i} style={styles.materialRow}>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>{m.material.name}</Text>
                  {m.material.notes && <Text style={styles.materialNote}>{m.material.notes}</Text>}
                </View>
                <View style={styles.materialQty}>
                  <Text style={styles.qtyValue}>{m.quantity.toFixed(m.quantity < 10 ? 1 : 0)}</Text>
                  <Text style={styles.qtyUnit}>{m.material.unit}</Text>
                </View>
                <Text style={styles.materialCost}>{formatCurrency(m.cost)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Łączny koszt</Text>
              <Text style={styles.totalValue}>{formatCurrency(calc.totalCost)}</Text>
            </View>
            <View style={{ height: 16 }} />
            <Button
              label={shoppingItems.length > 0 ? 'Odśwież listę zakupów' : 'Generuj listę zakupów'}
              onPress={handleGenerateShoppingList}
              fullWidth
            />
          </View>
        )}

        {/* Guide Tab */}
        {tab === 'guide' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Instrukcja krok po kroku</Text>
            {job.instructions.map((step) => (
              <View key={step.step} style={styles.stepCard}>
                <View style={styles.stepNumContainer}>
                  <Text style={styles.stepNum}>{step.step}</Text>
                </View>
                <View style={styles.stepBody}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <View style={styles.durationBadge}>
                      <Feather name="clock" size={11} color={Colors.textMuted} />
                      <Text style={styles.durationText}>~{step.durationMin >= 60 ? `${Math.round(step.durationMin / 60)}h` : `${step.durationMin}min`}</Text>
                    </View>
                  </View>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                  {step.tip && (
                    <View style={styles.tipBox}>
                      <Feather name="lightbulb" size={13} color={Colors.warning} />
                      <Text style={styles.tipText}>{step.tip}</Text>
                    </View>
                  )}
                  {step.warning && (
                    <View style={styles.warnBox}>
                      <Feather name="alert-triangle" size={13} color={Colors.danger} />
                      <Text style={styles.warnText}>{step.warning}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Shopping Tab */}
        {tab === 'shopping' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Lista zakupów</Text>
            {shoppingItems.length === 0 ? (
              <View style={styles.emptyShop}>
                <Feather name="shopping-cart" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyText}>Brak listy zakupów</Text>
                <Text style={styles.emptyHint}>Przejdź do zakładki "Materiały" i wygeneruj listę zakupów</Text>
                <Button label="Przejdź do materiałów" onPress={() => setTab('materials')} variant="outline" />
              </View>
            ) : (
              <>
                <View style={styles.shopProgress}>
                  <Text style={styles.shopProgressText}>{purchasedCount} z {shoppingItems.length} kupionych</Text>
                  <View style={styles.shopProgressBar}>
                    <View style={[styles.shopProgressFill, { width: `${(purchasedCount / shoppingItems.length) * 100}%` as any }]} />
                  </View>
                </View>
                {shoppingItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.shopItem, item.purchased && styles.shopItemDone]}
                    onPress={async () => {
                      await toggleItem(item.id, !item.purchased);
                      loadShopping();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.shopCheck, item.purchased && styles.shopCheckDone]}>
                      {item.purchased && <Feather name="check" size={14} color={Colors.white} />}
                    </View>
                    <View style={styles.shopItemInfo}>
                      <Text style={[styles.shopItemName, item.purchased && styles.shopItemNameDone]}>
                        {item.name}
                      </Text>
                      <Text style={styles.shopItemQty}>{item.quantity.toFixed(1)} {item.unit}</Text>
                    </View>
                    <Text style={[styles.shopItemPrice, item.purchased && { color: Colors.textMuted }]}>
                      ~{formatCurrency(item.estimatedPrice)}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.shopTotal}>
                  <Text style={styles.shopTotalLabel}>Suma</Text>
                  <Text style={styles.shopTotalValue}>{formatCurrency(shoppingItems.reduce((s, i) => s + i.estimatedPrice, 0))}</Text>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: 16 },
  notFound: { fontSize: 16, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary, fontFamily: 'Inter_700Bold' },
  tabContent: { gap: 16 },
  projectHeader: { marginBottom: 4 },
  projectTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.text },
  jobName: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 4 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.surface },
  statusBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  costCard: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  costLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  costValue: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.text },
  costDivider: { height: 1, backgroundColor: Colors.borderLight },
  hireBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.dangerBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#fca5a5' },
  hireText: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.danger },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.text, marginBottom: 4 },
  materialRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  materialInfo: { flex: 1 },
  materialName: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  materialNote: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textMuted, marginTop: 2 },
  materialQty: { alignItems: 'center', minWidth: 50 },
  qtyValue: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.text },
  qtyUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textMuted },
  materialCost: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primary, minWidth: 70, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.primaryBg, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.primaryLight },
  totalLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.primaryDark },
  totalValue: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.primary },
  stepCard: { flexDirection: 'row', gap: 14, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  stepNumContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNum: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.white },
  stepBody: { flex: 1, gap: 6 },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  stepTitle: { flex: 1, fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.text },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  durationText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.textMuted },
  stepDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  tipBox: { flexDirection: 'row', gap: 8, backgroundColor: Colors.warningBg, borderRadius: 8, padding: 10, alignItems: 'flex-start' },
  tipText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#92400e', lineHeight: 18 },
  warnBox: { flexDirection: 'row', gap: 8, backgroundColor: Colors.dangerBg, borderRadius: 8, padding: 10, alignItems: 'flex-start' },
  warnText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#991b1b', lineHeight: 18 },
  emptyShop: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  emptyText: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  emptyHint: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textMuted, textAlign: 'center', maxWidth: 260 },
  shopProgress: { gap: 8 },
  shopProgressText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  shopProgressBar: { height: 8, borderRadius: 4, backgroundColor: Colors.borderLight, overflow: 'hidden' },
  shopProgressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  shopItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  shopItemDone: { opacity: 0.6 },
  shopCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  shopCheckDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  shopItemInfo: { flex: 1 },
  shopItemName: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  shopItemNameDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  shopItemQty: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted, marginTop: 2 },
  shopItemPrice: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  shopTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14 },
  shopTotalLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  shopTotalValue: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.primary },
});
