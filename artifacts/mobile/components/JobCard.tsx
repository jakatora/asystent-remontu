import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RenovationJob } from '@/types/renovation';
import { Badge } from '@/components/ui/Badge';
import { Txt } from '@/components/ui/Txt';
import { getDifficultyLabel, getRiskLabel } from '@/utils/calculator';
import { useLanguage } from '@/context/LanguageContext';

interface JobCardProps {
  job: RenovationJob;
  onPress: () => void;
}

export function JobCard({ job, onPress }: JobCardProps) {
  const { t } = useLanguage();
  const days = job.estimatedDays === 1 ? t('cmp.JobCard.dayOne') : t('cmp.JobCard.dayMany');
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="bg-surface rounded-2xl p-4 border border-stroke mb-3">
      <View className="flex-row justify-between items-start mb-2.5">
        <View className="w-11 h-11 rounded-xl bg-primary-bg items-center justify-center" style={{ width: 44, height: 44, borderRadius: 12 }}>
          <Feather name={job.coverIcon as any} size={22} color="#F97316" />
        </View>
        <View className="flex-row gap-1.5 flex-wrap justify-end flex-1 ml-2">
          <Badge label={getDifficultyLabel(job.difficulty)} variant={job.difficulty} />
          {job.hireProfessionalRecommended && <Badge label={t('cmp.JobCard.professional')} variant="high" />}
        </View>
      </View>
      <Txt w="bold" className="text-[17px] text-ink mb-1">{job.name}</Txt>
      <Txt className="text-sm text-slate leading-5 mb-3" numberOfLines={2}>{job.description}</Txt>
      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-1.5">
          <Feather name="clock" size={13} color="#94A3B8" />
          <Txt w="medium" className="text-xs text-muted">{job.estimatedDays} {days}</Txt>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Feather name="shield" size={13} color="#94A3B8" />
          <Txt w="medium" className="text-xs text-muted">{getRiskLabel(job.riskLevel)}</Txt>
        </View>
      </View>
    </TouchableOpacity>
  );
}
