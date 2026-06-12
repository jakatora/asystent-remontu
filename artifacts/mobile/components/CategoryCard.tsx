import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RenovationCategory } from '@/types/renovation';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { pluralize } from '@/utils/format';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryCardProps {
  category: RenovationCategory;
  onPress: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const { t } = useLanguage();
  const jobWord = pluralize(
    category.jobCount,
    t('cmp.CategoryCard.jobWord.one'),
    t('cmp.CategoryCard.jobWord.few'),
    t('cmp.CategoryCard.jobWord.many')
  );
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        width: '47%',
      }}
      accessibilityLabel={t('cmp.CategoryCard.a11y', { name: category.name, count: category.jobCount, word: jobWord })}
      accessibilityRole="button"
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: category.color + '18',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Feather name={category.icon as any} size={24} color={category.color} />
      </View>
      <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 4 }} numberOfLines={2}>
        {category.name}
      </Txt>
      <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
        {category.jobCount} {jobWord}
      </Txt>
    </TouchableOpacity>
  );
}
