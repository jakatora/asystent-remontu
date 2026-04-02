import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { BUILD_STAGES } from '@/features/house-build/stages';
import { getDependenciesForStage, isStageBlocked, getBlockingStages } from '@/features/house-build/dependencies';
import { timelineBudgetRepo } from '@/db/repositories/timeline-budget.repo';
import type { TimelineStageRecord, BuildTimelineMilestone, TimelineNoteRecord } from '@/types/house-build';
import { DEFAULT_MILESTONES } from '@/features/house-build/milestones';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  'not-started': { label: 'Nie rozpoczety', color: Colors.textMuted, bg: '#F1F5F9', icon: 'circle' },
  'in-progress': { label: 'W trakcie', color: HB_ACCENT, bg: HB_ACCENT_BG, icon: 'play-circle' },
  'waiting-for-verification': { label: 'Oczekuje weryfikacji', color: '#D97706', bg: '#FFFBEB', icon: 'clock' },
  'ready-for-next-stage': { label: 'Gotowy', color: '#16A34A', bg: '#F0FDF4', icon: 'check-circle' },
  'blocked': { label: 'Zablokowany', color: '#DC2626', bg: '#FEF2F2', icon: 'x-circle' },
  'completed': { label: 'Zakonczony', color: '#16A34A', bg: '#F0FDF4', icon: 'check-circle' },
  'skipped': { label: 'Pominiety', color: Colors.textMuted, bg: '#F1F5F9', icon: 'skip-forward' },
};

const NOTE_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  'weather-sensitive': { label: 'Pogoda', icon: 'cloud', color: '#0891B2' },
  'waiting-for-inspection': { label: 'Inspekcja', icon: 'eye', color: '#D97706' },
  'waiting-for-materials': { label: 'Materialy', icon: 'package', color: '#7C3AED' },
  'waiting-for-contractor': { label: 'Wykonawca', icon: 'users', color: '#DC2626' },
  'blocked-by-earlier-stage': { label: 'Blokada', icon: 'lock', color: '#DC2626' },
  'decision-required': { label: 'Decyzja', icon: 'help-circle', color: '#D97706' },
  'custom': { label: 'Notatka', icon: 'edit-3', color: Colors.textMuted },
};

export default function TimelineScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [timelineStages, setTimelineStages] = useState<TimelineStageRecord[]>([]);
  const [milestones, setMilestones] = useState<BuildTimelineMilestone[]>([]);
  const [timelineNotes, setTimelineNotes] = useState<TimelineNoteRecord[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  const loadData = useCallback(async () => {
    if (!projectId) return;
    const [stages, ms, notes] = await Promise.all([
      timelineBudgetRepo.getTimelineStages(projectId),
      timelineBudgetRepo.getMilestones(projectId),
      timelineBudgetRepo.getTimelineNotes(projectId),
    ]);
    setTimelineStages(stages);
    setMilestones(ms);
    setTimelineNotes(notes);
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const seedIfEmpty = useCallback(async () => {
    if (!projectId) return;
    const existing = await timelineBudgetRepo.getTimelineStages(projectId);
    if (existing.length > 0) return;
    for (const stage of BUILD_STAGES) {
      await timelineBudgetRepo.upsertTimelineStage(projectId, stage.key, {
        sortOrder: stage.order,
        estimatedWeeks: stage.estimatedWeeks,
        status: 'not-started',
      });
    }
    for (const m of DEFAULT_MILESTONES) {
      await timelineBudgetRepo.upsertMilestone(projectId, m.key, {
        label: m.label,
        sortOrder: m.sortOrder,
      });
    }
    await loadData();
  }, [projectId, loadData]);

  useFocusEffect(useCallback(() => { seedIfEmpty(); }, [seedIfEmpty]));

  const completedKeys = useMemo(() =>
    timelineStages.filter((s) => s.status === 'completed' || s.status === 'ready-for-next-stage').map((s) => s.stageKey),
    [timelineStages]
  );

  const stagesWithInfo = useMemo(() => {
    return BUILD_STAGES.map((stage) => {
      const tl = timelineStages.find((t) => t.stageKey === stage.key);
      const blocked = isStageBlocked(stage.key, completedKeys);
      const deps = getDependenciesForStage(stage.key);
      const stageNotes = timelineNotes.filter((n) => n.stageKey === stage.key);
      return { stage, timeline: tl, blocked, deps, notes: stageNotes };
    });
  }, [timelineStages, completedKeys, timelineNotes]);

  const handleStatusChange = useCallback(async (stageKey: string, currentStatus: string) => {
    if (!projectId) return;
    const blocking = getBlockingStages(stageKey, completedKeys);
    if (blocking.length > 0 && currentStatus === 'not-started') {
      return;
    }
    const cycle: string[] = ['not-started', 'in-progress', 'waiting-for-verification', 'completed'];
    const idx = cycle.indexOf(currentStatus);
    const next = cycle[(idx + 1) % cycle.length] as any;
    await timelineBudgetRepo.upsertTimelineStage(projectId, stageKey, { status: next });
    await loadData();
  }, [projectId, loadData, completedKeys]);

  const completedCount = completedKeys.length;
  const totalCount = BUILD_STAGES.length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Harmonogram budowy' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
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
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>Harmonogram budowy</Txt>
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Txt style={{ fontSize: 12, color: Colors.textMuted }}>Postep ogólny</Txt>
                <Txt w="semibold" style={{ fontSize: 12, color: HB_ACCENT }}>{completedCount}/{totalCount} etapów ({overallProgress}%)</Txt>
              </View>
              <View style={{ height: 6, backgroundColor: '#DBEAFE', borderRadius: 3 }}>
                <View style={{ height: 6, backgroundColor: overallProgress === 100 ? Colors.success : HB_ACCENT, borderRadius: 3, width: `${overallProgress}%` }} />
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                flex: 1, backgroundColor: viewMode === 'timeline' ? HB_ACCENT : Colors.surface,
                borderRadius: 10, padding: 10, alignItems: 'center',
                borderWidth: 1, borderColor: viewMode === 'timeline' ? HB_ACCENT : Colors.border,
              }}
              onPress={() => setViewMode('timeline')}
            >
              <Txt w="semibold" style={{ fontSize: 12, color: viewMode === 'timeline' ? '#fff' : Colors.text }}>Harmonogram</Txt>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1, backgroundColor: viewMode === 'list' ? HB_ACCENT : Colors.surface,
                borderRadius: 10, padding: 10, alignItems: 'center',
                borderWidth: 1, borderColor: viewMode === 'list' ? HB_ACCENT : Colors.border,
              }}
              onPress={() => setViewMode('list')}
            >
              <Txt w="semibold" style={{ fontSize: 12, color: viewMode === 'list' ? '#fff' : Colors.text }}>Lista etapów</Txt>
            </TouchableOpacity>
          </View>

          {milestones.length > 0 && viewMode === 'timeline' && (
            <View style={{ marginBottom: 20 }}>
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Kamienie milowe</Txt>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {milestones.map((m) => (
                    <View key={m.id} style={{
                      backgroundColor: m.status === 'reached' ? '#F0FDF4' : Colors.surface,
                      borderRadius: 10, padding: 10, width: 140,
                      borderWidth: 1, borderColor: m.status === 'reached' ? '#BBF7D0' : Colors.border,
                    }}>
                      <Feather
                        name={m.status === 'reached' ? 'check-circle' : m.status === 'skipped' ? 'skip-forward' : 'flag'}
                        size={14}
                        color={m.status === 'reached' ? '#16A34A' : Colors.textMuted}
                      />
                      <Txt w="semibold" style={{ fontSize: 11, color: Colors.text, marginTop: 4 }} numberOfLines={2}>{m.label}</Txt>
                      {m.plannedDate && <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>{m.plannedDate}</Txt>}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {stagesWithInfo.map(({ stage, timeline, blocked, deps, notes }, index) => {
            const status = timeline?.status ?? 'not-started';
            const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS['not-started'];
            const displayName = timeline?.customName || stage.name;
            const weeks = timeline?.estimatedWeeks ?? stage.estimatedWeeks;
            const mgmt = timeline?.managementMode ?? 'self';

            return (
              <View key={stage.key} style={{ marginBottom: 12 }}>
                {viewMode === 'timeline' && index > 0 && (
                  <View style={{ alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ width: 2, height: 20, backgroundColor: status === 'completed' ? '#BBF7D0' : '#E2E8F0' }} />
                  </View>
                )}
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: blocked ? '#FECACA' : status === 'in-progress' ? '#BFDBFE' : Colors.border,
                    opacity: status === 'skipped' ? 0.6 : 1,
                  }}
                  onPress={() => router.push({ pathname: '/house-build/stage-plan', params: { projectId, stageKey: stage.key } })}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: statusInfo.bg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Feather name={statusInfo.icon as any} size={16} color={statusInfo.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{displayName}</Txt>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 2, alignItems: 'center' }}>
                        <View style={{ backgroundColor: statusInfo.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Txt style={{ fontSize: 9, color: statusInfo.color }}>{statusInfo.label}</Txt>
                        </View>
                        {weeks && <Txt style={{ fontSize: 10, color: Colors.textMuted }}>~{weeks} tyg.</Txt>}
                        {mgmt !== 'self' && (
                          <View style={{ backgroundColor: '#F5F3FF', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                            <Txt style={{ fontSize: 9, color: '#6D28D9' }}>{mgmt === 'contractor' ? 'Wykonawca' : 'Mieszane'}</Txt>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleStatusChange(stage.key, status)}
                      style={{ padding: 6 }}
                    >
                      <Feather name="chevron-right" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {blocked && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#FEE2E2' }}>
                      <Feather name="lock" size={12} color="#DC2626" />
                      <Txt style={{ fontSize: 11, color: '#DC2626' }}>Zablokowany — wymaga zakonczenia wczesniejszych etapów</Txt>
                    </View>
                  )}

                  {notes.length > 0 && (
                    <View style={{ marginTop: 8, gap: 4 }}>
                      {notes.slice(0, 2).map((n) => {
                        const nt = NOTE_TYPE_LABELS[n.noteType] ?? NOTE_TYPE_LABELS.custom;
                        return (
                          <View key={n.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Feather name={nt.icon as any} size={10} color={nt.color} />
                            <Txt style={{ fontSize: 10, color: nt.color }} numberOfLines={1}>{n.text}</Txt>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
              Harmonogram jest narzedziem planistycznym. Rzeczywisty czas budowy zalezy od projektu, pogody, wykonawcy i dostepnosci materialów.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
