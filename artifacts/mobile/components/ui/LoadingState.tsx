import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Txt } from './Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useLanguage();
  const resolvedMessage = message ?? t('cmp.LoadingState.default');
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 16,
      }}
      accessibilityRole="progressbar"
      accessibilityLabel={resolvedMessage}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
      <Txt w="medium" style={{ fontSize: 15, color: Colors.textSecondary }}>
        {resolvedMessage}
      </Txt>
    </View>
  );
}
