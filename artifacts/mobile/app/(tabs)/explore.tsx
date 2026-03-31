import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { CATEGORIES } from '@/data/categories';
import { CategoryCard } from '@/components/CategoryCard';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Odkryj prace remontowe</Text>
        <Text style={styles.subtitle}>Wybierz kategorię żeby zobaczyć szczegóły</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj rodzaju pracy..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.grid}>
        {filtered.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onPress={() => router.push({ pathname: '/category/[id]', params: { id: cat.id } })}
          />
        ))}
      </View>

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Feather name="search" size={32} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Brak wyników dla "{search}"</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', color: Colors.text },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.textMuted },
});
