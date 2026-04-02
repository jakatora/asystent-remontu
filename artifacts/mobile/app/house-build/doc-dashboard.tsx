import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { investorDocsRepo } from '@/db/repositories/investor-docs.repo';
import type { DocDashboardSummary } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

export default function DocDashboardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [summary, setSummary] = useState<DocDashboardSummary>({
    officialPending: 0, officialCompleted: 0, decisionsUnresolved: 0,
    questionsOpen: 0, completionReady: 0, completionTotal: 0, highPriorityUnresolved: 0,
  });

  const loadData = useCallback(async () => {
    if (!projectId) return;
    const [forms, decisions, questions, completionItems] = await Promise.all([
      investorDocsRepo.getOfficialForms(projectId),
      investorDocsRepo.getDecisions(projectId),
      investorDocsRepo.getQuestions(projectId),
      investorDocsRepo.getCompletionItems(projectId),
    ]);
    const officialCompleted = forms.filter((f) => f.status === 'completed' || f.status === 'not-applicable').length;
    const officialPending = forms.length - officialCompleted;
    const decisionsUnresolved = decisions.filter((d) => d.status !== 'decided').length;
    const questionsOpen = questions.filter((q) => !q.isAnswered).length;
    const completionReady = completionItems.filter((c) => c.status === 'ready' || c.status === 'not-needed').length;
    const completionTotal = completionItems.length;
    const highPriorityUnresolved = questions.filter((q) => !q.isAnswered && (q.priority === 'high' || q.priority === 'urgent')).length;
    setSummary({ officialPending, officialCompleted, decisionsUnresolved, questionsOpen, completionReady, completionTotal, highPriorityUnresolved });
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const cards: { icon: string; label: string; value: string; color: string; bg: string; route: string }[] = [
    {
      icon: 'file-text', label: 'Formularze urzedowe',
      value: `${summary.officialCompleted} zakonczonych, ${summary.officialPending} oczekujacych`,
      color: summary.officialPending > 0 ? '#D97706' : '#16A34A',
      bg: summary.officialPending > 0 ? '#FFFBEB' : '#F0FDF4',
      route: 'official-forms',
    },
    {
      icon: 'compass', label: 'Decyzje inwestora',
      value: `${summary.decisionsUnresolved} nierozstrzygnietych`,
      color: summary.decisionsUnresolved > 0 ? '#DC2626' : '#16A34A',
      bg: summary.decisionsUnresolved > 0 ? '#FEF2F2' : '#F0FDF4',
      route: 'decisions',
    },
    {
      icon: 'help-circle', label: 'Pytania do specjalistow',
      value: `${summary.questionsOpen} bez odpowiedzi`,
      color: summary.questionsOpen > 0 ? '#D97706' : '#16A34A',
      bg: summary.questionsOpen > 0 ? '#FFFBEB' : '#F0FDF4',
      route: 'questions',
    },
    {
      icon: 'package', label: 'Pakiet zakonczeniowy',
      value: `${summary.completionReady}/${summary.completionTotal} gotowych`,
      color: summary.completionReady < summary.completionTotal ? '#D97706' : '#16A34A',
      bg: summary.completionReady < summary.completionTotal ? '#FFFBEB' : '#F0FDF4',
      route: 'completion-package',
    },
    {
      icon: 'folder', label: 'Dokumenty projektu',
      value: 'Pliki, notatki, zalaczniki',
      color: HB_ACCENT,
      bg: HB_ACCENT_BG,
      route: 'investor-docs',
    },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Centrum dokumentow' }} />
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
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>Centrum dokumentow</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              Podsumowanie statusu dokumentacji, decyzji i pytan
            </Txt>
          </View>

          {summary.highPriorityUnresolved > 0 && (
            <View style={{
              backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 16,
              borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', gap: 8,
            }}>
              <Feather name="alert-triangle" size={16} color="#DC2626" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Txt w="semibold" style={{ fontSize: 13, color: '#DC2626' }}>
                  {summary.highPriorityUnresolved} pilnych pytan bez odpowiedzi
                </Txt>
                <Txt style={{ fontSize: 11, color: '#991B1B', marginTop: 2 }}>
                  Rozwiaz pytania o wysokim priorytecie przed kontynuacja budowy.
                </Txt>
              </View>
            </View>
          )}

          {cards.map((card) => (
            <TouchableOpacity
              key={card.route}
              style={{
                backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10,
                borderWidth: 1, borderColor: Colors.border,
                flexDirection: 'row', alignItems: 'center', gap: 12,
              }}
              onPress={() => router.push({ pathname: `/house-build/${card.route}` as any, params: { projectId } })}
              activeOpacity={0.85}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: card.bg, alignItems: 'center', justifyContent: 'center',
              }}>
                <Feather name={card.icon as any} size={20} color={card.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{card.label}</Txt>
                <Txt style={{ fontSize: 12, color: card.color, marginTop: 2 }}>{card.value}</Txt>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}

          <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
              To narzedzie do organizacji i planowania. Nie zastepuje konsultacji z urzedem, kierownikiem budowy ani prawnikiem.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
