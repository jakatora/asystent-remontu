import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { investorDocsRepo } from '@/db/repositories/investor-docs.repo';
import { QUESTION_TEMPLATES } from '@/features/house-build/question-templates';
import { UTILITY_QUESTION_TEMPLATES } from '@/features/house-build/utility-questions';
import { PROFESSIONAL_ROLES } from '@/features/house-build/stages';
import type { BuildQuestionRecord, QuestionPriority } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const PRIORITY_CONFIG: Record<QuestionPriority, { label: string; color: string; bg: string }> = {
  'low': { label: 'Niski', color: Colors.textMuted, bg: '#F1F5F9' },
  'normal': { label: 'Normalny', color: HB_ACCENT, bg: HB_ACCENT_BG },
  'high': { label: 'Wysoki', color: '#D97706', bg: '#FFFBEB' },
  'urgent': { label: 'Pilny', color: '#DC2626', bg: '#FEF2F2' },
};

const ROLE_LABELS: Record<string, string> = {
  'architect': 'Architekt',
  'structural-engineer': 'Konstruktor',
  'geodesist': 'Geodeta',
  'electrician': 'Elektryk',
  'plumber': 'Hydraulik',
  'gas-installer': 'Instalator gazu',
  'roofer': 'Dekarz',
  'general-contractor': 'Generalny wykonawca',
  'building-inspector': 'Inspektor budowy',
  'interior-designer': 'Projektant wnetrz',
  'chimney-sweep': 'Kominiarz',
  'energy-auditor': 'Audytor energetyczny',
};

export default function QuestionsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [questions, setQuestions] = useState<BuildQuestionRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPriority, setNewPriority] = useState<QuestionPriority>('normal');
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterRole, setFilterRole] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    const qs = await investorDocsRepo.getQuestions(projectId);
    setQuestions(qs);
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const filtered = useMemo(() => {
    if (!filterRole) return questions;
    return questions.filter((q) => q.targetRole === filterRole);
  }, [questions, filterRole]);

  const handleAddQuestion = useCallback(async () => {
    if (!projectId || !newText.trim()) return;
    await investorDocsRepo.addQuestion(projectId, {
      questionText: newText.trim(),
      targetRole: newRole || undefined,
      priority: newPriority,
    });
    setNewText('');
    setShowAdd(false);
    await loadData();
  }, [projectId, newText, newRole, newPriority, loadData]);

  const handleSeedTemplate = useCallback(async (tpl: typeof QUESTION_TEMPLATES[number]) => {
    if (!projectId) return;
    await investorDocsRepo.addQuestion(projectId, {
      questionText: tpl.questionText,
      stageKey: tpl.stageKey,
      targetRole: tpl.targetRole,
      priority: tpl.priority,
    });
    await loadData();
  }, [projectId, loadData]);

  const handleToggleAnswered = useCallback(async (q: BuildQuestionRecord) => {
    await investorDocsRepo.updateQuestion(q.id, { isAnswered: !q.isAnswered });
    await loadData();
  }, [loadData]);

  const handleSaveAnswer = useCallback(async () => {
    if (!answeringId) return;
    await investorDocsRepo.updateQuestion(answeringId, { answerText, isAnswered: true });
    setAnsweringId(null);
    setAnswerText('');
    await loadData();
  }, [answeringId, answerText, loadData]);

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert('Usun pytanie', 'Czy na pewno?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: async () => {
        await investorDocsRepo.deleteQuestion(id);
        await loadData();
      }},
    ]);
  }, [loadData]);

  const open = questions.filter((q) => !q.isAnswered).length;

  return (
    <>
      <Stack.Screen options={{ title: 'Pytania do specjalistow' }} />
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
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>Pytania do specjalistow</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              Przygotuj pytania do projektanta, kierownika i wykonawcow
            </Txt>
            {open > 0 && (
              <Txt w="semibold" style={{ fontSize: 12, color: '#D97706', marginTop: 8 }}>
                {open} bez odpowiedzi
              </Txt>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                style={{ backgroundColor: filterRole === null ? HB_ACCENT : '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}
                onPress={() => setFilterRole(null)}
              >
                <Txt style={{ fontSize: 10, color: filterRole === null ? '#fff' : Colors.text }}>Wszystkie</Txt>
              </TouchableOpacity>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={{ backgroundColor: filterRole === key ? HB_ACCENT : '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}
                  onPress={() => setFilterRole(filterRole === key ? null : key)}
                >
                  <Txt style={{ fontSize: 10, color: filterRole === key ? '#fff' : Colors.text }}>{label}</Txt>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {filtered.map((q) => {
            const pc = PRIORITY_CONFIG[q.priority] ?? PRIORITY_CONFIG.normal;
            const isExpanded = expandedId === q.id;
            const isAnswering = answeringId === q.id;

            return (
              <View key={q.id} style={{ marginBottom: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
                    borderWidth: 1, borderColor: q.isAnswered ? '#BBF7D0' : q.priority === 'urgent' ? '#FECACA' : Colors.border,
                    opacity: q.isAnswered ? 0.8 : 1,
                  }}
                  onPress={() => setExpandedId(isExpanded ? null : q.id)}
                  onLongPress={() => handleDelete(q.id)}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                    <TouchableOpacity onPress={() => handleToggleAnswered(q)} style={{ paddingTop: 2 }}>
                      <Feather name={q.isAnswered ? 'check-circle' : 'circle'} size={18} color={q.isAnswered ? '#16A34A' : Colors.textMuted} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Txt style={{ fontSize: 13, color: Colors.text, textDecorationLine: q.isAnswered ? 'line-through' : 'none' }}>{q.questionText}</Txt>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <View style={{ backgroundColor: pc.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Txt style={{ fontSize: 9, color: pc.color }}>{pc.label}</Txt>
                        </View>
                        {q.targetRole && <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{ROLE_LABELS[q.targetRole] ?? q.targetRole}</Txt>}
                        {q.followUpNeeded && (
                          <View style={{ backgroundColor: '#FFFBEB', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                            <Txt style={{ fontSize: 9, color: '#D97706' }}>Wymaga follow-up</Txt>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && !isAnswering && (
                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginTop: 4, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    {q.answerText ? (
                      <Txt style={{ fontSize: 12, color: Colors.text, marginBottom: 6 }}>Odpowiedz: {q.answerText}</Txt>
                    ) : (
                      <Txt style={{ fontSize: 12, color: Colors.textMuted, marginBottom: 6 }}>Brak odpowiedzi</Txt>
                    )}
                    <TouchableOpacity
                      style={{ backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }}
                      onPress={() => { setAnsweringId(q.id); setAnswerText(q.answerText); }}
                    >
                      <Txt w="semibold" style={{ fontSize: 12, color: '#fff' }}>Zapisz odpowiedz</Txt>
                    </TouchableOpacity>
                  </View>
                )}

                {isAnswering && (
                  <View style={{ backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginTop: 4, borderWidth: 1, borderColor: '#BFDBFE' }}>
                    <TextInput
                      style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, minHeight: 60, textAlignVertical: 'top' }}
                      multiline placeholder="Odpowiedz..." placeholderTextColor={Colors.textMuted}
                      value={answerText} onChangeText={setAnswerText}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }} onPress={handleSaveAnswer}>
                        <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>Zapisz</Txt>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setAnsweringId(null)}>
                        <Txt style={{ fontSize: 13, color: Colors.text }}>Anuluj</Txt>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {showTemplates && (
            <View style={{ backgroundColor: '#F5F3FF', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#DDD6FE' }}>
              <Txt w="semibold" style={{ fontSize: 13, color: '#6D28D9', marginBottom: 8 }}>Szablony pytan</Txt>
              {[...QUESTION_TEMPLATES, ...UTILITY_QUESTION_TEMPLATES].map((tpl, i) => (
                <TouchableOpacity
                  key={i}
                  style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  onPress={() => handleSeedTemplate(tpl)}
                >
                  <Feather name="plus-circle" size={14} color="#6D28D9" />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontSize: 11, color: Colors.text }}>{tpl.questionText}</Txt>
                    <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{ROLE_LABELS[tpl.targetRole] ?? tpl.targetRole} | {tpl.stageKey}</Txt>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 6 }} onPress={() => setShowTemplates(false)}>
                <Txt style={{ fontSize: 11, color: '#6D28D9' }}>Zamknij szablony</Txt>
              </TouchableOpacity>
            </View>
          )}

          {showAdd ? (
            <View style={{ backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' }}>
              <TextInput
                style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 14, color: Colors.text, marginBottom: 8, borderWidth: 1, borderColor: Colors.border }}
                placeholder="Tresc pytania..."
                placeholderTextColor={Colors.textMuted}
                value={newText} onChangeText={setNewText} multiline
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <TouchableOpacity key={key}
                      style={{ backgroundColor: newRole === key ? HB_ACCENT : '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}
                      onPress={() => setNewRole(newRole === key ? '' : key)}
                    >
                      <Txt style={{ fontSize: 10, color: newRole === key ? '#fff' : Colors.text }}>{label}</Txt>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }} onPress={handleAddQuestion}>
                  <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>Dodaj</Txt>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setShowAdd(false)}>
                  <Txt style={{ fontSize: 13, color: Colors.text }}>Anuluj</Txt>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setShowAdd(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="plus" size={14} color={HB_ACCENT} />
                <Txt style={{ fontSize: 12, color: HB_ACCENT }}>Nowe pytanie</Txt>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTemplates(!showTemplates)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="list" size={14} color="#6D28D9" />
                <Txt style={{ fontSize: 12, color: '#6D28D9' }}>Szablony</Txt>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              Przytrzymaj pytanie, aby je usunac. Dotknij okrag, aby oznaczyc jako odpowiedziane.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
