import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { ToolCartPreference } from '@/types/commerce';

interface ToolCartToggleProps {
  selected: ToolCartPreference;
  onSelect: (pref: ToolCartPreference) => void;
}

const OPTIONS: { key: ToolCartPreference; label: string; icon: string }[] = [
  { key: 'materials_only', label: 'Tylko materiały', icon: 'package' },
  { key: 'materials_and_required_tools', label: '+ wymagane narzędzia', icon: 'tool' },
  { key: 'materials_and_all_tools', label: '+ wszystkie narzędzia', icon: 'layers' },
];

export function ToolCartToggle({ selected, onSelect }: ToolCartToggleProps) {
  return (
    <View style={{ gap: 6 }}>
      <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>Co dodać do koszyka?</Txt>
      <View style={{ gap: 6 }}>
        {OPTIONS.map((opt) => {
          const active = selected === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => onSelect(opt.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: active ? Colors.primary : Colors.border,
                backgroundColor: active ? Colors.primaryBg : Colors.surface,
              }}
              activeOpacity={0.7}
            >
              <Feather
                name={opt.icon as any}
                size={16}
                color={active ? Colors.primary : Colors.textMuted}
              />
              <Txt
                w={active ? 'semibold' : 'medium'}
                style={{ fontSize: 13, color: active ? Colors.primary : Colors.textSecondary }}
              >
                {opt.label}
              </Txt>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
