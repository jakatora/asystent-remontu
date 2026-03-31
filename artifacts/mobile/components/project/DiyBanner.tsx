import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { DiyAssessmentResult } from './types';

interface DiyBannerProps {
  diy: DiyAssessmentResult;
  compact?: boolean;
}

export function DiyBanner({ diy, compact = false }: DiyBannerProps) {
  if (compact) {
    return (
      <View
        style={{
          backgroundColor: diy.bg,
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Feather name={diy.icon as any} size={18} color={diy.color} />
        <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: diy.color }}>
          {diy.headline}
        </Txt>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: diy.bg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: diy.color + '40',
        padding: 14,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      <Feather name={diy.icon as any} size={20} color={diy.color} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, gap: 4 }}>
        <Txt w="bold" style={{ fontSize: 14, color: diy.color }}>
          {diy.headline}
        </Txt>
        <Txt style={{ fontSize: 13, color: Colors.text, lineHeight: 18 }}>
          {diy.details}
        </Txt>
      </View>
    </View>
  );
}
