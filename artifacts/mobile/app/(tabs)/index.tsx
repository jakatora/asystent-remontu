import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categories';
import { ProjectCard } from '@/components/ProjectCard';
import { CategoryCard } from '@/components/CategoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Txt } from '@/components/ui/Txt';
import type { ProjectActivity } from '@/types/domain';
import { Colors } from '@/constants/colors';

const ACTIVITY_ICONS: Record<string, string> = {
  created: 'plus-circle',
  status_changed: 'refresh-cw',
  checklist_completed: 'check-square',
  photo_added: 'camera',
  shopping_generated: 'shopping-cart',
  note_updated: 'edit-3',
  edited: 'edit',
};

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'teraz';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { projects, getRecentActivities } = useApp();
  const [recentActivities, setRecentActivities] = useState<ProjectActivity[]>([]);

  useFocusEffect(
    useCallback(() => {
      getRecentActivities(8).then(setRecentActivities);
    }, [getRecentActivities])
  );

  const recentProjects = projects.slice(0, 3);
  const activeCount = projects.filter((p) => p.status === 'in-progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const activeProject = projects.find((p) => p.status === 'in-progress');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row justify-between items-center px-5 mb-5">
        <View>
          <Txt w="bold" className="text-[26px] text-ink">Remont Asystent</Txt>
          <Txt className="text-[15px] text-slate mt-0.5">Czym dziś się zajmiemy?</Txt>
        </View>
        <TouchableOpacity
          className="w-[46px] h-[46px] rounded-full bg-primary items-center justify-center"
          onPress={() => router.push('/wizard')}
          activeOpacity={0.8}
          testID="new-project-btn"
          style={{ shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
        >
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2.5 px-5 mb-5">
        <View className="flex-1 bg-surface rounded-2xl p-3.5 border border-stroke items-center">
          <Txt w="bold" className="text-2xl text-ink">{projects.length}</Txt>
          <Txt className="text-[11px] text-muted text-center mt-0.5">Projekty</Txt>
        </View>
        <View className="flex-1 bg-surface rounded-2xl p-3.5 border border-primary-light items-center">
          <Txt w="bold" className="text-2xl text-primary">{activeCount}</Txt>
          <Txt className="text-[11px] text-muted text-center mt-0.5">W trakcie</Txt>
        </View>
        <View className="flex-1 bg-surface rounded-2xl p-3.5 items-center" style={{ borderWidth: 1, borderColor: '#bbf7d0' }}>
          <Txt w="bold" className="text-2xl text-success">{completedCount}</Txt>
          <Txt className="text-[11px] text-muted text-center mt-0.5">Ukończone</Txt>
        </View>
      </View>

      {activeProject && (
        <TouchableOpacity
          className="mx-5 mb-4 bg-surface rounded-2xl p-4 border flex-row items-center"
          style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}
          onPress={() => router.push({ pathname: '/project/[id]', params: { id: activeProject.id } })}
          activeOpacity={0.85}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#F59E0B',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Feather name="play" size={18} color="#fff" />
          </View>
          <View className="flex-1">
            <Txt w="bold" className="text-[15px]" style={{ color: '#92400E' }}>
              Kontynuuj: {activeProject.name}
            </Txt>
            <Txt className="text-[12px]" style={{ color: '#B45309' }}>
              {activeProject.jobName}
              {activeProject.roomName ? ` · ${activeProject.roomName}` : ''}
            </Txt>
          </View>
          <Feather name="chevron-right" size={20} color="#F59E0B" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className="mx-5 mb-6 bg-primary-bg rounded-2xl p-[18px] flex-row items-center border border-primary-light"
        onPress={() => router.push('/wizard')}
        activeOpacity={0.85}
        testID="quick-start-banner"
      >
        <View className="flex-1">
          <Txt w="bold" className="text-base text-primary-dark">Nowy projekt remontu</Txt>
          <Txt className="text-[13px] text-primary mt-0.5">Wybierz rodzaj pracy i zacznij</Txt>
        </View>
        <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
          <Feather name="arrow-right" size={22} color="#F97316" />
        </View>
      </TouchableOpacity>

      {recentActivities.length > 0 && (
        <View className="px-5 mb-6">
          <SectionHeader title="Ostatnia aktywność" />
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 12,
              gap: 10,
            }}
          >
            {recentActivities.map((a) => {
              const proj = projects.find((p) => p.id === a.projectId);
              return (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => proj && router.push({ pathname: '/project/[id]', params: { id: proj.id } })}
                  activeOpacity={0.8}
                  style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 2 }}
                >
                  <Feather
                    name={(ACTIVITY_ICONS[a.actionType] ?? 'circle') as any}
                    size={14}
                    color={Colors.textMuted}
                  />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontSize: 13, color: Colors.text }} numberOfLines={1}>
                      {a.description}
                    </Txt>
                    {proj && (
                      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{proj.name}</Txt>
                    )}
                  </View>
                  <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{timeAgo(a.createdAt)}</Txt>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View className="px-5 mb-6">
        <SectionHeader
          title="Twoje projekty"
          actionLabel={projects.length > 3 ? 'Wszystkie' : undefined}
          onAction={() => router.push('/(tabs)/projects')}
        />
        {recentProjects.length === 0 ? (
          <EmptyState icon="folder" title="Brak projektów" description="Naciśnij + aby dodać pierwszy projekt remontu" />
        ) : (
          recentProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onPress={() => router.push({ pathname: '/project/[id]', params: { id: p.id } })}
            />
          ))
        )}
      </View>

      <View className="px-5 mb-6">
        <SectionHeader
          title="Rodzaje prac"
          actionLabel="Wszystkie"
          onAction={() => router.push('/(tabs)/explore')}
        />
        <View className="flex-row flex-wrap gap-3">
          {CATEGORIES.slice(0, 6).map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => router.push({ pathname: '/category/[id]', params: { id: cat.id } })}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
