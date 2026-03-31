import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';

type Filter = 'all' | 'planning' | 'in-progress' | 'completed';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',        label: 'Wszystkie' },
  { id: 'planning',   label: 'Planowanie' },
  { id: 'in-progress', label: 'W trakcie' },
  { id: 'completed',  label: 'Ukończone' },
];

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { projects } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const projectWord = projects.length === 1 ? 'projekt' : 'projektów';

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 mb-4">
        <Txt w="bold" className="text-[26px] text-ink">Twoje projekty</Txt>
        <Txt className="text-[15px] text-slate mt-1">{projects.length} {projectWord}</Txt>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        className="mb-4"
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full border ${filter === f.id ? 'bg-primary border-primary' : 'bg-surface border-stroke'}`}
          >
            <Txt w="medium" className={`text-sm ${filter === f.id ? 'text-white' : 'text-slate'}`}>{f.label}</Txt>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <View className="px-5">
        {filtered.length === 0 ? (
          <View className="items-center gap-4">
            <EmptyState
              icon="folder"
              title={filter === 'all' ? 'Brak projektów' : 'Brak projektów w tej kategorii'}
              description={filter === 'all' ? 'Zacznij od nowego projektu remontu' : undefined}
            />
            {filter === 'all' && (
              <Button label="Utwórz pierwszy projekt" onPress={() => router.push('/wizard')} />
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
