import React from 'react';
import { Text, TextProps } from 'react-native';

const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

type Weight = keyof typeof F;

interface TxtProps extends TextProps {
  w?: Weight;
}

export function Txt({ w = 'regular', style, ...props }: TxtProps) {
  return <Text style={[{ fontFamily: F[w] }, style]} {...props} />;
}
