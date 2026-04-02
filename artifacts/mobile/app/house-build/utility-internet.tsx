import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';

export default function UtilityInternetScreen() {
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'telecom',
        screenTitle: 'Internet / telekomunikacja',
      }}
    />
  );
}
