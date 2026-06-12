import React, { useState } from 'react';
import { View, ScrollView, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '@/data/categories';
import { CategoryCard } from '@/components/CategoryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Txt w="bold" style={{ fontSize: 26, color: Colors.text }}>{t('exploreScreen.title')}</Txt>
        <Txt style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 4 }}>
          {t('exploreScreen.subtitle')}
        </Txt>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surface,
          marginHorizontal: 20,
          marginBottom: 20,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          paddingHorizontal: 14,
          height: 48,
        }}
      >
        <Feather name="search" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={{
            flex: 1,
            fontSize: 15,
            color: Colors.text,
            fontFamily: 'Inter_400Regular',
          }}
          placeholder={t('exploreScreen.searchPlaceholder')}
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel={t('exploreScreen.searchA11y')}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Feather
            name="x"
            size={16}
            color={Colors.textMuted}
            onPress={() => setSearch('')}
            accessibilityLabel={t('exploreScreen.clearSearchA11y')}
          />
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20 }}>
        {filtered.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onPress={() => router.push({ pathname: '/category/[id]', params: { id: cat.id } })}
          />
        ))}
      </View>

      {filtered.length === 0 && (
        <EmptyState
          icon="search"
          title={t('exploreScreen.empty.title', { query: search })}
          description={t('exploreScreen.empty.description')}
        />
      )}
    </ScrollView>
  );
}
