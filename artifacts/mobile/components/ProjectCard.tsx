import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Project } from '@/types/renovation';
import { Txt } from '@/components/ui/Txt';
import { formatCurrency } from '@/utils/calculator';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

const statusConfig = {
  planning:    { label: 'Planowanie', color: '#3B82F6', bg: '#EFF6FF', icon: 'edit-3' },
  'in-progress': { label: 'W trakcie',  color: '#F59E0B', bg: '#FFFBEB', icon: 'tool' },
  completed:   { label: 'Ukończony',  color: '#22C55E', bg: '#F0FDF4', icon: 'check-circle' },
} as const;

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const cfg = statusConfig[project.status] ?? statusConfig.planning;
  const cost = project.calculationResult?.totalCost;
  const date = new Date(project.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="bg-surface rounded-2xl p-4 border border-stroke mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Txt w="bold" className="text-[17px] text-ink mb-0.5" numberOfLines={1}>{project.name}</Txt>
          <Txt className="text-[13px] text-slate">{project.jobName}</Txt>
        </View>
        <View className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: cfg.bg }}>
          <Feather name={cfg.icon as any} size={12} color={cfg.color} />
          <Txt w="semibold" className="text-xs" style={{ color: cfg.color }}>{cfg.label}</Txt>
        </View>
      </View>
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
