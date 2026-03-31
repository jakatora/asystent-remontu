import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

type Filter = 'all' | 'planning' | 'in-progress' | 'completed';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'planning', label: 'Planowanie' },
  { id: 'in-progress', label: 'W trakcie' },
  { id: 'completed', label: 'Ukończone' },
];

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { projects } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Twoje projekty</Text>
        <Text style={styles.subtitle}>{projects.length} {projects.length === 1 ? 'projekt' : 'projektów'}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScroll}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.filterBtn, filter === f.id && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <EmptyState
              icon="folder"
              title={filter === 'all' ? 'Brak projektów' : 'Brak projektów w tej kategorii'}
              description={filter === 'all' ? 'Zacznij od nowego projektu remontu' : undefined}
            />
            {filter === 'all' && (
              <Button
                label="Utwórz pierwszy projekt"
                onPress={() => router.push('/wizard')}
                size="md"
              />
            )}
          </View>
        ) : (
          filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onPress={() => router.push({ pathname: '/project/[id]', params: { id: p.id } })}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', color: Colors.text },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 4 },
  filtersScroll: { marginBottom: 16 },
  filtersContainer: { paddingHorizontal: 20, gap: 8 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  list: { paddingHorizontal: 20 },
  emptyWrapper: { alignItems: 'center', gap: 16 },
});
