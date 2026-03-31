import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import type { Project } from '@/types/domain';
import { Txt } from '@/components/ui/Txt';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/utils/calculator';
import { checklistRepo } from '@/db/repositories/checklist.repo';
import { Colors } from '@/constants/colors';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

const statusConfig = {
  planning:      { label: 'Planowanie', color: Colors.info,    bg: Colors.infoBg,    icon: 'edit-3' },
  'in-progress': { label: 'W trakcie',  color: Colors.warning, bg: Colors.warningBg, icon: 'tool' },
  completed:     { label: 'Ukończony',  color: Colors.success, bg: Colors.successBg, icon: 'check-circle' },
} as const;

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const cfg = statusConfig[project.status] ?? statusConfig.planning;
  const cost = project.calculationResult?.totalCost;
  const date = new Date(project.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });

  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      checklistRepo.completedCount(project.id).then((p) => {
        if (mounted && p.total > 0) setProgress(p);
      }).catch(() => {});
      return () => { mounted = false; };
    }, [project.id])
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 12,
      }}
      accessibilityLabel={`Projekt ${project.name}, ${cfg.label}`}
      accessibilityRole="button"
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Txt w="bold" style={{ fontSize: 17, color: Colors.text, marginBottom: 2 }} numberOfLines={1}>
            {project.name}
          </Txt>
          <Txt style={{ fontSize: 13, color: Colors.textSecondary }}>{project.jobName}</Txt>
          {project.roomName && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Feather name="home" size={11} color={Colors.textMuted} />
              <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{project.roomName}</Txt>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: cfg.bg,
          }}
        >
          <Feather name={cfg.icon as any} size={12} color={cfg.color} />
          <Txt w="semibold" style={{ fontSize: 12, color: cfg.color }}>{cfg.label}</Txt>
        </View>
      </View>

      {progress && progress.total > 0 && (
        <View style={{ marginBottom: 8 }}>
          <ProgressBar
            completed={progress.completed}
            total={progress.total}
            height={4}
            showLabel
            label="Postęp"
          />
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Feather name="calendar" size={13} color={Colors.textMuted} />
          <Txt w="medium" style={{ fontSize: 12, color: Colors.textMuted }}>{date}</Txt>
        </View>
        {cost !== undefined && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="shopping-cart" size={13} color={Colors.textMuted} />
            <Txt w="medium" style={{ fontSize: 12, color: Colors.textMuted }}>~{formatCurrency(cost)}</Txt>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
