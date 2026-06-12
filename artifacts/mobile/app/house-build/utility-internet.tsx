import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';
import { useLanguage } from '@/context/LanguageContext';

export default function UtilityInternetScreen() {
  const { t } = useLanguage();
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'telecom',
        screenTitle: t('hb.utilityInternet.screenTitle'),
      }}
    />
  );
}
