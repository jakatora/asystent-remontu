import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { pluralize } from '@/utils/format';

type Filter = 'all' | 'planning' | 'in-progress' | 'completed';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',         label: 'Wszystkie' },
  { id: 'planning',    label: 'Planowanie' },
  { id: 'in-progress', label: 'W trakcie' },
  { id: 'completed',   label: 'Ukończone' },
];

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { projects } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const projectWord = pluralize(projects.length, 'projekt', 'projekty', 'projektów');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Txt w="bold" style={{ fontSize: 26, color: Colors.text }}>Twoje projekty</Txt>
        <Txt style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 4 }}>
          {projects.length} {projectWord}
        </Txt>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        style={{ marginBottom: 16 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                backgroundColor: active ? Colors.primary : Colors.surface,
                borderColor: active ? Colors.primary : Colors.border,
              }}
              accessibilityLabel={`Filtruj: ${f.label}`}
              accessibilityState={{ selected: active }}
            >
              <Txt
                w="medium"
                style={{
                  fontSize: 14,
                  color: active ? '#fff' : Colors.textSecondary,
                }}
              >
                {f.label}
              </Txt>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 20 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="folder"
            title={filter === 'all' ? 'Brak projektów' : 'Brak projektów w tej kategorii'}
            description={filter === 'all' ? 'Zacznij od nowego projektu remontu' : undefined}
            actionLabel={filter === 'all' ? 'Utwórz pierwszy projekt' : undefined}
            onAction={filter === 'all' ? () => router.push('/wizard') : undefined}
          />
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
