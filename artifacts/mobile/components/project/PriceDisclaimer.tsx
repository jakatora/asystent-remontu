import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';

interface PriceDisclaimerProps {
  regionLabel: string;
  lastUpdated?: string;
  compact?: boolean;
}

export function PriceDisclaimer({ regionLabel, lastUpdated, compact }: PriceDisclaimerProps) {
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
          Ceny orientacyjne
        </Txt>
      </View>
      <Txt style={{ fontSize: compact ? 10 : 12, color: '#78350F', lineHeight: compact ? 15 : 18 }}>
        Ceny referencyjne dla regionu {regionLabel} na podstawie wybranych źródeł detalicznych.
        Rzeczywiste ceny mogą się różnić w zależności od sklepu, miasta, wykonawcy, ilości i poziomu jakości.
      </Txt>
      {lastUpdated && (
        <Txt style={{ fontSize: compact ? 9 : 11, color: '#A16207' }}>
          Aktualizacja danych: {lastUpdated}
        </Txt>
      )}
    </View>
  );
}
