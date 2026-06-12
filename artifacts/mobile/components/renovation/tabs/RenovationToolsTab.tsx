import React from 'react';
import { View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { ShopPriceList } from '@/components/renovation/ShopPriceList';
import { resolveThumbnail } from '@/components/renovation/thumbnail-resolver';
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

  const renderTool = (tool: AnyTool) => {
    const shopPrices = (tool as ToolItem).shopPrices;
    const thumbnailUrl = resolveThumbnail(tool as ToolItem);
    return (
      <View key={tool.id} style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 14, padding: 12, marginBottom: 10, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: Colors.surface }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={(tool.icon as any) ?? 'tool'} size={22} color={Colors.textSecondary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{tool.name}</Txt>
            {tool.notes && (
              <Txt style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 }}>
                {tool.notes}
              </Txt>
            )}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {tool.rentable && (
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: Colors.infoBg, borderRadius: 6 }}>
                  <Txt style={{ fontSize: 10, color: Colors.info }}>{t('cmp.ToolCard.rentable')}</Txt>
                </View>
              )}
              {!tool.required && (
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: Colors.surface, borderRadius: 6 }}>
                  <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('cmp.ToolCard.optional')}</Txt>
                </View>
              )}
            </View>
          </View>
        </View>
        <ShopPriceList prices={shopPrices ?? []} />
      </View>
    );
  };

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
