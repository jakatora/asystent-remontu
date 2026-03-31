import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';

interface SummaryRowProps {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}

export function SummaryRow({ icon, label, value, valueColor, bold }: SummaryRowProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name={icon as any} size={16} color={Colors.textSecondary} />
        <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>{label}</Txt>
      </View>
      <Txt w={bold ? 'bold' : 'semibold'} style={{ fontSize: bold ? 16 : 14, color: valueColor ?? Colors.text }}>
        {value}
      </Txt>
    </View>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.border }} />;
}
