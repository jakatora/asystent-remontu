import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useContractor } from '@/context/ContractorContext';
import { contractorPlansRepo } from '@/db/repositories/contractor-plans.repo';
import { SEED_PLANS } from '@/features/contractor/plan-seed-data';
import {
  resolveAccessState,
  buildPlanComparison,
  computeUsageVsLimits,
  getUnavailableEntitlements,
  getUpgradeSuggestion,
} from '@/features/contractor/contractor-plans';
import { billingProvider } from '@/features/contractor/billing-provider';
import type {
  ContractorPlanDefinition,
  ContractorPlanAssignment,
  ContractorUsageCounter,
  ContractorAccessState,
  UsageVsLimit,
  ContractorPlanId,
  PlanComparisonColumn,
} from '@/types/contractor-plans';
import {
  PLAN_COLORS,
  PLAN_ICONS,
  PLAN_LABELS,
  ASSIGNMENT_STATE_LABELS,
  ASSIGNMENT_STATE_COLORS,
  ENTITLEMENT_LABELS,
  ENTITLEMENT_ICONS,
} from '@/types/contractor-plans';

export default function ContractorPlansScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<ContractorPlanDefinition[]>([]);
  const [assignment, setAssignment] = useState<ContractorPlanAssignment | null>(null);
  const [counters, setCounters] = useState<ContractorUsageCounter[]>([]);
  const [accessState, setAccessState] = useState<ContractorAccessState | null>(null);
  const [comparison, setComparison] = useState<PlanComparisonColumn[]>([]);
  const [usageItems, setUsageItems] = useState<UsageVsLimit[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const { contractors } = useContractor();
  const currentContractorId = contractors.length > 0 ? contractors[0].id : 'c-001';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let dbPlans = await contractorPlansRepo.getActivePlans();
      if (dbPlans.length === 0) {
        for (const seed of SEED_PLANS) {
          await contractorPlansRepo.upsertPlan(seed);
        }
        dbPlans = await contractorPlansRepo.getActivePlans();
      }
      setPlans(dbPlans);

      const asgn = await contractorPlansRepo.getAssignment(currentContractorId);
      setAssignment(asgn);

      const plan = asgn ? dbPlans.find((p) => p.id === asgn.planId) ?? null : dbPlans[0] ?? null;
      const access = resolveAccessState(asgn, plan);
      setAccessState(access);

      const ctrs = await contractorPlansRepo.getUsageCounters(currentContractorId);
      setCounters(ctrs);
      setUsageItems(computeUsageVsLimits(ctrs));

      setComparison(buildPlanComparison(dbPlans, asgn?.planId));
    } catch (err) {
      console.error('Plans load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpgrade = async (planId: ContractorPlanId) => {
    const result = await billingProvider.initiatePurchase(currentContractorId, planId);
    Alert.alert(result.success ? 'Sukces' : 'Informacja', result.message);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Plany i Widocznosc' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </>
    );
  }

  const currentPlan = plans.find((p) => p.id === (accessState?.currentPlanId ?? 'free')) ?? plans[0];
  const upgradeTo = getUpgradeSuggestion(accessState?.currentPlanId ?? 'free');
  const upgradePlan = upgradeTo ? plans.find((p) => p.id === upgradeTo) : null;
  const unavailable = accessState ? getUnavailableEntitlements(accessState) : [];

  return (
    <>
      <Stack.Screen options={{ title: 'Plany i Widocznosc' }} />
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
        {currentPlan && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: currentPlan.color, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: currentPlan.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={PLAN_ICONS[currentPlan.id] as any} size={18} color={currentPlan.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>Plan: {currentPlan.name}</Txt>
                <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{currentPlan.shortDescription}</Txt>
              </View>
            </View>

            {assignment && (
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <View style={{ backgroundColor: ASSIGNMENT_STATE_COLORS[assignment.state] + '15', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Txt style={{ fontSize: 10, color: ASSIGNMENT_STATE_COLORS[assignment.state] }}>
                    {ASSIGNMENT_STATE_LABELS[assignment.state]}
                  </Txt>
                </View>
                {assignment.endDate && (
                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
                      Do: {new Date(assignment.endDate).toLocaleDateString('pl-PL')}
                    </Txt>
                  </View>
                )}
              </View>
            )}

            {currentPlan.monthlyPricePlaceholder > 0 && (
              <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
                {currentPlan.monthlyPricePlaceholder} zl/mies. | {currentPlan.yearlyPricePlaceholder} zl/rok
              </Txt>
            )}
          </View>
        )}

        {accessState && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
            <Txt w="bold" style={{ fontSize: 14, color: Colors.text, marginBottom: 10 }}>Aktywne uprawnienia</Txt>
            {(Object.entries(accessState.entitlements) as [string, boolean | number][]).map(([key, value]) => {
              if (typeof value === 'boolean' && !value) return null;
              const label = ENTITLEMENT_LABELS[key as keyof typeof ENTITLEMENT_LABELS] ?? key;
              const icon = ENTITLEMENT_ICONS[key as keyof typeof ENTITLEMENT_ICONS] ?? 'check';
              return (
                <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                  <Feather name={icon as any} size={12} color={typeof value === 'boolean' ? '#16A34A' : '#2563EB'} />
                  <Txt style={{ fontSize: 12, color: Colors.text, flex: 1 }}>{label}</Txt>
                  <Txt w="semibold" style={{ fontSize: 11, color: typeof value === 'boolean' ? '#16A34A' : '#2563EB' }}>
                    {typeof value === 'boolean' ? 'Tak' : String(value)}
                  </Txt>
                </View>
              );
            })}
          </View>
        )}

        {unavailable.length > 0 && (
          <View style={{ backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FECACA', marginBottom: 16 }}>
            <Txt w="bold" style={{ fontSize: 14, color: '#DC2626', marginBottom: 8 }}>Niedostepne funkcje</Txt>
            {unavailable.map((item) => (
              <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3 }}>
                <Feather name="lock" size={10} color="#DC2626" />
                <Txt style={{ fontSize: 11, color: '#DC2626' }}>{item.label}</Txt>
              </View>
            ))}
            {upgradePlan && (
              <Txt style={{ fontSize: 10, color: '#DC2626', marginTop: 6 }}>
                Dostepne w planie: {upgradePlan.name}
              </Txt>
            )}
          </View>
        )}

        {usageItems.length > 0 && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
            <Txt w="bold" style={{ fontSize: 14, color: Colors.text, marginBottom: 10 }}>Uzycie</Txt>
            {usageItems.map((item) => (
              <View key={item.key} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Txt style={{ fontSize: 11, color: Colors.text }}>{item.label}</Txt>
                  <Txt style={{ fontSize: 10, color: item.isAtLimit ? '#DC2626' : Colors.textMuted }}>{item.current} / {item.limit}</Txt>
                </View>
                <View style={{ height: 6, backgroundColor: '#F1F5F9', borderRadius: 3 }}>
                  <View style={{ width: `${Math.min(item.percentage, 100)}%`, height: 6, backgroundColor: item.isAtLimit ? '#DC2626' : item.percentage > 75 ? '#D97706' : '#16A34A', borderRadius: 3 }} />
                </View>
              </View>
            ))}
          </View>
        )}

        {accessState && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
            <Txt w="bold" style={{ fontSize: 14, color: Colors.text, marginBottom: 6 }}>Status widocznosci</Txt>
            <View style={{ gap: 4 }}>
              <StatusRow label="Widocznosc w wyszukiwarce" value={accessState.entitlements.canAppearInSearch} />
              <StatusRow label="Funkcje platne" value={accessState.canUsePaidFeatures} />
              <StatusRow label="Profil aktywny" value={accessState.isFullyActive} />
              <StatusRow label="Funkcje widocznosci" value={accessState.canUseVisibilityFeatures} />
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setShowComparison(!showComparison)}
          style={{ backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 }}
        >
          <Txt w="semibold" style={{ fontSize: 14, color: '#FFFFFF' }}>
            {showComparison ? 'Ukryj porownanie planow' : 'Porownaj plany'}
          </Txt>
        </TouchableOpacity>

        {showComparison && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {comparison.map((col) => (
                <View key={col.planId} style={{
                  width: 220, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
                  borderWidth: col.isRecommended ? 2 : 1,
                  borderColor: col.isRecommended ? '#7C3AED' : '#E2E8F0',
                }}>
                  {col.isRecommended && (
                    <View style={{ backgroundColor: '#7C3AED', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 }}>
                      <Txt style={{ fontSize: 8, color: '#FFFFFF' }}>Polecany</Txt>
                    </View>
                  )}
                  <Txt w="bold" style={{ fontSize: 16, color: PLAN_COLORS[col.planId as ContractorPlanId] }}>{col.name}</Txt>
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>{col.price}</Txt>
                  {col.features.map((f, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 }}>
                      <Feather
                        name={(typeof f.value === 'boolean' ? (f.value ? 'check' : 'x') : 'hash') as any}
                        size={10}
                        color={typeof f.value === 'boolean' ? (f.value ? '#16A34A' : '#DC2626') : '#2563EB'}
                      />
                      <Txt style={{ fontSize: 10, color: Colors.text, flex: 1 }}>{f.label}</Txt>
                      {typeof f.value === 'number' && (
                        <Txt w="semibold" style={{ fontSize: 10, color: '#2563EB' }}>{f.value}</Txt>
                      )}
                    </View>
                  ))}
                  {col.planId !== (accessState?.currentPlanId ?? 'free') && (
                    <TouchableOpacity
                      onPress={() => handleUpgrade(col.planId as ContractorPlanId)}
                      style={{ backgroundColor: PLAN_COLORS[col.planId as ContractorPlanId] + '15', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 10 }}
                    >
                      <Txt w="semibold" style={{ fontSize: 11, color: PLAN_COLORS[col.planId as ContractorPlanId] }}>Wybierz plan</Txt>
                    </TouchableOpacity>
                  )}
                  {col.planId === (accessState?.currentPlanId ?? 'free') && (
                    <View style={{ backgroundColor: '#ECFDF5', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 10 }}>
                      <Txt w="semibold" style={{ fontSize: 11, color: '#059669' }}>Aktualny plan</Txt>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <View style={{ gap: 8 }}>
          <ActionRow icon="credit-card" label="Historia rozliczen" sublabel="Placeholder - wkrotce" onPress={() => Alert.alert('Wkrotce', 'Historia rozliczen bedzie dostepna po uruchomieniu platnosci.')} />
          <ActionRow icon="headphones" label="Kontakt z pomoca" sublabel="pomoc@asystentremontu.pl" onPress={() => Alert.alert('Pomoc', 'Napisz do nas: pomoc@asystentremontu.pl')} />
        </View>
      </ScrollView>
    </>
  );
}

function StatusRow({ label, value }: { label: string; value: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Feather name={value ? 'check-circle' : 'x-circle'} size={12} color={value ? '#16A34A' : '#DC2626'} />
      <Txt style={{ fontSize: 12, color: Colors.text }}>{label}</Txt>
    </View>
  );
}

function ActionRow({ icon, label, sublabel, onPress }: { icon: string; label: string; sublabel: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', gap: 10 }}
    >
      <Feather name={icon as any} size={16} color={Colors.textMuted} />
      <View style={{ flex: 1 }}>
        <Txt w="medium" style={{ fontSize: 13, color: Colors.text }}>{label}</Txt>
        <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{sublabel}</Txt>
      </View>
      <Feather name="chevron-right" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}
