import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { investorDocsRepo } from '@/db/repositories/investor-docs.repo';
import type { InvestorDocRecord, InvestorDocGroup, InvestorDocStatus } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const GROUP_CONFIG: Record<InvestorDocGroup, { label: string; icon: string; color: string }> = {
  'official-forms': { label: 'Formularze urzedowe', icon: 'file-text', color: '#DC2626' },
  'project-design': { label: 'Projekt i dokumentacja', icon: 'layers', color: HB_ACCENT },
  'site-build': { label: 'Plac budowy', icon: 'map', color: '#059669' },
  'energy-performance': { label: 'Energia i efektywnosc', icon: 'zap', color: '#D97706' },
  'completion-package': { label: 'Pakiet zakonczeniowy', icon: 'package', color: '#7C3AED' },
  'personal-notes': { label: 'Notatki i pliki', icon: 'edit-3', color: Colors.textMuted },
};

const STATUS_CONFIG: Record<InvestorDocStatus, { label: string; color: string; icon: string }> = {
  'missing': { label: 'Brakuje', color: '#DC2626', icon: 'x-circle' },
  'in-progress': { label: 'W trakcie', color: '#D97706', icon: 'clock' },
  'ready': { label: 'Gotowe', color: '#16A34A', icon: 'check-circle' },
  'not-needed': { label: 'Nie potrzebne', color: Colors.textMuted, icon: 'minus-circle' },
};

const DOC_GROUPS: InvestorDocGroup[] = ['project-design', 'site-build', 'energy-performance', 'completion-package', 'personal-notes'];

export default function InvestorDocsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [docs, setDocs] = useState<InvestorDocRecord[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<InvestorDocGroup | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGroup, setNewGroup] = useState<InvestorDocGroup>('personal-notes');

  const loadData = useCallback(async () => {
    if (!projectId) return;
    const all = await investorDocsRepo.getInvestorDocs(projectId);
    setDocs(all);
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleStatusCycle = useCallback(async (doc: InvestorDocRecord) => {
    const cycle: InvestorDocStatus[] = ['missing', 'in-progress', 'ready', 'not-needed'];
    const idx = cycle.indexOf(doc.status);
    const next = cycle[(idx + 1) % cycle.length];
    await investorDocsRepo.updateInvestorDoc(doc.id, { status: next });
    await loadData();
  }, [loadData]);

  const handleAdd = useCallback(async () => {
    if (!projectId || !newTitle.trim()) return;
    await investorDocsRepo.addInvestorDoc(projectId, { group: newGroup, title: newTitle.trim() });
    setNewTitle('');
    setShowAdd(false);
    await loadData();
  }, [projectId, newTitle, newGroup, loadData]);

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert('Usun dokument', 'Czy na pewno?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: async () => {
        await investorDocsRepo.deleteInvestorDoc(id);
        await loadData();
      }},
    ]);
  }, [loadData]);

  return (
    <>
      <Stack.Screen options={{ title: 'Dokumenty projektu' }} />
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
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>Dokumenty projektu</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              Organizacja plikow, notatek i dokumentacji budowy
            </Txt>
          </View>

          <View style={{
            backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 16,
            borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', gap: 8,
          }}>
            <Feather name="info" size={14} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 11, color: '#92400E', flex: 1 }}>
              Przechowuj informacje o dokumentach w jednym miejscu. Przyszla wersja umozliwi dolaczanie plikow i zdjec.
            </Txt>
          </View>

          {DOC_GROUPS.map((group) => {
            const gc = GROUP_CONFIG[group];
            const groupDocs = docs.filter((d) => d.group === group);
            const isExpanded = expandedGroup === group;

            return (
              <View key={group} style={{ marginBottom: 10 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
                    borderWidth: 1, borderColor: isExpanded ? '#BFDBFE' : Colors.border,
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                  }}
                  onPress={() => setExpandedGroup(isExpanded ? null : group)}
                  activeOpacity={0.85}
                >
                  <Feather name={gc.icon as any} size={16} color={gc.color} />
                  <View style={{ flex: 1 }}>
                    <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{gc.label}</Txt>
                    <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{groupDocs.length} elementów</Txt>
                  </View>
                  <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ paddingHorizontal: 8, paddingTop: 8 }}>
                    {groupDocs.map((doc) => {
                      const sc = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.missing;
                      return (
                        <TouchableOpacity
                          key={doc.id}
                          style={{
                            backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 4,
                            flexDirection: 'row', alignItems: 'center', gap: 8,
                          }}
                          onPress={() => handleStatusCycle(doc)}
                          onLongPress={() => handleDelete(doc.id)}
                        >
                          <Feather name={sc.icon as any} size={14} color={sc.color} />
                          <View style={{ flex: 1 }}>
                            <Txt style={{ fontSize: 12, color: Colors.text }}>{doc.title}</Txt>
                            {doc.description ? <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{doc.description}</Txt> : null}
                          </View>
                          <View style={{ backgroundColor: sc.color + '18', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                            <Txt style={{ fontSize: 9, color: sc.color }}>{sc.label}</Txt>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    {groupDocs.length === 0 && (
                      <Txt style={{ fontSize: 11, color: Colors.textMuted, paddingVertical: 8, textAlign: 'center' }}>Brak dokumentow w tej grupie</Txt>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {showAdd ? (
            <View style={{ backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' }}>
              <TextInput
                style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 14, color: Colors.text, marginBottom: 8, borderWidth: 1, borderColor: Colors.border }}
                placeholder="Nazwa dokumentu..."
                placeholderTextColor={Colors.textMuted}
                value={newTitle} onChangeText={setNewTitle}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {DOC_GROUPS.map((g) => (
                    <TouchableOpacity key={g}
                      style={{ backgroundColor: newGroup === g ? HB_ACCENT : '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}
                      onPress={() => setNewGroup(g)}
                    >
                      <Txt style={{ fontSize: 10, color: newGroup === g ? '#fff' : Colors.text }}>{GROUP_CONFIG[g].label}</Txt>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }} onPress={handleAdd}>
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
                <Feather name="plus" size={14} color={HB_ACCENT} />
                <Txt style={{ fontSize: 12, color: HB_ACCENT }}>Dodaj dokument</Txt>
              </View>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              Dotknij dokument, aby zmienic status. Przytrzymaj, aby usunac.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
