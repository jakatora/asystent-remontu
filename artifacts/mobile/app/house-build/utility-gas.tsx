import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';

export default function UtilityGasScreen() {
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'gas',
        screenTitle: 'Przylacze gazowe',
        showGasPurpose: true,
      }}
    />
  );
}
