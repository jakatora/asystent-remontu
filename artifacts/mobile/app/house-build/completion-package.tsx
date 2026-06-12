import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { investorDocsRepo } from '@/db/repositories/investor-docs.repo';
import { COMPLETION_PACKAGE_ITEMS } from '@/features/house-build/completion-package';
import type { CompletionPackageItem, InvestorDocStatus, ApplicabilityState } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

export default function CompletionPackageScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const STATUS_CONFIG: Record<InvestorDocStatus, { label: string; color: string; bg: string; icon: string }> = {
    'missing': { label: t('hb.completionPackage.status.missing'), color: '#DC2626', bg: '#FEF2F2', icon: 'x-circle' },
    'in-progress': { label: t('hb.completionPackage.status.inProgress'), color: '#D97706', bg: '#FFFBEB', icon: 'clock' },
    'ready': { label: t('hb.completionPackage.status.ready'), color: '#16A34A', bg: '#F0FDF4', icon: 'check-circle' },
    'not-needed': { label: t('hb.completionPackage.status.notNeeded'), color: Colors.textMuted, bg: '#F1F5F9', icon: 'minus-circle' },
  };

  const APPLICABILITY_LABELS: Record<ApplicabilityState, { label: string; color: string }> = {
    'required': { label: t('hb.completionPackage.app.required'), color: '#DC2626' },
    'likely-required': { label: t('hb.completionPackage.app.likelyRequired'), color: '#D97706' },
    'maybe-required': { label: t('hb.completionPackage.app.maybeRequired'), color: '#7C3AED' },
    'not-applicable': { label: t('hb.completionPackage.app.notApplicable'), color: Colors.textMuted },
    'unknown': { label: t('hb.completionPackage.app.unknown'), color: Colors.textMuted },
  };

  const [items, setItems] = useState<CompletionPackageItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    let existing = await investorDocsRepo.getCompletionItems(projectId);
    if (existing.length === 0) {
      for (const def of COMPLETION_PACKAGE_ITEMS) {
        await investorDocsRepo.upsertCompletionItem(projectId, def.itemKey, {
          title: def.title,
          applicability: def.defaultApplicability,
        });
      }
      existing = await investorDocsRepo.getCompletionItems(projectId);
    }
    setItems(existing);
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleStatusCycle = useCallback(async (item: CompletionPackageItem) => {
    if (!projectId) return;
    const cycle: InvestorDocStatus[] = ['missing', 'in-progress', 'ready', 'not-needed'];
    const idx = cycle.indexOf(item.status);
    const next = cycle[(idx + 1) % cycle.length];
    await investorDocsRepo.upsertCompletionItem(projectId, item.itemKey, { status: next });
    await loadData();
  }, [projectId, loadData]);

  const ready = items.filter((i) => i.status === 'ready' || i.status === 'not-needed').length;
  const total = items.length;
  const missing = items.filter((i) => i.status === 'missing' && i.applicability !== 'not-applicable').length;

  return (
    <>
      <Stack.Screen options={{ title: t('hb.completionPackage.title') }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: HB_ACCENT_BG, borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 16,
          }}>
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{t('hb.completionPackage.title')}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              {t('hb.completionPackage.subtitle')}
            </Txt>
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{t('hb.completionPackage.readiness')}</Txt>
                <Txt w="semibold" style={{ fontSize: 12, color: HB_ACCENT }}>{ready}/{total}</Txt>
              </View>
              <View style={{ height: 6, backgroundColor: '#DBEAFE', borderRadius: 3 }}>
                <View style={{ height: 6, backgroundColor: ready === total ? '#16A34A' : HB_ACCENT, borderRadius: 3, width: `${total > 0 ? (ready / total) * 100 : 0}%` }} />
              </View>
            </View>
            {missing > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <Feather name="alert-circle" size={12} color="#DC2626" />
                <Txt style={{ fontSize: 11, color: '#DC2626' }}>{t('hb.completionPackage.missingCount', { count: missing })}</Txt>
              </View>
            )}
          </View>

          {items.map((item) => {
            const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.missing;
            const app = APPLICABILITY_LABELS[item.applicability] ?? APPLICABILITY_LABELS.unknown;
            const def = COMPLETION_PACKAGE_ITEMS.find((d) => d.itemKey === item.itemKey);
            const isExpanded = expandedId === item.id;

            return (
              <View key={item.id} style={{ marginBottom: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
                    borderWidth: 1, borderColor: item.status === 'ready' ? '#BBF7D0' : item.status === 'missing' && item.applicability !== 'not-applicable' ? '#FECACA' : Colors.border,
                  }}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  onLongPress={() => handleStatusCycle(item)}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: sc.bg, alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Feather name={sc.icon as any} size={16} color={sc.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{item.title}</Txt>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                        <View style={{ backgroundColor: sc.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Txt style={{ fontSize: 9, color: sc.color }}>{sc.label}</Txt>
                        </View>
                        <Txt style={{ fontSize: 9, color: app.color }}>{app.label}</Txt>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && def && (
                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginTop: 4, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Txt style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 6 }}>{def.description}</Txt>
                    <TouchableOpacity
                      style={{ backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }}
                      onPress={() => handleStatusCycle(item)}
                    >
                      <Txt w="semibold" style={{ fontSize: 12, color: '#fff' }}>Zmien status</Txt>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              Przytrzymaj element, aby szybko zmienic status. Zastosowanie poszczegolnych pozycji zalezy od Twojej sciezki formalnej — zweryfikuj z kierownikiem budowy.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
