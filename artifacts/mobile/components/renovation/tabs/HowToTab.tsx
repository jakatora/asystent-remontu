import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { RenovationJob, InstructionStep } from '@/types/domain';
import type { StepGuide } from '@/types/engine';

interface HowToTabProps {
  job: RenovationJob;
}

type AnyStep = StepGuide | InstructionStep;

function StepCard({ step, n }: { step: AnyStep; n: number }) {
  const { t } = useLanguage();
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <Txt w="bold" style={{ fontSize: 12, color: '#fff' }}>{n}</Txt>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border }}>
        <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{step.title}</Txt>
        <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 19 }}>
          {step.description}
        </Txt>
        {step.tip && (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, padding: 8, backgroundColor: Colors.infoBg, borderRadius: 8 }}>
            <Feather name="info" size={12} color={Colors.info} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Txt w="semibold" style={{ fontSize: 11, color: Colors.info }}>{t('job.detail.howTo.tip')}</Txt>
              <Txt style={{ fontSize: 12, color: '#1e40af', lineHeight: 17 }}>{step.tip}</Txt>
            </View>
          </View>
        )}
        {step.warning && (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, padding: 8, backgroundColor: Colors.warningBg, borderRadius: 8 }}>
            <Feather name="alert-triangle" size={12} color={Colors.warning} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Txt w="semibold" style={{ fontSize: 11, color: Colors.warning }}>{t('job.detail.howTo.warning')}</Txt>
              <Txt style={{ fontSize: 12, color: '#92400e', lineHeight: 17 }}>{step.warning}</Txt>
            </View>
          </View>
        )}
        {step.checkpoints && step.checkpoints.length > 0 && (
          <View style={{ marginTop: 8, gap: 4 }}>
            {step.checkpoints.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                <Feather name="check" size={12} color={Colors.success} style={{ marginTop: 3 }} />
                <Txt style={{ fontSize: 12, color: Colors.textSecondary, flex: 1 }}>{c}</Txt>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function SectionHeader({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
      <Feather name={icon} size={16} color={Colors.primary} />
      <Txt w="bold" style={{ fontSize: 15, color: Colors.text }}>{label}</Txt>
    </View>
  );
}

export function HowToTab({ job }: HowToTabProps) {
  const { t } = useLanguage();

  const prep = job.preparationSteps ?? [];
  const work = job.workSteps ?? [];
  // Legacy support: if no preparationSteps/workSteps, fall back to job.instructions split by step ordinal.
  const legacy = (prep.length === 0 && work.length === 0) ? job.instructions : [];
  const dryingTimes = job.dryingTimes ?? [];

  if (prep.length === 0 && work.length === 0 && legacy.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Txt style={{ fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' }}>
          {t('job.detail.howTo.empty')}
        </Txt>
      </View>
    );
  }

  let counter = 0;
  return (
    <View style={{ gap: 16, padding: 16 }}>
      {prep.length > 0 && (
        <View style={{ gap: 12 }}>
          <SectionHeader icon="clipboard" label={t('job.detail.howTo.prepHeader')} />
          {prep.map((s) => <StepCard key={`p-${s.step}`} step={s} n={++counter} />)}
        </View>
      )}
      {work.length > 0 && (
        <View style={{ gap: 12 }}>
          <SectionHeader icon="play-circle" label={t('job.detail.howTo.workHeader')} />
          {work.map((s) => <StepCard key={`w-${s.step}`} step={s} n={++counter} />)}
        </View>
      )}
      {legacy.length > 0 && (
        <View style={{ gap: 12 }}>
          <SectionHeader icon="play-circle" label={t('job.detail.howTo.workHeader')} />
          {legacy.map((s) => <StepCard key={`l-${s.step}`} step={s} n={++counter} />)}
        </View>
      )}
      {dryingTimes.length > 0 && (
        <View style={{ gap: 8 }}>
          <SectionHeader icon="clock" label={t('job.detail.howTo.dryingHeader')} />
          {dryingTimes.map((d, i) => (
            <View key={i} style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 10 }}>
              <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{d.description}</Txt>
              <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                {t('job.detail.howTo.dryingValue', { min: d.minHours, max: d.maxHours, conditions: d.conditions ?? '—' })}
              </Txt>
            </View>
          ))}
        </View>
      )}
      {job.cleanupSteps && job.cleanupSteps.length > 0 && (
        <View style={{ gap: 8 }}>
          <SectionHeader icon="trash-2" label={t('job.detail.howTo.cleanupHeader')} />
          {job.cleanupSteps.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Feather name="check-circle" size={14} color={Colors.success} style={{ marginTop: 2 }} />
              <Txt style={{ fontSize: 13, color: Colors.textSecondary, flex: 1 }}>{s}</Txt>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
