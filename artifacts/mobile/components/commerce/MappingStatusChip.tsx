import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import type { MappingStatus } from '@/types/commerce';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/constants/i18n';

const STATUS_CONFIG: Record<MappingStatus, { labelKey: TranslationKey; icon: string; color: string; bg: string }> = {
  mapped: { labelKey: 'cmp.MappingStatusChip.mapped', icon: 'check-circle', color: '#059669', bg: '#D1FAE5' },
  unmapped: { labelKey: 'cmp.MappingStatusChip.unmapped', icon: 'alert-circle', color: '#92400E', bg: '#FEF3C7' },
  discontinued: { labelKey: 'cmp.MappingStatusChip.discontinued', icon: 'x-circle', color: '#DC2626', bg: '#FEE2E2' },
  out_of_stock: { labelKey: 'cmp.MappingStatusChip.outOfStock', icon: 'clock', color: '#D97706', bg: '#FEF3C7' },
};

interface MappingStatusChipProps {
  status: MappingStatus;
  compact?: boolean;
}

export function MappingStatusChip({ status, compact }: MappingStatusChipProps) {
  const { t } = useLanguage();
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
        {t(config.labelKey)}
      </Txt>
    </View>
  );
}
