import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';

export default function UtilityElectricityScreen() {
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'electricity',
        screenTitle: 'Przylacze elektryczne',
        showConnectionPower: true,
        showTemporarySupply: true,
      }}
    />
  );
}
