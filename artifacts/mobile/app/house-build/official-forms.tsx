import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { investorDocsRepo } from '@/db/repositories/investor-docs.repo';
import { OFFICIAL_FORM_DEFINITIONS } from '@/features/house-build/official-forms';
import type { OfficialFormRecord, OfficialFormStatus, ApplicabilityState } from '@/types/house-build';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const STATUS_CONFIG: Record<OfficialFormStatus, { label: string; color: string; bg: string; icon: string }> = {
  'not-started': { label: 'Nie rozpoczety', color: Colors.textMuted, bg: '#F1F5F9', icon: 'circle' },
  'in-progress': { label: 'W trakcie', color: '#D97706', bg: '#FFFBEB', icon: 'clock' },
  'submitted': { label: 'Zlozony', color: HB_ACCENT, bg: HB_ACCENT_BG, icon: 'send' },
  'completed': { label: 'Zakonczony', color: '#16A34A', bg: '#F0FDF4', icon: 'check-circle' },
  'not-applicable': { label: 'Nie dotyczy', color: Colors.textMuted, bg: '#F1F5F9', icon: 'minus-circle' },
};

const APPLICABILITY_LABELS: Record<ApplicabilityState, { label: string; color: string }> = {
  'required': { label: 'Wymagane', color: '#DC2626' },
  'likely-required': { label: 'Prawdopodobnie wymagane', color: '#D97706' },
  'maybe-required': { label: 'Moze byc wymagane', color: '#7C3AED' },
  'not-applicable': { label: 'Nie dotyczy', color: Colors.textMuted },
  'unknown': { label: 'Do ustalenia', color: Colors.textMuted },
};

export default function OfficialFormsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [forms, setForms] = useState<OfficialFormRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    let existing = await investorDocsRepo.getOfficialForms(projectId);
    if (existing.length === 0) {
      for (const def of OFFICIAL_FORM_DEFINITIONS) {
        await investorDocsRepo.upsertOfficialForm(projectId, def.formKey, {
          title: def.title,
          explanation: def.explanation,
          processPhase: def.processPhase,
          applicability: def.defaultApplicability,
          officialLink: def.officialLink,
        });
      }
      existing = await investorDocsRepo.getOfficialForms(projectId);
    }
    setForms(existing);
  }, [projectId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleStatusCycle = useCallback(async (form: OfficialFormRecord) => {
    if (!projectId) return;
    const cycle: OfficialFormStatus[] = ['not-started', 'in-progress', 'submitted', 'completed', 'not-applicable'];
    const idx = cycle.indexOf(form.status);
    const next = cycle[(idx + 1) % cycle.length];
    const completedDate = next === 'completed' ? new Date().toISOString().split('T')[0] : null;
    await investorDocsRepo.upsertOfficialForm(projectId, form.formKey, { status: next, completedDate });
    await loadData();
  }, [projectId, loadData]);

  const completed = forms.filter((f) => f.status === 'completed' || f.status === 'not-applicable').length;

  return (
    <>
      <Stack.Screen options={{ title: 'Formularze urzedowe' }} />
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
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>Formularze urzedowe</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              Sledzenie kluczowych formularzy i procesow budowlanych
            </Txt>
            <Txt w="semibold" style={{ fontSize: 12, color: HB_ACCENT, marginTop: 8 }}>
              {completed} z {forms.length} zakonczonych
            </Txt>
          </View>

          <View style={{
            backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 16,
            borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', gap: 8,
          }}>
            <Feather name="info" size={14} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 11, color: '#92400E', flex: 1 }}>
              To narzedzie do organizacji i sledzenia. Nie generuje dokumentow urzedowych ani nie zastepuje konsultacji z urzedem.
            </Txt>
          </View>

          {forms.map((form) => {
            const sc = STATUS_CONFIG[form.status] ?? STATUS_CONFIG['not-started'];
            const app = APPLICABILITY_LABELS[form.applicability] ?? APPLICABILITY_LABELS['unknown'];
            const isExpanded = expandedId === form.id;

            return (
              <View key={form.id} style={{ marginBottom: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
                    borderWidth: 1, borderColor: form.status === 'completed' ? '#BBF7D0' : Colors.border,
                  }}
                  onPress={() => setExpandedId(isExpanded ? null : form.id)}
                  onLongPress={() => handleStatusCycle(form)}
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
                      <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }} numberOfLines={2}>{form.title}</Txt>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                        <View style={{ backgroundColor: sc.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Txt style={{ fontSize: 9, color: sc.color }}>{sc.label}</Txt>
                        </View>
                        <Txt style={{ fontSize: 9, color: app.color }}>{app.label}</Txt>
                      </View>
                    </View>
                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{
                    backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginTop: 4,
                    borderWidth: 1, borderColor: '#E2E8F0',
                  }}>
                    <Txt style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 6 }}>{form.explanation}</Txt>
                    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                      <Feather name="clock" size={11} color={Colors.textMuted} />
                      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>Faza: {form.processPhase}</Txt>
                    </View>
                    {form.completedDate && (
                      <Txt style={{ fontSize: 10, color: '#16A34A' }}>Zakonczono: {form.completedDate}</Txt>
                    )}
                    {form.notes ? (
                      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 4 }}>{form.notes}</Txt>
                    ) : null}
                    <TouchableOpacity
                      style={{ marginTop: 8, backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center' }}
                      onPress={() => handleStatusCycle(form)}
                    >
                      <Txt w="semibold" style={{ fontSize: 12, color: '#fff' }}>Zmien status</Txt>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
              Przytrzymaj formularz, aby szybko zmienic status. Zastosowanie poszczegolnych formularzy zalezy od Twojego projektu i sciezki formalnej — zweryfikuj lokalnie.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
