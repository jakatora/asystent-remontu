import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useHouseBuild } from '@/context/HouseBuildContext';
import { getStageByKey } from '@/features/house-build/stages';
import { getWarningsForStage } from '@/features/house-build/warnings';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { ChecklistItemRecord, DocumentRecord } from '@/db/repositories/house-build.repo';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const DOC_STATUS_LABELS: Record<string, string> = {
  missing: 'Brakujacy',
  'in-progress': 'W trakcie',
  obtained: 'Uzyskany',
  'not-needed': 'Nie dotyczy',
};

const DOC_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  missing: { bg: Colors.dangerBg, fg: Colors.danger },
  'in-progress': { bg: Colors.warningBg, fg: Colors.warning },
  obtained: { bg: Colors.successBg, fg: Colors.success },
  'not-needed': { bg: Colors.surfaceAlt, fg: Colors.textMuted },
};

export default function StageDetail() {
  const { projectId, stageKey } = useLocalSearchParams<{ projectId: string; stageKey: string }>();
  const insets = useSafeAreaInsets();
  const { getChecklist, toggleChecklistItem, getDocuments, updateDocumentStatus } = useHouseBuild();

  const stage = getStageByKey(stageKey);
  const warnings = getWarningsForStage(stageKey);

  const [checklist, setChecklist] = useState<ChecklistItemRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  const loadData = useCallback(async () => {
    const [cl, docs] = await Promise.all([
      getChecklist(projectId, stageKey),
      getDocuments(projectId, stageKey),
    ]);
    setChecklist(cl);
    setDocuments(docs);
  }, [projectId, stageKey, getChecklist, getDocuments]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleToggle = async (itemId: string, currentValue: boolean) => {
    await toggleChecklistItem(itemId, !currentValue);
    await loadData();
  };

  const handleDocStatus = async (docId: string, current: string) => {
    const next = current === 'missing' ? 'in-progress' : current === 'in-progress' ? 'obtained' : 'missing';
    await updateDocumentStatus(docId, next);
    await loadData();
  };

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;
  const done = checklist.filter((c) => c.completed).length;
  const total = checklist.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  if (!stage) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: Colors.textMuted }}>Etap nie znaleziony</Txt>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: stage.name }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#BFDBFE',
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Feather name={stage.icon as any} size={20} color={HB_ACCENT} />
              <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{stage.name}</Txt>
            </View>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{stage.description}</Txt>
            {stage.estimatedWeeks && (
              <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 6 }}>
                Szacowany czas: ~{stage.estimatedWeeks} tygodni
              </Txt>
            )}
            {total > 0 && (
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Txt style={{ fontSize: 12, color: Colors.textMuted }}>Postep</Txt>
                  <Txt w="semibold" style={{ fontSize: 12, color: HB_ACCENT }}>{done}/{total} ({progress}%)</Txt>
                </View>
                <View style={{ height: 6, backgroundColor: '#DBEAFE', borderRadius: 3 }}>
                  <View style={{ height: 6, backgroundColor: progress === 100 ? Colors.success : HB_ACCENT, borderRadius: 3, width: `${progress}%` }} />
                </View>
              </View>
            )}
          </View>

          {warnings.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              {warnings.map((w) => (
                <View
                  key={w.id}
                  style={{
                    backgroundColor: w.warningLevel === 'danger' ? Colors.dangerBg : Colors.warningBg,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: w.warningLevel === 'danger' ? '#FECACA' : '#FDE68A',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Feather name="alert-triangle" size={14} color={w.warningLevel === 'danger' ? Colors.danger : Colors.warning} />
                    <Txt w="semibold" style={{ fontSize: 13, color: w.warningLevel === 'danger' ? '#991B1B' : '#92400E' }}>
                      {w.title}
                    </Txt>
                  </View>
                  <Txt style={{ fontSize: 12, color: w.warningLevel === 'danger' ? '#991B1B' : '#92400E', marginLeft: 22 }}>
                    {w.description}
                  </Txt>
                </View>
              ))}
            </View>
          )}

          {stage.requiredProfessionals.length > 0 && (
            <View style={{
              backgroundColor: '#F5F3FF',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#DDD6FE',
            }}>
              <Txt w="semibold" style={{ fontSize: 13, color: '#6D28D9', marginBottom: 6 }}>
                Wymagani specjalisci
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {stage.requiredProfessionals.map((role) => (
                  <View key={role} style={{ backgroundColor: '#EDE9FE', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Txt style={{ fontSize: 11, color: '#6D28D9' }}>{role}</Txt>
                  </View>
                ))}
              </View>
            </View>
          )}

          {checklist.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 10 }}>Lista kontrolna</Txt>
              {checklist.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    borderWidth: 1,
                    borderColor: item.completed ? Colors.successBg : Colors.border,
                  }}
                  onPress={() => handleToggle(item.id, item.completed)}
                  activeOpacity={0.8}
                >
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: item.completed ? Colors.success : Colors.textMuted,
                    backgroundColor: item.completed ? Colors.successBg : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.completed && <Feather name="check" size={14} color={Colors.success} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt
                      w={item.completed ? 'regular' : 'semibold'}
                      style={{
                        fontSize: 13,
                        color: item.completed ? Colors.textMuted : Colors.text,
                        textDecorationLine: item.completed ? 'line-through' : 'none',
                      }}
                    >
                      {item.title}
                    </Txt>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      {item.requiresProfessional && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Feather name="user" size={10} color="#8B5CF6" />
                          <Txt style={{ fontSize: 10, color: '#8B5CF6' }}>Fachowiec</Txt>
                        </View>
                      )}
                      {item.warningCategory && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Feather name="alert-circle" size={10} color={Colors.warning} />
                          <Txt style={{ fontSize: 10, color: Colors.warning }}>{CATEGORY_SHORT[item.warningCategory] ?? item.warningCategory}</Txt>
                        </View>
                      )}
                      <PriorityBadge priority={item.priority} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {documents.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 10 }}>Wymagane dokumenty</Txt>
              {documents.map((doc) => {
                const sc = DOC_STATUS_COLORS[doc.status] ?? DOC_STATUS_COLORS.missing;
                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={{
                      backgroundColor: Colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 6,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                    onPress={() => handleDocStatus(doc.id, doc.status)}
                    activeOpacity={0.8}
                  >
                    <Feather name="file-text" size={18} color={sc.fg} />
                    <View style={{ flex: 1 }}>
                      <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{doc.name}</Txt>
                      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{doc.description}</Txt>
                    </View>
                    <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Txt style={{ fontSize: 10, color: sc.fg }}>{DOC_STATUS_LABELS[doc.status]}</Txt>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const CATEGORY_SHORT: Record<string, string> = {
  'formal-legal': 'Formalne',
  'technical-documentation': 'Dokumentacja',
  'professional-required': 'Fachowiec',
  'safety': 'BHP',
  'not-diy': 'Nie DIY',
};

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === 'normal' || priority === 'low') return null;
  const colors: Record<string, { bg: string; fg: string }> = {
    high: { bg: Colors.warningBg, fg: Colors.warning },
    critical: { bg: Colors.dangerBg, fg: Colors.danger },
  };
  const c = colors[priority] ?? colors.high;
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
      <Txt style={{ fontSize: 9, color: c.fg }}>{priority === 'critical' ? 'Krytyczne' : 'Wazne'}</Txt>
    </View>
  );
}
