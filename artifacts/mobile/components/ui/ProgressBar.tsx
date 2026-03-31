import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Txt } from './Txt';
import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  completed: number;
  total: number;
  height?: number;
  showLabel?: boolean;
  label?: string;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  completed,
  total,
  height = 6,
  showLabel = false,
  label,
  color,
  trackColor = Colors.border,
  style,
}: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const barColor = color ?? (pct === 100 ? Colors.success : Colors.primary);

  return (
    <View style={[{ gap: 4 }, style]}>
      {showLabel && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            {label ?? 'Postęp'}
          </Txt>
          <Txt
            w="semibold"
            style={{ fontSize: 12, color: pct === 100 ? Colors.success : Colors.primary }}
          >
            {pct}%
          </Txt>
        </View>
      )}
      <View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor,
          overflow: 'hidden',
        }}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: completed }}
      >
        <View
          style={{
            height,
            borderRadius: height / 2,
            backgroundColor: barColor,
            width: `${pct}%`,
          }}
        />
      </View>
    </View>
  );
}
