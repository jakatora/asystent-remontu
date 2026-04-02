import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { utilityPlansRepo } from '@/db/repositories/utility-plans.repo';
import { UTILITY_GUIDANCE } from '@/features/house-build/utility-checklists';
import type { UtilityType, UtilityConnectionPlan, UtilityConnectionStatus, UtilityChecklistItem, GasPurpose } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const STATUS_ORDER: UtilityConnectionStatus[] = ['not-planned', 'planning', 'application-prepared', 'conditions-received', 'agreement-signed', 'in-progress', 'connected', 'not-applicable'];
const STATUS_LABELS: Record<UtilityConnectionStatus, string> = {
  'not-planned': 'Nie zaplanowane',
  'planning': 'Planowanie',
  'application-prepared': 'Wniosek gotowy',
  'conditions-received': 'Warunki otrzymane',
  'agreement-signed': 'Umowa podpisana',
  'in-progress': 'W realizacji',
  'connected': 'Podlaczone',
  'not-applicable': 'Nie dotyczy',
};

const GAS_PURPOSE_LABELS: Record<GasPurpose, string> = {
  'heating': 'Ogrzewanie',
  'cooking': 'Gotowanie',
  'both': 'Ogrzewanie i gotowanie',
  'not-planned': 'Gaz nie jest planowany',
};

export interface UtilityDetailConfig {
  utilityType: UtilityType;
  screenTitle: string;
  showGasPurpose?: boolean;
  showConnectionPower?: boolean;
  showTemporarySupply?: boolean;
}

export function UtilityDetailScreen({ config }: { config: UtilityDetailConfig }) {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [plan, setPlan] = useState<UtilityConnectionPlan | null>(null);
  const [checklist, setChecklist] = useState<UtilityChecklistItem[]>([]);
  const [showProviderEdit, setShowProviderEdit] = useState(false);
  const [providerText, setProviderText] = useState('');
  const [showNotesEdit, setShowNotesEdit] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [showPowerEdit, setShowPowerEdit] = useState(false);
  const [powerText, setPowerText] = useState('');

  const guidance = UTILITY_GUIDANCE[config.utilityType];

  const loadData = useCallback(async () => {
    if (!projectId) return;
    let p = await utilityPlansRepo.getPlan(projectId, config.utilityType);
    if (!p) {
      await utilityPlansRepo.upsertPlan(projectId, config.utilityType, {});
      p = await utilityPlansRepo.getPlan(projectId, config.utilityType);
    }
    setPlan(p);

    let items = await utilityPlansRepo.getChecklist(projectId, config.utilityType);
    if (items.length === 0 && guidance) {
      for (const def of guidance.checklist) {
        await utilityPlansRepo.upsertChecklistItem(projectId, config.utilityType, def.itemKey, {
          title: def.title, sortOrder: def.sortOrder,
        });
      }
      items = await utilityPlansRepo.getChecklist(projectId, config.utilityType);
    }
    setChecklist(items);
  }, [projectId, config.utilityType]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleStatusCycle = useCallback(async () => {
    if (!projectId || !plan) return;
    const idx = STATUS_ORDER.indexOf(plan.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    await utilityPlansRepo.upsertPlan(projectId, config.utilityType, { status: next });
    await loadData();
  }, [projectId, plan, config.utilityType, loadData]);

  const handleToggleChecklist = useCallback(async (item: UtilityChecklistItem) => {
    if (!projectId) return;
    await utilityPlansRepo.upsertChecklistItem(projectId, config.utilityType, item.itemKey, { completed: !item.completed });
    await loadData();
  }, [projectId, config.utilityType, loadData]);

  const handleSaveProvider = useCallback(async () => {
    if (!projectId) return;
    await utilityPlansRepo.upsertPlan(projectId, config.utilityType, { providerName: providerText });
    setShowProviderEdit(false);
    await loadData();
  }, [projectId, config.utilityType, providerText, loadData]);

  const handleSaveNotes = useCallback(async () => {
    if (!projectId) return;
    await utilityPlansRepo.upsertPlan(projectId, config.utilityType, { notes: notesText });
    setShowNotesEdit(false);
    await loadData();
  }, [projectId, config.utilityType, notesText, loadData]);

  const handleSavePower = useCallback(async () => {
    if (!projectId) return;
    await utilityPlansRepo.upsertPlan(projectId, config.utilityType, { connectionPower: powerText });
    setShowPowerEdit(false);
    await loadData();
  }, [projectId, config.utilityType, powerText, loadData]);

  const handleGasPurpose = useCallback(async (purpose: GasPurpose) => {
    if (!projectId) return;
    await utilityPlansRepo.upsertPlan(projectId, config.utilityType, { gasPurpose: purpose });
    await loadData();
  }, [projectId, config.utilityType, loadData]);

  const handleTemporarySupply = useCallback(async () => {
    if (!projectId || !plan) return;
    await utilityPlansRepo.upsertPlan(projectId, config.utilityType, { temporarySupply: !plan.temporarySupply });
    await loadData();
  }, [projectId, plan, config.utilityType, loadData]);

  const completedCount = checklist.filter((c) => c.completed).length;
  const statusLabel = plan ? STATUS_LABELS[plan.status] : 'Ladowanie...';

  return (
    <>
      <Stack.Screen options={{ title: config.screenTitle }} />
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
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{guidance?.title ?? config.screenTitle}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>{guidance?.description ?? ''}</Txt>

            <TouchableOpacity
              style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              onPress={handleStatusCycle}
            >
              <View style={{
                backgroundColor: plan?.status === 'connected' ? '#F0FDF4' : '#FFFBEB',
                borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
              }}>
                <Txt w="semibold" style={{ fontSize: 12, color: plan?.status === 'connected' ? '#16A34A' : '#D97706' }}>
                  {statusLabel}
                </Txt>
              </View>
              <Feather name="refresh-cw" size={12} color={Colors.textMuted} />
              <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Stuknij, aby zmienic</Txt>
            </TouchableOpacity>
          </View>

          {guidance && guidance.tips.length > 0 && (
            <View style={{
              backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 16,
              borderWidth: 1, borderColor: '#FDE68A',
            }}>
              <Txt w="semibold" style={{ fontSize: 12, color: '#92400E', marginBottom: 6 }}>Wskazowki dla inwestora</Txt>
              {guidance.tips.map((tip, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 3 }}>
                  <Txt style={{ fontSize: 11, color: '#92400E' }}>-</Txt>
                  <Txt style={{ fontSize: 11, color: '#92400E', flex: 1 }}>{tip}</Txt>
                </View>
              ))}
            </View>
          )}

          <View style={{
            backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 12,
            borderWidth: 1, borderColor: Colors.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>Dostawca / operator</Txt>
              <TouchableOpacity onPress={() => { setProviderText(plan?.providerName ?? ''); setShowProviderEdit(true); }}>
                <Feather name="edit-2" size={14} color={HB_ACCENT} />
              </TouchableOpacity>
            </View>
            {showProviderEdit ? (
              <View>
                <TextInput
                  style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 }}
                  placeholder="Nazwa dostawcy..." placeholderTextColor={Colors.textMuted}
                  value={providerText} onChangeText={setProviderText}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }} onPress={handleSaveProvider}>
                    <Txt w="semibold" style={{ fontSize: 12, color: '#fff' }}>Zapisz</Txt>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setShowProviderEdit(false)}>
                    <Txt style={{ fontSize: 12, color: Colors.text }}>Anuluj</Txt>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Txt style={{ fontSize: 13, color: plan?.providerName ? Colors.text : Colors.textMuted }}>
                {plan?.providerName || 'Nie ustawiono — stuknij ikone edycji'}
              </Txt>
            )}
          </View>

          {config.showConnectionPower && (
            <View style={{
              backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 12,
              borderWidth: 1, borderColor: Colors.border,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>Moc przylaczeniowa</Txt>
                <TouchableOpacity onPress={() => { setPowerText(plan?.connectionPower ?? ''); setShowPowerEdit(true); }}>
                  <Feather name="edit-2" size={14} color={HB_ACCENT} />
                </TouchableOpacity>
              </View>
              {showPowerEdit ? (
                <View>
                  <TextInput
                    style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 }}
                    placeholder="np. 15 kW..." placeholderTextColor={Colors.textMuted}
                    value={powerText} onChangeText={setPowerText}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }} onPress={handleSavePower}>
                      <Txt w="semibold" style={{ fontSize: 12, color: '#fff' }}>Zapisz</Txt>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setShowPowerEdit(false)}>
                      <Txt style={{ fontSize: 12, color: Colors.text }}>Anuluj</Txt>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Txt style={{ fontSize: 13, color: plan?.connectionPower ? Colors.text : Colors.textMuted }}>
                  {plan?.connectionPower || 'Nie ustawiono'}
                </Txt>
              )}
            </View>
          )}

          {config.showGasPurpose && (
            <View style={{
              backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 12,
              borderWidth: 1, borderColor: Colors.border,
            }}>
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 8 }}>Cel przylacza gazowego</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {(Object.keys(GAS_PURPOSE_LABELS) as GasPurpose[]).map((purpose) => (
                  <TouchableOpacity
                    key={purpose}
                    style={{
                      backgroundColor: plan?.gasPurpose === purpose ? HB_ACCENT : '#F1F5F9',
                      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
                    }}
                    onPress={() => handleGasPurpose(purpose)}
                  >
                    <Txt style={{ fontSize: 11, color: plan?.gasPurpose === purpose ? '#fff' : Colors.text }}>
                      {GAS_PURPOSE_LABELS[purpose]}
                    </Txt>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {config.showTemporarySupply && (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 12,
                borderWidth: 1, borderColor: Colors.border,
                flexDirection: 'row', alignItems: 'center', gap: 10,
              }}
              onPress={handleTemporarySupply}
            >
              <Feather name={plan?.temporarySupply ? 'check-square' : 'square'} size={18} color={plan?.temporarySupply ? '#16A34A' : Colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>Zasilanie tymczasowe placu budowy</Txt>
                <Txt style={{ fontSize: 11, color: Colors.textMuted }}>Osobne od docelowego zasilania domu</Txt>
              </View>
            </TouchableOpacity>
          )}

          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>Lista kontrolna</Txt>
              <Txt style={{ fontSize: 11, color: HB_ACCENT }}>{completedCount}/{checklist.length}</Txt>
            </View>
            {checklist.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  backgroundColor: Colors.surface, borderRadius: 10, padding: 10, marginBottom: 4,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  borderWidth: 1, borderColor: item.completed ? '#BBF7D0' : Colors.border,
                }}
                onPress={() => handleToggleChecklist(item)}
              >
                <Feather name={item.completed ? 'check-circle' : 'circle'} size={16} color={item.completed ? '#16A34A' : Colors.textMuted} />
                <Txt style={{ fontSize: 12, color: Colors.text, textDecorationLine: item.completed ? 'line-through' : 'none', flex: 1 }}>{item.title}</Txt>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{
            backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 12,
            borderWidth: 1, borderColor: Colors.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>Notatki</Txt>
              <TouchableOpacity onPress={() => { setNotesText(plan?.notes ?? ''); setShowNotesEdit(true); }}>
                <Feather name="edit-2" size={14} color={HB_ACCENT} />
              </TouchableOpacity>
            </View>
            {showNotesEdit ? (
              <View>
                <TextInput
                  style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, minHeight: 60, textAlignVertical: 'top' }}
                  placeholder="Notatki..." placeholderTextColor={Colors.textMuted}
                  multiline value={notesText} onChangeText={setNotesText}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }} onPress={handleSaveNotes}>
                    <Txt w="semibold" style={{ fontSize: 12, color: '#fff' }}>Zapisz</Txt>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setShowNotesEdit(false)}>
                    <Txt style={{ fontSize: 12, color: Colors.text }}>Anuluj</Txt>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Txt style={{ fontSize: 13, color: plan?.notes ? Colors.text : Colors.textMuted }}>
                {plan?.notes || 'Brak notatek'}
              </Txt>
            )}
          </View>

          <View style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              Wymagania i procedury zaleza od lokalnego operatora/dostawcy. Zweryfikuj szczegoly u swojego dostawcy.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
