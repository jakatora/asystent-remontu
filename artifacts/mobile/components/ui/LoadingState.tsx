import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Txt } from './Txt';
import { Colors } from '@/constants/colors';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Ładowanie...' }: LoadingStateProps) {
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
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
      <Txt w="medium" style={{ fontSize: 15, color: Colors.textSecondary }}>
        {message}
      </Txt>
    </View>
  );
}
