import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '@/data/categories';
import { getJobsByCategory } from '@/data/jobs';
import { JobCard } from '@/components/JobCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Txt } from '@/components/ui/Txt';
import { useLanguage } from '@/context/LanguageContext';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const category = CATEGORIES.find((c) => c.id === id);
  const jobs = getJobsByCategory(id || '');
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  if (!category) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <Txt w="medium" className="text-base text-slate">{t('category.detail.notFound')}</Txt>
      </View>
    );
  }

  const jobWord = jobs.length === 1 ? t('category.detail.jobWordOne') : t('category.detail.jobWordMany');

  return (
    <>
      <Stack.Screen
        options={{
          title: category.name,
          headerBackTitle: t('category.detail.headerBack'),
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTintColor: '#0F172A',
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="items-center py-8 px-6 mb-2" style={{ backgroundColor: category.color + '15' }}>
          <View
            className="w-20 h-20 items-center justify-center mb-4"
            style={{ borderRadius: 24, backgroundColor: category.color + '25' }}
          >
            <Feather name={category.icon as any} size={36} color={category.color} />
          </View>
          <Txt w="bold" className="text-2xl text-ink mb-2 text-center">{category.name}</Txt>
          <Txt className="text-[15px] text-slate text-center mb-3">{category.description}</Txt>
          <View className="px-4 py-1.5 rounded-full bg-white">
            <Txt w="semibold" className="text-[13px] text-slate">{jobs.length} {jobWord}</Txt>
          </View>
        </View>

        <View className="px-5 pt-4">
          {jobs.length === 0 ? (
            <EmptyState icon="tool" title={t('category.detail.emptyTitle')} description={t('category.detail.emptyBody')} />
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
