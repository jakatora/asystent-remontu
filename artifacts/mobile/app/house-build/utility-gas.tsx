import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';
import { useLanguage } from '@/context/LanguageContext';

export default function UtilityGasScreen() {
  const { t } = useLanguage();
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'gas',
        screenTitle: t('hb.utilityGas.screenTitle'),
        showGasPurpose: true,
      }}
    />
  );
}
