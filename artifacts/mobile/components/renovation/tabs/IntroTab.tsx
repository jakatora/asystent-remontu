import React from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { getDifficultyLabel } from '@/utils/calculator';
import type { RenovationJob } from '@/types/domain';

interface IntroTabProps {
  job: RenovationJob;
}

export function IntroTab({ job }: IntroTabProps) {
  const { t } = useLanguage();
  return (
    <View style={{ gap: 16, padding: 16 }}>
      <Txt style={{ fontSize: 15, color: Colors.text, lineHeight: 22 }}>{job.description}</Txt>

      {job.beginnerFriendlyDescription && (
        <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, gap: 6, borderWidth: 1, borderColor: '#BFDBFE' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="info" size={14} color={Colors.info} />
            <Txt w="semibold" style={{ fontSize: 12, color: Colors.info }}>{t('job.detail.intro.forBeginners')}</Txt>
          </View>
          <Txt style={{ fontSize: 13, color: '#1e40af', lineHeight: 19 }}>{job.beginnerFriendlyDescription}</Txt>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border }}>
          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{t('job.detail.intro.difficulty')}</Txt>
          <Txt w="bold" style={{ fontSize: 15, color: Colors.text, marginTop: 2 }}>
            {getDifficultyLabel(job.difficulty)}
          </Txt>
        </View>
        <View style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border }}>
          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{t('job.detail.intro.estimatedTime')}</Txt>
          <Txt w="bold" style={{ fontSize: 15, color: Colors.text, marginTop: 2 }}>
            {t('job.detail.intro.estimatedTimeValue', {
              days: job.estimatedDays,
              word: job.estimatedDays === 1 ? t('job.detail.dayOne') : t('job.detail.dayMany'),
            })}
          </Txt>
        </View>
      </View>

      <View>
        <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 4 }}>
          {t('job.detail.intro.sourcesTitle')}
        </Txt>
        <Txt style={{ fontSize: 12, color: Colors.textMuted, marginBottom: 8 }}>
          {t('job.detail.intro.sourcesHint')}
        </Txt>
        {job.verifiedSources && job.verifiedSources.length > 0 ? (
          <View style={{ gap: 6 }}>
            {job.verifiedSources.map((source) => (
              <TouchableOpacity
                key={source.url}
                onPress={() => Linking.openURL(source.url).catch(() => undefined)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                  backgroundColor: Colors.surface,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Feather name="link" size={14} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Txt w="medium" style={{ fontSize: 12, color: Colors.text }} numberOfLines={2}>
                    {source.title}
                  </Txt>
                  <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 1 }}>
                    {source.domain}
                  </Txt>
                </View>
                <Feather name="external-link" size={12} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Txt style={{ fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' }}>
            {t('job.detail.intro.notVerified')}
          </Txt>
        )}
        {job.verifiedAt && (
          <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 8 }}>
            {t('job.detail.intro.verifiedAt', { date: job.verifiedAt })}
          </Txt>
        )}
      </View>
    </View>
  );
}
