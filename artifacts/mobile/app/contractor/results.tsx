import React, { useEffect } from 'react';
import { View, FlatList, TextInput, Platform } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';
import { ContractorCard } from '@/components/contractor/ContractorCard';
import { FilterBar } from '@/components/contractor/FilterBar';
import { useContractor } from '@/context/ContractorContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ContractorResultsScreen() {
  const { categoryId, city, requestId, fromHouseBuild, stageKey, projectId } = useLocalSearchParams<{
    categoryId?: string;
    city?: string;
    requestId?: string;
    fromHouseBuild?: string;
    stageKey?: string;
    projectId?: string;
  }>();
  const isHouseBuild = fromHouseBuild === '1' && !!stageKey;
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const {
    promotedContractors,
    organicContractors,
    featuredContractors,
    filters,
    sortOption,
    searchQuery,
    setFilters,
    setSortOption,
    setSearchQuery,
    resetFilters,
    isContractorSaved,
    toggleSaveContractor,
  } = useContractor();

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  useEffect(() => {
    if (categoryId || city) {
      setFilters({
        ...filters,
        categoryId: categoryId || undefined,
        city: city || undefined,
        ...(stageKey ? { houseBuildStageKey: stageKey } : {}),
      });
    }
  }, []);

  const allResults = [...promotedContractors, ...featuredContractors, ...organicContractors];
  const totalCount = allResults.length;

  const renderItem = ({ item, index }: { item: (typeof allResults)[0]; index: number }) => {
    const promotedEnd = promotedContractors.length;
    const featuredEnd = promotedEnd + featuredContractors.length;
    const isFirstFeatured = featuredContractors.length > 0 && index === promotedEnd;
    const isFirstOrganic = organicContractors.length > 0 && index === featuredEnd && (promotedEnd > 0 || featuredContractors.length > 0);

    return (
      <>
        {isFirstFeatured && (
          <View style={{ paddingVertical: 6, marginBottom: 4 }}>
            <Txt w="semibold" style={{ fontSize: 11, color: '#D97706' }}>{t('contractor.results.featured')}</Txt>
          </View>
        )}
        {isFirstOrganic && (
          <View style={{ paddingVertical: 6, marginBottom: 4 }}>
            <Txt w="semibold" style={{ fontSize: 11, color: Colors.textMuted }}>{t('contractor.results.organic')}</Txt>
          </View>
        )}
        <ContractorCard
          contractor={item}
          onPress={() => router.push({
            pathname: '/contractor/[id]',
            params: {
              id: item.id,
              requestId,
              ...(isHouseBuild ? { fromHouseBuild: '1', stageKey, projectId } : {}),
            },
          })}
          onSendRequest={() =>
            router.push({
              pathname: '/contractor/send-request',
              params: { contractorId: item.id, requestId },
            })
          }
          isSaved={isContractorSaved(item.id)}
          onToggleSave={() => toggleSaveContractor(item.id)}
        />
      </>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('contractor.results.screenTitle'),
          headerBackTitle: t('contractor.results.headerBack'),
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <View
            style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: Colors.surface, borderRadius: 12,
              paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border,
            }}
          >
            <Feather name="search" size={18} color={Colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('contractor.results.searchPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              style={{
                flex: 1, paddingVertical: 12, paddingHorizontal: 8,
                fontSize: 14, color: Colors.text, fontFamily: 'Inter_400Regular',
              }}
            />
          </View>
        </View>

        {promotedContractors.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="star" size={10} color="#7C3AED" />
              <Txt style={{ fontSize: 10, color: '#7C3AED' }}>
                {t('contractor.results.promotedCount', { count: promotedContractors.length })}
              </Txt>
              <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
                {t('contractor.results.organicCount', { count: organicContractors.length + featuredContractors.length })}
              </Txt>
            </View>
          </View>
        )}

        <FilterBar
          filters={filters}
          sortOption={sortOption}
          onFiltersChange={setFilters}
          onSortChange={setSortOption}
          onReset={resetFilters}
          resultCount={totalCount}
        />

        <FlatList
          data={allResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title={t('contractor.results.emptyTitle')}
              description={t('contractor.results.emptyDescription')}
            />
          }
          renderItem={renderItem}
        />
      </View>
    </>
  );
}
