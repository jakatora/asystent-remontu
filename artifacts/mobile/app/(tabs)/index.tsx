import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categories';
import { ProjectCard } from '@/components/ProjectCard';
import { CategoryCard } from '@/components/CategoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Txt } from '@/components/ui/Txt';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { projects } = useApp();

  const recentProjects = projects.slice(0, 3);
  const activeCount = projects.filter((p) => p.status === 'in-progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
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

      {/* Stats */}
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

      {/* Quick start banner */}
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

      {/* Recent projects */}
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

      {/* Categories */}
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
