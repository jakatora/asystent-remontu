import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import type { MappingStatus } from '@/types/commerce';

const STATUS_CONFIG: Record<MappingStatus, { label: string; icon: string; color: string; bg: string }> = {
  mapped: { label: 'W sklepie', icon: 'check-circle', color: '#059669', bg: '#D1FAE5' },
  unmapped: { label: 'Brak w sklepie', icon: 'alert-circle', color: '#92400E', bg: '#FEF3C7' },
  discontinued: { label: 'Wycofany', icon: 'x-circle', color: '#DC2626', bg: '#FEE2E2' },
  out_of_stock: { label: 'Brak na stanie', icon: 'clock', color: '#D97706', bg: '#FEF3C7' },
};

interface MappingStatusChipProps {
  status: MappingStatus;
  compact?: boolean;
}

export function MappingStatusChip({ status, compact }: MappingStatusChipProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: config.bg,
        paddingHorizontal: compact ? 6 : 8,
        paddingVertical: compact ? 2 : 3,
        borderRadius: 8,
      }}
    >
      <Feather name={config.icon as any} size={compact ? 10 : 12} color={config.color} />
      <Txt style={{ fontSize: compact ? 9 : 10, color: config.color }}>
        {config.label}
      </Txt>
    </View>
  );
}
