import React from 'react';
import { View } from 'react-native';
import { Txt } from './Txt';

type BadgeVariant = 'easy' | 'medium' | 'hard' | 'low' | 'high' | 'warning' | 'info' | 'success';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, { bg: string; text: string }> = {
  easy:    { bg: 'bg-success-bg',  text: 'text-success' },
  medium:  { bg: 'bg-warning-bg',  text: 'text-warning' },
  hard:    { bg: 'bg-danger-bg',   text: 'text-danger' },
  low:     { bg: 'bg-success-bg',  text: 'text-success' },
  high:    { bg: 'bg-danger-bg',   text: 'text-danger' },
  warning: { bg: 'bg-warning-bg',  text: 'text-warning' },
  info:    { bg: 'bg-info-bg',     text: 'text-info' },
  success: { bg: 'bg-success-bg',  text: 'text-success' },
};

export function Badge({ label, variant = 'info' }: BadgeProps) {
  const cls = variantClasses[variant];
  return (
    <View className={`px-3 py-1 rounded-full self-start ${cls.bg}`}>
      <Txt w="semibold" className={`text-xs ${cls.text}`}>{label}</Txt>
    </View>
  );
}
