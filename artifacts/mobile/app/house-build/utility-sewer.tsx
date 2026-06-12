import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';
import { useLanguage } from '@/context/LanguageContext';

export default function UtilitySewerScreen() {
  const { t } = useLanguage();
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'sewage',
        screenTitle: t('hb.utilitySewer.screenTitle'),
      }}
    />
  );
}
