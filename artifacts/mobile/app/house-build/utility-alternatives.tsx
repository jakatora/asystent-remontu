import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { utilityPlansRepo } from '@/db/repositories/utility-plans.repo';
import { ALTERNATIVE_DEFINITIONS } from '@/features/house-build/utility-checklists';
import type { UtilityAlternative, InvestorDocStatus } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const STATUS_CONFIG: Record<InvestorDocStatus, { label: string; color: string; icon: string }> = {
  'missing': { label: 'Do rozwazenia', color: '#D97706', icon: 'help-circle' },
  'in-progress': { label: 'W trakcie', color: HB_ACCENT, icon: 'clock' },
  'ready': { label: 'Zdecydowano', color: '#16A34A', icon: 'check-circle' },
  'not-needed': { label: 'Nie potrzebne', color: Colors.textMuted, icon: 'minus-circle' },
};

export default function UtilityAlternativesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [alternatives, setAlternatives] = useState<UtilityAlternative[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const loadData = useCallback(async () => {
    if (!projectId) return;
    const alts = await utilityPlansRepo.getAlternatives(projectId);
    setAlternatives(alts);
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSeedDefaults = useCallback(async () => {
    if (!projectId) return;
    for (const def of ALTERNATIVE_DEFINITIONS) {
      await utilityPlansRepo.addAlternative(projectId, {
        utilityType: def.utilityType,
        title: def.title,
        description: def.description,
      });
    }
    await loadData();
  }, [projectId, loadData]);

  const handleStatusCycle = useCallback(async (alt: UtilityAlternative) => {
    const cycle: InvestorDocStatus[] = ['missing', 'in-progress', 'ready', 'not-needed'];
    const idx = cycle.indexOf(alt.status);
    const next = cycle[(idx + 1) % cycle.length];
    await utilityPlansRepo.updateAlternative(alt.id, { status: next });
    await loadData();
  }, [loadData]);

  const handleAdd = useCallback(async () => {
    if (!projectId || !newTitle.trim()) return;
    await utilityPlansRepo.addAlternative(projectId, { utilityType: 'water', title: newTitle.trim() });
    setNewTitle('');
    setShowAdd(false);
    await loadData();
  }, [projectId, newTitle, loadData]);

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert('Usun alternatywe', 'Czy na pewno?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: async () => {
        await utilityPlansRepo.deleteAlternative(id);
        await loadData();
      }},
    ]);
  }, [loadData]);

  return (
    <>
      <Stack.Screen options={{ title: 'Rozwiazania alternatywne' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: '#F5F3FF', borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: '#DDD6FE', marginBottom: 16,
          }}>
            <Txt w="bold" style={{ fontSize: 18, color: '#6D28D9' }}>Rozwiazania alternatywne</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              Gdy publiczna siec nie jest dostepna — planowanie rozwiazan zastepczych
            </Txt>
          </View>

          <View style={{
            backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 16,
            borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', gap: 8,
          }}>
            <Feather name="alert-triangle" size={14} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 11, color: '#92400E', flex: 1 }}>
              To sa tylko placeholdery planowania. Rozwiazania alternatywne wymagaja konsultacji ze specjalista i uzgodnienia z lokalnym urzedem.
            </Txt>
          </View>

          {alternatives.length === 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: '#F5F3FF', borderRadius: 12, padding: 14, marginBottom: 16,
                borderWidth: 1, borderColor: '#DDD6FE', alignItems: 'center',
              }}
              onPress={handleSeedDefaults}
            >
              <Feather name="plus-circle" size={18} color="#6D28D9" />
              <Txt w="semibold" style={{ fontSize: 13, color: '#6D28D9', marginTop: 6 }}>Dodaj domyslne alternatywy</Txt>
              <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>Studnia, szambo, oczyszczalnia, internet mobilny...</Txt>
            </TouchableOpacity>
          )}

          {alternatives.map((alt) => {
            const sc = STATUS_CONFIG[alt.status] ?? STATUS_CONFIG.missing;
            return (
              <TouchableOpacity
                key={alt.id}
                style={{
                  backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 8,
                  borderWidth: 1, borderColor: alt.status === 'ready' ? '#BBF7D0' : Colors.border,
                }}
                onPress={() => handleStatusCycle(alt)}
                onLongPress={() => handleDelete(alt.id)}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Feather name={sc.icon as any} size={16} color={sc.color} />
                  <View style={{ flex: 1 }}>
                    <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{alt.title}</Txt>
                    {alt.description ? <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>{alt.description}</Txt> : null}
                  </View>
                  <View style={{ backgroundColor: sc.color + '18', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                    <Txt style={{ fontSize: 9, color: sc.color }}>{sc.label}</Txt>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {showAdd ? (
            <View style={{ backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#DDD6FE' }}>
              <TextInput
                style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 14, color: Colors.text, marginBottom: 8, borderWidth: 1, borderColor: Colors.border }}
                placeholder="Nazwa rozwiazania..." placeholderTextColor={Colors.textMuted}
                value={newTitle} onChangeText={setNewTitle}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: '#6D28D9', borderRadius: 8, padding: 10, alignItems: 'center' }} onPress={handleAdd}>
                  <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>Dodaj</Txt>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setShowAdd(false)}>
                  <Txt style={{ fontSize: 13, color: Colors.text }}>Anuluj</Txt>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 12 }} onPress={() => setShowAdd(true)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="plus" size={14} color="#6D28D9" />
                <Txt style={{ fontSize: 12, color: '#6D28D9' }}>Dodaj wlasne rozwiazanie</Txt>
              </View>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              Dotknij element, aby zmienic status. Przytrzymaj, aby usunac.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
