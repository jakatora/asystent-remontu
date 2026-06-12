import React from 'react';
import { View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { useLanguage } from '@/context/LanguageContext';
import type { ShoppingTier } from '@/types/domain';
import { TIER_META } from './types';

export function TierBadge({ tier }: { tier: ShoppingTier }) {
  const { t } = useLanguage();
  const meta = TIER_META[tier];
  return (
    <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: meta.bg, borderRadius: 6 }}>
      <Txt style={{ fontSize: 10, color: meta.color }} w="semibold">{t(meta.labelKey)}</Txt>
    </View>
  );
}
