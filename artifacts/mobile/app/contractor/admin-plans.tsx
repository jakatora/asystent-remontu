import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { contractorPlansRepo } from '@/db/repositories/contractor-plans.repo';
import { SEED_PLANS } from '@/features/contractor/plan-seed-data';
import { exportCurrentData, applyImportData, validateImportData } from '@/features/contractor/plan-import-export';
import { useContractor } from '@/context/ContractorContext';
import type {
  ContractorPlanDefinition,
  ContractorPlanAssignment,
  PromotionSlot,
  BillingEvent,
  ContractorPlanId,
  AssignmentState,
  PromotionSlotScope,
} from '@/types/contractor-plans';
import {
  PLAN_COLORS,
  PLAN_ICONS,
  PLAN_LABELS,
  ASSIGNMENT_STATE_LABELS,
  ASSIGNMENT_STATE_COLORS,
  PROMOTION_SLOT_SCOPE_LABELS,
} from '@/types/contractor-plans';

type AdminTab = 'plans' | 'assignments' | 'promotion-slots' | 'billing-events' | 'import-export';

const TABS: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'plans', label: 'Plany', icon: 'layers' },
  { key: 'assignments', label: 'Przypisania', icon: 'users' },
  { key: 'promotion-slots', label: 'Sloty', icon: 'star' },
  { key: 'billing-events', label: 'Zdarzenia', icon: 'activity' },
  { key: 'import-export', label: 'Import/Export', icon: 'download' },
];

export default function AdminPlansScreen() {
  const insets = useSafeAreaInsets();
  const { contractors } = useContractor();
  const [activeTab, setActiveTab] = useState<AdminTab>('plans');
  const [loading, setLoading] = useState(true);

  const [plans, setPlans] = useState<ContractorPlanDefinition[]>([]);
  const [assignments, setAssignments] = useState<ContractorPlanAssignment[]>([]);
  const [slots, setSlots] = useState<PromotionSlot[]>([]);
  const [billingEvents, setBillingEvents] = useState<BillingEvent[]>([]);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<ContractorPlanId>('free');
  const [assignNotes, setAssignNotes] = useState('');

  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotContractorId, setSlotContractorId] = useState('');
  const [slotScope, setSlotScope] = useState<PromotionSlotScope>('city');
  const [slotScopeValue, setSlotScopeValue] = useState('');
  const [slotLabel, setSlotLabel] = useState('');

  const [importText, setImportText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let dbPlans = await contractorPlansRepo.getAllPlans();
      if (dbPlans.length === 0) {
        for (const seed of SEED_PLANS) {
          await contractorPlansRepo.upsertPlan(seed);
        }
        dbPlans = await contractorPlansRepo.getAllPlans();
      }
      setPlans(dbPlans);
      setAssignments(await contractorPlansRepo.getAllAssignments());
      setSlots(await contractorPlansRepo.getActivePromotionSlots());
      setBillingEvents(await contractorPlansRepo.getAllBillingEvents());
    } catch (err) {
      console.error('Admin plans load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAssignPlan = async () => {
    if (!selectedContractorId) { Alert.alert('Blad', 'Wybierz wykonawce.'); return; }
    try {
      await contractorPlansRepo.assignPlan({
        contractorId: selectedContractorId,
        planId: selectedPlanId,
        state: 'manually_assigned',
        startDate: new Date().toISOString(),
        assignedBy: 'admin',
        notes: assignNotes || undefined,
      });
      await contractorPlansRepo.addBillingEvent({
        contractorId: selectedContractorId,
        eventType: 'manual_assignment',
        planId: selectedPlanId,
        providerType: 'admin_manual_assignment',
        notes: assignNotes || 'Przypisanie reczne przez admina',
      });
      setShowAssignModal(false);
      setSelectedContractorId('');
      setAssignNotes('');
      await load();
      Alert.alert('Sukces', 'Plan zostal przypisany.');
    } catch (err) {
      console.error('Assign plan error:', err);
      Alert.alert('Blad', 'Nie udalo sie przypisac planu.');
    }
  };

  const handleCreateSlot = async () => {
    if (!slotContractorId) { Alert.alert('Blad', 'Podaj ID wykonawcy.'); return; }
    try {
      await contractorPlansRepo.upsertPromotionSlot({
        contractorId: slotContractorId,
        scope: slotScope,
        scopeValue: slotScopeValue || undefined,
        label: slotLabel || PROMOTION_SLOT_SCOPE_LABELS[slotScope],
        priority: 1,
        isActive: true,
        startDate: new Date().toISOString(),
      });
      setShowSlotModal(false);
      setSlotContractorId('');
      setSlotScopeValue('');
      setSlotLabel('');
      await load();
      Alert.alert('Sukces', 'Slot promocyjny utworzony.');
    } catch (err) {
      console.error('Create slot error:', err);
      Alert.alert('Blad', 'Nie udalo sie utworzyc slotu.');
    }
  };

  const handleExport = async () => {
    try {
      const json = await exportCurrentData();
      Alert.alert('Export', `Wyeksportowano ${plans.length} planow, ${slots.length} slotow, ${assignments.length} przypisah.\n\nDane skopiowane do logu konsoli.`);
      console.log('PLAN_EXPORT_DATA:', json);
    } catch (err) {
      console.error('Export error:', err);
      Alert.alert('Blad', 'Nie udalo sie wyeksportowac danych.');
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) { Alert.alert('Blad', 'Wklej dane JSON.'); return; }
    const validation = validateImportData(importText);
    if (!validation.isValid) {
      Alert.alert('Blad walidacji', validation.errors.join('\n'));
      return;
    }
    if (validation.warnings.length > 0) {
      Alert.alert('Ostrzezenia', validation.warnings.join('\n'));
    }
    Alert.alert('Potwierdz import',
      `Planow: ${validation.planCount}, Slotow: ${validation.slotCount}, Przypisah: ${validation.assignmentCount}${validation.duplicates.length > 0 ? `\nDuplikaty: ${validation.duplicates.join(', ')}` : ''}`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Importuj', onPress: async () => {
          const result = await applyImportData(importText);
          Alert.alert(result.applied ? 'Sukces' : 'Blad', result.summary);
          if (result.applied) { setImportText(''); await load(); }
        }},
      ]
    );
  };

  const handleDeactivateSlot = (slotId: string) => {
    Alert.alert('Dezaktywuj slot', 'Czy na pewno chcesz dezaktywowac ten slot promocyjny?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Dezaktywuj', style: 'destructive', onPress: async () => {
        await contractorPlansRepo.deactivatePromotionSlot(slotId);
        await load();
      }},
    ]);
  };

  const handleSuspendAssignment = (contractorId: string) => {
    Alert.alert('Zawies plan', 'Czy na pewno chcesz zawiesic plan tego wykonawcy?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Zawies', style: 'destructive', onPress: async () => {
        await contractorPlansRepo.updateAssignmentState(contractorId, 'suspended', 'Zawieszony przez admina');
        await contractorPlansRepo.addBillingEvent({
          contractorId,
          eventType: 'plan_suspended',
          planId: 'free',
          providerType: 'admin_manual_assignment',
          notes: 'Zawieszony przez admina',
        });
        await load();
      }},
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Zarzadzanie planami' }} />
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={{ padding: 16 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
            <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>Panel planow wykonawcow</Txt>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <StatBox label="Plany" value={plans.length} color="#2563EB" />
              <StatBox label="Przypisania" value={assignments.length} color="#7C3AED" />
              <StatBox label="Sloty" value={slots.length} color="#D97706" />
              <StatBox label="Zdarzenia" value={billingEvents.length} color="#059669" />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={{ backgroundColor: activeTab === tab.key ? '#2563EB' : '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: activeTab === tab.key ? '#2563EB' : '#E2E8F0' }}
                >
                  <Feather name={tab.icon as any} size={12} color={activeTab === tab.key ? '#FFFFFF' : Colors.textMuted} />
                  <Txt style={{ fontSize: 11, color: activeTab === tab.key ? '#FFFFFF' : Colors.text }}>{tab.label}</Txt>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {loading && <ActivityIndicator size="large" color="#2563EB" />}

          {!loading && activeTab === 'plans' && (
            <View>
              {plans.map((plan) => (
                <View key={plan.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: plan.color + '40', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name={PLAN_ICONS[plan.id] as any} size={14} color={plan.color} />
                    <Txt w="bold" style={{ fontSize: 13, color: plan.color }}>{plan.name}</Txt>
                    <View style={{ backgroundColor: plan.status === 'active' ? '#ECFDF5' : '#FEF2F2', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Txt style={{ fontSize: 8, color: plan.status === 'active' ? '#059669' : '#DC2626' }}>{plan.status}</Txt>
                    </View>
                  </View>
                  <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{plan.shortDescription}</Txt>
                  <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>
                    {plan.monthlyPricePlaceholder > 0 ? `${plan.monthlyPricePlaceholder} zl/mies.` : 'Za darmo'}
                    {' | '}Sloty: {plan.entitlements.maxPromotionSlots} | Specjalizacje: {plan.entitlements.maxSpecialtiesPlaceholder}
                  </Txt>
                  {plan.notes && <Txt style={{ fontSize: 9, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' }}>{plan.notes}</Txt>}
                </View>
              ))}
            </View>
          )}

          {!loading && activeTab === 'assignments' && (
            <View>
              <TouchableOpacity
                onPress={() => setShowAssignModal(true)}
                style={{ backgroundColor: '#2563EB', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginBottom: 10 }}
              >
                <Txt w="semibold" style={{ fontSize: 12, color: '#FFFFFF' }}>Przypisz plan do wykonawcy</Txt>
              </TouchableOpacity>
              {assignments.length === 0 && <EmptyCard text="Brak przypisah" icon="users" />}
              {assignments.map((a) => {
                const c = contractors.find((ct) => ct.id === a.contractorId);
                return (
                  <View key={a.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{c?.displayName ?? a.contractorId}</Txt>
                      <View style={{ backgroundColor: ASSIGNMENT_STATE_COLORS[a.state] + '15', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                        <Txt style={{ fontSize: 9, color: ASSIGNMENT_STATE_COLORS[a.state] }}>{ASSIGNMENT_STATE_LABELS[a.state]}</Txt>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      <Txt style={{ fontSize: 10, color: PLAN_COLORS[a.planId] }}>Plan: {PLAN_LABELS[a.planId] ?? a.planId}</Txt>
                      <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Od: {new Date(a.startDate).toLocaleDateString('pl-PL')}</Txt>
                      <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Przez: {a.assignedBy}</Txt>
                    </View>
                    {a.state !== 'suspended' && (
                      <TouchableOpacity onPress={() => handleSuspendAssignment(a.contractorId)} style={{ marginTop: 6 }}>
                        <Txt style={{ fontSize: 10, color: '#DC2626' }}>Zawies</Txt>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {!loading && activeTab === 'promotion-slots' && (
            <View>
              <TouchableOpacity
                onPress={() => setShowSlotModal(true)}
                style={{ backgroundColor: '#D97706', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginBottom: 10 }}
              >
                <Txt w="semibold" style={{ fontSize: 12, color: '#FFFFFF' }}>Utworz slot promocyjny</Txt>
              </TouchableOpacity>
              {slots.length === 0 && <EmptyCard text="Brak aktywnych slotow" icon="star" />}
              {slots.map((s) => (
                <View key={s.id} style={{ backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Txt w="semibold" style={{ fontSize: 12, color: '#D97706' }}>{s.label || PROMOTION_SLOT_SCOPE_LABELS[s.scope as PromotionSlotScope]}</Txt>
                    <Txt style={{ fontSize: 9, color: Colors.textMuted }}>Priorytet: {s.priority}</Txt>
                  </View>
                  <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>
                    Wykonawca: {s.contractorId} | Zakres: {s.scope}{s.scopeValue ? ` (${s.scopeValue})` : ''}
                  </Txt>
                  <Txt style={{ fontSize: 9, color: Colors.textMuted }}>Od: {new Date(s.startDate).toLocaleDateString('pl-PL')}{s.endDate ? ` Do: ${new Date(s.endDate).toLocaleDateString('pl-PL')}` : ''}</Txt>
                  <TouchableOpacity onPress={() => handleDeactivateSlot(s.id)} style={{ marginTop: 4 }}>
                    <Txt style={{ fontSize: 10, color: '#DC2626' }}>Dezaktywuj</Txt>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {!loading && activeTab === 'billing-events' && (
            <View>
              {billingEvents.length === 0 && <EmptyCard text="Brak zdarzen rozliczeniowych" icon="activity" />}
              {billingEvents.map((e) => (
                <View key={e.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 }}>
                  <Txt w="semibold" style={{ fontSize: 11, color: Colors.text }}>{e.eventType}</Txt>
                  <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
                    Wykonawca: {e.contractorId} | Plan: {e.planId} | Przez: {e.providerType}
                  </Txt>
                  {e.notes && <Txt style={{ fontSize: 9, color: Colors.textMuted, fontStyle: 'italic' }}>{e.notes}</Txt>}
                  <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{new Date(e.createdAt).toLocaleDateString('pl-PL')}</Txt>
                </View>
              ))}
            </View>
          )}

          {!loading && activeTab === 'import-export' && (
            <View>
              <TouchableOpacity
                onPress={handleExport}
                style={{ backgroundColor: '#059669', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginBottom: 10 }}
              >
                <Txt w="semibold" style={{ fontSize: 12, color: '#FFFFFF' }}>Eksportuj dane (JSON)</Txt>
              </TouchableOpacity>

              <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 6 }}>Import JSON</Txt>
              <TextInput
                style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 11, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 100, textAlignVertical: 'top', marginBottom: 8, fontFamily: 'monospace' }}
                value={importText}
                onChangeText={setImportText}
                multiline
                placeholder='{"version":"1.0","plans":[...]}'
                placeholderTextColor={Colors.textMuted}
              />
              <TouchableOpacity
                onPress={handleImport}
                style={{ backgroundColor: '#2563EB', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
              >
                <Txt w="semibold" style={{ fontSize: 12, color: '#FFFFFF' }}>Waliduj i importuj</Txt>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showAssignModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>Przypisz plan</Txt>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Feather name="x" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 4 }}>Wykonawca</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {contractors.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedContractorId(c.id)}
                    style={{ backgroundColor: selectedContractorId === c.id ? '#2563EB' : '#F8FAFC', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: selectedContractorId === c.id ? '#2563EB' : '#E2E8F0' }}
                  >
                    <Txt style={{ fontSize: 10, color: selectedContractorId === c.id ? '#FFFFFF' : Colors.text }}>{c.displayName}</Txt>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 4 }}>Plan</Txt>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {plans.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPlanId(p.id)}
                  style={{ backgroundColor: selectedPlanId === p.id ? p.color : '#F8FAFC', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: selectedPlanId === p.id ? p.color : '#E2E8F0' }}
                >
                  <Txt style={{ fontSize: 10, color: selectedPlanId === p.id ? '#FFFFFF' : Colors.text }}>{p.name}</Txt>
                </TouchableOpacity>
              ))}
            </View>

            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 4 }}>Notatki (opcjonalnie)</Txt>
            <TextInput
              style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }}
              value={assignNotes}
              onChangeText={setAssignNotes}
              placeholder="Notatka..."
              placeholderTextColor={Colors.textMuted}
            />

            <TouchableOpacity
              onPress={handleAssignPlan}
              style={{ backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
            >
              <Txt w="semibold" style={{ fontSize: 13, color: '#FFFFFF' }}>Przypisz plan</Txt>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSlotModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>Nowy slot promocyjny</Txt>
              <TouchableOpacity onPress={() => setShowSlotModal(false)}>
                <Feather name="x" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 4 }}>ID Wykonawcy</Txt>
            <TextInput
              style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 }}
              value={slotContractorId}
              onChangeText={setSlotContractorId}
              placeholder="np. c-001"
              placeholderTextColor={Colors.textMuted}
            />

            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 4 }}>Zakres</Txt>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {(['city', 'category', 'stage', 'featured-global'] as PromotionSlotScope[]).map((scope) => (
                <TouchableOpacity
                  key={scope}
                  onPress={() => setSlotScope(scope)}
                  style={{ backgroundColor: slotScope === scope ? '#D97706' : '#F8FAFC', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: slotScope === scope ? '#D97706' : '#E2E8F0' }}
                >
                  <Txt style={{ fontSize: 10, color: slotScope === scope ? '#FFFFFF' : Colors.text }}>{PROMOTION_SLOT_SCOPE_LABELS[scope]}</Txt>
                </TouchableOpacity>
              ))}
            </View>

            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 4 }}>Wartosc zakresu (opcjonalnie)</Txt>
            <TextInput
              style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 }}
              value={slotScopeValue}
              onChangeText={setSlotScopeValue}
              placeholder="np. Warszawa lub paint"
              placeholderTextColor={Colors.textMuted}
            />

            <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 4 }}>Etykieta (opcjonalnie)</Txt>
            <TextInput
              style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }}
              value={slotLabel}
              onChangeText={setSlotLabel}
              placeholder="np. Promowany malarz Warszawa"
              placeholderTextColor={Colors.textMuted}
            />

            <TouchableOpacity
              onPress={handleCreateSlot}
              style={{ backgroundColor: '#D97706', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
            >
              <Txt w="semibold" style={{ fontSize: 13, color: '#FFFFFF' }}>Utworz slot</Txt>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: color + '10', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center' }}>
      <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{label}</Txt>
      <Txt w="bold" style={{ fontSize: 16, color }}>{value}</Txt>
    </View>
  );
}

function EmptyCard({ text, icon }: { text: string; icon: string }) {
  return (
    <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
      <Feather name={icon as any} size={20} color={Colors.textMuted} />
      <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 6 }}>{text}</Txt>
    </View>
  );
}
