import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { getStageByKey } from '@/features/house-build/stages';
import { getDependenciesForStage, getBlockingStages } from '@/features/house-build/dependencies';
import { getContractorMappingForStage } from '@/features/house-build/contractor-mapping';
import { timelineBudgetRepo } from '@/db/repositories/timeline-budget.repo';
import { houseBuildPricingRepo } from '@/db/repositories/house-build-pricing.repo';
import type { HouseBuildPriceReference, HouseBuildPriceOverride } from '@/types/house-build';
import type {
  TimelineStageRecord,
  TimelineStageStatus,
  StageManagementMode,
  StageBudgetItem,
  StageProfessionalPlan,
  TimelineNoteRecord,
  TimelineNoteType,
  ProfessionalNeedState,
} from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const STATUS_OPTIONS: { value: TimelineStageStatus; label: string; color: string }[] = [
  { value: 'not-started', label: 'Nie rozpoczety', color: Colors.textMuted },
  { value: 'in-progress', label: 'W trakcie', color: HB_ACCENT },
  { value: 'waiting-for-verification', label: 'Oczekuje weryfikacji', color: '#D97706' },
  { value: 'ready-for-next-stage', label: 'Gotowy do nastepnego', color: '#16A34A' },
  { value: 'blocked', label: 'Zablokowany', color: '#DC2626' },
  { value: 'completed', label: 'Zakonczony', color: '#16A34A' },
  { value: 'skipped', label: 'Pominiety', color: Colors.textMuted },
];

const MGMT_OPTIONS: { value: StageManagementMode; label: string }[] = [
  { value: 'self', label: 'Wlasne zarzadzanie' },
  { value: 'contractor', label: 'Wykonawca' },
  { value: 'mixed', label: 'Mieszane' },
];

const NEED_LABELS: Record<ProfessionalNeedState, { label: string; color: string }> = {
  'not-decided': { label: 'Niezdecydowany', color: Colors.textMuted },
  'has-contractor': { label: 'Mam wykonawce', color: '#16A34A' },
  'search-later': { label: 'Szukam pózniej', color: '#D97706' },
  'owner-managed': { label: 'Sam zarzadzam', color: HB_ACCENT },
};

const NOTE_TYPES: { value: TimelineNoteType; label: string }[] = [
  { value: 'weather-sensitive', label: 'Pogoda' },
  { value: 'waiting-for-inspection', label: 'Inspekcja' },
  { value: 'waiting-for-materials', label: 'Materialy' },
  { value: 'waiting-for-contractor', label: 'Wykonawca' },
  { value: 'decision-required', label: 'Decyzja' },
  { value: 'custom', label: 'Inne' },
];

export default function StagePlanScreen() {
  const { projectId, stageKey } = useLocalSearchParams<{ projectId: string; stageKey: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const stage = getStageByKey(stageKey);
  const deps = getDependenciesForStage(stageKey);
  const contractorMapping = getContractorMappingForStage(stageKey);

  const [timeline, setTimeline] = useState<TimelineStageRecord | null>(null);
  const [budgetItems, setBudgetItems] = useState<StageBudgetItem[]>([]);
  const [profPlans, setProfPlans] = useState<StageProfessionalPlan[]>([]);
  const [notes, setNotes] = useState<TimelineNoteRecord[]>([]);
  const [customName, setCustomName] = useState('');
  const [customWeeks, setCustomWeeks] = useState('');
  const [stageNotes, setStageNotes] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteType, setNewNoteType] = useState<TimelineNoteType>('custom');
  const [newNoteText, setNewNoteText] = useState('');
  const [stageRefs, setStageRefs] = useState<HouseBuildPriceReference[]>([]);
  const [stageOverrides, setStageOverrides] = useState<HouseBuildPriceOverride[]>([]);

  const loadData = useCallback(async () => {
    if (!projectId || !stageKey) return;
    const [stages, items, plans, n] = await Promise.all([
      timelineBudgetRepo.getTimelineStages(projectId),
      timelineBudgetRepo.getBudgetItems(projectId, stageKey),
      timelineBudgetRepo.getProfessionalPlans(projectId, stageKey),
      timelineBudgetRepo.getTimelineNotes(projectId, stageKey),
    ]);
    const tl = stages.find((s) => s.stageKey === stageKey) ?? null;
    setTimeline(tl);
    setBudgetItems(items);
    setProfPlans(plans);
    setNotes(n);
    await houseBuildPricingRepo.seedReferences();
    const refs = await houseBuildPricingRepo.getReferencesByStage(stageKey);
    setStageRefs(refs);
    const ovs = await houseBuildPricingRepo.getOverrides(projectId);
    setStageOverrides(ovs);
    setCustomName(tl?.customName ?? '');
    setCustomWeeks(tl?.estimatedWeeks?.toString() ?? '');
    setStageNotes(tl?.notes ?? '');
  }, [projectId, stageKey]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleStatusChange = useCallback(async (status: TimelineStageStatus) => {
    if (!projectId) return;
    if (status !== 'not-started' && status !== 'skipped' && status !== 'blocked') {
      const allStages = await timelineBudgetRepo.getTimelineStages(projectId);
      const done = allStages
        .filter((s) => s.status === 'completed' || s.status === 'ready-for-next-stage')
        .map((s) => s.stageKey);
      const blocking = getBlockingStages(stageKey, done);
      if (blocking.length > 0) {
        Alert.alert('Etap zablokowany', 'Najpierw zakoncz wczesniejsze etapy: ' + blocking.join(', '));
        return;
      }
    }
    await timelineBudgetRepo.upsertTimelineStage(projectId, stageKey, { status });
    await loadData();
  }, [projectId, stageKey, loadData]);

  const handleMgmtChange = useCallback(async (mode: StageManagementMode) => {
    if (!projectId) return;
    await timelineBudgetRepo.upsertTimelineStage(projectId, stageKey, { managementMode: mode });
    await loadData();
  }, [projectId, stageKey, loadData]);

  const handleSaveCustom = useCallback(async () => {
    if (!projectId) return;
    await timelineBudgetRepo.upsertTimelineStage(projectId, stageKey, {
      customName: customName.trim() || null,
      estimatedWeeks: customWeeks ? parseInt(customWeeks) : null,
      notes: stageNotes,
    });
    await loadData();
  }, [projectId, stageKey, customName, customWeeks, stageNotes, loadData]);

  const handleAddNote = useCallback(async () => {
    if (!projectId || !newNoteText.trim()) return;
    await timelineBudgetRepo.addTimelineNote(projectId, stageKey, {
      noteType: newNoteType,
      text: newNoteText.trim(),
    });
    setNewNoteText('');
    setShowAddNote(false);
    await loadData();
  }, [projectId, stageKey, newNoteType, newNoteText, loadData]);

  const handleDeleteNote = useCallback(async (id: string) => {
    await timelineBudgetRepo.deleteTimelineNote(id);
    await loadData();
  }, [loadData]);

  const handleProfNeedChange = useCallback(async (role: string, current: ProfessionalNeedState) => {
    if (!projectId) return;
    const cycle: ProfessionalNeedState[] = ['not-decided', 'has-contractor', 'search-later', 'owner-managed'];
    const idx = cycle.indexOf(current);
    const next = cycle[(idx + 1) % cycle.length];
    await timelineBudgetRepo.upsertProfessionalPlan(projectId, stageKey, role as any, { needState: next });
    await loadData();
  }, [projectId, stageKey, loadData]);

  if (!stage) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: Colors.textMuted }}>Etap nie znaleziony</Txt>
      </View>
    );
  }

  const currentStatus = timeline?.status ?? 'not-started';
  const currentMgmt = timeline?.managementMode ?? 'self';
  const budgetTotal = budgetItems.reduce((s, i) => s + (i.userOverride ?? i.amountLow ?? 0), 0);

  return (
    <>
      <Stack.Screen options={{ title: `Plan: ${stage.name}` }} />
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Feather name={stage.icon as any} size={20} color={HB_ACCENT} />
              <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{stage.name}</Txt>
            </View>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{stage.description}</Txt>
          </View>

          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Status etapu</Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={{
                    backgroundColor: currentStatus === opt.value ? opt.color : Colors.surface,
                    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
                    borderWidth: 1, borderColor: currentStatus === opt.value ? opt.color : Colors.border,
                  }}
                  onPress={() => handleStatusChange(opt.value)}
                >
                  <Txt style={{ fontSize: 11, color: currentStatus === opt.value ? '#fff' : Colors.text }}>{opt.label}</Txt>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Zarzadzanie</Txt>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
            {MGMT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={{
                  flex: 1,
                  backgroundColor: currentMgmt === opt.value ? HB_ACCENT : Colors.surface,
                  borderRadius: 8, paddingVertical: 8, alignItems: 'center',
                  borderWidth: 1, borderColor: currentMgmt === opt.value ? HB_ACCENT : Colors.border,
                }}
                onPress={() => handleMgmtChange(opt.value)}
              >
                <Txt style={{ fontSize: 11, color: currentMgmt === opt.value ? '#fff' : Colors.text }}>{opt.label}</Txt>
              </TouchableOpacity>
            ))}
          </View>

          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Edycja</Txt>
          <View style={{
            backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 16,
            borderWidth: 1, borderColor: Colors.border,
          }}>
            <TextInput
              style={{ borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 8, marginBottom: 10, fontSize: 14, color: Colors.text }}
              placeholder="Wlasna nazwa etapu (opcjonalnie)"
              placeholderTextColor={Colors.textMuted}
              value={customName}
              onChangeText={setCustomName}
            />
            <TextInput
              style={{ borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 8, marginBottom: 10, fontSize: 14, color: Colors.text }}
              placeholder="Szacowany czas (tygodnie)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={customWeeks}
              onChangeText={setCustomWeeks}
            />
            <TextInput
              style={{ fontSize: 14, color: Colors.text, minHeight: 60, textAlignVertical: 'top' }}
              placeholder="Notatki do etapu..."
              placeholderTextColor={Colors.textMuted}
              multiline
              value={stageNotes}
              onChangeText={setStageNotes}
            />
            <TouchableOpacity
              style={{ backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 10 }}
              onPress={handleSaveCustom}
            >
              <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>Zapisz</Txt>
            </TouchableOpacity>
          </View>

          {deps && deps.dependsOn.length > 0 && (
            <View style={{
              backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 16,
              borderWidth: 1, borderColor: '#FECACA',
            }}>
              <Txt w="semibold" style={{ fontSize: 13, color: '#DC2626', marginBottom: 6 }}>Zaleznosci</Txt>
              {deps.dependsOn.map((d) => (
                <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Feather name="arrow-left" size={12} color="#DC2626" />
                  <Txt style={{ fontSize: 12, color: '#991B1B' }}>Wymaga: {d}</Txt>
                </View>
              ))}
            </View>
          )}

          {stage.professionalLabels.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Zespol / specjalisci</Txt>
              {stage.professionalLabels.map((p, i) => {
                const plan = profPlans.find((pp) => pp.role === p.role);
                const need = plan?.needState ?? 'not-decided';
                const needInfo = NEED_LABELS[need];
                return (
                  <TouchableOpacity
                    key={i}
                    style={{
                      backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 4,
                      flexDirection: 'row', alignItems: 'center', gap: 10,
                      borderWidth: 1, borderColor: Colors.border,
                    }}
                    onPress={() => handleProfNeedChange(p.role, need)}
                    activeOpacity={0.85}
                  >
                    <Feather name="user" size={14} color="#6D28D9" />
                    <View style={{ flex: 1 }}>
                      <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{p.label}</Txt>
                    </View>
                    <View style={{ backgroundColor: '#F8FAFC', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Txt style={{ fontSize: 9, color: needInfo.color }}>{needInfo.label}</Txt>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {contractorMapping && (
            <View style={{ marginBottom: 16 }}>
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Wykonawca</Txt>
              <View style={{
                backgroundColor: '#F5F3FF', borderRadius: 12, padding: 14,
                borderWidth: 1, borderColor: '#DDD6FE',
              }}>
                <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>{contractorMapping.label}</Txt>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, paddingVertical: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}
                    onPress={() => router.push({ pathname: '/house-build/stage-contractors' as any, params: { projectId, stageKey } })}
                  >
                    <Feather name="users" size={12} color="#FFFFFF" />
                    <Txt style={{ fontSize: 10, color: '#FFFFFF' }}>Planowanie</Txt>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#059669', borderRadius: 8, paddingVertical: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}
                    onPress={() => router.push({ pathname: '/contractor/results' as any, params: { fromHouseBuild: '1', stageKey, projectId } })}
                  >
                    <Feather name="search" size={12} color="#FFFFFF" />
                    <Txt style={{ fontSize: 10, color: '#FFFFFF' }}>Szukaj</Txt>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#7C3AED', borderRadius: 8, paddingVertical: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}
                    onPress={() => router.push({ pathname: '/house-build/stage-request-prep' as any, params: { projectId, stageKey } })}
                  >
                    <Feather name="edit-3" size={12} color="#FFFFFF" />
                    <Txt style={{ fontSize: 10, color: '#FFFFFF' }}>Zapytanie</Txt>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {budgetItems.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Budzet etapu</Txt>
              {budgetItems.map((item) => (
                <View key={item.id} style={{
                  backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginBottom: 4,
                  flexDirection: 'row', alignItems: 'center',
                }}>
                  <Txt style={{ fontSize: 12, color: Colors.text, flex: 1 }}>{item.label}</Txt>
                  <Txt w="semibold" style={{ fontSize: 11, color: HB_ACCENT }}>
                    {(item.userOverride ?? item.amountLow ?? 0).toLocaleString('pl-PL')} zl
                  </Txt>
                </View>
              ))}
              <Txt w="semibold" style={{ fontSize: 12, color: HB_ACCENT, textAlign: 'right', marginTop: 4 }}>
                Razem: {budgetTotal.toLocaleString('pl-PL')} zl
              </Txt>
            </View>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 16,
              borderWidth: 1, borderColor: Colors.border,
              flexDirection: 'row', alignItems: 'center', gap: 10,
            }}
            onPress={() => router.push({ pathname: '/house-build/budget', params: { projectId } })}
          >
            <Feather name="dollar-sign" size={16} color={HB_ACCENT} />
            <Txt w="semibold" style={{ fontSize: 13, color: HB_ACCENT }}>Otworz budzet etapu</Txt>
          </TouchableOpacity>

          <View style={{ marginBottom: 16 }}>
            <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Ceny referencyjne dla etapu</Txt>
            {stageRefs.length > 0 ? (
              <>
                {stageRefs.map((ref) => {
                  const ov = stageOverrides.find((o) => o.referenceId === ref.id);
                  const dMin = ov?.overrideMin ?? ref.priceMin;
                  const dMax = ov?.overrideMax ?? ref.priceMax;
                  const isRegional = ref.regionCode !== 'PL';
                  return (
                    <View key={ref.id} style={{
                      backgroundColor: ov ? '#F0FDF4' : '#F8FAFC',
                      borderRadius: 8, padding: 10, marginBottom: 4,
                      borderWidth: 1, borderColor: ov ? '#BBF7D0' : '#E2E8F0',
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Txt style={{ fontSize: 11, color: Colors.text }}>{ref.label}</Txt>
                          <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{ref.unit} | {ref.regionLabel}</Txt>
                        </View>
                        <Txt w="semibold" style={{ fontSize: 12, color: ov ? '#16A34A' : HB_ACCENT }}>
                          {dMin === dMax
                            ? dMin.toLocaleString('pl-PL', { maximumFractionDigits: 2 })
                            : `${dMin.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} - ${dMax.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}`
                          } zl
                        </Txt>
                      </View>
                      {isRegional && (
                        <Txt style={{ fontSize: 8, color: '#D97706', marginTop: 2 }}>
                          Stawka regionalna ({ref.regionLabel}) - lokalne warunki rynkowe moga sie roznic.
                        </Txt>
                      )}
                    </View>
                  );
                })}
                <TouchableOpacity
                  style={{ alignItems: 'center', paddingVertical: 6 }}
                  onPress={() => router.push({ pathname: '/house-build/pricing-references' as any, params: { projectId } })}
                >
                  <Txt style={{ fontSize: 11, color: HB_ACCENT }}>Zobacz pelna baze cenowa</Txt>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{
                backgroundColor: '#F8FAFC', borderRadius: 8, padding: 12,
                borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
              }}>
                <Feather name="database" size={16} color={Colors.textMuted} />
                <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 4 }}>
                  Brak danych cenowych przypisanych do tego etapu.
                </Txt>
                <TouchableOpacity
                  style={{ marginTop: 6 }}
                  onPress={() => router.push({ pathname: '/house-build/pricing-references' as any, params: { projectId } })}
                >
                  <Txt style={{ fontSize: 11, color: HB_ACCENT }}>Przegladaj pelna baze cenowa</Txt>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Notatki i ryzyka</Txt>
          {notes.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={{
                backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 4,
                flexDirection: 'row', alignItems: 'center', gap: 8,
              }}
              onLongPress={() => handleDeleteNote(n.id)}
            >
              <Feather name="message-circle" size={12} color={Colors.textMuted} />
              <Txt style={{ fontSize: 12, color: Colors.text, flex: 1 }}>{n.text}</Txt>
              <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{n.noteType}</Txt>
            </TouchableOpacity>
          ))}

          {showAddNote ? (
            <View style={{
              backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 16,
              borderWidth: 1, borderColor: '#BFDBFE',
            }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {NOTE_TYPES.map((nt) => (
                    <TouchableOpacity
                      key={nt.value}
                      style={{
                        backgroundColor: newNoteType === nt.value ? HB_ACCENT : '#F1F5F9',
                        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
                      }}
                      onPress={() => setNewNoteType(nt.value)}
                    >
                      <Txt style={{ fontSize: 10, color: newNoteType === nt.value ? '#fff' : Colors.text }}>{nt.label}</Txt>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TextInput
                style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 }}
                placeholder="Tresc notatki..."
                placeholderTextColor={Colors.textMuted}
                value={newNoteText}
                onChangeText={setNewNoteText}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }} onPress={handleAddNote}>
                  <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>Dodaj</Txt>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setShowAddNote(false)}>
                  <Txt style={{ fontSize: 13, color: Colors.text }}>Anuluj</Txt>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 10 }} onPress={() => setShowAddNote(true)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="plus" size={14} color={HB_ACCENT} />
                <Txt style={{ fontSize: 12, color: HB_ACCENT }}>Dodaj notatke / ryzyko</Txt>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
}
