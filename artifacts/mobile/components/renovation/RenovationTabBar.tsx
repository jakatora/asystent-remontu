import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/constants/translations';

export type RenovationTab = 'intro' | 'howTo' | 'cost' | 'tools' | 'findPro' | 'safety';

const TABS: { id: RenovationTab; icon: keyof typeof Feather.glyphMap; labelKey: TranslationKey }[] = [
  { id: 'intro',   icon: 'book-open',     labelKey: 'job.detail.tab.intro' },
  { id: 'howTo',   icon: 'list',          labelKey: 'job.detail.tab.howTo' },
  { id: 'cost',    icon: 'dollar-sign',   labelKey: 'job.detail.tab.cost' },
  { id: 'tools',   icon: 'tool',          labelKey: 'job.detail.tab.tools' },
  { id: 'findPro', icon: 'user-check',    labelKey: 'job.detail.tab.findPro' },
  { id: 'safety',  icon: 'shield',        labelKey: 'job.detail.tab.safety' },
];

interface RenovationTabBarProps {
  current: RenovationTab;
  onChange: (tab: RenovationTab) => void;
}

export function RenovationTabBar({ current, onChange }: RenovationTabBarProps) {
  const { t } = useLanguage();
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 6 }}
      >
        {TABS.map((tab) => {
          const active = tab.id === current;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onChange(tab.id)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginHorizontal: 2,
                borderRadius: 10,
                backgroundColor: active ? Colors.primaryBg : 'transparent',
              }}
            >
              <Feather
                name={tab.icon}
                size={14}
                color={active ? Colors.primary : Colors.textSecondary}
              />
              <Txt
                w={active ? 'semibold' : 'medium'}
                style={{ fontSize: 13, color: active ? Colors.primary : Colors.textSecondary }}
              >
                {t(tab.labelKey)}
              </Txt>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
