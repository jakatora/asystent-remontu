import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RenovationJob } from '@/types/renovation';
import { Colors } from '@/constants/colors';
import { Badge } from '@/components/ui/Badge';
import { getDifficultyLabel, getRiskLabel } from '@/utils/calculator';

interface JobCardProps {
  job: RenovationJob;
  onPress: () => void;
}

export function JobCard({ job, onPress }: JobCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name={job.coverIcon as any} size={22} color={Colors.primary} />
        </View>
        <View style={styles.badges}>
          <Badge label={getDifficultyLabel(job.difficulty)} variant={job.difficulty} />
          {job.hireProfessionalRecommended && (
            <Badge label="Fachowiec" variant="high" />
          )}
        </View>
      </View>
      <Text style={styles.name}>{job.name}</Text>
      <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Feather name="clock" size={13} color={Colors.textMuted} />
          <Text style={styles.statText}>{job.estimatedDays} {job.estimatedDays === 1 ? 'dzień' : 'dni'}</Text>
        </View>
        <View style={styles.stat}>
          <Feather name="shield" size={13} color={Colors.textMuted} />
          <Text style={styles.statText}>{getRiskLabel(job.riskLevel)}</Text>
        </View>
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
    marginBottom: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1, marginLeft: 8 },
  name: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
});
