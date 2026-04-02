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
import { ACTIVITY_ICONS, timeAgoShort } from '@/utils/format';

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
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
        <View>
          <Txt w="bold" style={{ fontSize: 26, color: Colors.text }}>Remont Asystent</Txt>
          <Txt style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 2 }}>Czym dziś się zajmiemy?</Txt>
        </View>
        <TouchableOpacity
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadowPrimary,
          }}
          onPress={() => router.push('/wizard')}
          activeOpacity={0.8}
          testID="new-project-btn"
          accessibilityLabel="Nowy projekt"
          accessibilityRole="button"
        >
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 }}>
        <StatBadge value={projects.length} label="Projekty" color={Colors.text} borderColor={Colors.border} />
        <StatBadge value={activeCount} label="W trakcie" color={Colors.primary} borderColor={Colors.primaryLight} />
        <StatBadge value={completedCount} label="Ukończone" color={Colors.success} borderColor="#BBF7D0" />
      </View>

      {activeProject && (
        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            marginBottom: 16,
            backgroundColor: Colors.warningBg,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => router.push({ pathname: '/project/[id]', params: { id: activeProject.id } })}
          activeOpacity={0.85}
          accessibilityLabel={`Kontynuuj projekt ${activeProject.name}`}
          accessibilityRole="button"
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.warning,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Feather name="play" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Txt w="bold" style={{ fontSize: 15, color: '#92400E' }}>
              Kontynuuj: {activeProject.name}
            </Txt>
            <Txt style={{ fontSize: 12, color: '#B45309' }}>
              {activeProject.jobName}
              {activeProject.roomName ? ` · ${activeProject.roomName}` : ''}
            </Txt>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.warning} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={{
          marginHorizontal: 20,
          marginBottom: 24,
          backgroundColor: Colors.primaryBg,
          borderRadius: 16,
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: Colors.primaryLight,
        }}
        onPress={() => router.push('/wizard')}
        activeOpacity={0.85}
        testID="quick-start-banner"
        accessibilityLabel="Rozpocznij nowy projekt remontu"
        accessibilityRole="button"
      >
        <View style={{ flex: 1 }}>
          <Txt w="bold" style={{ fontSize: 16, color: Colors.primaryDark }}>Nowy projekt remontu</Txt>
          <Txt style={{ fontSize: 13, color: Colors.primary, marginTop: 2 }}>Wybierz rodzaj pracy i zacznij</Txt>
        </View>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-right" size={22} color={Colors.primary} />
        </View>
      </TouchableOpacity>

      {recentActivities.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
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
                  accessibilityLabel={`${a.description}${proj ? `, projekt ${proj.name}` : ''}`}
                >
                  <Feather
                    name={(ACTIVITY_ICONS[a.actionType as keyof typeof ACTIVITY_ICONS] ?? 'circle') as any}
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
                  <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{timeAgoShort(a.createdAt)}</Txt>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionHeader
          title="Twoje projekty"
          actionLabel={projects.length > 3 ? 'Wszystkie' : undefined}
          onAction={() => router.push('/(tabs)/projects')}
        />
        {recentProjects.length === 0 ? (
          <EmptyState
            icon="folder"
            title="Brak projektów"
            description="Naciśnij + aby dodać pierwszy projekt remontu"
          />
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

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => router.push('/contractor')}
          style={{
            flex: 1,
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            alignItems: 'center',
            gap: 8,
          }}
          activeOpacity={0.85}
          accessibilityLabel="Znajdź fachowca"
          accessibilityRole="button"
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: Colors.primaryBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="search" size={20} color={Colors.primary} />
          </View>
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, textAlign: 'center' }}>
            Znajdź fachowca
          </Txt>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/contractor/my-requests')}
          style={{
            flex: 1,
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            alignItems: 'center',
            gap: 8,
          }}
          activeOpacity={0.85}
          accessibilityLabel="Moje zapytania"
          accessibilityRole="button"
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: Colors.infoBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="file-text" size={20} color={Colors.info} />
          </View>
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, textAlign: 'center' }}>
            Moje zapytania
          </Txt>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/contractor/register')}
          style={{
            flex: 1,
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            alignItems: 'center',
            gap: 8,
          }}
          activeOpacity={0.85}
          accessibilityLabel="Dołącz jako fachowiec"
          accessibilityRole="button"
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: Colors.successBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="user-plus" size={20} color={Colors.success} />
          </View>
          <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, textAlign: 'center' }}>
            Jestem fachowcem
          </Txt>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#EFF6FF',
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}
          onPress={() => router.push('/house-build')}
          activeOpacity={0.85}
          testID="house-build-banner"
          accessibilityLabel="Budowa domu — asystent inwestora"
          accessibilityRole="button"
        >
          <View style={{ flex: 1 }}>
            <Txt w="bold" style={{ fontSize: 16, color: '#2563EB' }}>Budowa domu</Txt>
            <Txt style={{ fontSize: 13, color: '#3B82F6', marginTop: 2 }}>Asystent inwestora — od dzialki po odbiór</Txt>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="home" size={22} color="#2563EB" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionHeader
          title="Rodzaje prac"
          actionLabel="Wszystkie"
          onAction={() => router.push('/(tabs)/explore')}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
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

const shadowPrimary = {
  shadowColor: Colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,
};

function StatBadge({ value, label, color, borderColor }: { value: number; label: string; color: string; borderColor: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor,
      }}
      accessibilityLabel={`${value} ${label}`}
    >
      <Txt w="bold" style={{ fontSize: 22, color }}>{value}</Txt>
      <Txt style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 2 }}>{label}</Txt>
    </View>
  );
}
