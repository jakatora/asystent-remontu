import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Project } from '@/types/renovation';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

const statusConfig = {
  planning: { label: 'Planowanie', color: Colors.info, bg: Colors.infoBg, icon: 'edit-3' },
  'in-progress': { label: 'W trakcie', color: Colors.warning, bg: Colors.warningBg, icon: 'tool' },
  completed: { label: 'Ukończony', color: Colors.success, bg: Colors.successBg, icon: 'check-circle' },
} as const;

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const config = statusConfig[project.status] || statusConfig.planning;
  const cost = project.calculationResult?.totalCost;
  const date = new Date(project.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
          <Text style={styles.jobName}>{project.jobName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Feather name={config.icon as any} size={12} color={config.color} />
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Feather name="calendar" size={13} color={Colors.textMuted} />
          <Text style={styles.statText}>{date}</Text>
        </View>
        {cost !== undefined && (
          <View style={styles.stat}>
            <Feather name="shopping-cart" size={13} color={Colors.textMuted} />
            <Text style={styles.statText}>~{formatCurrency(cost)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleGroup: { flex: 1, marginRight: 12 },
  name: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 2,
  },
  jobName: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: { flexDirection: 'row', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
});
