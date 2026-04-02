import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useHouseBuild } from '@/context/HouseBuildContext';
import { BUILD_STAGES } from '@/features/house-build/stages';
import { getWarningsForStage } from '@/features/house-build/warnings';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { ChecklistItemRecord } from '@/db/repositories/house-build.repo';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planowanie',
  formalities: 'Formalnosci',
  'in-progress': 'W budowie',
  paused: 'Wstrzymany',
  completed: 'Zakonczony',
};

export default function HouseBuildProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getProjectById, refreshProjects, deleteProject, getChecklist, seedChecklistForStage, seedDocumentsForStage } = useHouseBuild();

  const [checklistCounts, setChecklistCounts] = useState<Record<string, { done: number; total: number }>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  const project = getProjectById(id);

  useFocusEffect(
    useCallback(() => {
      refreshProjects();
    }, [refreshProjects])
  );

  useEffect(() => {
    if (!project) return;
    (async () => {
      const allItems = await getChecklist(project.id);
      const counts: Record<string, { done: number; total: number }> = {};
      for (const item of allItems) {
        if (!counts[item.stageKey]) counts[item.stageKey] = { done: 0, total: 0 };
        counts[item.stageKey].total++;
        if (item.completed) counts[item.stageKey].done++;
      }
      setChecklistCounts(counts);
    })();
  }, [project, getChecklist]);

  const handleDelete = useCallback(() => {
    if (isDeleting || !project) return;
    Alert.alert(
      'Usun projekt',
      `Czy na pewno chcesz usunac "${project.name}"? Tej operacji nie mozna cofnac.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usun',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            await deleteProject(project.id);
            router.back();
          },
        },
      ]
    );
  }, [isDeleting, project, deleteProject]);

  const handleOpenStage = useCallback(async (stageKey: string) => {
    if (!project) return;
    await seedChecklistForStage(project.id, stageKey);
    await seedDocumentsForStage(project.id, stageKey);
    router.push({ pathname: '/house-build/stage', params: { projectId: project.id, stageKey } });
  }, [project, seedChecklistForStage, seedDocumentsForStage]);

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const warnings = useMemo(() => {
    const all: { stageKey: string; title: string; level: string }[] = [];
    for (const stage of BUILD_STAGES.slice(0, 4)) {
      const stageWarnings = getWarningsForStage(stage.key);
      for (const w of stageWarnings) {
        all.push({ stageKey: stage.key, title: w.title, level: w.warningLevel });
      }
    }
    return all.slice(0, 4);
  }, []);

  if (!project) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: Colors.textMuted }}>Projekt nie znaleziony</Txt>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: project.name, headerRight: () => (
        <TouchableOpacity onPress={handleDelete} style={{ marginRight: 8 }} accessibilityLabel="Usun projekt">
          <Feather name="trash-2" size={20} color={Colors.danger} />
        </TouchableOpacity>
      )}} />
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
            marginBottom: 20,
          }}>
            <Txt w="bold" style={{ fontSize: 18, color: HB_ACCENT }}>{project.name}</Txt>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
              {project.landContext.plotCity || 'Brak lokalizacji'} · {STATUS_LABELS[project.status]}
            </Txt>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <InfoChip icon="home" label={project.planningContext.houseType === 'detached' ? 'Wolnostojacy' : project.planningContext.houseType} />
              <InfoChip icon="layers" label={`${project.planningContext.floorsAboveGround} kond.`} />
              {project.planningContext.approximateFootprint && (
                <InfoChip icon="maximize" label={`${project.planningContext.approximateFootprint} m2`} />
              )}
            </View>
          </View>

          {warnings.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 10 }}>Wazne ostrzezenia</Txt>
              {warnings.map((w, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: w.level === 'danger' ? Colors.dangerBg : Colors.warningBg,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    borderWidth: 1,
                    borderColor: w.level === 'danger' ? '#FECACA' : '#FDE68A',
                  }}
                >
                  <Feather
                    name="alert-triangle"
                    size={16}
                    color={w.level === 'danger' ? Colors.danger : Colors.warning}
                  />
                  <Txt style={{ fontSize: 12, color: w.level === 'danger' ? '#991B1B' : '#92400E', flex: 1 }}>
                    {w.title}
                  </Txt>
                </View>
              ))}
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <QuickAction
              icon="file-text"
              label="Dokumenty"
              color={Colors.info}
              bg={Colors.infoBg}
              onPress={() => router.push({ pathname: '/house-build/documents', params: { projectId: project.id } })}
            />
            <QuickAction
              icon="users"
              label="Specjalisci"
              color="#8B5CF6"
              bg="#F5F3FF"
              onPress={() => router.push('/house-build/professionals')}
            />
            <QuickAction
              icon="zap"
              label="Przylacza"
              color={Colors.warning}
              bg={Colors.warningBg}
              onPress={() => router.push({ pathname: '/house-build/utilities', params: { projectId: project.id } })}
            />
          </View>

          <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 12 }}>Etapy budowy</Txt>
          {BUILD_STAGES.map((stage) => {
            const counts = checklistCounts[stage.key];
            const progress = counts && counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;
            const hasItems = counts && counts.total > 0;
            return (
              <TouchableOpacity
                key={stage.key}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
                onPress={() => handleOpenStage(stage.key)}
                activeOpacity={0.85}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: hasItems && progress === 100 ? Colors.successBg : HB_ACCENT_BG,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Feather
                    name={hasItems && progress === 100 ? 'check-circle' : stage.icon as any}
                    size={18}
                    color={hasItems && progress === 100 ? Colors.success : HB_ACCENT}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{stage.name}</Txt>
                  {hasItems ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <View style={{ flex: 1, height: 4, backgroundColor: Colors.border, borderRadius: 2 }}>
                        <View style={{ height: 4, backgroundColor: progress === 100 ? Colors.success : HB_ACCENT, borderRadius: 2, width: `${progress}%` }} />
                      </View>
                      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{counts.done}/{counts.total}</Txt>
                    </View>
                  ) : (
                    <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{stage.description}</Txt>
                  )}
                </View>
                <Feather name="chevron-right" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

function InfoChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
      <Feather name={icon as any} size={12} color={HB_ACCENT} />
      <Txt style={{ fontSize: 11, color: Colors.text }}>{label}</Txt>
    </View>
  );
}

function QuickAction({ icon, label, color, bg, onPress }: {
  icon: string;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Txt w="semibold" style={{ fontSize: 11, color: Colors.text, textAlign: 'center' }}>{label}</Txt>
    </TouchableOpacity>
  );
}
