import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';

export default function UtilityWaterScreen() {
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'water',
        screenTitle: 'Przylacze wodociagowe',
      }}
    />
  );
}
