import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

interface PriceDisclaimerProps {
  regionLabel: string;
  lastUpdated?: string;
  compact?: boolean;
}

export function PriceDisclaimer({ regionLabel, lastUpdated, compact }: PriceDisclaimerProps) {
  const { t } = useLanguage();
  return (
    <View
      style={{
        backgroundColor: '#FEF9C3',
        borderRadius: 12,
        padding: compact ? 10 : 14,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FDE68A',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Feather name="info" size={compact ? 13 : 15} color="#92400E" />
        <Txt w="semibold" style={{ fontSize: compact ? 11 : 13, color: '#92400E' }}>
          {t('cmp.PriceDisclaimer.title')}
        </Txt>
      </View>
      <Txt style={{ fontSize: compact ? 10 : 12, color: '#78350F', lineHeight: compact ? 15 : 18 }}>
        {t('cmp.PriceDisclaimer.body', { region: regionLabel })}
      </Txt>
      {lastUpdated && (
        <Txt style={{ fontSize: compact ? 9 : 11, color: '#A16207' }}>
          {t('cmp.PriceDisclaimer.lastUpdated', { date: lastUpdated })}
        </Txt>
      )}
    </View>
  );
}
