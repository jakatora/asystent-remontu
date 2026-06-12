import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';
import { useLanguage } from '@/context/LanguageContext';

export default function UtilityElectricityScreen() {
  const { t } = useLanguage();
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'electricity',
        screenTitle: t('hb.utilityElectricity.screenTitle'),
        showConnectionPower: true,
        showTemporarySupply: true,
      }}
    />
  );
}
