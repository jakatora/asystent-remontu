import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { investorDocsRepo } from '@/db/repositories/investor-docs.repo';
import { DEFAULT_DECISION_TEMPLATES } from '@/features/house-build/decision-defaults';
import type { BuildDecisionRecord, DecisionStatus, DecisionCategory } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const STATUS_CONFIG: Record<DecisionStatus, { label: string; color: string; bg: string; icon: string }> = {
  'open': { label: 'Otwarta', color: '#DC2626', bg: '#FEF2F2', icon: 'alert-circle' },
  'considering': { label: 'Rozważam', color: '#D97706', bg: '#FFFBEB', icon: 'help-circle' },
  'decided': { label: 'Zdecydowano', color: '#16A34A', bg: '#F0FDF4', icon: 'check-circle' },
  'revisiting': { label: 'Ponowna ocena', color: '#7C3AED', bg: '#F5F3FF', icon: 'refresh-cw' },
};

const CATEGORY_LABELS: Record<DecisionCategory, string> = {
  'technology': 'Technologia',
  'structure': 'Konstrukcja',
  'energy': 'Energia',
  'finishing': 'Wykonczenie',
  'management': 'Zarzadzanie',
  'other': 'Inne',
};

export default function DecisionsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [decisions, setDecisions] = useState<BuildDecisionRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ options: '', selected: '', reasoning: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DecisionCategory>('other');

  const loadData = useCallback(async () => {
    if (!projectId) return;
    let existing = await investorDocsRepo.getDecisions(projectId);
    if (existing.length === 0) {
      for (const tpl of DEFAULT_DECISION_TEMPLATES) {
        await investorDocsRepo.addDecision(projectId, {
          title: tpl.title,
          category: tpl.category,
          stageKey: tpl.stageKey,
        });
      }
      existing = await investorDocsRepo.getDecisions(projectId);
    }
    setDecisions(existing);
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleStatusCycle = useCallback(async (d: BuildDecisionRecord) => {
    const cycle: DecisionStatus[] = ['open', 'considering', 'decided', 'revisiting'];
    const idx = cycle.indexOf(d.status);
    const next = cycle[(idx + 1) % cycle.length];
    const decisionDate = next === 'decided' ? new Date().toISOString().split('T')[0] : null;
    await investorDocsRepo.updateDecision(d.id, { status: next, decisionDate });
    await loadData();
  }, [loadData]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    await investorDocsRepo.updateDecision(editingId, {
      optionsConsidered: editFields.options,
      selectedOption: editFields.selected,
      reasoning: editFields.reasoning,
    });
    setEditingId(null);
    await loadData();
  }, [editingId, editFields, loadData]);

  const handleAdd = useCallback(async () => {
    if (!projectId || !newTitle.trim()) return;
    await investorDocsRepo.addDecision(projectId, { title: newTitle.trim(), category: newCategory });
    setNewTitle('');
    setShowAdd(false);
    await loadData();
  }, [projectId, newTitle, newCategory, loadData]);

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert('Usun decyzje', 'Czy na pewno?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: async () => {
        await investorDocsRepo.deleteDecision(id);
        await loadData();
      }},
    ]);
  }, [loadData]);

  const unresolved = decisions.filter((d) => d.status !== 'decided').length;

  return (
    <>
      <Stack.Screen options={{ title: 'Decyzje inwestora' }} />
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
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>Decyzje inwestora</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              Sledzenie kluczowych wyborow i decyzji budowlanych
            </Txt>
            {unresolved > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <Feather name="alert-circle" size={12} color="#DC2626" />
                <Txt style={{ fontSize: 12, color: '#DC2626' }}>{unresolved} nierozstrzygniętych</Txt>
              </View>
            )}
          </View>

          {decisions.map((d) => {
            const sc = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.open;
            const isExpanded = expandedId === d.id;
            const isEditing = editingId === d.id;

            return (
              <View key={d.id} style={{ marginBottom: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
                    borderWidth: 1, borderColor: d.status === 'open' ? '#FECACA' : d.status === 'decided' ? '#BBF7D0' : Colors.border,
                  }}
                  onPress={() => setExpandedId(isExpanded ? null : d.id)}
                  onLongPress={() => handleDelete(d.id)}
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
                      <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{d.title}</Txt>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                        <View style={{ backgroundColor: sc.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Txt style={{ fontSize: 9, color: sc.color }}>{sc.label}</Txt>
                        </View>
                        <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{CATEGORY_LABELS[d.category]}</Txt>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleStatusCycle(d)} style={{ padding: 6 }}>
                      <Feather name="refresh-cw" size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {d.selectedOption && d.status === 'decided' && (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border }}>
                      <Txt style={{ fontSize: 11, color: '#16A34A' }}>Wybrano: {d.selectedOption}</Txt>
                    </View>
                  )}
                  {d.warningNote && d.status !== 'decided' && (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#FEE2E2', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                      <Feather name="alert-triangle" size={11} color="#DC2626" />
                      <Txt style={{ fontSize: 10, color: '#DC2626' }}>{d.warningNote}</Txt>
                    </View>
                  )}
                </TouchableOpacity>

                {isExpanded && !isEditing && (
                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginTop: 4, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    {d.optionsConsidered ? <Txt style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 4 }}>Rozwazone opcje: {d.optionsConsidered}</Txt> : null}
                    {d.selectedOption ? <Txt style={{ fontSize: 11, color: Colors.text, marginBottom: 4 }}>Wybrano: {d.selectedOption}</Txt> : null}
                    {d.reasoning ? <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 4 }}>Dlaczego: {d.reasoning}</Txt> : null}
                    {d.decisionDate ? <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Data: {d.decisionDate}</Txt> : null}
                    <TouchableOpacity
                      style={{ marginTop: 8, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }}
                      onPress={() => {
                        setEditingId(d.id);
                        setEditFields({ options: d.optionsConsidered, selected: d.selectedOption, reasoning: d.reasoning });
                      }}
                    >
                      <Txt w="semibold" style={{ fontSize: 12, color: '#fff' }}>Edytuj</Txt>
                    </TouchableOpacity>
                  </View>
                )}

                {isEditing && (
                  <View style={{ backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginTop: 4, borderWidth: 1, borderColor: '#BFDBFE' }}>
                    <TextInput
                      style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 13, color: Colors.text, marginBottom: 8, borderWidth: 1, borderColor: Colors.border }}
                      placeholder="Rozwazone opcje..."
                      placeholderTextColor={Colors.textMuted}
                      value={editFields.options}
                      onChangeText={(t) => setEditFields((p) => ({ ...p, options: t }))}
                    />
                    <TextInput
                      style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 13, color: Colors.text, marginBottom: 8, borderWidth: 1, borderColor: Colors.border }}
                      placeholder="Wybrana opcja..."
                      placeholderTextColor={Colors.textMuted}
                      value={editFields.selected}
                      onChangeText={(t) => setEditFields((p) => ({ ...p, selected: t }))}
                    />
                    <TextInput
                      style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 13, color: Colors.text, marginBottom: 8, borderWidth: 1, borderColor: Colors.border }}
                      placeholder="Dlaczego ta opcja..."
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      value={editFields.reasoning}
                      onChangeText={(t) => setEditFields((p) => ({ ...p, reasoning: t }))}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }} onPress={handleSaveEdit}>
                        <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>Zapisz</Txt>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setEditingId(null)}>
                        <Txt style={{ fontSize: 13, color: Colors.text }}>Anuluj</Txt>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {showAdd ? (
            <View style={{ backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' }}>
              <TextInput
                style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 14, color: Colors.text, marginBottom: 8, borderWidth: 1, borderColor: Colors.border }}
                placeholder="Tytul decyzji..."
                placeholderTextColor={Colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(Object.keys(CATEGORY_LABELS) as DecisionCategory[]).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={{
                        backgroundColor: newCategory === cat ? HB_ACCENT : '#F1F5F9',
                        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
                      }}
                      onPress={() => setNewCategory(cat)}
                    >
                      <Txt style={{ fontSize: 10, color: newCategory === cat ? '#fff' : Colors.text }}>{CATEGORY_LABELS[cat]}</Txt>
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
                <Txt style={{ fontSize: 12, color: HB_ACCENT }}>Dodaj decyzje</Txt>
              </View>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              Przytrzymaj decyzje, aby ja usunac. Dotknij ikone odswiezania, aby zmienic status.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
