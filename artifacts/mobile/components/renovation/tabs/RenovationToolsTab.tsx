import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { ToolCard } from '@/components/project/ToolCard';
import type { RenovationJob, ToolItem } from '@/types/domain';
import type { ToolRequirement } from '@/types/engine';

type AnyTool = ToolItem | ToolRequirement;

interface RenovationToolsTabProps {
  job: RenovationJob;
}

export function RenovationToolsTab({ job }: RenovationToolsTabProps) {
  const { t } = useLanguage();
  const required = (job.tools as readonly AnyTool[]).filter((to) => to.required);
  const optional = (job.tools as readonly AnyTool[]).filter((to) => !to.required);

  const renderTool = (tool: AnyTool) => <View key={tool.id} style={{marginBottom:10}}><ToolCard tool={tool}/></View>;

  return (
    <View style={{ gap: 14, padding: 16 }}>
      <Txt style={{ fontSize: 13, color: Colors.text }}>{t('cmp.ToolsTab.subtitle')}</Txt>
      {required.length > 0 && (
        <View>
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, marginBottom: 8 }}>
            {t('cmp.ToolsTab.required', { count: required.length })}
          </Txt>
          {required.map(renderTool)}
        </View>
      )}
      {optional.length > 0 && (
        <View>
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 8 }}>
            {t('cmp.ToolsTab.optional', { count: optional.length })}
          </Txt>
          {optional.map(renderTool)}
        </View>
      )}
      {job.tools.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Feather name="tool" size={28} color={Colors.textMuted} />
          <Txt style={{ fontSize: 13, color: Colors.textMuted, marginTop: 8 }}>
            {t('cmp.ToolsTab.emptyBody')}
          </Txt>
        </View>
      )}
    </View>
  );
}
