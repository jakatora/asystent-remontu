import React from 'react';
import { Pressable, type ViewStyle } from 'react-native';
export interface RadioCardProps {
  label: string; value: string; group: string; checked: boolean; disabled: boolean;
  onSelect: () => void; children: React.ReactNode; style: ViewStyle;
}
export function RadioCard({ label, checked, disabled, onSelect, children, style }: RadioCardProps) {
  return <Pressable accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked, disabled }} disabled={disabled} onPress={onSelect} style={style}>{children}</Pressable>;
}
