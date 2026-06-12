import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';
import { useLanguage } from '@/context/LanguageContext';

export default function UtilityWaterScreen() {
  const { t } = useLanguage();
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'water',
        screenTitle: t('hb.utilityWater.screenTitle'),
      }}
    />
  );
}
