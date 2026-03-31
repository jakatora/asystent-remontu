import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { CATEGORIES } from '@/data/categories';
import { getJobsByCategory } from '@/data/jobs';
import { JobCard } from '@/components/JobCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const category = CATEGORIES.find((c) => c.id === id);
  const jobs = getJobsByCategory(id || '');

  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  if (!category) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Nie znaleziono kategorii</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: category.name,
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: category.color + '15' }]}>
          <View style={[styles.heroIcon, { backgroundColor: category.color + '25' }]}>
            <Feather name={category.icon as any} size={36} color={category.color} />
          </View>
          <Text style={styles.heroTitle}>{category.name}</Text>
          <Text style={styles.heroDesc}>{category.description}</Text>
          <View style={styles.jobCount}>
            <Text style={styles.jobCountText}>{jobs.length} {jobs.length === 1 ? 'rodzaj pracy' : 'rodzaje prac'}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {jobs.length === 0 ? (
            <EmptyState icon="tool" title="Brak dostępnych prac" description="Wkrótce dodamy więcej rodzajów prac." />
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  notFound: { fontSize: 16, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  heroDesc: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  jobCount: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  jobCountText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  content: { paddingHorizontal: 20, paddingTop: 16 },
});
