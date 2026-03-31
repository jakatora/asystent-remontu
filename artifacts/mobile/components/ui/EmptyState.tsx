import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from './Txt';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="items-center justify-center p-10">
      <View className="w-18 h-18 rounded-full bg-surface-alt items-center justify-center mb-4" style={{ width: 72, height: 72, borderRadius: 36 }}>
        <Feather name={icon as any} size={32} color="#94A3B8" />
      </View>
      <Txt w="semibold" className="text-lg text-slate text-center mb-2">{title}</Txt>
      {description && (
        <Txt className="text-sm text-muted text-center leading-5" style={{ maxWidth: 280 }}>{description}</Txt>
      )}
    </View>
  );
}
