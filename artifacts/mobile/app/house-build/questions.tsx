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
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/constants/i18n';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const PRIORITY_CONFIG: Record<QuestionPriority, { labelKey: TranslationKey; color: string; bg: string }> = {
  'low': { labelKey: 'hb.questions.priority.low', color: Colors.textMuted, bg: '#F1F5F9' },
  'normal': { labelKey: 'hb.questions.priority.normal', color: HB_ACCENT, bg: HB_ACCENT_BG },
  'high': { labelKey: 'hb.questions.priority.high', color: '#D97706', bg: '#FFFBEB' },
  'urgent': { labelKey: 'hb.questions.priority.urgent', color: '#DC2626', bg: '#FEF2F2' },
};

const ROLE_LABEL_KEYS: Record<string, TranslationKey> = {
  'architect': 'hb.questions.role.architect',
  'structural-engineer': 'hb.questions.role.structuralEngineer',
  'geodesist': 'hb.questions.role.geodesist',
  'electrician': 'hb.questions.role.electrician',
  'plumber': 'hb.questions.role.plumber',
  'gas-installer': 'hb.questions.role.gasInstaller',
  'roofer': 'hb.questions.role.roofer',
  'general-contractor': 'hb.questions.role.generalContractor',
  'building-inspector': 'hb.questions.role.buildingInspector',
  'interior-designer': 'hb.questions.role.interiorDesigner',
  'chimney-sweep': 'hb.questions.role.chimneySweep',
  'energy-auditor': 'hb.questions.role.energyAuditor',
};

export default function QuestionsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
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
    Alert.alert(t('hb.questions.deleteTitle'), t('hb.questions.deleteBody'), [
      { text: t('hb.questions.deleteCancel'), style: 'cancel' },
      { text: t('hb.questions.deleteConfirm'), style: 'destructive', onPress: async () => {
        await investorDocsRepo.deleteQuestion(id);
        await loadData();
      }},
    ]);
  }, [loadData, t]);

  const open = questions.filter((q) => !q.isAnswered).length;

  return (
    <>
      <Stack.Screen options={{ title: t('hb.questions.title') }} />
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
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{t('hb.questions.heroTitle')}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              {t('hb.questions.heroSubtitle')}
            </Txt>
            {open > 0 && (
              <Txt w="semibold" style={{ fontSize: 12, color: '#D97706', marginTop: 8 }}>
                {t('hb.questions.unanswered', { count: open })}
              </Txt>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                style={{ backgroundColor: filterRole === null ? HB_ACCENT : '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}
                onPress={() => setFilterRole(null)}
              >
                <Txt style={{ fontSize: 10, color: filterRole === null ? '#fff' : Colors.text }}>{t('hb.questions.filterAll')}</Txt>
              </TouchableOpacity>
              {Object.entries(ROLE_LABEL_KEYS).map(([key, labelKey]) => (
                <TouchableOpacity
                  key={key}
                  style={{ backgroundColor: filterRole === key ? HB_ACCENT : '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}
                  onPress={() => setFilterRole(filterRole === key ? null : key)}
                >
                  <Txt style={{ fontSize: 10, color: filterRole === key ? '#fff' : Colors.text }}>{t(labelKey)}</Txt>
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
                          <Txt style={{ fontSize: 9, color: pc.color }}>{t(pc.labelKey)}</Txt>
                        </View>
                        {q.targetRole && <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{ROLE_LABEL_KEYS[q.targetRole] ? t(ROLE_LABEL_KEYS[q.targetRole]) : q.targetRole}</Txt>}
                        {q.followUpNeeded && (
                          <View style={{ backgroundColor: '#FFFBEB', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                            <Txt style={{ fontSize: 9, color: '#D97706' }}>{t('hb.questions.followUp')}</Txt>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && !isAnswering && (
                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginTop: 4, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    {q.answerText ? (
                      <Txt style={{ fontSize: 12, color: Colors.text, marginBottom: 6 }}>{t('hb.questions.answerLabel', { answer: q.answerText })}</Txt>
                    ) : (
                      <Txt style={{ fontSize: 12, color: Colors.textMuted, marginBottom: 6 }}>{t('hb.questions.noAnswer')}</Txt>
                    )}
                    <TouchableOpacity
                      style={{ backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }}
                      onPress={() => { setAnsweringId(q.id); setAnswerText(q.answerText); }}
                    >
                      <Txt w="semibold" style={{ fontSize: 12, color: '#fff' }}>{t('hb.questions.saveAnswerCta')}</Txt>
                    </TouchableOpacity>
                  </View>
                )}

                {isAnswering && (
                  <View style={{ backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginTop: 4, borderWidth: 1, borderColor: '#BFDBFE' }}>
                    <TextInput
                      style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, minHeight: 60, textAlignVertical: 'top' }}
                      multiline placeholder={t('hb.questions.answerPlaceholder')} placeholderTextColor={Colors.textMuted}
                      value={answerText} onChangeText={setAnswerText}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }} onPress={handleSaveAnswer}>
                        <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>{t('hb.questions.saveCta')}</Txt>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setAnsweringId(null)}>
                        <Txt style={{ fontSize: 13, color: Colors.text }}>{t('hb.questions.cancelCta')}</Txt>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {showTemplates && (
            <View style={{ backgroundColor: '#F5F3FF', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#DDD6FE' }}>
              <Txt w="semibold" style={{ fontSize: 13, color: '#6D28D9', marginBottom: 8 }}>{t('hb.questions.templatesTitle')}</Txt>
              {[...QUESTION_TEMPLATES, ...UTILITY_QUESTION_TEMPLATES].map((tpl, i) => (
                <TouchableOpacity
                  key={i}
                  style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  onPress={() => handleSeedTemplate(tpl)}
                >
                  <Feather name="plus-circle" size={14} color="#6D28D9" />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontSize: 11, color: Colors.text }}>{tpl.questionText}</Txt>
                    <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{ROLE_LABEL_KEYS[tpl.targetRole] ? t(ROLE_LABEL_KEYS[tpl.targetRole]) : tpl.targetRole} | {tpl.stageKey}</Txt>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 6 }} onPress={() => setShowTemplates(false)}>
                <Txt style={{ fontSize: 11, color: '#6D28D9' }}>{t('hb.questions.closeTemplates')}</Txt>
              </TouchableOpacity>
            </View>
          )}

          {showAdd ? (
            <View style={{ backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' }}>
              <TextInput
                style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 14, color: Colors.text, marginBottom: 8, borderWidth: 1, borderColor: Colors.border }}
                placeholder={t('hb.questions.textPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                value={newText} onChangeText={setNewText} multiline
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {Object.entries(ROLE_LABEL_KEYS).map(([key, labelKey]) => (
                    <TouchableOpacity key={key}
                      style={{ backgroundColor: newRole === key ? HB_ACCENT : '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}
                      onPress={() => setNewRole(newRole === key ? '' : key)}
                    >
                      <Txt style={{ fontSize: 10, color: newRole === key ? '#fff' : Colors.text }}>{t(labelKey)}</Txt>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 10, alignItems: 'center' }} onPress={handleAddQuestion}>
                  <Txt w="semibold" style={{ fontSize: 13, color: '#fff' }}>{t('hb.questions.addCta')}</Txt>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }} onPress={() => setShowAdd(false)}>
                  <Txt style={{ fontSize: 13, color: Colors.text }}>{t('hb.questions.cancelCta')}</Txt>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setShowAdd(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="plus" size={14} color={HB_ACCENT} />
                <Txt style={{ fontSize: 12, color: HB_ACCENT }}>{t('hb.questions.newQuestion')}</Txt>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTemplates(!showTemplates)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="list" size={14} color="#6D28D9" />
                <Txt style={{ fontSize: 12, color: '#6D28D9' }}>{t('hb.questions.templates')}</Txt>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              {t('hb.questions.footnote')}
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
