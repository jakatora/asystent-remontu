import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import type { Project } from '@/types/domain';
import { Txt } from '@/components/ui/Txt';
import { formatCurrency } from '@/utils/calculator';
import { checklistRepo } from '@/db/repositories/checklist.repo';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

const statusConfig = {
  planning:      { label: 'Planowanie', color: '#3B82F6', bg: '#EFF6FF', icon: 'edit-3' },
  'in-progress': { label: 'W trakcie',  color: '#F59E0B', bg: '#FFFBEB', icon: 'tool' },
  completed:     { label: 'Ukończony',  color: '#22C55E', bg: '#F0FDF4', icon: 'check-circle' },
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

  const progressPct = progress && progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="bg-surface rounded-2xl p-4 border border-stroke mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-3">
          <Txt w="bold" className="text-[17px] text-ink mb-0.5" numberOfLines={1}>{project.name}</Txt>
          <Txt className="text-[13px] text-slate">{project.jobName}</Txt>
          {project.roomName && (
            <View className="flex-row items-center gap-1 mt-1">
              <Feather name="home" size={11} color="#94A3B8" />
              <Txt className="text-xs text-muted">{project.roomName}</Txt>
            </View>
          )}
        </View>
        <View className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: cfg.bg }}>
          <Feather name={cfg.icon as any} size={12} color={cfg.color} />
          <Txt w="semibold" className="text-xs" style={{ color: cfg.color }}>{cfg.label}</Txt>
        </View>
      </View>

      {progressPct !== null && (
        <View className="mb-2" style={{ gap: 4 }}>
          <View className="flex-row justify-between items-center">
            <Txt className="text-[11px] text-muted">Postęp</Txt>
            <Txt w="semibold" className="text-[11px]" style={{ color: progressPct === 100 ? '#22C55E' : '#F59E0B' }}>
              {progressPct}%
            </Txt>
          </View>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
            <View
              style={{
                height: 4,
                borderRadius: 2,
                backgroundColor: progressPct === 100 ? '#22C55E' : '#F97316',
                width: `${progressPct}%`,
              }}
            />
          </View>
        </View>
      )}

      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-1.5">
          <Feather name="calendar" size={13} color="#94A3B8" />
          <Txt w="medium" className="text-xs text-muted">{date}</Txt>
        </View>
        {cost !== undefined && (
          <View className="flex-row items-center gap-1.5">
            <Feather name="shopping-cart" size={13} color="#94A3B8" />
            <Txt w="medium" className="text-xs text-muted">~{formatCurrency(cost)}</Txt>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
