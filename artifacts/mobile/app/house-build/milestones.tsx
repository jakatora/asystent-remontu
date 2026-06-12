import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { timelineBudgetRepo } from '@/db/repositories/timeline-budget.repo';
import { DEFAULT_MILESTONES } from '@/features/house-build/milestones';
import type { BuildTimelineMilestone } from '@/types/house-build';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/constants/i18n';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const STATUS_CONFIG: Record<string, { labelKey: TranslationKey; color: string; bg: string; icon: string }> = {
  pending: { labelKey: 'hb.milestones.status.pending', color: Colors.textMuted, bg: '#F1F5F9', icon: 'clock' },
  reached: { labelKey: 'hb.milestones.status.reached', color: '#16A34A', bg: '#F0FDF4', icon: 'check-circle' },
  skipped: { labelKey: 'hb.milestones.status.skipped', color: Colors.textMuted, bg: '#F1F5F9', icon: 'skip-forward' },
};

export default function MilestonesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [milestones, setMilestones] = useState<BuildTimelineMilestone[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const loadData = useCallback(async () => {
    if (!projectId) return;
    const ms = await timelineBudgetRepo.getMilestones(projectId);
    if (ms.length === 0) {
      for (const m of DEFAULT_MILESTONES) {
        await timelineBudgetRepo.upsertMilestone(projectId, m.key, {
          label: m.label,
          sortOrder: m.sortOrder,
        });
      }
      const seeded = await timelineBudgetRepo.getMilestones(projectId);
      setMilestones(seeded);
    } else {
      setMilestones(ms);
    }
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleStatusToggle = useCallback(async (m: BuildTimelineMilestone) => {
    if (!projectId) return;
    const cycle: ('pending' | 'reached' | 'skipped')[] = ['pending', 'reached', 'skipped'];
    const idx = cycle.indexOf(m.status);
    const next = cycle[(idx + 1) % cycle.length];
    const completedDate = next === 'reached' ? new Date().toISOString().split('T')[0] : null;
    await timelineBudgetRepo.upsertMilestone(projectId, m.key, {
      status: next,
      completedDate,
    });
    await loadData();
  }, [projectId, loadData]);

  const handleSaveNotes = useCallback(async () => {
    if (!projectId || !editingId) return;
    const m = milestones.find((ms) => ms.id === editingId);
    if (!m) return;
    await timelineBudgetRepo.upsertMilestone(projectId, m.key, { notes: editNotes });
    setEditingId(null);
    await loadData();
  }, [projectId, editingId, editNotes, milestones, loadData]);

  const reached = milestones.filter((m) => m.status === 'reached').length;
  const total = milestones.length;

  return (
    <>
      <Stack.Screen options={{ title: t('hb.milestones.title') }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: HB_ACCENT_BG, borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 16,
          }}>
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{t('hb.milestones.heroTitle')}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              {t('hb.milestones.heroSubtitle')}
            </Txt>
            <Txt w="semibold" style={{ fontSize: 12, color: HB_ACCENT, marginTop: 8 }}>
              {t('hb.milestones.reachedCount', { reached, total })}
            </Txt>
          </View>

          {milestones.map((m, index) => {
            const sc = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.pending;
            const def = DEFAULT_MILESTONES.find((d) => d.key === m.key);
            const isEditing = editingId === m.id;

            return (
              <View key={m.id} style={{ marginBottom: 8 }}>
                {index > 0 && (
                  <View style={{ alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ width: 2, height: 16, backgroundColor: m.status === 'reached' ? '#BBF7D0' : '#E2E8F0' }} />
                  </View>
                )}
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: m.status === 'reached' ? '#BBF7D0' : Colors.border,
                  }}
                  onPress={() => handleStatusToggle(m)}
                  onLongPress={() => { setEditingId(m.id); setEditNotes(m.notes); }}
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
                      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{m.label}</Txt>
                      {def && <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{def.description}</Txt>}
                      {m.completedDate && (
                        <Txt style={{ fontSize: 10, color: '#16A34A', marginTop: 2 }}>{m.completedDate}</Txt>
                      )}
                    </View>
                    <View style={{ backgroundColor: sc.bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Txt style={{ fontSize: 9, color: sc.color }}>{t(sc.labelKey)}</Txt>
                    </View>
                  </View>

                  {m.notes ? (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border }}>
                      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{m.notes}</Txt>
                    </View>
                  ) : null}
                </TouchableOpacity>

                {isEditing && (
                  <View style={{ paddingHorizontal: 8, paddingTop: 8 }}>
                    <TextInput
                      style={{
                        backgroundColor: '#fff', borderRadius: 8, padding: 10,
                        fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: '#BFDBFE',
                        minHeight: 60, textAlignVertical: 'top',
                      }}
                      multiline
                      placeholder={t('hb.milestones.notesPlaceholder')}
                      placeholderTextColor={Colors.textMuted}
                      value={editNotes}
                      onChangeText={setEditNotes}
                    />
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }}
                        onPress={handleSaveNotes}
                      >
                        <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>{t('hb.milestones.saveCta')}</Txt>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}
                        onPress={() => setEditingId(null)}
                      >
                        <Txt style={{ fontSize: 13, color: Colors.text }}>{t('hb.milestones.cancelCta')}</Txt>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
              {t('hb.milestones.footnote')}
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
