import React from 'react';
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
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categories';
import { ProjectCard } from '@/components/ProjectCard';
import { CategoryCard } from '@/components/CategoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { projects } = useApp();

  const recentProjects = projects.slice(0, 3);
  const activeCount = projects.filter((p) => p.status === 'in-progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>Remont Asystent</Text>
          <Text style={styles.subGreeting}>Czym dziś się zajmiemy?</Text>
        </View>
        <TouchableOpacity
          style={styles.newProjectBtn}
          onPress={() => router.push('/wizard')}
          activeOpacity={0.8}
          testID="new-project-btn"
        >
          <Feather name="plus" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{projects.length}</Text>
          <Text style={styles.statLabel}>Projekty</Text>
        </View>
        <View style={[styles.statCard, styles.statCardOrange]}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>W trakcie</Text>
        </View>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <Text style={[styles.statNumber, { color: Colors.success }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Ukończone</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.quickStartBanner}
        onPress={() => router.push('/wizard')}
        activeOpacity={0.85}
        testID="quick-start-banner"
      >
        <View style={styles.quickStartLeft}>
          <Text style={styles.quickStartTitle}>Nowy projekt remontu</Text>
          <Text style={styles.quickStartSub}>Wybierz rodzaj pracy i zacznij</Text>
        </View>
        <View style={styles.quickStartIcon}>
          <Feather name="arrow-right" size={22} color={Colors.primary} />
        </View>
      </TouchableOpacity>

      <View style={styles.section}>
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

      <View style={styles.section}>
        <SectionHeader
          title="Rodzaje prac"
          actionLabel="Wszystkie"
          onAction={() => router.push('/(tabs)/explore')}
        />
        <View style={styles.categoriesGrid}>
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

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: { fontSize: 26, fontFamily: 'Inter_700Bold', color: Colors.text },
  subGreeting: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  newProjectBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statCardOrange: { borderColor: Colors.primaryLight },
  statCardGreen: { borderColor: '#bbf7d0' },
  statNumber: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  quickStartBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.primaryBg,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  quickStartLeft: { flex: 1 },
  quickStartTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.primaryDark },
  quickStartSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.primary, marginTop: 2 },
  quickStartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
