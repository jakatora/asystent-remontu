import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Txt } from './Txt';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="flex-row items-end justify-between mb-3">
      <View className="flex-1">
        <Txt w="bold" className="text-xl text-ink">{title}</Txt>
        {subtitle && <Txt className="text-sm text-slate mt-0.5">{subtitle}</Txt>}
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Txt w="semibold" className="text-sm text-primary">{actionLabel}</Txt>
        </TouchableOpacity>
      )}
    </View>
  );
}
