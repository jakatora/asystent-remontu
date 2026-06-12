import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { BUILD_STAGES } from '@/features/house-build/stages';
import { timelineBudgetRepo } from '@/db/repositories/timeline-budget.repo';
import type { StageBudgetItem, StageCostCategory, BudgetCompletenessState } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const CATEGORY_COLORS: Record<StageCostCategory, string> = {
  'design-formal': '#7C3AED',
  'labor': '#2563EB',
  'materials': '#059669',
  'equipment-transport': '#D97706',
  'contingency': '#DC2626',
  'custom': '#64748B',
};

function getStageCompleteness(items: StageBudgetItem[]): BudgetCompletenessState {
  if (items.length === 0) return 'no-estimate';
  const hasUserOverride = items.some((i) => i.userOverride !== null);
  const hasRange = items.some((i) => i.amountLow !== null || i.amountHigh !== null);
  if (hasUserOverride) return 'user-confirmed';
  if (hasRange) return items.every((i) => i.amountLow !== null || i.amountHigh !== null || i.userOverride !== null) ? 'complete-planning' : 'partial';
  return 'partial';
}

export default function BudgetScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const CATEGORY_LABELS: Record<StageCostCategory, string> = {
    'design-formal': t('hb.budget.cat.designFormal'),
    'labor': t('hb.budget.cat.labor'),
    'materials': t('hb.budget.cat.materials'),
    'equipment-transport': t('hb.budget.cat.equipmentTransport'),
    'contingency': t('hb.budget.cat.contingency'),
    'custom': t('hb.budget.cat.custom'),
  };

  const COMPLETENESS_LABELS: Record<BudgetCompletenessState, { label: string; color: string; bg: string }> = {
    'no-estimate': { label: t('hb.budget.completeness.noEstimate'), color: Colors.textMuted, bg: '#F1F5F9' },
    'partial': { label: t('hb.budget.completeness.partial'), color: '#D97706', bg: '#FFFBEB' },
    'complete-planning': { label: t('hb.budget.completeness.completePlanning'), color: '#2563EB', bg: '#EFF6FF' },
    'user-confirmed': { label: t('hb.budget.completeness.userConfirmed'), color: '#16A34A', bg: '#F0FDF4' },
  };

  const [budgetItems, setBudgetItems] = useState<StageBudgetItem[]>([]);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newLow, setNewLow] = useState('');
  const [newHigh, setNewHigh] = useState('');
  const [newCategory, setNewCategory] = useState<StageCostCategory>('materials');

  const loadData = useCallback(async () => {
    if (!projectId) return;
    const items = await timelineBudgetRepo.getBudgetItems(projectId);
    setBudgetItems(items);
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const stageSummaries = useMemo(() => {
    return BUILD_STAGES.map((stage) => {
      const items = budgetItems.filter((i) => i.stageKey === stage.key);
      const totalLow = items.reduce((s, i) => s + (i.userOverride ?? i.amountLow ?? 0), 0);
      const totalHigh = items.reduce((s, i) => s + (i.userOverride ?? i.amountHigh ?? i.amountLow ?? 0), 0);
      const completeness = getStageCompleteness(items);
      return { stage, items, totalLow, totalHigh, completeness };
    });
  }, [budgetItems]);

  const grandTotalLow = stageSummaries.reduce((s, st) => s + st.totalLow, 0);
  const grandTotalHigh = stageSummaries.reduce((s, st) => s + st.totalHigh, 0);
  const estimatedStages = stageSummaries.filter((s) => s.completeness !== 'no-estimate').length;
  const unestimatedStages = stageSummaries.filter((s) => s.completeness === 'no-estimate').length;

  const handleAddItem = useCallback(async () => {
    if (!projectId || !addingTo || !newLabel.trim()) return;
    await timelineBudgetRepo.addBudgetItem(projectId, addingTo, {
      category: newCategory,
      label: newLabel.trim(),
      amountLow: newLow ? parseFloat(newLow) : null,
      amountHigh: newHigh ? parseFloat(newHigh) : null,
    });
    setNewLabel('');
    setNewLow('');
    setNewHigh('');
    setAddingTo(null);
    await loadData();
  }, [projectId, addingTo, newLabel, newLow, newHigh, newCategory, loadData]);

  const handleDeleteItem = useCallback(async (id: string) => {
    Alert.alert(t('hb.budget.deleteItemTitle'), t('hb.budget.deleteItemBody'), [
      { text: t('hb.budget.cancelCta'), style: 'cancel' },
      { text: t('hb.budget.deleteCta'), style: 'destructive', onPress: async () => {
        await timelineBudgetRepo.deleteBudgetItem(id);
        await loadData();
      }},
    ]);
  }, [loadData]);

  const formatAmount = (n: number) => n.toLocaleString('pl-PL', { maximumFractionDigits: 0 });

  return (
    <>
      <Stack.Screen options={{ title: t('hb.budget.title') }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#BFDBFE',
            marginBottom: 16,
          }}>
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{t('hb.budget.title')}</Txt>
            <View style={{ marginTop: 12, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{t('hb.budget.estimatedRange')}</Txt>
                <Txt w="bold" style={{ fontSize: 15, color: HB_ACCENT }}>
                  {formatAmount(grandTotalLow)} - {formatAmount(grandTotalHigh)} zl
                </Txt>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{t('hb.budget.stagesWithEstimate')}</Txt>
                <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{t('hb.budget.estimatedOf', { done: estimatedStages, total: BUILD_STAGES.length })}</Txt>
              </View>
              {unestimatedStages > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Feather name="alert-circle" size={12} color="#D97706" />
                  <Txt style={{ fontSize: 11, color: '#D97706' }}>{t('hb.budget.unestimated', { count: unestimatedStages })}</Txt>
                </View>
              )}
            </View>
          </View>

          <View style={{
            backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 12,
            borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', gap: 8,
          }}>
            <Feather name="info" size={14} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 11, color: '#92400E', flex: 1 }}>
              {t('hb.budget.disclaimerTop')}
            </Txt>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#ECFDF5', borderRadius: 10, padding: 12, marginBottom: 16,
              borderWidth: 1, borderColor: '#A7F3D0', flexDirection: 'row', alignItems: 'center', gap: 8,
            }}
            onPress={() => router.push({ pathname: '/house-build/pricing-references' as any, params: { projectId } })}
            activeOpacity={0.85}
          >
            <Feather name="tag" size={14} color="#059669" />
            <View style={{ flex: 1 }}>
              <Txt w="semibold" style={{ fontSize: 12, color: '#059669' }}>{t('hb.budget.pricingCta')}</Txt>
              <Txt style={{ fontSize: 10, color: '#064E3B' }}>{t('hb.budget.pricingSubtitle')}</Txt>
            </View>
            <Feather name="chevron-right" size={14} color="#059669" />
          </TouchableOpacity>

          {stageSummaries.map(({ stage, items, totalLow, totalHigh, completeness }) => {
            const isExpanded = expandedStage === stage.key;
            const ci = COMPLETENESS_LABELS[completeness];

            return (
              <View key={stage.key} style={{ marginBottom: 10 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: isExpanded ? '#BFDBFE' : Colors.border,
                  }}
                  onPress={() => setExpandedStage(isExpanded ? null : stage.key)}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Feather name={stage.icon as any} size={16} color={HB_ACCENT} />
                    <View style={{ flex: 1 }}>
                      <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{stage.name}</Txt>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                        <View style={{ backgroundColor: ci.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Txt style={{ fontSize: 9, color: ci.color }}>{ci.label}</Txt>
                        </View>
                        {items.length > 0 && (
                          <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('hb.budget.itemsCount', { count: items.length })}</Txt>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      {items.length > 0 ? (
                        <Txt w="semibold" style={{ fontSize: 12, color: HB_ACCENT }}>
                          {formatAmount(totalLow)}{totalHigh > totalLow ? ` - ${formatAmount(totalHigh)}` : ''} zl
                        </Txt>
                      ) : (
                        <Txt style={{ fontSize: 11, color: Colors.textMuted }}>--</Txt>
                      )}
                    </View>
                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ paddingHorizontal: 8, paddingTop: 8 }}>
                    {items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={{
                          backgroundColor: '#F8FAFC',
                          borderRadius: 10,
                          padding: 10,
                          marginBottom: 4,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}
                        onLongPress={() => handleDeleteItem(item.id)}
                      >
                        <View style={{ width: 4, height: 24, borderRadius: 2, backgroundColor: CATEGORY_COLORS[item.category] ?? '#64748B' }} />
                        <View style={{ flex: 1 }}>
                          <Txt style={{ fontSize: 12, color: Colors.text }}>{item.label}</Txt>
                          <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{CATEGORY_LABELS[item.category]}</Txt>
                        </View>
                        <Txt w="semibold" style={{ fontSize: 11, color: Colors.text }}>
                          {item.userOverride !== null
                            ? `${formatAmount(item.userOverride)} zl`
                            : item.amountLow !== null
                              ? `${formatAmount(item.amountLow)}${item.amountHigh ? ` - ${formatAmount(item.amountHigh)}` : ''} zl`
                              : '--'}
                        </Txt>
                      </TouchableOpacity>
                    ))}

                    {addingTo === stage.key ? (
                      <View style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: 10,
                        padding: 12,
                        marginTop: 4,
                        borderWidth: 1,
                        borderColor: '#BFDBFE',
                      }}>
                        <TextInput
                          style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 14, color: Colors.text, marginBottom: 8, borderWidth: 1, borderColor: Colors.border }}
                          placeholder={t('hb.budget.newLabelPlaceholder')}
                          placeholderTextColor={Colors.textMuted}
                          value={newLabel}
                          onChangeText={setNewLabel}
                        />
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                          <TextInput
                            style={{ flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.border }}
                            placeholder={t('hb.budget.fromPlaceholder')}
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="numeric"
                            value={newLow}
                            onChangeText={setNewLow}
                          />
                          <TextInput
                            style={{ flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.border }}
                            placeholder={t('hb.budget.toPlaceholder')}
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="numeric"
                            value={newHigh}
                            onChangeText={setNewHigh}
                          />
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            {(Object.keys(CATEGORY_LABELS) as StageCostCategory[]).map((cat) => (
                              <TouchableOpacity
                                key={cat}
                                style={{
                                  backgroundColor: newCategory === cat ? CATEGORY_COLORS[cat] : '#F1F5F9',
                                  borderRadius: 6,
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                }}
                                onPress={() => setNewCategory(cat)}
                              >
                                <Txt style={{ fontSize: 10, color: newCategory === cat ? '#fff' : Colors.text }}>{CATEGORY_LABELS[cat]}</Txt>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }}
                            onPress={handleAddItem}
                          >
                            <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>{t('hb.budget.addCta')}</Txt>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}
                            onPress={() => setAddingTo(null)}
                          >
                            <Txt style={{ fontSize: 13, color: Colors.text }}>{t('hb.budget.cancelCta')}</Txt>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={{ alignItems: 'center', paddingVertical: 8 }}
                        onPress={() => { setAddingTo(stage.key); setNewCategory('materials'); }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Feather name="plus" size={14} color={HB_ACCENT} />
                          <Txt style={{ fontSize: 12, color: HB_ACCENT }}>{t('hb.budget.addCostItem')}</Txt>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              {t('hb.budget.disclaimerBottom')}
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
