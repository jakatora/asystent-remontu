import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { utilityPlansRepo } from '@/db/repositories/utility-plans.repo';
import type { UtilityConnectionPlan, UtilityConnectionStatus, UtilityType, UtilityReadinessSummary } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const UTILITY_CONFIG: Record<UtilityType, { label: string; icon: string; color: string; route: string }> = {
  electricity: { label: 'Prad', icon: 'zap', color: '#F59E0B', route: 'utility-electricity' },
  water: { label: 'Woda', icon: 'droplet', color: '#3B82F6', route: 'utility-water' },
  sewage: { label: 'Kanalizacja', icon: 'git-merge', color: '#6B7280', route: 'utility-sewer' },
  gas: { label: 'Gaz', icon: 'thermometer', color: '#EF4444', route: 'utility-gas' },
  telecom: { label: 'Internet', icon: 'wifi', color: '#8B5CF6', route: 'utility-internet' },
  heating: { label: 'Ogrzewanie', icon: 'sun', color: '#F97316', route: 'utility-electricity' },
};

const STATUS_LABELS: Record<UtilityConnectionStatus, { label: string; color: string; bg: string }> = {
  'not-planned': { label: 'Nie zaplanowane', color: Colors.textMuted, bg: '#F1F5F9' },
  'planning': { label: 'Planowanie', color: '#D97706', bg: '#FFFBEB' },
  'application-prepared': { label: 'Wniosek gotowy', color: '#7C3AED', bg: '#F5F3FF' },
  'conditions-received': { label: 'Warunki otrzymane', color: HB_ACCENT, bg: HB_ACCENT_BG },
  'agreement-signed': { label: 'Umowa podpisana', color: '#0891B2', bg: '#ECFEFF' },
  'in-progress': { label: 'W realizacji', color: '#D97706', bg: '#FFFBEB' },
  'connected': { label: 'Podlaczone', color: '#16A34A', bg: '#F0FDF4' },
  'not-applicable': { label: 'Nie dotyczy', color: Colors.textMuted, bg: '#F1F5F9' },
};

const UTILITY_TYPES: UtilityType[] = ['electricity', 'water', 'sewage', 'gas', 'telecom'];

export default function UtilityHubScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [plans, setPlans] = useState<UtilityConnectionPlan[]>([]);
  const [summary, setSummary] = useState<UtilityReadinessSummary | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    const existing = await utilityPlansRepo.getPlans(projectId);
    if (existing.length === 0) {
      for (const type of UTILITY_TYPES) {
        await utilityPlansRepo.upsertPlan(projectId, type, {});
      }
      const fresh = await utilityPlansRepo.getPlans(projectId);
      setPlans(fresh);
    } else {
      setPlans(existing);
    }
    const s = await utilityPlansRepo.getReadinessSummary(projectId);
    setSummary(s);
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const getPlanForType = (type: UtilityType): UtilityConnectionPlan | undefined =>
    plans.find((p) => p.utilityType === type);

  const connected = plans.filter((p) => p.status === 'connected' || p.status === 'not-applicable').length;
  const inProgress = plans.filter((p) => p.status !== 'not-planned' && p.status !== 'connected' && p.status !== 'not-applicable').length;
  const totalPlanned = plans.filter((p) => p.status !== 'not-applicable').length;

  return (
    <>
      <Stack.Screen options={{ title: 'Przylacza i media' }} />
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
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>Przylacza i media</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              Planowanie i sledzenie przylacz do sieci
            </Txt>
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Txt style={{ fontSize: 12, color: Colors.textMuted }}>Gotowosc</Txt>
                <Txt w="semibold" style={{ fontSize: 12, color: HB_ACCENT }}>{connected}/{totalPlanned}</Txt>
              </View>
              <View style={{ height: 6, backgroundColor: '#DBEAFE', borderRadius: 3 }}>
                <View style={{ height: 6, backgroundColor: connected === totalPlanned && totalPlanned > 0 ? '#16A34A' : HB_ACCENT, borderRadius: 3, width: `${totalPlanned > 0 ? (connected / totalPlanned) * 100 : 0}%` }} />
              </View>
              {inProgress > 0 && (
                <Txt style={{ fontSize: 11, color: '#D97706', marginTop: 6 }}>{inProgress} w trakcie realizacji</Txt>
              )}
              {summary && summary.blockedItems > 0 && (
                <Txt style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{summary.blockedItems} nieukonczone pozycje na checklistach</Txt>
              )}
              {summary && summary.unresolvedDecisions > 0 && (
                <Txt style={{ fontSize: 11, color: '#D97706', marginTop: 2 }}>{summary.unresolvedDecisions} nierozstrzygnietych decyzji</Txt>
              )}
            </View>
          </View>

          {UTILITY_TYPES.map((type) => {
            const config = UTILITY_CONFIG[type];
            const plan = getPlanForType(type);
            const status = plan?.status ?? 'not-planned';
            const sc = STATUS_LABELS[status] ?? STATUS_LABELS['not-planned'];

            return (
              <TouchableOpacity
                key={type}
                style={{
                  backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10,
                  borderWidth: 1, borderColor: status === 'connected' ? '#BBF7D0' : Colors.border,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
                onPress={() => router.push({ pathname: `/house-build/${config.route}` as any, params: { projectId } })}
                activeOpacity={0.85}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: sc.bg, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Feather name={config.icon as any} size={20} color={config.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{config.label}</Txt>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 2, alignItems: 'center' }}>
                    <View style={{ backgroundColor: sc.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                      <Txt style={{ fontSize: 9, color: sc.color }}>{sc.label}</Txt>
                    </View>
                    {plan?.providerName ? <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{plan.providerName}</Txt> : null}
                  </View>
                </View>
                <Feather name="chevron-right" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={{
              backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10,
              borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
              flexDirection: 'row', alignItems: 'center', gap: 12,
            }}
            onPress={() => router.push({ pathname: '/house-build/utility-alternatives' as any, params: { projectId } })}
            activeOpacity={0.85}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center',
            }}>
              <Feather name="refresh-cw" size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>Rozwiazania alternatywne</Txt>
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>Gdy siec publiczna nie jest dostepna</Txt>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={{
            backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginTop: 8,
            borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', gap: 8,
          }}>
            <Feather name="info" size={14} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 11, color: '#92400E', flex: 1 }}>
              To narzedzie do planowania — wymagania i procedury zaleza od lokalnego operatora/dostawcy. Zweryfikuj lokalnie.
            </Txt>
          </View>

          <View style={{ marginTop: 12 }}>
            <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, marginBottom: 8 }}>Powiazane etapy budowy</Txt>
            {[
              { stage: 'Przygotowanie terenu', link: 'Planowanie przylacz', icon: 'map' },
              { stage: 'Instalacje', link: 'Decyzje o przylaczach', icon: 'tool' },
              { stage: 'Zakonczenie budowy', link: 'Status przylacz', icon: 'check-circle' },
            ].map((item) => (
              <View key={item.stage} style={{
                backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 4,
                flexDirection: 'row', alignItems: 'center', gap: 8,
              }}>
                <Feather name={item.icon as any} size={14} color={HB_ACCENT} />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontSize: 12, color: Colors.text }}>{item.stage}</Txt>
                  <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{item.link}</Txt>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
