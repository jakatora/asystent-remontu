import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from './Txt';
import { Colors } from '@/constants/colors';
import type { SelectOption } from '@/types/engine';

/** The stored numeric code is never an editable number or user-facing label. */
export function MeasurementSelect({ label, options, value, onChange }: {
  label: string; options: readonly SelectOption[]; value: number | undefined; onChange: (value: number) => void;
}) {
  return <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ gap: 8 }}>
    {options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
      accessibilityState={{ checked: value === option.value }} {...(Platform.OS === 'web' ? { 'aria-checked': value === option.value } : {})}
      onPress={() => onChange(option.value)} style={{ minHeight: 48, padding: 14, borderRadius: 12, borderWidth: 1,
        borderColor: value === option.value ? Colors.primary : Colors.border,
        backgroundColor: value === option.value ? Colors.primaryBg : Colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Feather name={value === option.value ? 'check-circle' : 'circle'} color={value === option.value ? Colors.primary : Colors.textMuted} size={20}/>
      <Txt style={{ flex: 1, fontSize: 15, lineHeight: 22, color: Colors.text }}>{option.label}</Txt>
    </Pressable>)}
  </View>;
}
