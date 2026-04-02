import React from 'react';
import { UtilityDetailScreen } from '@/components/house-build/utility-detail-shared';

export default function UtilitySewerScreen() {
  return (
    <UtilityDetailScreen
      config={{
        utilityType: 'sewage',
        screenTitle: 'Przylacze kanalizacyjne',
      }}
    />
  );
}
