import React, { useState } from 'react';
import { View, ScrollView, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '@/data/categories';
import { CategoryCard } from '@/components/CategoryCard';
import { Txt } from '@/components/ui/Txt';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 mb-4">
        <Txt w="bold" className="text-[26px] text-ink">Odkryj prace remontowe</Txt>
        <Txt className="text-[15px] text-slate mt-1">Wybierz kategorię żeby zobaczyć szczegóły</Txt>
      </View>

      <View className="flex-row items-center bg-surface mx-5 mb-5 rounded-2xl border border-stroke px-3.5 h-12">
        <Feather name="search" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
        <TextInput
          className="flex-1 text-[15px] text-ink"
          placeholder="Szukaj rodzaju pracy..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          style={{ fontFamily: 'Inter_400Regular' }}
        />
        {search.length > 0 && (
          <Feather name="x" size={16} color="#94A3B8" onPress={() => setSearch('')} />
        )}
      </View>

      <View className="flex-row flex-wrap gap-3 px-5">
        {filtered.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onPress={() => router.push({ pathname: '/category/[id]', params: { id: cat.id } })}
          />
        ))}
      </View>

      {filtered.length === 0 && (
        <View className="items-center pt-10 gap-3">
          <Feather name="search" size={32} color="#94A3B8" />
          <Txt w="medium" className="text-[15px] text-muted">Brak wyników dla "{search}"</Txt>
        </View>
      )}
    </ScrollView>
  );
}
