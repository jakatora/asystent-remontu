import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import type { QualityTier } from '@/types/pricing';
import { useLanguage } from '@/context/LanguageContext';

interface QualityTierSelectorProps {
  selected: QualityTier;
  onSelect: (tier: QualityTier) => void;
}

export function QualityTierSelector({ selected, onSelect }: QualityTierSelectorProps) {
  const { t } = useLanguage();
  const TIERS: { key: QualityTier; label: string; icon: string; color: string; bg: string }[] = [
    { key: 'economy', label: t('cmp.QualityTierSelector.economy'), icon: 'tag', color: '#059669', bg: '#D1FAE5' },
    { key: 'standard', label: t('cmp.QualityTierSelector.standard'), icon: 'star', color: Colors.primary, bg: Colors.primaryBg },
    { key: 'better', label: t('cmp.QualityTierSelector.better'), icon: 'award', color: '#7C3AED', bg: '#EDE9FE' },
    { key: 'custom', label: t('cmp.QualityTierSelector.custom'), icon: 'edit-3', color: Colors.textSecondary, bg: Colors.surfaceAlt },
  ];
  return (
    <View style={{ gap: 8 }}>
      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{t('cmp.QualityTierSelector.heading')}</Txt>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {TIERS.map((t) => {
          const isActive = selected === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => onSelect(t.key)}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 6,
                borderRadius: 12,
                alignItems: 'center',
                gap: 4,
                borderWidth: 1.5,
                borderColor: isActive ? t.color : Colors.border,
                backgroundColor: isActive ? t.bg : Colors.surface,
              }}
              activeOpacity={0.7}
            >
              <Feather name={t.icon as any} size={16} color={isActive ? t.color : Colors.textMuted} />
              <Txt
                w={isActive ? 'bold' : 'medium'}
                style={{ fontSize: 11, color: isActive ? t.color : Colors.textSecondary, textAlign: 'center' }}
              >
                {t.label}
              </Txt>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
