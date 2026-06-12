import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { RenovationJob } from '@/types/domain';
import { ToolCard } from './ToolCard';
import { DiyBanner } from './DiyBanner';
import type { DiyAssessmentResult } from './types';

interface ToolsTabProps {
  job: RenovationJob;
  diy: DiyAssessmentResult;
}

export function ToolsTab({ job, diy }: ToolsTabProps) {
  const { t } = useLanguage();
  const requiredTools = job.tools.filter((t) => t.required);
  const optionalTools = job.tools.filter((t) => !t.required);

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
          {t('cmp.ToolsTab.title')}
        </Txt>
        <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
          {t('cmp.ToolsTab.subtitle')}
        </Txt>
      </View>

      <DiyBanner diy={diy} compact />

      {requiredTools.length > 0 && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary }} />
            <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
              {t('cmp.ToolsTab.required', { count: requiredTools.length })}
            </Txt>
          </View>
          {requiredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </View>
      )}

      {optionalTools.length > 0 && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border }} />
            <Txt w="semibold" style={{ fontSize: 14, color: Colors.textSecondary }}>
              {t('cmp.ToolsTab.optional', { count: optionalTools.length })}
            </Txt>
          </View>
          {optionalTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </View>
      )}

      {job.tools.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
          <Feather name="tool" size={32} color={Colors.textMuted} />
          <Txt w="semibold" style={{ fontSize: 16, color: Colors.textSecondary }}>
            {t('cmp.ToolsTab.emptyTitle')}
          </Txt>
          <Txt style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center' }}>
            {t('cmp.ToolsTab.emptyBody')}
          </Txt>
        </View>
      )}

      {job.tools.some((t) => t.rentable) && (
        <View
          style={{
            backgroundColor: Colors.infoBg,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Feather name="info" size={16} color={Colors.info} style={{ marginTop: 1 }} />
          <Txt style={{ flex: 1, fontSize: 13, color: '#1e40af', lineHeight: 18 }}>
            {t('cmp.ToolsTab.rentInfo')}
          </Txt>
        </View>
      )}
    </View>
  );
}
