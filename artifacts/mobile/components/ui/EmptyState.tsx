import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from './Txt';
import { Button } from './Button';
import { Colors } from '@/constants/colors';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View
      style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 24 }}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${description ?? ''}`}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: Colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Feather name={icon as any} size={32} color={Colors.textMuted} />
      </View>
      <Txt w="semibold" style={{ fontSize: 17, color: Colors.textSecondary, textAlign: 'center', marginBottom: 6 }}>
        {title}
      </Txt>
      {description && (
        <Txt style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, maxWidth: 280 }}>
          {description}
        </Txt>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: 16 }}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}
