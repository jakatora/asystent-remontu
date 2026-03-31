import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WarningRule } from '@/types/renovation';
import { Txt } from './Txt';

interface WarningBannerProps {
  warnings: readonly WarningRule[];
}

const levelConfig = {
  info:    { bg: 'bg-info-bg border-l-4 border-info',    icon: 'info' as const,           text: 'text-blue-800' },
  warning: { bg: 'bg-warning-bg border-l-4 border-warning', icon: 'alert-triangle' as const, text: 'text-yellow-800' },
  danger:  { bg: 'bg-danger-bg border-l-4 border-danger',  icon: 'alert-octagon' as const,  text: 'text-red-800' },
};

const iconColors = { info: '#3B82F6', warning: '#F59E0B', danger: '#EF4444' };

export function WarningBanner({ warnings }: WarningBannerProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <View className="gap-2">
      {warnings.map((w, i) => {
        const cfg = levelConfig[w.level] ?? levelConfig.info;
        return (
          <View key={i} className={`flex-row items-start p-3.5 rounded-xl gap-2.5 ${cfg.bg}`}>
            <Feather name={cfg.icon} size={20} color={iconColors[w.level] ?? iconColors.info} style={{ marginTop: 1 }} />
            <Txt w="medium" className={`flex-1 text-sm leading-5 ${cfg.text}`}>{w.message}</Txt>
          </View>
        );
      })}
    </View>
  );
}
