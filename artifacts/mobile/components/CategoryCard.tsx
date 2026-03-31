import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RenovationCategory } from '@/types/renovation';
import { Txt } from '@/components/ui/Txt';

interface CategoryCardProps {
  category: RenovationCategory;
  onPress: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const jobWord = category.jobCount === 1 ? 'rodzaj' : 'rodzaje';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-surface rounded-2xl p-4 border border-stroke"
      style={{ width: '47%' }}
    >
      <View
        className="w-13 h-13 rounded-xl items-center justify-center mb-3"
        style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: category.color + '20' }}
      >
        <Feather name={category.icon as any} size={26} color={category.color} />
      </View>
      <Txt w="semibold" className="text-[15px] text-ink mb-1" numberOfLines={2}>{category.name}</Txt>
      <Txt className="text-xs text-muted">{category.jobCount} {jobWord}</Txt>
    </TouchableOpacity>
  );
}
