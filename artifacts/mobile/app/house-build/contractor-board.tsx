import { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { BUILD_STAGES } from '@/features/house-build/stages';
import { STAGE_CONTRACTOR_MAPPINGS } from '@/features/house-build/contractor-mapping';
import { houseBuildContractorsRepo } from '@/db/repositories/house-build-contractors.repo';
import type { StageContractorNeed, ContractorNeedStatus, StageContractorBoardRow } from '@/types/house-build';
import { CONTRACTOR_NEED_STATUS_LABELS, CONTRACTOR_NEED_STATUS_COLORS } from '@/types/house-build';

const HB_ACCENT = '#2563EB';

export default function ContractorBoardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<StageContractorBoardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const [needs, shortlistCounts] = await Promise.all([
        houseBuildContractorsRepo.getAllNeeds(projectId),
        houseBuildContractorsRepo.getShortlistCountByStage(projectId),
      ]);
      const needMap = new Map<string, StageContractorNeed>();
      for (const n of needs) needMap.set(n.stageKey, n);

      const mappedStages = STAGE_CONTRACTOR_MAPPINGS.map((m) => m.stageKey);
      const board: StageContractorBoardRow[] = BUILD_STAGES
        .filter((s) => mappedStages.includes(s.key))
        .map((s) => {
          const need = needMap.get(s.key);
          return {
            stageKey: s.key,
            stageName: s.name,
            status: (need?.status ?? 'needed') as ContractorNeedStatus,
            shortlistedCount: shortlistCounts[s.key] ?? 0,
            requestCount: need?.requestId ? 1 : 0,
            selectedContractorName: need?.selectedContractorName ?? null,
            notes: need?.notes ?? '',
          };
        });
      setRows(board);
    } catch (err) {
      console.error('Contractor board load error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;
  }

  const resolved = rows.filter((r) => r.status === 'selected' || r.status === 'not-needed').length;
  const total = rows.length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
        <Txt w="bold" style={{ fontSize: 16, color: HB_ACCENT, marginBottom: 4 }}>Tablica wykonawcow</Txt>
        <Txt style={{ fontSize: 12, color: Colors.textMuted }}>Planowanie wykonawcow etap po etapie</Txt>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <View style={{ backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Etapy</Txt>
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{total}</Txt>
          </View>
          <View style={{ backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Rozwiazane</Txt>
            <Txt w="bold" style={{ fontSize: 18, color: '#16A34A' }}>{resolved}</Txt>
          </View>
          <View style={{ backgroundColor: '#FFFBEB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Do ustalenia</Txt>
            <Txt w="bold" style={{ fontSize: 18, color: '#D97706' }}>{total - resolved}</Txt>
          </View>
        </View>
      </View>

      {rows.map((row) => {
        const statusColor = CONTRACTOR_NEED_STATUS_COLORS[row.status];
        const statusLabel = CONTRACTOR_NEED_STATUS_LABELS[row.status];
        return (
          <TouchableOpacity
            key={row.stageKey}
            onPress={() => router.push({ pathname: '/house-build/stage-contractors' as any, params: { projectId, stageKey: row.stageKey } })}
            style={{
              backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12,
              borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8,
              borderLeftWidth: 3, borderLeftColor: statusColor,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{row.stageName}</Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <View style={{ backgroundColor: statusColor + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Txt style={{ fontSize: 9, color: statusColor }}>{statusLabel}</Txt>
                  </View>
                  {row.shortlistedCount > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Feather name="list" size={10} color={Colors.textMuted} />
                      <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{row.shortlistedCount} na liscie</Txt>
                    </View>
                  )}
                </View>
                {row.selectedContractorName && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Feather name="check-circle" size={11} color="#16A34A" />
                    <Txt style={{ fontSize: 11, color: '#16A34A' }}>{row.selectedContractorName}</Txt>
                  </View>
                )}
                {row.notes ? <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 4 }} numberOfLines={1}>{row.notes}</Txt> : null}
              </View>
              <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        );
      })}

      {rows.length === 0 && (
        <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Feather name="users" size={24} color={Colors.textMuted} />
          <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 8 }}>Brak etapow wymagajacych wykonawcow</Txt>
        </View>
      )}
    </ScrollView>
  );
}
