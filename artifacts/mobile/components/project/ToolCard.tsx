import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/calculator';
import type { ToolItem } from '@/types/domain';
import type { ToolRequirement } from '@/types/engine';

type AnyTool = ToolItem | ToolRequirement;

export function ToolCard({ tool }: { tool: AnyTool }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: tool.required ? Colors.primaryBg : Colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Feather
          name={(tool.icon as any) ?? 'tool'}
          size={18}
          color={tool.required ? Colors.primary : Colors.textSecondary}
        />
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
            {tool.name}
          </Txt>
          {!tool.required && (
            <View style={{ paddingHorizontal: 7, paddingVertical: 2, backgroundColor: Colors.surfaceAlt, borderRadius: 6 }}>
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>opcjonalne</Txt>
            </View>
          )}
          {tool.rentable && (
            <View style={{ paddingHorizontal: 7, paddingVertical: 2, backgroundColor: Colors.infoBg, borderRadius: 6 }}>
              <Txt style={{ fontSize: 11, color: Colors.info }}>do wynajęcia</Txt>
            </View>
          )}
        </View>

        {tool.notes && (
          <Txt style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 17 }}>
            {tool.notes}
          </Txt>
        )}

        {(tool.estimatedBuyCostPLN || tool.estimatedRentCostPLN) ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
            {tool.estimatedBuyCostPLN && (
              <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
                Kup: ~{formatCurrency(tool.estimatedBuyCostPLN)}
              </Txt>
            )}
            {tool.estimatedRentCostPLN && (
              <Txt style={{ fontSize: 12, color: Colors.info }}>
                Wynajmij: ~{formatCurrency(tool.estimatedRentCostPLN)}
              </Txt>
            )}
          </View>
        ) : null}

        {tool.safetyNote && (
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              backgroundColor: Colors.warningBg,
              borderRadius: 8,
              padding: 8,
              alignItems: 'flex-start',
              marginTop: 4,
            }}
          >
            <Feather name="alert-triangle" size={12} color={Colors.warning} style={{ marginTop: 1 }} />
            <Txt style={{ flex: 1, fontSize: 11, color: '#92400e', lineHeight: 15 }}>
              {tool.safetyNote}
            </Txt>
          </View>
        )}
      </View>
    </View>
  );
}
